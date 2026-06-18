import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon path issues with custom HTML/CSS glowing markers
const createHtmlIcon = (color: string, label: string) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-6 h-6 rounded-full bg-${color}-500/30 animate-ping"></div>
        <div class="w-3.5 h-3.5 rounded-full bg-${color}-500 border border-white shadow-lg"></div>
        <div class="absolute -top-5 bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-white whitespace-nowrap shadow-md">
          ${label}
        </div>
      </div>
    `,
    className: 'custom-gps-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to dynamically fit maps views to path bounds
function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && (bounds as any).length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

interface MapProps {
  destinations: Array<{
    name: string;
    lat: number;
    lng: number;
    attractions: string[];
    temp?: string;
  }>;
}

export default function TripMap({ destinations }: MapProps) {
  // If no locations, show fallback center
  if (!destinations || destinations.length === 0) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-gray-500 rounded-2xl">
        <span>Awaiting Route Coordinates...</span>
      </div>
    );
  }

  // Parse points
  const points = destinations
    .filter(d => typeof d.lat === 'number' && typeof d.lng === 'number')
    .map(d => new L.LatLng(d.lat, d.lng));

  const bounds = L.latLngBounds(points);
  const linePositions = points.map(p => [p.lat, p.lng] as [number, number]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden min-h-[300px] border border-white/5 shadow-2xl">
      <MapContainer 
        bounds={bounds}
        zoom={5} 
        style={{ width: '100%', height: '100%', zIndex: 10 }}
        zoomControl={true}
      >
        {/* Dark Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Dynamic fit bound view helper */}
        {points.length > 0 && <ChangeView bounds={linePositions} />}

        {/* Polylines connector */}
        {points.length > 1 && (
          <Polyline 
            positions={linePositions} 
            color="#6366f1" 
            weight={4} 
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        {/* Map Markers */}
        {destinations.map((dest, index) => {
          if (typeof dest.lat !== 'number' || typeof dest.lng !== 'number') return null;
          
          const isStart = index === 0;
          const isEnd = index === destinations.length - 1;
          const pinColor = isStart ? 'emerald' : isEnd ? 'red' : 'indigo';
          const label = isStart ? 'Start' : isEnd ? 'End' : `Stop ${index}`;

          return (
            <Marker 
              key={index} 
              position={[dest.lat, dest.lng]}
              icon={createHtmlIcon(pinColor, dest.name)}
            >
              <Popup>
                <div className="p-1 text-xs text-gray-800">
                  <h4 className="font-bold text-sm text-indigo-900">{dest.name}</h4>
                  {dest.temp && <p className="text-gray-600 mt-0.5">Temp: <strong>{dest.temp}</strong></p>}
                  {dest.attractions && dest.attractions.length > 0 && (
                    <div className="mt-1.5 border-t pt-1 border-gray-100">
                      <span className="font-semibold block text-[10px] text-gray-500 uppercase">Top Attractions:</span>
                      <ul className="list-disc pl-3.5 space-y-0.5 mt-0.5">
                        {dest.attractions.slice(0, 3).map((a, i) => (
                          <li key={i} className="text-[10px] text-gray-700">{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
