import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface PopularDestinationsProps {
  timeRange?: string;
  selectedCity: string;
}

// Define destination type
interface Destination {
  id?: number;
  name: string;
  visitors?: number;
  image?: string | null;
  description?: string | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

export function PopularDestinations({ selectedCity, timeRange }: PopularDestinationsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [leastVisited, setLeastVisited] = useState<Destination[]>([]);
  const [postDistribution, setPostDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use relative path so Vite proxy forwards to backend (avoid hard-coded ports)
      const res = await fetch('/api/analytics/places/popular/');
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();

      // Expect an array; guard against unexpected shapes
      if (Array.isArray(data)) {
        setDestinations(data);
      } else if (data && Array.isArray(data.results)) {
        setDestinations(data.results);
      } else {
        // fallback: empty array
        setDestinations([]);
        console.warn('Unexpected popular places response shape:', data);
      }
    } catch (err) {
      // normalize error to string
      const msg = err instanceof Error ? err.message : String(err);
      // If the fetch failed locally, give a helpful hint to the developer/user
      const hint =
        msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')
          ? `Unable to reach backend at ${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}. Is the Django server running? Try: cd backend && python manage.py runserver 8000`
          : '';
      setError(msg + (hint ? ` — ${hint}` : ''));
      console.error('Error fetching popular destinations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  useEffect(() => {
    const fetchTopDestinations = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching top destinations for city:', selectedCity);

        const cityParam = selectedCity && selectedCity !== 'all' ? `?city=${selectedCity}` : '';

        // ✅ Try the analytics places endpoint first
        let response;
        try {
          response = await fetch(`/api/analytics/places/${cityParam}`);
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          const data = await response.json();
          console.log('✅ Response from analytics/places:', data);

          // Handle different response formats
          const places = data.results || data || [];
          console.log('📊 Parsed places:', places);

          // Set destinations data
          const destinations = places.slice(0, 5).map((place: any, index: number) => ({
            name: place.place_name || 'Unknown',
            posts: place.posts || place.post_count || 0,
            rating: place.rating || place.average_rating || 0,
            change: place.change || place.growth_rate || '-0%',
            trend: 'down',
            color: COLORS[index % COLORS.length]
          }));
          setTopDestinations(destinations);

          // Set distribution data based on posts
          const total = destinations.reduce((sum: number, d: Destination) => sum + d.posts, 0);
          if (total > 0) {
            const distribution = destinations.map((d: Destination) => ({
              name: d.name,
              value: d.posts,
              percentage: parseFloat(((d.posts / total) * 100).toFixed(1))
            }));
            setPostDistribution(distribution);
          } else {
            setPostDistribution([]);
          }
        } catch (apiError) {
          console.log('⚠️ analytics/places failed, trying places endpoint...');
          // Fallback to places endpoint
          response = await fetch(`/api/places/${cityParam}`);
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          const data = await response.json();
          console.log('✅ Response from places:', data);

          const places = data.results || data || [];
          const destinations = places.slice(0, 5).map((place: any, index: number) => ({
            name: place.place_name || 'Unknown',
            posts: place.posts || place.post_count || 0,
            rating: place.rating || place.average_rating || 0,
            change: place.change || place.growth_rate || '-0%',
            trend: 'down',
            color: COLORS[index % COLORS.length]
          }));
          setTopDestinations(destinations);

          const total = destinations.reduce((sum: number, d: Destination) => sum + d.posts, 0);
          if (total > 0) {
            const distribution = destinations.map((d: Destination) => ({
              name: d.name,
              value: d.posts,
              percentage: parseFloat(((d.posts / total) * 100).toFixed(1))
            }));
            setPostDistribution(distribution);
          } else {
            setPostDistribution([]);
          }
        }

        // Fetch least visited destinations
        try {
          const leastResponse = await fetch(`/api/analytics/places/least-visited/${cityParam}`);
          if (!leastResponse.ok) {
            throw new Error(`Server responded with ${leastResponse.status}`);
          }
          const leastData = await leastResponse.json();
          console.log('✅ Response from analytics/places/least-visited:', leastData);
          const leastPlaces = leastData.results || leastData || [];
          if (leastPlaces.length > 0) {
            const leastDest = leastPlaces.map((place: any, index: number) => ({
              name: place.name,
              posts: place.posts || 0,
              rating: place.rating || 0,
              change: place.change || '-0%',
              trend: 'down',
              color: COLORS[index % COLORS.length]
            }));
            setLeastVisited(leastDest);
          } else {
            setLeastVisited([]);
          }
        } catch (error) {
          console.error('Error fetching least visited destinations:', error);
          setError('Failed to load least visited destinations');
          setLeastVisited([]);
        }
      } catch (err) {
        // normalize error to string
        const msg = err instanceof Error ? err.message : String(err);
        // If the fetch failed locally, give a helpful hint to the developer/user
        const hint =
          msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')
            ? `Unable to reach backend at ${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}. Is the Django server running? Try: cd backend && python manage.py runserver 8000`
            : '';
        setError(msg + (hint ? ` — ${hint}` : ''));
        console.error('Error fetching popular destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDestinations();
  }, [selectedCity, timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-red-600 font-medium mb-2">Network Error</div>
        <div className="text-sm text-gray-600 mb-4">
          {error}
        </div>
        <button
          onClick={fetchDestinations}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-600">
        No popular destinations available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Destinations Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Top 5 Most Popular Destinations</CardTitle>
            <CardDescription className="text-gray-900">Based on social engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topDestinations.map((destination, index) => {
              const TrendIcon = destination.trend === 'up' ? TrendingUp : TrendingDown;
              return (
                <div key={destination.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-gray-900">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-gray-900">{destination.name}</h4>
                      <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                        ⭐ {destination.rating}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-900">
                      <span>{destination.posts.toLocaleString()} posts</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${destination.trend === 'up' ? 'text-green-700' : 'text-red-700'}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm">{destination.change}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Post Distribution</CardTitle>
            <CardDescription className="text-gray-900">Social engagement breakdown by destination</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={postDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {postDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Social Engagement Comparison</CardTitle>
          <CardDescription className="text-gray-900">Post counts across top destinations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topDestinations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827'
                }}
              />
              <Legend />
              <Bar dataKey="posts" fill="#10b981" radius={[8, 8, 0, 0]} name="Social Posts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Least Visited Destinations */}
      {leastVisited.length > 0 && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Hidden Gems - Least Posted</CardTitle>
            <CardDescription className="text-gray-900">Destinations with low social engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leastVisited.map((destination) => (
                <div key={destination.name} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-900 font-medium">{destination.name}</h4>
                    <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">
                      ⭐ {destination.rating.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-900">
                    <div className="flex items-center justify-between">
                      <span>Posts:</span>
                      <span className="font-medium">{destination.posts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-700 mt-2">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs">Potential for growth</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}