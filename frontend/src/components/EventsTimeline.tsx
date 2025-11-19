import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users, TrendingUp, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface EventsTimelineProps {
  timeRange?: string;
  selectedCity: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location_name?: string;
  city?: string;
  tags: string[];
  is_published?: boolean;
}

const eventTypes = [
  { value: 'all', label: 'All Events' },
  { value: 'sport', label: 'Sports' },
  { value: 'food', label: 'Food' },
  { value: 'festival', label: 'Festival' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
];

// Default demo events for presentation
const defaultEvents: Event[] = [
  {
    id: 1,
    title: 'Langkawi International Maritime and Aerospace Exhibition',
    start_date: '2025-03-15',
    end_date: '2025-03-19',
    location_name: 'Mahsuri International Exhibition Centre',
    city: 'Langkawi',
    description: 'Biennial event showcasing maritime and aerospace technology',
    tags: ['business', 'exhibition'],
    is_published: true
  },
  {
    id: 2,
    title: 'Alor Setar Heritage Festival',
    start_date: '2025-04-05',
    end_date: '2025-04-07',
    location_name: 'Dataran Alor Setar',
    city: 'Alor Setar',
    description: 'Celebration of local culture and historical heritage',
    tags: ['cultural', 'festival'],
    is_published: true
  },
  {
    id: 3,
    title: 'Kedah Paddy Harvest Festival',
    start_date: '2025-05-10',
    end_date: '2025-05-12',
    location_name: 'Yan Rice Fields',
    city: 'Yan',
    description: 'Traditional celebration of rice harvest season',
    tags: ['cultural', 'festival'],
    is_published: true
  },
  {
    id: 4,
    title: 'Langkawi Food Festival 2024',
    start_date: '2024-01-15',
    end_date: '2024-01-20',
    location_name: 'Pantai Cenang',
    city: 'Langkawi',
    description: 'Week-long celebration of local and international cuisine',
    tags: ['food', 'festival'],
    is_published: true
  },
  {
    id: 5,
    title: 'Kedah Tourism Expo',
    start_date: '2024-11-20',
    end_date: '2024-11-25',
    location_name: 'Aman Central',
    city: 'Alor Setar',
    description: 'Showcase of tourism attractions across Kedah',
    tags: ['business', 'entertainment'],
    is_published: true
  }
];

export function EventsTimeline({ selectedCity, timeRange }: EventsTimelineProps) {
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [events, setEvents] = useState<Event[]>(defaultEvents); // Initialize with demo data
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Fetch events
        const response = await axios.get('/api/events/');
        const backendEvents = response.data.results || response.data || [];
        
        // Fetch attendance trend data
        const trendResponse = await axios.get('/api/analytics/events/attendance-trend/?range=365d');
        const trendData = trendResponse.data || [];
        
        // If backend has data, use it; otherwise keep demo data
        if (backendEvents.length > 0) {
          setEvents(backendEvents);
        }
        
        // Update attendance trend if we have data
        if (trendData.length > 0) {
          setAttendanceTrend(trendData);
        }
        // Keep default demo events if no backend data
      } catch (error) {
        console.error('Error fetching events:', error);
        // Keep demo events on error
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCity, timeRange]);

  // Filter events by type
  const filteredEvents = events.filter(event => {
    if (selectedEventType === 'all') return true;
    return event.tags.includes(selectedEventType);
  });

  // Separate upcoming and past events based on start_date
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(e => new Date(e.start_date) > now);
  const pastEvents = filteredEvents.filter(e => new Date(e.start_date) <= now);

  if (loading) {
    return <div className="text-gray-900">Loading events...</div>;
  }

  const filteredUpcomingEvents = upcomingEvents.filter(event => {
    const matchesCity = selectedCity === 'all' || event.city === selectedCity;
    const matchesType = selectedEventType === 'all' || event.tags.some(tag => tag.toLowerCase() === selectedEventType.toLowerCase());
    return matchesCity && matchesType;
  });

  const filteredPastEvents = pastEvents.filter(event => {
    const matchesCity = selectedCity === 'all' || event.city === selectedCity;
    const matchesType = selectedEventType === 'all' || event.tags.some(tag => tag.toLowerCase() === selectedEventType.toLowerCase());
    return matchesCity && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Event Type Filter */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-900" />
            <div className="flex-1">
              <label className="text-sm text-gray-900 mb-2 block">Filter by Event Type</label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedEventType(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedEventType === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-900 border border-blue-800/30 hover:border-blue-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-900">
            Showing {filteredUpcomingEvents.length} upcoming and {filteredPastEvents.length} past events
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Upcoming Events</CardTitle>
          <CardDescription className="text-gray-900">Major events scheduled for the coming months</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-blue-500/20 text-gray-900 border-blue-500/30">
                      {event.tags && event.tags[0] ? event.tags[0] : 'Event'}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                      Upcoming
                    </Badge>
                  </div>
                  <h4 className="text-gray-900 font-semibold mb-3">{event.title}</h4>
                  <div className="space-y-2 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location_name || 'Kedah'}, {event.city || 'Malaysia'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs">{event.description.substring(0, 80)}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-900">
              No upcoming events found for the selected filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Events Performance */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Past Events Performance</CardTitle>
          <CardDescription className="text-gray-900">Recent events and their impact metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {pastEvents.length > 0 ? (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <div key={event.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-gray-900 font-semibold mb-1">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.start_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <MapPin className="w-4 h-4" />
                        <span>{event.location_name}</span>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-700 border-purple-500/30">
                      Completed
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-900">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-900">
              No past events found for the selected filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Attendance Trend */}
      {attendanceTrend.length > 0 && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Event Attendance Trends</CardTitle>
            <CardDescription className="text-gray-900">Expected vs Actual attendance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="expected" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Expected"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Actual"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              {attendanceTrend.slice(-1).map((data) => (
                <>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-900">Expected</div>
                    <div className="text-xl font-bold text-blue-600">{data.expected.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-900">Actual</div>
                    <div className="text-xl font-bold text-green-600">{data.actual.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-900">Variance</div>
                    <div className={`text-xl font-bold ${data.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.variance > 0 ? '+' : ''}{data.variance.toLocaleString()}
                    </div>
                  </div>
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
