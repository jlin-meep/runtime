
import { fetchHourlyForecast } from '../../services/openMeteoService';
import { TimeSlot } from '../weatherTypes';
import { calculateDetailedScore } from '../weatherScoring';
import Logger from '../logger';

export const getHourlyForecast = async (): Promise<TimeSlot[]> => {
  try {
    Logger.info('Fetching hourly forecast');
    const forecast = await fetchHourlyForecast();
    
    if (forecast?.hourly) {
      const hourly = forecast.hourly;
      const timeSlots: TimeSlot[] = [];
      
      Logger.debug('Processing forecast data');
      console.log('🌤️ Raw API data sample:', {
        totalHours: hourly.time.length,
        sampleData: hourly.time.slice(0, 5).map((time, i) => ({
          time,
          temp: hourly.temperature_2m[i],
          wind: hourly.wind_speed_10m[i],
          clouds: hourly.cloud_cover[i],
          uv: hourly.uv_index[i]
        }))
      });
      
      const maxHours = Math.min(48, hourly.time.length);
      
      for (let i = 0; i < maxHours; i++) {
        const time = new Date(hourly.time[i]);
        const hour = time.getHours();
        const temperature = Math.round(hourly.temperature_2m[i]);
        const windSpeed = Math.round(hourly.wind_speed_10m[i]);
        const cloudCoverage = Math.round(hourly.cloud_cover[i]);
        const uvIndex = Math.round(hourly.uv_index[i]);
        
        const now = new Date();
        const slotDate = time.toDateString();
        const todayDate = now.toDateString();
        const isToday = slotDate === todayDate;
        
        if (isToday && hour < 6) {
          continue;
        }
        
        const scoreBreakdown = calculateDetailedScore(temperature, windSpeed, cloudCoverage, uvIndex, hour);
        
        const slot = {
          time: time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          hour,
          score: scoreBreakdown.total,
          temperature,
          windSpeed,
          cloudCoverage,
          uvIndex,
          scoreBreakdown
        };
        
        timeSlots.push(slot);
      }
      
      Logger.success('Hourly forecast processed');
      return timeSlots;
    }
  } catch (error) {
    Logger.error('Error fetching hourly weather data', error);
  }
  
  return getFallbackHourlyData();
};

const getFallbackHourlyData = (): TimeSlot[] => {
  Logger.warn('Using fallback hourly data');
  const fallbackData = [
    { time: "6:00 AM", hour: 6, score: 85, temperature: 54, windSpeed: 8, cloudCoverage: 30, uvIndex: 0 },
    { time: "7:00 AM", hour: 7, score: 90, temperature: 56, windSpeed: 9, cloudCoverage: 25, uvIndex: 1 },
    { time: "8:00 AM", hour: 8, score: 80, temperature: 58, windSpeed: 11, cloudCoverage: 35, uvIndex: 2 },
    { time: "9:00 AM", hour: 9, score: 75, temperature: 60, windSpeed: 12, cloudCoverage: 40, uvIndex: 2 },
    { time: "10:00 AM", hour: 10, score: 70, temperature: 62, windSpeed: 13, cloudCoverage: 45, uvIndex: 3 },
    { time: "11:00 AM", hour: 11, score: 65, temperature: 64, windSpeed: 14, cloudCoverage: 50, uvIndex: 4 },
    { time: "12:00 PM", hour: 12, score: 60, temperature: 66, windSpeed: 15, cloudCoverage: 55, uvIndex: 5 },
    { time: "1:00 PM", hour: 13, score: 55, temperature: 68, windSpeed: 16, cloudCoverage: 60, uvIndex: 5 },
    { time: "2:00 PM", hour: 14, score: 50, temperature: 69, windSpeed: 17, cloudCoverage: 65, uvIndex: 6 },
    { time: "3:00 PM", hour: 15, score: 55, temperature: 68, windSpeed: 16, cloudCoverage: 60, uvIndex: 5 },
    { time: "4:00 PM", hour: 16, score: 60, temperature: 66, windSpeed: 15, cloudCoverage: 55, uvIndex: 4 },
    { time: "5:00 PM", hour: 17, score: 70, temperature: 64, windSpeed: 14, cloudCoverage: 45, uvIndex: 3 },
    { time: "6:00 PM", hour: 18, score: 82, temperature: 62, windSpeed: 12, cloudCoverage: 35, uvIndex: 2 },
    { time: "7:00 PM", hour: 19, score: 88, temperature: 60, windSpeed: 11, cloudCoverage: 30, uvIndex: 1 },
    { time: "8:00 PM", hour: 20, score: 85, temperature: 58, windSpeed: 10, cloudCoverage: 25, uvIndex: 0 },
    { time: "9:00 PM", hour: 21, score: 80, temperature: 57, windSpeed: 9, cloudCoverage: 20, uvIndex: 0 },
    { time: "10:00 PM", hour: 22, score: 78, temperature: 56, windSpeed: 8, cloudCoverage: 15, uvIndex: 0 }
  ];
  
  Logger.debug('Fallback data hours:', fallbackData.map(d => `${d.hour}:00 (${d.score})`));
  return fallbackData;
};
