import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- FIX: LEAFLET DEFAULT ICON BUG IN VITE/REACT ---
// This ensures markers actually show up on the map
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;
// ---------------------------------------------------

export default function Map({ node1, node2 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({});

  // Default Del Carmen Center (from v1)
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

      // Handle GPS fallback: use default if sensor reports 0,0
      const lat = data.lat && parseFloat(data.lat) !== 0 ? data.lat : defaultPos[0];
      const lng = data.lng && parseFloat(data.lng) !== 0 ? data.lng : defaultPos[1];

      const isOffline = data.status === 'offline';
      const statusText = isOffline ? 
        "<span style='color: #ef4444; font-weight: bold;'>OFFLINE</span>" : 
        "<span style='color: #10b981; font-weight: bold;'>ACTIVE</span>";

      if (!markers.current[id]) {
        // Create marker if it doesn't exist
        markers.current[id] = L.marker([lat, lng]).addTo(mapInstance.current);
      } else {
        // Move marker if it already exists
        markers.current[id].setLatLng([lat, lng]);
      }

      // Update the popup content dynamically
      markers.current[id].bindPopup(`
        <div style="font-family: sans-serif;">
          <b style="font-size: 14px;">${label}</b><br/>
          Status: ${statusText}<br/>
          <small>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>
        </div>
      `);
    };

    // 3. Trigger updates for both nodes
    updateMarker('node1', node1, 'Sensor Node 1');
    updateMarker('node2', node2, 'Sensor Node 2');

    // 4. CLEANUP: This is critical for React
    // Prevents "Map container is already initialized" errors
    return () => {
      /* We keep the instance alive but we could destroy it if needed:
         mapInstance.current?.remove(); 
         mapInstance.current = null; 
      */
    };
  }, [node1, node2]); // Map re-runs markers logic when sensor data changes

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
      {/* The actual map container */}
      <div ref={mapRef} className="h-[500px] w-full z-0" />
    </div>
  );
}