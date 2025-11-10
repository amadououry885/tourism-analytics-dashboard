import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Users, 
  MessageSquare, 
  Heart, 
  Share2,
  Calendar,
  Building2,
  Car,
  Train,
  Plane
} from 'lucide-react';
import { OverviewMetrics } from './components/OverviewMetrics';
import { SocialMediaCharts } from './components/SocialMediaCharts';
import { PopularDestinations } from './components/PopularDestinations';
import { TransportAnalytics } from './components/TransportAnalytics';
import { EventsTimeline } from './components/EventsTimeline';
import { AccommodationStats } from './components/AccommodationStats';
import { SentimentAnalysis } from './components/SentimentAnalysis';
import { RestaurantVendors } from './components/RestaurantVendors';
import { MapView } from './components/MapView';
import { AccommodationBooking } from './components/AccommodationBooking';

export default function App() {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCity, setSelectedCity] = useState('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#1a3a5c]">
      {/* Header */}
      <header className="border-b border-blue-900/50 bg-[#0a1628]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white mb-1">Kedah Tourism Analytics</h1>
              <p className="text-blue-200/70 text-sm">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-blue-950/50 text-white border border-blue-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Cities</option>
                <option value="langkawi">Langkawi</option>
                <option value="alor-setar">Alor Setar</option>
                <option value="sungai-petani">Sungai Petani</option>
                <option value="kulim">Kulim</option>
                <option value="jitra">Jitra</option>
              </select>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-blue-950/50 text-white border border-blue-800/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <OverviewMetrics selectedCity={selectedCity} />

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="bg-blue-950/50 border border-blue-800/30 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Overview</TabsTrigger>
            <TabsTrigger value="destinations" className="data-[state=active]:bg-blue-600">Destinations</TabsTrigger>
            <TabsTrigger value="restaurants" className="data-[state=active]:bg-blue-600">Restaurants</TabsTrigger>
            <TabsTrigger value="accommodation" className="data-[state=active]:bg-blue-600">Book Stay</TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-blue-600">Social Media</TabsTrigger>
            <TabsTrigger value="transport" className="data-[state=active]:bg-blue-600">Transport</TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-blue-600">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SocialMediaCharts />
                  <SentimentAnalysis />
                </div>
                <AccommodationStats />
              </div>
              <MapView selectedCity={selectedCity} />
            </div>
          </TabsContent>

          <TabsContent value="destinations" className="mt-6">
            <PopularDestinations selectedCity={selectedCity} />
          </TabsContent>

          <TabsContent value="restaurants" className="mt-6">
            <RestaurantVendors selectedCity={selectedCity} />
          </TabsContent>

          <TabsContent value="accommodation" className="mt-6">
            <AccommodationBooking selectedCity={selectedCity} />
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <SocialMediaCharts detailed />
              <SentimentAnalysis detailed />
            </div>
          </TabsContent>

          <TabsContent value="transport" className="mt-6">
            <TransportAnalytics selectedCity={selectedCity} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsTimeline selectedCity={selectedCity} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
