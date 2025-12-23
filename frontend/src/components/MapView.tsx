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
        
        console.log('[MapView] Fetching places from:', api.defaults.baseURL + '/places/');\n        \n        const params = new URLSearchParams();\n        if (selectedCity && selectedCity !== 'all') {\n          params.append('city', selectedCity);\n        }\n        \n        const response = await api.get(`/places/?${params.toString()}`);\n        const backendPlaces = response.data.results || response.data || [];\n        \n        console.log('[MapView] Received places:', backendPlaces.length);\n        \n        if (backendPlaces.length > 0) {\n          console.log('[MapView] Using backend data');\n          setPlaces(backendPlaces);\n        } else {\n          console.warn('[MapView] No backend data, keeping demo');\n        }\n      } catch (error) {\n        console.error('[MapView] Error fetching places:', error);\n        // Keep demo data on error\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    fetchPlaces();\n  }, [selectedCity]);

  const filteredPlaces = useMemo(() => {\n    return places.filter(place => {\n      const matchesSearch = searchTerm === '' || \n        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||\n        place.description.toLowerCase().includes(searchTerm.toLowerCase());\n      \n      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;\n      \n      return matchesSearch && matchesCategory;\n    });\n  }, [places, searchTerm, selectedCategory]);

  const handleSelectPlace = (place: Place) => {\n    setSelectedPlace(place);\n  };\n\n  const handleGetDirections = () => {\n    if (selectedPlace) {\n      if (selectedPlace.google_maps_url) {\n        window.open(selectedPlace.google_maps_url, '_blank');\n      } else if (selectedPlace.latitude && selectedPlace.longitude) {\n        window.open(`https://www.google.com/maps/search/?api=1&query=${selectedPlace.latitude},${selectedPlace.longitude}`, '_blank');\n      } else {\n        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + ' ' + selectedPlace.city)}`, '_blank');\n      }\n    }\n  };\n\n  const handleShare = () => {\n    if (selectedPlace && navigator.share) {\n      navigator.share({\n        title: selectedPlace.name,\n        text: selectedPlace.description,\n        url: window.location.href\n      }).catch(() => {});\n    }\n  };

  const markers = filteredPlaces\n    .filter(place => place.latitude && place.longitude)\n    .map(place => ({ \n      position: [place.latitude!, place.longitude!] as [number, number], \n      title: place.name,\n      id: place.id\n    }));

  const categories = ['all', ...Array.from(new Set(places.map(p => p.category)))];

  // Render place item for list\n  const renderPlaceItem = (place: Place) => (\n    <ListItem\n      key={place.id}\n      isActive={selectedPlace?.id === place.id}\n      onClick={() => handleSelectPlace(place)}\n    >\n      <div className=\"flex gap-3\">\n        {place.image_url && (\n          <img \n            src={place.image_url} \n            alt={place.name}\n            className=\"w-16 h-16 object-cover rounded-lg flex-shrink-0\"\n          />\n        )}\n        <div className=\"flex-1 min-w-0\">\n          <h3 className=\"font-semibold text-gray-900 truncate\">{place.name}</h3>\n          <p className=\"text-sm text-gray-600 line-clamp-2\">{place.description}</p>\n          <div className=\"flex items-center gap-2 mt-1\">\n            <Badge variant=\"secondary\" className=\"text-xs\">{place.category}</Badge>\n            <span className=\"text-xs text-gray-500\">{place.city}</span>\n            {!place.is_free && place.price && (\n              <span className=\"text-xs text-green-600 font-medium\">\n                {place.currency || 'MYR'} {place.price}\n              </span>\n            )}\n            {place.is_free && (\n              <Badge variant=\"outline\" className=\"text-xs text-green-600 border-green-600\">Free</Badge>\n            )}\n          </div>\n        </div>\n      </div>\n    </ListItem>\n  );

  // Render place details panel\n  const renderPlaceDetails = () => {\n    if (!selectedPlace) {\n      return (\n        <div className=\"flex items-center justify-center h-full text-gray-500\">\n          <div className=\"text-center\">\n            <MapPin className=\"w-16 h-16 mx-auto mb-4 text-gray-300\" />\n            <p>Select a place to view details</p>\n          </div>\n        </div>\n      );\n    }\n\n    return (\n      <DetailPanel\n        title={selectedPlace.name}\n        onGetDirections={handleGetDirections}\n        onShare={handleShare}\n      >\n        {selectedPlace.image_url && (\n          <img \n            src={selectedPlace.image_url} \n            alt={selectedPlace.name}\n            className=\"w-full h-64 object-cover rounded-lg mb-4\"\n          />\n        )}\n        \n        <div className=\"space-y-4\">\n          <div>\n            <h4 className=\"font-semibold text-gray-900 mb-2\">Description</h4>\n            <p className=\"text-gray-600\">{selectedPlace.description}</p>\n          </div>\n\n          <div className=\"grid grid-cols-2 gap-4\">\n            <div>\n              <h4 className=\"font-semibold text-gray-900 mb-2\">Category</h4>\n              <Badge>{selectedPlace.category}</Badge>\n            </div>\n            <div>\n              <h4 className=\"font-semibold text-gray-900 mb-2\">Location</h4>\n              <p className=\"text-gray-600\">{selectedPlace.city}{selectedPlace.state && `, ${selectedPlace.state}`}</p>\n            </div>\n          </div>\n\n          {selectedPlace.opening_hours && (\n            <div>\n              <h4 className=\"font-semibold text-gray-900 mb-2 flex items-center gap-2\">\n                <Clock className=\"w-4 h-4\" />\n                Opening Hours\n              </h4>\n              <p className=\"text-gray-600\">{selectedPlace.opening_hours}</p>\n            </div>\n          )}\n\n          <div>\n            <h4 className=\"font-semibold text-gray-900 mb-2 flex items-center gap-2\">\n              <DollarSign className=\"w-4 h-4\" />\n              Pricing\n            </h4>\n            {selectedPlace.is_free ? (\n              <Badge variant=\"outline\" className=\"text-green-600 border-green-600\">Free Entry</Badge>\n            ) : (\n              <p className=\"text-gray-900 font-semibold\">\n                {selectedPlace.currency || 'MYR'} {selectedPlace.price}\n              </p>\n            )}\n          </div>\n\n          {selectedPlace.address && (\n            <div>\n              <h4 className=\"font-semibold text-gray-900 mb-2\">Address</h4>\n              <p className=\"text-gray-600\">{selectedPlace.address}</p>\n            </div>\n          )}\n\n          {selectedPlace.contact_phone && (\n            <div>\n              <h4 className=\"font-semibold text-gray-900 mb-2\">Contact</h4>\n              <p className=\"text-gray-600\">{selectedPlace.contact_phone}</p>\n              {selectedPlace.contact_email && (\n                <p className=\"text-gray-600\">{selectedPlace.contact_email}</p>\n              )}\n            </div>\n          )}\n\n          {selectedPlace.best_time_to_visit && (\n            <div>\n              <h4 className=\"font-semibold text-gray-900 mb-2\">Best Time to Visit</h4>\n              <p className=\"text-gray-600\">{selectedPlace.best_time_to_visit}</p>\n            </div>\n          )}\n\n          {(selectedPlace.official_website || selectedPlace.tripadvisor_url || selectedPlace.wikipedia_url) && (\n            <div>\n              <h4 className=\"font-semibold text-gray-900 mb-2\">Links</h4>\n              <div className=\"flex flex-wrap gap-2\">\n                {selectedPlace.official_website && (\n                  <a href={selectedPlace.official_website} target=\"_blank\" rel=\"noopener noreferrer\" \n                     className=\"inline-flex items-center gap-1 text-blue-600 hover:underline text-sm\">\n                    <ExternalLink className=\"w-3 h-3\" />\n                    Official Website\n                  </a>\n                )}\n                {selectedPlace.tripadvisor_url && (\n                  <a href={selectedPlace.tripadvisor_url} target=\"_blank\" rel=\"noopener noreferrer\"\n                     className=\"inline-flex items-center gap-1 text-blue-600 hover:underline text-sm\">\n                    <ExternalLink className=\"w-3 h-3\" />\n                    TripAdvisor\n                  </a>\n                )}\n                {selectedPlace.wikipedia_url && (\n                  <a href={selectedPlace.wikipedia_url} target=\"_blank\" rel=\"noopener noreferrer\"\n                     className=\"inline-flex items-center gap-1 text-blue-600 hover:underline text-sm\">\n                    <ExternalLink className=\"w-3 h-3\" />\n                    Wikipedia\n                  </a>\n                )}\n              </div>\n            </div>\n          )}\n        </div>\n      </DetailPanel>\n    );\n  };

  return (\n    <MasterDetailLayout\n      title=\"Places & Attractions\"\n      subtitle={`${filteredPlaces.length} places in ${selectedCity === 'all' ? 'Kedah' : selectedCity}`}\n      searchPlaceholder=\"Search places...\"\n      searchValue={searchTerm}\n      onSearchChange={setSearchTerm}\n      filters={\n        <div className=\"flex gap-2 flex-wrap\">\n          {categories.map(cat => (\n            <button\n              key={cat}\n              onClick={() => setSelectedCategory(cat)}\n              className={`px-3 py-1 rounded-full text-sm transition-colors ${\n                selectedCategory === cat \n                  ? 'bg-blue-600 text-white' \n                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'\n              }`}\n            >\n              {cat === 'all' ? 'All' : cat}\n            </button>\n          ))}\n        </div>\n      }\n      listContent={\n        <>\n          {/* Map Preview */}\n          <div className=\"mb-4\">\n            <div className=\"relative w-full h-64 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden\">\n              <MapContainer \n                center={selectedPlace && selectedPlace.latitude && selectedPlace.longitude \n                  ? [selectedPlace.latitude, selectedPlace.longitude] \n                  : center} \n                zoom={selectedPlace ? 12 : zoom} \n                scrollWheelZoom={false}\n                style={{ height: '100%', width: '100%' }}\n                key={`map-${selectedPlace?.id || 'default'}`}\n              >\n                <SetViewOnChange \n                  center={selectedPlace && selectedPlace.latitude && selectedPlace.longitude \n                    ? [selectedPlace.latitude, selectedPlace.longitude] \n                    : center} \n                  zoom={selectedPlace ? 12 : zoom} \n                />\n                <TileLayer\n                  attribution='&copy; OpenStreetMap contributors'\n                  url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"\n                />\n                {markers.map((m, index) => (\n                  <Marker key={`marker-${m.id}-${index}`} position={m.position}>\n                    <Popup>{m.title}</Popup>\n                  </Marker>\n                ))}\n              </MapContainer>\n            </div>\n          </div>\n          \n          {/* Places List */}\n          {loading ? (\n            <div className=\"text-center py-8 text-gray-500\">Loading places...</div>\n          ) : filteredPlaces.length === 0 ? (\n            <div className=\"text-center py-8 text-gray-500\">No places found</div>\n          ) : (\n            filteredPlaces.map(renderPlaceItem)\n          )}\n        </>\n      }\n      detailContent={renderPlaceDetails()}\n    />\n  );\n};\n\nexport default MapView;
