
import { WeatherData, TimeSlot, WeatherStation } from './weatherTypes';
import { getCurrentWeatherData } from './weather/currentWeather';
import { getHourlyForecast } from './weather/hourlyWeather';
import { getComparisonWeatherData } from './weather/weatherComparison';
import { calculateBestTimeInWindow as findBestTime } from './weather/bestTimeCalculator';
import { updateWeatherLocation as updateLocation } from '../services/openMeteoService';
import Logger from './logger';

// Re-export location update function
export const updateWeatherLocation = updateLocation;

// Re-export main weather data functions
export const getCurrentWeather = getCurrentWeatherData;
export const getHourlyWeatherData = getHourlyForecast;
export const getComparisonData = getComparisonWeatherData;
export const calculateBestTimeInWindow = findBestTime;

// Legacy functions for backward compatibility
export const getYesterdayWeather = (): WeatherData => {
  return {
    temperature: 58,
    windSpeed: 11,
    cloudCoverage: 35,
    uvIndex: 3
  };
};

export const getBestRunningTime = (): { time: string; reason: string; conditions: WeatherData } => {
  const fallbackWeatherData: WeatherData = {
    temperature: 60,
    windSpeed: 13,
    cloudCoverage: 40,
    uvIndex: 2
  };

  return {
    time: "7:00 AM",
    reason: "Cool morning temps with low UV and gentle breeze",
    conditions: fallbackWeatherData
  };
};

export const getWeatherStations = async (): Promise<WeatherStation[]> => {
  Logger.debug('Weather stations not available with Open-Meteo');
  return [];
};
