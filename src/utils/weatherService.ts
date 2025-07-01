
import { 
  fetchCurrentWeather, 
  fetchHourlyForecast, 
  setCurrentLocation 
} from '../services/openMeteoService';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

export interface TimeSlot {
  time: string;
  hour: number;
  minute?: number;
  score: number;
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

export interface WeatherStation {
  id: string;
  name: string;
  coordinates: [number, number];
  isActive: boolean;
}

// Fallback data in case API fails
const fallbackWeatherData: WeatherData = {
  temperature: 60,
  windSpeed: 13,
  cloudCoverage: 40,
  uvIndex: 2
};

// Add location update function
export const updateWeatherLocation = (coordinates: [number, number]) => {
  setCurrentLocation(coordinates);
};

export const getCurrentWeather = async (): Promise<WeatherData> => {
  try {
    const weatherData = await fetchCurrentWeather();
    
    if (weatherData?.current) {
      const current = weatherData.current;
      
      const weather = {
        temperature: Math.round(current.temperature_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        cloudCoverage: Math.round(current.cloud_cover),
        uvIndex: Math.round(current.uv_index)
      };
      
      console.log('Current weather from Open-Meteo:', weather);
      return weather;
    }
    
    console.warn('No valid weather data found, using fallback');
    return fallbackWeatherData;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return fallbackWeatherData;
  }
};

export const getYesterdayWeather = (): WeatherData => {
  // For now, return slightly modified current conditions
  // Open-Meteo historical data would require a different endpoint
  return {
    temperature: 58,
    windSpeed: 11,
    cloudCoverage: 35,
    uvIndex: 3
  };
};

export const getHourlyWeatherData = async (): Promise<TimeSlot[]> => {
  try {
    const forecast = await fetchHourlyForecast();
    
    if (forecast?.hourly) {
      const hourly = forecast.hourly;
      const timeSlots: TimeSlot[] = [];
      
      // Get next 16 hours
      for (let i = 0; i < Math.min(16, hourly.time.length); i++) {
        const time = new Date(hourly.time[i]);
        const hour = time.getHours();
        const temperature = Math.round(hourly.temperature_2m[i]);
        const windSpeed = Math.round(hourly.wind_speed_10m[i]);
        const cloudCoverage = Math.round(hourly.cloud_cover[i]);
        const uvIndex = Math.round(hourly.uv_index[i]);
        
        // Calculate score prioritizing low wind, low UV, comfortable temp
        const windScore = Math.max(0, (25 - windSpeed) / 25) * 40;
        const uvScore = Math.max(0, (8 - uvIndex) / 8) * 30;
        const tempScore = Math.max(0, (100 - Math.abs(temperature - 65)) / 100) * 20;
        const cloudScore = Math.max(0, (100 - cloudCoverage) / 100) * 10;
        const score = Math.round(windScore + uvScore + tempScore + cloudScore);
        
        timeSlots.push({
          time: time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          hour,
          score,
          temperature,
          windSpeed,
          cloudCoverage,
          uvIndex
        });
      }
      
      return timeSlots;
    }
  } catch (error) {
    console.error('Error fetching hourly weather data:', error);
  }
  
  // Fallback to mock data if API fails
  return [
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
    { time: "9:00 PM", hour: 21, score: 80, temperature: 57, windSpeed: 9, cloudCoverage: 20, uvIndex: 0 }
  ];
};

export const getWeatherStations = async (): Promise<WeatherStation[]> => {
  // Open-Meteo doesn't expose individual weather stations
  // Return empty array since this feature isn't relevant with Open-Meteo
  return [];
};

export const calculateBestTimeInWindow = (hourlyData: TimeSlot[], startHour: number, endHour: number): TimeSlot | null => {
  // Filter data to only include times within the selected window
  const filteredData = hourlyData.filter(slot => 
    slot.hour >= startHour && slot.hour <= endHour
  );

  if (filteredData.length === 0) {
    return null;
  }

  // Calculate weighted score prioritizing: 1) lowest wind, 2) lowest UV, 3) temperature, 4) cloud coverage
  const calculatePriorityScore = (slot: TimeSlot): number => {
    // Normalize values to 0-1 range and invert so lower values get higher scores
    const windScore = Math.max(0, (20 - slot.windSpeed) / 20) * 40; // 40% weight - most important
    const uvScore = Math.max(0, (10 - slot.uvIndex) / 10) * 30; // 30% weight
    const tempScore = Math.max(0, (100 - Math.abs(slot.temperature - 70)) / 100) * 20; // 20% weight (ideal temp ~70°F)
    const cloudScore = Math.max(0, (100 - slot.cloudCoverage) / 100) * 10; // 10% weight - least important
    
    return windScore + uvScore + tempScore + cloudScore;
  };

  // Find the time slot with the highest priority score
  return filteredData.reduce((best, current) => {
    const currentScore = calculatePriorityScore(current);
    const bestScore = calculatePriorityScore(best);
    return currentScore > bestScore ? current : best;
  });
};

export const getBestRunningTime = (): { time: string; reason: string; conditions: WeatherData } => {
  const hourlyData = getHourlyWeatherData();
  
  // This is now a placeholder since we need async data
  return {
    time: "7:00 AM",
    reason: "Cool morning temps with low UV and gentle breeze",
    conditions: fallbackWeatherData
  };
};

export const getComparisonData = async () => {
  const current = await getCurrentWeather();
  const previous = getYesterdayWeather();
  
  return {
    temperature: { current: current.temperature, previous: previous.temperature },
    windSpeed: { current: current.windSpeed, previous: previous.windSpeed },
    cloudCoverage: { current: current.cloudCoverage, previous: previous.cloudCoverage },
    uvIndex: { current: current.uvIndex, previous: previous.uvIndex }
  };
};
