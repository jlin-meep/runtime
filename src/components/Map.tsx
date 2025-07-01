
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  mapboxToken?: string;
}

const Map: React.FC<MapProps> = ({ mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Correct NOPA neighborhood coordinates (center of NOPA area)
  const nopaCoordinates: [number, number] = [-122.4364, 37.7751]; // Proper NOPA location

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: nopaCoordinates,
      zoom: 15,
    });

    // Add a marker for NOPA location
    const marker = new mapboxgl.Marker({ color: '#ff6b6b' })
      .setLngLat(nopaCoordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<div><strong>NOPA Weather Station</strong><br/>Weather data source location</div>')
      )
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Weather Data Location</h3>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/90 text-sm mb-3">
            To display the map showing weather data source location, please enter your Mapbox public token:
          </p>
          <input
            type="text"
            placeholder="Enter Mapbox public token..."
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const token = (e.target as HTMLInputElement).value;
                if (token) {
                  localStorage.setItem('mapbox_token', token);
                  window.location.reload();
                }
              }
            }}
          />
          <p className="text-white/70 text-xs mt-2">
            Get your free token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a> • Press Enter to save
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Weather Data Source Location</h3>
      <div ref={mapContainer} className="w-full h-64 rounded-lg shadow-lg" />
      <p className="text-white/80 text-sm mt-3 text-center">
        📍 Current weather data is sourced from NOPA, San Francisco
      </p>
    </div>
  );
};

export default Map;
