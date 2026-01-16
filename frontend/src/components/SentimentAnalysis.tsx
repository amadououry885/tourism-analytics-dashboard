import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Smile, Meh, Frown, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SentimentAnalysisProps {
  detailed?: boolean;
  selectedCity?: string;
  timeRange?: string;
}

export function SentimentAnalysis({ detailed = false, selectedCity, timeRange }: SentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [topKeywords, setTopKeywords] = useState<any[]>([]);
  const [categorysentiment, setCategorysentiment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (timeRange) params.append('range', timeRange === 'week' ? '7d' : '30d');
        
        // Fetch sentiment summary
        const summaryResponse = await api.get(`/analytics/sentiment/summary/?${params.toString()}`);
        
        if (summaryResponse.data) {
          setSentimentData([
            { name: 'Positive', value: summaryResponse.data.positive_pct || 0, count: summaryResponse.data.positive || 0, color: '#10b981' },
            { name: 'Neutral', value: summaryResponse.data.neutral_pct || 0, count: summaryResponse.data.neutral || 0, color: '#f59e0b' },
            { name: 'Negative', value: summaryResponse.data.negative_pct || 0, count: summaryResponse.data.negative || 0, color: '#ef4444' },
          ]);
        }

        // Fetch keywords if detailed view
        if (detailed) {
          const keywordsResponse = await api.get(`/analytics/sentiment/keywords/?${params.toString()}`);
          setTopKeywords(keywordsResponse.data || []);

          const categoryResponse = await api.get(`/analytics/sentiment/by-category/?${params.toString()}`);
          setCategorysentiment(categoryResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
        setError('Failed to load sentiment data');
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [selectedCity, timeRange, detailed]);

  if (loading) {
    return (
      <Card className="bg-white animate-pulse" style={{ borderRadius: '14px', border: '1px solid #E4E9F2' }}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">⚠️ {error}</p>
      </div>
    );
  }

  if (sentimentData.length === 0 || sentimentData.every(d => d.count === 0)) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-semibold">💬 No sentiment data available yet</p>
        <p className="text-sm text-yellow-600 mt-2">Data will be collected automatically every 2 hours.</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <Card className="bg-white shadow-sm" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <CardHeader>
          <CardTitle style={{ color: '#0F172A' }}>Sentiment Analysis</CardTitle>
          <CardDescription style={{ color: '#475569' }}>Overall visitor sentiment from social media</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {sentimentData.map((item) => {
              const Icon = item.name === 'Positive' ? Smile : item.name === 'Neutral' ? Meh : Frown;
              return (
                <div key={item.name} className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E4E9F2' }}>
                  <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: item.color }} />
                  <p className="text-xl font-bold mb-0.5" style={{ color: '#0F172A' }}>{item.value}%</p>
                  <p className="text-xs" style={{ color: '#475569' }}>{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{item.count.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
          
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {detailed && (
        <>
          <Card className="bg-white shadow-sm" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
            <CardHeader>
              <CardTitle style={{ color: '#0F172A' }}>Sentiment by Category</CardTitle>
              <CardDescription style={{ color: '#475569' }}>Breakdown across different tourism aspects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorysentiment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEFF6" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#6b7280" />
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
                  <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positive %" />
                  <Bar dataKey="neutral" stackId="a" fill="#f59e0b" name="Neutral %" />
                  <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ borderRadius: '14px', border: '1px solid #E4E9F2', boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.06)' }}>
            <CardHeader>
              <CardTitle style={{ color: '#0F172A' }}>Top Keywords & Phrases</CardTitle>
              <CardDescription style={{ color: '#475569' }}>Most mentioned terms in reviews and posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topKeywords.map((keyword) => (
                  <div key={keyword.word} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E4E9F2' }}>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4" style={{ color: '#0F172A' }} />
                      <span style={{ color: '#0F172A' }}>{keyword.word}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ color: '#0F172A' }}>{keyword.count.toLocaleString()} mentions</span>
                      <Badge className={
                        keyword.sentiment === 'positive' 
                          ? 'bg-green-500/20 text-green-700 border-green-500/30'
                          : 'bg-red-500/20 text-red-700 border-red-500/30'
                      }>
                        {keyword.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
