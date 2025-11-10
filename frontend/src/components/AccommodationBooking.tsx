import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, MapPin, Users, Wifi, Coffee, Utensils, Car, Calendar as CalendarIcon, Search, Bed, Bath } from 'lucide-react';
import { format } from 'date-fns';

interface AccommodationBookingProps {
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
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Find Your Perfect Stay in Kedah</CardTitle>
          <CardDescription className="text-blue-200/60">Search and book accommodations across Kedah</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Check-in Date */}
            <div>
              <Label className="text-blue-200/60 mb-2 block">Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-blue-900/20 border-blue-800/30 text-white hover:bg-blue-900/30"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-blue-950 border-blue-800">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out Date */}
            <div>
              <Label className="text-blue-200/60 mb-2 block">Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-blue-900/20 border-blue-800/30 text-white hover:bg-blue-900/30"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-blue-950 border-blue-800">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests */}
            <div>
              <Label className="text-blue-200/60 mb-2 block">Guests</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                className="bg-blue-900/20 border-blue-800/30 text-white"
              />
            </div>

            {/* Search */}
            <div>
              <Label className="text-blue-200/60 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  placeholder="Hotel name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-blue-900/20 border-blue-800/30 text-white placeholder:text-blue-200/40"
                />
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-6 space-y-4">
            {/* Accommodation Type */}
            <div>
              <Label className="text-blue-200/60 mb-3 block">Accommodation Type</Label>
              <div className="flex flex-wrap gap-2">
                {accommodationTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-900/20 text-blue-200/60 border border-blue-800/30 hover:border-blue-600/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-blue-200/60 mb-2 block">
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
        <p className="text-blue-200/60">
          {filteredAccommodations.length} propert{filteredAccommodations.length !== 1 ? 'ies' : 'y'} found
        </p>
      </div>

      {/* Accommodation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccommodations.map((acc) => (
          <Card key={acc.id} className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm overflow-hidden hover:border-blue-600/50 transition-colors">
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
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm">{acc.rating}</span>
                </div>
                <span className="text-blue-200/60 text-sm">({acc.reviews.toLocaleString()} reviews)</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-blue-200/60 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{acc.location}</span>
              </div>

              <p className="text-sm text-blue-200/60 mb-4 line-clamp-2">{acc.description}</p>

              {/* Room Details */}
              <div className="flex items-center gap-4 mb-4 text-sm text-blue-200/60">
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
                    <div key={amenity} className="flex items-center gap-1 text-xs text-blue-200/60 bg-blue-900/20 px-2 py-1 rounded">
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-blue-800/30">
                <div>
                  <p className="text-2xl text-white">RM {acc.price}</p>
                  <p className="text-xs text-blue-200/60">per night</p>
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
        <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <p className="text-blue-200/60">No accommodations found matching your criteria</p>
            <p className="text-sm text-blue-200/40 mt-2">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
