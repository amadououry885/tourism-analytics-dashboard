import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface PopularDestinationsProps {
  selectedCity: string;
}

const topDestinations = [
  { 
    name: 'Langkawi Island', 
    visitors: 425000, 
    posts: 28500, 
    rating: 4.8,
    change: '+15.2%',
    trend: 'up',
    color: '#3b82f6'
  },
  { 
    name: 'Alor Setar Tower', 
    visitors: 198000, 
    posts: 15200, 
    rating: 4.5,
    change: '+8.7%',
    trend: 'up',
    color: '#10b981'
  },
  { 
    name: 'Paddy Museum', 
    visitors: 145000, 
    posts: 9800, 
    rating: 4.3,
    change: '+12.3%',
    trend: 'up',
    color: '#f59e0b'
  },
  { 
    name: 'Pedu Lake', 
    visitors: 132000, 
    posts: 8900, 
    rating: 4.6,
    change: '+5.1%',
    trend: 'up',
    color: '#8b5cf6'
  },
  { 
    name: 'Zahir Mosque', 
    visitors: 118000, 
    posts: 11200, 
    rating: 4.7,
    change: '+9.8%',
    trend: 'up',
    color: '#ec4899'
  },
];

const leastVisited = [
  { name: 'Kuala Muda', visitors: 12500, posts: 450, change: '-2.3%', trend: 'down' },
  { name: 'Sungai Petani Heritage', visitors: 15800, posts: 680, change: '+1.2%', trend: 'up' },
  { name: 'Gunung Jerai Trail', visitors: 18200, posts: 920, change: '-5.1%', trend: 'down' },
  { name: 'Lembah Bujang', visitors: 21400, posts: 1200, change: '+3.4%', trend: 'up' },
];

const visitorDistribution = [
  { name: 'Langkawi', value: 425000, percentage: 38.5 },
  { name: 'Alor Setar', value: 198000, percentage: 17.9 },
  { name: 'Paddy Museum', value: 145000, percentage: 13.1 },
  { name: 'Pedu Lake', value: 132000, percentage: 11.9 },
  { name: 'Others', value: 205000, percentage: 18.6 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

export function PopularDestinations({ selectedCity }: PopularDestinationsProps) {
  return (
    <div className="space-y-6">
      {/* Top Destinations Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Top 5 Most Popular Destinations</CardTitle>
            <CardDescription className="text-blue-200/60">Based on visitor count and social engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topDestinations.map((destination, index) => {
              const TrendIcon = destination.trend === 'up' ? TrendingUp : TrendingDown;
              return (
                <div key={destination.name} className="flex items-center gap-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/20">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white">{destination.name}</h4>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        ⭐ {destination.rating}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-blue-200/60">
                      <span>{destination.visitors.toLocaleString()} visitors</span>
                      <span>•</span>
                      <span>{destination.posts.toLocaleString()} posts</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    destination.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm">{destination.change}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Visitor Distribution</CardTitle>
            <CardDescription className="text-blue-200/60">Percentage breakdown by destination</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={visitorDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {visitorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
      </div>

      {/* Comparison Chart */}
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Visitor Comparison</CardTitle>
          <CardDescription className="text-blue-200/60">Monthly visitor counts across top destinations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topDestinations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
              <XAxis dataKey="name" stroke="#93c5fd" />
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
              <Bar dataKey="visitors" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Visitors" />
              <Bar dataKey="posts" fill="#10b981" radius={[8, 8, 0, 0]} name="Social Posts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Least Visited Destinations */}
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Emerging & Under-visited Destinations</CardTitle>
          <CardDescription className="text-blue-200/60">Hidden gems with growth potential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leastVisited.map((destination) => {
              const TrendIcon = destination.trend === 'up' ? TrendingUp : TrendingDown;
              return (
                <div key={destination.name} className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/20">
                  <div className="flex items-start justify-between mb-3">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <div className={`flex items-center gap-1 text-xs ${
                      destination.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendIcon className="w-3 h-3" />
                      <span>{destination.change}</span>
                    </div>
                  </div>
                  <h4 className="text-white mb-2">{destination.name}</h4>
                  <div className="space-y-1 text-sm text-blue-200/60">
                    <p>{destination.visitors.toLocaleString()} visitors</p>
                    <p>{destination.posts} posts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
