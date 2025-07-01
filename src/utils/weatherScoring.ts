
export interface ScoreBreakdown {
  windScore: number;
  uvScore: number;
  tempScore: number;
  cloudScore: number;
  currentTimeBonus: number;
  total: number;
}

export const calculateDetailedScore = (
  temperature: number, 
  windSpeed: number, 
  cloudCoverage: number, 
  uvIndex: number, 
  hour: number
): ScoreBreakdown => {
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
