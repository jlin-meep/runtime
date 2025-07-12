
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
  // Wind scoring - 60% weight (60 points max) - heavily prioritize low winds with severe penalty over 15mph
  let windScore;
  if (windSpeed > 15) {
    // Severe penalty for winds over 15 mph - maximum 15 points to ensure they never win
    windScore = Math.max(0, 15 - ((windSpeed - 15) * 2));
  } else if (windSpeed <= 8) {
    windScore = 60; // Perfect conditions - very low wind
  } else if (windSpeed <= 12) {
    windScore = 55 - ((windSpeed - 8) * 2); // Good conditions - slight penalty
  } else {
    windScore = 47 - ((windSpeed - 12) * 4); // Moderate conditions - bigger penalty
  }
  
  // Temperature scoring - 25% weight (25 points max) - ideal range is 65-70°F
  let tempScore;
  if (temperature >= 65 && temperature <= 70) {
    tempScore = 25; // Perfect temperature range
  } else if (temperature >= 60 && temperature <= 75) {
    tempScore = 20; // Good temperature range
  } else {
    tempScore = Math.max(0, (100 - Math.abs(temperature - 67.5)) / 100) * 25;
  }
  
  // UV scoring - 10% weight (10 points max) - favor moderate UV levels
  let uvScore;
  if (uvIndex >= 2 && uvIndex <= 5) {
    uvScore = 10; // Ideal UV range
  } else if (uvIndex < 2) {
    uvScore = 9; // Low UV (early/late)
  } else if (uvIndex <= 7) {
    uvScore = Math.max(0, (8 - uvIndex) / 3) * 5; // Manageable UV
  } else {
    uvScore = 4; // Dangerous UV
  }
  
  // Cloud coverage scoring - 5% weight (5 points max) - prefer some clouds for comfort
  let cloudScore;
  if (cloudCoverage >= 20 && cloudCoverage <= 60) {
    cloudScore = 5; // Some cloud cover is good
  } else {
    cloudScore = Math.max(0, (100 - Math.abs(cloudCoverage - 40)) / 100) * 5;
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
