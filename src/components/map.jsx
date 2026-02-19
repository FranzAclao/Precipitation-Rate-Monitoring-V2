import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- CUSTOM ICONS (Blue = Active, Red = Offline) ---
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
// ---------------------------------------------------

export default function Map({ node1, node2 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({});

  // Default Del Carmen Center
  const defaultPos = [8.2327, 124.2596];

  useEffect(() => {
    // 1. Initialize Map instance only once
    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = L.map(mapRef.current).setView(defaultPos, 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(mapInstance.current);
    }

    // 2. Marker Update Logic
    const updateMarker = (id, data, label) => {
      if (!data || !mapInstance.current) return;

      const lat = data.lat && parseFloat(data.lat) !== 0 ? data.lat : defaultPos[0];
      const lng = data.lng && parseFloat(data.lng) !== 0 ? data.lng : defaultPos[1];

      const isOffline = data.status === 'offline';
      const currentIcon = isOffline ? offlineIcon : activeIcon; // Pick the color
      
      const statusText = isOffline ? 
        "<span style='color: #ef4444; font-weight: bold;'>OFFLINE</span>" : 
        "<span style='color: #10b981; font-weight: bold;'>ACTIVE</span>";

      // Build Last Seen row if offline
      const lastSeenHtml = (isOffline && data.timestamp) 
        ? `<div style="margin-top: 4px; font-size: 11px; color: #64748b;">
             Last Seen: <span style="font-family: monospace;">${data.timestamp}</span>
           </div>` 
        : "";

      if (!markers.current[id]) {
        // Create marker with the correct icon
        markers.current[id] = L.marker([lat, lng], { icon: currentIcon }).addTo(mapInstance.current);
      } else {
        // Move marker AND update its color dynamically
        markers.current[id].setLatLng([lat, lng]);
        markers.current[id].setIcon(currentIcon); 
      }

      // Update the popup content dynamically
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

    // 3. Trigger updates for both nodes
    updateMarker('node1', node1, 'Sensor Node 1');
    updateMarker('node2', node2, 'Sensor Node 2');

  }, [node1, node2]); 

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Geospatial Status: Del Carmen
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
      <div ref={mapRef} className="h-[500px] w-full z-0" />
    </div>
  );
}