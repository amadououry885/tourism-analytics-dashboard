import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Users, TrendingUp, Star, Navigation, Share2, ExternalLink, DollarSign, Clock } from 'lucide-react';
import { MasterDetailLayout } from './MasterDetailLayout';
import { ListItem } from './ListItem';
import { DetailPanel } from './DetailPanel';

interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  city: string;
  state?: string;
  country?: string;
  is_free: boolean;
  price?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  wikipedia_url?: string;
  official_website?: string;
  tripadvisor_url?: string;
  google_maps_url?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  opening_hours?: string;
  best_time_to_visit?: string;
  amenities?: any;
  is_open?: boolean;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  timeRange?: string;
  selectedCity: string;
}

// Demo places data for fallback
const defaultPlaces: Place[] = [
  {
    id: 1,
    name: 'Zahir Mosque',
    description: 'One of the grandest and oldest mosques in Malaysia',
    category: 'Heritage',
    city: 'Alor Setar',
    state: 'Kedah',
    is_free: true,
    is_open: true,
    latitude: 6.1248,
    longitude: 100.3678,
    image_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800',
    opening_hours: 'Daily 8:00 AM - 6:00 PM (except prayer times)'
  },
  {
    id: 2,
    name: 'Pantai Cenang Beach',
    description: 'Popular beach destination with water sports and dining',
    category: 'Beach',
    city: 'Langkawi',
    state: 'Kedah',
    is_free: true,
    is_open: true,
    latitude: 6.2885,
    longitude: 99.7431,
    image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    opening_hours: '24/7'
  },
  {
    id: 3,
    name: 'Langkawi Sky Bridge',
    description: 'Curved pedestrian cable-stayed bridge with panoramic views',
    category: 'Attraction',
    city: 'Langkawi',
    state: 'Kedah',
    is_free: false,
    is_open: true,
    price: 15,
    currency: 'MYR',
    latitude: 6.3833,
    longitude: 99.6611,
    image_url: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800',
    opening_hours: 'Daily 9:30 AM - 7:00 PM'
  },
  {
    id: 4,
    name: 'Dataran Lang (Eagle Square)',
    description: 'Iconic landmark featuring a giant eagle sculpture',
    category: 'Landmark',
    city: 'Langkawi',
    state: 'Kedah',
    is_free: true,
    is_open: true,
    latitude: 6.3284,
    longitude: 99.8517,
    image_url: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800',
    opening_hours: '24/7'
  },
  {
    id: 5,
    name: 'Alor Setar Tower',
    description: 'Tallest telecommunications tower in Malaysia',
    category: 'Observation',
    city: 'Alor Setar',
    state: 'Kedah',
    is_free: false,
    is_open: true,
    price: 20,
    currency: 'MYR',
    latitude: 6.1187,
    longitude: 100.3656,
    image_url: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800',
    opening_hours: 'Daily 10:00 AM - 10:00 PM'
  }
];

function SetViewOnChange({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

const MapView: React.FC<MapViewProps> = ({ selectedCity, center = [6.1200, 100.3667], zoom = 8 }) => {
  const [places, setPlaces] = useState<Place[]>(defaultPlaces);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') {
          params.append('city', selectedCity);
        }
        
        // Add timestamp to prevent caching
        params.append('_t', Date.now().toString());
        
        const response = await api.get(`/places/?${params.toString()}`);
        const backendPlaces = response.data.results || response.data || [];
        
        console.log('[MapView] Loaded', backendPlaces.length, 'places, first has is_open:', backendPlaces[0]?.is_open);
        
        if (backendPlaces.length > 0) {
          setPlaces(backendPlaces);
        }
      } catch (error) {
        console.error('[MapView] Error:', error);
        // Keep demo data on error
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [selectedCity]);

  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      const matchesSearch = searchTerm === '' || 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [places, searchTerm, selectedCategory]);

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleGetDirections = () => {
    if (selectedPlace) {
      if (selectedPlace.google_maps_url) {
        window.open(selectedPlace.google_maps_url, '_blank');
      } else if (selectedPlace.latitude && selectedPlace.longitude) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${selectedPlace.latitude},${selectedPlace.longitude}`, '_blank');
      } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + ' ' + selectedPlace.city)}`, '_blank');
      }
    }
  };

  const handleShare = () => {
    if (selectedPlace && navigator.share) {
      navigator.share({
        title: selectedPlace.name,
        text: selectedPlace.description,
        url: window.location.href
      }).catch(() => {});
    }
  };

  const markers = filteredPlaces
    .filter(place => place.latitude && place.longitude)
    .map(place => ({ 
      position: [place.latitude!, place.longitude!] as [number, number], 
      title: place.name,
      id: place.id
    }));

  const categories = ['all', ...Array.from(new Set(places.map(p => p.category)))];

  // Render place item for list
  const renderPlaceItem = (place: Place, index: number) => {
    // DEBUG: ALWAYS show a test badge
    const badgeElement = (
      <div style={{ 
        backgroundColor: '#16a34a', 
        color: '#ffffff', 
        padding: '4px 8px', 
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        TEST BADGE
      </div>
    );
    
    return (
    <ListItem
      key={place.id}
      index={index}
      title={place.name}
      subtitle={place.description}
      accentColor="#2563EB"
      metrics={[
        { 
          label: 'Category', 
          value: place.category,
          icon: <MapPin className="w-3 h-3" />
        },
        { 
          label: 'Location', 
          value: place.city,
          icon: <Navigation className="w-3 h-3" />
        },
        ...(!place.is_free && place.price ? [{
          label: 'Price',
          value: `${place.currency || 'MYR'} ${place.price}`,
          icon: <DollarSign className="w-3 h-3" />
        }] : []),
        ...(place.is_free ? [{
          label: 'Entry',
          value: 'Free',
          icon: <DollarSign className="w-3 h-3" />
        }] : [])
      ]}
      badge={badgeElement}
      isSelected={selectedPlace?.id === place.id}
      onClick={() => handleSelectPlace(place)}
    />
    );
  };

  // Render place details panel
  const renderPlaceDetails = () => {
    if (!selectedPlace) {
      return (
        <div className=\"flex items-center justify-center h-full text-gray-500\">
          <div className=\"text-center\">
            <MapPin className=\"w-16 h-16 mx-auto mb-4 text-gray-300\" />
            <p>Select a place to view details</p>
          </div>
        </div>
      );
    }

    return (
      <DetailPanel
        title={selectedPlace.name}
        onGetDirections={handleGetDirections}
        onShare={handleShare}
      >
        {selectedPlace.image_url && (
          <img 
            src={selectedPlace.image_url} 
            alt={selectedPlace.name}
            className=\"w-full h-64 object-cover rounded-lg mb-4\"
          />
        )}
        
        <div className=\"space-y-4\">
          <div>
            <h4 className=\"font-semibold text-gray-900 mb-2\">Description</h4>
            <p className=\"text-gray-600\">{selectedPlace.description}</p>
          </div>

          <div className=\"grid grid-cols-2 gap-4\">
            <div>
              <h4 className=\"font-semibold text-gray-900 mb-2\">Category</h4>
              <Badge>{selectedPlace.category}</Badge>
            </div>
            <div>
              <h4 className=\"font-semibold text-gray-900 mb-2\">Status</h4>
              {selectedPlace.is_open !== undefined ? (
                <span 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md" 
                  style={{ 
                    backgroundColor: selectedPlace.is_open ? '#16a34a' : '#dc2626', 
                    color: '#ffffff',
                    border: '1px solid transparent'
                  }}
                >
                  <Clock className=\"w-3 h-3 mr-1\" style={{ color: '#ffffff' }} />
                  {selectedPlace.is_open ? 'OPEN' : 'CLOSED'}
                </span>
              ) : (
                <span className="text-gray-500 text-sm">Status not available</span>
              )}
            </div>
          </div>

          <div className=\"grid grid-cols-2 gap-4\">
            <div>
              <h4 className=\"font-semibold text-gray-900 mb-2\">Location</h4>
              <p className=\"text-gray-600\">{selectedPlace.city}{selectedPlace.state && `, ${selectedPlace.state}`}</p>
            </div>

          {selectedPlace.opening_hours && (
            <div>
              <h4 className=\"font-semibold text-gray-900 mb-2 flex items-center gap-2\">
                <Clock className=\"w-4 h-4\" />
                Opening Hours
              </h4>
              <p className=\"text-gray-600\">{selectedPlace.opening_hours}</p>
            </div>
          )}

          <div>
            <h4 className=\"font-semibold text-gray-900 mb-2 flex items-center gap-2\">
              <DollarSign className=\"w-4 h-4\" />
              Pricing
            </h4>
            {selectedPlace.is_free ? (
              <Badge variant=\"outline\" className=\"text-green-600 border-green-600\">Free Entry</Badge>
            ) : (
              <p className=\"text-gray-900 font-semibold\">
                {selectedPlace.currency || 'MYR'} {selectedPlace.price}
              </p>
            )}
          </div>

          {selectedPlace.address && (
            <div>
              <h4 className=\"font-semibold text-gray-900 mb-2\">Address</h4>
              <p className=\"text-gray-600\">{selectedPlace.address}</p>
            </div>
          )}

          {selectedPlace.contact_phone && (
            <div>
              <h4 className=\"font-semibold text-gray-900 mb-2\">Contact</h4>
              <p className=\"text-gray-600\">{selectedPlace.contact_phone}</p>
              {selectedPlace.contact_email && (
                <p className=\"text-gray-600\">{selectedPlace.contact_email}</p>
              )}
            </div>
          )}

          {selectedPlace.best_time_to_visit && (
            <div>
              <h4 className=\"font-semibold text-gray-900 mb-2\">Best Time to Visit</h4>
              <p className=\"text-gray-600\">{selectedPlace.best_time_to_visit}</p>
            </div>
          )}

          {selectedPlace.amenities && Object.keys(selectedPlace.amenities).length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedPlace.amenities).map(([key, value]) => (
                  value && (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  )
                ))}
              </div>
            </div>
          )}

          {(selectedPlace.official_website || selectedPlace.tripadvisor_url || selectedPlace.wikipedia_url) && (
            <div>
              <h4 className=\"font-semibold text-gray-900 mb-2\">Links</h4>
              <div className=\"flex flex-wrap gap-2\">
                {selectedPlace.official_website && (
                  <a href={selectedPlace.official_website} target=\"_blank\" rel=\"noopener noreferrer\" 
                     className=\"inline-flex items-center gap-1 text-blue-600 hover:underline text-sm\">
                    <ExternalLink className=\"w-3 h-3\" />
                    Official Website
                  </a>
                )}
                {selectedPlace.tripadvisor_url && (
                  <a href={selectedPlace.tripadvisor_url} target=\"_blank\" rel=\"noopener noreferrer\"
                     className=\"inline-flex items-center gap-1 text-blue-600 hover:underline text-sm\">
                    <ExternalLink className=\"w-3 h-3\" />
                    TripAdvisor
                  </a>
                )}
                {selectedPlace.wikipedia_url && (
                  <a href={selectedPlace.wikipedia_url} target=\"_blank\" rel=\"noopener noreferrer\"
                     className=\"inline-flex items-center gap-1 text-blue-600 hover:underline text-sm\">
                    <ExternalLink className=\"w-3 h-3\" />
                    Wikipedia
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </DetailPanel>
    );
  };

  return (
    <MasterDetailLayout
      title=\"Places & Attractions\"
      subtitle={`${filteredPlaces.length} places in ${selectedCity === 'all' ? 'Kedah' : selectedCity}`}
      searchPlaceholder=\"Search places...\"
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={
        <div className=\"flex gap-2 flex-wrap\">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      }
      listContent={
        <>
          {/* Map Preview */}
          <div className=\"mb-4\">
            <div className=\"relative w-full h-64 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden\">
              <MapContainer 
                center={selectedPlace && selectedPlace.latitude && selectedPlace.longitude 
                  ? [selectedPlace.latitude, selectedPlace.longitude] 
                  : center} 
                zoom={selectedPlace ? 12 : zoom} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                key={`map-${selectedPlace?.id || 'default'}`}
              >
                <SetViewOnChange 
                  center={selectedPlace && selectedPlace.latitude && selectedPlace.longitude 
                    ? [selectedPlace.latitude, selectedPlace.longitude] 
                    : center} 
                  zoom={selectedPlace ? 12 : zoom} 
                />
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"
                />
                {markers.map((m, index) => (
                  <Marker key={`marker-${m.id}-${index}`} position={m.position}>
                    <Popup>{m.title}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
          
          {/* Places List */}
          {loading ? (
            <div className=\"text-center py-8 text-gray-500\">Loading places...</div>
          ) : filteredPlaces.length === 0 ? (
            <div className=\"text-center py-8 text-gray-500\">No places found</div>
          ) : (
            filteredPlaces.map(renderPlaceItem)
          )}
        </>
      }
      detailContent={renderPlaceDetails()}
    />
  );
};

export default MapView;
