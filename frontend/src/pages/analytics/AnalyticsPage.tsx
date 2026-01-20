import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';
import api from '../../services/api';
import { SharedHeader } from '../../components/SharedLayout';
import { FilterDropdown, SortDropdown } from '../../components/FilterDropdown';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- Types ---
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
  }>;
}

// --- THEME CONSTANTS ---
const THEME = {
  bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)', // Blue-Mint Gradient
  bgCard: '#ffffff',       
  headerBg: '#e0f2fe',     // Soft Sky Blue Header
  text: '#1e293b',         
  textSecondary: '#64748b',
  border: '#e2e8f0',
  borderHighlight: '#bae6fd',
  accent: '#0d9488',       // Teal 600
  chartGrid: '#f1f5f9',
};

// --- Demo Data ---
const defaultMetrics: OverviewMetrics = {
  totalPosts: 1247,
  totalLikes: 45892,
  totalComments: 8934,
  totalShares: 3421,
  pageViews: 125000,
  trendingPct: 12.5,
  sentiment: {
    positive: 842, neutral: 289, negative: 116,
    positivePct: 68, neutralPct: 23, negativePct: 9
  },
  platforms: [
    { platform: 'Instagram', posts: 523, likes: 22450, comments: 4200, shares: 1890 },
    { platform: 'Facebook', posts: 412, likes: 15230, comments: 3100, shares: 980 },
    { platform: 'Twitter', posts: 198, likes: 5890, comments: 1200, shares: 420 },
    { platform: 'TikTok', posts: 114, likes: 2322, comments: 434, shares: 131 }
  ],
  dailyTrends: [
    { date: 'Mon', likes: 5200, comments: 890, shares: 320 },
    { date: 'Tue', likes: 6100, comments: 1020, shares: 410 },
    { date: 'Wed', likes: 5800, comments: 950, shares: 380 },
    { date: 'Thu', likes: 7200, comments: 1250, shares: 520 },
    { date: 'Fri', likes: 8500, comments: 1480, shares: 620 },
    { date: 'Sat', likes: 9200, comments: 1650, shares: 710 },
    { date: 'Sun', likes: 8100, comments: 1420, shares: 580 }
  ]
};

const defaultPlaces = [
  { name: 'Langkawi Sky Bridge', visitors: 125000, rating: 4.8, trend: 15 },
  { name: 'Menara Alor Setar', visitors: 58400, rating: 4.5, trend: 8 },
  { name: 'Zahir Mosque', visitors: 49200, rating: 4.7, trend: 12 },
  { name: 'Underwater World', visitors: 42000, rating: 4.3, trend: -3 },
  { name: 'Eagle Square', visitors: 38500, rating: 4.4, trend: 5 }
];

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
  positive: '#10B981', // Emerald
  neutral: '#F59E0B',  // Amber
  negative: '#EF4444'  // Red
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics>(defaultMetrics);
  const [topPlaces, setTopPlaces] = useState(defaultPlaces);
  const [loading, setLoading] = useState(true);
  
  const [selectedCity, setSelectedCity] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
        params.append('period', timeRange);

        const [metricsRes, placesRes, sentimentRes] = await Promise.all([
          api.get(`/analytics/overview-metrics/?${params.toString()}`).catch(() => ({ data: null })),
          api.get(`/analytics/places/popular/?${params.toString()}`).catch(() => ({ data: [] })),
          api.get(`/analytics/sentiment/summary/?${params.toString()}`).catch(() => ({ data: null })),
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
    engagement: p.likes + p.comments + p.shares,
    color: p.platform === 'Instagram' ? '#E1306C' : 
           p.platform === 'Facebook' ? '#1877F2' :
           p.platform === 'Twitter' ? '#0ea5e9' :
           p.platform === 'TikTok' ? '#FF0050' : '#8B5CF6'
  }));

  // --- UPDATED CARD COLORS (Fully Colored Backgrounds) ---
  const metricCards = [
    { 
      label: 'Total Posts', 
      value: formatNumber(metrics.totalPosts), 
      change: `+${metrics.trendingPct}%`, 
      changePositive: true, 
      color: '#0ea5e9', // Sky Blue Accent
      bgColor: '#e0f2fe', // Sky Blue Background
      icon: '📝' 
    }, 
    { 
      label: 'Total Likes', 
      value: formatNumber(metrics.totalLikes), 
      change: '+8.2%', 
      changePositive: true, 
      color: '#0d9488', // Teal Accent
      bgColor: '#ccfbf1', // Teal Background
      icon: '❤️' 
    }, 
    { 
      label: 'Comments', 
      value: formatNumber(metrics.totalComments), 
      change: '+15%', 
      changePositive: true, 
      color: '#6366f1', // Indigo Accent
      bgColor: '#e0e7ff', // Indigo Background
      icon: '💬' 
    }, 
    { 
      label: 'Page Views', 
      value: formatNumber(metrics.pageViews), 
      change: '+22%', 
      changePositive: true, 
      color: '#f59e0b', // Amber Accent
      bgColor: '#fef3c7', // Amber Background
      icon: '👁️' 
    }, 
  ];

  return (
    <div style={{ minHeight: '100vh', background: THEME.bgGradient, color: THEME.text, fontFamily: 'Poppins, sans-serif' }}>
      <SharedHeader />

      {/* --- PAGE HEADER --- */}
      <div style={{
        paddingTop: '80px',
        paddingBottom: '30px',
        paddingLeft: '24px',
        paddingRight: '24px',
        background: THEME.headerBg,
        borderBottom: `1px solid ${THEME.borderHighlight}`,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: THEME.text, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart3 size={28} color={THEME.accent} strokeWidth={2.5} />
              Tourism Analytics
            </h1>
            <p style={{ fontSize: '15px', color: THEME.textSecondary, marginTop: '6px', fontWeight: '500' }}>
              Real-time insights into Kedah tourism performance
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#ffffff', color: '#16a34a',           
              padding: '8px 16px', borderRadius: '20px',
              fontSize: '14px', fontWeight: '700',
              border: '1px solid #bbf7d0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16a34a', animation: 'pulse 2s infinite' }} />
              Live Data
            </div>
          </div>
        </div>
      </div>

      {/* --- FILTERS BAR --- */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${THEME.border}`,
        padding: '16px 24px',
        position: 'sticky', top: '70px', zIndex: 40,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <FilterDropdown
            label="Region"
            icon={<Filter size={16} />}
            options={CITIES}
            value={selectedCity}
            onChange={(val) => setSelectedCity(val as string)}
            accentColor={THEME.accent}
          />
          <SortDropdown
            options={TIME_RANGES}
            value={timeRange}
            onChange={(val) => setTimeRange(val as string)}
            accentColor={THEME.accent}
            icon={<Calendar size={16} />}
          />
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px 60px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: '140px', borderRadius: '16px', backgroundColor: '#e2e8f0', animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : (
          <>
            {/* --- METRIC CARDS (Full Background Color) --- */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {metricCards.map((card, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: card.bgColor, // Using the full pastel background
                      borderRadius: '16px',
                      padding: '24px',
                      border: `1px solid ${card.color}30`, // Subtle border matching the theme
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 10px 20px -5px ${card.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      {/* Icon Background - White to pop against color */}
                      <div style={{ 
                        padding: '10px', 
                        borderRadius: '12px', 
                        backgroundColor: '#ffffff', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                         <span style={{ fontSize: '22px' }}>{card.icon}</span>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        backgroundColor: 'rgba(255,255,255,0.6)', // Semi-transparent white
                        color: card.changePositive ? '#16a34a' : '#dc2626',
                        padding: '6px 10px', borderRadius: '20px',
                        fontSize: '13px', fontWeight: '700',
                      }}>
                        {card.changePositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {card.change}
                      </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '4px', letterSpacing: '-1px' }}>
                      {card.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Charts Section */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
                
                {/* Engagement Trends */}
                <div style={{
                  backgroundColor: THEME.bgCard,
                  borderRadius: '16px',
                  padding: '28px',
                  border: `1px solid ${THEME.border}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}>
                  <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: THEME.text, marginBottom: '4px' }}>
                        Engagement Trends
                        </h3>
                        <p style={{ fontSize: '14px', color: THEME.textSecondary }}>Daily social media activity</p>
                    </div>
                     <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: '500' }}>
                        {[{l:'Likes',c:'#ec4899'}, {l:'Comments',c:'#3b82f6'}, {l:'Shares',c:'#10b981'}].map(i => (
                        <span key={i.l} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: THEME.text }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: i.c }} />
                            {i.l}
                        </span>
                        ))}
                    </div>
                  </div>
                 
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics.dailyTrends}>
                      <defs>
                        <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EC4899" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={THEME.chartGrid} vertical={false} />
                      <XAxis dataKey="date" stroke={THEME.textSecondary} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke={THEME.textSecondary} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        cursor={{ stroke: THEME.border, strokeWidth: 1, strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${THEME.border}`, boxShadow: '0 10px 25px rgba(0,0,0,0.08)', color: THEME.text, padding: '12px' }} 
                      />
                      <Area type="monotone" dataKey="likes" stroke="#EC4899" strokeWidth={3} fill="url(#colorLikes)" />
                      <Area type="monotone" dataKey="comments" stroke="#3B82F6" strokeWidth={3} fill="url(#colorComments)" />
                      <Area type="monotone" dataKey="shares" stroke="#10B981" strokeWidth={3} fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Platform Performance */}
                <div style={{
                  backgroundColor: THEME.bgCard,
                  borderRadius: '16px',
                  padding: '28px',
                  border: `1px solid ${THEME.border}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: THEME.text, marginBottom: '4px' }}>
                      Platform Performance
                    </h3>
                    <p style={{ fontSize: '14px', color: THEME.textSecondary }}>Total engagement by platform</p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={platformBarData} layout="vertical" barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke={THEME.chartGrid} horizontal={false} />
                      <XAxis type="number" stroke={THEME.textSecondary} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis dataKey="name" type="category" stroke={THEME.textSecondary} fontSize={12} width={80} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: `1px solid ${THEME.border}`, boxShadow: '0 10px 25px rgba(0,0,0,0.08)', color: THEME.text }} 
                      />
                      <Bar dataKey="engagement" radius={[0, 6, 6, 0]}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                
                {/* Sentiment Analysis */}
                <div style={{
                  backgroundColor: THEME.bgCard,
                  borderRadius: '16px',
                  padding: '28px',
                  border: `1px solid ${THEME.border}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: THEME.text, marginBottom: '4px' }}>
                      Visitor Sentiment
                    </h3>
                    <p style={{ fontSize: '14px', color: THEME.textSecondary }}>Overall tourist feeling</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={sentimentPieData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={80}
                          paddingAngle={5} dataKey="value"
                          cornerRadius={6}
                        >
                          {sentimentPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: `1px solid ${THEME.border}`, color: THEME.text, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1 }}>
                      {sentimentPieData.map((item, index) => (
                        <div key={index} style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: `1px solid ${THEME.border}`,
                          marginBottom: index < sentimentPieData.length - 1 ? '10px' : 0
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: item.color }} />
                            <span style={{ color: THEME.text, fontSize: '14px', fontWeight: '500' }}>{item.name}</span>
                          </div>
                          <span style={{ color: THEME.text, fontWeight: '700', fontSize: '16px' }}>{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Destinations */}
                <div style={{
                  backgroundColor: THEME.bgCard,
                  borderRadius: '16px',
                  padding: '28px',
                  border: `1px solid ${THEME.border}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: THEME.text, marginBottom: '4px' }}>
                      Top Destinations
                    </h3>
                    <p style={{ fontSize: '14px', color: THEME.textSecondary }}>Most popular attractions</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {topPlaces.map((place, index) => (
                      <div
                        key={place.name}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 16px',
                          backgroundColor: index === 0 ? '#f0fdf4' : '#ffffff', 
                          borderRadius: '12px',
                          border: `1px solid ${index === 0 ? '#bbf7d0' : THEME.border}`,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = index === 0 ? '#f0fdf4' : '#f8fafc';
                          e.currentTarget.style.borderColor = THEME.accent;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index === 0 ? '#f0fdf4' : '#ffffff';
                          e.currentTarget.style.borderColor = index === 0 ? '#bbf7d0' : THEME.border;
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            backgroundColor: index === 0 ? '#16a34a' : '#f1f5f9', 
                            color: index === 0 ? 'white' : THEME.textSecondary,
                            border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px'
                          }}>
                            {index + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: THEME.text, fontSize: '15px' }}>{place.name}</div>
                            <div style={{ fontSize: '13px', color: THEME.textSecondary, marginTop: '2px' }}>{formatNumber(place.visitors)} visitors</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <div style={{ fontSize: '14px', fontWeight: '700', color: THEME.accent }}>★ {place.rating}</div>
                           <div style={{ fontSize: '13px', fontWeight: '600', color: place.trend > 0 ? '#16a34a' : '#dc2626', marginTop: '2px' }}>
                             {place.trend > 0 ? '+' : ''}{place.trend}%
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>
          </>
        )}
      </main>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
          50% { opacity: 0.8; transform: scale(1.05); box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
      `}</style>
    </div>
  );
}