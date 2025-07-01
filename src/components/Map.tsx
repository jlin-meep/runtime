
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface MapProps {
  mapboxToken?: string;
  onLocationChange?: (coordinates: [number, number], address?: string) => void;
  initialLocation?: [number, number];
}

const Map: React.FC<MapProps> = ({ mapboxToken, onLocationChange, initialLocation = [-122.4364, 37.7751] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(initialLocation);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Update current location when initialLocation prop changes
  useEffect(() => {
    if (initialLocation && (initialLocation[0] !== currentLocation[0] || initialLocation[1] !== currentLocation[1])) {
      setCurrentLocation(initialLocation);
      if (map.current && marker.current) {
        marker.current.setLngLat(initialLocation);
        map.current.setCenter(initialLocation);
      }
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    console.log('🗺️ Initializing interactive map...');

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: currentLocation,
      zoom: 14,
    });

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

    // Handle marker drag
    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        const newCoords: [number, number] = [lngLat.lng, lngLat.lat];
        setCurrentLocation(newCoords);
        onLocationChange?.(newCoords);
        console.log('📍 Location updated via drag:', newCoords);
      }
    });

    // Handle map clicks
    map.current.on('click', (e) => {
      const newCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setCurrentLocation(newCoords);
      marker.current?.setLngLat(newCoords);
      onLocationChange?.(newCoords);
      console.log('📍 Location updated via click:', newCoords);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ];
        setCurrentLocation(newCoords);
        map.current?.flyTo({ center: newCoords, zoom: 14 });
        marker.current?.setLngLat(newCoords);
        onLocationChange?.(newCoords);
        setLoading(false);
        console.log('📍 Location updated via GPS:', newCoords);
      },
      (error) => {
        console.error('GPS location error:', error);
        alert('Unable to retrieve your location. Please try entering an address instead.');
        setLoading(false);
      }
    );
  };

  const searchAddress = async () => {
    if (!addressInput.trim() || !mapboxToken) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressInput)}.json?access_token=${mapboxToken}&country=US&limit=1`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const newCoords: [number, number] = [lng, lat];
        const placeName = data.features[0].place_name;
        
        setCurrentLocation(newCoords);
        map.current?.flyTo({ center: newCoords, zoom: 14 });
        marker.current?.setLngLat(newCoords);
        onLocationChange?.(newCoords, placeName);
        
        console.log('📍 Location updated via search:', newCoords, placeName);
      } else {
        alert('Address not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Address search error:', error);
      alert('Error searching for address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mapboxToken) {
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Set Your Running Location</h3>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/90 text-sm mb-3">
            To display the interactive map, please enter your Mapbox public token:
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
      <h3 className="text-xl font-semibold text-white mb-4">Set Your Running Location</h3>
      
      {/* Location Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter address or zip code..."
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
            className="flex-1 bg-white/20 border-white/30 text-white placeholder-white/60"
          />
          <Button 
            onClick={searchAddress} 
            disabled={loading || !addressInput.trim()}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          onClick={getCurrentLocation} 
          disabled={loading}
          className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {loading ? 'Getting location...' : 'Use Current Location'}
        </Button>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-64 rounded-lg shadow-lg mb-3" />
      
      {/* Instructions */}
      <div className="text-white/80 text-sm space-y-1">
        <p className="text-center flex items-center justify-center gap-1">
          <MapPin className="w-4 h-4 text-red-400" />
          Click anywhere on the map or drag the pin to set your location
        </p>
        <p className="text-center text-white/60 text-xs">
          Weather data will be sourced from the nearest available station
        </p>
      </div>
    </div>
  );
};

export default Map;
