import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, Heart, Share2, MessageCircle } from 'lucide-react';

interface OverviewMetricsProps {
  selectedCity: string;
  timeRange: string;
}

interface Metrics {
  totalVisitors: number;
  socialEngagement: number;
  totalPosts: number;
  shares: number;
  pageViews: number;
}

export function OverviewMetrics({ selectedCity, timeRange }: OverviewMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics from backend - NO DEMO DATA
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters for filtering
        const cityParam = selectedCity && selectedCity !== 'all' ? selectedCity : '';
        const periodMap: Record<string, string> = {
          'week': 'week',
          'month': 'month',
          'quarter': 'quarter',
          'year': 'year',
        };
        const period = periodMap[timeRange] || 'month';

        // Build API URL with city and time range filters
        const queryParams = new URLSearchParams();
        if (cityParam) queryParams.append('city', cityParam);
        queryParams.append('period', period);

        const url = `/api/analytics/overview-metrics/?${queryParams.toString()}`;
        
        console.log('📊 Fetching metrics from:', url);
        console.log('🏙️ City:', selectedCity, '⏱️ Time Range:', timeRange);

        const response = await axios.get(url);
        const data = response.data;

        // Transform backend data to match component structure
        const fetchedMetrics: Metrics = {
          totalVisitors: data.total_visitors || 0,
          socialEngagement: data.social_engagement || 0,
          totalPosts: data.total_posts || 0,
          shares: data.shares || 0,
          pageViews: data.page_views || 0,
        };

        console.log('✅ Metrics loaded:', fetchedMetrics);
        setMetrics(fetchedMetrics);
      } catch (error) {
        console.error('❌ Error fetching metrics:', error);
        setError('Failed to load metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedCity, timeRange]);

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-gray-50 border-gray-200 animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error || !metrics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">⚠️ {error || 'Failed to load metrics'}</p>
        <p className="text-sm text-red-600 mt-2">Please check your connection or try again later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Comments Card - Beautiful Blue Theme */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-blue-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-200 rounded-full">
                <MessageCircle className="w-4 h-4 text-blue-700" />
              </div>
              <span> Comments</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-800">
            {metrics.totalVisitors >= 1000 ? (metrics.totalVisitors / 1000).toFixed(1) + 'K' : metrics.totalVisitors}
          </div>
        </CardContent>
      </Card>

      {/* Likes Card - Beautiful Rose Theme */}
      <Card className="bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-rose-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-200 rounded-full">
                <Heart className="w-4 h-4 text-rose-700 fill-current" />
              </div>
              <span> Likes</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-rose-800">
            {(metrics.socialEngagement / 1000).toFixed(0)}K
          </div>
        </CardContent>
      </Card>

      {/* Total Posts Card - Beautiful Purple Theme */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-purple-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-200 rounded-full">
                <MessageCircle className="w-4 h-4 text-purple-700" />
              </div>
              <span>Total Posts</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-800">
            {metrics.totalPosts >= 1000 ? (metrics.totalPosts / 1000).toFixed(1) + 'K' : metrics.totalPosts}
          </div>
        </CardContent>
      </Card>

      {/* Shares Card - Beautiful Green Theme */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-200 rounded-full">
                <Share2 className="w-4 h-4 text-emerald-700" />
              </div>
              <span> Shares</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-800">
            {(metrics.shares / 1000).toFixed(1)}K
          </div>
        </CardContent>
      </Card>

      {/* Page Views Card - Beautiful Orange Theme */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-orange-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-200 rounded-full">
                <Eye className="w-4 h-4 text-orange-700" />
              </div>
              <span> Page Views</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-800">
            {metrics.pageViews >= 1000000 ? (metrics.pageViews / 1000000).toFixed(1) + 'M' : 
             metrics.pageViews >= 1000 ? (metrics.pageViews / 1000).toFixed(1) + 'K' : metrics.pageViews}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
