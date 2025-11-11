import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Smile, Meh, Frown, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const defaultSentimentData = [
  { name: 'Positive', value: 68, count: 312000, color: '#10b981' },
  { name: 'Neutral', value: 23, count: 105000, color: '#f59e0b' },
  { name: 'Negative', value: 9, count: 41000, color: '#ef4444' },
];

interface SentimentAnalysisProps {
  detailed?: boolean;
  selectedCity?: string;
  timeRange?: string;
}

export function SentimentAnalysis({ detailed = false, selectedCity, timeRange }: SentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState(defaultSentimentData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (timeRange) params.append('range', timeRange === 'week' ? '7d' : '30d');
        
        const response = await axios.get(`http://localhost:8001/api/sentiment/summary/?${params.toString()}`);
        
        if (response.data) {
          setSentimentData([
            { name: 'Positive', value: response.data.positive_pct || 0, count: response.data.positive || 0, color: '#10b981' },
            { name: 'Neutral', value: response.data.neutral_pct || 0, count: response.data.neutral || 0, color: '#f59e0b' },
            { name: 'Negative', value: response.data.negative_pct || 0, count: response.data.negative || 0, color: '#ef4444' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
        // Keep default data
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [selectedCity, timeRange]);

  // Mock data for detailed view (to be replaced with API later)
  const topKeywords = [
    { word: 'Beautiful', count: 45200, sentiment: 'positive' },
    { word: 'Amazing', count: 38900, sentiment: 'positive' },
    { word: 'Relaxing', count: 32100, sentiment: 'positive' },
  ];

  const categorysentiment = [
    { category: 'Attractions', positive: 72, neutral: 20, negative: 8 },
    { category: 'Accommodation', positive: 68, neutral: 24, negative: 8 },
  ];

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Sentiment Analysis</CardTitle>
          <CardDescription className="text-gray-900">Overall visitor sentiment from social media</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {sentimentData.map((item) => {
              const Icon = item.name === 'Positive' ? Smile : item.name === 'Neutral' ? Meh : Frown;
              return (
                <div key={item.name} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: item.color }} />
                  <p className="text-2xl text-white mb-1">{item.value}%</p>
                  <p className="text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-900 mt-1">{item.count.toLocaleString()} mentions</p>
                </div>
              );
            })}
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
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
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Sentiment by Category</CardTitle>
              <CardDescription className="text-gray-900">Breakdown across different tourism aspects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorysentiment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
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

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Top Keywords & Phrases</CardTitle>
              <CardDescription className="text-gray-900">Most mentioned terms in reviews and posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topKeywords.map((keyword) => (
                  <div key={keyword.word} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-gray-900" />
                      <span className="text-gray-900">{keyword.word}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900">{keyword.count.toLocaleString()} mentions</span>
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
    </>
  );
}
