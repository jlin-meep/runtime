
interface OpenMeteoCurrentWeather {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index: number;
    cloud_cover: number;
  };
}

interface OpenMeteoHourlyForecast {
  hourly: {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    uv_index: number[];
    cloud_cover: number[];
  };
}

const BASE_URL = 'https://api.open-meteo.com/v1';

// Store current location - default to NOPA
let currentLocation: [number, number] = [-122.4364, 37.7751];

export const setCurrentLocation = (coordinates: [number, number]) => {
  currentLocation = coordinates;
  console.log('Open-Meteo service location updated to:', coordinates);
};

// Export alias for backward compatibility
export const updateWeatherLocation = setCurrentLocation;

export const fetchCurrentWeather = async (): Promise<OpenMeteoCurrentWeather | null> => {
  try {
    const [lon, lat] = currentLocation;
    const response = await fetch(
      `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index,cloud_cover&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching current weather from Open-Meteo:', error);
    return null;
  }
};

export const fetchHourlyForecast = async (): Promise<OpenMeteoHourlyForecast | null> => {
  try {
    const [lon, lat] = currentLocation;
    const response = await fetch(
      `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,uv_index,cloud_cover&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=2`
    );
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching hourly forecast from Open-Meteo:', error);
    return null;
  }
};
