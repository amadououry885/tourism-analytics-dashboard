import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { TrendingUp, TrendingDown, Smile, Meh, Frown, Lightbulb, BarChart3, Info, MapPin, MessageCircle, Star, Sparkles, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

// ============================================
// DESIGN SYSTEM - Consistent Color Palette
// ============================================
const COLORS = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  success: '#22C55E',
  danger: '#EF4444',
  neutral: '#6B7280',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E5E7EB',
  textMain: '#111827',
  textSoft: '#6B7280',
};

const SENTIMENT_COLORS = {
  positive: COLORS.success,
  neutral: COLORS.secondary,
  negative: COLORS.danger,
};

// ============================================
// TypeScript Interfaces
// ============================================
interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
}

interface VisitLevelStats {
  category: string;
  total_places: number;
  total_posts: number;
  total_engagement: number;
  average_engagement_per_place: number;
  sentiment_distribution: SentimentDistribution;
  average_sentiment_score: number;
  average_rating: number;
}

interface ComparisonData {
  comparison: {
    most_visited: VisitLevelStats;
    least_visited: VisitLevelStats;
  };
  insights: string[];
  methodology: {
    most_visited_threshold: string;
    least_visited_threshold: string;
    total_places_analyzed: number;
    engagement_calculation: string;
    rating_formula: string;
  };
  is_demo_data?: boolean;
}

// Interface for individual place data
interface PlaceData {
  id: number;
  name: string;
  category: string;
  city: string;
  state: string;
  total_engagement: number;
  posts_count: number;
  sentiment: {
    positive_percentage: number;
    rating: number;
  };
}

// ============================================
// Demo/Fallback Data for Places
// ============================================
const defaultMostVisitedPlaces: PlaceData[] = [
  { id: 1, name: 'Langkawi Sky Bridge', category: 'Landmark', city: 'Langkawi', state: 'Kedah', total_engagement: 125000, posts_count: 89, sentiment: { positive_percentage: 85, rating: 4.7 } },
  { id: 2, name: 'Menara Alor Setar', category: 'Landmark', city: 'Alor Setar', state: 'Kedah', total_engagement: 58400, posts_count: 42, sentiment: { positive_percentage: 78, rating: 4.5 } },
  { id: 3, name: 'Zahir Mosque', category: 'Religious Site', city: 'Alor Setar', state: 'Kedah', total_engagement: 49200, posts_count: 38, sentiment: { positive_percentage: 82, rating: 4.6 } },
  { id: 4, name: 'Underwater World Langkawi', category: 'Attraction', city: 'Langkawi', state: 'Kedah', total_engagement: 42000, posts_count: 35, sentiment: { positive_percentage: 75, rating: 4.3 } },
  { id: 5, name: 'Eagle Square', category: 'Landmark', city: 'Langkawi', state: 'Kedah', total_engagement: 38500, posts_count: 31, sentiment: { positive_percentage: 80, rating: 4.4 } },
];

const defaultHiddenGemPlaces: PlaceData[] = [
  { id: 6, name: 'Nobat Tower', category: 'Historical', city: 'Alor Setar', state: 'Kedah', total_engagement: 680, posts_count: 12, sentiment: { positive_percentage: 72, rating: 4.3 } },
  { id: 7, name: 'Royal Museum', category: 'Museum', city: 'Alor Setar', state: 'Kedah', total_engagement: 520, posts_count: 9, sentiment: { positive_percentage: 68, rating: 4.2 } },
  { id: 8, name: 'Balai Besar', category: 'Historical', city: 'Alor Setar', state: 'Kedah', total_engagement: 450, posts_count: 8, sentiment: { positive_percentage: 70, rating: 4.1 } },
  { id: 9, name: 'Laman Padi', category: 'Cultural', city: 'Langkawi', state: 'Kedah', total_engagement: 380, posts_count: 7, sentiment: { positive_percentage: 75, rating: 4.4 } },
  { id: 10, name: 'Pekan Rabu Complex', category: 'Shopping', city: 'Alor Setar', state: 'Kedah', total_engagement: 320, posts_count: 6, sentiment: { positive_percentage: 65, rating: 4.0 } },
];

// ============================================
// Demo/Fallback Data
// ============================================
const defaultData: ComparisonData = {
  is_demo_data: true,
  comparison: {
    most_visited: {
      category: 'Most Visited',
      total_places: 7,
      total_posts: 58,
      total_engagement: 746889,
      average_engagement_per_place: 106698,
      sentiment_distribution: {
        positive: 42,
        neutral: 12,
        negative: 4,
        positive_percentage: 72.5,
        neutral_percentage: 20.0,
        negative_percentage: 7.5
      },
      average_sentiment_score: 0.60,
      average_rating: 4.60
    },
    least_visited: {
      category: 'Least Visited',
      total_places: 7,
      total_posts: 19,
      total_engagement: 5222,
      average_engagement_per_place: 746,
      sentiment_distribution: {
        positive: 12,
        neutral: 5,
        negative: 2,
        positive_percentage: 63.2,
        neutral_percentage: 26.3,
        negative_percentage: 10.5
      },
      average_sentiment_score: 0.45,
      average_rating: 4.20
    }
  },
  insights: [
    'Most visited places have higher sentiment scores, suggesting visitor satisfaction drives popularity.',
    'Hidden gems maintain strong positive sentiment despite lower engagement, indicating potential for growth.',
    'Engagement is 143x higher for popular places, showing significant room to promote hidden gems.'
  ],
  methodology: {
    most_visited_threshold: '≥4500 engagement points (top 33%)',
    least_visited_threshold: '≤1500 engagement points (bottom 33%)',
    total_places_analyzed: 14,
    engagement_calculation: 'likes + comments + shares',
    rating_formula: '((sentiment_score + 1) / 2) * 4 + 1'
  }
};

// ============================================
// Reusable Card Component
// ============================================
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div 
    className={`bg-white rounded-xl p-6 ${className}`}
    style={{ 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: `1px solid ${COLORS.border}`
    }}
  >
    {children}
  </div>
);

// ============================================
// Custom Tooltip for Charts
// ============================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="p-3 rounded-lg"
        style={{ 
          backgroundColor: COLORS.card,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: `1px solid ${COLORS.border}`
        }}
      >
        <p className="font-semibold mb-2" style={{ color: COLORS.textMain }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.fill }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================
// Main Component - STREAMLINED (No Duplications)
// ============================================
export function SentimentComparison() {
  const [data, setData] = useState<ComparisonData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [mostVisitedPlaces, setMostVisitedPlaces] = useState<PlaceData[]>(defaultMostVisitedPlaces);
  const [hiddenGemPlaces, setHiddenGemPlaces] = useState<PlaceData[]>(defaultHiddenGemPlaces);
  const [activeTab, setActiveTab] = useState<'both' | 'most' | 'hidden'>('both');

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch comparison data
        const [comparisonRes, mostRes, leastRes] = await Promise.all([
          api.get('/analytics/sentiment/comparison/'),
          api.get('/analytics/places/by-visit-level/?level=most'),
          api.get('/analytics/places/by-visit-level/?level=least')
        ]);
        
        setData(comparisonRes.data);
        
        // Map places data
        if (mostRes.data.places && mostRes.data.places.length > 0) {
          setMostVisitedPlaces(mostRes.data.places.slice(0, 5).map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Place',
            city: p.city || 'Kedah',
            state: p.state || 'Kedah',
            total_engagement: p.total_engagement || 0,
            posts_count: p.posts_count || 0,
            sentiment: {
              positive_percentage: p.sentiment?.positive_percentage || 70,
              rating: p.sentiment?.rating || 4.0
            }
          })));
        }
        
        if (leastRes.data.places && leastRes.data.places.length > 0) {
          setHiddenGemPlaces(leastRes.data.places.slice(0, 5).map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Place',
            city: p.city || 'Kedah',
            state: p.state || 'Kedah',
            total_engagement: p.total_engagement || 0,
            posts_count: p.posts_count || 0,
            sentiment: {
              positive_percentage: p.sentiment?.positive_percentage || 65,
              rating: p.sentiment?.rating || 4.0
            }
          })));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Visited Skeleton */}
          <div className="space-y-4">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-green-100 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-12"></div>
                </div>
              </div>
            ))}
          </div>
          {/* Hidden Gems Skeleton */}
          <div className="space-y-4">
            <div className="h-5 bg-gray-200 rounded w-28"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-amber-100 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Safety check for data structure
  if (!data || !data.comparison || !data.comparison.most_visited || !data.comparison.least_visited) {
    console.error('SentimentComparison: Invalid data structure', data);
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">
          <p>Unable to load sentiment comparison data.</p>
        </div>
      </Card>
    );
  }

  const { comparison, insights, methodology } = data;

  // ONE chart data - the main comparison
  const comparisonChartData = [
    {
      category: 'Most Visited',
      positive: comparison.most_visited.sentiment_distribution.positive_percentage,
      neutral: comparison.most_visited.sentiment_distribution.neutral_percentage,
      negative: comparison.most_visited.sentiment_distribution.negative_percentage,
    },
    {
      category: 'Hidden Gems',
      positive: comparison.least_visited.sentiment_distribution.positive_percentage,
      neutral: comparison.least_visited.sentiment_distribution.neutral_percentage,
      negative: comparison.least_visited.sentiment_distribution.negative_percentage,
    },
  ];

  // Calculate engagement multiplier for insight
  const engagementMultiplier = comparison.most_visited.average_engagement_per_place > 0 && comparison.least_visited.average_engagement_per_place > 0
    ? Math.round(comparison.most_visited.average_engagement_per_place / comparison.least_visited.average_engagement_per_place)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ============================================ */}
      {/* SECTION 1: Header + Quick Summary */}
      {/* One visual: Header with key number */}
      {/* ============================================ */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <BarChart3 className="w-6 h-6" style={{ color: COLORS.primary }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: COLORS.textMain }}>
                Sentiment Analysis: Popular vs Hidden Gems
              </h1>
              <p className="text-sm mt-1" style={{ color: COLORS.textSoft }}>
                Comparing visitor feelings across {methodology.total_places_analyzed} destinations in Kedah
              </p>
            </div>
          </div>
          
          {/* Quick stat badge */}
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 rounded-lg" style={{ backgroundColor: '#ECFDF5' }}>
              <div className="text-lg font-bold" style={{ color: COLORS.success }}>
                {((comparison.most_visited.sentiment_distribution.positive_percentage + comparison.least_visited.sentiment_distribution.positive_percentage) / 2).toFixed(0)}%
              </div>
              <div className="text-xs" style={{ color: COLORS.textSoft }}>Avg Positive</div>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================ */}
      {/* SECTION 2: ONE Comparison Card (Most vs Hidden) */}
      {/* One visual: Side-by-side metrics comparison */}
      {/* ============================================ */}
      <Card>
        <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.textMain }}>
          At a Glance: Most Visited vs Hidden Gems
        </h2>
        <p className="text-sm mb-6" style={{ color: COLORS.textSoft }}>
          Key metrics showing the difference between popular destinations and lesser-known spots
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Most Visited */}
          <div className="p-5 rounded-xl" style={{ backgroundColor: '#F0FDF4', border: `1px solid ${COLORS.success}30` }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" style={{ color: COLORS.success }} />
              <span className="font-semibold" style={{ color: COLORS.textMain }}>Most Visited</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: COLORS.success, color: 'white' }}>
                Top 33%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 text-2xl font-bold" style={{ color: COLORS.textMain }}>
                  <MapPin className="w-5 h-5" style={{ color: COLORS.success }} />
                  {comparison.most_visited.total_places}
                </div>
                <div className="text-xs" style={{ color: COLORS.textSoft }}>Places</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-2xl font-bold" style={{ color: COLORS.textMain }}>
                  <MessageCircle className="w-5 h-5" style={{ color: COLORS.success }} />
                  {comparison.most_visited.total_posts}
                </div>
                <div className="text-xs" style={{ color: COLORS.textSoft }}>Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: COLORS.success }}>
                  {comparison.most_visited.sentiment_distribution.positive_percentage.toFixed(0)}%
                </div>
                <div className="text-xs" style={{ color: COLORS.textSoft }}>Positive</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center gap-1" style={{ color: COLORS.textMain }}>
                  {comparison.most_visited.average_rating.toFixed(1)}
                  <span className="text-yellow-500 text-lg">★</span>
                </div>
                <div className="text-xs" style={{ color: COLORS.textSoft }}>Rating</div>
              </div>
            </div>
          </div>

          {/* Hidden Gems */}
          <div className="p-5 rounded-xl" style={{ backgroundColor: '#FFF7ED', border: `1px solid #EA580C30` }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5" style={{ color: '#EA580C' }} />
              <span className="font-semibold" style={{ color: COLORS.textMain }}>Hidden Gems</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EA580C', color: 'white' }}>
                Bottom 33%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 text-2xl font-bold" style={{ color: COLORS.textMain }}>
                  <MapPin className="w-5 h-5" style={{ color: '#EA580C' }} />
                  {comparison.least_visited.total_places}
                </div>
                <div className="text-xs" style={{ color: COLORS.textSoft }}>Places</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-2xl font-bold" style={{ color: COLORS.textMain }}>
                  <MessageCircle className="w-5 h-5" style={{ color: '#EA580C' }} />
                  {comparison.least_visited.total_posts}
                </div>
                <div className="text-xs" style={{ color: COLORS.textSoft }}>Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#EA580C' }}>
                  {comparison.least_visited.sentiment_distribution.positive_percentage.toFixed(0)}%
                </div>
                <div className="text-xs" style={{ color: COLORS.textSoft }}>Positive</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center gap-1" style={{ color: COLORS.textMain }}>
                  {comparison.least_visited.average_rating.toFixed(1)}
                  <span className="text-yellow-500 text-lg">★</span>
                </div>
                <div className="text-xs" style={{ color: COLORS.textSoft }}>Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Engagement insight */}
        {engagementMultiplier > 1 && (
          <div className="mt-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#EFF6FF' }}>
            <Info className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.primary }} />
            <span className="text-sm" style={{ color: COLORS.textMain }}>
              Popular places get <strong>{engagementMultiplier}x more engagement</strong> than hidden gems — 
              opportunity to promote lesser-known destinations!
            </span>
          </div>
        )}
      </Card>

      {/* ============================================ */}
      {/* SECTION 3: Most Visited & Hidden Gem Places */}
      {/* Actionable list of actual places */}
      {/* ============================================ */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: COLORS.textMain }}>
              Most Visited & Hidden Gem Places
            </h2>
            <p className="text-sm mt-1" style={{ color: COLORS.textSoft }}>
              Discover which destinations are thriving and which deserve more attention
            </p>
          </div>
          
          {/* Tab Toggle */}
          <div className="flex rounded-lg p-1" style={{ backgroundColor: '#F1F5F9' }}>
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'both' ? 'bg-white shadow-sm' : ''
              }`}
              style={{ color: activeTab === 'both' ? COLORS.primary : COLORS.textSoft }}
            >
              Both
            </button>
            <button
              onClick={() => setActiveTab('most')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'most' ? 'bg-white shadow-sm' : ''
              }`}
              style={{ color: activeTab === 'most' ? COLORS.success : COLORS.textSoft }}
            >
              ⭐ Most Visited
            </button>
            <button
              onClick={() => setActiveTab('hidden')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'hidden' ? 'bg-white shadow-sm' : ''
              }`}
              style={{ color: activeTab === 'hidden' ? '#EA580C' : COLORS.textSoft }}
            >
              🌱 Hidden Gems
            </button>
          </div>
        </div>

        {/* Places Grid */}
        <div className={`grid gap-6 ${activeTab === 'both' ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          
          {/* Most Visited Column */}
          {(activeTab === 'both' || activeTab === 'most') && (
            <div>
              {activeTab === 'both' && (
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5" style={{ color: COLORS.success }} />
                  <h3 className="font-semibold" style={{ color: COLORS.textMain }}>Most Visited (Top 33%)</h3>
                </div>
              )}
              <div className="space-y-3">
                {mostVisitedPlaces.map((place) => (
                  <div 
                    key={place.id}
                    className="p-4 rounded-xl transition-all hover:shadow-md"
                    style={{ 
                      backgroundColor: '#F0FDF4',
                      border: `1px solid ${COLORS.success}20`
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate" style={{ color: COLORS.textMain }}>
                            {place.name}
                          </h4>
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS.success, color: 'white' }}
                          >
                            ⭐ Popular
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.textSoft }}>
                          <MapPin className="w-3 h-3" />
                          <span>{place.city}</span>
                          <span>•</span>
                          <span>{place.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.success}15` }}>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" style={{ color: COLORS.success }} />
                        <span className="text-sm font-medium" style={{ color: COLORS.textMain }}>
                          {place.total_engagement.toLocaleString()}
                        </span>
                        <span className="text-xs" style={{ color: COLORS.textSoft }}>engagement</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" style={{ color: COLORS.textSoft }} />
                        <span className="text-sm" style={{ color: COLORS.textSoft }}>{place.posts_count} posts</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-sm font-medium" style={{ color: COLORS.textMain }}>
                          {place.sentiment.rating.toFixed(1)}
                        </span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Gems Column */}
          {(activeTab === 'both' || activeTab === 'hidden') && (
            <div>
              {activeTab === 'both' && (
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" style={{ color: '#EA580C' }} />
                  <h3 className="font-semibold" style={{ color: COLORS.textMain }}>Hidden Gems (Bottom 33%)</h3>
                </div>
              )}
              <div className="space-y-3">
                {hiddenGemPlaces.map((place) => (
                  <div 
                    key={place.id}
                    className="p-4 rounded-xl transition-all hover:shadow-md"
                    style={{ 
                      backgroundColor: '#FFF7ED',
                      border: `1px solid #EA580C20`
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate" style={{ color: COLORS.textMain }}>
                            {place.name}
                          </h4>
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#EA580C', color: 'white' }}
                          >
                            🌱 Hidden Gem
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.textSoft }}>
                          <MapPin className="w-3 h-3" />
                          <span>{place.city}</span>
                          <span>•</span>
                          <span>{place.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid #EA580C15` }}>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" style={{ color: '#EA580C' }} />
                        <span className="text-sm font-medium" style={{ color: COLORS.textMain }}>
                          {place.total_engagement.toLocaleString()}
                        </span>
                        <span className="text-xs" style={{ color: COLORS.textSoft }}>engagement</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" style={{ color: COLORS.textSoft }} />
                        <span className="text-sm" style={{ color: COLORS.textSoft }}>{place.posts_count} posts</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-sm font-medium" style={{ color: COLORS.textMain }}>
                          {place.sentiment.rating.toFixed(1)}
                        </span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Call to action */}
        <div className="mt-6 p-4 rounded-lg text-center" style={{ backgroundColor: '#F8FAFC' }}>
          <p className="text-sm" style={{ color: COLORS.textSoft }}>
            💡 <strong style={{ color: COLORS.textMain }}>Pro Tip:</strong> Hidden gems often have great ratings! 
            Consider promoting these lesser-known destinations to distribute tourism more evenly.
          </p>
        </div>
      </Card>

      {/* ============================================ */}
      {/* SECTION 4: ONE Chart - Bar Comparison */}
      {/* One visual: Sentiment bar chart */}
      {/* ============================================ */}
      <Card>
        <h2 className="text-lg font-semibold mb-1" style={{ color: COLORS.textMain }}>
          Sentiment Breakdown
        </h2>
        <p className="text-sm mb-6" style={{ color: COLORS.textSoft }}>
          How visitors feel about each category of destinations
        </p>
        
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={comparisonChartData} barGap={8} layout="vertical">
            <XAxis 
              type="number"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: COLORS.textSoft, fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category"
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: COLORS.textMain, fontSize: 14, fontWeight: 500 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span style={{ color: COLORS.textMain }}>{value}</span>}
            />
            <Bar dataKey="positive" fill={SENTIMENT_COLORS.positive} name="Positive" stackId="a" radius={[0, 4, 4, 0]} />
            <Bar dataKey="neutral" fill={SENTIMENT_COLORS.neutral} name="Neutral" stackId="a" />
            <Bar dataKey="negative" fill={SENTIMENT_COLORS.negative} name="Negative" stackId="a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend explanation for non-technical users */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Smile className="w-4 h-4" style={{ color: COLORS.success }} />
            <span className="text-xs" style={{ color: COLORS.textSoft }}>Positive = Happy visitors</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Meh className="w-4 h-4" style={{ color: COLORS.secondary }} />
            <span className="text-xs" style={{ color: COLORS.textSoft }}>Neutral = Mixed feelings</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Frown className="w-4 h-4" style={{ color: COLORS.danger }} />
            <span className="text-xs" style={{ color: COLORS.textSoft }}>Negative = Unhappy visitors</span>
          </div>
        </div>
      </Card>

      {/* ============================================ */}
      {/* SECTION 4: Key Insights (Keep - this is valuable) */}
      {/* One visual: Insight list */}
      {/* ============================================ */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#F3E8FF' }}
          >
            <Lightbulb className="w-5 h-5" style={{ color: '#9333EA' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: COLORS.textMain }}>Key Takeaways</h3>
            <p className="text-sm" style={{ color: COLORS.textSoft }}>What this data means for tourism planning</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {insights.slice(0, 3).map((insight, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ 
                backgroundColor: index === 0 ? '#EFF6FF' : '#F8FAFC',
                borderLeft: `3px solid ${index === 0 ? COLORS.primary : COLORS.border}`
              }}
            >
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                style={{ 
                  backgroundColor: index === 0 ? COLORS.primary : COLORS.border,
                  color: index === 0 ? 'white' : COLORS.textSoft
                }}
              >
                {index + 1}
              </div>
              <p className="text-sm" style={{ color: COLORS.textMain }}>{insight}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
