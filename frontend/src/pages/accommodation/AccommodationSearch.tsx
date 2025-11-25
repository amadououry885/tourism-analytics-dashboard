import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MapPin, DollarSign, Star, Home, X, ChevronDown, Sparkles, TrendingUp } from 'lucide-react';
import { StayCard } from '../../components/StayCard';
import { Stay, HybridSearchResponse } from '../../types/stay';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

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

export default function AccommodationSearch() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [filteredStays, setFilteredStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalCount, setInternalCount] = useState(0);
  const [externalCount, setExternalCount] = useState(0);
  
  // Filters
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

  // Auto-suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
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
      
      const response = await axios.get<HybridSearchResponse>(
        `/api/stays/hybrid_search/?${params.toString()}`
      );
      
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
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search by name, location, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-16 pr-16 py-5 text-lg border-0 rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50 text-gray-900 bg-white"
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

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                showFilters
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {(district || type || minPrice || maxPrice || minRating || selectedAmenities.length > 0) && (
                <Badge className="bg-red-500 text-white border-0 ml-1">
                  {[district, type, minPrice, maxPrice, minRating, ...selectedAmenities].filter(Boolean).length}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="max-w-6xl mx-auto">
              {/* Type Filters - Pill Style */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Property Type</label>
                <div className="flex flex-wrap gap-2">
                  {STAY_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setType(type === t.value ? '' : t.value)}
                      className={`px-5 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 ${
                        type === t.value
                          ? t.color + ' shadow-lg transform scale-105'
                          : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* District */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 appearance-none bg-white font-medium text-gray-900"
                    >
                      {DISTRICTS.map(d => (
                        <option key={d} value={d === 'All Districts' ? '' : d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Price Range (RM/night)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 font-medium"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Minimum Rating
                  </label>
                  <div className="relative">
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 appearance-none bg-white font-medium text-gray-900"
                    >
                      <option value="">Any Rating</option>
                      <option value="3">⭐⭐⭐ 3+ Stars</option>
                      <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
                      <option value="4.5">⭐⭐⭐⭐⭐ 4.5+ Stars</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Amenities - Icon Style */}
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                  {AMENITIES.map(amenity => (
                    <button
                      key={amenity.name}
                      onClick={() => handleToggleAmenity(amenity.name)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedAmenities.includes(amenity.name)
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{amenity.icon}</span>
                      <span className={`text-xs font-semibold ${
                        selectedAmenities.includes(amenity.name) ? 'text-indigo-700' : 'text-gray-600'
                      }`}>
                        {amenity.name}
                      </span>
                      {selectedAmenities.includes(amenity.name) && (
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters & Clear */}
              {(district || type || minPrice || maxPrice || minRating || selectedAmenities.length > 0) && (
                <div className="mt-6 flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {district && (
                      <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1">
                        📍 {district}
                      </Badge>
                    )}
                    {type && (
                      <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
                        {STAY_TYPES.find(t => t.value === type)?.icon} {type}
                      </Badge>
                    )}
                    {(minPrice || maxPrice) && (
                      <Badge className="bg-green-100 text-green-700 px-3 py-1">
                        💰 RM {minPrice || '0'} - {maxPrice || '∞'}
                      </Badge>
                    )}
                    {minRating && (
                      <Badge className="bg-yellow-100 text-yellow-700 px-3 py-1">
                        ⭐ {minRating}+ Stars
                      </Badge>
                    )}
                    {selectedAmenities.map(a => (
                      <Badge key={a} className="bg-blue-100 text-blue-700 px-3 py-1">
                        {AMENITIES.find(am => am.name === a)?.icon} {a}
                      </Badge>
                    ))}
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Finding the best stays for you...</p>
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
          <>
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

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStays.map((stay) => (
                <div key={stay.id} className="transform transition-all hover:scale-105">
                  <StayCard stay={stay} />
                </div>
              ))}
            </div>

            {/* Show More / Pagination placeholder */}
            {filteredStays.length > 9 && (
              <div className="mt-8 text-center">
                <button className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-indigo-500 hover:text-indigo-600 font-semibold transition-colors">
                  Load More Results
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
