
import React, { useState, useEffect } from 'react';
import BestTimeCard from '../components/BestTimeCard';
import WeatherCard from '../components/WeatherCard';
import ComparisonCard from '../components/ComparisonCard';
import Map from '../components/Map';
import { getCurrentWeather, getHourlyWeatherData, getComparisonData, updateWeatherLocation } from '../utils/weatherService';

const Index = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([-122.4364, 37.7751]); // Default NOPA
  const [locationName, setLocationName] = useState('NOPA, San Francisco');
  
  // Get Mapbox token from localStorage
  const mapboxToken = localStorage.getItem('mapbox_token') || '';

  const reverseGeocode = async (coordinates: [number, number]): Promise<string> => {
    if (!mapboxToken) return 'Unknown Location';
    
    try {
      const [lng, lat] = coordinates;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=neighborhood,locality,place`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Try to get neighborhood first, then locality
        const neighborhood = data.features.find(f => f.place_type.includes('neighborhood'));
        const locality = data.features.find(f => f.place_type.includes('locality'));
        
        if (neighborhood) {
          return neighborhood.text + (locality ? `, ${locality.text}` : '');
        } else if (locality) {
          return locality.place_name;
        } else {
          return data.features[0].place_name;
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    
    return 'Unknown Location';
  };

  const loadWeatherData = async (isLocationChange = false) => {
    try {
      console.log('Loading weather data for location:', locationName, userLocation);
      
      // Only show weather loading for location changes after initial load
      if (isLocationChange && !loading) {
        setWeatherLoading(true);
      }
      
      // Update weather service location
      updateWeatherLocation(userLocation);
      
      const [current, hourly, comparison] = await Promise.all([
        getCurrentWeather(),
        getHourlyWeatherData(),
        getComparisonData()
      ]);
      
      setCurrentWeather(current);
      setHourlyData(hourly);
      setComparisonData(comparison);
      
      console.log('Weather data loaded successfully for:', locationName);
    } catch (error) {
      console.error('Error loading weather data:', error);
    } finally {
      setLoading(false);
      setWeatherLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadWeatherData();
  }, []);

  // Reload weather data when location changes (but don't reset loading state)
  useEffect(() => {
    if (!loading) { // Only reload if we're not in initial loading state
      loadWeatherData(true);
    }
  }, [userLocation]);

  const handleLocationChange = async (coordinates: [number, number], address?: string) => {
    console.log('Location change requested:', coordinates, address);
    setUserLocation(coordinates);
    
    // Update location name
    if (address) {
      setLocationName(address);
    } else {
      // Use reverse geocoding to get location name
      const geocodedName = await reverseGeocode(coordinates);
      setLocationName(geocodedName);
    }
    
    console.log('Location updated:', coordinates, address || await reverseGeocode(coordinates));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🌤️</div>
          <h2 className="text-2xl font-bold mb-2">Loading Weather Data</h2>
          <p className="text-white/80">Fetching data for {locationName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🏃‍♂️ NOPA Runner
          </h1>
          <p className="text-white/80 text-lg">
            Weather data for {locationName}
            {weatherLoading && <span className="ml-2 text-yellow-300">• Updating...</span>}
          </p>
        </div>

        <div className="grid gap-8 max-w-6xl mx-auto">
          {/* Map Section - moved to top for better UX */}
          <div className="col-span-full">
            <Map 
              mapboxToken={mapboxToken} 
              onLocationChange={handleLocationChange}
              initialLocation={userLocation}
            />
          </div>

          {/* Best Time Section */}
          <div className="col-span-full">
            <BestTimeCard hourlyData={hourlyData} locationName={locationName} />
          </div>

          {/* Weather Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {currentWeather && (
              <WeatherCard 
                title="Current Conditions"
                data={currentWeather}
              />
            )}
            
            {comparisonData && (
              <ComparisonCard data={comparisonData} />
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <p className="text-white/90 text-sm mb-2">
              🌦️ Weather data from National Weather Service stations near your location
            </p>
            <p className="text-white/70 text-xs">
              Recommendations based on current conditions and hourly forecasts for {locationName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
