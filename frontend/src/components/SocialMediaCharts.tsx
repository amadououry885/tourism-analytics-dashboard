import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface SocialMediaChartsProps {
  detailed?: boolean;
  selectedCity?: string;
  timeRange?: string;
}

const defaultEngagementData = [
  { date: 'Jan', likes: 45000, comments: 12000, shares: 8000 },
  { date: 'Feb', likes: 52000, comments: 15000, shares: 9500 },
  { date: 'Mar', likes: 48000, comments: 13500, shares: 8700 },
  { date: 'Apr', likes: 61000, comments: 18000, shares: 11200 },
  { date: 'May', likes: 55000, comments: 16500, shares: 10100 },
  { date: 'Jun', likes: 67000, comments: 19800, shares: 12800 },
  { date: 'Jul', likes: 72000, comments: 21000, shares: 14500 },
];

const defaultPlatformData = [
  { platform: 'Instagram', engagement: 145000 },
  { platform: 'Facebook', engagement: 98000 },
  { platform: 'TikTok', engagement: 87000 },
  { platform: 'Twitter', engagement: 56000 },
  { platform: 'YouTube', engagement: 72000 },
];

export function SocialMediaCharts({ detailed = false, selectedCity = 'all', timeRange = 'month' }: SocialMediaChartsProps) {
  const [engagementData, setEngagementData] = useState(defaultEngagementData);
  const [platformData, setPlatformData] = useState(defaultPlatformData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSocialMediaData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCity) {
          params.append('city', selectedCity);
        }
        if (timeRange) {
          params.append('period', timeRange);
        }

        // Fetch engagement trends
        const engagementResponse = await axios.get(`http://localhost:8001/api/analytics/social-engagement/?${params.toString()}`);
        if (engagementResponse.data && engagementResponse.data.length > 0) {
          setEngagementData(engagementResponse.data);
        }

        // Fetch platform data if in detailed view
        if (detailed) {
          const platformResponse = await axios.get(`http://localhost:8001/api/analytics/platform-performance/?${params.toString()}`);
          if (platformResponse.data && platformResponse.data.length > 0) {
            setPlatformData(platformResponse.data);
          }
        }
      } catch (error) {
        console.log('Using default social media data');
        // Keep default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMediaData();
  }, [selectedCity, timeRange, detailed]); // Re-fetch when filters change
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
