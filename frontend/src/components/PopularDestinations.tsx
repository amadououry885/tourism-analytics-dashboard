import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, TrendingUp, TrendingDown, Filter, Search, SortAsc, SortDesc, Star, MessageCircle, Navigation, Share2, DollarSign, Globe, Phone, Mail, Clock, ExternalLink, Grid, Sparkles, Ticket } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { MasterDetailLayout } from './MasterDetailLayout';
import { ListItem } from './ListItem';
import { DetailPanel } from './DetailPanel';
import { FilterDropdown, ToggleFilter, SortDropdown, FilterOption } from './FilterDropdown';

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
  is_open?: boolean;
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

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use axios with relative URL (baseURL already has /api)
      const response = await api.get('/analytics/places/popular/');
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
          ? 'Unable to reach backend. Please check your connection.'
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
          response = await api.get(`/analytics/places/popular/${cityParam}`);
          const data = response.data;
          console.log('✅ Response from analytics/places/popular/:', data);

          // Handle array response
          const places = Array.isArray(data) ? data : (data.results || data || []);
          console.log('📊 Parsed places:', places);

          // Set ALL destinations data (not just top 5) - ranked by posts
          const destinations = places.map((place: any, index: number) => ({
            id: place.id,
            name: place.place_name || place.name || 'Unknown',
            posts: place.posts || place.post_count || 0,
            rating: place.rating || place.average_rating || 0,
            change: place.change || place.growth_rate || '-0%',
            trend: 'down' as const,
            color: COLORS[index % COLORS.length],
            category: place.category || '',
            city: place.city || '',
            image_url: place.image_url || '',
            is_free: place.is_free,
            is_open: place.is_open,
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
          response = await api.get('/places/');
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
          const leastResponse = await api.get('/rankings/least-pois');
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
            ? 'Unable to reach backend. Please check your connection.'
            : '';
        setError(msg + (hint ? ` — ${hint}` : ''));
        console.error('Error fetching popular destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDestinations();
  }, [selectedCity, timeRange]);

  // Filtering and sorting logic - MUST be before early returns
  const filteredDestinations = useMemo(() => {
    return topDestinations
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
  }, [topDestinations, searchTerm, selectedCategory, showFreeOnly, sortBy]);

  // Get unique categories (case-insensitive to avoid duplicates like "city" and "City")
  const uniqueCategories = useMemo(() => Array.from(
    new Set(
      topDestinations
        .map(d => d.category)
        .filter(Boolean)
        .map(cat => cat!.charAt(0).toUpperCase() + cat!.slice(1).toLowerCase())
    )
  ).sort(), [topDestinations]);
  const categories = ['All', ...uniqueCategories];

  // Auto-select first destination when filtered list changes
  useEffect(() => {
    if (filteredDestinations.length > 0) {
      // Only set if no selection or current selection not in filtered list
      if (!selectedDestination || !filteredDestinations.find(d => d.id === selectedDestination.id)) {
        setSelectedDestination(filteredDestinations[0]);
      }
    } else if (selectedDestination !== null) {
      setSelectedDestination(null);
    }
  }, [filteredDestinations, selectedDestination]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white animate-pulse shadow-soft border-gray-100">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white animate-pulse shadow-soft border-gray-100">
            <CardContent className="p-6">
              <div>
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
        <div className="text-destructive font-medium mb-2">Network Error</div>
        <div className="text-sm text-gray-600 mb-4">
          {error}
        </div>
        <button
          onClick={fetchDestinations}
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition-colors"
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

  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestination(destination);
  };

  const handleGetDirections = () => {
    if (!selectedDestination) return;
    if (selectedDestination.latitude && selectedDestination.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedDestination.latitude},${selectedDestination.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedDestination.name + ' ' + selectedDestination.city)}`, '_blank');
    }
  };

  const handleShare = () => {
    if (!selectedDestination) return;
    if (navigator.share) {
      navigator.share({
        title: selectedDestination.name,
        text: `Check out ${selectedDestination.name} in ${selectedDestination.city}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn gap-4">
      {/* Filters Bar - Modern Dropdown Pattern */}
      <Card className="bg-white border-gray-200 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <FilterDropdown
              label="Category"
              icon={<Grid className="w-4 h-4" />}
              options={categories.map(cat => ({
                value: cat,
                label: cat,
                icon: cat === 'All' ? '🌍' : 
                      cat.toLowerCase().includes('city') ? '🏙️' :
                      cat.toLowerCase().includes('nature') ? '🌿' :
                      cat.toLowerCase().includes('museum') ? '🏛️' :
                      cat.toLowerCase().includes('landmark') ? '🏰' :
                      cat.toLowerCase().includes('beach') ? '🏖️' :
                      cat.toLowerCase().includes('temple') || cat.toLowerCase().includes('mosque') ? '🕌' :
                      cat.toLowerCase().includes('park') ? '🌳' : '📍'
              }))}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val as string)}
              searchable={categories.length > 5}
              placeholder="Search categories..."
              accentColor="#0ea5e9"
            />

            {/* Rating Dropdown */}
            <FilterDropdown
              label="Rating"
              icon={<Star className="w-4 h-4" />}
              options={[
                { value: 'all', label: 'All Ratings', icon: '⭐' },
                { value: '4.5', label: '4.5+ Stars', icon: '🌟' },
                { value: '4', label: '4+ Stars', icon: '⭐' },
                { value: '3', label: '3+ Stars', icon: '✨' },
              ]}
              value={sortBy === 'rating' ? 'rating' : 'all'}
              onChange={(val) => {
                if (val !== 'all') {
                  setSortBy('rating');
                }
              }}
              accentColor="#0ea5e9"
            />

            {/* Sort Dropdown */}
            <SortDropdown
              options={[
                { value: 'popularity', label: 'Most Popular', icon: '🔥' },
                { value: 'rating', label: 'Highest Rated', icon: '⭐' },
                { value: 'name', label: 'Name (A-Z)', icon: '🔤' },
              ]}
              value={sortBy}
              onChange={(val) => setSortBy(val as 'popularity' | 'name' | 'rating')}
              accentColor="#0ea5e9"
            />

            {/* Free Only Toggle */}
            <ToggleFilter
              label="Free Entry"
              icon={<Ticket className="w-4 h-4" />}
              checked={showFreeOnly}
              onChange={setShowFreeOnly}
              accentColor="#0ea5e9"
            />

            {/* Results Count */}
            <div className="text-sm text-gray-600 ml-auto flex items-center gap-2">
              <span className="font-bold text-primary">{filteredDestinations.length}</span>
              <span className="text-gray-500">places</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master-Detail Layout */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-soft overflow-hidden">
        <MasterDetailLayout
          className="h-full"
          leftPanel={
          <div className="bg-white h-full">
            {filteredDestinations.length === 0 ? (
              <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No destinations found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              filteredDestinations.map((destination, index) => (
                <ListItem
                  key={destination.id || index}
                  index={index}
                  title={destination.name}
                  subtitle={`${destination.city || ''} ${destination.category ? '• ' + destination.category : ''}`}
                  accentColor="#0ea5e9"
                  metrics={[
                    { 
                      label: 'Posts', 
                      value: destination.posts || 0,
                      icon: <MessageCircle className="w-3 h-3" />
                    },
                    { 
                      label: 'Rating', 
                      value: destination.rating && typeof destination.rating === 'number' ? `${destination.rating.toFixed(1)} ★` : 'N/A',
                      icon: <Star className="w-3 h-3" />
                    }
                  ]}
                  badge={
                    destination.is_open ? (
                      <Badge className="bg-green-600 border-green-600 font-bold shadow-sm text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        OPEN
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600 border-red-600 font-bold shadow-sm text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        CLOSED
                      </Badge>
                    )
                  }
                  isSelected={selectedDestination?.id === destination.id || selectedDestination?.name === destination.name}
                  onClick={() => handleSelectDestination(destination)}
                />
              ))
            )}
          </div>
        }
        rightPanel={
          selectedDestination ? (
            <DetailPanel
              title={selectedDestination.name}
              subtitle={`${selectedDestination.city || 'Kedah'} • ${selectedDestination.category || 'Attraction'}`}
              image={selectedDestination.image_url}
              actions={
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleGetDirections}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              }
            >
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 w-full mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <MessageCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-gray-900">{selectedDestination.posts || 0}</div>
                  <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Posts</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-900">{selectedDestination.engagement || 0}</div>
                  <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Engagement</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <div className="text-2xl font-bold text-gray-900">{selectedDestination.rating && typeof selectedDestination.rating === 'number' ? selectedDestination.rating.toFixed(1) : 'N/A'}</div>
                  <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Rating</div>
                </div>
              </div>

              {/* Place Details */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">ℹ</span>
                    About
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {selectedDestination.description || "Description not yet published."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visiting Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Visiting Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                           <DollarSign className="w-4 h-4" />
                           <span>Pricing</span>
                        </div>
                        <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {selectedDestination.is_free ? (
                            "Free Entry"
                          ) : selectedDestination.price ? (
                            `${selectedDestination.currency || 'RM'} ${selectedDestination.price}`
                          ) : (
                            "Not listed"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                           <Clock className="w-4 h-4" />
                           <span>Hours</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {selectedDestination.opening_hours || "Not listed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Contact</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                           <Phone className="w-4 h-4" />
                           <span>Phone</span>
                        </div>
                        <span className="font-medium text-gray-900 text-right truncate max-w-[120px]">
                          {selectedDestination.contact_phone || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2 text-gray-500">
                           <MapPin className="w-4 h-4" />
                           <span>Address</span>
                         </div>
                         <span className="font-medium text-gray-900 text-right truncate max-w-[120px]" title={selectedDestination.address}>
                           {selectedDestination.address || "N/A"}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </DetailPanel>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center bg-gray-50/50">
              <div className="max-w-md">
                <div className="w-20 h-20 bg-white rounded-full shadow-soft flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a destination</h3>
                <p className="text-gray-500">Choose a destination from the list to view detailed analytics, visitor information, and trends.</p>
              </div>
            </div>
          )
        }
      />
      </div>

      {/* Least Visited Destinations - Clean cards */}
      {leastVisited.length > 0 && (
        <Card className="bg-white border-gray-200 shadow-soft">
          <CardHeader className="border-b border-gray-100 bg-gray-50/30">
            <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Hidden Gems & Emerging Spots
            </CardTitle>
            <CardDescription className="text-gray-500">Destinations with growth potential but lower current engagement</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leastVisited.map((destination) => (
                <div key={destination.name} className="p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-gray-900 font-semibold group-hover:text-amber-600 transition-colors">{destination.name}</h4>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      ⭐ {destination.rating && typeof destination.rating === 'number' ? destination.rating.toFixed(1) : '0.0'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Current Posts:</span>
                    <span className="font-mono font-bold text-gray-900">{destination.posts?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Opportunity for promotion</span>
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
// force rebuild Sat Dec 13 05:38:08 AM +08 2025