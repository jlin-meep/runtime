
import React, { useState } from 'react';
import { TimeSlot, WeatherData } from '../utils/weatherTypes';
import { useBestTimeLogic } from '../hooks/useBestTimeLogic';
import BestTimeHeader from './BestTimeCard/BestTimeHeader';
import TimeWindowControls from './BestTimeCard/TimeWindowControls';
import BestTimeRecommendation from './BestTimeCard/BestTimeRecommendation';

interface BestTimeCardProps {
  hourlyData: TimeSlot[];
  locationName?: string;
  currentWeather?: WeatherData;
}

const BestTimeCard: React.FC<BestTimeCardProps> = ({ 
  hourlyData, 
  locationName = 'Your Location',
  currentWeather 
}) => {
  const [timeWindow, setTimeWindow] = useState([9, 20]); // 9 AM to 8 PM
  const [runDuration, setRunDuration] = useState(1); // Default: 1 hour

  const bestTimeInWindow = useBestTimeLogic({
    hourlyData,
    timeWindow,
    runDuration,
    currentWeather
  });

  return (
    <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-3xl p-4 md:p-8 border border-white/30 shadow-2xl">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 mb-6">
        {/* Title and Location */}
        <BestTimeHeader locationName={locationName} />

        {/* Controls */}
        <TimeWindowControls
          timeWindow={timeWindow}
          setTimeWindow={setTimeWindow}
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
