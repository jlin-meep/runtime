
interface NWSPoint {
  properties: {
    gridId: string;
    gridX: number;
    gridY: number;
    forecast: string;
    forecastHourly: string;
    observationStations: string;
  };
}

interface NWSStation {
  id: string;
  properties: {
    stationIdentifier: string;
    name: string;
    timeZone: string;
    geometry: {
      coordinates: [number, number];
    };
  };
}

interface NWSObservation {
  properties: {
    timestamp: string;
    temperature: {
      value: number;
      unitCode: string;
    };
    windSpeed: {
      value: number;
      unitCode: string;
    };
    cloudLayers: Array<{
      amount: string;
    }>;
    heatIndex: {
      value: number;
    };
    windChill: {
      value: number;
    };
  };
}

interface NWSForecast {
  properties: {
    periods: Array<{
      number: number;
      name: string;
      startTime: string;
      temperature: number;
      temperatureUnit: string;
      windSpeed: string;
      windDirection: string;
      shortForecast: string;
      detailedForecast: string;
    }>;
  };
}

const BASE_URL = 'https://api.weather.gov';
const USER_AGENT = 'NOPA-Runner-App (contact@example.com)';

// NOPA coordinates
const NOPA_LAT = 37.7751;
const NOPA_LON = -122.4364;

export const fetchNWSPoint = async (): Promise<NWSPoint> => {
  const response = await fetch(`${BASE_URL}/points/${NOPA_LAT},${NOPA_LON}`, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });
  
  if (!response.ok) {
    throw new Error(`NWS Point API error: ${response.status}`);
  }
  
  return response.json();
};

export const fetchNearbyStations = async (): Promise<NWSStation[]> => {
  try {
    const point = await fetchNWSPoint();
    const response = await fetch(point.properties.observationStations, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    if (!response.ok) {
      throw new Error(`NWS Stations API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    return [];
  }
};

export const fetchStationObservation = async (stationId: string): Promise<NWSObservation | null> => {
  try {
    const response = await fetch(`${BASE_URL}/stations/${stationId}/observations/latest`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch observation for station ${stationId}: ${response.status}`);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching observation for station ${stationId}:`, error);
    return null;
  }
};

export const fetchHourlyForecast = async (): Promise<NWSForecast | null> => {
  try {
    const point = await fetchNWSPoint();
    const response = await fetch(point.properties.forecastHourly, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    if (!response.ok) {
      throw new Error(`NWS Forecast API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    return null;
  }
};

// Utility functions
export const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5) + 32);
};

export const mpsToMph = (mps: number): number => {
  return Math.round(mps * 2.237);
};

export const parseWindSpeed = (windSpeedStr: string): number => {
  const match = windSpeedStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

export const getCloudCoverageFromLayers = (cloudLayers: Array<{amount: string}>): number => {
  if (!cloudLayers || cloudLayers.length === 0) return 0;
  
  // NWS uses terms like "FEW", "SCT", "BKN", "OVC"
  const coverage = cloudLayers[0]?.amount;
  switch (coverage) {
    case 'CLR': return 0;   // Clear
    case 'FEW': return 25;  // Few (1/8 to 2/8)
    case 'SCT': return 50;  // Scattered (3/8 to 4/8) 
    case 'BKN': return 75;  // Broken (5/8 to 7/8)
    case 'OVC': return 100; // Overcast (8/8)
    default: return 25;
  }
};
