import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
interface ComparisonData {
  temperature: {
    current: number;
    previous: number;
  };
  windSpeed: {
    current: number;
    previous: number;
  };
  cloudCoverage: {
    current: number;
    previous: number;
  };
  uvIndex: {
    current: number;
    previous: number;
  };
}
interface ComparisonCardProps {
  data: ComparisonData;
}
const ComparisonCard: React.FC<ComparisonCardProps> = ({
  data
}) => {
  const renderComparison = (current: number, previous: number, unit: string, label: string) => {
    const diff = current - previous;
    const isIncrease = diff > 0;
    const absValue = Math.abs(diff);
    return <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
        <span className="text-white/90 text-sm">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold">{current}{unit}</span>
          {diff !== 0 && <div className={`flex items-center space-x-1 ${isIncrease ? 'text-red-300' : 'text-green-300'}`}>
              {isIncrease ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span className="text-xs">{absValue.toFixed(1)}{unit}</span>
            </div>}
        </div>
      </div>;
  };
  return <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Today vs Yesterday At X</h3>
      
      <div className="space-y-3">
        {renderComparison(data.temperature.current, data.temperature.previous, "°F", "Temperature")}
        {renderComparison(data.windSpeed.current, data.windSpeed.previous, " mph", "Wind Speed")}
        {renderComparison(data.cloudCoverage.current, data.cloudCoverage.previous, "%", "Cloud Coverage")}
        {renderComparison(data.uvIndex.current, data.uvIndex.previous, "", "UV Index")}
      </div>
      
      <div className="mt-4 p-3 bg-white/10 rounded-lg">
        <p className="text-white/80 text-sm text-center">
          {data.temperature.current > data.temperature.previous + 5 ? "🔥 Warmer day - consider earlier morning run" : data.windSpeed.current > data.windSpeed.previous + 3 ? "💨 Windier conditions - check your route" : data.cloudCoverage.current < data.cloudCoverage.previous - 20 ? "☀️ Clearer skies - great for running!" : "🏃‍♂️ Good conditions for your run"}
        </p>
      </div>
    </div>;
};
export default ComparisonCard;