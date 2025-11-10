import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const engagementData = [
  { date: 'Jan', likes: 45000, comments: 12000, shares: 8000 },
  { date: 'Feb', likes: 52000, comments: 15000, shares: 9500 },
  { date: 'Mar', likes: 48000, comments: 13500, shares: 8700 },
  { date: 'Apr', likes: 61000, comments: 18000, shares: 11200 },
  { date: 'May', likes: 55000, comments: 16500, shares: 10100 },
  { date: 'Jun', likes: 67000, comments: 19800, shares: 12800 },
  { date: 'Jul', likes: 72000, comments: 21000, shares: 14500 },
];

const platformData = [
  { platform: 'Instagram', engagement: 145000 },
  { platform: 'Facebook', engagement: 98000 },
  { platform: 'TikTok', engagement: 87000 },
  { platform: 'Twitter', engagement: 56000 },
  { platform: 'YouTube', engagement: 72000 },
];

export function SocialMediaCharts({ detailed = false }: { detailed?: boolean }) {
  return (
    <>
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Social Media Engagement Trends</CardTitle>
          <CardDescription className="text-blue-200/60">Monthly breakdown of likes, comments, and shares</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
              <XAxis dataKey="date" stroke="#93c5fd" />
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
              <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
              <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="shares" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {detailed && (
        <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Platform Performance</CardTitle>
            <CardDescription className="text-blue-200/60">Total engagement by social media platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
                <XAxis dataKey="platform" stroke="#93c5fd" />
                <YAxis stroke="#93c5fd" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a1628', 
                    border: '1px solid #1e3a8a',
                    borderRadius: '8px',
                    color: '#fff'
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
