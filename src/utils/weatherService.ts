import { 
  fetchNearbyStations, 
  fetchStationObservation, 
  fetchHourlyForecast, 
  celsiusToFahrenheit, 
  mpsToMph, 
  parseWindSpeed,
  getCloudCoverageFromLayers,
  setCurrentLocation
} from '../services/nwsService';

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
    const stations = await fetchNearbyStations();
    
    // Try to get data from the first few stations
    for (const station of stations.slice(0, 3)) {
      const observation = await fetchStationObservation(station.properties.stationIdentifier);
      
      if (observation?.properties) {
        const props = observation.properties;
        
        // Convert temperature from Celsius to Fahrenheit
        const tempCelsius = props.temperature?.value;
        const temperature = tempCelsius ? celsiusToFahrenheit(tempCelsius) : fallbackWeatherData.temperature;
        
        // Convert wind speed from m/s to mph
        const windMps = props.windSpeed?.value;
        const windSpeed = windMps ? mpsToMph(windMps) : fallbackWeatherData.windSpeed;
        
        // Get cloud coverage
        const cloudCoverage = getCloudCoverageFromLayers(props.cloudLayers || []);
        
        // Get current UV from hourly forecast (NWS doesn't provide current UV in observations)
        let uvIndex = 0;
        try {
          const forecast = await fetchHourlyForecast();
          if (forecast?.properties?.periods && forecast.properties.periods.length > 0) {
            // Get current hour's forecast for UV
            const currentPeriod = forecast.properties.periods[0];
            // Extract UV from detailed forecast if available
            const detailedForecast = currentPeriod.detailedForecast?.toLowerCase() || '';
            const uvMatch = detailedForecast.match(/uv index (\d+)/);
            if (uvMatch) {
              uvIndex = parseInt(uvMatch[1]);
            }
          }
        } catch (error) {
          console.log('Could not get UV from forecast, using fallback');
          uvIndex = fallbackWeatherData.uvIndex;
        }
        
        console.log(`Weather data from station ${station.properties.name}:`, {
          temperature, windSpeed, cloudCoverage, uvIndex
        });
        
        return {
          temperature,
          windSpeed,
          cloudCoverage,
          uvIndex
        };
      }
    }
    
    console.warn('No valid weather data found, using fallback');
    return fallbackWeatherData;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return fallbackWeatherData;
  }
};

export const getYesterdayWeather = (): WeatherData => {
  // NWS doesn't provide historical data easily, so we'll simulate yesterday's data
  // by slightly modifying current conditions
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
    
    if (forecast?.properties?.periods) {
      const periods = forecast.properties.periods.slice(0, 16); // Get next 16 hours
      
      return periods.map((period, index) => {
        const startTime = new Date(period.startTime);
        const hour = startTime.getHours();
        const temperature = period.temperature;
        const windSpeed = parseWindSpeed(period.windSpeed);
        
        // Estimate cloud coverage from forecast description
        const shortForecast = period.shortForecast.toLowerCase();
        let cloudCoverage = 25;
        if (shortForecast.includes('clear') || shortForecast.includes('sunny')) cloudCoverage = 10;
        else if (shortForecast.includes('partly')) cloudCoverage = 40;
        else if (shortForecast.includes('mostly cloudy')) cloudCoverage = 70;
        else if (shortForecast.includes('overcast') || shortForecast.includes('cloudy')) cloudCoverage = 90;
        
        // Extract UV index from detailed forecast
        let uvIndex = 0;
        const detailedForecast = period.detailedForecast?.toLowerCase() || '';
        const uvMatch = detailedForecast.match(/uv index (\d+)/);
        if (uvMatch) {
          uvIndex = parseInt(uvMatch[1]);
        } else if (hour >= 7 && hour <= 19) {
          // Fallback UV calculation only if not found in forecast
          const baseUv = Math.max(0, 6 - Math.abs(hour - 13) * 0.5);
          uvIndex = Math.max(0, Math.round(baseUv * (1 - cloudCoverage / 200)));
        }
        
        // Calculate score prioritizing low wind, low UV, comfortable temp
        const windScore = Math.max(0, (25 - windSpeed) / 25) * 40;
        const uvScore = Math.max(0, (8 - uvIndex) / 8) * 30;
        const tempScore = Math.max(0, (100 - Math.abs(temperature - 65)) / 100) * 20;
        const cloudScore = Math.max(0, (100 - cloudCoverage) / 100) * 10;
        const score = Math.round(windScore + uvScore + tempScore + cloudScore);
        
        return {
          time: startTime.toLocaleTimeString('en-US', { 
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
        };
      });
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
  try {
    const stations = await fetchNearbyStations();
    
    const stationPromises = stations.slice(0, 5).map(async (station) => {
      // Test if station has recent data
      const observation = await fetchStationObservation(station.properties.stationIdentifier);
      const isActive = observation?.properties?.timestamp ? 
        (Date.now() - new Date(observation.properties.timestamp).getTime()) < 24 * 60 * 60 * 1000 : false;
      
      return {
        id: station.properties.stationIdentifier,
        name: station.properties.name,
        coordinates: [
          station.geometry.coordinates[0], 
          station.geometry.coordinates[1]
        ] as [number, number],
        isActive
      };
    });
    
    return Promise.all(stationPromises);
  } catch (error) {
    console.error('Error fetching weather stations:', error);
    return [];
  }
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
