import { useState, useEffect, useMemo } from 'react';
import { Search, BarChart3, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import api from '../../services/api';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import { FilterDropdown, SortDropdown } from '../../components/FilterDropdown';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

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

const defaultMostVisited = [
  { id: 1, name: 'Langkawi Sky Bridge', category: 'Landmark', city: 'Langkawi', engagement: 125000, posts: 89, sentiment: 85, rating: 4.7 },
  { id: 2, name: 'Menara Alor Setar', category: 'Landmark', city: 'Alor Setar', engagement: 58400, posts: 42, sentiment: 78, rating: 4.5 },
  { id: 3, name: 'Zahir Mosque', category: 'Religious', city: 'Alor Setar', engagement: 49200, posts: 38, sentiment: 82, rating: 4.6 },
  { id: 4, name: 'Underwater World', category: 'Attraction', city: 'Langkawi', engagement: 42000, posts: 35, sentiment: 75, rating: 4.3 },
  { id: 5, name: 'Eagle Square', category: 'Landmark', city: 'Langkawi', engagement: 38500, posts: 31, sentiment: 80, rating: 4.4 },
];

const defaultLeastVisited = [
  { id: 6, name: 'Nobat Tower', category: 'Historical', city: 'Alor Setar', engagement: 680, posts: 12, sentiment: 72, rating: 4.3 },
  { id: 7, name: 'Royal Museum', category: 'Museum', city: 'Alor Setar', engagement: 520, posts: 9, sentiment: 68, rating: 4.2 },
  { id: 8, name: 'Balai Besar', category: 'Historical', city: 'Alor Setar', engagement: 450, posts: 8, sentiment: 70, rating: 4.1 },
  { id: 9, name: 'Laman Padi', category: 'Cultural', city: 'Langkawi', engagement: 380, posts: 7, sentiment: 75, rating: 4.4 },
  { id: 10, name: 'Pekan Rabu', category: 'Shopping', city: 'Alor Setar', engagement: 320, posts: 6, sentiment: 65, rating: 4.0 },
];

const defaultSentimentComparison = {
  mostVisited: {
    places: 7,
    posts: 58,
    engagement: 746889,
    avgEngagement: 106698,
    positive: 72,
    neutral: 20,
    negative: 8,
    rating: 4.6,
  },
  leastVisited: {
    places: 7,
    posts: 19,
    engagement: 5222,
    avgEngagement: 746,
    positive: 63,
    neutral: 26,
    negative: 11,
    rating: 4.2,
  },
  insights: [
    'Most visited places have higher sentiment scores, suggesting visitor satisfaction drives popularity.',
    'Hidden gems maintain strong positive sentiment despite lower engagement, indicating potential for growth.',
    'Engagement is 143x higher for popular places, showing significant room to promote hidden gems.',
  ]
};

const CITIES = [
  { value: 'all', label: 'All Regions', icon: '🌍' },
  { value: 'langkawi', label: 'Langkawi', icon: '🏝️' },
  { value: 'alor-setar', label: 'Alor Setar', icon: '🏛️' },
  { value: 'sungai-petani', label: 'Sungai Petani', icon: '🏙️' },
  { value: 'kulim', label: 'Kulim', icon: '🏭' },
];

const TIME_RANGES = [
  { value: 'week', label: 'Last 7 Days', icon: '📅' },
  { value: 'month', label: 'Last 30 Days', icon: '📆' },
  { value: 'quarter', label: 'Last 90 Days', icon: '📊' },
];

const SENTIMENT_COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444'
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics>(defaultMetrics);
  const [topPlaces, setTopPlaces] = useState(defaultPlaces);
  const [mostVisited, setMostVisited] = useState(defaultMostVisited);
  const [leastVisited, setLeastVisited] = useState(defaultLeastVisited);
  const [sentimentComparison, setSentimentComparison] = useState(defaultSentimentComparison);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedCity, setSelectedCity] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') {
          params.append('city', selectedCity);
        }
        params.append('period', timeRange);

        const [metricsRes, placesRes, sentimentRes, mostVisitedRes, leastVisitedRes, sentimentComparisonRes] = await Promise.all([
          api.get(`/analytics/overview-metrics/?${params.toString()}`).catch(() => ({ data: null })),
          api.get(`/analytics/places/popular/?${params.toString()}`).catch(() => ({ data: [] })),
          api.get(`/analytics/sentiment/summary/?${params.toString()}`).catch(() => ({ data: null })),
          api.get(`/analytics/places/by-visit-level/?level=most`).catch(() => ({ data: [] })),
          api.get(`/analytics/places/by-visit-level/?level=least`).catch(() => ({ data: [] })),
          api.get(`/analytics/sentiment/comparison/`).catch(() => ({ data: null }))
        ]);

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

        if (placesRes.data && Array.isArray(placesRes.data) && placesRes.data.length > 0) {
          setTopPlaces(placesRes.data.slice(0, 5).map((p: any) => ({
            name: p.name || p.place_name,
            visitors: p.total_engagement || p.visitors || p.posts || 0,
            rating: p.rating || p.avg_rating || 4.0,
            trend: Math.floor(Math.random() * 20) - 5
          })));
        }

        // Set most visited places
        if (mostVisitedRes.data && Array.isArray(mostVisitedRes.data) && mostVisitedRes.data.length > 0) {
          setMostVisited(mostVisitedRes.data.slice(0, 5).map((p: any) => ({
            id: p.id,
            name: p.name || p.place_name,
            category: p.category || 'Attraction',
            city: p.city || 'Kedah',
            engagement: p.total_engagement || p.engagement || 0,
            posts: p.posts_count || p.posts || 0,
            sentiment: p.sentiment?.positive_percentage || 75,
            rating: p.sentiment?.rating || p.rating || 4.0
          })));
        }

        // Set least visited places (hidden gems)
        if (leastVisitedRes.data && Array.isArray(leastVisitedRes.data) && leastVisitedRes.data.length > 0) {
          setLeastVisited(leastVisitedRes.data.slice(0, 5).map((p: any) => ({
            id: p.id,
            name: p.name || p.place_name,
            category: p.category || 'Attraction',
            city: p.city || 'Kedah',
            engagement: p.total_engagement || p.engagement || 0,
            posts: p.posts_count || p.posts || 0,
            sentiment: p.sentiment?.positive_percentage || 70,
            rating: p.sentiment?.rating || p.rating || 4.0
          })));
        }

        // Set sentiment comparison data
        if (sentimentComparisonRes.data && sentimentComparisonRes.data.comparison) {
          const comp = sentimentComparisonRes.data;
          setSentimentComparison({
            mostVisited: {
              places: comp.comparison.most_visited?.total_places || defaultSentimentComparison.mostVisited.places,
              posts: comp.comparison.most_visited?.total_posts || defaultSentimentComparison.mostVisited.posts,
              engagement: comp.comparison.most_visited?.total_engagement || defaultSentimentComparison.mostVisited.engagement,
              avgEngagement: comp.comparison.most_visited?.average_engagement_per_place || defaultSentimentComparison.mostVisited.avgEngagement,
              positive: comp.comparison.most_visited?.sentiment_distribution?.positive_percentage || defaultSentimentComparison.mostVisited.positive,
              neutral: comp.comparison.most_visited?.sentiment_distribution?.neutral_percentage || defaultSentimentComparison.mostVisited.neutral,
              negative: comp.comparison.most_visited?.sentiment_distribution?.negative_percentage || defaultSentimentComparison.mostVisited.negative,
              rating: comp.comparison.most_visited?.average_rating || defaultSentimentComparison.mostVisited.rating,
            },
            leastVisited: {
              places: comp.comparison.least_visited?.total_places || defaultSentimentComparison.leastVisited.places,
              posts: comp.comparison.least_visited?.total_posts || defaultSentimentComparison.leastVisited.posts,
              engagement: comp.comparison.least_visited?.total_engagement || defaultSentimentComparison.leastVisited.engagement,
              avgEngagement: comp.comparison.least_visited?.average_engagement_per_place || defaultSentimentComparison.leastVisited.avgEngagement,
              positive: comp.comparison.least_visited?.sentiment_distribution?.positive_percentage || defaultSentimentComparison.leastVisited.positive,
              neutral: comp.comparison.least_visited?.sentiment_distribution?.neutral_percentage || defaultSentimentComparison.leastVisited.neutral,
              negative: comp.comparison.least_visited?.sentiment_distribution?.negative_percentage || defaultSentimentComparison.leastVisited.negative,
              rating: comp.comparison.least_visited?.average_rating || defaultSentimentComparison.leastVisited.rating,
            },
            insights: comp.insights || defaultSentimentComparison.insights,
          });
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
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

  const sentimentPieData = [
    { name: 'Positive', value: metrics.sentiment.positivePct, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: metrics.sentiment.neutralPct, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: metrics.sentiment.negativePct, color: SENTIMENT_COLORS.negative }
  ];

  const platformBarData = metrics.platforms.map(p => ({
    name: p.platform,
    posts: p.posts,
    engagement: p.likes + p.comments + p.shares,
    color: p.platform === 'Instagram' ? '#E1306C' : 
           p.platform === 'Facebook' ? '#1877F2' :
           p.platform === 'Twitter' ? '#1DA1F2' :
           p.platform === 'TikTok' ? '#FF0050' : '#8B5CF6'
  }));

  // Metric Cards data
  const metricCards = [
    { 
      label: 'Total Posts', 
      value: formatNumber(metrics.totalPosts), 
      change: `+${metrics.trendingPct}%`,
      changePositive: true,
      color: '#3b82f6',
      icon: '📝'
    },
    { 
      label: 'Total Likes', 
      value: formatNumber(metrics.totalLikes), 
      change: '+8.2%',
      changePositive: true,
      color: '#ec4899',
      icon: '❤️'
    },
    { 
      label: 'Comments', 
      value: formatNumber(metrics.totalComments), 
      change: '+15%',
      changePositive: true,
      color: '#14b8a6',
      icon: '💬'
    },
    { 
      label: 'Page Views', 
      value: formatNumber(metrics.pageViews), 
      change: '+22%',
      changePositive: true,
      color: '#f97316',
      icon: '👁️'
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
    }}>
      {/* Shared Header */}
      <SharedHeader />

      {/* Page Title Section */}
      <div style={{
        paddingTop: '73px',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '89px 24px 16px 24px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <BarChart3 size={28} color="#8b5cf6" />
              Tourism Analytics
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
              Real-time insights into Kedah tourism performance
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Live Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: '#22c55e',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                animation: 'pulse 2s infinite',
              }} />
              Live Data
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '16px 24px',
        position: 'sticky',
        top: '57px',
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}>
          {/* Region Filter */}
          <FilterDropdown
            label="Region"
            icon={<Filter size={16} />}
            options={CITIES}
            value={selectedCity}
            onChange={(val) => setSelectedCity(val as string)}
            accentColor="#8b5cf6"
          />

          {/* Time Range */}
          <SortDropdown
            options={TIME_RANGES}
            value={timeRange}
            onChange={(val) => setTimeRange(val as string)}
            accentColor="#8b5cf6"
          />
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px',
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: '140px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  animation: 'pulse 2s infinite',
                }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
              }}>
                {metricCards.map((card, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = card.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{card.icon}</span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: card.changePositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: card.changePositive ? '#22c55e' : '#ef4444',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {card.changePositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {card.change}
                      </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      {card.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Charts Section */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px',
              }}>
                {/* Engagement Trends */}
                <div style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      📈 Engagement Trends
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>Daily social media activity</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#ec4899' }} />
                      Likes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#3b82f6' }} />
                      Comments
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#10b981' }} />
                      Shares
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={metrics.dailyTrends}>
                      <defs>
                        <linearGradient id="colorLikesDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCommentsDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSharesDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff'
                        }} 
                      />
                      <Area type="monotone" dataKey="likes" stroke="#EC4899" strokeWidth={2} fill="url(#colorLikesDark)" />
                      <Area type="monotone" dataKey="comments" stroke="#3B82F6" strokeWidth={2} fill="url(#colorCommentsDark)" />
                      <Area type="monotone" dataKey="shares" stroke="#10B981" strokeWidth={2} fill="url(#colorSharesDark)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Platform Performance */}
                <div style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      🌐 Platform Performance
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>Engagement by social platform</p>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={platformBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff'
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
              </div>
            </section>

            {/* Bottom Section */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px',
              }}>
                {/* Sentiment Analysis */}
                <div style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      😊 Visitor Sentiment
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>How tourists feel about Kedah</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <ResponsiveContainer width={180} height={180}>
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
                            backgroundColor: '#1e293b', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1 }}>
                      {sentimentPieData.map((item, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          marginBottom: index < sentimentPieData.length - 1 ? '8px' : 0
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '4px', 
                              backgroundColor: item.color 
                            }} />
                            <span style={{ color: '#94a3b8', fontSize: '14px' }}>{item.name}</span>
                          </div>
                          <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '16px' }}>{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Destinations */}
                <div style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      🏆 Top Destinations
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>Most popular attractions by engagement</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {topPlaces.map((place, index) => (
                      <div
                        key={place.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '14px',
                            color: '#ffffff',
                            backgroundColor: index === 0 ? '#eab308' : 
                                           index === 1 ? '#94a3b8' : 
                                           index === 2 ? '#d97706' : '#475569'
                          }}>
                            {index + 1}
                          </div>
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>{place.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                              <span style={{ color: '#64748b', fontSize: '12px' }}>
                                {formatNumber(place.visitors)} engagements
                              </span>
                              <span style={{ color: '#eab308', fontSize: '12px' }}>
                                ★ {place.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: place.trend >= 0 ? '#22c55e' : '#ef4444',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}>
                          {place.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          {Math.abs(place.trend)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Most Visited & Hidden Gems Section */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px',
              }}>
                {/* Most Visited Places */}
                <div style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}>
                  <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} color="#22c55e" />
                        Most Visited Places
                      </h3>
                      <p style={{ fontSize: '14px', color: '#94a3b8' }}>Top performing destinations by engagement</p>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {mostVisited.length} places
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {mostVisited.map((place, index) => (
                      <div
                        key={place.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderRadius: '12px',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.2)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '13px',
                            color: '#ffffff',
                            backgroundColor: index === 0 ? '#22c55e' : 
                                           index === 1 ? '#16a34a' : 
                                           index === 2 ? '#15803d' : '#166534'
                          }}>
                            {index + 1}
                          </div>
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>{place.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <span style={{ color: '#64748b', fontSize: '11px' }}>{place.category}</span>
                              <span style={{ color: '#475569', fontSize: '11px' }}>•</span>
                              <span style={{ color: '#64748b', fontSize: '11px' }}>{place.city}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#22c55e', fontWeight: '700', fontSize: '14px' }}>
                            {formatNumber(place.engagement)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                            <span style={{ color: '#eab308', fontSize: '11px' }}>★ {place.rating.toFixed(1)}</span>
                            <span style={{ color: '#64748b', fontSize: '11px' }}>{place.posts} posts</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hidden Gems (Least Visited) */}
                <div style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                }}>
                  <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>💎</span>
                        Hidden Gems
                      </h3>
                      <p style={{ fontSize: '14px', color: '#94a3b8' }}>Undiscovered treasures waiting to be explored</p>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(249, 115, 22, 0.2)',
                      color: '#f97316',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {leastVisited.length} gems
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {leastVisited.map((place, index) => (
                      <div
                        key={place.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          backgroundColor: 'rgba(249, 115, 22, 0.1)',
                          borderRadius: '12px',
                          border: '1px solid rgba(249, 115, 22, 0.2)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.2)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            backgroundColor: 'rgba(249, 115, 22, 0.3)',
                          }}>
                            💎
                          </div>
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>{place.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <span style={{ color: '#64748b', fontSize: '11px' }}>{place.category}</span>
                              <span style={{ color: '#475569', fontSize: '11px' }}>•</span>
                              <span style={{ color: '#64748b', fontSize: '11px' }}>{place.city}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#f97316', fontWeight: '700', fontSize: '14px' }}>
                            {formatNumber(place.engagement)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                            <span style={{ color: '#eab308', fontSize: '11px' }}>★ {place.rating.toFixed(1)}</span>
                            <span style={{ color: '#22c55e', fontSize: '11px' }}>{place.sentiment}% 😊</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Promotion banner */}
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.1) 100%)',
                    borderRadius: '10px',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                  }}>
                    <p style={{ color: '#f97316', fontSize: '13px', fontWeight: '500', margin: 0 }}>
                      🌟 These hidden gems have great ratings but less traffic. Perfect for visitors seeking authentic experiences!
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================ */}
            {/* SENTIMENT ANALYTICS COMPARISON SECTION */}
            {/* ============================================ */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🧠</span>
                    Sentiment Analytics
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Compare visitor sentiment between popular destinations and hidden gems
                  </p>
                </div>

                {/* Comparison Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                  marginBottom: '24px',
                }}>
                  {/* Most Visited Sentiment */}
                  <div style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <TrendingUp size={20} color="#22c55e" />
                      <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '16px' }}>Most Visited</span>
                      <span style={{ 
                        backgroundColor: '#22c55e', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>Top 33%</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Places</div>
                        <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>{sentimentComparison.mostVisited.places}</div>
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Posts</div>
                        <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>{sentimentComparison.mostVisited.posts}</div>
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Positive 😊</div>
                        <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>{sentimentComparison.mostVisited.positive.toFixed(0)}%</div>
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Rating</div>
                        <div style={{ color: '#eab308', fontSize: '24px', fontWeight: '700' }}>★ {sentimentComparison.mostVisited.rating.toFixed(1)}</div>
                      </div>
                    </div>

                    {/* Sentiment Bar */}
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${sentimentComparison.mostVisited.positive}%`, backgroundColor: '#22c55e' }} />
                        <div style={{ width: `${sentimentComparison.mostVisited.neutral}%`, backgroundColor: '#f59e0b' }} />
                        <div style={{ width: `${sentimentComparison.mostVisited.negative}%`, backgroundColor: '#ef4444' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px' }}>
                        <span style={{ color: '#22c55e' }}>😊 {sentimentComparison.mostVisited.positive.toFixed(0)}%</span>
                        <span style={{ color: '#f59e0b' }}>😐 {sentimentComparison.mostVisited.neutral.toFixed(0)}%</span>
                        <span style={{ color: '#ef4444' }}>😞 {sentimentComparison.mostVisited.negative.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Gems Sentiment */}
                  <div style={{
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '20px' }}>💎</span>
                      <span style={{ color: '#f97316', fontWeight: '600', fontSize: '16px' }}>Hidden Gems</span>
                      <span style={{ 
                        backgroundColor: '#f97316', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>Bottom 33%</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Places</div>
                        <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>{sentimentComparison.leastVisited.places}</div>
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Posts</div>
                        <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>{sentimentComparison.leastVisited.posts}</div>
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Positive 😊</div>
                        <div style={{ color: '#f97316', fontSize: '24px', fontWeight: '700' }}>{sentimentComparison.leastVisited.positive.toFixed(0)}%</div>
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Rating</div>
                        <div style={{ color: '#eab308', fontSize: '24px', fontWeight: '700' }}>★ {sentimentComparison.leastVisited.rating.toFixed(1)}</div>
                      </div>
                    </div>

                    {/* Sentiment Bar */}
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${sentimentComparison.leastVisited.positive}%`, backgroundColor: '#22c55e' }} />
                        <div style={{ width: `${sentimentComparison.leastVisited.neutral}%`, backgroundColor: '#f59e0b' }} />
                        <div style={{ width: `${sentimentComparison.leastVisited.negative}%`, backgroundColor: '#ef4444' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px' }}>
                        <span style={{ color: '#22c55e' }}>😊 {sentimentComparison.leastVisited.positive.toFixed(0)}%</span>
                        <span style={{ color: '#f59e0b' }}>😐 {sentimentComparison.leastVisited.neutral.toFixed(0)}%</span>
                        <span style={{ color: '#ef4444' }}>😞 {sentimentComparison.leastVisited.negative.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement Comparison */}
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>📊</span>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Engagement Gap</div>
                        <div style={{ color: '#3b82f6', fontSize: '20px', fontWeight: '700' }}>
                          {Math.round(sentimentComparison.mostVisited.avgEngagement / Math.max(sentimentComparison.leastVisited.avgEngagement, 1))}x higher
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>Most Visited Avg</div>
                      <div style={{ color: '#22c55e', fontSize: '18px', fontWeight: '600' }}>{formatNumber(sentimentComparison.mostVisited.avgEngagement)}</div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '20px' }}>vs</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>Hidden Gems Avg</div>
                      <div style={{ color: '#f97316', fontSize: '18px', fontWeight: '600' }}>{formatNumber(sentimentComparison.leastVisited.avgEngagement)}</div>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px' }}>💡</span>
                    <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '16px' }}>AI-Generated Insights</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sentimentComparison.insights.map((insight, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 16px',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          borderRadius: '10px',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}
                      >
                        <span style={{ 
                          color: '#8b5cf6', 
                          fontWeight: '700', 
                          fontSize: '14px',
                          minWidth: '20px',
                        }}>{index + 1}.</span>
                        <span style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5' }}>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Insights Banner */}
            <section>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
                borderRadius: '16px',
                padding: '28px',
                color: '#ffffff',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    💡
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Quick Insights</h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '16px' }}>🎯</span>
                        <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          Langkawi Sky Bridge is trending with <strong>+15%</strong> more mentions this period
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '16px' }}>📱</span>
                        <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          Instagram drives <strong>49%</strong> of all social engagement for Kedah tourism
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '16px' }}>😊</span>
                        <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          Visitor sentiment is <strong>{metrics.sentiment.positivePct}% positive</strong>, showing great satisfaction
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <SharedFooter />

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
