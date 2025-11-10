import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Building2, Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const accommodationData = [
  { type: 'Hotels', total: 245, occupancy: 78, avgRating: 4.3, avgPrice: 250 },
  { type: 'Resorts', total: 89, occupancy: 85, avgRating: 4.6, avgPrice: 450 },
  { type: 'Guesthouses', total: 156, occupancy: 72, avgRating: 4.1, avgPrice: 120 },
  { type: 'Homestays', total: 328, occupancy: 68, avgRating: 4.4, avgPrice: 80 },
  { type: 'Apartments', total: 112, occupancy: 65, avgRating: 4.2, avgPrice: 180 },
];

const topStays = [
  { name: 'The Datai Langkawi', rating: 4.9, reviews: 8500, occupancy: 92, price: 850, location: 'Langkawi' },
  { name: 'Berjaya Langkawi Resort', rating: 4.7, reviews: 6200, occupancy: 88, price: 420, location: 'Langkawi' },
  { name: 'Alila Langkawi', rating: 4.8, reviews: 5800, occupancy: 90, price: 680, location: 'Langkawi' },
  { name: 'Four Points by Sheraton', rating: 4.6, reviews: 4100, occupancy: 85, price: 280, location: 'Langkawi' },
  { name: 'The Westin Langkawi', rating: 4.7, reviews: 5500, occupancy: 87, price: 520, location: 'Langkawi' },
];

interface AccommodationStatsProps {
  selectedCity?: string;
  timeRange?: string;
}

export function AccommodationStats({ selectedCity, timeRange }: AccommodationStatsProps) {
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
