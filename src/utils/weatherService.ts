interface WeatherData {
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

export interface TimeSlot {
  time: string;
  hour: number;
  score: number;
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

// Mock weather data - in a real app, this would come from a weather API
export const getCurrentWeather = (): WeatherData => {
  return {
    temperature: 65,
    windSpeed: 8,
    cloudCoverage: 25,
    uvIndex: 4
  };
};

export const getYesterdayWeather = (): WeatherData => {
  return {
    temperature: 62,
    windSpeed: 12,
    cloudCoverage: 45,
    uvIndex: 3
  };
};

export const getHourlyWeatherData = (): TimeSlot[] => {
  return [
    { time: "6:00 AM", hour: 6, score: 85, temperature: 58, windSpeed: 5, cloudCoverage: 20, uvIndex: 1 },
    { time: "7:00 AM", hour: 7, score: 90, temperature: 61, windSpeed: 6, cloudCoverage: 15, uvIndex: 2 },
    { time: "8:00 AM", hour: 8, score: 80, temperature: 65, windSpeed: 8, cloudCoverage: 25, uvIndex: 3 },
    { time: "9:00 AM", hour: 9, score: 75, temperature: 68, windSpeed: 9, cloudCoverage: 30, uvIndex: 4 },
    { time: "10:00 AM", hour: 10, score: 70, temperature: 72, windSpeed: 10, cloudCoverage: 35, uvIndex: 5 },
    { time: "11:00 AM", hour: 11, score: 65, temperature: 75, windSpeed: 11, cloudCoverage: 40, uvIndex: 6 },
    { time: "12:00 PM", hour: 12, score: 60, temperature: 78, windSpeed: 12, cloudCoverage: 45, uvIndex: 7 },
    { time: "1:00 PM", hour: 13, score: 55, temperature: 80, windSpeed: 13, cloudCoverage: 50, uvIndex: 8 },
    { time: "2:00 PM", hour: 14, score: 50, temperature: 82, windSpeed: 14, cloudCoverage: 55, uvIndex: 9 },
    { time: "3:00 PM", hour: 15, score: 55, temperature: 81, windSpeed: 13, cloudCoverage: 50, uvIndex: 8 },
    { time: "4:00 PM", hour: 16, score: 60, temperature: 79, windSpeed: 12, cloudCoverage: 45, uvIndex: 7 },
    { time: "5:00 PM", hour: 17, score: 70, temperature: 76, windSpeed: 10, cloudCoverage: 35, uvIndex: 5 },
    { time: "6:00 PM", hour: 18, score: 82, temperature: 69, windSpeed: 7, cloudCoverage: 20, uvIndex: 3 },
    { time: "7:00 PM", hour: 19, score: 88, temperature: 66, windSpeed: 6, cloudCoverage: 15, uvIndex: 2 },
    { time: "8:00 PM", hour: 20, score: 85, temperature: 64, windSpeed: 5, cloudCoverage: 10, uvIndex: 1 },
    { time: "9:00 PM", hour: 21, score: 80, temperature: 62, windSpeed: 4, cloudCoverage: 5, uvIndex: 0 }
  ];
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
  // This function is now deprecated in favor of the dynamic calculation in BestTimeCard
  const hourlyData = getHourlyWeatherData();
  const bestTime = hourlyData.reduce((best, current) => 
    current.score > best.score ? current : best
  );

  const getReason = (slot: TimeSlot): string => {
    if (slot.hour < 12) {
      return "Cool morning temps with low UV and gentle breeze";
    } else {
      return "Perfect evening conditions with cooling temperatures";
    }
  };

  return {
    time: bestTime.time,
    reason: getReason(bestTime),
    conditions: {
      temperature: bestTime.temperature,
      windSpeed: bestTime.windSpeed,
      cloudCoverage: bestTime.cloudCoverage,
      uvIndex: bestTime.uvIndex
    }
  };
};

export const getComparisonData = () => {
  const current = getCurrentWeather();
  const previous = getYesterdayWeather();
  
  return {
    temperature: { current: current.temperature, previous: previous.temperature },
    windSpeed: { current: current.windSpeed, previous: previous.windSpeed },
    cloudCoverage: { current: current.cloudCoverage, previous: previous.cloudCoverage },
    uvIndex: { current: current.uvIndex, previous: previous.uvIndex }
  };
};
