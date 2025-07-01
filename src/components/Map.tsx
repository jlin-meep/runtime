
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getWeatherStations, WeatherStation } from '../utils/weatherService';

interface MapProps {
  mapboxToken?: string;
}

const Map: React.FC<MapProps> = ({ mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stations, setStations] = useState<WeatherStation[]>([]);
  const [loading, setLoading] = useState(true);

  // NOPA neighborhood coordinates
  const nopaCoordinates: [number, number] = [-122.4364, 37.7751];

  useEffect(() => {
    // Fetch weather stations
    const loadStations = async () => {
      try {
        console.log('🔄 Starting to load weather stations...');
        const stationData = await getWeatherStations();
        console.log('✅ Loaded weather stations:', stationData.length, 'stations');
        console.log('Station details:', stationData);
        setStations(stationData);
      } catch (error) {
        console.error('❌ Failed to load weather stations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      console.log('⚠️ Map container or token not available');
      return;
    }

    console.log('🗺️ Initializing map with', stations.length, 'stations');

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: nopaCoordinates,
      zoom: 12,
    });

    // Add a marker for NOPA location (reference point)
    const nopaMarker = new mapboxgl.Marker({ color: '#ff6b6b' })
      .setLngLat(nopaCoordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<div><strong>NOPA Area</strong><br/>Your running location</div>')
      )
      .addTo(map.current);

    console.log('📍 Added NOPA marker');

    // Add weather station markers
    console.log('📍 Adding', stations.length, 'weather station markers');
    stations.forEach((station, index) => {
      console.log(`Adding station ${index + 1}:`, station.name, station.coordinates, station.isActive ? 'Active' : 'Inactive');
      
      const markerColor = station.isActive ? '#22c55e' : '#64748b'; // Green for active, gray for inactive
      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat(station.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <strong>${station.name}</strong><br/>
                <span style="color: ${station.isActive ? '#22c55e' : '#64748b'}">
                  ${station.isActive ? '🟢 Active' : '🔴 Inactive'}
                </span><br/>
                <small>Station ID: ${station.id}</small>
              </div>
            `)
        )
        .addTo(map.current);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, stations]);

  if (!mapboxToken) {
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Weather Data Source Locations</h3>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/90 text-sm mb-3">
            To display the map showing real weather station locations, please enter your Mapbox public token:
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
      <h3 className="text-xl font-semibold text-white mb-4">Real Weather Station Locations</h3>
      <div ref={mapContainer} className="w-full h-64 rounded-lg shadow-lg" />
      <div className="mt-3 text-white/80 text-sm space-y-1">
        <p className="text-center">📍 Red pin: Your NOPA running area</p>
        <div className="flex justify-center space-x-4 text-xs">
          <span>🟢 Active stations ({stations.filter(s => s.isActive).length})</span>
          <span>🔴 Inactive stations ({stations.filter(s => !s.isActive).length})</span>
        </div>
        {loading && <p className="text-center text-white/60">Loading weather stations...</p>}
        {!loading && stations.length === 0 && (
          <p className="text-center text-white/60">No weather stations found</p>
        )}
      </div>
    </div>
  );
};

export default Map;
