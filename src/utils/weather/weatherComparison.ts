
import { getCurrentWeatherData } from './currentWeather';
import Logger from '../logger';

export const getComparisonWeatherData = async () => {
  Logger.info('Getting comparison data');
  const current = await getCurrentWeatherData();
  const previous = {
    temperature: 58,
    windSpeed: 11,
    cloudCoverage: 35,
    uvIndex: 3
  };
  
  return {
    temperature: { current: current.temperature, previous: previous.temperature },
    windSpeed: { current: current.windSpeed, previous: previous.windSpeed },
    cloudCoverage: { current: current.cloudCoverage, previous: previous.cloudCoverage },
    uvIndex: { current: current.uvIndex, previous: previous.uvIndex }
  };
};
