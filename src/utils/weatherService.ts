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
  scoreBreakdown?: {
    windScore: number;
    uvScore: number;
    tempScore: number;
    cloudScore: number;
    currentTimeBonus: number;
    total: number;
  };
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

// Track current location for debugging
let currentLocationDebug: [number, number] = [-122.4364, 37.7751];

// Add location update function
export const updateWeatherLocation = (coordinates: [number, number]) => {
  currentLocationDebug = coordinates;
  setCurrentLocation(coordinates);
  console.log('🌍 Weather location updated to:', coordinates);
};

export const getCurrentWeather = async (): Promise<WeatherData> => {
  try {
    console.log('🌤️ Fetching current weather for location:', currentLocationDebug);
    const weatherData = await fetchCurrentWeather();
    
    if (weatherData?.current) {
      const current = weatherData.current;
      
      const weather = {
        temperature: Math.round(current.temperature_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        cloudCoverage: Math.round(current.cloud_cover),
        uvIndex: Math.round(current.uv_index)
      };
      
      console.log('✅ Current weather from Open-Meteo:', weather, 'for location:', currentLocationDebug);
      return weather;
    }
    
    console.warn('⚠️ No valid weather data found, using fallback');
    return fallbackWeatherData;
  } catch (error) {
    console.error('❌ Error fetching current weather:', error);
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
    console.log('📊 Fetching hourly forecast for location:', currentLocationDebug);
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
        
        // Calculate detailed score breakdown
        const scoreBreakdown = calculateDetailedScore(temperature, windSpeed, cloudCoverage, uvIndex, hour);
        
        timeSlots.push({
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
        });
      }
      
      console.log('✅ Hourly forecast processed:', timeSlots.length, 'slots for location:', currentLocationDebug);
      return timeSlots;
    }
  } catch (error) {
    console.error('❌ Error fetching hourly weather data:', error);
  }
  
  // Fallback to mock data if API fails
  console.log('⚠️ Using fallback hourly data');
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

// New detailed scoring function with updated weightings
const calculateDetailedScore = (temperature: number, windSpeed: number, cloudCoverage: number, uvIndex: number, hour: number) => {
  // Wind scoring - 40% weight (40 points max) - heavily penalize winds over 15mph
  let windScore;
  if (windSpeed <= 10) {
    windScore = 40; // Perfect conditions
  } else if (windSpeed <= 15) {
    windScore = Math.max(0, (15 - windSpeed) / 5) * 30; // Good conditions
  } else {
    windScore = Math.max(0, (25 - windSpeed) / 10) * 15; // Poor conditions
  }
  
  // Temperature scoring - 30% weight (30 points max) - ideal range is 60-75°F
  let tempScore;
  if (temperature >= 60 && temperature <= 75) {
    tempScore = 30; // Perfect temperature range
  } else {
    tempScore = Math.max(0, (100 - Math.abs(temperature - 67.5)) / 100) * 30;
  }
  
  // UV scoring - 20% weight (20 points max) - favor moderate UV levels (2-5), penalize very low and very high
  let uvScore;
  if (uvIndex >= 2 && uvIndex <= 5) {
    uvScore = 20; // Ideal UV range
  } else if (uvIndex < 2) {
    uvScore = 13; // Low UV (early/late)
  } else if (uvIndex <= 7) {
    uvScore = Math.max(0, (8 - uvIndex) / 3) * 10; // Manageable UV
  } else {
    uvScore = 3; // Dangerous UV
  }
  
  // Cloud coverage scoring - 10% weight (10 points max) - prefer some clouds for comfort
  let cloudScore;
  if (cloudCoverage >= 20 && cloudCoverage <= 60) {
    cloudScore = 10; // Some cloud cover is good
  } else {
    cloudScore = Math.max(0, (100 - Math.abs(cloudCoverage - 40)) / 100) * 10;
  }
  
  // Small bonus for running sooner when conditions are good
  const now = new Date();
  const currentHour = now.getHours();
  const timeDiff = Math.abs(hour - currentHour);
  const currentTimeBonus = timeDiff <= 1 ? 3 : 0;
  
  const total = Math.round(windScore + tempScore + uvScore + cloudScore + currentTimeBonus);
  
  return {
    windScore: Math.round(windScore),
    uvScore: Math.round(uvScore),
    tempScore: Math.round(tempScore),
    cloudScore: Math.round(cloudScore),
    currentTimeBonus,
    total
  };
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

  // Find the time slot with the highest score
  const bestTime = filteredData.reduce((best, current) => {
    return current.score > best.score ? current : best;
  });

  console.log('🏆 Best time in window:', bestTime.time, 'Score:', bestTime.score, 'Breakdown:', bestTime.scoreBreakdown);
  
  return bestTime;
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
  console.log('📊 Getting comparison data for location:', currentLocationDebug);
  const current = await getCurrentWeather();
  const previous = getYesterdayWeather();
  
  return {
    temperature: { current: current.temperature, previous: previous.temperature },
    windSpeed: { current: current.windSpeed, previous: previous.windSpeed },
    cloudCoverage: { current: current.cloudCoverage, previous: previous.cloudCoverage },
    uvIndex: { current: current.uvIndex, previous: previous.uvIndex }
  };
};
