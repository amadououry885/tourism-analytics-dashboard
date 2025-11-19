import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, Star } from 'lucide-react';

interface Destination {
  city: string;
  visitors: number;
  posts: number;
  growth: number;
  rank: number;
}

export function DestinationsRanking() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/destinations/ranking/');
        const data = response.data;
        const sortedDestinations = data
          .map((item: any, index: number) => ({
            city: item.name,
            visitors: item.visitor_count,
            posts: item.post_count,
            growth: item.growth_percentage,
            rank: index + 1,
          }))
          .sort((a: Destination, b: Destination) => b.visitors - a.visitors);

        setDestinations(sortedDestinations);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">Top 5 Most Popular Destinations</h2>
        <p className="text-gray-600">Based on visitor count and social engagement</p>
      </div>

      {loading ? (
        <div className="py-4 text-center text-gray-500">⏳ Loading destinations...</div>
      ) : destinations.length === 0 ? (
        <div className="py-4 text-center text-gray-500">❌ No destinations found</div>
      ) : (
        <div className="space-y-4">
          {destinations.slice(0, 5).map((destination) => (
            <div key={destination.city} className="p-4 bg-white rounded-lg shadow-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-xl font-semibold text-blue-600">{destination.rank}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-medium text-gray-800 truncate">{destination.city}</div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{destination.visitors.toLocaleString()} visitors</span>
                    <span>•</span>
                    <span>{destination.posts.toLocaleString()} posts</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">
                  {destination.growth > 0 ? (
                    <span className="text-green-500">+{destination.growth}%</span>
                  ) : destination.growth < 0 ? (
                    <span className="text-red-500">{destination.growth}%</span>
                  ) : (
                    <span className="text-gray-500">0%</span>
                  )}
                </div>
                <ArrowUpRight
                  className={`w-5 h-5 transition-transform ${
                    destination.growth > 0 ? 'rotate-0' : destination.growth < 0 ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
