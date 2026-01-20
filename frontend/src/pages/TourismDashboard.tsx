import { useState, useEffect } from 'react';
import { SocialMediaCharts } from '../components/SocialMediaCharts';
import { PopularDestinations } from '../components/PopularDestinations';
import { EventsTimeline } from '../components/EventsTimeline';
import { AccommodationStats } from '../components/AccommodationStats';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { SentimentComparison } from '../components/SentimentComparison';
import { RestaurantVendors } from '../components/RestaurantVendors';
import { AnalyticsOverview } from '../components/AnalyticsOverview';
import AccommodationSearch from '../pages/accommodation/AccommodationSearch';
import { Link, useSearchParams } from 'react-router-dom';
import { CitySelector } from '../components/CitySelector';
import { BarChart3, Home, Search, Briefcase, Key } from 'lucide-react';

export default function TourismDashboard() {
  const [searchParams] = useSearchParams();
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCity, setSelectedCity] = useState('all');
  const [activeTab, setActiveTab] = useState('destinations');

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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-50">
        {/* Top bar: Logo + Nav + Filters */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-gray-900 text-xl md:text-2xl font-bold hover:text-primary transition no-underline">Kedah Tourism</Link>
            
            {/* Right side: Nav Links + Filters */}
            <div className="flex items-center gap-4">
              {/* Nav Links */}
              <Link to="/" className="text-sm text-gray-600 hover:text-primary font-medium flex items-center gap-1 no-underline"><Home size={16} /> Home</Link>
              <Link to="/explore" className="text-sm text-gray-600 hover:text-primary font-medium flex items-center gap-1 no-underline"><Search size={16} /> Explore</Link>
              <Link to="/register" className="text-sm text-gray-600 hover:text-primary hidden sm:inline-flex items-center gap-1 no-underline"><Briefcase size={16} /> Business</Link>
              <Link to="/sign-in" className="text-sm text-gray-600 hover:text-primary font-medium flex items-center gap-1 no-underline"><Key size={16} /> Sign In</Link>
              
              {/* Divider */}
              <span className="hidden sm:inline text-gray-300">|</span>
              
              {/* Filters */}
              <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 bg-white text-gray-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="week">7D</option>
                <option value="month">30D</option>
                <option value="quarter">3M</option>
                <option value="year">1Y</option>
              </select>
              <span className="bg-green-100 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation - Professional */}
        <div className="w-full bg-white border-t border-gray-100 pb-0">
          <div className="container mx-auto px-4 pt-1">
            <div className="flex gap-6 overflow-x-auto">
              {[
                { id: 'destinations', label: 'Places', icon: '🗺️' },
                { id: 'restaurants', label: 'Food', icon: '🍽️' },
                { id: 'accommodation', label: 'Stay', icon: '🏨' },
                { id: 'events', label: 'Events', icon: '📅' },
                { id: 'overview', label: 'Overview', icon: '📊' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-1 py-3 text-base font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable Area */}
      <main className="flex-1 overflow-hidden bg-gray-50/50">
        <div className="container mx-auto px-4 py-6 h-full">
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
              <AnalyticsOverview selectedCity={selectedCity} timeRange={timeRange} />
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
    </div>
  );
}
