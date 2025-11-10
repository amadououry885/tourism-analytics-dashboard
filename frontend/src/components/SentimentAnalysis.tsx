import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Smile, Meh, Frown, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const sentimentData = [
  { name: 'Positive', value: 68, count: 312000, color: '#10b981' },
  { name: 'Neutral', value: 23, count: 105000, color: '#f59e0b' },
  { name: 'Negative', value: 9, count: 41000, color: '#ef4444' },
];

const topKeywords = [
  { word: 'Beautiful', count: 45200, sentiment: 'positive' },
  { word: 'Amazing', count: 38900, sentiment: 'positive' },
  { word: 'Relaxing', count: 32100, sentiment: 'positive' },
  { word: 'Stunning Views', count: 28500, sentiment: 'positive' },
  { word: 'Friendly Staff', count: 24800, sentiment: 'positive' },
  { word: 'Expensive', count: 8900, sentiment: 'negative' },
  { word: 'Crowded', count: 6700, sentiment: 'negative' },
  { word: 'Limited Options', count: 4200, sentiment: 'negative' },
];

const categorysentiment = [
  { category: 'Attractions', positive: 72, neutral: 20, negative: 8 },
  { category: 'Accommodation', positive: 68, neutral: 24, negative: 8 },
  { category: 'Food', positive: 75, neutral: 18, negative: 7 },
  { category: 'Transport', positive: 58, neutral: 28, negative: 14 },
  { category: 'Service', positive: 70, neutral: 22, negative: 8 },
];

export function SentimentAnalysis({ detailed = false }: { detailed?: boolean }) {
  return (
    <>
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Sentiment Analysis</CardTitle>
          <CardDescription className="text-blue-200/60">Overall visitor sentiment from social media</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {sentimentData.map((item) => {
              const Icon = item.name === 'Positive' ? Smile : item.name === 'Neutral' ? Meh : Frown;
              return (
                <div key={item.name} className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-800/20">
                  <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: item.color }} />
                  <p className="text-2xl text-white mb-1">{item.value}%</p>
                  <p className="text-sm text-blue-200/60">{item.name}</p>
                  <p className="text-xs text-blue-200/40 mt-1">{item.count.toLocaleString()} mentions</p>
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
                  backgroundColor: '#0a1628', 
                  border: '1px solid #1e3a8a',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {detailed && (
        <>
          <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Sentiment by Category</CardTitle>
              <CardDescription className="text-blue-200/60">Breakdown across different tourism aspects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorysentiment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#93c5fd" />
                  <YAxis stroke="#93c5fd" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a1628', 
                      border: '1px solid #1e3a8a',
                      borderRadius: '8px',
                      color: '#fff'
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

          <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Top Keywords & Phrases</CardTitle>
              <CardDescription className="text-blue-200/60">Most mentioned terms in reviews and posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topKeywords.map((keyword) => (
                  <div key={keyword.word} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-800/20">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span className="text-white">{keyword.word}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-200/60">{keyword.count.toLocaleString()} mentions</span>
                      <Badge className={
                        keyword.sentiment === 'positive' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
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
