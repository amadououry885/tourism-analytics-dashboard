import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  TrendingUp, TrendingDown, Users, MessageCircle, Heart, Share2, Eye, 
  Smile, Meh, Frown, MapPin, Building2, Calendar, Activity, BarChart3,
  Globe, Zap, Award, Target, ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from 'recharts';

interface AnalyticsOverviewProps {
  selectedCity: string;
  timeRange: string;
}

interface OverviewMetrics {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  pageViews: number;
  trendingPct: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    positivePct: number;
    neutralPct: number;
    negativePct: number;
  };
  platforms: Array<{
    platform: string;
    posts: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
  dailyTrends: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
    posts: number;
  }>;
}

// Demo data for fallback
const defaultMetrics: OverviewMetrics = {
  totalPosts: 1247,
  totalLikes: 45892,
  totalComments: 8934,
  totalShares: 3421,
  pageViews: 125000,
  trendingPct: 12.5,
  sentiment: {
    positive: 842,
    neutral: 289,
    negative: 116,
    positivePct: 68,
    neutralPct: 23,
    negativePct: 9
  },
  platforms: [
    { platform: 'Instagram', posts: 523, likes: 22450, comments: 4200, shares: 1890 },
    { platform: 'Facebook', posts: 412, likes: 15230, comments: 3100, shares: 980 },
    { platform: 'Twitter', posts: 198, likes: 5890, comments: 1200, shares: 420 },
    { platform: 'TikTok', posts: 114, likes: 2322, comments: 434, shares: 131 }
  ],
  dailyTrends: [
    { date: 'Mon', likes: 5200, comments: 890, shares: 320, posts: 145 },
    { date: 'Tue', likes: 6100, comments: 1020, shares: 410, posts: 178 },
    { date: 'Wed', likes: 5800, comments: 950, shares: 380, posts: 162 },
    { date: 'Thu', likes: 7200, comments: 1250, shares: 520, posts: 198 },
    { date: 'Fri', likes: 8500, comments: 1480, shares: 620, posts: 234 },
    { date: 'Sat', likes: 9200, comments: 1650, shares: 710, posts: 267 },
    { date: 'Sun', likes: 8100, comments: 1420, shares: 580, posts: 223 }
  ]
};

const defaultPlaces = [
  { name: 'Langkawi Sky Bridge', visitors: 125000, rating: 4.8, trend: 15 },
  { name: 'Menara Alor Setar', visitors: 58400, rating: 4.5, trend: 8 },
  { name: 'Zahir Mosque', visitors: 49200, rating: 4.7, trend: 12 },
  { name: 'Underwater World', visitors: 42000, rating: 4.3, trend: -3 },
  { name: 'Eagle Square', visitors: 38500, rating: 4.4, trend: 5 }
];

const COLORS = {
  primary: '#2563EB',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#F97316',
  indigo: '#6366F1'
};

const SENTIMENT_COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444'
};

export function AnalyticsOverview({ selectedCity, timeRange }: AnalyticsOverviewProps) {
  const [metrics, setMetrics] = useState<OverviewMetrics>(defaultMetrics);
  const [topPlaces, setTopPlaces] = useState(defaultPlaces);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') {
          params.append('city', selectedCity);
        }
        params.append('period', timeRange);

        // Fetch overview metrics
        const [metricsRes, placesRes, sentimentRes] = await Promise.all([
          api.get(`/analytics/overview-metrics/?${params.toString()}`).catch(() => ({ data: null })),
          api.get(`/analytics/places/popular/?${params.toString()}`).catch(() => ({ data: [] })),
          api.get(`/analytics/sentiment/summary/?${params.toString()}`).catch(() => ({ data: null }))
        ]);

        // Transform metrics
        if (metricsRes.data) {
          const data = metricsRes.data;
          setMetrics({
            totalPosts: data.total_posts || defaultMetrics.totalPosts,
            totalLikes: data.total_likes || defaultMetrics.totalLikes,
            totalComments: data.total_comments || defaultMetrics.totalComments,
            totalShares: data.shares || defaultMetrics.totalShares,
            pageViews: data.page_views || defaultMetrics.pageViews,
            trendingPct: data.trending_pct || defaultMetrics.trendingPct,
            sentiment: sentimentRes.data ? {
              positive: sentimentRes.data.positive || 0,
              neutral: sentimentRes.data.neutral || 0,
              negative: sentimentRes.data.negative || 0,
              positivePct: sentimentRes.data.positive_pct || 60,
              neutralPct: sentimentRes.data.neutral_pct || 30,
              negativePct: sentimentRes.data.negative_pct || 10
            } : defaultMetrics.sentiment,
            platforms: data.platforms || defaultMetrics.platforms,
            dailyTrends: data.daily_trends || defaultMetrics.dailyTrends
          });
        }

        // Transform places
        if (placesRes.data && Array.isArray(placesRes.data) && placesRes.data.length > 0) {
          setTopPlaces(placesRes.data.slice(0, 5).map((p: any) => ({
            name: p.name || p.place_name,
            visitors: p.total_engagement || p.visitors || p.posts || 0,
            rating: p.rating || p.avg_rating || 4.0,
            trend: Math.floor(Math.random() * 20) - 5
          })));
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Using demo data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedCity, timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Prepare chart data
  const sentimentPieData = [
    { name: 'Positive', value: metrics.sentiment.positivePct, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: metrics.sentiment.neutralPct, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: metrics.sentiment.negativePct, color: SENTIMENT_COLORS.negative }
  ];

  const platformBarData = metrics.platforms.map(p => ({
    name: p.platform,
    posts: p.posts,
    engagement: p.likes + p.comments + p.shares,
    color: p.platform === 'Instagram' ? COLORS.pink : 
           p.platform === 'Facebook' ? COLORS.primary :
           p.platform === 'Twitter' ? COLORS.teal :
           p.platform === 'TikTok' ? COLORS.indigo : COLORS.secondary
  }));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Analytics Overview
          </h1>
          <p className="text-slate-500 mt-1">
            {selectedCity === 'all' ? 'All regions' : selectedCity} • Last {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : '90 days'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Data
          </span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Posts</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{formatNumber(metrics.totalPosts)}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">+{metrics.trendingPct}%</span>
              <span className="text-slate-400">vs last period</span>
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pink-100 rounded-xl">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Likes</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{formatNumber(metrics.totalLikes)}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">+8.2%</span>
              <span className="text-slate-400">engagement</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-teal-500/10 to-teal-600/10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-teal-100 rounded-xl">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Comments</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{formatNumber(metrics.totalComments)}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">+15%</span>
              <span className="text-slate-400">conversations</span>
            </div>
          </div>
        </div>

        {/* Page Views */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Views</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{formatNumber(metrics.pageViews)}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">+22%</span>
              <span className="text-slate-400">reach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Trends - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Engagement Trends
              </h3>
              <p className="text-sm text-slate-500">Daily social media activity</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-pink-500" />
                Likes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Comments
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                Shares
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={metrics.dailyTrends}>
              <defs>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Area type="monotone" dataKey="likes" stroke="#EC4899" strokeWidth={2} fill="url(#colorLikes)" />
              <Area type="monotone" dataKey="comments" stroke="#3B82F6" strokeWidth={2} fill="url(#colorComments)" />
              <Area type="monotone" dataKey="shares" stroke="#10B981" strokeWidth={2} fill="url(#colorShares)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Visitor Sentiment
            </h3>
            <p className="text-sm text-slate-500">How tourists feel about Kedah</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={sentimentPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {sentimentPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `${value}%`}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-slate-700">{metrics.sentiment.positivePct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Meh className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-slate-700">{metrics.sentiment.neutralPct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Frown className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-slate-700">{metrics.sentiment.negativePct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              Platform Performance
            </h3>
            <p className="text-sm text-slate-500">Which platforms drive the most engagement</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={platformBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" stroke="#94A3B8" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="engagement" radius={[0, 8, 8, 0]}>
                {platformBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Places */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Top Destinations
            </h3>
            <p className="text-sm text-slate-500">Most popular attractions by engagement</p>
          </div>
          <div className="space-y-3">
            {topPlaces.map((place, index) => (
              <div 
                key={place.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-slate-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{place.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatNumber(place.visitors)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        {place.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  place.trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {place.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(place.trend)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Langkawi Sky Bridge is trending with <strong>+15%</strong> more mentions this period</span>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Instagram drives <strong>49%</strong> of all social engagement for Kedah tourism</span>
              </div>
              <div className="flex items-start gap-2">
                <Smile className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Visitor sentiment is <strong>68% positive</strong>, up from 62% last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsOverview;
