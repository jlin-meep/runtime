
import React from 'react';
import { Clock, Sun } from 'lucide-react';

interface BestTimeCardProps {
  bestTime: string;
  reason: string;
  conditions: {
    temperature: number;
    windSpeed: number;
    cloudCoverage: number;
    uvIndex: number;
  };
}

const BestTimeCard: React.FC<BestTimeCardProps> = ({ bestTime, reason, conditions }) => {
  return (
    <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Clock className="w-8 h-8 text-yellow-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Best Time to Run</h2>
          <p className="text-white/80">NOPA, San Francisco</p>
        </div>
      </div>
      
      <div className="text-center py-6">
        <div className="text-6xl font-bold text-white mb-2">{bestTime}</div>
        <p className="text-white/90 text-lg mb-4">{reason}</p>
        
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <Sun className="w-4 h-4 text-yellow-300" />
            <span className="text-white/80">{conditions.temperature}°F</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/80">💨 {conditions.windSpeed} mph</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/80">☁️ {conditions.cloudCoverage}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/80">UV {conditions.uvIndex}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestTimeCard;
