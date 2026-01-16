import { useState, useEffect } from 'react';
import { SocialMediaCharts } from '../components/SocialMediaCharts';
import { PopularDestinations } from '../components/PopularDestinations';
import { EventsTimeline } from '../components/EventsTimeline';
import { AccommodationStats } from '../components/AccommodationStats';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { SentimentComparison } from '../components/SentimentComparison';
import { RestaurantVendors } from '../components/RestaurantVendors';
import AccommodationSearch from '../pages/accommodation/AccommodationSearch';
import { Link, useSearchParams } from 'react-router-dom';
import { CitySelector } from '../components/CitySelector';

export default function TourismDashboard() {
  // NEW FLOW VERIFICATION - Remove after confirming
  console.log('NEW FLOW ACTIVE - TourismDashboard.tsx');
  
  const [searchParams] = useSearchParams();
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCity, setSelectedCity] = useState('all');
  const [activeTab, setActiveTab] = useState('destinations');
  // Force rebuild for color scheme update

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
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F7F9FC' }}>
      {/* Header - Fixed */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 shadow-lg z-50">
        {/* Top bar: Logo + Nav + Filters */}
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-white text-base sm:text-xl md:text-2xl font-bold">Kedah Tourism</h1>
            
            {/* Right side: Nav Links + Filters */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Nav Links */}
              <Link to="/" className="text-[10px] sm:text-xs md:text-sm text-slate-300 hover:text-teal-400 font-medium">🏠 Home</Link>
              <Link to="/business" className="text-[10px] sm:text-xs md:text-sm text-slate-300 hover:text-teal-400 hidden sm:inline">💼 Business</Link>
              <Link to="/sign-in" className="text-[10px] sm:text-xs md:text-sm text-teal-400 font-medium hover:text-teal-300">🔑 Sign In</Link>
              
              {/* Divider */}
              <span className="hidden sm:inline text-slate-600">|</span>
              
              {/* Filters */}
              <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-slate-600 bg-slate-800 text-slate-200 rounded px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs md:text-sm"
              >
                <option value="week">7D</option>
                <option value="month">30D</option>
                <option value="quarter">3M</option>
                <option value="year">1Y</option>
              </select>
              <span className="bg-teal-500 text-white text-[9px] sm:text-xs px-1.5 py-0.5 rounded font-medium">Live</span>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation - Professional */}
        <div className="w-full bg-white border-t border-slate-200 pb-2">
          <div className="container mx-auto px-2 sm:px-4 md:px-6 py-2 md:py-3">
            <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
              {[
                { id: 'destinations', label: '🗺️ Places' },
                { id: 'restaurants', label: '🍽️ Food' },
                { id: 'accommodation', label: '🏨 Stay' },
                { id: 'events', label: '📅 Events' },
                { id: 'overview', label: '📊 Overview' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'text-white border-none shadow-sm'
                      : 'bg-transparent border-none hover:text-slate-900'
                  }`}
                  style={activeTab === tab.id ? {
                    backgroundColor: '#2563EB',
                    borderRadius: '10px'
                  } : {
                    backgroundColor: 'transparent',
                    color: '#64748B'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable Area */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8 h-full">
          {activeTab === 'overview' && (
            <div className="space-y-6 h-full overflow-y-auto">
              <div className="flex flex-col gap-6">
                {/* Most Visited & Least Visited Places - NEW */}
                <SentimentComparison />
                <SocialMediaCharts selectedCity={selectedCity} timeRange={timeRange} />
                <SentimentAnalysis selectedCity={selectedCity} timeRange={timeRange} />
                <AccommodationStats selectedCity={selectedCity} timeRange={timeRange} />
              </div>
            </div>
          )}

          {activeTab === 'destinations' && (
            <div className="h-full">
              <PopularDestinations selectedCity={selectedCity} timeRange={timeRange} />
            </div>
          )}

          {activeTab === 'restaurants' && (
            <RestaurantVendors selectedCity={selectedCity} timeRange={timeRange} />
          )}

          {activeTab === 'accommodation' && (
            <AccommodationSearch />
          )}

          {activeTab === 'events' && (
            <EventsTimeline selectedCity={selectedCity} timeRange={timeRange} />
          )}
        </div>
      </main>
      
      {/* ✅ NEW UI ACTIVE MARKER - Remove after confirming */}
      <div className="fixed bottom-2 right-2 bg-green-600 text-white px-3 py-1 text-xs rounded-full shadow-lg z-[99999]">
        ✅ NEW UI v2.0 - Jan 16
      </div>
    </div>
  );
}
