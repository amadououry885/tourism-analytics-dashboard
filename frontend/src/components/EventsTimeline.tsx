import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users, TrendingUp, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface EventsTimelineProps {
  selectedCity: string;
}

const upcomingEvents = [
  {
    name: 'Langkawi International Maritime & Aerospace Exhibition',
    date: 'May 20-24, 2025',
    location: 'Langkawi',
    city: 'langkawi',
    expectedVisitors: 85000,
    posts: 12500,
    status: 'upcoming',
    category: 'Exhibition',
    type: 'business'
  },
  {
    name: 'Kedah Paddy Festival',
    date: 'Jun 15-18, 2025',
    location: 'Alor Setar',
    city: 'alor-setar',
    expectedVisitors: 45000,
    posts: 8900,
    status: 'upcoming',
    category: 'Cultural',
    type: 'festival'
  },
  {
    name: 'Langkawi Food Festival',
    date: 'Jul 5-10, 2025',
    location: 'Langkawi',
    city: 'langkawi',
    expectedVisitors: 32000,
    posts: 6500,
    status: 'upcoming',
    category: 'Food',
    type: 'food'
  },
  {
    name: 'Alor Setar Heritage Walk',
    date: 'Aug 12-13, 2025',
    location: 'Alor Setar',
    city: 'alor-setar',
    expectedVisitors: 15000,
    posts: 3200,
    status: 'upcoming',
    category: 'Heritage',
    type: 'cultural'
  },
  {
    name: 'Langkawi International Marathon',
    date: 'Sep 8, 2025',
    location: 'Langkawi',
    city: 'langkawi',
    expectedVisitors: 12000,
    posts: 4500,
    status: 'upcoming',
    category: 'Sports',
    type: 'sports'
  },
  {
    name: 'Kedah Traditional Music Concert',
    date: 'Oct 15-16, 2025',
    location: 'Sungai Petani',
    city: 'sungai-petani',
    expectedVisitors: 8000,
    posts: 2100,
    status: 'upcoming',
    category: 'Entertainment',
    type: 'entertainment'
  },
];

const pastEvents = [
  {
    name: 'Langkawi International Regatta',
    date: 'Jan 10-15, 2025',
    location: 'Langkawi',
    city: 'langkawi',
    actualVisitors: 52000,
    posts: 18500,
    engagement: 145000,
    sentiment: 92,
    type: 'sports'
  },
  {
    name: 'Chinese New Year Celebrations',
    date: 'Feb 1-3, 2025',
    location: 'Various',
    city: 'all',
    actualVisitors: 78000,
    posts: 24800,
    engagement: 198000,
    sentiment: 88,
    type: 'festival'
  },
  {
    name: 'Kedah Arts & Crafts Fair',
    date: 'Mar 20-25, 2025',
    location: 'Sungai Petani',
    city: 'sungai-petani',
    actualVisitors: 28000,
    posts: 9200,
    engagement: 65000,
    sentiment: 85,
    type: 'cultural'
  },
];

const eventAttendance = [
  { month: 'Jan', festivals: 52000, exhibitions: 35000, cultural: 28000, sports: 22000 },
  { month: 'Feb', festivals: 78000, exhibitions: 42000, cultural: 38000, sports: 18000 },
  { month: 'Mar', festivals: 65000, exhibitions: 38000, cultural: 28000, sports: 25000 },
  { month: 'Apr', festivals: 45000, exhibitions: 52000, cultural: 32000, sports: 30000 },
  { month: 'May', festivals: 58000, exhibitions: 85000, cultural: 45000, sports: 28000 },
  { month: 'Jun', festivals: 72000, exhibitions: 48000, cultural: 52000, sports: 35000 },
];

const eventTypes = [
  { value: 'all', label: 'All Events' },
  { value: 'sports', label: 'Sports' },
  { value: 'food', label: 'Food' },
  { value: 'festival', label: 'Festival' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
];

export function EventsTimeline({ selectedCity }: EventsTimelineProps) {
  const [selectedEventType, setSelectedEventType] = useState('all');

  const filteredUpcomingEvents = upcomingEvents.filter(event => {
    const matchesCity = selectedCity === 'all' || event.city === selectedCity;
    const matchesType = selectedEventType === 'all' || event.type === selectedEventType;
    return matchesCity && matchesType;
  });

  const filteredPastEvents = pastEvents.filter(event => {
    const matchesCity = selectedCity === 'all' || event.city === selectedCity || event.city === 'all';
    const matchesType = selectedEventType === 'all' || event.type === selectedEventType;
    return matchesCity && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Event Type Filter */}
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <label className="text-sm text-blue-200/60 mb-2 block">Filter by Event Type</label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedEventType(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedEventType === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-900/20 text-blue-200/60 border border-blue-800/30 hover:border-blue-600/50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-200/60">
            Showing {filteredUpcomingEvents.length} upcoming and {filteredPastEvents.length} past events
          </div>
        </CardContent>
      </Card>

      {/* Event Attendance Trend */}
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Event Attendance Trends</CardTitle>
          <CardDescription className="text-blue-200/60">6-month visitor breakdown by event type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
              <XAxis dataKey="month" stroke="#93c5fd" />
              <YAxis stroke="#93c5fd" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a1628', 
                  border: '1px solid #1e3a8a',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Line type="monotone" dataKey="festivals" stroke="#ec4899" strokeWidth={2} name="Festivals" />
              <Line type="monotone" dataKey="exhibitions" stroke="#3b82f6" strokeWidth={2} name="Exhibitions" />
              <Line type="monotone" dataKey="cultural" stroke="#10b981" strokeWidth={2} name="Cultural Events" />
              <Line type="monotone" dataKey="sports" stroke="#f59e0b" strokeWidth={2} name="Sports" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Upcoming Events</CardTitle>
          <CardDescription className="text-blue-200/60">Major events scheduled for the coming months</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUpcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUpcomingEvents.map((event) => (
                <div key={event.name} className="p-5 bg-blue-900/20 rounded-lg border border-blue-800/20">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {event.category}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Upcoming
                    </Badge>
                  </div>
                  <h4 className="text-white mb-3">{event.name}</h4>
                  <div className="space-y-2 text-sm text-blue-200/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.expectedVisitors.toLocaleString()} expected visitors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>{event.posts.toLocaleString()} social posts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-200/60">
              No upcoming events found for the selected filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Events Performance */}
      <Card className="bg-blue-950/30 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Past Events Performance</CardTitle>
          <CardDescription className="text-blue-200/60">Recent events and their impact metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPastEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredPastEvents.map((event) => (
                <div key={event.name} className="p-5 bg-blue-900/20 rounded-lg border border-blue-800/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white mb-1">{event.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-blue-200/60">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                        <span>•</span>
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Completed
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-blue-200/60 mb-1">Visitors</p>
                      <p className="text-xl text-white">{event.actualVisitors.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200/60 mb-1">Posts</p>
                      <p className="text-xl text-white">{event.posts.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200/60 mb-1">Engagement</p>
                      <p className="text-xl text-white">{event.engagement.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200/60 mb-1">Sentiment</p>
                      <p className="text-xl text-green-400">{event.sentiment}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-200/60">
              No past events found for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
