
import React, { useState, useMemo } from 'react';
import { Clock, Sun, Timer } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  score: number;
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

interface WeatherData {
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

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

  // Helper functions moved above useMemo hooks
  const formatTime = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const formatTimeWithMinutes = (hour: number, minute: number) => {
    if (minute === 0) {
      return formatTime(hour);
    } else {
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }
  };

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
    
    return slots.sort((a, b) => a.hour === b.hour ? a.minute - b.minute : a.hour - b.hour);
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
      const slotTotalMinutes = slot.hour * 60 + slot.minute;
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

    const getReason = (slot: TimeSlot): string => {
      if (slot.hour < 10) {
        return "Cool early morning temps with low UV and gentle breeze";
      } else if (slot.hour < 12) {
        return "Pleasant morning conditions with comfortable temperatures";
      } else if (slot.hour < 15) {
        return "Midday conditions with moderate temperatures";
      } else if (slot.hour < 18) {
        return "Afternoon conditions with warm temperatures";
      } else {
        return "Perfect evening conditions with cooling temperatures";
      }
    };

    // Check if the suggested time is "now" (within 30 minutes of current time)
    const bestTimeTotalMinutes = bestTime.hour * 60 + bestTime.minute;
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
      reason: getReason(bestTime),
      conditions
    };
  }, [halfHourlyData, timeWindow, runDuration, currentWeather]);

  return (
    <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Clock className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Best Time to Start Running</h2>
            <p className="text-white/80">{locationName}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          {/* Run Duration Selector */}
          <div className="p-3 bg-white/10 rounded-xl border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Timer className="w-4 h-4 text-white" />
              <h3 className="text-white font-semibold text-sm">Run Duration</h3>
            </div>
            <Select value={runDuration.toString()} onValueChange={(value) => setRunDuration(parseFloat(value))}>
              <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">30 min</SelectItem>
                <SelectItem value="1">1 hr</SelectItem>
                <SelectItem value="1.5">1.5 hr</SelectItem>
                <SelectItem value="2">2 hr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Window Slider */}
          <div className="w-64 p-3 bg-white/10 rounded-xl border border-white/20">
            <h3 className="text-white font-semibold text-sm mb-3">Available Window</h3>
            <div className="relative mb-4">
              <Slider
                value={timeWindow}
                onValueChange={setTimeWindow}
                max={23}
                min={0}
                step={1}
                className="w-full"
              />
              {/* Time labels positioned under each handle */}
              <div className="absolute -bottom-2 left-0 right-0">
                <div 
                  className="absolute text-white text-xs whitespace-nowrap"
                  style={{ 
                    left: `${(timeWindow[0] / 23) * 100}%`, 
                    transform: 'translateX(-50%)' 
                  }}
                >
                  {formatTime(timeWindow[0])}
                </div>
                <div 
                  className="absolute text-white text-xs whitespace-nowrap"
                  style={{ 
                    left: `${(timeWindow[1] / 23) * 100}%`, 
                    transform: 'translateX(-50%)' 
                  }}
                >
                  {formatTime(timeWindow[1])}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {bestTimeInWindow ? (
        <div className="text-center py-6">
          <div className="text-6xl font-bold text-white mb-2">
            {bestTimeInWindow.time}
            {bestTimeInWindow.isNow && (
              <div className="text-lg font-normal text-yellow-300 mt-1">
                ({bestTimeInWindow.originalTime})
              </div>
            )}
          </div>
          <p className="text-white/90 text-lg mb-2">{bestTimeInWindow.reason}</p>
          <p className="text-white/70 text-sm mb-4">
            {bestTimeInWindow.isNow ? 
              `Perfect time to start your ${runDuration === 0.5 ? '30-minute' : `${runDuration}-hour`} run right now!` :
              `Perfect start time for your ${runDuration === 0.5 ? '30-minute' : `${runDuration}-hour`} run`
            }
          </p>
          
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <Sun className="w-4 h-4 text-yellow-300" />
              <span className="text-white/80">{Math.round(bestTimeInWindow.conditions.temperature)}°F</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-white/80">💨 {Math.round(bestTimeInWindow.conditions.windSpeed)} mph</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-white/80">☁️ {Math.round(bestTimeInWindow.conditions.cloudCoverage)}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-white/80">UV {bestTimeInWindow.conditions.uvIndex}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-white/90 text-lg mb-2">
            No suitable times available in your selected window for today
          </div>
          <p className="text-white/70 text-sm">
            Try adjusting your time window or run duration above
          </p>
        </div>
      )}
    </div>
  );
};

export default BestTimeCard;
