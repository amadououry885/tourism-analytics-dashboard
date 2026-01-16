import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Search, Filter, MapPin, DollarSign, Star, Home, X, ChevronDown, Sparkles, TrendingUp, Navigation, Share2, Clock, Users, Wifi, Car, Mail, Phone as PhoneIcon, MessageCircle, Heart, Eye, Award, Image as ImageIcon, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { MasterDetailLayout } from '../../components/MasterDetailLayout';
import { ListItem } from '../../components/ListItem';
import { DetailPanel } from '../../components/DetailPanel';
import { Stay, HybridSearchResponse } from '../../types/stay';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FilterDropdown, SortDropdown, ToggleFilter, FEATURE_COLORS } from '../../components/FilterDropdown';

const DISTRICTS = [
  'All Districts',
  'Langkawi',
  'Alor Setar',
  'Sungai Petani',
  'Kulim',
  'Jitra',
  'Yan',
  'Baling',
  'Kuala Kedah',
];

const STAY_TYPES = [
  { value: '', label: 'All Types', icon: '🏨', color: 'bg-gray-100 text-gray-700' },
  { value: 'Hotel', label: 'Hotel', icon: '🏨', color: 'bg-blue-100 text-blue-700' },
  { value: 'Apartment', label: 'Apartment', icon: '🏢', color: 'bg-purple-100 text-purple-700' },
  { value: 'Guest House', label: 'Guest House', icon: '🏚️', color: 'bg-orange-100 text-orange-700' },
  { value: 'Homestay', label: 'Homestay', icon: '🏠', color: 'bg-green-100 text-green-700' },
];

const AMENITIES = [
  { name: 'WiFi', icon: '📶' },
  { name: 'Parking', icon: '🚗' },
  { name: 'Pool', icon: '🏊' },
  { name: 'Gym', icon: '💪' },
  { name: 'Breakfast', icon: '🍳' },
  { name: 'Air Conditioning', icon: '❄️' },
  { name: 'Kitchen', icon: '🍴' },
  { name: 'TV', icon: '📺' },
];

const POPULAR_SEARCHES = [
  { query: 'Langkawi Beach Resort', icon: '🏖️' },
  { query: 'Budget Homestay', icon: '💰' },
  { query: 'Luxury Hotel', icon: '⭐' },
  { query: 'Family Apartment', icon: '👨‍👩‍👧‍👦' },
];

interface AccommodationSearchProps {
  selectedCity?: string;
}

export default function AccommodationSearch({ selectedCity = 'all' }: AccommodationSearchProps) {
  const [stays, setStays] = useState<Stay[]>([]);
  const [filteredStays, setFilteredStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalCount, setInternalCount] = useState(0);
  const [externalCount, setExternalCount] = useState(0);
  
  // Filters - Initialize district from selectedCity prop
  const [district, setDistrict] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'external'>('all');
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);

  // Auto-suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-select first stay
  useEffect(() => {
    if (filteredStays.length > 0 && !selectedStay) {
      setSelectedStay(filteredStays[0]);
    } else if (filteredStays.length === 0 && selectedStay !== null) {
      setSelectedStay(null);
    }
  }, [filteredStays, selectedStay]);

  const handleSelectStay = (stay: Stay) => {
    setSelectedStay(stay);
  };

  const handleGetDirections = () => {
    if (selectedStay) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStay.name + ' ' + selectedStay.district)}`, '_blank');
    }
  };

  const handleShare = () => {
    if (selectedStay && navigator.share) {
      navigator.share({
        title: selectedStay.name,
        text: `Check out ${selectedStay.name} in ${selectedStay.district}`,
        url: window.location.href
      }).catch(() => {});
    }
  };

  // Sync district filter when selectedCity changes
  useEffect(() => {
    if (selectedCity && selectedCity !== 'all') {
      // Capitalize first letter to match district format
      const cityName = selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1);
      console.log('🏙️ City filter changed to:', cityName);
      setDistrict(cityName);
    } else {
      console.log('🏙️ City filter reset to: All Cities');
      setDistrict('');
    }
  }, [selectedCity]);

  useEffect(() => {
    console.log('🔄 Fetching stays with filters:', { district, type, minPrice, maxPrice, minRating });
    fetchStays();
  }, [district, type, minPrice, maxPrice, minRating]);

  useEffect(() => {
    applyFilters();
  }, [stays, searchQuery, selectedAmenities, activeTab]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, stays]);

  const fetchStays = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (district && district !== 'All Districts') params.append('district', district);
      if (type) params.append('type', type);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (minRating) params.append('min_rating', minRating);
      
      const url = `/stays/hybrid_search/?${params.toString()}`;
      console.log('📡 Fetching stays from:', url);
      console.log('📋 Params:', { district, type, minPrice, maxPrice, minRating });
      
      const response = await api.get<HybridSearchResponse>(url);
      
      console.log('✅ Received stays:', response.data.results.length, 'results');
      console.log('📊 Internal:', response.data.internal_count, 'External:', response.data.external_count);
      
      setStays(response.data.results);
      setInternalCount(response.data.internal_count);
      setExternalCount(response.data.external_count);
    } catch (error) {
      console.error('Error fetching stays:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stays];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(stay =>
        stay.name.toLowerCase().includes(query) ||
        stay.district.toLowerCase().includes(query) ||
        stay.landmark?.toLowerCase().includes(query)
      );
    }
    
    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(stay =>
        selectedAmenities.every(amenity => stay.amenities.includes(amenity))
      );
    }

    // Tab filter
    if (activeTab === 'local') {
      filtered = filtered.filter(stay => stay.is_internal);
    } else if (activeTab === 'external') {
      filtered = filtered.filter(stay => !stay.is_internal);
    }
    
    setFilteredStays(filtered);
  };

  const generateSuggestions = () => {
    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();
    
    stays.forEach(stay => {
      if (stay.name.toLowerCase().includes(query)) {
        suggestions.add(stay.name);
      }
      if (stay.district.toLowerCase().includes(query)) {
        suggestions.add(stay.district);
      }
      if (stay.landmark?.toLowerCase().includes(query)) {
        suggestions.add(stay.landmark);
      }
    });
    
    setSuggestions(Array.from(suggestions).slice(0, 5));
  };

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleClearFilters = () => {
    setDistrict('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSearchQuery('');
    setSelectedAmenities([]);
    setActiveTab('all');
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
  };

  // Calculate counts from ALL stays (not just filtered), but apply search and amenity filters
  const getTabCounts = () => {
    let baseFiltered = [...stays];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      baseFiltered = baseFiltered.filter(stay =>
        stay.name.toLowerCase().includes(query) ||
        stay.district.toLowerCase().includes(query) ||
        stay.landmark?.toLowerCase().includes(query)
      );
    }
    
    // Apply amenities filter
    if (selectedAmenities.length > 0) {
      baseFiltered = baseFiltered.filter(stay =>
        selectedAmenities.every(amenity => stay.amenities.includes(amenity))
      );
    }
    
    return {
      all: baseFiltered.length,
      local: baseFiltered.filter(s => s.is_internal).length,
      external: baseFiltered.filter(s => !s.is_internal).length,
    };
  };
  
  const counts = getTabCounts();
  const localCount = counts.local;
  const externalFilteredCount = counts.external;
  const allCount = counts.all;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-2xl px-8 py-8 shadow-xl">
        <div className="max-w-6xl mx-auto">
          {/* City Filter Active Indicator */}
          {selectedCity && selectedCity !== 'all' && (
            <div className="mb-4 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl px-4 py-3 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-yellow-300" />
              <div className="flex-1">
                <span className="text-white font-semibold">City Filter Active: </span>
                <span className="text-yellow-300 font-bold text-lg capitalize">{selectedCity}</span>
              </div>
              <Badge className="bg-yellow-300 text-indigo-900 border-yellow-400">
                {filteredStays.length} {filteredStays.length === 1 ? 'stay' : 'stays'} found
              </Badge>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                Find Your Perfect Stay
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </h2>
              <p className="text-indigo-100">Discover the best accommodations across Kedah</p>
            </div>
          </div>

          {/* Search Bar with Auto-suggestions */}
          <div className="relative mt-6">
            {/* ✨ Wrap search in white card for better visibility */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-white/50">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search by name, location, or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-16 pr-16 py-5 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 bg-gray-50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Auto-suggestions Dropdown */}
            {showSuggestions && (searchQuery.length > 2 || POPULAR_SEARCHES.length > 0) && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                {suggestions.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchQuery.length <= 2 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Popular Searches
                    </div>
                    {POPULAR_SEARCHES.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePopularSearch(item.query)}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-gray-900">{item.query}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Quick Stats */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Tabs - All in one card with gray background */}
            <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-2 flex items-center gap-2 shadow-md">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all border-2 ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-indigo-700'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
                style={activeTab !== 'all' ? { color: '#111827' } : {}}
              >
                All ({allCount})
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 border-2 ${
                  activeTab === 'local'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-green-700'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
                style={activeTab !== 'local' ? { color: '#111827' } : {}}
              >
                <span>✓ Local Partners</span>
                {activeTab === 'local' ? (
                  <Badge className="bg-white/20 text-white border-0">{localCount}</Badge>
                ) : (
                  <Badge className="bg-green-600 text-white border-0 font-bold">{localCount}</Badge>
                )}
              </button>
              <button
                onClick={() => setActiveTab('external')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 border-2 ${
                  activeTab === 'external'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg border-blue-700'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
                style={activeTab !== 'external' ? { color: '#111827' } : {}}
              >
                <span>🌐 External</span>
                {activeTab === 'external' ? (
                  <Badge className="bg-white/20 text-white border-0">{externalFilteredCount}</Badge>
                ) : (
                  <Badge className="bg-blue-600 text-white border-0 font-bold">{externalFilteredCount}</Badge>
                )}
              </button>
            </div>

            {/* Inline Filter Dropdowns - Replacing old toggle panel */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* District/Location Dropdown */}
              <FilterDropdown
                label="Location"
                icon={<MapPin className="w-4 h-4" />}
                options={DISTRICTS.map(d => ({
                  value: d === 'All Districts' ? '' : d,
                  label: d,
                  icon: d === 'All Districts' ? '🌍' : '📍'
                }))}
                value={district}
                onChange={(val) => setDistrict(val as string)}
                accentColor={FEATURE_COLORS.stay}
              />

              {/* Property Type Dropdown */}
              <FilterDropdown
                label="Type"
                icon={<Building2 className="w-4 h-4" />}
                options={STAY_TYPES.map(t => ({
                  value: t.value,
                  label: t.label,
                  icon: t.icon
                }))}
                value={type}
                onChange={(val) => setType(val as string)}
                accentColor={FEATURE_COLORS.stay}
              />

              {/* Rating Dropdown */}
              <FilterDropdown
                label="Rating"
                icon={<Star className="w-4 h-4" />}
                options={[
                  { value: '', label: 'Any Rating', icon: '⭐' },
                  { value: '3', label: '3+ Stars', icon: '⭐⭐⭐' },
                  { value: '4', label: '4+ Stars', icon: '⭐⭐⭐⭐' },
                  { value: '4.5', label: '4.5+ Stars', icon: '🌟' },
                ]}
                value={minRating}
                onChange={(val) => setMinRating(val as string)}
                accentColor={FEATURE_COLORS.stay}
              />

              {/* Amenities Multi-select Dropdown */}
              <FilterDropdown
                label="Amenities"
                icon={<Wifi className="w-4 h-4" />}
                options={AMENITIES.map(a => ({
                  value: a.name,
                  label: a.name,
                  icon: a.icon
                }))}
                value={selectedAmenities}
                onChange={(val) => setSelectedAmenities(val as string[])}
                multiple={true}
                searchable={false}
                accentColor={FEATURE_COLORS.stay}
              />

              {/* Results Count */}
              <div className="text-sm text-gray-600 ml-auto flex items-center gap-2">
                <span className="font-bold" style={{ color: FEATURE_COLORS.stay }}>{filteredStays.length}</span>
                <span className="text-gray-500">stays</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="px-8 py-8">
        {loading ? (
          <div className="space-y-6">
            {/* Skeleton Results Header */}
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            {/* Skeleton Stay Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse" style={{ border: '1px solid #E4E9F2' }}>
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-green-100 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-indigo-100 rounded-lg w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredStays.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No accommodations found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {filteredStays.length} Accommodation{filteredStays.length !== 1 ? 's' : ''} Found
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {localCount} local partner{localCount !== 1 ? 's' : ''} • {externalFilteredCount} external option{externalFilteredCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white font-medium text-gray-900">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Rating: High to Low</option>
                    <option>Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Master-Detail Layout */}
            <MasterDetailLayout
              leftPanel={
                <div className="bg-white">
                  {filteredStays.map((stay, index) => (
                    <ListItem
                      key={stay.id || index}
                      title={stay.name}
                      subtitle={`${stay.district} • ${stay.type || 'Accommodation'}`}
                      metrics={[
                        { 
                          label: 'Price', 
                          value: `RM ${stay.priceNight || 'N/A'}`,
                          icon: <DollarSign className="w-3 h-3" />
                        },
                        { 
                          label: 'Rating', 
                          value: stay.social_rating 
                            ? `${stay.social_rating.toFixed(1)} ★` 
                            : stay.rating && typeof stay.rating === 'number' 
                              ? `${stay.rating.toFixed(1)} ★` 
                              : 'N/A',
                          icon: <Star className="w-3 h-3" />
                        },
                        ...(stay.social_mentions ? [{ 
                          label: 'Mentions', 
                          value: stay.social_mentions,
                          icon: <MessageCircle className="w-3 h-3" />
                        }] : []),
                        ...(stay.is_trending ? [{ 
                          label: 'Trending', 
                          value: `+${stay.trending_percentage?.toFixed(0)}%`,
                          icon: <TrendingUp className="w-3 h-3 text-green-600" />
                        }] : [])
                      ]}
                      badge={
                        stay.is_trending ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                          </Badge>
                        ) : stay.is_internal ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Local Partner
                          </Badge>
                        ) : (
                          <>
                            {stay.booking_provider === 'booking.com' && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                🔵 Booking.com
                              </Badge>
                            )}
                            {stay.booking_provider === 'agoda' && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                🟣 Agoda
                              </Badge>
                            )}
                            {stay.booking_provider === 'both' && (
                              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
                                🎯 Multi-Platform
                              </Badge>
                            )}
                            {!stay.booking_provider && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                External
                              </Badge>
                            )}
                          </>
                        )
                      }
                      isSelected={selectedStay?.id === stay.id}
                      onClick={() => handleSelectStay(stay)}
                    />
                  ))}
                </div>
              }
              rightPanel={
                selectedStay ? (
                  <DetailPanel
                    title={selectedStay.name}
                    subtitle={`${selectedStay.district} • ${selectedStay.type || 'Accommodation'}`}
                    image={
                      selectedStay.stay_images && selectedStay.stay_images.length > 0 
                        ? selectedStay.stay_images[currentImageIndex]?.image_url 
                        : selectedStay.main_image_url || undefined
                    }
                    actions={
                      <div className="space-y-3">
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleGetDirections}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <Navigation className="w-5 h-5" />
                            Get Directions
                          </button>
                          <button
                            onClick={handleShare}
                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Contact Buttons for Internal Stays */}
                        {selectedStay.is_internal && (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                              <PhoneIcon className="w-4 h-4" />
                              Contact Owner Directly
                            </h4>
                            <div className="space-y-2">
                              {selectedStay.contact_phone && (
                                <a
                                  href={`tel:${selectedStay.contact_phone}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                >
                                  <PhoneIcon className="w-4 h-4" />
                                  {selectedStay.contact_phone}
                                </a>
                              )}
                              {!selectedStay.contact_phone && (
                                <a
                                  href="tel:+60174445566"
                                  className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                >
                                  <PhoneIcon className="w-4 h-4" />
                                  +60 17-444 5566
                                </a>
                              )}
                              {selectedStay.contact_whatsapp && (
                                <a
                                  href={`https://wa.me/${selectedStay.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  WhatsApp {selectedStay.contact_whatsapp}
                                </a>
                              )}
                              {!selectedStay.contact_whatsapp && (
                                <a
                                  href="https://wa.me/60174445566"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  WhatsApp +60174445566
                                </a>
                              )}
                              {selectedStay.contact_email && (
                                <a
                                  href={`mailto:${selectedStay.contact_email}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                >
                                  <Mail className="w-4 h-4" />
                                  {selectedStay.contact_email}
                                </a>
                              )}
                              {!selectedStay.contact_email && (
                                <a
                                  href="mailto:contact@kedahtourism.my"
                                  className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                >
                                  <Mail className="w-4 h-4" />
                                  contact@kedahtourism.my
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Booking Platform Badges */}
                        {!selectedStay.is_internal && (selectedStay.booking_com_url || selectedStay.agoda_url) && (
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-blue-900 mb-3">Book Online</h4>
                            <div className="space-y-2">
                              {selectedStay.booking_com_url && (
                                <a
                                  href={selectedStay.booking_com_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-lg">🔵</span>
                                    Booking.com
                                  </span>
                                  <span className="text-xs">View →</span>
                                </a>
                              )}
                              {selectedStay.agoda_url && (
                                <a
                                  href={selectedStay.agoda_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-lg">🟣</span>
                                    Agoda
                                  </span>
                                  <span className="text-xs">View →</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    }
                  >
                    {/* DEMO: Scrolling Test Section - Shows scrollbar works */}
                    <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                      <h3 className="text-sm font-bold text-yellow-900 mb-2">📋 Full Details Available</h3>
                      <p className="text-xs text-yellow-700">Scroll down to see contact information, booking links, and all amenities below.</p>
                    </div>

                    {/* Image Gallery */}
                    {selectedStay.stay_images && selectedStay.stay_images.length > 1 && (
                      <div className="mb-6">
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={selectedStay.stay_images[currentImageIndex]?.image_url}
                            alt={selectedStay.stay_images[currentImageIndex]?.caption || selectedStay.name}
                            className="w-full h-64 object-cover"
                          />
                          {/* Image Navigation */}
                          <button
                            onClick={() => setCurrentImageIndex((prev) => 
                              prev === 0 ? selectedStay.stay_images!.length - 1 : prev - 1
                            )}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => 
                              prev === selectedStay.stay_images!.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          {/* Image Counter */}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {currentImageIndex + 1} / {selectedStay.stay_images.length}
                          </div>
                        </div>
                        {/* Thumbnail Navigation */}
                        <div className="flex gap-2 mt-3 overflow-x-auto">
                          {selectedStay.stay_images.map((img, idx) => (
                            <button
                              key={img.id}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === currentImageIndex 
                                  ? 'border-blue-500 ring-2 ring-blue-300' 
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <img
                                src={img.image_url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Metrics */}
                    {(selectedStay.is_trending || selectedStay.social_mentions || selectedStay.social_rating) && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          Social Performance
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedStay.is_trending && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <span className="text-xs font-bold text-green-700">TRENDING</span>
                              </div>
                              <div className="text-2xl font-bold text-green-900">
                                +{selectedStay.trending_percentage?.toFixed(0)}%
                              </div>
                              <div className="text-xs text-green-600">This week</div>
                            </div>
                          )}
                          {selectedStay.social_rating && (
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                                <span className="text-xs font-bold text-yellow-700">SOCIAL RATING</span>
                              </div>
                              <div className="text-2xl font-bold text-yellow-900">
                                {selectedStay.social_rating.toFixed(1)}/10
                              </div>
                              <div className="text-xs text-yellow-600">From sentiment</div>
                            </div>
                          )}
                          {selectedStay.social_mentions !== undefined && selectedStay.social_mentions > 0 && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageCircle className="w-5 h-5 text-purple-600" />
                                <span className="text-xs font-bold text-purple-700">MENTIONS</span>
                              </div>
                              <div className="text-2xl font-bold text-purple-900">
                                {selectedStay.social_mentions}
                              </div>
                              <div className="text-xs text-purple-600">Social posts</div>
                            </div>
                          )}
                          {selectedStay.estimated_interest !== undefined && selectedStay.estimated_interest > 0 && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-5 h-5 text-blue-600" />
                                <span className="text-xs font-bold text-blue-700">REACH</span>
                              </div>
                              <div className="text-2xl font-bold text-blue-900">
                                {selectedStay.estimated_interest.toLocaleString()}
                              </div>
                              <div className="text-xs text-blue-600">Est. viewers</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-900">RM {selectedStay.priceNight || 'N/A'}</div>
                        <div className="text-xs text-green-600 font-medium">Per Night</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600 fill-yellow-600" />
                        <div className="text-2xl font-bold text-yellow-900">
                          {selectedStay.social_rating?.toFixed(1) || 
                           (selectedStay.rating && typeof selectedStay.rating === 'number' ? selectedStay.rating.toFixed(1) : 'N/A')}
                        </div>
                        <div className="text-xs text-yellow-600 font-medium">Rating</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-900">{selectedStay.amenities?.length || 0}</div>
                        <div className="text-xs text-blue-600 font-medium">Amenities</div>
                      </div>
                    </div>

                    {/* Source Badge */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Source</h3>
                      {selectedStay.is_internal ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300 text-sm px-4 py-2">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Local Partner - Verified by Tourism Kedah
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          {selectedStay.booking_provider === 'booking.com' && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-sm px-4 py-2">
                              🔵 Booking.com Partner Property
                            </Badge>
                          )}
                          {selectedStay.booking_provider === 'agoda' && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-sm px-4 py-2">
                              🟣 Agoda Partner Property
                            </Badge>
                          )}
                          {selectedStay.booking_provider === 'both' && (
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300 text-sm px-4 py-2">
                              🎯 Available on Multiple Platforms
                            </Badge>
                          )}
                          {!selectedStay.booking_provider && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-sm px-4 py-2">
                              External Source - Third Party
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    {(selectedStay.district || selectedStay.landmark) && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                        <div className="space-y-2">
                          {selectedStay.district && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{selectedStay.district}</span>
                            </div>
                          )}
                          {selectedStay.landmark && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Home className="w-4 h-4" />
                              <span>Near {selectedStay.landmark}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {selectedStay.amenities && selectedStay.amenities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedStay.amenities.map((amenity, idx) => {
                            const amenityInfo = AMENITIES.find(a => a.name === amenity);
                            return (
                              <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-xl">{amenityInfo?.icon || '✓'}</span>
                                <span className="text-sm font-medium text-gray-700">{amenity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </DetailPanel>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center">
                    <div>
                      <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Select an accommodation</h3>
                      <p className="text-gray-500">Choose a stay from the list to view details</p>
                    </div>
                  </div>
                )
              }
            />

            {/* Show More / Pagination placeholder */}
            {filteredStays.length > 9 && (
              <div className="mt-8 text-center">
                <button className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-indigo-500 hover:text-indigo-600 font-semibold transition-colors">
                  Load More Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
