
import React from 'react';
import { Sun, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';
import { WeatherData } from '../../utils/weatherTypes';
import { useIsMobile } from '../../hooks/use-mobile';

interface BestTimeRecommendationProps {
  bestTime: {
    time: string;
    originalTime: string;
    isNow: boolean;
    reason: string;
    conditions: WeatherData;
    contextualInsight?: string;
  };
  runDuration: number;
}

const BestTimeRecommendation: React.FC<BestTimeRecommendationProps> = ({
  bestTime,
  runDuration
}) => {
  const isMobile = useIsMobile();

  const contentInfo = (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-800">
        Wind conditions have the highest impact on your running score, followed by temperature comfort.
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
        <div>Wind (40%)</div>
        <div>Temperature (30%)</div>
        <div>UV (20%)</div>
        <div>Clouds (10%)</div>
      </div>
    </div>
  );

  return (
    <div className="text-center py-4 md:py-6">
      <div className="text-4xl md:text-6xl font-bold text-white mb-2">
        {bestTime.isNow ? `Now (${bestTime.originalTime})` : bestTime.time}
      </div>
      <p className="text-white/90 text-base md:text-lg mb-2 px-2">
        {bestTime.contextualInsight || bestTime.reason}
      </p>
      <p className="text-white/70 text-sm mb-4 px-2">
        {bestTime.isNow ? 
          `Perfect time to start your ${runDuration === 0.5 ? '30-minute' : `${runDuration}-hour`} run right now!` :
          `Perfect start time for your ${runDuration === 0.5 ? '30-minute' : `${runDuration}-hour`} run`
        }
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-sm mb-4 items-center">
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
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-white">
              <Info className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className={`bg-white/95 backdrop-blur-sm border border-white/30 p-4 ${
              isMobile 
                ? 'w-[calc(100vw-2rem)] max-w-[320px]' 
                : 'w-80'
            }`}
            align="end"
            side="top"
            sideOffset={8}
            avoidCollisions={true}
          >
            {contentInfo}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default BestTimeRecommendation;
