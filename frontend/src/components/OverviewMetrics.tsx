import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Users, MessageSquare, Heart, Share2, Eye } from 'lucide-react';
import axios from 'axios';

interface OverviewMetricsProps {
  selectedCity: string;
  timeRange: string;
}

interface MetricData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

const defaultMetrics: MetricData[] = [
  {
    title: 'Total Visitors',
    value: '1.2M',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'blue'
  },
  {
    title: 'Social Engagement',
    value: '458K',
    change: '+23.1%',
    trend: 'up',
    icon: Heart,
    color: 'pink'
  },
  {
    title: 'Total Posts',
    value: '89.5K',
    change: '+8.3%',
    trend: 'up',
    icon: MessageSquare,
    color: 'green'
  },
  {
    title: 'Shares',
    value: '34.2K',
    change: '-3.2%',
    trend: 'down',
    icon: Share2,
    color: 'purple'
  },
  {
    title: 'Page Views',
    value: '2.8M',
    change: '+18.7%',
    trend: 'up',
    icon: Eye,
    color: 'orange'
  }
];

const colorMap = {
  blue: 'bg-blue-500/20 text-gray-900',
  pink: 'bg-pink-500/20 text-pink-700',
  green: 'bg-green-500/20 text-green-700',
  purple: 'bg-purple-500/20 text-purple-700',
  orange: 'bg-orange-500/20 text-orange-700'
};

export function OverviewMetrics({ selectedCity, timeRange }: OverviewMetricsProps) {
  const [metrics, setMetrics] = useState<MetricData[]>(defaultMetrics);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Build API URL with filters
        const params = new URLSearchParams();
        if (selectedCity) {
          params.append('city', selectedCity);
        }
        if (timeRange) {
          params.append('period', timeRange);
        }

        const response = await axios.get(`http://localhost:8001/api/analytics/overview-metrics/?${params.toString()}`);
        
        // Transform API response to metrics format
        if (response.data) {
          setMetrics([
            {
              title: 'Total Visitors',
              value: formatNumber(response.data.total_visitors || 0),
              change: response.data.visitors_change || '+0%',
              trend: (response.data.visitors_change || '').startsWith('-') ? 'down' : 'up',
              icon: Users,
              color: 'blue'
            },
            {
              title: 'Social Engagement',
              value: formatNumber(response.data.social_engagement || 0),
              change: response.data.engagement_change || '+0%',
              trend: (response.data.engagement_change || '').startsWith('-') ? 'down' : 'up',
              icon: Heart,
              color: 'pink'
            },
            {
              title: 'Total Posts',
              value: formatNumber(response.data.total_posts || 0),
              change: response.data.posts_change || '+0%',
              trend: (response.data.posts_change || '').startsWith('-') ? 'down' : 'up',
              icon: MessageSquare,
              color: 'green'
            },
            {
              title: 'Shares',
              value: formatNumber(response.data.shares || 0),
              change: response.data.shares_change || '+0%',
              trend: (response.data.shares_change || '').startsWith('-') ? 'down' : 'up',
              icon: Share2,
              color: 'purple'
            },
            {
              title: 'Page Views',
              value: formatNumber(response.data.page_views || 0),
              change: response.data.views_change || '+0%',
              trend: (response.data.views_change || '').startsWith('-') ? 'down' : 'up',
              icon: Eye,
              color: 'orange'
            }
          ]);
        }
      } catch (error) {
        console.log('Using default metrics data');
        // Keep default metrics if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedCity, timeRange]); // Re-fetch when filters change

  // Helper function to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={metric.title} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorMap[metric.color as keyof typeof colorMap]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{metric.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-sm text-gray-900">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
