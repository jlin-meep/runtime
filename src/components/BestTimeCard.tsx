
import React, { useState, useMemo } from 'react';
import { Clock, Info } from 'lucide-react';
import { TimeSlot, WeatherData } from '../utils/weatherTypes';
import { formatTimeWithMinutes } from '../utils/timeUtils';
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
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  // Generate half-hour time slots from hourly data
  const halfHourlyData = useMemo(() => {
    const slots: TimeSlot[] = [];
    
    hourlyData.forEach(slot => {
      // Add the hour slot (XX:00)
      slots.push({
        ...slot,
        minute: 0,
        time: formatTimeWithMinutes(slot.hour, 0)
      });
      
      // Add the half-hour slot (XX:30) with slightly varied conditions
      slots.push({
        ...slot,
        minute: 30,
        time: formatTimeWithMinutes(slot.hour, 30),
        // Slightly vary the score for half-hour slots
        score: slot.score + (Math.random() - 0.5) * 0.1,
        temperature: slot.temperature + (Math.random() - 0.5) * 2,
        windSpeed: Math.max(0, slot.windSpeed + (Math.random() - 0.5) * 1),
        cloudCoverage: Math.max(0, Math.min(100, slot.cloudCoverage + (Math.random() - 0.5) * 10))
      });
    });
    
    return slots.sort((a, b) => a.hour === b.hour ? a.minute! - b.minute! : a.hour - b.hour);
  }, [hourlyData]);

  const bestTimeInWindow = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Adjust start time to be at least the current time if we're looking at today
    const adjustedStartHour = Math.max(timeWindow[0], currentHour);
    
    // Adjust end time based on run duration to ensure we can complete the run
    const adjustedEndHour = timeWindow[1] - runDuration;
    
    // Filter data to only include times within the adjusted window and after current time
    const filteredData = halfHourlyData.filter(slot => {
      const slotTotalMinutes = slot.hour * 60 + (slot.minute || 0);
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const windowStartMinutes = adjustedStartHour * 60;
      const windowEndMinutes = adjustedEndHour * 60;
      
      return slotTotalMinutes >= Math.max(windowStartMinutes, currentTotalMinutes) && 
             slotTotalMinutes <= windowEndMinutes;
    });

    if (filteredData.length === 0) {
      return null;
    }

    // Find the best time based on score
    const bestTime = filteredData.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    console.log('🎯 Best time analysis:', {
      time: bestTime.time,
      score: bestTime.score,
      conditions: {
        temp: bestTime.temperature,
        wind: bestTime.windSpeed,
        clouds: bestTime.cloudCoverage,
        uv: bestTime.uvIndex
      },
      scoreBreakdown: bestTime.scoreBreakdown,
      currentWeather: currentWeather
    });

    const getDetailedReason = (slot: TimeSlot, conditions: WeatherData): string => {
      const temp = Math.round(conditions.temperature);
      
      let reason = `${temp}°F with ${Math.round(conditions.windSpeed)} mph winds`;
      
      // UV analysis
      if (conditions.uvIndex <= 2) {
        reason += ` and low UV exposure`;
      } else if (conditions.uvIndex <= 5) {
        reason += ` and moderate UV levels`;
      } else if (conditions.uvIndex > 7) {
        reason += ` but high UV exposure (UV ${conditions.uvIndex})`;
      }
      
      // Compare with current conditions if available
      if (currentWeather && slot.hour !== currentHour) {
        if (conditions.windSpeed < currentWeather.windSpeed - 3) {
          reason += ` - winds will calm down from current ${currentWeather.windSpeed} mph`;
        } else if (conditions.windSpeed > currentWeather.windSpeed + 3) {
          reason += ` - winds will pick up from current ${currentWeather.windSpeed} mph`;
        }
        
        if (conditions.uvIndex < currentWeather.uvIndex - 1) {
          reason += ` with lower UV than now (${currentWeather.uvIndex})`;
        } else if (conditions.uvIndex > currentWeather.uvIndex + 2) {
          reason += ` with higher UV than now (${currentWeather.uvIndex})`;
        }
      }
      
      return reason;
    };

    // Check if the suggested time is "now" (within 30 minutes of current time)
    const bestTimeTotalMinutes = bestTime.hour * 60 + (bestTime.minute || 0);
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const isNow = Math.abs(bestTimeTotalMinutes - currentTotalMinutes) <= 30;
    
    const displayTime = isNow ? "Now" : bestTime.time;

    // Use current weather data if the suggested time is "Now", otherwise use forecast data
    const conditions = isNow && currentWeather ? currentWeather : {
      temperature: bestTime.temperature,
      windSpeed: bestTime.windSpeed,
      cloudCoverage: bestTime.cloudCoverage,
      uvIndex: bestTime.uvIndex
    };

    return {
      time: displayTime,
      originalTime: bestTime.time,
      isNow,
      reason: getDetailedReason(bestTime, conditions),
      conditions,
      scoreBreakdown: bestTime.scoreBreakdown,
      allFilteredOptions: filteredData.map(slot => ({
        time: slot.time,
        score: slot.score,
        scoreBreakdown: slot.scoreBreakdown,
        conditions: {
          temperature: slot.temperature,
          windSpeed: slot.windSpeed,
          cloudCoverage: slot.cloudCoverage,
          uvIndex: slot.uvIndex
        }
      }))
    };
  }, [halfHourlyData, timeWindow, runDuration, currentWeather]);

  return (
    <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-3xl p-4 md:p-8 border border-white/30 shadow-2xl">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 mb-6">
        {/* Title and Location */}
        <div className="flex items-center space-x-3">
          <div className="p-2 md:p-3 bg-white/20 rounded-xl">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white">Best Time to Start Running</h2>
            <p className="text-white/80 text-sm md:text-base">{locationName}</p>
          </div>
          <button
            onClick={() => setShowScoreDetails(!showScoreDetails)}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Show scoring details"
          >
            <Info className="w-4 h-4 text-white" />
          </button>
        </div>

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
          showScoreDetails={showScoreDetails}
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
