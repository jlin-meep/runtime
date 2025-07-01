
import React, { useState, useEffect } from 'react';
import BestTimeCard from '../components/BestTimeCard';
import WeatherCard from '../components/WeatherCard';
import ComparisonCard from '../components/ComparisonCard';
import Map from '../components/Map';
import { getCurrentWeather, getHourlyWeatherData, getComparisonData } from '../utils/weatherService';

const Index = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get Mapbox token from localStorage
  const mapboxToken = localStorage.getItem('mapbox_token') || '';

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        console.log('Loading real weather data from NWS...');
        
        const [current, hourly, comparison] = await Promise.all([
          getCurrentWeather(),
          getHourlyWeatherData(),
          getComparisonData()
        ]);
        
        setCurrentWeather(current);
        setHourlyData(hourly);
        setComparisonData(comparison);
        
        console.log('Weather data loaded successfully');
      } catch (error) {
        console.error('Error loading weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🌤️</div>
          <h2 className="text-2xl font-bold mb-2">Loading Real Weather Data</h2>
          <p className="text-white/80">Fetching data from National Weather Service...</p>
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
            Real-time weather data from National Weather Service
          </p>
        </div>

        <div className="grid gap-8 max-w-6xl mx-auto">
          {/* Best Time Section */}
          <div className="col-span-full">
            <BestTimeCard hourlyData={hourlyData} />
          </div>

          {/* Weather Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {currentWeather && (
              <WeatherCard 
                title="Current Conditions (NWS)"
                data={currentWeather}
              />
            )}
            
            {comparisonData && (
              <ComparisonCard data={comparisonData} />
            )}
          </div>

          {/* Map Section */}
          <div className="col-span-full">
            <Map mapboxToken={mapboxToken} />
          </div>

          {/* Additional Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <p className="text-white/90 text-sm mb-2">
              🌦️ Real-time weather data from National Weather Service stations near NOPA, San Francisco
            </p>
            <p className="text-white/70 text-xs">
              Recommendations based on current conditions and hourly forecasts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
