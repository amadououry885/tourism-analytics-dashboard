import { useState, useEffect } from 'react';
import { OverviewMetrics } from '../components/OverviewMetrics';
import { SocialMediaCharts } from '../components/SocialMediaCharts';
import { PopularDestinations } from '../components/PopularDestinations';
import { TransportAnalytics } from '../components/TransportAnalytics';
import { EventsTimeline } from '../components/EventsTimeline';
import { AccommodationStats } from '../components/AccommodationStats';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { RestaurantVendors } from '../components/RestaurantVendors';
import AccommodationSearch from '../pages/accommodation/AccommodationSearch';
import { Link, useSearchParams } from 'react-router-dom';
import { CitySelector } from '../components/CitySelector';

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
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-50">
        {/* Top bar: Logo + Nav + Filters */}
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-gray-900 text-base sm:text-xl md:text-2xl font-bold">Kedah Tourism</h1>
            
            {/* Right side: Nav Links + Filters */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Nav Links */}
              <Link to="/" className="text-[10px] sm:text-xs md:text-sm text-gray-700 hover:text-blue-600 font-medium">🏠 Home</Link>
              <Link to="/business" className="text-[10px] sm:text-xs md:text-sm text-gray-700 hover:text-blue-600 hidden sm:inline">💼 Business</Link>
              <Link to="/sign-in" className="text-[10px] sm:text-xs md:text-sm text-blue-600 font-medium">🔑 Sign In</Link>
              
              {/* Divider */}
              <span className="hidden sm:inline text-gray-300">|</span>
              
              {/* Filters */}
              <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs md:text-sm"
              >
                <option value="week">7D</option>
                <option value="month">30D</option>
                <option value="quarter">3M</option>
                <option value="year">1Y</option>
              </select>
              <span className="bg-green-100 text-green-700 text-[9px] sm:text-xs px-1.5 py-0.5 rounded font-medium">Live</span>
            </div>
          </div>
        </div>
        
        {/* Overview Metrics */}
        <div className="bg-white border-t border-gray-100">
          <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
            <OverviewMetrics selectedCity={selectedCity} timeRange={timeRange} />
          </div>
        </div>
        
        {/* Tabs Navigation - BIGGER */}
        <div className="w-full bg-white border-t border-gray-100 pb-2">
          <div className="container mx-auto px-2 sm:px-4 md:px-6 py-2 md:py-3">
            <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
              {[
                { id: 'overview', label: '📊 Overview' },
                { id: 'destinations', label: '🗺️ Places' },
                { id: 'restaurants', label: '🍽️ Food' },
                { id: 'accommodation', label: '🏨 Stay' },
                { id: 'transport', label: '🚌 Transport' },
                { id: 'events', label: '📅 Events' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full border px-4 sm:px-5 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
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
            <RestaurantVendors selectedCity={selectedCity} timeRange={timeRange} />
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
        </div>
      </main>
    </div>
  );
}
