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
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Top bar: Logo + Filters */}
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-gray-900 text-base sm:text-xl font-bold">Kedah Tourism</h1>
            
            {/* Right side: Filters */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded px-1.5 py-1 text-[10px] sm:text-xs"
              >
                <option value="week">7D</option>
                <option value="month">30D</option>
                <option value="quarter">3M</option>
                <option value="year">1Y</option>
              </select>
              <span className="bg-green-100 text-green-700 text-[9px] sm:text-xs px-1.5 py-0.5 rounded font-medium hidden sm:inline">Live</span>
            </div>
          </div>
        </div>

        {/* Nav bar: Links (responsive) */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="container mx-auto px-2 sm:px-4 py-1.5 flex justify-center gap-3 sm:gap-6">
            <Link to="/" className="text-xs sm:text-sm text-gray-700 hover:text-blue-600 font-medium">🏠 Home</Link>
            <Link to="/business" className="text-xs sm:text-sm text-gray-700 hover:text-blue-600">💼 Business</Link>
            <Link to="/sign-in" className="text-xs sm:text-sm text-blue-600 font-medium">🔑 Sign In</Link>
          </div>
        </div>
        
        {/* Overview Metrics */}
        <div className="bg-white border-t border-gray-100">
          <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
            <OverviewMetrics selectedCity={selectedCity} timeRange={timeRange} />
          </div>
        </div>
        
        {/* Tabs Navigation - Horizontal scroll on mobile */}
        <div className="w-full bg-white border-t border-gray-100 pb-2">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 md:py-4 bg-white">
            <div className="flex gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent -mx-3 px-3 sm:mx-0 sm:px-0">
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
                  className={`rounded-full border px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
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
