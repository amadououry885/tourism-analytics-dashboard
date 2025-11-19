import { useState, useEffect } from 'react';
import axios from 'axios';
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
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') {
          params.append('district', selectedCity);
        }

        const response = await axios.get(`/api/stays/?${params.toString()}`);
        const backendStays = response.data.results || [];
        
        // If backend has data, use it; otherwise keep demo data
        if (backendStays.length > 0) {
          setStays(backendStays);
        }
      } catch (error) {
        console.error('Error fetching stays:', error);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Accommodation Overview Chart */}
      <Card className="lg:col-span-2 bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Accommodation Statistics</CardTitle>
          <CardDescription className="text-gray-900">Occupancy rates and average ratings by type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accommodationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="type" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827'
                }} 
              />
              <Legend />
              <Bar dataKey="occupancy" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Occupancy %" />
              <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} name="Total Properties" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-5 gap-3 mt-6">
            {accommodationData.map((item) => (
              <div key={item.type} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900 mb-1">{item.type}</p>
                <p className="text-white mb-1">RM {item.avgPrice}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-yellow-700">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  <span>{item.avgRating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Rated Stays */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Top Rated Stays</CardTitle>
          <CardDescription className="text-gray-900">Most popular accommodations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topStays.slice(0, 5).map((stay, index) => (
              <div key={stay.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-gray-900 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white text-sm mb-1 truncate">{stay.name}</h5>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1 text-xs text-yellow-700">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <span>{stay.rating}</span>
                      </div>
                      <span className="text-xs text-gray-900">
                        {stay.reviews.toLocaleString()} reviews
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <Badge className="bg-green-500/20 text-green-700 border-green-500/30 text-xs">
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
