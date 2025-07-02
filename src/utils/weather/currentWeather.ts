
import { fetchCurrentWeather } from '../../services/openMeteoService';
import { WeatherData } from '../weatherTypes';
import Logger from '../logger';

const fallbackWeatherData: WeatherData = {
  temperature: 60,
  windSpeed: 13,
  cloudCoverage: 40,
  uvIndex: 2
};

export const getCurrentWeatherData = async (): Promise<WeatherData> => {
  try {
    Logger.info('Fetching current weather');
    const weatherData = await fetchCurrentWeather();
    
    if (weatherData?.current) {
      const current = weatherData.current;
      
      const weather = {
        temperature: Math.round(current.temperature_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        cloudCoverage: Math.round(current.cloud_cover),
        uvIndex: Math.round(current.uv_index)
      };
      
      Logger.success('Current weather data retrieved');
      return weather;
    }
    
    Logger.warn('No valid weather data found, using fallback');
    return fallbackWeatherData;
  } catch (error) {
    Logger.error('Error fetching current weather', error);
    return fallbackWeatherData;
  }
};
