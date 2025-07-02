import React, { useState, useEffect } from 'react';
import BestTimeCard from '../components/BestTimeCard';
import WeatherCard from '../components/WeatherCard';
import ComparisonCard from '../components/ComparisonCard';
import { getCurrentWeather, getHourlyWeatherData, getComparisonData, updateWeatherLocation } from '../utils/weatherService';
import { calculateForecastRange } from '../utils/forecastUtils';

const Index = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Load initial location from localStorage or default to NOPA
  const getInitialLocation = (): [number, number] => {
    const saved = localStorage.getItem('runningAppLocation');
    return saved ? JSON.parse(saved) : [-122.4364, 37.7751];
  };
  const getInitialLocationName = (): string => {
    const savedName = localStorage.getItem('runningAppLocationName');
    return savedName || 'NOPA, San Francisco';
  };
  const [userLocation, setUserLocation] = useState<[number, number]>(getInitialLocation());
  const [locationName, setLocationName] = useState(getInitialLocationName());
  const [timeWindow, setTimeWindow] = useState([9, 20]); // Track time window state

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
      console.log('🌤️ Loading weather data for location:', locationName, userLocation);

      // Only show weather loading for location changes after initial load
      if (isLocationChange && !loading) {
        setWeatherLoading(true);
      }

      // CRITICAL: Update weather service location FIRST before any API calls
      updateWeatherLocation(userLocation);

      // Add a small delay to ensure location is set properly
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('📊 Fetching weather data from APIs...');
      const [current, hourly, comparison] = await Promise.all([getCurrentWeather(), getHourlyWeatherData(), getComparisonData()]);
      console.log('✅ Weather data loaded:', {
        current: current,
        hourlySlots: hourly.length,
        comparison: comparison,
        location: userLocation
      });
      setCurrentWeather(current);
      setHourlyData(hourly);
      setComparisonData(comparison);
    } catch (error) {
      console.error('❌ Error loading weather data:', error);
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
    console.log('🎯 Location change requested:', coordinates, address);

    // Save location to localStorage
    localStorage.setItem('runningAppLocation', JSON.stringify(coordinates));
    setUserLocation(coordinates);

    // Update location name
    if (address) {
      console.log('📍 Using provided address:', address);
      setLocationName(address);
      localStorage.setItem('runningAppLocationName', address);
    } else {
      // Use reverse geocoding to get location name
      console.log('🔍 Reverse geocoding new location...');
      const geocodedName = await reverseGeocode(coordinates);
      setLocationName(geocodedName);
      localStorage.setItem('runningAppLocationName', geocodedName);
    }
    console.log('✅ Location updated:', coordinates, address || (await reverseGeocode(coordinates)));
  };

  // Calculate forecast range for the current time window
  const forecastRange = React.useMemo(() => {
    if (hourlyData.length === 0) return undefined;
    return calculateForecastRange(hourlyData, timeWindow);
  }, [hourlyData, timeWindow]);
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🌤️</div>
          <h2 className="text-2xl font-bold mb-2">Loading Weather Data</h2>
          <p className="text-white/80">Fetching data for {locationName}...</p>
        </div>
      </div>;
  }
  ;
  return <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-600">
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
            <p className="text-white text-base">
              🌦️ Weather data from Open-Meteo API for coordinates. Built by Jennifer Lin.
            </p>
          </div>
        </div>
      </div>
    </div>;
};

export default Index;
