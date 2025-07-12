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
  const getCurrentPacificTime = () => {
    const now = new Date();
    const pacificTime = now.toLocaleTimeString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return pacificTime;
  };

  const getTimeAwareAdvice = () => {
    const now = new Date();
    const pacificHour = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"})).getHours();
    
    const tempDiff = data.temperature.current - data.temperature.previous;
    const windDiff = data.windSpeed.current - data.windSpeed.previous;
    const cloudDiff = data.cloudCoverage.current - data.cloudCoverage.previous;
    
    // Early morning (5 AM - 9 AM): Best time for running
    if (pacificHour >= 5 && pacificHour < 9) {
      if (tempDiff <= 0 && windDiff <= 2) {
        return "🌅 Perfect morning conditions - ideal time to run now!";
      } else if (tempDiff > 3) {
        return "🌅 Warmer morning than yesterday - still good time to start!";
      } else if (windDiff > 3) {
        return "💨 Windier morning than yesterday - check your route";
      } else {
        return "🌅 Good morning for running - conditions similar to yesterday";
      }
    }
    
    // Mid-morning (9 AM - 12 PM): Still good for running
    else if (pacificHour >= 9 && pacificHour < 12) {
      if (tempDiff > 5) {
        return "☀️ Getting warmer - earlier in your window may be better";
      } else if (windDiff > 3) {
        return "💨 Windier than yesterday - consider sheltered routes";
      } else if (cloudDiff < -20) {
        return "☀️ Sunnier than yesterday - don't forget sunscreen!";
      } else {
        return "🏃‍♂️ Still a good window for running";
      }
    }
    
    // Afternoon (12 PM - 5 PM): Getting warmer, less ideal
    else if (pacificHour >= 12 && pacificHour < 17) {
      if (tempDiff > 5) {
        return "🔥 Much warmer than yesterday - earlier times may be more comfortable";
      } else if (windDiff > 3) {
        return "💨 Windier afternoon - consider sheltered routes";
      } else if (cloudDiff < -20) {
        return "☀️ Sunnier than yesterday - consider sun protection";
      } else {
        return "🌤️ Morning hours typically offer calmer conditions";
      }
    }
    
    // Evening (5 PM - 8 PM): Potentially good again
    else if (pacificHour >= 17 && pacificHour < 20) {
      if (tempDiff <= 0 && windDiff <= 2) {
        return "🌆 Nice evening conditions - good time for a run!";
      } else if (tempDiff > 3) {
        return "🌆 Warmer evening than yesterday - earlier times may be better";
      } else if (windDiff > 3) {
        return "💨 Windier evening - check for calmer windows";
      } else {
        return "🌆 Decent evening for running";
      }
    }
    
    // Night (8 PM - 5 AM): Plan for tomorrow
    else {
      if (tempDiff > 5) {
        return "🌙 Today was warmer - plan for earlier times tomorrow";
      } else if (windDiff > 3) {
        return "🌙 Today was windier - morning conditions are usually calmer";
      } else if (cloudDiff < -20) {
        return "🌙 Today was sunnier - consider earlier times for less UV";
      } else {
        return "🌙 Plan ahead: Morning hours typically offer optimal conditions";
      }
    }
  };

  const renderComparison = (current: number, previous: number, unit: string, label: string) => {
    const diff = current - previous;
    const isIncrease = diff > 0;
    const absValue = Math.abs(diff);
    return <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
        <span className="text-white/90 text-sm">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold">{current}{unit}</span>
          {diff !== 0 && <div className={`flex items-center space-x-1 ${isIncrease ? 'text-red-200' : 'text-emerald-200'}`}>
              {isIncrease ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span className="text-xs">{absValue.toFixed(1)}{unit}</span>
            </div>}
        </div>
      </div>;
  };

  return <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Today vs Yesterday At {getCurrentPacificTime()}</h3>
      
      <div className="space-y-3">
        {renderComparison(data.temperature.current, data.temperature.previous, "°F", "Temperature")}
        {renderComparison(data.windSpeed.current, data.windSpeed.previous, " mph", "Wind Speed")}
        {renderComparison(data.cloudCoverage.current, data.cloudCoverage.previous, "%", "Cloud Coverage")}
        {renderComparison(data.uvIndex.current, data.uvIndex.previous, "", "UV Index")}
      </div>
      
      <div className="mt-4 p-3">
        <p className="text-white/80 text-sm text-center">
          {getTimeAwareAdvice()}
        </p>
      </div>
    </div>;
};

export default ComparisonCard;
