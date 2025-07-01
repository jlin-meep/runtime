
import React from 'react';
import { Cloud, Sun, Wind } from 'lucide-react';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

interface WeatherCardProps {
  title: string;
  data: WeatherData;
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ title, data, className = "" }) => {
  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { level: "Low", color: "text-white" };
    if (uv <= 5) return { level: "Moderate", color: "text-white" };
    if (uv <= 7) return { level: "High", color: "text-white" };
    return { level: "Very High", color: "text-white" };
  };

  const uvInfo = getUVLevel(data.uvIndex);

  return (
    <div className={`bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sun className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Temperature</p>
            <p className="text-white font-semibold text-lg">{Math.round(data.temperature)}°F</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Wind className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Wind Speed</p>
            <p className="text-white font-semibold text-lg">{Math.round(data.windSpeed)} mph</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Cloud className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Cloud Coverage</p>
            <p className="text-white font-semibold text-lg">{Math.round(data.cloudCoverage)}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sun className="w-6 h-6 text-orange-300" />
          </div>
          <div>
            <p className="text-white/80 text-sm">UV Index</p>
            <p className={`font-semibold text-lg ${uvInfo.color}`}>{data.uvIndex} ({uvInfo.level})</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
