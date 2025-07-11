import React, { useState, useEffect } from 'react';
import BestTimeCard from '../components/BestTimeCard';
import WeatherCard from '../components/WeatherCard';
import ComparisonCard from '../components/ComparisonCard';
import { getCurrentWeather, getHourlyWeatherData, getComparisonData, updateWeatherLocation } from '../utils/weatherService';
import { calculateForecastRange } from '../utils/forecastUtils';
import { SecureStorage, SecurityUtils } from '../utils/securityUtils';
import Logger from '../utils/logger';
const Index = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Load initial location securely from encrypted storage
  const getInitialLocation = async (): Promise<[number, number]> => {
    try {
      const saved = await SecureStorage.getItem('runningAppLocation');
      if (saved) {
        const coordinates = JSON.parse(saved) as [number, number];
        if (SecurityUtils.validateCoordinates(coordinates)) {
          return coordinates;
        }
      }
    } catch (error) {
      Logger.warn('Failed to load saved location, using default');
    }
    return [-122.4364, 37.7751]; // Default to NOPA
  };
  const getInitialLocationName = async (): Promise<string> => {
    try {
      const savedName = await SecureStorage.getItem('runningAppLocationName');
      return savedName || 'NOPA, San Francisco';
    } catch (error) {
      Logger.warn('Failed to load saved location name, using default');
      return 'NOPA, San Francisco';
    }
  };
  const [userLocation, setUserLocation] = useState<[number, number]>([-122.4364, 37.7751]);
  const [locationName, setLocationName] = useState('NOPA, San Francisco');
  const [timeWindow, setTimeWindow] = useState([9, 20]);

  // Initialize location data securely
  useEffect(() => {
    const initializeLocation = async () => {
      const location = await getInitialLocation();
      const name = await getInitialLocationName();
      setUserLocation(location);
      setLocationName(name);
    };
    initializeLocation();
  }, []);

  // Use your valid Mapbox token for reverse geocoding
  const mapboxToken = 'pk.eyJ1IjoiamVubmlmZXIybGluIiwiYSI6ImNtY2p1N2FvbzA3d2gybnE0enk3YXQ3eWkifQ.yyfPBUCT2nP7ZRbHGVowBg';
  const reverseGeocode = async (coordinates: [number, number]): Promise<string> => {
    if (!mapboxToken) return 'Unknown Location';
    try {
      const [lng, lat] = coordinates;
      console.log('🗺️ Reverse geocoding coordinates:', [lng, lat]);
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=neighborhood,locality,place`);
      if (!response.ok) throw new Error('Reverse geocoding failed');
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        // Try to get neighborhood first, then locality
        const neighborhood = data.features.find(f => f.place_type.includes('neighborhood'));
        const locality = data.features.find(f => f.place_type.includes('locality'));
        let locationName;
        if (neighborhood) {
          locationName = neighborhood.text + (locality ? `, ${locality.text}` : '');
        } else if (locality) {
          locationName = locality.place_name;
        } else {
          locationName = data.features[0].place_name;
        }
        console.log('✅ Location name resolved:', locationName);
        return locationName;
      }
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error);
    }
    return 'Unknown Location';
  };
  const loadWeatherData = async (isLocationChange = false) => {
    try {
      Logger.info('Loading weather data', {
        location: locationName
      });
      if (isLocationChange && !loading) {
        setWeatherLoading(true);
      }

      // Validate coordinates before API calls
      if (!SecurityUtils.validateCoordinates(userLocation)) {
        throw new Error('Invalid coordinates provided');
      }
      updateWeatherLocation(userLocation);
      await new Promise(resolve => setTimeout(resolve, 100));
      Logger.debug('Fetching weather data from APIs');
      const [current, hourly, comparison] = await Promise.all([getCurrentWeather(), getHourlyWeatherData(), getComparisonData()]);
      Logger.success('Weather data loaded successfully');
      setCurrentWeather(current);
      setHourlyData(hourly);
      setComparisonData(comparison);
    } catch (error) {
      Logger.error('Error loading weather data', error);
      // Show user-friendly error message (implement toast notification here if needed)
    } finally {
      setLoading(false);
      setWeatherLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log('🚀 Initial app load');
    loadWeatherData();
  }, []);

  // Reload weather data when location changes (but don't reset loading state)
  useEffect(() => {
    if (!loading) {
      console.log('📍 Location changed, reloading weather data:', userLocation);
      // Only reload if we're not in initial loading state
      loadWeatherData(true);
    }
  }, [userLocation]);
  const handleLocationChange = async (coordinates: [number, number], address?: string) => {
    Logger.info('Location change requested');

    // Validate coordinates before processing
    if (!SecurityUtils.validateCoordinates(coordinates)) {
      Logger.error('Invalid coordinates provided');
      return;
    }

    // Save location securely
    try {
      await SecureStorage.setItem('runningAppLocation', JSON.stringify(coordinates));
      setUserLocation(coordinates);

      // Update location name
      if (address) {
        const sanitizedAddress = SecurityUtils.sanitizeAddressInput(address);
        Logger.info('Using provided address');
        setLocationName(sanitizedAddress);
        await SecureStorage.setItem('runningAppLocationName', sanitizedAddress);
      } else {
        Logger.debug('Reverse geocoding new location');
        const geocodedName = await reverseGeocode(coordinates);
        const sanitizedName = SecurityUtils.sanitizeAddressInput(geocodedName);
        setLocationName(sanitizedName);
        await SecureStorage.setItem('runningAppLocationName', sanitizedName);
      }
      Logger.success('Location updated successfully');
    } catch (error) {
      Logger.error('Failed to save location', error);
    }
  };

  // Calculate forecast range for the current time window
  const forecastRange = React.useMemo(() => {
    if (hourlyData.length === 0) return undefined;
    return calculateForecastRange(hourlyData, timeWindow);
  }, [hourlyData, timeWindow]);
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-orange-400 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🌤️</div>
          <h2 className="text-2xl font-bold mb-2">Loading Weather Data</h2>
          <p className="text-white/80">Fetching data for {locationName}...</p>
        </div>
      </div>;
  }
  ;
  return <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-orange-400">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">🏃🏻‍♀️ RunTime</h1>
          
        </div>

        <div className="grid gap-8 max-w-6xl mx-auto">
          {/* Best Time Section */}
          <div className="col-span-full">
            <BestTimeCard hourlyData={hourlyData} locationName={locationName} currentWeather={currentWeather} onLocationChange={handleLocationChange} initialLocation={userLocation} onTimeWindowChange={setTimeWindow} />
          </div>

          {/* Weather Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {currentWeather && <WeatherCard title="Current Conditions" data={currentWeather} forecastRange={forecastRange} />}
            
            {comparisonData && <ComparisonCard data={comparisonData} />}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/65 text-xs">🌦️ Weather data from Open-Meteo API. Built by Jennifer Lin.</p>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;