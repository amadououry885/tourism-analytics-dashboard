import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, MapPin, Users, Wifi, Coffee, Utensils, Car, Calendar as CalendarIcon, Search, Bed, Bath, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface AccommodationBookingProps {
  timeRange?: string;
  selectedCity: string;
}

const accommodations = [
  {
    id: 1,
    name: 'The Datai Langkawi',
    city: 'langkawi',
    type: 'Resort',
    rating: 4.9,
    reviews: 8500,
    price: 850,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMHJlc29ydHxlbnwxfHx8fDE3NjIyNDQwMTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Jalan Teluk Datai, Langkawi',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa', 'Parking'],
    beds: 2,
    baths: 2,
    occupancy: 4,
    description: 'Luxury 5-star resort nestled in ancient rainforest'
  },
  {
    id: 2,
    name: 'Berjaya Langkawi Resort',
    city: 'langkawi',
    type: 'Resort',
    rating: 4.7,
    reviews: 6200,
    price: 420,
    image: 'https://images.unsplash.com/photo-1729717949948-56b52db111dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMHBvb2x8ZW58MXx8fHwxNzYyMjExMTgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Burau Bay, Langkawi',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Beach Access', 'Parking'],
    beds: 1,
    baths: 1,
    occupancy: 2,
    description: 'Beautiful beachfront resort with stunning ocean views'
  },
  {
    id: 3,
    name: 'Alor Setar Grand Hotel',
    city: 'alor-setar',
    type: 'Hotel',
    rating: 4.5,
    reviews: 3200,
    price: 180,
    image: 'https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGJlZHJvb218ZW58MXx8fHwxNzYyMjAxODg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'City Centre, Alor Setar',
    amenities: ['WiFi', 'Restaurant', 'Gym', 'Parking'],
    beds: 2,
    baths: 1,
    occupancy: 3,
    description: 'Modern hotel in the heart of Alor Setar'
  },
  {
    id: 4,
    name: 'Sungai Petani Guesthouse',
    city: 'sungai-petani',
    type: 'Guesthouse',
    rating: 4.3,
    reviews: 1850,
    price: 95,
    image: 'https://images.unsplash.com/photo-1740446565402-9d976b6a82dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwZ3Vlc3Rob3VzZSUyMHJvb218ZW58MXx8fHwxNzYyMjk4MTM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Central Sungai Petani',
    amenities: ['WiFi', 'Breakfast', 'Parking'],
    beds: 1,
    baths: 1,
    occupancy: 2,
    description: 'Cozy and affordable guesthouse with local charm'
  },
  {
    id: 5,
    name: 'Kedah Traditional Homestay',
    city: 'jitra',
    type: 'Homestay',
    rating: 4.6,
    reviews: 920,
    price: 75,
    image: 'https://images.unsplash.com/photo-1696217612904-64c78f5c588a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lc3RheSUyMGludGVyaW9yfGVufDF8fHx8MTc2MjI5ODEzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Kampung Ayer Hitam, Jitra',
    amenities: ['WiFi', 'Local Breakfast', 'Cultural Experience'],
    beds: 2,
    baths: 1,
    occupancy: 4,
    description: 'Authentic Malaysian homestay experience with local family'
  },
  {
    id: 6,
    name: 'Kulim Serviced Apartment',
    city: 'kulim',
    type: 'Apartment',
    rating: 4.4,
    reviews: 1240,
    price: 120,
    image: 'https://images.unsplash.com/photo-1613575831056-0acd5da8f085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2MjIzNjM2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Kulim Hi-Tech Park',
    amenities: ['WiFi', 'Kitchen', 'Laundry', 'Parking'],
    beds: 2,
    baths: 2,
    occupancy: 4,
    description: 'Modern serviced apartment with full facilities'
  },
];

const accommodationTypes = ['All Types', 'Hotel', 'Resort', 'Guesthouse', 'Homestay', 'Apartment'];

const amenitiesIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Pool': Users,
  'Restaurant': Utensils,
  'Breakfast': Coffee,
  'Parking': Car,
};

export function AccommodationBooking({ selectedCity }: AccommodationBookingProps) {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [selectedType, setSelectedType] = useState('All Types');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAccommodations = accommodations.filter(acc => {
    const matchesCity = selectedCity === 'all' || acc.city === selectedCity;
    const matchesType = selectedType === 'All Types' || acc.type === selectedType;
    const matchesPrice = acc.price >= priceRange[0] && acc.price <= priceRange[1];
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          acc.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGuests = acc.occupancy >= guests;
    
    return matchesCity && matchesType && matchesPrice && matchesSearch && matchesGuests;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Find Your Perfect Stay in Kedah</CardTitle>
          <CardDescription className="text-gray-900">Search and book accommodations across Kedah</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Check-in Date */}
            <div>
              <Label className="text-gray-900 mb-2 block">Check-in</Label>
              <Input
                type="date"
                value={checkIn ? format(checkIn, 'yyyy-MM-dd') : ''}
                onChange={(e) => setCheckIn(e.target.value ? new Date(e.target.value) : undefined)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full bg-white border-gray-300 text-gray-900 h-10"
              />
            </div>

            {/* Check-out Date */}
            <div>
              <Label className="text-gray-900 mb-2 block">Check-out</Label>
              <Input
                type="date"
                value={checkOut ? format(checkOut, 'yyyy-MM-dd') : ''}
                onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : undefined)}
                min={checkIn ? format(checkIn, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                className="w-full bg-white border-gray-300 text-gray-900 h-10"
              />
            </div>

            {/* Guests */}
            <div>
              <Label className="text-gray-900 mb-2 block">Guests</Label>
              <div className="flex items-center gap-2 h-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="h-10 w-10 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-md">
                  <span className="text-gray-900 font-medium">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setGuests(Math.min(10, guests + 1))}
                  className="h-10 w-10 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div>
              <Label className="text-gray-900 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-900" />
                <Input
                  placeholder="Hotel name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-6 space-y-4">
            {/* Accommodation Type */}
            <div>
              <Label className="text-gray-900 mb-3 block">Accommodation Type</Label>
              <div className="flex flex-wrap gap-2">
                {accommodationTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-900 border border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-gray-900 mb-2 block">
                Price Range: RM {priceRange[0]} - RM {priceRange[1]} per night
              </Label>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-900">
          {filteredAccommodations.length} propert{filteredAccommodations.length !== 1 ? 'ies' : 'y'} found
        </p>
      </div>

      {/* Accommodation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccommodations.map((acc) => (
          <Card key={acc.id} className="bg-white border-gray-200 shadow-sm overflow-hidden hover:border-blue-400 transition-colors">
            <div className="relative h-48 overflow-hidden">
              <ImageWithFallback
                src={acc.image}
                alt={acc.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-blue-600/90 text-white border-0 backdrop-blur-sm">
                  {acc.type}
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <h3 className="text-white mb-2">{acc.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-700 fill-yellow-400" />
                  <span className="text-white text-sm">{acc.rating}</span>
                </div>
                <span className="text-gray-900 text-sm">({acc.reviews.toLocaleString()} reviews)</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-900 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{acc.location}</span>
              </div>

              <p className="text-sm text-gray-900 mb-4 line-clamp-2">{acc.description}</p>

              {/* Room Details */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-900">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{acc.beds} bed{acc.beds > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{acc.baths} bath{acc.baths > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{acc.occupancy} guests</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {acc.amenities.slice(0, 4).map((amenity) => {
                  const Icon = amenitiesIcons[amenity];
                  return (
                    <div key={amenity} className="flex items-center gap-1 text-xs text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-blue-800/30">
                <div>
                  <p className="text-2xl text-white">RM {acc.price}</p>
                  <p className="text-xs text-gray-900">per night</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAccommodations.length === 0 && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <p className="text-gray-900">No accommodations found matching your criteria</p>
            <p className="text-sm text-gray-900 mt-2">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
