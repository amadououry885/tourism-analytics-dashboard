import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Building2, Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Stay {
  id: number;
  name: string;
  type: string;
  district: string;
  rating: number | null;
  priceNight: string;
  amenities: string[];
}

interface AccommodationStatsProps {
  selectedCity?: string;
  timeRange?: string;
}

// Default demo data for presentation
const defaultStays: Stay[] = [
  { id: 1, name: 'Langkawi Lagoon Resort', type: 'Hotel', district: 'Langkawi', rating: 4.8, priceNight: '450', amenities: ['Pool', 'Spa', 'Restaurant'] },
  { id: 2, name: 'The Danna Langkawi', type: 'Resort', district: 'Langkawi', rating: 4.9, priceNight: '850', amenities: ['Beach', 'Spa', 'Fine Dining'] },
  { id: 3, name: 'Alor Setar Tower Hotel', type: 'Hotel', district: 'Alor Setar', rating: 4.3, priceNight: '200', amenities: ['Pool', 'Gym'] },
  { id: 4, name: 'Pedu Lake Resort', type: 'Resort', district: 'Pedu Lake', rating: 4.2, priceNight: '300', amenities: ['Lake View', 'Restaurant'] },
  { id: 5, name: 'Langkawi Beach Villa', type: 'Guesthouse', district: 'Langkawi', rating: 4.5, priceNight: '180', amenities: ['Beach', 'WiFi'] },
  { id: 6, name: 'Kedah Homestay', type: 'Guesthouse', district: 'Alor Setar', rating: 4.0, priceNight: '80', amenities: ['WiFi', 'Kitchen'] },
  { id: 7, name: 'Meritus Pelangi Beach Resort', type: 'Resort', district: 'Langkawi', rating: 4.7, priceNight: '600', amenities: ['Beach', 'Spa', 'Pool'] },
  { id: 8, name: 'Grand Alora Hotel', type: 'Hotel', district: 'Alor Setar', rating: 4.4, priceNight: '250', amenities: ['Restaurant', 'Gym'] },
];

export function AccommodationStats({ selectedCity, timeRange }: AccommodationStatsProps) {
  const [stays, setStays] = useState<Stay[]>(defaultStays); // Initialize with demo data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStays = async () => {
      try {
        setLoading(true);
        
        console.log('[AccommodationStats] Fetching stays from:', api.defaults.baseURL + '/stays/');
        
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') {
          params.append('district', selectedCity);
        }

        const response = await api.get(`/stays/?${params.toString()}`);
        const backendStays = response.data.results || response.data || [];
        
        console.log('[AccommodationStats] Received stays:', backendStays.length);
        
        // Transform backend Stay model to component format
        const transformedStays = backendStays.map((stay: any) => ({
          id: stay.id,
          name: stay.name,
          type: stay.type || 'Hotel',
          district: stay.district || stay.city || 'Kedah',
          rating: stay.rating,
          priceNight: stay.price_per_night?.toString() || '0',
          amenities: stay.amenities || [],
          isOpen: stay.is_open ?? true
        }));
        
        // If backend has data, use it; otherwise keep demo data
        if (transformedStays.length > 0) {
          console.log('[AccommodationStats] Using backend data');
          setStays(transformedStays);
        } else {
          console.warn('[AccommodationStats] No backend data, keeping demo');
        }
      } catch (error) {
        console.error('[AccommodationStats] Error fetching stays:', error);
        // Keep demo data on error
      } finally {
        setLoading(false);
      }
    };

    fetchStays();
  }, [selectedCity, timeRange]);

  // Group stays by type and calculate stats
  const accommodationData = stays.reduce((acc: any[], stay) => {
    const existing = acc.find(item => item.type === stay.type);
    if (existing) {
      existing.total += 1;
      if (stay.rating) {
        existing.totalRating += stay.rating;
        existing.ratingCount += 1;
      }
      existing.totalPrice += parseFloat(stay.priceNight);
    } else {
      acc.push({
        type: stay.type,
        total: 1,
        occupancy: Math.floor(Math.random() * 30) + 60, // Mock occupancy
        avgRating: stay.rating || 0,
        totalRating: stay.rating || 0,
        ratingCount: stay.rating ? 1 : 0,
        avgPrice: parseFloat(stay.priceNight),
        totalPrice: parseFloat(stay.priceNight)
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    avgRating: item.ratingCount > 0 ? (item.totalRating / item.ratingCount).toFixed(1) : 0,
    avgPrice: Math.round(item.totalPrice / item.total)
  }));

  // Top 5 stays by rating
  const topStays = stays
    .filter(s => s.rating)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
    .map(stay => ({
      name: stay.name,
      rating: stay.rating || 0,
      reviews: Math.floor(Math.random() * 8000) + 1000, // Mock reviews
      occupancy: Math.floor(Math.random() * 30) + 70, // Mock occupancy
      price: Math.round(parseFloat(stay.priceNight)),
      location: stay.district
    }));

  if (loading) {
    return <div className="text-gray-900">Loading accommodation data...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Accommodation Overview Chart */}
      <Card className="lg:col-span-2 bg-white shadow-sm" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg" style={{ color: '#0F172A' }}>Accommodation Statistics</CardTitle>
          <CardDescription className="text-xs sm:text-sm" style={{ color: '#475569' }}>Occupancy rates and average ratings by type</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={200} className="sm:h-[250px] md:h-[300px]">
            <BarChart data={accommodationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAEFF6" opacity={0.3} />
              <XAxis dataKey="type" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827',
                  fontSize: '12px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="occupancy" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Occupancy %" />
              <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} name="Total Properties" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mt-4 sm:mt-6">
            {accommodationData.map((item) => (
              <div key={item.type} className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E4E9F2' }}>
                <p className="text-xs sm:text-sm mb-1 truncate" style={{ color: '#0F172A' }}>{item.type}</p>
                <p className="text-xs sm:text-sm mb-1" style={{ color: '#475569' }}>RM {item.avgPrice}</p>
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs" style={{ color: '#F59E0B' }}>
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400" />
                  <span>{item.avgRating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Rated Stays */}
      <Card className="bg-white shadow-sm" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg" style={{ color: '#0F172A' }}>Top Rated Stays</CardTitle>
          <CardDescription className="text-xs sm:text-sm" style={{ color: '#475569' }}>Most popular accommodations</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="space-y-2 sm:space-y-3">
            {topStays.slice(0, 5).map((stay, index) => (
              <div key={stay.name} className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E4E9F2' }}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm flex-shrink-0" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#0F172A' }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs sm:text-sm mb-1 truncate" style={{ color: '#475569' }}>{stay.name}</h5>
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs" style={{ color: '#F59E0B' }}>
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400" />
                        <span>{stay.rating}</span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-900">
                        {stay.reviews.toLocaleString()} reviews
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <Badge className="bg-green-500/20 text-green-700 border-green-500/30 text-[10px] sm:text-xs px-1.5 sm:px-2">
                        {stay.occupancy}% occupied
                      </Badge>
                      <span className="text-gray-900">RM {stay.price}/night</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
