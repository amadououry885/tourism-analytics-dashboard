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

  // ✅ FETCH ALL CITIES FROM PLACES API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Fetching cities from Places API...');

        // ✅ Use the correct Places API endpoint (with trailing slash)
        const response = await axios.get('/api/analytics/places/list/');
        const places = response.data;
        
        console.log('🏙️ Fetched places from analytics API:', places);
        
        // Extract UNIQUE city names from places (not place names!)
        const allCities = places
          .map((place: any) => place.city)
          .filter((city: string) => city && city.trim() !== ''); // Remove empty/null cities
        
        // Remove duplicates using Set, then sort
        const uniqueCities = Array.from(new Set(allCities)) as string[];
        uniqueCities.sort();
        
        console.log(`✅ Total unique cities found: ${uniqueCities.length}`, uniqueCities);
        setCities(uniqueCities);
        
      } catch (error) {
        console.error('❌ Error fetching cities:', error);
        // Fallback to default cities (sorted alphabetically, matching database)
        setCities(['Alor Setar', 'Jitra', 'Kuah', 'Langkawi', 'Sungai Petani']);
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-b from-blue-50 to-white border-2 border-blue-300 rounded-lg shadow-2xl z-[60]">
          {/* Search Input */}
          <div className="p-3 border-b-2 border-blue-200 bg-blue-100/50">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
              <input
                type="text"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white font-medium text-gray-900 placeholder:text-gray-500"
                autoFocus
              />
            </div>
          </div>

          {/* City List */}
          <div className="max-h-96 overflow-y-auto">
            {/* All Cities Option */}
            <button
              onClick={() => {
                onCityChange('all');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`w-full text-left px-4 py-3 hover:bg-blue-100 transition-colors flex items-center gap-2 border-b-2 border-blue-100 font-medium ${
                selectedCity === 'all' || selectedCity === ''
                  ? 'bg-blue-200 text-blue-900 font-bold'
                  : 'text-gray-900 bg-blue-50/30'
              }`}
            >
              <span className="text-lg">🌍</span>
              <span>All Cities</span>
              {(selectedCity === 'all' || selectedCity === '') && (
                <span className="ml-auto text-blue-700 font-bold">✓</span>
              )}
            </button>

            {/* Individual Cities */}
            {loading ? (
              <div className="px-4 py-3 text-gray-700 text-center bg-blue-50/50 font-medium">
                ⏳ Loading cities...
              </div>
            ) : cities.length === 0 ? (
              <div className="px-4 py-3 text-gray-700 text-center bg-blue-50/50 font-medium">
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
                  className={`w-full text-left px-4 py-3 hover:bg-blue-100 transition-colors flex items-center gap-2 border-b-2 border-blue-100 last:border-b-0 font-medium ${
                    selectedCity === city
                      ? 'bg-blue-200 text-blue-900 font-bold'
                      : 'text-gray-900 bg-blue-50/30'
                  }`}
                >
                  <span className="text-lg">📍</span>
                  <span>{city}</span>
                  {selectedCity === city && (
                    <span className="ml-auto text-blue-700 font-bold">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-700 text-center bg-blue-50/50 font-medium">
                ❌ No cities found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
