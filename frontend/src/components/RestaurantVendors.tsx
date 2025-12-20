import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Star, Users, Search, Heart, Clock, X, Phone, Mail, ExternalLink, Navigation, Share2, DollarSign } from 'lucide-react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MasterDetailLayout } from './MasterDetailLayout';
import { ListItem } from './ListItem';
import { DetailPanel } from './DetailPanel';
import demoData from '../data/restaurants.demo.json';

// City name mappings for display
const cityNames: Record<string, string> = {
  'langkawi': 'Langkawi',
  'alor-setar': 'Alor Setar', 
  'sungai-petani': 'Sungai Petani',
  'kulim': 'Kulim',
  'jitra': 'Jitra'
};

// Interface for restaurant data
interface Restaurant {
  id: number;
  name: string;
  city: string;
  cuisine: string;
  rating: number;
  reviews: number;
  priceRange: string;
  image: string;
  specialty: string;
  visitors: number;
  isLive?: boolean;
  badges?: string[];
}

interface RestaurantVendorsProps {
  timeRange?: string;
  selectedCity: string;
}

export function RestaurantVendors({ selectedCity }: RestaurantVendorsProps) {
  // State management - Initialize with demo data for presentation
  const [restaurants, setRestaurants] = useState<Restaurant[]>(demoData.results || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showOpenNowOnly, setShowOpenNowOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleGetDirections = () => {
    if (selectedRestaurant) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.name + ' ' + selectedRestaurant.city)}`, '_blank');
    }
  };

  const handleShare = () => {
    if (selectedRestaurant && navigator.share) {
      navigator.share({
        title: selectedRestaurant.name,
        text: `Check out ${selectedRestaurant.name} - ${selectedRestaurant.specialty}`,
        url: window.location.href
      }).catch(() => {});
    }
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Fetch data from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        
        // ✅ BUILD CITY FILTER PARAMETER
        const cityParam = selectedCity && selectedCity !== 'all' ? `?city=${selectedCity}` : '';
        
        // Fetch vendors - WITH CITY FILTER
        const response = await axios.get(`/vendors/${cityParam}`);
        const vendors = response.data.results || [];
        
        // Transform vendor data to restaurant format
        const backendRestaurants = vendors.map((vendor: any) => ({
          id: vendor.id + 1000, // Offset IDs to avoid conflicts with demo data
          name: vendor.name,
          cuisine: vendor.cuisines?.[0] || 'General',
          rating: vendor.rating_average || 4.0,
          reviews: vendor.total_reviews || 0,
          priceRange: '$$', // Default price range since it's not in API
          specialty: vendor.cuisines?.join(', ') || 'Local cuisine',
          location: vendor.city || 'Kedah',
          city: vendor.city?.toLowerCase().replace(/\s+/g, '-') || 'kedah',
          image: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=225&fit=crop`, // Default image
          visitors: Math.floor(Math.random() * 20000) + 1000 // Generate random visitor count
        }));
        
        // Merge backend data with demo data to keep all cities represented
        const allRestaurants = [...demoData.results, ...backendRestaurants];
        setRestaurants(allRestaurants);
      } catch (err) {
        console.error('Error fetching vendors:', err);
        // Keep demo data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [selectedCity]);

  // Filter and search logic
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
      
      const matchesCity = selectedCity === 'all' || restaurant.city === selectedCity;
      
      const matchesPriceRange = selectedPriceRange === 'all' || restaurant.priceRange === selectedPriceRange;
      
      const matchesRating = restaurant.rating >= minRating;
      
      return matchesSearch && matchesCuisine && matchesCity && matchesPriceRange && matchesRating;
    });
  }, [restaurants, searchQuery, selectedCuisine, selectedCity, selectedPriceRange, minRating]);

  // Sort restaurants
  const sortedRestaurants = useMemo(() => {
    return [...filteredRestaurants].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price_asc':
          return a.priceRange.length - b.priceRange.length;
        case 'price_desc':
          return b.priceRange.length - a.priceRange.length;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });
  }, [filteredRestaurants, sortBy]);

  // Auto-select first restaurant
  useEffect(() => {
    if (sortedRestaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(sortedRestaurants[0]);
    } else if (sortedRestaurants.length === 0) {
      setSelectedRestaurant(null);
    }
  }, [sortedRestaurants]);

  // Get unique cuisines for the filter
  const cuisineTypes = Array.from(new Set(restaurants.map(r => r.cuisine)));

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Loading restaurants...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card className="bg-white" style={{ border: '1px solid #E5E7EB' }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.slice(0, 5).map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => toggleCategory(cuisine)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategories.includes(cuisine)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="$">$ Budget</option>
              <option value="$$">$$ Moderate</option>
              <option value="$$$">$$$ Expensive</option>
            </select>

            {/* Rating */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">All Ratings</option>
              <option value="4.5">⭐ 4.5+ Stars</option>
              <option value="4">⭐ 4+ Stars</option>
              <option value="3">⭐ 3+ Stars</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
              <option value="reviews">Most Reviews</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCuisine('all');
                setSelectedPriceRange('all');
                setMinRating(0);
                setSelectedCategories([]);
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Clear
            </button>

            {/* Results Count */}
            <div className="text-sm text-gray-600 ml-auto">
              <span className="font-bold text-blue-600">{sortedRestaurants.length}</span> restaurants
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master-Detail Layout */}
      <MasterDetailLayout
        leftPanel={
          <div className="bg-white">
            {sortedRestaurants.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No restaurants found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              sortedRestaurants.map((restaurant, index) => (
                <ListItem
                  key={restaurant.id || index}
                  title={restaurant.name}
                  subtitle={`${restaurant.cuisine} • ${cityNames[restaurant.city] || restaurant.city}`}
                  metrics={[
                    { 
                      label: 'Rating', 
                      value: typeof restaurant.rating === 'number' ? `${restaurant.rating.toFixed(1)} ★` : 'N/A',
                      icon: <Star className="w-3 h-3" />
                    },
                    { 
                      label: 'Reviews', 
                      value: restaurant.reviews || 0,
                      icon: <Users className="w-3 h-3" />
                    },
                    { 
                      label: 'Price', 
                      value: restaurant.priceRange,
                      icon: <DollarSign className="w-3 h-3" />
                    }
                  ]}
                  badge={
                    restaurant.isLive && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Open
                      </Badge>
                    )
                  }
                  rightContent={
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(restaurant.id, e);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.has(restaurant.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                      />
                    </button>
                  }
                  isSelected={selectedRestaurant?.id === restaurant.id}
                  onClick={() => handleSelectRestaurant(restaurant)}
                />
              ))
            )}
          </div>
        }
        rightPanel={
          selectedRestaurant ? (
            <DetailPanel
              title={selectedRestaurant.name}
              subtitle={`${selectedRestaurant.cuisine} • ${cityNames[selectedRestaurant.city] || selectedRestaurant.city}`}
              image={selectedRestaurant.image}
              actions={
                <div className="flex gap-3">
                  <button
                    onClick={handleGetDirections}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedRestaurant.id, {} as any)}
                    className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.has(selectedRestaurant.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              }
            >
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600 fill-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-900">{typeof selectedRestaurant.rating === 'number' ? selectedRestaurant.rating.toFixed(1) : 'N/A'}</div>
                  <div className="text-xs text-yellow-600 font-medium">Rating</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-900">{selectedRestaurant.reviews || 0}</div>
                  <div className="text-xs text-blue-600 font-medium">Reviews</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-900">{selectedRestaurant.priceRange}</div>
                  <div className="text-xs text-green-600 font-medium">Price Range</div>
                </div>
              </div>

              {/* Specialty */}
              {selectedRestaurant.specialty && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialty</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedRestaurant.specialty}</p>
                </div>
              )}

              {/* Star Rating Display */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating Details</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-5 w-5 ${
                          index < Math.floor(selectedRestaurant.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : index < selectedRestaurant.rating
                            ? 'text-yellow-400 fill-yellow-200'
                            : 'text-gray-300 fill-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {typeof selectedRestaurant.rating === 'number' ? selectedRestaurant.rating.toFixed(1) : 'N/A'} out of 5
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Based on {selectedRestaurant.reviews} reviews
                </p>
              </div>

              {/* Badges */}
              {selectedRestaurant.badges && selectedRestaurant.badges.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRestaurant.badges.map((badge, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700 border-blue-300">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </DetailPanel>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a restaurant</h3>
                <p className="text-gray-500">Choose a restaurant from the list to view details</p>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
