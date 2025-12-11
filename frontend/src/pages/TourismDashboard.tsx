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
import { CitySelector } from '../components/CitySelector';
import { Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky with solid background */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg">
        <div className="w-full bg-white">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4 bg-white">
            <div className="flex items-center justify-between">
              {/* Logo and Title */}
              <div className="flex-1 min-w-0">
                <h1 className="text-gray-900 mb-0.5 md:mb-1 text-lg sm:text-xl md:text-2xl font-bold truncate">
                  Kedah Tourism
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  Real-time insights and metrics
                </p>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2 xl:gap-4">
                <Link
                  to="/"
                  className="px-3 xl:px-6 py-2 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4 xl:w-5 xl:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-bold text-sm xl:text-base">Dashboard</span>
                </Link>
                <Link
                  to="/business"
                  className="px-3 xl:px-4 py-2 text-xs xl:text-sm bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  For Business
                </Link>
                <Link
                  to="/sign-in"
                  className="px-3 xl:px-4 py-2 text-xs xl:text-sm bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  Sign In
                </Link>
                <CitySelector 
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white text-gray-900 border border-gray-300 rounded-lg px-2 xl:px-4 py-2 text-xs xl:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">7 Days</option>
                  <option value="month">30 Days</option>
                  <option value="quarter">3 Months</option>
                  <option value="year">Year</option>
                </select>
                <Badge className="bg-green-500/30 text-green-800 border-green-400/30">Live</Badge>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex lg:hidden items-center gap-2">
                <Badge className="bg-green-500/30 text-green-800 border-green-400/30 text-xs">Live</Badge>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="container mx-auto px-3 py-4 space-y-3">
              {/* Navigation Links */}
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/"
                  className="flex-1 min-w-[calc(50%-4px)] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center font-medium text-sm hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🏠 Dashboard
                </Link>
                <Link
                  to="/business"
                  className="flex-1 min-w-[calc(50%-4px)] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center font-medium text-sm hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  💼 Business
                </Link>
                <Link
                  to="/sign-in"
                  className="flex-1 min-w-[calc(50%-4px)] px-4 py-3 bg-blue-600 text-white rounded-lg text-center font-medium text-sm hover:bg-blue-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔑 Sign In
                </Link>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">City</label>
                  <CitySelector 
                    selectedCity={selectedCity}
                    onCityChange={(city) => {
                      setSelectedCity(city);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Time Range</label>
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Overview Metrics */}
        <div className="w-full bg-white border-t border-gray-100">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4 bg-white">
            <OverviewMetrics selectedCity={selectedCity} timeRange={timeRange} />
          </div>
        </div>
        
        {/* Tabs Navigation - Horizontal scroll on mobile */}
        <div className="w-full bg-white border-t border-gray-100 pb-2">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 md:py-4 bg-white">
            <div className="flex gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent -mx-3 px-3 sm:mx-0 sm:px-0">
              {[
                { id: 'overview', label: '📊 Overview', shortLabel: '📊Overview' },
                { id: 'destinations', label: '🗺️ Destinations', shortLabel: '🗺️Places' },
                { id: 'restaurants', label: '🍽️ Restaurants', shortLabel: '🍽️Restau' },
                { id: 'accommodation', label: '🏨 Book Stay', shortLabel: '🏨Stay' },
                { id: 'transport', label: '🚌 Transport', shortLabel: '🚌Trans' },
                { id: 'events', label: '📅 Events', shortLabel: '📅Events' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full border px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 text-[11px] sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">{tab.shortLabel}</span>
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
