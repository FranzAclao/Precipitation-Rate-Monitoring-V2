import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const offlineIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEFAULT_POS = [8.2327, 124.2596];

export default function Map({ nodes = [], node1, node2, heightClass = "h-[500px]" }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({});

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return undefined;

    mapInstance.current = L.map(mapRef.current).setView(DEFAULT_POS, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapInstance.current);

    return () => {
      Object.values(markers.current).forEach((marker) => marker.remove());
      markers.current = {};
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    const updateMarker = (id, data, label) => {
      if (!data || !mapInstance.current) return;

      const parsedLat = data.lat === undefined || data.lat === null ? NaN : parseFloat(data.lat);
      const parsedLng = data.lng === undefined || data.lng === null ? NaN : parseFloat(data.lng);

      const lat = Number.isFinite(parsedLat) && parsedLat !== 0 ? parsedLat : DEFAULT_POS[0];
      const lng = Number.isFinite(parsedLng) && parsedLng !== 0 ? parsedLng : DEFAULT_POS[1];

      const isOffline = data.status === 'offline';
      const currentIcon = isOffline ? offlineIcon : activeIcon;
      const statusText = isOffline
        ? "<span style='color: #ef4444; font-weight: bold;'>OFFLINE</span>"
        : "<span style='color: #10b981; font-weight: bold;'>ACTIVE</span>";

      const lastSeenHtml = (isOffline && data.timestamp)
        ? `<div style="margin-top: 4px; font-size: 11px; color: #64748b;">
             Last Seen: <span style="font-family: monospace;">${data.timestamp}</span>
           </div>`
        : "";

      if (!markers.current[id]) {
        markers.current[id] = L.marker([lat, lng], { icon: currentIcon }).addTo(mapInstance.current);
      } else {
        markers.current[id].setLatLng([lat, lng]);
        markers.current[id].setIcon(currentIcon);
      }

      markers.current[id].bindPopup(`
        <div style="font-family: sans-serif; min-width: 140px;">
          <b style="font-size: 14px; color: #1e293b;">${label}</b><br/>
          <div style="margin-top: 4px;">Status: ${statusText}</div>
          ${lastSeenHtml}
          <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <small style="color: #94a3b8;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>
          </div>
        </div>
      `);
    };

    const markerInputs = (Array.isArray(nodes) && nodes.length > 0)
      ? nodes.map((n) => ({
          id: String(n.id ?? n.key ?? ''),
          data: n,
          label: n.displayName || n.name || n.label || `Sensor ${n.id ?? n.key ?? ''}`
        })).filter((n) => n.id)
      : [
          { id: 'node1', data: node1, label: 'Sensor Node 1' },
          { id: 'node2', data: node2, label: 'Sensor Node 2' },
        ];

    const activeIds = new Set();
    for (const input of markerInputs) {
      activeIds.add(input.id);
      updateMarker(input.id, input.data, input.label);
    }

    for (const existingId of Object.keys(markers.current)) {
      if (!activeIds.has(existingId)) {
        markers.current[existingId].remove();
        delete markers.current[existingId];
      }
    }
  }, [nodes, node1, node2]);

  return (
    <div className="app-card overflow-hidden p-0">
      <div className="flex justify-between items-center border-b border-slate-300 px-4 py-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Field Map: Del Carmen
        </h3>
        <div className="flex gap-4 text-[10px] font-bold uppercase">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500"></span> Offline
          </span>
        </div>
      </div>
      <div ref={mapRef} className={`${heightClass} w-full z-0`} />
    </div>
  );
}
