
import { TimeSlot } from './weatherTypes';

export interface ForecastRange {
  tempHigh: number;
  tempLow: number;
  windHigh: number;
  windLow: number;
  cloudHigh: number;
  cloudLow: number;
  uvHigh: number;
  uvLow: number;
}

export const calculateForecastRange = (
  hourlyData: TimeSlot[], 
  timeWindow: number[]
): ForecastRange => {
  // Filter data to only include times within the selected window
  const filteredData = hourlyData.filter(slot => 
    slot.hour >= timeWindow[0] && slot.hour <= timeWindow[1]
  );

  if (filteredData.length === 0) {
    // Return neutral values if no data available
    return {
      tempHigh: 70,
      tempLow: 50,
      windHigh: 15,
      windLow: 5,
      cloudHigh: 60,
      cloudLow: 20,
      uvHigh: 5,
      uvLow: 1
    };
  }

  // Calculate actual ranges from the filtered data
  const temperatures = filteredData.map(slot => slot.temperature);
  const windSpeeds = filteredData.map(slot => slot.windSpeed);
  const cloudCoverages = filteredData.map(slot => slot.cloudCoverage);
  const uvIndices = filteredData.map(slot => slot.uvIndex);

  return {
    tempHigh: Math.max(...temperatures),
    tempLow: Math.min(...temperatures),
    windHigh: Math.max(...windSpeeds),
    windLow: Math.min(...windSpeeds),
    cloudHigh: Math.max(...cloudCoverages),
    cloudLow: Math.min(...cloudCoverages),
    uvHigh: Math.max(...uvIndices),
    uvLow: Math.min(...uvIndices)
  };
};
