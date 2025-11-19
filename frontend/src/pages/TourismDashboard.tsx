import { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { OverviewMetrics } from '../components/OverviewMetrics';
import { SocialMediaCharts } from '../components/SocialMediaCharts';
import { PopularDestinations } from '../components/PopularDestinations';
import { TransportAnalytics } from '../components/TransportAnalytics';
import { EventsTimeline } from '../components/EventsTimeline';
import { AccommodationStats } from '../components/AccommodationStats';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { RestaurantVendors } from '../components/RestaurantVendors';
import MapView from '../components/MapView';
import { AccommodationBooking } from '../components/AccommodationBooking';
import { Link } from 'react-router-dom';
import { CitySelector } from '../components/CitySelector'; // ✅ Import CitySelector

interface City {
  id: number;
  name: string;
  slug: string;
}

export default function TourismDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCity, setSelectedCity] = useState('all');
  // We no longer need the 'cities' state here, as CitySelector handles it.

  // This useEffect is no longer needed as CitySelector fetches its own cities.
  /*
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8001/api/analytics/places/list/');
        setCities(response.data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);
  */

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 mb-1 text-2xl font-bold">Kedah Tourism Analytics</h1>
              <p className="text-gray-600 text-sm">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/business"
                className="px-4 py-2 text-sm bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              >
                For Business
              </Link>
              <Link
                to="/sign-in"
                className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
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
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Live</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Overview Metrics */}
        <OverviewMetrics selectedCity={selectedCity} timeRange={timeRange} />

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="bg-transparent border-0 p-0 gap-3 flex-wrap justify-start">
            <TabsTrigger 
              value="overview" 
              className="rounded-full border border-gray-300 bg-white px-6 py-2 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:border-blue-400 transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="destinations" 
              className="rounded-full border border-gray-300 bg-white px-6 py-2 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:border-blue-400 transition-all"
            >
              Destinations
            </TabsTrigger>
            <TabsTrigger 
              value="restaurants" 
              className="rounded-full border border-gray-300 bg-white px-6 py-2 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:border-blue-400 transition-all"
            >
              Restaurants
            </TabsTrigger>
            <TabsTrigger 
              value="accommodation" 
              className="rounded-full border border-gray-300 bg-white px-6 py-2 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:border-blue-400 transition-all"
            >
              Book Stay
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="rounded-full border border-gray-300 bg-white px-6 py-2 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:border-blue-400 transition-all"
            >
              Social Media
            </TabsTrigger>
            <TabsTrigger 
              value="transport" 
              className="rounded-full border border-gray-300 bg-white px-6 py-2 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:border-blue-400 transition-all"
            >
              Transport
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="rounded-full border border-gray-300 bg-white px-6 py-2 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:border-blue-400 transition-all"
            >
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SocialMediaCharts selectedCity={selectedCity} timeRange={timeRange} />
                  <SentimentAnalysis selectedCity={selectedCity} timeRange={timeRange} />
                </div>
                <AccommodationStats selectedCity={selectedCity} timeRange={timeRange} />
              </div>
              {/* MapView temporarily disabled due to React 18 compatibility issue */}
              {/* <MapView selectedCity={selectedCity} timeRange={timeRange} /> */}
            </div>
          </TabsContent>

          <TabsContent value="destinations" className="mt-6">
            <PopularDestinations selectedCity={selectedCity} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="restaurants" className="mt-6">
            <RestaurantVendors selectedCity={selectedCity} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="accommodation" className="mt-6">
            <AccommodationBooking selectedCity={selectedCity} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <SocialMediaCharts detailed selectedCity={selectedCity} timeRange={timeRange} />
              <SentimentAnalysis detailed selectedCity={selectedCity} timeRange={timeRange} />
            </div>
          </TabsContent>

          <TabsContent value="transport" className="mt-6">
            <TransportAnalytics selectedCity={selectedCity} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsTimeline selectedCity={selectedCity} timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
