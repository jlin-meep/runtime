
import React from 'react';
import BestTimeCard from '../components/BestTimeCard';
import WeatherCard from '../components/WeatherCard';
import ComparisonCard from '../components/ComparisonCard';
import { getCurrentWeather, getYesterdayWeather, getBestRunningTime, getComparisonData } from '../utils/weatherService';

const Index = () => {
  const currentWeather = getCurrentWeather();
  const yesterdayWeather = getYesterdayWeather();
  const bestTime = getBestRunningTime();
  const comparisonData = getComparisonData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🏃‍♂️ NOPA Runner
          </h1>
          <p className="text-white/80 text-lg">
            Your perfect running companion for San Francisco's NOPA neighborhood
          </p>
        </div>

        <div className="grid gap-8 max-w-6xl mx-auto">
          {/* Best Time Section */}
          <div className="col-span-full">
            <BestTimeCard 
              bestTime={bestTime.time}
              reason={bestTime.reason}
              conditions={bestTime.conditions}
            />
          </div>

          {/* Weather Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <WeatherCard 
              title="Current Conditions"
              data={currentWeather}
            />
            
            <ComparisonCard data={comparisonData} />
          </div>

          {/* Additional Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <p className="text-white/90 text-sm mb-2">
              📍 Weather data for NOPA, San Francisco
            </p>
            <p className="text-white/70 text-xs">
              Recommendations based on temperature, wind speed, cloud coverage, and UV index
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
