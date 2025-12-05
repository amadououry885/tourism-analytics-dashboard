import { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../components/ui/badge';
import { OverviewMetrics } from '../components/OverviewMetrics';
import { SocialMediaCharts } from '../components/SocialMediaCharts';
import { PopularDestinations } from '../components/PopularDestinations';
import { TransportAnalytics } from '../components/TransportAnalytics';
import { EventsTimeline } from '../components/EventsTimeline';
import { AccommodationStats } from '../components/AccommodationStats';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { RestaurantVendors } from '../components/RestaurantVendors';
import MapView from '../components/MapView';
import AccommodationSearch from '../pages/accommodation/AccommodationSearch';
import { Link, useSearchParams } from 'react-router-dom';
import { CitySelector } from '../components/CitySelector'; // ✅ Import CitySelector

interface City {
  id: number;
  name: string;
  slug: string;
}

export default function TourismDashboard() {
  const [searchParams] = useSearchParams();
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCity, setSelectedCity] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // ✨ Read URL parameters and switch tabs automatically
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const cityParam = searchParams.get('city');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    if (cityParam && cityParam !== 'all') {
      setSelectedCity(cityParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky with solid background */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg">
        <div className="w-full bg-white">
          <div className="container mx-auto px-6 py-4 bg-white">
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 mb-1 text-2xl font-bold">Kedah Tourism Analytics</h1>
              <p className="text-gray-600 text-sm">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="px-6 py-2.5 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-bold text-base">Dashboard</span>
              </Link>
              <Link
                to="/business"
                className="px-4 py-2 text-sm bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              >
                For Business
              </Link>
              <Link
                to="/sign-in"
                className="px-4 py-2 text-sm bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              >
                Sign In
              </Link>
              {/* ✅ Replace the basic select with the advanced CitySelector component */}
              <CitySelector 
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
              />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week" className="text-gray-900">Last 7 Days</option>
                <option value="month" className="text-gray-900">Last 30 Days</option>
                <option value="quarter" className="text-gray-900">Last 3 Months</option>
                <option value="year" className="text-gray-900">Last Year</option>
              </select>
              <Badge className="bg-green-500/30 text-green-100 border-green-400/30">Live</Badge>
            </div>
          </div>
        </div>
        </div>
        
        {/* Overview Metrics */}
        <div className="w-full bg-white border-t border-gray-100">
          <div className="container mx-auto px-6 py-4 bg-white">
            <OverviewMetrics selectedCity={selectedCity} timeRange={timeRange} />
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="w-full bg-white border-t border-gray-100 pb-2">
          <div className="container mx-auto px-6 py-4 bg-white">
            <div className="flex gap-3 flex-wrap justify-start">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-full border px-6 py-2 text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`rounded-full border px-6 py-2 text-sm transition-all ${
                activeTab === 'destinations'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              Destinations
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`rounded-full border px-6 py-2 text-sm transition-all ${
                activeTab === 'restaurants'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setActiveTab('accommodation')}
              className={`rounded-full border px-6 py-2 text-sm transition-all ${
                activeTab === 'accommodation'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              Book Stay
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className={`rounded-full border px-6 py-2 text-sm transition-all ${
                activeTab === 'transport'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              Transport
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`rounded-full border px-6 py-2 text-sm transition-all ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              Events
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-6">
              <SocialMediaCharts selectedCity={selectedCity} timeRange={timeRange} />
              <SentimentAnalysis selectedCity={selectedCity} timeRange={timeRange} />
              <AccommodationStats selectedCity={selectedCity} timeRange={timeRange} />
            </div>
          </div>
        )}

        {activeTab === 'destinations' && (
          <PopularDestinations selectedCity={selectedCity} timeRange={timeRange} />
        )}

        {activeTab === 'restaurants' && (
          <div className="h-[calc(100vh-200px)]">
            <RestaurantVendors selectedCity={selectedCity} timeRange={timeRange} />
          </div>
        )}

        {activeTab === 'accommodation' && (
          <AccommodationSearch />
        )}

        {activeTab === 'transport' && (
          <TransportAnalytics selectedCity={selectedCity} />
        )}

        {activeTab === 'events' && (
          <EventsTimeline selectedCity={selectedCity} timeRange={timeRange} />
        )}
      </main>
    </div>
  );
}
