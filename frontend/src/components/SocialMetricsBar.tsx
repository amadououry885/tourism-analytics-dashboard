import React from 'react';
import { MessageCircle, Heart, FileText, Share2, Eye } from 'lucide-react';

interface SocialMetric {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

export const SocialMetricsBar: React.FC = () => {
  const metrics: SocialMetric[] = [
    { icon: MessageCircle, label: 'Comments', value: 1, color: 'text-blue-600' },
    { icon: Heart, label: 'Likes', value: '0K', color: 'text-red-600' },
    { icon: FileText, label: 'Total Posts', value: 7, color: 'text-purple-600' },
    { icon: Share2, label: 'Shares', value: '0.1K', color: 'text-green-600' },
    { icon: Eye, label: 'Page Views', value: 2, color: 'text-orange-600' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
      <div className="flex items-center divide-x divide-gray-200">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="flex-1 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 ${metric.color}`} strokeWidth={2} />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">{metric.label}</span>
                  <span className="text-xl font-bold text-gray-900">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, FileText, Share2, Eye } from 'lucide-react';
import axios from 'axios';

export const SocialMetricsBar: React.FC = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/analytics/social-metrics/');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching social metrics:', error);
        // No demo fallback - show empty state
        setMetrics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No social metrics available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
      <div className="flex items-center divide-x divide-gray-200">
        {metrics.map((metric: any, index) => (
          <div key={index} className="flex-1 px-6 py-4">
            {/* Render metric data from API */}
          </div>
        ))}
      </div>
    </div>
  );
};
