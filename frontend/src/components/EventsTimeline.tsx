import { useState, useEffect } from 'react';
import api from '../services/api'; // Use configured API instance instead of raw axios
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users, TrendingUp, Filter, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { EventCard } from './EventCard';
import { PastEventCard } from './PastEventCard';
import { EventModal } from './EventModal';

interface EventsTimelineProps {
  timeRange?: string;
  selectedCity: string;
}

// ✨ UPDATED: Extended Event interface to match EventCard/PastEventCard
interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location_name?: string;
  city?: string;
  tags: string[];
  is_published?: boolean;
  expected_attendance?: number;
  actual_attendance?: number;
  lat?: number;
  lon?: number;
  image_url?: string;
  // ✨ CAPACITY FIELDS:
  max_capacity?: number | null;
  attendee_count?: number;
  spots_remaining?: number | null;
  is_full?: boolean;
  user_registered?: boolean;
  user_has_reminder?: boolean;
  // ✨ RECURRING FIELDS:
  recurrence_type?: string;
  is_recurring_instance?: boolean;
  // ✨ LIVE STATUS FIELDS:
  is_happening_now?: boolean;
  days_into_event?: number | null;
  total_days?: number;
  days_remaining?: number | null;
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
  const [events, setEvents] = useState<Event[]>(defaultEvents);
  const [happeningNowEvents, setHappeningNowEvents] = useState<Event[]>([]); // ✨ NEW: Live events state
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state for advanced filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'attendance'>('date');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedModal, setSelectedModal] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldScrollToImage, setShouldScrollToImage] = useState(false); // ✨ NEW: Track if JOIN US was clicked

  // ✨ NEW: Fetch happening now events
  const fetchHappeningNow = async () => {
    try {
      const response = await api.get('/events/happening_now/');
      const liveEvents = response.data.results || response.data || [];
      setHappeningNowEvents(liveEvents);
    } catch (error) {
      console.error('Error fetching happening now events:', error);
      setHappeningNowEvents([]);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        console.log('[EventsTimeline] Fetching events from:', api.defaults.baseURL + '/events/');
        
        // Fetch events
        const response = await api.get('/events/');
        const backendEvents = response.data.results || response.data || [];
        
        console.log('[EventsTimeline] Received events:', backendEvents.length, 'events');
        console.log('[EventsTimeline] First event:', backendEvents[0]);
        
        // Fetch attendance trend data
        const trendResponse = await api.get('/analytics/events/attendance-trend/?range=365d');
        const trendData = trendResponse.data || [];
        
        // If backend has data, use it; otherwise keep demo data
        if (backendEvents.length > 0) {
          console.log('[EventsTimeline] Setting events from backend');
          setEvents(backendEvents);
        } else {
          console.warn('[EventsTimeline] No backend events, keeping demo data');
        }
        
        // Update attendance trend if we have data
        if (trendData.length > 0) {
          setAttendanceTrend(trendData);
        }
        
        // ✨ NEW: Fetch happening now events
        await fetchHappeningNow();
        
        // Keep default demo events if no backend data
      } catch (error) {
        console.error('[EventsTimeline] Error fetching events:', error);
        if (error instanceof Error) {
          console.error('[EventsTimeline] Error details:', {
            message: error.message,
            status: (error as any).response?.status,
            data: (error as any).response?.data,
            url: (error as any).config?.url
          });
        }
        // Keep demo events on error
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCity, timeRange]);

  // ✨ NEW: Auto-refresh happening now events every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHappeningNow();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-900">Loading events...</div>;
  }

  // Advanced filtering and sorting logic
  const now = new Date();
  
  const filteredEvents = events
    .filter(event => {
      // Search filter
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(event.location_name || '').toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // City filter
      if (selectedCity !== 'all' && event.city !== selectedCity) {
        return false;
      }
      
      // Event type filter
      if (selectedEventType !== 'all' && !event.tags.some(tag => tag.toLowerCase() === selectedEventType.toLowerCase())) {
        return false;
      }
      
      // Date filter
      const eventDate = new Date(event.start_date);
      if (dateFilter === 'upcoming' && eventDate <= now) {
        return false;
      }
      if (dateFilter === 'past' && eventDate > now) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'attendance':
          const aAttendance = a.actual_attendance || a.expected_attendance || 0;
          const bAttendance = b.actual_attendance || b.expected_attendance || 0;
          return bAttendance - aAttendance;
        case 'date':
        default:
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      }
    });

  // Get unique event types for filter
  const uniqueEventTypes = Array.from(
    new Set(
      events
        .flatMap(e => e.tags)
        .filter(Boolean)
        .map(tag => tag.toLowerCase())
    )
  ).sort();
  const eventTypes = ['all', ...uniqueEventTypes];

  // ✨ UPDATED: Handle view details with optional scroll-to-image
  const handleViewDetails = (event: Event, scrollToImage: boolean = false) => {
    setSelectedModal(event);
    setShouldScrollToImage(scrollToImage);
    setIsModalOpen(true);
  };

  const upcomingCount = events.filter(e => new Date(e.start_date) > now).length;
  const pastCount = events.filter(e => new Date(e.start_date) <= now).length;

  return (
    <div className="space-y-6">
      {/* ✨ NEW: Happening Now Section */}
      {happeningNowEvents.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="text-xl font-bold text-red-700">Happening Now</h3>
            </div>
            <span className="text-sm text-red-600 font-medium">
              {happeningNowEvents.length} {happeningNowEvents.length === 1 ? 'event' : 'events'} live
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {happeningNowEvents.map(event => (
              <Card key={event.id} className="bg-white border-red-300 shadow-md hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleViewDetails(event)}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Title with LIVE badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded whitespace-nowrap">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        LIVE
                      </span>
                    </div>
                    
                    {/* Multi-day progress */}
                    {event.days_into_event && event.total_days && event.total_days > 1 && (
                      <div className="bg-red-100 text-red-700 text-sm font-medium px-3 py-2 rounded">
                        📅 Day {event.days_into_event} of {event.total_days}
                        {event.days_remaining !== null && event.days_remaining !== undefined && (
                          <span className="ml-2 text-red-600">({event.days_remaining} {event.days_remaining === 1 ? 'day' : 'days'} left)</span>
                        )}
                      </div>
                    )}
                    
                    {/* Recurring badge */}
                    {event.recurrence_type && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        🔄 Repeats {event.recurrence_type}
                      </div>
                    )}
                    
                    {/* Location */}
                    {event.location_name && (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        📍 {event.location_name}
                      </div>
                    )}
                    
                    {/* Capacity */}
                    {event.max_capacity && (
                      <div className="text-sm text-gray-600">
                        👥 {event.attendee_count || 0} / {event.max_capacity} registered
                        {event.is_full && <span className="ml-2 text-red-600 font-semibold">FULL</span>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Events</div>
                <div className="text-3xl font-bold text-blue-600">{events.length}</div>
              </div>
              <Calendar className="w-12 h-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Upcoming</div>
                <div className="text-3xl font-bold text-green-600">{upcomingCount}</div>
              </div>
              <TrendingUp className="w-12 h-12 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Past Events</div>
                <div className="text-3xl font-bold text-purple-600">{pastCount}</div>
              </div>
              <Users className="w-12 h-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Buttons Row */}
            <div className="space-y-3">
              {/* Event Category Filter */}
              <div className="flex items-start gap-2">
                <Filter className="w-5 h-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 block mb-2">Category:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'All Events', icon: '🎯' },
                      { value: 'sports', label: 'Sports', icon: '⚽' },
                      { value: 'food', label: 'Food', icon: '🍽️' },
                      { value: 'festival', label: 'Festival', icon: '🎉' },
                      { value: 'cultural', label: 'Cultural', icon: '🎭' },
                      { value: 'business', label: 'Business', icon: '💼' },
                      { value: 'entertainment', label: 'Entertainment', icon: '🎪' },
                      { value: 'exhibition', label: 'Exhibition', icon: '🎨' }
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedEventType(value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedEventType === value
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Filter & Sort Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Show:</span>
                <div className="flex gap-2">
                  {(['all', 'upcoming', 'past'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        dateFilter === filter
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'attendance')}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">📅 Date</option>
                  <option value="name">🔤 Name</option>
                  <option value="attendance">👥 Attendance</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
              Showing <span className="font-bold text-gray-900">{filteredEvents.length}</span> of{' '}
              <span className="font-bold text-gray-900">{events.length}</span> events
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✨ UPCOMING EVENTS - With JOIN US Buttons */}
      {filteredEvents.filter(event => new Date(event.start_date) >= now).length > 0 && (
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-2xl">Upcoming Events</CardTitle>
                <CardDescription className="text-gray-700">
                  {filteredEvents.filter(event => new Date(event.start_date) >= now).length} events you can join
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-green-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents
                  .filter(event => new Date(event.start_date) >= now)
                  .map((event, index) => {
                    const eventDate = new Date(event.start_date);
                    const isHappeningNow = eventDate.toDateString() === now.toDateString();
                    const isNew = event.id ? event.id > events.length - 2 : false;
                    
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        rank={index + 1}
                        isHappeningNow={isHappeningNow}
                        isNew={isNew}
                        isFree={true}
                        onViewDetails={handleViewDetails}
                      />
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✨ PAST EVENTS - Event Reports, No JOIN US */}
      {filteredEvents.filter(event => new Date(event.start_date) < now).length > 0 && (
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-slate-700 rounded-full flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-2xl">Past Events</CardTitle>
                <CardDescription className="text-gray-700">
                  {filteredEvents.filter(event => new Date(event.start_date) < now).length} completed events with attendance reports
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents
                  .filter(event => new Date(event.start_date) < now)
                  .map((event, index) => {
                    return (
                      <PastEventCard
                        key={event.id}
                        event={event}
                        rank={index + 1}
                        onViewDetails={handleViewDetails}
                      />
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Events Message */}
      {filteredEvents.length === 0 && (
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="py-16">
              <div className="text-center text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No events found</h3>
                <p>Try adjusting your filters or search term</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Modal - ✨ Added scrollToRegistration prop */}
      <EventModal
        event={selectedModal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setShouldScrollToImage(false); // Reset scroll flag
        }}
        scrollToRegistration={shouldScrollToImage}
        onRegistrationModalOpen={() => setShouldScrollToImage(false)}
      />
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
