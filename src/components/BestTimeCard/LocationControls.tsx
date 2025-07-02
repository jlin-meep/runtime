
import React, { useState } from 'react';
import { Navigation, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { SecurityUtils } from '../../utils/securityUtils';
import Logger from '../../utils/logger';

interface LocationControlsProps {
  onLocationUpdate: (coordinates: [number, number], address?: string) => void;
  onError: (error: string) => void;
  onClearError: () => void;
}

const LocationControls: React.FC<LocationControlsProps> = ({
  onLocationUpdate,
  onError,
  onClearError
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(false);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiamVubmlmZXIybGluIiwiYSI6ImNtY2p1N2FvbzA3d2gybnE0enk3YXQ3eWkifQ.yyfPBUCT2nP7ZRbHGVowBg';

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    onClearError();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
        onLocationUpdate(newCoords);
        setLoading(false);
        Logger.success('Location updated via GPS');
      },
      (error) => {
        Logger.error('GPS location error', error);
        onError(SecurityUtils.sanitizeErrorMessage(error.message));
        setLoading(false);
      }
    );
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = SecurityUtils.sanitizeAddressInput(e.target.value);
    setAddressInput(sanitizedInput);
    onClearError();

    if (e.target.value !== sanitizedInput) {
      onError('Some characters were removed for security. Please use standard address format.');
    }
  };

  const searchAddress = async () => {
    const sanitizedInput = SecurityUtils.sanitizeAddressInput(addressInput.trim());
    
    if (!sanitizedInput || sanitizedInput.length < 2) {
      onError('Please enter a valid address (at least 2 characters).');
      return;
    }

    if (!mapboxToken) {
      onError('Address search is currently unavailable.');
      return;
    }

    setLoading(true);
    onClearError();

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(sanitizedInput)}.json?access_token=${mapboxToken}&country=US&limit=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const newCoords: [number, number] = [lng, lat];
        const placeName = SecurityUtils.sanitizeAddressInput(data.features[0].place_name);
        
        onLocationUpdate(newCoords, placeName);
        setAddressInput('');
        Logger.success('Location updated via search');
      } else {
        onError('Address not found. Please try a different search term.');
      }
    } catch (error) {
      Logger.error('Address search error', error);
      onError(SecurityUtils.sanitizeErrorMessage(error instanceof Error ? error.message : 'Search failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 mb-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter address or zip code..."
          value={addressInput}
          onChange={handleAddressInputChange}
          onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
          className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70"
          maxLength={200}
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
  );
};

export default LocationControls;
