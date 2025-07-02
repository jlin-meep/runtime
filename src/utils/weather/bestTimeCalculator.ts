
import { TimeSlot } from '../weatherTypes';
import Logger from '../logger';

export const calculateBestTimeInWindow = (
  hourlyData: TimeSlot[], 
  startHour: number, 
  endHour: number
): TimeSlot | null => {
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

  Logger.info('Best time in window:', bestTime.time, 'Score:', bestTime.score, 'Breakdown:', bestTime.scoreBreakdown);
  
  return bestTime;
};
