import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Star, Users, Search } from 'lucide-react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchHybrid, buildUrlWithParams } from '../lib/hybrid';
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
}

interface RestaurantVendorsProps {
  timeRange?: string;
  selectedCity: string;
}

export function RestaurantVendors({ selectedCity }: RestaurantVendorsProps) {
  // State management
  const [restaurants, setRestaurants] = useState<Restaurant[]>(demoData.results);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const url = buildUrlWithParams('/vendors/restaurants', { city: selectedCity });
        const result = await fetchHybrid(url, { 
          signal: controller.signal,
          demoData
        });
        
        setRestaurants(Array.isArray(result) ? result : result.results || demoData.results);
      } catch (err) {
        if (err instanceof Error) {
          setError('Unable to load live data. Showing demo data.');
          setRestaurants(demoData.results);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
    return () => controller.abort();
  }, [selectedCity]);

  // Filter and search logic
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCuisine = selectedCuisine === 'all' || 
      restaurant.cuisine.toLowerCase() === selectedCuisine.toLowerCase();
    
    return matchesSearch && matchesCuisine;
  });

  // Get unique cuisines for the filter
  const cuisineTypes = Array.from(new Set(restaurants.map(r => r.cuisine)));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading restaurants...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Restaurants {selectedCity !== 'all' && ` in ${cityNames[selectedCity]}`}
          {error && <span className="text-sm text-red-500 ml-2">{error}</span>}
        </h2>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-900" />
              <Input
                type="text"
                placeholder="Search by name, cuisine or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cuisines</option>
              {cuisineTypes.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <Card key={restaurant.id} className="bg-white border-gray-200 shadow-sm overflow-hidden hover:border-blue-400 transition-colors">
            <div className="aspect-video relative">
              <ImageWithFallback
                src={restaurant.image}
                alt={restaurant.name}
                width={400}
                height={225}
                className="object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-blue-600/90 text-white border-0 backdrop-blur-sm">
                  {restaurant.priceRange}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-green-500/20 text-green-700 border-green-500/30 backdrop-blur-sm">
                  {restaurant.cuisine}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-gray-900">{restaurant.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-900" />
                  <span className="text-gray-900">{cityNames[restaurant.city]}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-blue-800/30 text-gray-900">{restaurant.specialty}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-700 fill-yellow-400" />
                    <span className="text-gray-900">{restaurant.rating}</span>
                    <span className="text-gray-900">({restaurant.reviews.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-900">
                    <Users className="h-4 w-4" />
                    <span>{restaurant.visitors.toLocaleString()} visitors</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredRestaurants.length === 0 && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <p className="text-gray-900">No restaurants found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}