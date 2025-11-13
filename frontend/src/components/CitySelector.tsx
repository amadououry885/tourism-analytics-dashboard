import { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import axios from 'axios';

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ FETCH ALL UNIQUE CITIES FROM BACKEND
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        
        // ✅ CHANGE FROM 8001 TO 8000 (or your actual backend port)
        const endpoints = [
          'http://localhost:8000/api/events/',
          'http://localhost:8000/api/transport/routes/',
          'http://localhost:8000/api/stays/',
          'http://localhost:8000/api/vendors/',
        ];

        console.log('🔍 Fetching cities from endpoints...');

        const responses = await Promise.allSettled(
          endpoints.map(url => 
            axios.get(url)
              .catch(err => {
                console.warn(`Failed to fetch from ${url}:`, err.message);
                return { data: { results: [] } };
              })
          )
        );

        // Extract cities from all endpoints
        const citiesSet = new Set<string>();

        responses.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const data = result.value.data;
            const items = data.results || data || [];
            
            console.log(`✅ Endpoint ${index + 1} returned ${items.length} items`);

            // From events
            if (index === 0) {
              items.forEach((event: any) => {
                if (event.city) {
                  citiesSet.add(event.city);
                  console.log(`📍 Found city from event: ${event.city}`);
                }
              });
            }
            
            // From transport routes
            if (index === 1) {
              items.forEach((route: any) => {
                if (route.city) {
                  citiesSet.add(route.city);
                  console.log(`📍 Found city from transport: ${route.city}`);
                }
              });
            }
            
            // From stays
            if (index === 2) {
              items.forEach((stay: any) => {
                if (stay.district) {
                  citiesSet.add(stay.district);
                  console.log(`📍 Found city from stay: ${stay.district}`);
                }
              });
            }
            
            // From vendors
            if (index === 3) {
              items.forEach((vendor: any) => {
                if (vendor.city) {
                  citiesSet.add(vendor.city);
                  console.log(`📍 Found city from vendor: ${vendor.city}`);
                }
              });
            }
          }
        });

        // Convert to sorted array
        const sortedCities = Array.from(citiesSet).sort();
        console.log(`✅ Total unique cities found: ${sortedCities.length}`, sortedCities);
        
        setCities(sortedCities);
        
        // If no cities found, use defaults
        if (sortedCities.length === 0) {
          console.warn('⚠️ No cities found from API, using default cities');
          setCities(['Alor Setar', 'Langkawi', 'Sungai Petani', 'Kuah', 'Kedah Darul Aman Negara']);
        }
      } catch (error) {
        console.error('❌ Error fetching cities:', error);
        // Fallback to default cities
        setCities(['Alor Setar', 'Langkawi', 'Sungai Petani', 'Kuah', 'Kedah Darul Aman Negara']);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // ✅ FILTER CITIES BASED ON SEARCH TERM
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-xs">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-between shadow-lg font-semibold"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <span>
            {selectedCity && selectedCity !== 'all'
              ? selectedCity
              : loading
              ? '⏳ Loading Cities...'
              : cities.length > 0
              ? '🌍 All Cities'
              : '❌ No cities found'}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-xl z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* City List */}
          <div className="max-h-64 overflow-y-auto">
            {/* All Cities Option */}
            <button
              onClick={() => {
                onCityChange('all');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                selectedCity === 'all' || selectedCity === ''
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-lg">🌍</span>
              <span>All Cities</span>
              {(selectedCity === 'all' || selectedCity === '') && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>

            {/* Individual Cities */}
            {loading ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                ⏳ Loading cities...
              </div>
            ) : cities.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                ❌ No cities available
              </div>
            ) : filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onCityChange(city);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-b-0 ${
                    selectedCity === city
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">📍</span>
                  <span>{city}</span>
                  {selectedCity === city && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                ❌ No cities found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
