
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { SecurityUtils } from '../../utils/securityUtils';
import Logger from '../../utils/logger';
import LocationControls from './LocationControls';
import LocationMap from './LocationMap';

interface LocationSelectorProps {
  onLocationChange?: (coordinates: [number, number], address?: string) => void;
  initialLocation?: [number, number];
  onClose?: () => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationChange,
  initialLocation = [-122.4364, 37.7751],
  onClose
}) => {
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(initialLocation);
  const [mapError, setMapError] = useState<string | null>(null);

  // Update current location when initialLocation prop changes
  useEffect(() => {
    if (initialLocation && (initialLocation[0] !== currentLocation[0] || initialLocation[1] !== currentLocation[1])) {
      setCurrentLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleLocationUpdate = (coordinates: [number, number], address?: string) => {
    if (!SecurityUtils.validateCoordinates(coordinates)) {
      setMapError('Invalid location coordinates received.');
      return;
    }

    setCurrentLocation(coordinates);
    onLocationChange?.(coordinates, address);
    Logger.success('Location updated');
  };

  const handleError = (error: string) => {
    setMapError(error);
  };

  const clearError = () => {
    setMapError(null);
  };

  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 relative">
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors z-10"
        >
          <span className="w-4 h-4 text-white">×</span>
        </button>
      )}
      
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center pr-8">
        <MapPin className="w-5 h-5 mr-2 text-yellow-300" />
        Set Your Running Location
      </h3>
      
      {mapError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-white text-sm">⚠️ {mapError}</p>
        </div>
      )}
      
      <LocationControls
        onLocationUpdate={handleLocationUpdate}
        onError={handleError}
        onClearError={clearError}
      />

      <LocationMap
        currentLocation={currentLocation}
        onLocationUpdate={handleLocationUpdate}
        onError={handleError}
      />
      
      <div className="text-white text-sm space-y-1">
        <p className="text-center flex items-center justify-center gap-1">
          <MapPin className="w-4 h-4 text-white-400" />
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
