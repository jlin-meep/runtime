
interface WeatherData {
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  uvIndex: number;
}

interface TimeSlot {
  time: string;
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

export const getBestRunningTime = (): { time: string; reason: string; conditions: WeatherData } => {
  // Mock hourly data for today
  const hourlyData: TimeSlot[] = [
    { time: "6:00 AM", score: 85, temperature: 58, windSpeed: 5, cloudCoverage: 20, uvIndex: 1 },
    { time: "7:00 AM", score: 90, temperature: 61, windSpeed: 6, cloudCoverage: 15, uvIndex: 2 },
    { time: "8:00 AM", score: 80, temperature: 65, windSpeed: 8, cloudCoverage: 25, uvIndex: 3 },
    { time: "9:00 AM", score: 75, temperature: 68, windSpeed: 9, cloudCoverage: 30, uvIndex: 4 },
    { time: "10:00 AM", score: 70, temperature: 72, windSpeed: 10, cloudCoverage: 35, uvIndex: 5 },
    { time: "6:00 PM", score: 82, temperature: 69, windSpeed: 7, cloudCoverage: 20, uvIndex: 3 },
    { time: "7:00 PM", score: 88, temperature: 66, windSpeed: 6, cloudCoverage: 15, uvIndex: 2 },
  ];

  // Find the best time based on score
  const bestTime = hourlyData.reduce((best, current) => 
    current.score > best.score ? current : best
  );

  const getReason = (slot: TimeSlot): string => {
    if (slot.time.includes("AM")) {
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
