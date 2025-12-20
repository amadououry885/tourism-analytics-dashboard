import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, Heart, Share2, MessageCircle, TrendingUp, Smile, Meh, Frown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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
  totalLikes: number;
  totalComments: number;
  trendingPct: number;
  sentiment?: {
    positivePct: number;
    neutralPct: number;
    negativePct: number;
    positive: number;
    neutral: number;
    negative: number;
  };
  platforms?: Array<{
    platform: string;
    posts: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
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

        const url = `/analytics/overview-metrics/?${queryParams.toString()}`;
        
        console.log('📊 Fetching comprehensive metrics from:', url);

        const response = await axios.get(url);
        const data = response.data;

        // Transform backend data to match component structure
        const fetchedMetrics: Metrics = {
          totalVisitors: data.total_visitors || 0,
          socialEngagement: data.social_engagement || 0,
          totalPosts: data.total_posts || 0,
          shares: data.shares || 0,
          pageViews: data.page_views || 0,
          totalLikes: data.total_likes || 0,
          totalComments: data.total_comments || 0,
          trendingPct: data.trending_pct || 0,
          sentiment: data.sentiment,
          platforms: data.platforms || [],
        };

        console.log('✅ Comprehensive metrics loaded:', fetchedMetrics);
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

  // Show loading state - Mobile responsive grid
  if (loading) {
    return (
      <div className="mobile-grid-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-gray-50 border-gray-200 animate-pulse">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state - Mobile responsive
  if (error || !metrics) {
    return (
      <div className="p-3 sm:p-4 md:p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold text-sm sm:text-base">⚠️ {error || 'Failed to load metrics'}</p>
        <p className="text-xs sm:text-sm text-red-600 mt-1 sm:mt-2">Please check your connection or try again later.</p>
      </div>
    );
  }

  return (
    <div className="mobile-grid-2">
      {/* Comments Card - Professional White Design */}
      <Card className="bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-semibold flex items-center justify-between" style={{ color: '#0F172A' }}>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-2 rounded-full" style={{ backgroundColor: '#3B82F6' }}>
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span>Comments 💬</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#0F172A' }}>
            {metrics.totalComments >= 1000 ? (metrics.totalComments / 1000).toFixed(1) + 'K' : metrics.totalComments}
          </div>
        </CardContent>
      </Card>

      {/* Likes Card - Professional White Design */}
      <Card className="bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-semibold flex items-center justify-between" style={{ color: '#0F172A' }}>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-2 rounded-full" style={{ backgroundColor: '#EC4899' }}>
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-current" />
              </div>
              <span>Likes ❤️</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#0F172A' }}>
            {metrics.totalLikes >= 1000 ? (metrics.totalLikes / 1000).toFixed(0) + 'K' : metrics.totalLikes}
          </div>
        </CardContent>
      </Card>

      {/* Total Posts Card - Professional White Design */}
      <Card className="bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-semibold flex items-center justify-between" style={{ color: '#0F172A' }}>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-2 rounded-full" style={{ backgroundColor: '#14B8A6' }}>
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span>Posts 📝</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#0F172A' }}>
            {metrics.totalPosts >= 1000 ? (metrics.totalPosts / 1000).toFixed(1) + 'K' : metrics.totalPosts}
          </div>
        </CardContent>
      </Card>

      {/* Shares Card - Professional White Design */}
      <Card className="bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-semibold flex items-center justify-between" style={{ color: '#0F172A' }}>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-2 rounded-full" style={{ backgroundColor: '#22C55E' }}>
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span>Shares 📤</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#0F172A' }}>
            {metrics.shares >= 1000 ? (metrics.shares / 1000).toFixed(1) + 'K' : metrics.shares}
          </div>
        </CardContent>
      </Card>

      {/* Page Views Card - Professional White Design - Full width on mobile */}
      <Card className="bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 col-span-2 sm:col-span-1" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-semibold flex items-center justify-between" style={{ color: '#0F172A' }}>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-2 rounded-full" style={{ backgroundColor: '#F59E0B' }}>
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span>Views 👁️</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#0F172A' }}>
            {metrics.pageViews >= 1000000 ? (metrics.pageViews / 1000000).toFixed(1) + 'M' : 
             metrics.pageViews >= 1000 ? (metrics.pageViews / 1000).toFixed(1) + 'K' : metrics.pageViews}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
