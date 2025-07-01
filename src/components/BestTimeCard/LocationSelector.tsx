
import React, { useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

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

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiamVubmlmZXIybGluIiwiYSI6ImNtY2p1N2FvbzA3d2gybnE0enk3YXQ3eWkifQ.yyfPBUCT2nP7ZRbHGVowBg';

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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-yellow-300" />
        Set Your Running Location
      </h3>
      
      {/* Location Controls */}
      <div className="space-y-3">
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

      <p className="text-white/70 text-xs text-center mt-3">
        Weather data will be sourced from the nearest available station
      </p>
    </div>
  );
};

export default LocationSelector;
