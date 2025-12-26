import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Star, Users, Search, Heart, Clock, X, Phone, Mail, ExternalLink, Navigation, Share2, DollarSign, CalendarPlus, Utensils, Flame, Leaf } from 'lucide-react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MasterDetailLayout } from './MasterDetailLayout';
import { ListItem } from './ListItem';
import { DetailPanel } from './DetailPanel';
import { ReservationModal } from './ReservationModal';
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

// Interface for menu items
interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_halal: boolean;
  spiciness_level: number;
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
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // Fetch menu when restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      setIsLoadingMenu(true);
      api.get(`/vendors/${selectedRestaurant.id}/menu/`)
        .then(res => {
          setMenuItems(res.data || []);
        })
        .catch(err => {
          console.error('Error fetching menu:', err);
          setMenuItems([]);
        })
        .finally(() => setIsLoadingMenu(false));
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurant]);

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
        
        console.log('[RestaurantVendors] Fetching vendors from:', api.defaults.baseURL + '/vendors/');
        
        // Build query params
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') {
          params.append('city', selectedCity);
        }
        
        // Fetch ALL vendors from backend (handle pagination)
        let allVendors: any[] = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const pageParams = new URLSearchParams(params);
          if (page > 1) {
            pageParams.append('page', page.toString());
          }
          
          const response = await api.get(`/vendors/?${pageParams.toString()}`);
          const pageVendors = response.data.results || response.data || [];
          allVendors = [...allVendors, ...pageVendors];
          
          console.log('[RestaurantVendors] Fetched page', page, ', total so far:', allVendors.length);
          
          // Check if there's a next page
          hasMore = !!response.data.next;
          page++;
        }
        
        console.log('[RestaurantVendors] Total vendors fetched:', allVendors.length);
        
        // Transform vendor data to restaurant format matching backend Vendor model
        const backendRestaurants = allVendors.map((vendor: any) => ({
          id: vendor.id,
          name: vendor.name,
          cuisine: vendor.cuisines?.[0] || 'General',
          rating: vendor.rating_average || 4.0,
          reviews: vendor.total_reviews || 0,
          priceRange: vendor.price_range || '$$',
          specialty: vendor.description || vendor.cuisines?.join(', ') || 'Local cuisine',
          location: vendor.city || 'Kedah',
          city: vendor.city?.toLowerCase().replace(/\s+/g, '-') || 'kedah',
          image: vendor.cover_image_url || vendor.logo_url || vendor.gallery_images?.[0] || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=225&fit=crop`,
          visitors: Math.floor(Math.random() * 20000) + 1000, // Mock visitor count
          badges: vendor.amenities?.halal_certified ? ['Halal'] : []
        }));
        
        // If backend has data, use it; otherwise keep demo data
        if (backendRestaurants.length > 0) {
          console.log('[RestaurantVendors] Using backend data');
          setRestaurants(backendRestaurants);
        } else {
          console.warn('[RestaurantVendors] No backend data, keeping demo');
        }
      } catch (err) {
        console.error('[RestaurantVendors] Error fetching vendors:', err);
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
    } else if (sortedRestaurants.length === 0 && selectedRestaurant !== null) {
      setSelectedRestaurant(null);
    }
  }, [sortedRestaurants, selectedRestaurant]);

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
        leftPanelWidth="w-2/5"
        rightPanelWidth="w-3/5"
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

              {/* Menu Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  Menu
                </h3>
                {isLoadingMenu ? (
                  <div className="text-center py-4 text-gray-500">Loading menu...</div>
                ) : menuItems.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* Group by category */}
                    {Object.entries(
                      menuItems.reduce((acc, item) => {
                        if (!acc[item.category]) acc[item.category] = [];
                        acc[item.category].push(item);
                        return acc;
                      }, {} as Record<string, MenuItem[]>)
                    ).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{category}</h4>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{item.name}</span>
                                  {item.is_vegetarian && (
                                    <Leaf className="w-4 h-4 text-green-500" title="Vegetarian" />
                                  )}
                                  {item.spiciness_level > 0 && (
                                    <span className="flex items-center" title={`Spiciness: ${item.spiciness_level}/5`}>
                                      {[...Array(Math.min(item.spiciness_level, 3))].map((_, i) => (
                                        <Flame key={i} className="w-3 h-3 text-red-500" />
                                      ))}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                )}
                              </div>
                              <span className="font-semibold text-orange-600 ml-3">
                                RM {parseFloat(item.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No menu available</p>
                )}
              </div>

              {/* Reservation Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsReservationModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  <CalendarPlus className="w-5 h-5" />
                  Make a Reservation
                </button>
              </div>
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

      {/* Reservation Modal */}
      {isReservationModalOpen && selectedRestaurant && (
        <ReservationModal
          restaurant={selectedRestaurant}
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
        />
      )}
    </div>
  );
}
