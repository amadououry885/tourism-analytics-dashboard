import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Star, Users, Search, Heart, Clock, X } from 'lucide-react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RestaurantModal } from './RestaurantModal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
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
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
    
    const matchesCity = selectedCity === 'all' || restaurant.city === selectedCity;
    
    const matchesPriceRange = selectedPriceRange === 'all' || restaurant.priceRange === selectedPriceRange;
    
    const matchesRating = restaurant.rating >= minRating;
    
    return matchesSearch && matchesCuisine && matchesCity && matchesPriceRange && matchesRating;
  });

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
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
    <div className="flex gap-6 h-full">
      {/* LEFT SIDEBAR - Filters (Always visible) */}
      <div className="w-72 xl:w-80 flex-shrink-0 overflow-y-auto pr-2">
        <div className="space-y-6">
          {/* Search Box */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          {/* Filters Card */}
          <Card className="bg-white shadow-md border-gray-200">
            <CardContent className="p-6 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {cuisineTypes.slice(0, 6).map(cuisine => (
                    <label key={cuisine} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cuisine)}
                        onChange={() => toggleCategory(cuisine)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-emerald-600 transition-colors">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
                
                {/* Price Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Prices</option>
                    <option value="$">$ - Budget</option>
                    <option value="$$">$$ - Moderate</option>
                    <option value="$$$">$$$ - Expensive</option>
                    <option value="$$$$">$$$$ - Fine Dining</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="0">All Ratings</option>
                    <option value="4.5">⭐ 4.5+ Stars</option>
                    <option value="4">⭐ 4+ Stars</option>
                    <option value="3">⭐ 3+ Stars</option>
                  </select>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="space-y-2">
                    {['WiFi', 'Parking', 'Halal', 'Delivery', 'Outdoor Seating'].map(amenity => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAmenities([...selectedAmenities, amenity]);
                            } else {
                              setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-emerald-600 transition-colors">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCuisine('all');
                  setSelectedPriceRange('all');
                  setMinRating(0);
                  setSelectedAmenities([]);
                  setSelectedCategories([]);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Clear All Filters
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RIGHT CONTENT - Restaurant Grid */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        {/* Scrollable Card Container */}
        <Card className="bg-white shadow-lg border-gray-200 flex flex-col h-full">
          <CardHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Restaurants {selectedCity !== 'all' && ` in ${cityNames[selectedCity]}`}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {sortedRestaurants.length} restaurants found
                </p>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="name">Name (A-Z)</option>
                <option value="reviews">Most Reviews</option>
                <option value="price_asc">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-6 flex-1 overflow-y-auto">
            {/* Scrollable Restaurant Grid */}
            <div className="pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedRestaurants.map((restaurant) => (
                  <Card 
                    key={restaurant.id} 
                    className="bg-white border-gray-200 shadow-md overflow-hidden hover:shadow-xl transition-all group relative rounded-lg"
                  >
                    {/* Image Section */}
                    <div className="h-48 relative overflow-hidden">
                      <ImageWithFallback
                        src={restaurant.image}
                        alt={restaurant.name}
                        width={400}
                        height={192}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        style={{ height: '100%', minHeight: '100%', maxHeight: '100%' }}
                      />
                      
                      {/* Top Right - Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(restaurant.id, e)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
                      >
                        <Heart 
                          className={`h-4 w-4 ${favorites.has(restaurant.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
                        />
                      </button>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {/* Restaurant Name & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-gray-900 line-clamp-1 flex-1">
                            {restaurant.name}
                          </h3>
                          {/* Open/Closed Status */}
                          {Math.random() > 0.3 ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              Open
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-600 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              Closed
                            </span>
                          )}
                        </div>
                        
                        {/* Cuisine Type */}
                        <p className="text-sm text-gray-600">
                          {restaurant.cuisine}
                        </p>
                        
                        {/* Location */}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-600">{cityNames[restaurant.city]}</span>
                        </div>
                        
                        {/* Star Rating */}
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < Math.floor(restaurant.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : index < restaurant.rating
                                  ? 'text-yellow-400 fill-yellow-200'
                                  : 'text-gray-300 fill-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-600">
                            {restaurant.reviews ? `${restaurant.reviews}` : ''}
                          </span>
                        </div>
                        
                        {/* Price */}
                        <p className="text-lg font-bold text-gray-900">
                          {restaurant.priceRange}
                        </p>

                        {/* View Menu Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestaurantClick(restaurant);
                          }}
                          className="w-full mt-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          View Menu
                        </button>
                      </div>
                    </CardContent>
                  </Card>
            ))}
          </div>

          {/* No results */}
          {sortedRestaurants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No restaurants found matching your criteria.</p>
            </div>
          )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Modal */}
      <RestaurantModal 
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}