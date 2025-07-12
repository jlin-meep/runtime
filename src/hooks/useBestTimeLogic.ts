
import { useMemo } from 'react';
import { TimeSlot, WeatherData } from '../utils/weatherTypes';
import { formatTimeWithMinutes } from '../utils/timeUtils';

interface UseBestTimeLogicProps {
  hourlyData: TimeSlot[];
  timeWindow: number[];
  runDuration: number;
  currentWeather?: WeatherData;
}

export const useBestTimeLogic = ({ 
  hourlyData, 
  timeWindow, 
  runDuration, 
  currentWeather 
}: UseBestTimeLogicProps) => {
  // Generate half-hour time slots only when needed
  const halfHourlyData = useMemo(() => {
    console.log('🕐 Generating time slots from hourly data:', hourlyData.length, 'slots');
    const slots: TimeSlot[] = [];
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    hourlyData.forEach(slot => {
      // Always add the hour slot (XX:00)
      slots.push({
        ...slot,
        minute: 0,
        time: formatTimeWithMinutes(slot.hour, 0)
      });
      
      // Only add half-hour slot if:
      // 1. We're currently within this hour, OR
      // 2. This is needed to fulfill a 30-minute run duration before window ends
      const isCurrentHour = slot.hour === currentHour;
      const isLastPossibleSlot = slot.hour === timeWindow[1] - 1 && runDuration === 0.5;
      
      if (isCurrentHour || isLastPossibleSlot) {
        slots.push({
          ...slot,
          minute: 30,
          time: formatTimeWithMinutes(slot.hour, 30)
        });
      }
    });
    
    const sortedSlots = slots.sort((a, b) => a.hour === b.hour ? (a.minute || 0) - (b.minute || 0) : a.hour - b.hour);
    
    // Log detailed scoring for debugging
    sortedSlots.forEach(slot => {
      console.log(`📊 ${slot.time}: Score ${slot.score} | Wind: ${slot.windSpeed}mph | Temp: ${slot.temperature}°F | Breakdown:`, slot.scoreBreakdown);
    });
    
    return sortedSlots;
  }, [hourlyData, timeWindow, runDuration]);

  const bestTimeInWindow = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    console.log('🔍 Current time:', `${currentHour}:${currentMinute.toString().padStart(2, '0')} (${currentTotalMinutes} minutes)`);
    console.log('🎯 Time window:', timeWindow, 'Run duration:', runDuration, 'hours');
    
    // Adjust start time to be at least the current time if we're looking at today
    const adjustedStartHour = Math.max(timeWindow[0], currentHour);
    const adjustedStartMinutes = adjustedStartHour * 60;
    
    // Adjust end time based on run duration to ensure we can complete the run
    const adjustedEndHour = timeWindow[1] - runDuration;
    const adjustedEndMinutes = adjustedEndHour * 60;
    
    console.log('⏰ Adjusted window:', {
      startHour: adjustedStartHour,
      endHour: adjustedEndHour,
      startMinutes: adjustedStartMinutes,
      endMinutes: adjustedEndMinutes,
      currentMinutes: currentTotalMinutes
    });

    // Filter data to only include times within the adjusted window and after current time
    const filteredData = halfHourlyData.filter(slot => {
      const slotTotalMinutes = slot.hour * 60 + (slot.minute || 0);
      const isAfterCurrent = slotTotalMinutes >= currentTotalMinutes;
      const isInWindow = slotTotalMinutes >= adjustedStartMinutes && slotTotalMinutes <= adjustedEndMinutes;
      
      console.log(`📊 Slot ${slot.time} (${slotTotalMinutes}min):`, {
        afterCurrent: isAfterCurrent,
        inWindow: isInWindow,
        passes: isAfterCurrent && isInWindow,
        score: slot.score.toFixed(1)
      });
      
      return isAfterCurrent && isInWindow;
    });

    console.log('🎛️ Filtered data:', filteredData.length, 'slots remaining');
    
    if (filteredData.length === 0) {
      console.log('❌ No filtered data available - checking if any slots exist in time window without current time constraint');
      
      // Check what would be available without the current time constraint
      const windowOnlyFilter = halfHourlyData.filter(slot => {
        const slotTotalMinutes = slot.hour * 60 + (slot.minute || 0);
        return slotTotalMinutes >= timeWindow[0] * 60 && slotTotalMinutes <= (timeWindow[1] - runDuration) * 60;
      });
      
      console.log('🔍 Slots in window (ignoring current time):', windowOnlyFilter.length, windowOnlyFilter.map(s => s.time));
      
      return null;
    }

    // Find the best time based on score
    const bestTime = filteredData.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    console.log('🎯 Best time analysis:', {
      time: bestTime.time,
      score: bestTime.score.toFixed(1),
      conditions: {
        temp: Math.round(bestTime.temperature),
        wind: Math.round(bestTime.windSpeed),
        clouds: Math.round(bestTime.cloudCoverage),
        uv: bestTime.uvIndex
      },
      scoreBreakdown: bestTime.scoreBreakdown,
      currentWeather: currentWeather ? 'available' : 'not available'
    });

    const getContextualInsight = (slot: TimeSlot, currentWeather?: WeatherData): string => {
      // Check if the suggested time is "now" (within 30 minutes of current time)
      const bestTimeTotalMinutes = slot.hour * 60 + (slot.minute || 0);
      const isNow = Math.abs(bestTimeTotalMinutes - currentTotalMinutes) <= 30;
      
      if (isNow) {
        // Check if conditions are actually perfect (wind <= 10 mph AND temp >= 62°F)
        const isWindy = slot.windSpeed > 10;
        const isChilly = slot.temperature < 62;
        
        if (isWindy && isChilly) {
          return "It's a bit windy and chilly, but the best conditions available today";
        } else if (isWindy) {
          return "It's pretty windy today, but now it's the least windy time to go";
        } else if (isChilly) {
          return "It's a little chilly, but the warmest time with lowest winds today";
        } else {
          return "Perfect conditions right now - go for it!";
        }
      }
      
      // Compare suggested time vs current conditions
      if (!currentWeather) {
        return `Best available with ${Math.round(slot.windSpeed)} mph winds`;
      }
      
      const tempDiff = slot.temperature - currentWeather.temperature;
      const windDiff = slot.windSpeed - currentWeather.windSpeed;
      const uvDiff = slot.uvIndex - currentWeather.uvIndex;
      const cloudDiff = slot.cloudCoverage - currentWeather.cloudCoverage;
      
      // Determine the most significant changes
      const positiveChanges: string[] = [];
      const negativeChanges: string[] = [];
      
      // Wind is the most important factor (40% weight) - lower is always better
      if (windDiff < -2) {
        positiveChanges.push(`winds will calm from ${Math.round(currentWeather.windSpeed)} to ${Math.round(slot.windSpeed)} mph`);
      } else if (windDiff > 2) {
        negativeChanges.push(`windier conditions (${Math.round(slot.windSpeed)} mph vs current ${Math.round(currentWeather.windSpeed)} mph)`);
      }
      
      // Temperature comfort (30% weight) - prefer temperatures closer to ideal 65-70°F
      const currentTempScore = Math.abs(currentWeather.temperature - 67.5);
      const futureTempScore = Math.abs(slot.temperature - 67.5);
      
      if (futureTempScore < currentTempScore - 3) {
        // Future temperature is significantly closer to ideal
        if (slot.temperature > currentWeather.temperature) {
          positiveChanges.push(`warmer ${Math.round(slot.temperature)}°F (closer to ideal)`);
        } else {
          positiveChanges.push(`cooler ${Math.round(slot.temperature)}°F (closer to ideal)`);
        }
      } else if (currentTempScore < futureTempScore - 3) {
        // Current temperature is significantly better
        if (slot.temperature < currentWeather.temperature) {
          negativeChanges.push(`cooler ${Math.round(slot.temperature)}°F (further from ideal)`);
        } else {
          negativeChanges.push(`warmer ${Math.round(slot.temperature)}°F (further from ideal)`);
        }
      }
      
      // UV considerations (20% weight)
      if (uvDiff < -2) {
        positiveChanges.push(`lower UV index (${slot.uvIndex} vs current ${currentWeather.uvIndex})`);
      } else if (uvDiff > 2) {
        negativeChanges.push(`higher UV (${slot.uvIndex} vs current ${currentWeather.uvIndex})`);
      }
      
      // Cloud coverage (10% weight) - less important but still relevant
      if (cloudDiff > 20) {
        positiveChanges.push("more cloud cover for shade");
      } else if (cloudDiff < -20) {
        positiveChanges.push("clearer skies");
      }
      
      // Prioritize positive changes, but acknowledge negative ones
      if (positiveChanges.length > 0) {
        return `Better conditions: ${positiveChanges[0]}`;
      } else if (negativeChanges.length > 0) {
        return `Best available option: ${negativeChanges[0]}`;
      } else {
        return `Similar conditions with ${Math.round(slot.windSpeed)} mph winds`;
      }
    };

    // Check if the suggested time is "now" (within 30 minutes of current time)
    const bestTimeTotalMinutes = bestTime.hour * 60 + (bestTime.minute || 0);
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
      reason: `${Math.round(conditions.temperature)}°F with ${Math.round(conditions.windSpeed)} mph winds`,
      contextualInsight: getContextualInsight(bestTime, currentWeather),
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

  return bestTimeInWindow;
};
