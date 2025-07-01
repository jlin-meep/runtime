import React, { useState, useMemo } from 'react';
import { Clock, Sun, Timer } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeSlot {
  time: string;
  hour: number;
  score: number;
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

interface BestTimeCardProps {
  hourlyData: TimeSlot[];
}

const BestTimeCard: React.FC<BestTimeCardProps> = ({ hourlyData }) => {
  const [timeWindow, setTimeWindow] = useState([6, 20]); // Default: 6 AM to 8 PM
  const [runDuration, setRunDuration] = useState(1); // Default: 1 hour

  const bestTimeInWindow = useMemo(() => {
    // Adjust end time based on run duration to ensure we can complete the run
    const adjustedEndHour = timeWindow[1] - runDuration;
    
    // Filter data to only include times within the adjusted window
    const filteredData = hourlyData.filter(slot => 
      slot.hour >= timeWindow[0] && slot.hour <= adjustedEndHour
    );

    if (filteredData.length === 0) {
      return null;
    }

    // Find the best time based on score
    const bestTime = filteredData.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    const getReason = (slot: TimeSlot): string => {
      if (slot.hour < 12) {
        return "Cool morning temps with low UV and gentle breeze";
      } else {
        return "Perfect evening conditions with cooling temperatures";
      }
    };

    return {
      time: bestTime.time,
      reason: getReason(bestTime),
      conditions: {
        temperature: bestTime.temperature,
        windSpeed: bestTime.windSpeed,
        cloudCoverage: bestTime.cloudCoverage,
        uvIndex: bestTime.uvIndex
      }
    };
  }, [hourlyData, timeWindow, runDuration]);

  const formatTime = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  if (!bestTimeInWindow) {
    return (
      <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="text-center text-white">
          <p>No data available for selected time window and run duration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Clock className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Best Time to Start Running</h2>
            <p className="text-white/80">NOPA, San Francisco</p>
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
            <div className="relative mb-6">
              <Slider
                value={timeWindow}
                onValueChange={setTimeWindow}
                max={23}
                min={0}
                step={1}
                className="w-full"
              />
              {/* Time labels positioned under each handle */}
              <div className="absolute -bottom-6 left-0 right-0">
                <div 
                  className="absolute text-white/80 text-xs whitespace-nowrap"
                  style={{ 
                    left: `${(timeWindow[0] / 23) * 100}%`, 
                    transform: 'translateX(-50%)' 
                  }}
                >
                  {formatTime(timeWindow[0])}
                </div>
                <div 
                  className="absolute text-white/80 text-xs whitespace-nowrap"
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
      
      <div className="text-center py-6">
        <div className="text-6xl font-bold text-white mb-2">{bestTimeInWindow.time}</div>
        <p className="text-white/90 text-lg mb-2">{bestTimeInWindow.reason}</p>
        <p className="text-white/70 text-sm mb-4">
          Perfect start time for your {runDuration === 0.5 ? '30-minute' : `${runDuration}-hour`} run
        </p>
        
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <Sun className="w-4 h-4 text-yellow-300" />
            <span className="text-white/80">{bestTimeInWindow.conditions.temperature}°F</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/80">💨 {bestTimeInWindow.conditions.windSpeed} mph</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/80">☁️ {bestTimeInWindow.conditions.cloudCoverage}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/80">UV {bestTimeInWindow.conditions.uvIndex}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestTimeCard;
