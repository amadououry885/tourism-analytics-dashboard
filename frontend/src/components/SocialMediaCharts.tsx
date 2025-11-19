import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface SocialMediaChartsProps {
  detailed?: boolean;
  selectedCity?: string;
  timeRange?: string;
}

export function SocialMediaCharts({ detailed = false, selectedCity = 'all', timeRange = 'month' }: SocialMediaChartsProps) {
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSocialMediaData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') {
          params.append('city', selectedCity);
        }
        if (timeRange) {
          params.append('period', timeRange);
        }

        // Fetch engagement trends
        const engagementResponse = await axios.get(`/api/analytics/social-engagement/?${params.toString()}`);
        setEngagementData(engagementResponse.data || []);

        // Fetch platform data if in detailed view
        if (detailed) {
          const platformResponse = await axios.get(`/api/analytics/social-platforms/?${params.toString()}`);
          setPlatformData(platformResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching social media data:', error);
        setError('Failed to load social media data');
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMediaData();
  }, [selectedCity, timeRange, detailed]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-50 border-gray-200 animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">⚠️ {error}</p>
        <p className="text-sm text-red-600 mt-2">Please check your connection or try again later.</p>
      </div>
    );
  }

  if (engagementData.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-semibold">📊 No social media data available yet</p>
        <p className="text-sm text-yellow-600 mt-2">Data will be collected automatically every 2 hours.</p>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Social Media Engagement Trends</CardTitle>
          <CardDescription className="text-gray-900">Monthly breakdown of likes, comments, and shares</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
              <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="shares" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {detailed && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Platform Performance</CardTitle>
            <CardDescription className="text-gray-900">Total engagement by social media platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="platform" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }} 
                />
                <Bar dataKey="engagement" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
}
