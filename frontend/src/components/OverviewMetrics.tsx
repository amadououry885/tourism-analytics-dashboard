import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Users, MessageSquare, Heart, Share2, Eye } from 'lucide-react';

interface OverviewMetricsProps {
  selectedCity: string;
}

const metrics = [
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
  blue: 'bg-blue-500/20 text-blue-400',
  pink: 'bg-pink-500/20 text-pink-400',
  green: 'bg-green-500/20 text-green-400',
  purple: 'bg-purple-500/20 text-purple-400',
  orange: 'bg-orange-500/20 text-orange-400'
};

export function OverviewMetrics({ selectedCity }: OverviewMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={metric.title} className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorMap[metric.color as keyof typeof colorMap]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{metric.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl text-white mb-1">{metric.value}</p>
                <p className="text-sm text-blue-200/60">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
