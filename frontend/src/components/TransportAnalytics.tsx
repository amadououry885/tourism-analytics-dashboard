import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Car, Train, Plane, Ship, Bike, Bus, ArrowRight, Clock, DollarSign, Calendar, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import axios from 'axios';

// Types and Interfaces
type TransportMode = {
  name: string;
  value: number;
  percentage: number;
  icon: LucideIcon;
  color: string;
  growth: string;
};

type MonthlyUsage = {
  month: string;
  flight: number;
  car: number;
  bus: number;
  ferry: number;
};

type PopularRoute = {
  route: string;
  trips: number;
  avgDuration: string;
  mode: string;
};

type RouteOption = {
  id: number;
  provider: string;
  transport_mode: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  currency: string;
  duration?: string;
};

type RouteSearchResult = {
  from: string;
  to: string;
  route_type: string;
  options: RouteOption[];
};

type TransportAnalyticsProps = {
  selectedCity?: string;
};

// Initial Data
const initialTransportModes: TransportMode[] = [
  { name: 'Flight', value: 385000, percentage: 38.5, icon: Plane, color: '#3b82f6', growth: '+12.3%' },
  { name: 'Car/Taxi', value: 295000, percentage: 29.5, icon: Car, color: '#10b981', growth: '+8.7%' },
  { name: 'Bus', value: 145000, percentage: 14.5, icon: Bus, color: '#f59e0b', growth: '+5.2%' },
  { name: 'Ferry', value: 98000, percentage: 9.8, icon: Ship, color: '#8b5cf6', growth: '+15.8%' },
  { name: 'Train', value: 52000, percentage: 5.2, icon: Train, color: '#ec4899', growth: '+3.1%' },
  { name: 'Motorcycle', value: 25000, percentage: 2.5, icon: Bike, color: '#06b6d4', growth: '+6.4%' },
];

const initialMonthlyUsage: MonthlyUsage[] = [
  { month: 'Jan', flight: 32000, car: 24000, bus: 12000, ferry: 8000 },
  { month: 'Feb', flight: 35000, car: 26000, bus: 13000, ferry: 8500 },
  { month: 'Mar', flight: 38000, car: 28000, bus: 14000, ferry: 9000 },
  { month: 'Apr', flight: 42000, car: 31000, bus: 15000, ferry: 10000 },
  { month: 'May', flight: 45000, car: 33000, bus: 16000, ferry: 11000 },
  { month: 'Jun', flight: 48000, car: 35000, bus: 17000, ferry: 12000 },
];

const initialPopularRoutes: PopularRoute[] = [
  { route: 'KL → Langkawi', trips: 125000, avgDuration: '1h 15m', mode: 'Flight' },
  { route: 'Penang → Langkawi', trips: 87000, avgDuration: '2h 45m', mode: 'Ferry' },
  { route: 'Alor Setar → Langkawi', trips: 65000, avgDuration: '1h 30m', mode: 'Car' },
  { route: 'Butterworth → Alor Setar', trips: 52000, avgDuration: '1h 45m', mode: 'Train' },
  { route: 'Sungai Petani → Langkawi', trips: 38000, avgDuration: '2h 15m', mode: 'Bus' },
];

// Kedah places
const kedahPlaces = [
  'Langkawi', 'Alor Setar', 'Sungai Petani', 'Kulim', 'Jitra', 
  'Kuala Kedah', 'Pendang', 'Baling', 'Padang Serai'
];

// Outside Kedah places
const outsidePlaces = [
  'Kuala Lumpur', 'Penang', 'Ipoh', 'Johor Bahru', 'Singapore',
  'Butterworth', 'Georgetown', 'Hat Yai', 'Bangkok'
];

const allPlaces = [...kedahPlaces, ...outsidePlaces].sort();

const routeTypeLabels = {
  'intra_kedah': { label: 'Intra-Kedah', color: 'bg-blue-500', description: 'Travel within Kedah' },
  'coming_to_kedah': { label: 'Coming to Kedah', color: 'bg-green-500', description: 'From outside to Kedah' },
  'leaving_kedah': { label: 'Leaving Kedah', color: 'bg-orange-500', description: 'From Kedah to outside' },
};

const getTransportIcon = (mode: string): LucideIcon => {
  const lowerMode = mode.toLowerCase();
  if (lowerMode.includes('flight') || lowerMode.includes('plane')) return Plane;
  if (lowerMode.includes('train')) return Train;
  if (lowerMode.includes('bus')) return Bus;
  if (lowerMode.includes('ferry') || lowerMode.includes('boat')) return Ship;
  if (lowerMode.includes('bike') || lowerMode.includes('motorcycle')) return Bike;
  return Car; // default for taxi, car, grab
};

const getTransportColor = (mode: string): string => {
  const lowerMode = mode.toLowerCase();
  if (lowerMode.includes('flight') || lowerMode.includes('plane')) return '#3b82f6';
  if (lowerMode.includes('train')) return '#ec4899';
  if (lowerMode.includes('bus')) return '#f59e0b';
  if (lowerMode.includes('ferry') || lowerMode.includes('boat')) return '#8b5cf6';
  if (lowerMode.includes('bike') || lowerMode.includes('motorcycle')) return '#06b6d4';
  return '#10b981'; // default for taxi, car, grab
};

export const TransportAnalytics: React.FC<TransportAnalyticsProps> = ({ selectedCity }) => {
  const [transportModes, setTransportModes] = useState<TransportMode[]>(initialTransportModes);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage[]>(initialMonthlyUsage);
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>(initialPopularRoutes);
  const [loading, setLoading] = useState(false);

  // Route search states
  const [fromPlace, setFromPlace] = useState('');
  const [toPlace, setToPlace] = useState('');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [routeTypeFilter, setRouteTypeFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<RouteOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [detectedRouteType, setDetectedRouteType] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [modesRes, monthlyRes, routesRes] = await Promise.all([
          axios.get('/api/transport/analytics/transport-modes/'),
          axios.get('/api/transport/analytics/monthly-usage/'),
          axios.get('/api/transport/analytics/popular-routes/')
        ]);
        console.log('Transport API data:', { modesRes, monthlyRes, routesRes });
      } catch (err) {
        console.error('Error fetching transport data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCity]);

  // Detect route type based on selected places
  useEffect(() => {
    if (fromPlace && toPlace) {
      const fromInKedah = kedahPlaces.includes(fromPlace);
      const toInKedah = kedahPlaces.includes(toPlace);

      if (fromInKedah && toInKedah) {
        setDetectedRouteType('intra_kedah');
      } else if (!fromInKedah && toInKedah) {
        setDetectedRouteType('coming_to_kedah');
      } else if (fromInKedah && !toInKedah) {
        setDetectedRouteType('leaving_kedah');
      } else {
        setDetectedRouteType('');
      }
    }
  }, [fromPlace, toPlace]);

  const handleSearch = async () => {
    if (!fromPlace || !toPlace) {
      alert('Please select both origin and destination');
      return;
    }

    if (fromPlace === toPlace) {
      alert('Origin and destination cannot be the same');
      return;
    }

    try {
      setSearching(true);
      setShowResults(true);
      
      const response = await axios.get('/api/transport/search/', {
        params: {
          from: fromPlace,
          to: toPlace,
          date: travelDate,
        }
      });

      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching routes:', err);
      // For demo, show empty results
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const renderIcon = (IconComponent: LucideIcon) => (
    <div className="p-2 rounded-lg bg-muted">
      <IconComponent className="w-4 h-4" />
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]">Loading transport analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Route Search Section */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Route Planner & Search
          </CardTitle>
          <CardDescription>Find the best transport options for your journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <select
                value={fromPlace}
                onChange={(e) => setFromPlace(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select origin</option>
                {allPlaces.map(place => (
                  <option key={place} value={place}>
                    {place} {kedahPlaces.includes(place) ? '(Kedah)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Arrow */}
            <div className="flex items-end justify-center pb-2">
              <ArrowRight className="w-6 h-6 text-primary" />
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <select
                value={toPlace}
                onChange={(e) => setToPlace(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select destination</option>
                {allPlaces.map(place => (
                  <option key={place} value={place}>
                    {place} {kedahPlaces.includes(place) ? '(Kedah)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Travel Date</label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={searching || !fromPlace || !toPlace}
                className="w-full"
              >
                {searching ? 'Searching...' : 'Search Routes'}
              </Button>
            </div>
          </div>

          {/* Route Type Badge */}
          {detectedRouteType && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Route Type:</span>
              <Badge className={`${routeTypeLabels[detectedRouteType as keyof typeof routeTypeLabels].color} text-white`}>
                {routeTypeLabels[detectedRouteType as keyof typeof routeTypeLabels].label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {routeTypeLabels[detectedRouteType as keyof typeof routeTypeLabels].description}
              </span>
            </div>
          )}

          {/* Search Results */}
          {showResults && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold">
                {searchResults.length > 0 
                  ? `Available Options (${fromPlace} → ${toPlace})`
                  : 'No routes found'
                }
              </h3>
              
              {searchResults.length === 0 && !searching && (
                <p className="text-sm text-muted-foreground">
                  No transport options available for this route. Try different locations or dates.
                </p>
              )}

              {searchResults.map((option, index) => {
                const Icon = getTransportIcon(option.transport_mode);
                const color = getTransportColor(option.transport_mode);
                
                return (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium capitalize">{option.transport_mode}</h4>
                            <p className="text-sm text-muted-foreground">{option.provider}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {option.currency} {option.price}
                            </p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{option.departure_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span>{option.arrival_time}</span>
                          </div>
                          {option.duration && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{option.duration}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transport Mode Distribution */}
        <Card className="col-span-1 row-span-2">
          <CardHeader>
            <CardTitle>Transport Mode Distribution</CardTitle>
            <CardDescription>Share of different transport modes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transportModes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                  >
                    {transportModes.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-4">
              {transportModes.map((mode) => (
                <div key={mode.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderIcon(mode.icon)}
                    <span className="font-medium">{mode.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{mode.percentage}%</Badge>
                    <span className="text-sm text-green-600">{mode.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Usage */}
        <Card className="col-span-1 row-span-2">
          <CardHeader>
            <CardTitle>Monthly Usage Trends</CardTitle>
            <CardDescription>Usage patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="flight" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="car" stroke="#10b981" />
                  <Line type="monotone" dataKey="bus" stroke="#f59e0b" />
                  <Line type="monotone" dataKey="ferry" stroke="#8b5cf6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Routes */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Popular Routes</CardTitle>
            <CardDescription>Most traveled routes and their metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularRoutes.map((route) => (
                <div
                  key={route.route}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{route.route}</h3>
                    <Badge>{route.mode}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ArrowRight className="w-4 h-4" />
                      <span>{route.trips.toLocaleString()} trips</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{route.avgDuration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransportAnalytics;
