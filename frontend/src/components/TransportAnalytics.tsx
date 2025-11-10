import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Car, Train, Plane, Ship, Bike, Bus, ArrowRight, Clock, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

interface TransportAnalyticsProps {
  selectedCity: string;
}

const transportModes = [
  { name: 'Flight', value: 385000, percentage: 38.5, icon: Plane, color: '#3b82f6', growth: '+12.3%' },
  { name: 'Car/Taxi', value: 295000, percentage: 29.5, icon: Car, color: '#10b981', growth: '+8.7%' },
  { name: 'Bus', value: 145000, percentage: 14.5, icon: Bus, color: '#f59e0b', growth: '+5.2%' },
  { name: 'Ferry', value: 98000, percentage: 9.8, icon: Ship, color: '#8b5cf6', growth: '+15.8%' },
  { name: 'Train', value: 52000, percentage: 5.2, icon: Train, color: '#ec4899', growth: '+3.1%' },
  { name: 'Motorcycle', value: 25000, percentage: 2.5, icon: Bike, color: '#06b6d4', growth: '+6.4%' },
];

const monthlyTransport = [
  { month: 'Jan', flight: 32000, car: 24000, bus: 12000, ferry: 8000 },
  { month: 'Feb', flight: 35000, car: 26000, bus: 13000, ferry: 8500 },
  { month: 'Mar', flight: 38000, car: 28000, bus: 14000, ferry: 9000 },
  { month: 'Apr', flight: 42000, car: 31000, bus: 15000, ferry: 10000 },
  { month: 'May', flight: 45000, car: 33000, bus: 16000, ferry: 11000 },
  { month: 'Jun', flight: 48000, car: 35000, bus: 17000, ferry: 12000 },
];

const routePopularity = [
  { route: 'KL → Langkawi', trips: 125000, avgDuration: '1h 15m', mode: 'Flight' },
  { route: 'Penang → Langkawi', trips: 87000, avgDuration: '2h 45m', mode: 'Ferry' },
  { route: 'Alor Setar → Langkawi', trips: 65000, avgDuration: '1h 30m', mode: 'Car' },
  { route: 'Butterworth → Alor Setar', trips: 52000, avgDuration: '1h 45m', mode: 'Train' },
  { route: 'Sungai Petani → Langkawi', trips: 38000, avgDuration: '2h 15m', mode: 'Bus' },
];

const locations = [
  'Kuala Lumpur',
  'Langkawi',
  'Alor Setar',
  'Sungai Petani',
  'Penang',
  'Kulim',
  'Jitra',
  'Butterworth',
  'Kuala Kedah',
];

interface RouteOption {
  mode: string;
  icon: any;
  duration: string;
  price: number;
  frequency: string;
  color: string;
  provider?: string;
}

const getRouteOptions = (from: string, to: string): RouteOption[] => {
  const routes: Record<string, RouteOption[]> = {
    'Kuala Lumpur-Langkawi': [
      { mode: 'Flight', icon: Plane, duration: '1h 15m', price: 280, frequency: '6 flights/day', color: '#3b82f6', provider: 'AirAsia, Malaysia Airlines' },
      { mode: 'Car + Ferry', icon: Car, duration: '7h 30m', price: 180, frequency: 'On demand', color: '#10b981', provider: 'Private/Rental' },
    ],
    'Penang-Langkawi': [
      { mode: 'Ferry', icon: Ship, duration: '2h 45m', price: 65, frequency: '4 trips/day', color: '#8b5cf6', provider: 'Langkawi Ferry Services' },
      { mode: 'Flight', icon: Plane, duration: '35m', price: 120, frequency: '3 flights/day', color: '#3b82f6', provider: 'Firefly' },
    ],
    'Alor Setar-Langkawi': [
      { mode: 'Car/Taxi', icon: Car, duration: '1h 30m', price: 80, frequency: 'On demand', color: '#10b981', provider: 'Grab, Private Taxi' },
      { mode: 'Bus', icon: Bus, duration: '2h 15m', price: 25, frequency: 'Hourly', color: '#f59e0b', provider: 'Kedah Express' },
    ],
    'Butterworth-Alor Setar': [
      { mode: 'Train', icon: Train, duration: '1h 45m', price: 18, frequency: '8 trains/day', color: '#ec4899', provider: 'KTM ETS' },
      { mode: 'Bus', icon: Bus, duration: '2h 30m', price: 12, frequency: 'Every 30min', color: '#f59e0b', provider: 'Plusliner' },
      { mode: 'Car/Taxi', icon: Car, duration: '1h 30m', price: 95, frequency: 'On demand', color: '#10b981', provider: 'Grab' },
    ],
    'Sungai Petani-Langkawi': [
      { mode: 'Bus + Ferry', icon: Bus, duration: '3h 45m', price: 45, frequency: '3 trips/day', color: '#f59e0b', provider: 'Combined Service' },
      { mode: 'Car + Ferry', icon: Car, duration: '3h 15m', price: 110, frequency: 'On demand', color: '#10b981', provider: 'Private' },
    ],
  };

  const key = `${from}-${to}`;
  const reverseKey = `${to}-${from}`;
  
  return routes[key] || routes[reverseKey] || [
    { mode: 'Car/Taxi', icon: Car, duration: '2h 30m', price: 120, frequency: 'On demand', color: '#10b981', provider: 'Grab, Private Taxi' },
    { mode: 'Bus', icon: Bus, duration: '3h 15m', price: 35, frequency: 'Daily', color: '#f59e0b', provider: 'Local Bus Services' },
  ];
};

export function TransportAnalytics({ selectedCity }: TransportAnalyticsProps) {
  const [fromLocation, setFromLocation] = useState('Kuala Lumpur');
  const [toLocation, setToLocation] = useState('Langkawi');
  const [showRoutes, setShowRoutes] = useState(false);

  const routeOptions = getRouteOptions(fromLocation, toLocation);

  const handlePlanRoute = () => {
    setShowRoutes(true);
  };

  return (
    <div className="space-y-6">
      {/* Route Planner */}
      <Card className="bg-card/80 border-primary/20 shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-foreground">Route Planner</CardTitle>
          <CardDescription className="text-muted-foreground">Find the best transport options for your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">From</label>
              <select
                value={fromLocation}
                onChange={handleFromChange}
                className="w-full bg-secondary/60 text-foreground border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/70"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end justify-center">
              <ArrowRight className="w-6 h-6 text-primary/80 mb-2" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">To</label>
              <select
                value={toLocation}
                onChange={handleToChange}
                className="w-full bg-secondary/60 text-foreground border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/70"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <Button 
            onClick={handlePlanRoute}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            Find Transport Options
          </Button>

          {/* Route Results */}
          {showRoutes && (
            <div className="mt-6 space-y-3">
              <h4 className="text-white mb-3">Available Options ({fromLocation} → {toLocation})</h4>
              {routeOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div key={index} className="p-4 bg-secondary/40 rounded-lg border border-primary/20 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${option.color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: option.color }} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="text-white mb-1">{option.mode}</h5>
                            {option.provider && (
                              <p className="text-xs text-blue-200/60">{option.provider}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-white text-xl">RM {option.price}</p>
                            <p className="text-xs text-blue-200/60">per person</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center gap-2 text-sm text-blue-200/60">
                            <Clock className="w-4 h-4" />
                            <span>{option.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-blue-200/60">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {option.frequency}
                            </Badge>
                          </div>
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

      {/* Transport Mode Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transportModes.map((transport) => {
          const Icon = transport.icon;
          return (
            <Card key={transport.name} className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${transport.color}30` }}>
                    <Icon className="w-6 h-6" style={{ color: transport.color }} />
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {transport.growth}
                  </Badge>
                </div>
                <h3 className="text-white mb-1">{transport.name}</h3>
                <p className="text-2xl text-white mb-1">{transport.value.toLocaleString()}</p>
                <p className="text-sm text-blue-200/60">{transport.percentage}% of total</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Transport Mode Distribution</CardTitle>
            <CardDescription className="text-blue-200/60">Usage breakdown by transport type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transportModes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transportModes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a1628', 
                    border: '1px solid #1e3a8a',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Monthly Transport Trends</CardTitle>
            <CardDescription className="text-blue-200/60">6-month comparison by transport mode</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTransport}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
                <XAxis dataKey="month" stroke="#93c5fd" />
                <YAxis stroke="#93c5fd" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a1628', 
                    border: '1px solid #1e3a8a',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="flight" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="car" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="bus" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="ferry" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Routes */}
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Most Popular Routes</CardTitle>
          <CardDescription className="text-blue-200/60">Top travel routes to Kedah destinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routePopularity.map((route, index) => (
              <div key={route.route} className="flex items-center gap-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/20">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-1">{route.route}</h4>
                  <div className="flex items-center gap-4 text-sm text-blue-200/60">
                    <span>{route.trips.toLocaleString()} trips</span>
                    <span>•</span>
                    <span>Avg. {route.avgDuration}</span>
                    <span>•</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {route.mode}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
