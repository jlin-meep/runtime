
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
  // Wind scoring - 45% weight (45 points max) - heavily prioritize low winds with severe penalty over 15mph
  let windScore;
  if (windSpeed > 15) {
    // Severe penalty for winds over 15 mph - maximum 15 points to ensure they never win
    windScore = Math.max(0, 15 - ((windSpeed - 15) * 2));
  } else if (windSpeed <= 8) {
    windScore = 45; // Perfect conditions - very low wind
  } else if (windSpeed <= 12) {
    windScore = 40 - ((windSpeed - 8) * 2); // Good conditions - slight penalty
  } else {
    windScore = 32 - ((windSpeed - 12) * 4); // Moderate conditions - bigger penalty
  }
  
  // Temperature scoring - 40% weight (40 points max) - ideal range is 65-70°F
  let tempScore;
  if (temperature >= 65 && temperature <= 70) {
    tempScore = 40; // Perfect temperature range
  } else if (temperature >= 60 && temperature <= 75) {
    tempScore = 32; // Good temperature range
  } else {
    tempScore = Math.max(0, (100 - Math.abs(temperature - 67.5)) / 100) * 40;
  }
  
  // UV scoring - 10% weight (10 points max) - only penalize dangerous UV levels
  let uvScore;
  if (uvIndex <= 7) {
    uvScore = 10; // Full points for UV 0-7
  } else {
    uvScore = Math.max(0, 10 - ((uvIndex - 7) * 2)); // Penalize UV 8+
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
