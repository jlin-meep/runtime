
import React from 'react';
import { Sun } from 'lucide-react';
import { WeatherData } from '../../utils/weatherTypes';
import ScoreBreakdown from './ScoreBreakdown';

interface BestTimeRecommendationProps {
  bestTime: {
    time: string;
    originalTime: string;
    isNow: boolean;
    reason: string;
    conditions: WeatherData;
    scoreBreakdown?: {
      windScore: number;
      uvScore: number;
      tempScore: number;
      cloudScore: number;
      currentTimeBonus: number;
      total: number;
    };
  };
  runDuration: number;
  showScoreDetails: boolean;
}

const BestTimeRecommendation: React.FC<BestTimeRecommendationProps> = ({
  bestTime,
  runDuration,
  showScoreDetails
}) => {
  return (
    <div className="text-center py-4 md:py-6">
      <div className="text-4xl md:text-6xl font-bold text-white mb-2">
        {bestTime.time}
        {bestTime.isNow && (
          <div className="text-base md:text-lg font-normal text-yellow-300 mt-1">
            ({bestTime.originalTime})
          </div>
        )}
      </div>
      <p className="text-white/90 text-base md:text-lg mb-2 px-2">{bestTime.reason}</p>
      <p className="text-white/70 text-sm mb-4 px-2">
        {bestTime.isNow ? 
          `Perfect time to start your ${runDuration === 0.5 ? '30-minute' : `${runDuration}-hour`} run right now!` :
          `Perfect start time for your ${runDuration === 0.5 ? '30-minute' : `${runDuration}-hour`} run`
        }
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-sm mb-4">
        <div className="flex items-center space-x-1">
          <Sun className="w-4 h-4 text-yellow-300" />
          <span className="text-white/80">{Math.round(bestTime.conditions.temperature)}°F</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-white/80">💨 {Math.round(bestTime.conditions.windSpeed)} mph</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-white/80">☁️ {Math.round(bestTime.conditions.cloudCoverage)}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-white/80">UV {bestTime.conditions.uvIndex}</span>
        </div>
      </div>

      {/* Score Breakdown */}
      {showScoreDetails && bestTime.scoreBreakdown && (
        <ScoreBreakdown scoreBreakdown={bestTime.scoreBreakdown} />
      )}
    </div>
  );
};

export default BestTimeRecommendation;
