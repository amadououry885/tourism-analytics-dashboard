import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, TrendingUp, TrendingDown, Filter, Search, SortAsc, SortDesc } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DestinationCard } from './DestinationCard';
import { DestinationModal } from './DestinationModal';

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
  image_url?: string;
  description?: string | null;
  posts?: number;
  engagement?: number;
  rating?: number;
  change?: string;
  trend?: 'up' | 'down';
  color?: string;
  category?: string;
  city?: string;
  is_free?: boolean;
  price?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  // NEW FIELDS ADDED - External links
  wikipedia_url?: string;
  official_website?: string;
  tripadvisor_url?: string;
  google_maps_url?: string;
  // Contact information
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  // Operational details
  opening_hours?: string;
  best_time_to_visit?: string;
  // Amenities
  amenities?: {
    parking?: boolean;
    wifi?: boolean;
    wheelchair_accessible?: boolean;
    restaurant?: boolean;
    restroom?: boolean;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

export function PopularDestinations({ selectedCity, timeRange }: PopularDestinationsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [leastVisited, setLeastVisited] = useState<Destination[]>([]);
  const [postDistribution, setPostDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'rating'>('popularity');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use axios with relative URL like other working components
      const response = await axios.get('/api/analytics/places/popular/');
      const data = response.data;

      // Handle array response from analytics endpoint
      const places = Array.isArray(data) ? data : (data.results || data || []);
      setDestinations(places);
    } catch (err) {
      // normalize error to string
      const msg = err instanceof Error ? err.message : String(err);
      // If the fetch failed locally, give a helpful hint to the developer/user
      const hint =
        msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')
          ? `Unable to reach backend at ${import.meta.env.VITE_API_URL || 'http://localhost:8000'}. Please check your connection.`
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

        // ✅ Fetch places from analytics popular endpoint using axios
        let response;
        try {
          response = await axios.get('/api/analytics/places/popular/');
          const data = response.data;
          console.log('✅ Response from analytics/places/popular/:', data);

          // Handle array response
          const places = Array.isArray(data) ? data : (data.results || data || []);
          console.log('📊 Parsed places:', places);

          // Set ALL destinations data (not just top 5) - ranked by posts
          const destinations = places.map((place: any, index: number) => ({
            name: place.place_name || place.name || 'Unknown',
            posts: place.posts || place.post_count || 0,
            rating: place.rating || place.average_rating || 0,
            change: place.change || place.growth_rate || '-0%',
            trend: 'down' as const,
            color: COLORS[index % COLORS.length],
            category: place.category || '',
            city: place.city || '',
            image_url: place.image_url || '',
            // ✅ Add all new fields from API
            wikipedia_url: place.wikipedia_url || undefined,
            official_website: place.official_website || undefined,
            tripadvisor_url: place.tripadvisor_url || undefined,
            google_maps_url: place.google_maps_url || undefined,
            contact_phone: place.contact_phone || undefined,
            contact_email: place.contact_email || undefined,
            address: place.address || undefined,
            opening_hours: place.opening_hours || undefined,
            best_time_to_visit: place.best_time_to_visit || undefined,
            amenities: place.amenities || undefined
          }));
          
          // Sort by posts (highest first)
          destinations.sort((a: Destination, b: Destination) => (b.posts || 0) - (a.posts || 0));
          
          setTopDestinations(destinations);

          const totalPosts = destinations.reduce((sum: number, d: Destination) => sum + (d.posts || 0), 0);
          if (totalPosts > 0) {
            const distribution = destinations.map((d: Destination) => ({
              name: d.name,
              value: d.posts || 0,
              percentage: parseFloat((((d.posts || 0) / totalPosts) * 100).toFixed(1))
            }));
            setPostDistribution(distribution);
          } else {
            setPostDistribution([]);
          }
        } catch (apiError) {
          console.log('⚠️ analytics/places failed, trying places endpoint...');
          // Fallback to places endpoint using axios
          response = await axios.get('/api/places/');
          const data = response.data;
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

          const total = destinations.reduce((sum: number, d: Destination) => sum + (d.posts || 0), 0);
          if (total > 0) {
            const distribution = destinations.map((d: Destination) => ({
              name: d.name,
              value: d.posts || 0,
              percentage: parseFloat((((d.posts || 0) / total) * 100).toFixed(1))
            }));
            setPostDistribution(distribution);
          } else {
            setPostDistribution([]);
          }
        }

        // Fetch least visited destinations
        try {
          const leastResponse = await axios.get('/api/rankings/least-pois');
          const leastData = leastResponse.data;
          console.log('✅ Response from rankings/least-pois:', leastData);
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
            ? `Unable to reach backend at ${import.meta.env.VITE_API_URL || 'http://localhost:8000'}. Please check your connection.`
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

  // Filtering and sorting logic
  const filteredDestinations = topDestinations
    .filter(dest => {
      // Search filter
      if (searchTerm && !dest.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && dest.category !== selectedCategory) {
        return false;
      }
      // Free only filter
      if (showFreeOnly && !dest.is_free) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
        default:
          return (b.posts || 0) - (a.posts || 0);
      }
    });

  // Get unique categories (case-insensitive to avoid duplicates like "city" and "City")
  const uniqueCategories = Array.from(
    new Set(
      topDestinations
        .map(d => d.category)
        .filter(Boolean)
        .map(cat => cat!.charAt(0).toUpperCase() + cat!.slice(1).toLowerCase())
    )
  ).sort();
  const categories = ['All', ...uniqueCategories];

  const handleViewDetails = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Buttons Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat || 'All')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popularity">🔥 Popularity</option>
                  <option value="name">🔤 Name</option>
                  <option value="rating">⭐ Rating</option>
                </select>
              </div>

              {/* Free Only Toggle */}
              <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">🎟️ Free Only</span>
              </label>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-blue-600">{filteredDestinations.length}</span> of {topDestinations.length} destinations
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destinations Grid - Single Scrollable Card */}
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardContent className="p-6">
          {filteredDestinations.length === 0 ? (
            <div className="py-16">
              <div className="text-center text-gray-500">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No destinations found</h3>
                <p>Try adjusting your filters or search term</p>
              </div>
            </div>
          ) : (
            <div className="max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((destination, index) => (
                  <DestinationCard
                    key={`${destination.name}-${index}`}
                    destination={destination}
                    rank={index + 1}
                    isTrending={index < 3} // Top 3 are trending
                    isNew={index === filteredDestinations.length - 1} // Last one is new
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Destination Detail Modal */}
      <DestinationModal
        key={selectedDestination?.id || 'modal'}
        destination={selectedDestination}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Post Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Post Distribution</CardTitle>
            <CardDescription className="text-gray-900">Social engagement breakdown by destination</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={postDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
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
                      ⭐ {destination.rating?.toFixed(1) || '0.0'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-900">
                    <div className="flex items-center justify-between">
                      <span>Posts:</span>
                      <span className="font-medium">{destination.posts?.toLocaleString() || '0'}</span>
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
}// Cache bust Sat Dec  6 06:56:25 AM +08 2025
