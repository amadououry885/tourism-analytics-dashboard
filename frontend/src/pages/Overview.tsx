import React, { useState, useEffect } from 'react';
import { CitySelector } from '../components/CitySelector';
import { HeaderNavTabs } from '../components/HeaderNavTabs';
import { PopularDestinations } from '../components/PopularDestinations';
import { KedahMap } from '../components/KedahMap'; // Import the Leaflet map component
import { SocialMediaCharts } from '../components/SocialMediaCharts';
import { OverviewMetrics } from '../components/OverviewMetrics';
import { SentimentComparison } from '../components/SentimentComparison';
import { MapPin, UtensilsCrossed, Hotel, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Overview: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('month');
  const [cities, setCities] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('places');
  const navigate = useNavigate();

  // ✅ FETCH ALL CITIES FROM PLACES API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Fetching cities from Places API...');

        // ✅ Use the main Places API to get all cities
        const response = await axios.get('/analytics/places/list/');
        const places = response.data;
        
        console.log('🏙️ Fetched places from analytics API:', places);
        
        // Extract city names from places
        const cityNames = places.map((place: any) => place.name).sort();
        
        console.log(`✅ Total cities found: ${cityNames.length}`, cityNames);
        setCities(cityNames);
        
      } catch (error) {
        console.error('❌ Error fetching cities:', error);
        // Fallback to default cities
        setCities(['Alor Setar', 'Jitra', 'Kulim', 'Langkawi', 'Sungai Petani']);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // ✅ FILTER CITIES BASED ON SEARCH TERM
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Header Section with Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Kedah Tourism Analytics</h1>
          <p className="text-slate-600">Real-time insights and performance metrics</p>
        </div>
        <HeaderNavTabs />
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div></div>
        <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Live
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <OverviewMetrics selectedCity={selectedCity} timeRange={timeRange} />

      {/* Sentiment Comparison Section - NEW SUPERVISOR FEATURE */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">NEW: Sentiment Analysis Dashboard</h2>
              <p className="text-sm text-blue-700 dark:text-blue-300">Compare visitor sentiment between most and least visited places</p>
            </div>
          </div>
        </div>
        <SentimentComparison />
      </div>

      {/* Navigation Tabs Container - Same style as metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8">
        <div className="flex items-center justify-between divide-x divide-gray-200">
          {/* Places Tab */}
          <button
            onClick={() => {
              setActiveTab('places');
              navigate('/?tab=destinations');
            }}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all hover:bg-gray-50 rounded-lg ${
              activeTab === 'places' ? 'bg-blue-50' : ''
            }`}
          >
            <div className={`flex items-center gap-2 ${activeTab === 'places' ? 'text-blue-600' : 'text-gray-600'}`}>
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Places</span>
            </div>
          </button>

          {/* Food Tab */}
          <button
            onClick={() => {
              setActiveTab('food');
              navigate('/?tab=restaurants');
            }}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all hover:bg-gray-50 rounded-lg ${
              activeTab === 'food' ? 'bg-blue-50' : ''
            }`}
          >
            <div className={`flex items-center gap-2 ${activeTab === 'food' ? 'text-blue-600' : 'text-gray-600'}`}>
              <UtensilsCrossed className="w-5 h-5" />
              <span className="font-medium">Food</span>
            </div>
          </button>

          {/* Stay Tab */}
          <button
            onClick={() => {
              setActiveTab('stay');
              navigate('/?tab=accommodation');
            }}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all hover:bg-gray-50 rounded-lg ${
              activeTab === 'stay' ? 'bg-blue-50' : ''
            }`}
          >
            <div className={`flex items-center gap-2 ${activeTab === 'stay' ? 'text-blue-600' : 'text-gray-600'}`}>
              <Hotel className="w-5 h-5" />
              <span className="font-medium">Stay</span>
            </div>
          </button>

          {/* Events Tab */}
          <button
            onClick={() => {
              setActiveTab('events');
              navigate('/?tab=events');
            }}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all hover:bg-gray-50 rounded-lg ${
              activeTab === 'events' ? 'bg-blue-50' : ''
            }`}
          >
            <div className={`flex items-center gap-2 ${activeTab === 'events' ? 'text-blue-600' : 'text-gray-600'}`}>
              <CalendarDays className="w-5 h-5" />
              <span className="font-medium">Events</span>
            </div>
          </button>

          {/* Overview Tab */}
          <button
            onClick={() => {
              setActiveTab('overview');
              navigate('/?tab=overview');
            }}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all hover:bg-gray-50 rounded-lg ${
              activeTab === 'overview' ? 'bg-blue-50' : ''
            }`}
          >
            <div className={`flex items-center gap-2 ${activeTab === 'overview' ? 'text-blue-600' : 'text-gray-600'}`}>
              <span className="text-lg">📊</span>
              <span className="font-medium">Overview</span>
            </div>
          </button>
        </div>
      </div>

      {/* Social Media Charts Section */}
      <div className="mb-8">
        <SocialMediaCharts detailed={false} selectedCity={selectedCity} timeRange={timeRange} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Main content */}
        <div className="lg:col-span-2">
          <PopularDestinations selectedCity={selectedCity} />
        </div>
        
        {/* Right side - Map */}
        <div className="lg:col-span-1">
          <KedahMap selectedCity={selectedCity} />
        </div>
      </div>
    </div>
  );
};

export default Overview;