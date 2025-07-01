
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationSelectorProps {
  onLocationChange?: (coordinates: [number, number], address?: string) => void;
  initialLocation?: [number, number];
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onLocationChange, 
  initialLocation = [-122.4364, 37.7751] 
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(initialLocation);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiamVubmlmZXIybGluIiwiYSI6ImNtY2p1N2FvbzA3d2gybnE0enk3YXQ3eWkifQ.yyfPBUCT2nP7ZRbHGVowBg';

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
    if (!mapContainer.current || !mapboxToken) {
      console.log('❌ Missing requirements:', { 
        container: !!mapContainer.current, 
        token: !!mapboxToken 
      });
      return;
    }

    console.log('🗺️ Initializing map with token:', mapboxToken.substring(0, 20) + '...');
    
    // Set the access token
    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: currentLocation,
        zoom: 14,
        attributionControl: false
      });

      console.log('✅ Map instance created');

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

      console.log('📍 Marker added');

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

      // Map events for debugging
      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        setMapError(null);
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setMapError('Map failed to load. Please check your internet connection.');
      });

    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      console.log('🧹 Cleaning up map');
      map.current?.remove();
    };
  }, [mapboxToken, currentLocation]);

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
        setAddressInput(''); // Clear the input after successful search
        
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

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-yellow-300" />
        Set Your Running Location
      </h3>
      
      {mapError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-white text-sm">⚠️ {mapError}</p>
        </div>
      )}
      
      {/* Location Controls */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter address or zip code..."
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
            className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70"
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
      <div className="text-white text-sm space-y-1">
        <p className="text-center flex items-center justify-center gap-1">
          <MapPin className="w-4 h-4 text-red-400" />
          Click anywhere on the map or drag the pin to set your location
        </p>
        <p className="text-center text-white/70 text-xs">
          Weather data will be sourced from the nearest available station
        </p>
      </div>
    </div>
  );
};

export default LocationSelector;
