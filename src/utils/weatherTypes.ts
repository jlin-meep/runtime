
export interface WeatherData {
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
