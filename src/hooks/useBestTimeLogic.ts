
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
    
    return slots.sort((a, b) => a.hour === b.hour ? a.minute! - b.minute! : a.hour - b.hour);
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
      const slotTotalMinutes = slot.hour * 60 + (slot.minute || 0);
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

    console.log('🎯 Best time analysis:', {
      time: bestTime.time,
      score: bestTime.score,
      conditions: {
        temp: bestTime.temperature,
        wind: bestTime.windSpeed,
        clouds: bestTime.cloudCoverage,
        uv: bestTime.uvIndex
      },
      scoreBreakdown: bestTime.scoreBreakdown,
      currentWeather: currentWeather
    });

    const getContextualInsight = (slot: TimeSlot, allSlots: TimeSlot[]): string => {
      const temp = Math.round(slot.temperature);
      
      // Get all available hourly data for the day (not just the window)
      const allDaySlots = halfHourlyData.filter(s => s.hour >= 6 && s.hour <= 22);
      const laterSlots = allDaySlots.filter(s => s.hour > slot.hour);
      const earlierSlots = allDaySlots.filter(s => s.hour < slot.hour);
      
      let insight = `Optimal conditions at ${temp}°F`;
      
      // Analyze overall day trends
      if (laterSlots.length > 0) {
        const avgLaterWind = laterSlots.reduce((sum, s) => sum + s.windSpeed, 0) / laterSlots.length;
        const avgLaterTemp = laterSlots.reduce((sum, s) => sum + s.temperature, 0) / laterSlots.length;
        const maxLaterUV = Math.max(...laterSlots.map(s => s.uvIndex));
        
        // Determine the most significant trend for the day
        if (avgLaterWind > slot.windSpeed + 3) {
          insight += ` - winds will increase to ${Math.round(avgLaterWind)} mph later today`;
        } else if (avgLaterTemp > temp + 6) {
          insight += ` - temperatures will climb to ${Math.round(avgLaterTemp)}°F this afternoon`;
        } else if (maxLaterUV > slot.uvIndex + 2) {
          insight += ` - UV will peak at ${maxLaterUV} during midday hours`;
        } else if (avgLaterTemp < temp - 5) {
          insight += ` - temperatures will drop to ${Math.round(avgLaterTemp)}°F later`;
        } else {
          insight += ` - conditions will remain relatively stable throughout the day`;
        }
      }
      
      return insight;
    };

    // Check if the suggested time is "now" (within 30 minutes of current time)
    const bestTimeTotalMinutes = bestTime.hour * 60 + (bestTime.minute || 0);
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
      reason: `${Math.round(conditions.temperature)}°F with ${Math.round(conditions.windSpeed)} mph winds`,
      contextualInsight: getContextualInsight(bestTime, filteredData),
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
