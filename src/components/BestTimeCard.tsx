
import React, { useState } from 'react';
import { TimeSlot, WeatherData } from '../utils/weatherTypes';
import { useBestTimeLogic } from '../hooks/useBestTimeLogic';
import { calculateForecastRange } from '../utils/forecastUtils';
import BestTimeHeader from './BestTimeCard/BestTimeHeader';
import TimeWindowControls from './BestTimeCard/TimeWindowControls';
import BestTimeRecommendation from './BestTimeCard/BestTimeRecommendation';
import LocationSelector from './BestTimeCard/LocationSelector';

interface BestTimeCardProps {
  hourlyData: TimeSlot[];
  locationName?: string;
  currentWeather?: WeatherData;
  onLocationChange?: (coordinates: [number, number], address?: string) => void;
  initialLocation?: [number, number];
  onTimeWindowChange?: (timeWindow: number[]) => void;
}

const BestTimeCard: React.FC<BestTimeCardProps> = ({ 
  hourlyData, 
  locationName = 'Your Location',
  currentWeather,
  onLocationChange,
  initialLocation,
  onTimeWindowChange
}) => {
  const [timeWindow, setTimeWindow] = useState([9, 20]); // 9 AM to 8 PM
  const [runDuration, setRunDuration] = useState(1); // Default: 1 hour
  const [isLocationSectionOpen, setIsLocationSectionOpen] = useState(false);

  // Notify parent component when time window changes
  const handleTimeWindowChange = (newTimeWindow: number[]) => {
    setTimeWindow(newTimeWindow);
    onTimeWindowChange?.(newTimeWindow);
  };

  const bestTimeInWindow = useBestTimeLogic({
    hourlyData,
    timeWindow,
    runDuration,
    currentWeather
  });

  // Calculate forecast range for the time window to pass to WeatherCard
  const forecastRange = calculateForecastRange(hourlyData, timeWindow);

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-3xl p-4 md:p-8 border border-white/20 shadow-2xl">
      {/* Header Section with Collapsible Location Selector */}
      <div className="flex flex-col space-y-4 mb-6">
        <BestTimeHeader 
          locationName={locationName}
          isLocationSectionOpen={isLocationSectionOpen}
          onToggleLocationSection={() => setIsLocationSectionOpen(!isLocationSectionOpen)}
        >
          <LocationSelector 
            onLocationChange={onLocationChange}
            initialLocation={initialLocation}
          />
        </BestTimeHeader>

        {/* Controls - Side by side on all screen sizes */}
        <TimeWindowControls
          timeWindow={timeWindow}
          setTimeWindow={handleTimeWindowChange}
          runDuration={runDuration}
          setRunDuration={setRunDuration}
        />
      </div>
      
      {bestTimeInWindow ? (
        <BestTimeRecommendation
          bestTime={bestTimeInWindow}
          runDuration={runDuration}
        />
      ) : (
        <div className="text-center py-4 md:py-6">
          <div className="text-white/90 text-base md:text-lg mb-2 px-2">
            No suitable times available in your selected window for today
          </div>
          <p className="text-white/70 text-sm px-2">
            Try adjusting your time window or run duration above
          </p>
        </div>
      )}
    </div>
  );
};

export default BestTimeCard;
