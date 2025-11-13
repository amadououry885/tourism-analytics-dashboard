import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Eye, Heart, Share2, MessageCircle } from 'lucide-react';

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
  visitorsTrend: number;
  engagementTrend: number;
  postsTrend: number;
  sharesTrend: number;
  viewsTrend: number;
}

// Default demo data for when API fails
const defaultMetrics: Metrics = {
  totalVisitors: 1200000,
  socialEngagement: 458000,
  totalPosts: 89500,
  shares: 34200,
  pageViews: 2800000,
  visitorsTrend: 15.2,
  engagementTrend: 12.8,
  postsTrend: 8.5,
  sharesTrend: 6.3,
  viewsTrend: 18.9,
};

export function OverviewMetrics({ selectedCity, timeRange }: OverviewMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH METRICS WHENEVER CITY OR TIME RANGE CHANGES
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);

        // ✅ BUILD QUERY PARAMETERS FOR FILTERING
        const cityParam = selectedCity && selectedCity !== 'all' ? selectedCity : '';
        const periodMap: Record<string, string> = {
          'week': 'week',
          'month': 'month',
          'quarter': 'quarter',
          'year': 'year',
        };
        const period = periodMap[timeRange] || 'month';

        // ✅ BUILD API URL WITH CITY AND TIME RANGE FILTERS
        const queryParams = new URLSearchParams();
        if (cityParam) queryParams.append('city', cityParam);
        queryParams.append('period', period);

        const url = `http://localhost:8000/api/analytics/overview-metrics/?${queryParams.toString()}`;
        
        console.log('📊 Fetching metrics from:', url);
        console.log('🏙️ City:', selectedCity, '⏱️ Time Range:', timeRange);

        const response = await axios.get(url);
        const data = response.data;

        // ✅ TRANSFORM BACKEND DATA TO MATCH COMPONENT STRUCTURE
        const fetchedMetrics: Metrics = {
          totalVisitors: data.total_visitors || defaultMetrics.totalVisitors,
          socialEngagement: data.social_engagement || defaultMetrics.socialEngagement,
          totalPosts: data.total_posts || defaultMetrics.totalPosts,
          shares: data.shares || defaultMetrics.shares,
          pageViews: data.page_views || defaultMetrics.pageViews,
          visitorsTrend: data.visitors_trend || defaultMetrics.visitorsTrend,
          engagementTrend: data.engagement_trend || defaultMetrics.engagementTrend,
          postsTrend: data.posts_trend || defaultMetrics.postsTrend,
          sharesTrend: data.shares_trend || defaultMetrics.sharesTrend,
          viewsTrend: data.views_trend || defaultMetrics.viewsTrend,
        };

        console.log('✅ Metrics loaded:', fetchedMetrics);
        setMetrics(fetchedMetrics);
      } catch (error) {
        console.error('❌ Error fetching metrics:', error);
        // Keep default metrics on error
        setMetrics(defaultMetrics);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedCity, timeRange]); // ✅ RE-FETCH WHEN CITY OR TIME RANGE CHANGES

  if (loading) {
    return <div className="text-gray-900">⏳ Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Visitors Card */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            <span>👥 Total Visitors</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {(metrics.totalVisitors / 1000000).toFixed(1)}M
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {metrics.visitorsTrend >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold">+{metrics.visitorsTrend.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-semibold">{metrics.visitorsTrend.toFixed(1)}%</span>
              </>
            )}
            <span className="text-gray-500">vs last period</span>
          </div>
        </CardContent>
      </Card>

      {/* Social Engagement Card */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            <span>❤️ Social Engagement</span>
            <Heart className="w-4 h-4 text-red-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {(metrics.socialEngagement / 1000).toFixed(0)}K
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {metrics.engagementTrend >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold">+{metrics.engagementTrend.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-semibold">{metrics.engagementTrend.toFixed(1)}%</span>
              </>
            )}
            <span className="text-gray-500">vs last period</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Posts Card */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            <span>💬 Total Posts</span>
            <MessageCircle className="w-4 h-4 text-purple-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {(metrics.totalPosts / 1000).toFixed(1)}K
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {metrics.postsTrend >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold">+{metrics.postsTrend.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-semibold">{metrics.postsTrend.toFixed(1)}%</span>
              </>
            )}
            <span className="text-gray-500">vs last period</span>
          </div>
        </CardContent>
      </Card>

      {/* Shares Card */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            <span>📤 Shares</span>
            <Share2 className="w-4 h-4 text-blue-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {(metrics.shares / 1000).toFixed(1)}K
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {metrics.sharesTrend >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold">+{metrics.sharesTrend.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-semibold">{metrics.sharesTrend.toFixed(1)}%</span>
              </>
            )}
            <span className="text-gray-500">vs last period</span>
          </div>
        </CardContent>
      </Card>

      {/* Page Views Card */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            <span>👁️ Page Views</span>
            <Eye className="w-4 h-4 text-orange-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {(metrics.pageViews / 1000000).toFixed(1)}M
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {metrics.viewsTrend >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold">+{metrics.viewsTrend.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-semibold">{metrics.viewsTrend.toFixed(1)}%</span>
              </>
            )}
            <span className="text-gray-500">vs last period</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
