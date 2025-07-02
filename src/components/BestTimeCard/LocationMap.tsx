
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Logger from '../../utils/logger';

interface LocationMapProps {
  currentLocation: [number, number];
  onLocationUpdate: (coordinates: [number, number]) => void;
  onError: (error: string) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({
  currentLocation,
  onLocationUpdate,
  onError
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiamVubmlmZXIybGluIiwiYSI6ImNtY2p1N2FvbzA3d2gybnE0enk3YXQ3eWkifQ.yyfPBUCT2nP7ZRbHGVowBg';

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      Logger.debug('Missing map requirements');
      return;
    }

    Logger.debug('Initializing map');
    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: currentLocation,
        zoom: 14,
        attributionControl: false
      });

      Logger.success('Map instance created');

      // Add initial marker
      marker.current = new mapboxgl.Marker({
        color: '#ef4444',
        draggable: true
      })
        .setLngLat(currentLocation)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<div><strong>🏃‍♂️ Your Running Location</strong><br/>Drag to adjust or use the controls below</div>')
        )
        .addTo(map.current);

      Logger.success('📍 Marker added');

      // Handle marker drag
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          const newCoords: [number, number] = [lngLat.lng, lngLat.lat];
          onLocationUpdate(newCoords);
          Logger.success('📍 Location updated via drag:', newCoords);
        }
      });

      // Handle map clicks
      map.current.on('click', (e) => {
        const newCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        marker.current?.setLngLat(newCoords);
        onLocationUpdate(newCoords);
        Logger.success('📍 Location updated via click:', newCoords);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Map events
      map.current.on('load', () => {
        Logger.success('Map loaded successfully');
      });

      map.current.on('error', (e) => {
        Logger.error('Map error occurred', e);
        onError('Map failed to load. Please check your internet connection.');
      });
    } catch (error) {
      Logger.error('Error initializing map', error);
      onError('Failed to initialize map');
    }

    return () => {
      Logger.debug('Cleaning up map');
      map.current?.remove();
    };
  }, [mapboxToken, currentLocation, onLocationUpdate]);

  // Update marker position when currentLocation changes
  useEffect(() => {
    if (map.current && marker.current) {
      marker.current.setLngLat(currentLocation);
      map.current.setCenter(currentLocation);
    }
  }, [currentLocation]);

  return <div ref={mapContainer} className="w-full h-64 rounded-lg shadow-lg mb-3" />;
};

export default LocationMap;
