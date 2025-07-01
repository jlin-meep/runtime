
import React, { useState, useMemo } from 'react';
import { Clock, Sun } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

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

  const bestTimeInWindow = useMemo(() => {
    // Filter data to only include times within the selected window
    const filteredData = hourlyData.filter(slot => 
      slot.hour >= timeWindow[0] && slot.hour <= timeWindow[1]
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
  }, [hourlyData, timeWindow]);

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
          <p>No data available for selected time window</p>
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
            <h2 className="text-2xl font-bold text-white">Best Time to Run</h2>
            <p className="text-white/80">NOPA, San Francisco</p>
          </div>
        </div>

        {/* Compact Time Window Slider */}
        <div className="w-64 p-3 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-white font-semibold text-sm mb-3">Running Window</h3>
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
      
      <div className="text-center py-6">
        <div className="text-6xl font-bold text-white mb-2">{bestTimeInWindow.time}</div>
        <p className="text-white/90 text-lg mb-4">{bestTimeInWindow.reason}</p>
        
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
