import { useState, useEffect, useMemo } from 'react';
import api from '../services/api'; // Use configured API instance instead of raw axios
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users, TrendingUp, Filter, Search, Clock, Navigation, Share2, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MasterDetailLayout } from './MasterDetailLayout';
import { ListItem } from './ListItem';
import { DetailPanel } from './DetailPanel';

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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [shouldScrollToImage, setShouldScrollToImage] = useState(false); // ✨ NEW: Track if JOIN US was clicked
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '', phone: '' });

  // Calculate now once to avoid recreation
  const now = useMemo(() => new Date(), []);

  // Calculate days left for upcoming events
  const calculateDaysLeft = (startDate: string) => {
    const eventDate = new Date(startDate);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleGetDirections = () => {
    if (selectedEvent && selectedEvent.location_name) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location_name + ' ' + (selectedEvent.city || ''))}`, '_blank');
    }
  };

  const handleShare = () => {
    if (selectedEvent && navigator.share) {
      navigator.share({
        title: selectedEvent.title,
        text: `Join ${selectedEvent.title} on ${new Date(selectedEvent.start_date).toLocaleDateString()}`,
        url: window.location.href
      }).catch(() => {});
    }
  };

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
        
        // If backend has data, use it; otherwise keep demo data
        if (backendEvents.length > 0) {
          console.log('[EventsTimeline] Setting events from backend');
          setEvents(backendEvents);
        } else {
          console.warn('[EventsTimeline] No backend events, keeping demo data');
        }
        
        // Fetch attendance trend data (non-blocking - don't fail if this endpoint doesn't exist)
        try {
          const trendResponse = await api.get('/analytics/events/attendance-trend/?range=365d');
          const trendData = trendResponse.data || [];
          if (trendData.length > 0) {
            setAttendanceTrend(trendData);
          }
        } catch (trendError) {
          console.warn('[EventsTimeline] Attendance trend endpoint not available, skipping');
        }
        
        // ✨ NEW: Fetch happening now events (non-blocking)
        try {
          await fetchHappeningNow();
        } catch (happeningError) {
          console.warn('[EventsTimeline] Happening now endpoint not available, skipping');
        }
        
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

  // Advanced filtering and sorting logic - MUST be before early return
  const filteredEvents = useMemo(() => {
    return events
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
  }, [events, searchTerm, selectedCity, selectedEventType, dateFilter, sortBy, now]);

  // Auto-select first event from filtered list
  useEffect(() => {
    if (filteredEvents.length > 0) {
      // Only set if no selection or current selection not in filtered list
      if (!selectedEvent || !filteredEvents.find(e => e.id === selectedEvent.id)) {
        setSelectedEvent(filteredEvents[0]);
      }
    } else if (selectedEvent !== null) {
      setSelectedEvent(null);
    }
  }, [filteredEvents, selectedEvent]);

  if (loading) {
    return <div className="text-gray-900">Loading events...</div>;
  }

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
    <div className="space-y-4 md:space-y-6">
      {/* ✨ NEW: Happening Now Section */}
      {happeningNowEvents.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200 p-3 sm:p-4 md:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg sm:text-xl font-bold text-red-700">Happening Now</h3>
            </div>
            <span className="text-xs sm:text-sm text-red-600 font-medium">
              {happeningNowEvents.length} {happeningNowEvents.length === 1 ? 'event' : 'events'} live
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {happeningNowEvents.map(event => (
              <Card key={event.id} className="bg-white border-red-300 shadow-md hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleViewDetails(event)}>
                <CardContent className="p-3 sm:p-4 md:pt-6">
                  <div className="space-y-2 sm:space-y-3">
                    {/* Title with LIVE badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">{event.title}</h4>
                      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded whitespace-nowrap">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                        LIVE
                      </span>
                    </div>
                    
                    {/* Multi-day progress */}
                    {event.days_into_event && event.total_days && event.total_days > 1 && (
                      <div className="bg-red-100 text-red-700 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded">
                        📅 Day {event.days_into_event} of {event.total_days}
                        {event.days_remaining !== null && event.days_remaining !== undefined && (
                          <span className="ml-1 sm:ml-2 text-red-600">({event.days_remaining} {event.days_remaining === 1 ? 'day' : 'days'} left)</span>
                        )}
                      </div>
                    )}
                    
                    {/* Recurring badge */}
                    {event.recurrence_type && (
                      <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded">
                        🔄 Repeats {event.recurrence_type}
                      </div>
                    )}
                    
                    {/* Location */}
                    {event.location_name && (
                      <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                        📍 {event.location_name}
                      </div>
                    )}
                    
                    {/* Capacity */}
                    {event.max_capacity && (
                      <div className="text-xs sm:text-sm text-gray-600">
                        👥 {event.attendee_count || 0} / {event.max_capacity} registered
                        {event.is_full && <span className="ml-1 sm:ml-2 text-red-600 font-semibold">FULL</span>}
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="p-2 sm:p-4 md:pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0">
              <div className="text-center sm:text-left">
                <div className="text-[10px] sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Total</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{events.length}</div>
              </div>
              <Calendar className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-400 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="p-2 sm:p-4 md:pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0">
              <div className="text-center sm:text-left">
                <div className="text-[10px] sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Upcoming</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{upcomingCount}</div>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-400 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="p-2 sm:p-4 md:pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0">
              <div className="text-center sm:text-left">
                <div className="text-[10px] sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Past</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{pastCount}</div>
              </div>
              <Users className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-400 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
        <CardContent className="p-3 sm:p-4 md:pt-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Filter Buttons Row */}
            <div className="space-y-2 sm:space-y-3">
              {/* Event Category Filter */}
              <div className="flex items-start gap-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 block mb-1.5 sm:mb-2">Category:</span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { value: 'all', label: 'All', icon: '🎯' },
                      { value: 'sports', label: 'Sports', icon: '⚽' },
                      { value: 'food', label: 'Food', icon: '🍽️' },
                      { value: 'festival', label: 'Festival', icon: '🎉' },
                      { value: 'cultural', label: 'Cultural', icon: '🎭' },
                      { value: 'business', label: 'Business', icon: '💼' },
                      { value: 'entertainment', label: 'Fun', icon: '🎪' },
                      { value: 'exhibition', label: 'Exhibit', icon: '🎨' }
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedEventType(value)}
                        className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
                          selectedEventType === value
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        <span>{icon}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Filter & Sort Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4">
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Show:</span>
                <div className="flex gap-1 sm:gap-2">
                  {(['all', 'upcoming', 'past'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-medium transition-all ${
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
              <div className="flex items-center gap-2 sm:ml-auto">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'attendance')}
                  className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">📅 Date</option>
                  <option value="name">🔤 Name</option>
                  <option value="attendance">👥 Attendance</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-200">
              Showing <span className="font-bold text-gray-900">{filteredEvents.length}</span> of{' '}
              <span className="font-bold text-gray-900">{events.length}</span> events
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master-Detail Layout for All Events */}
      <MasterDetailLayout
        leftPanel={
          <div className="bg-white">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No events found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              filteredEvents.map((event, index) => {
                const eventDate = new Date(event.start_date);
                const isPast = eventDate < now;
                const isHappeningNow = event.is_happening_now || eventDate.toDateString() === now.toDateString();
                
                return (
                  <ListItem
                    key={event.id || index}
                    title={event.title}
                    subtitle={`${event.location_name || event.city || 'Kedah'} • ${eventDate.toLocaleDateString()}`}
                    metrics={[
                      { 
                        label: 'Expected', 
                        value: event.expected_attendance || 0,
                        icon: <Users className="w-3 h-3" />
                      },
                      { 
                        label: 'Actual', 
                        value: event.actual_attendance || 0,
                        icon: <TrendingUp className="w-3 h-3" />
                      }
                    ]}
                    badge={
                      isHappeningNow ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300 animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          Live Now
                        </Badge>
                      ) : isPast ? (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                          Upcoming
                        </Badge>
                      )
                    }
                    isSelected={selectedEvent?.id === event.id}
                    onClick={() => handleSelectEvent(event)}
                  />
                );
              })
            )}
          </div>
        }
        rightPanel={
          selectedEvent ? (
            <DetailPanel
              title={selectedEvent.title}
              subtitle={`${selectedEvent.location_name || selectedEvent.city || 'Kedah'} • ${new Date(selectedEvent.start_date).toLocaleDateString()}`}
              image={selectedEvent.image_url}
              actions={
                <div className="flex gap-3">
                  {/* JOIN US Button - Only for upcoming events */}
                  {new Date(selectedEvent.start_date) > now && (
                    <button
                      onClick={() => setIsRegistrationModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-semibold"
                      disabled={selectedEvent.is_full}
                    >
                      <Users className="w-5 h-5" />
                      {selectedEvent.is_full ? 'Event Full' : 'JOIN US'}
                    </button>
                  )}
                  <button
                    onClick={handleGetDirections}
                    className={`${new Date(selectedEvent.start_date) > now ? 'flex-1' : 'flex-[2]'} flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium`}
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              }
            >
              {/* Event Image */}
              {selectedEvent.image_url && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-md">
                  <img 
                    src={selectedEvent.image_url} 
                    alt={selectedEvent.title}
                    className="w-full h-64 object-cover"
                  />
                  {selectedEvent.is_happening_now && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      LIVE NOW
                    </div>
                  )}
                </div>
              )}

              {/* Days Left Counter - Only for upcoming events */}
              {new Date(selectedEvent.start_date) > now && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 text-white rounded-full p-3">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Event Starts In</div>
                        <div className="text-3xl font-bold text-orange-600">
                          {calculateDaysLeft(selectedEvent.start_date)} 
                          <span className="text-lg ml-1">days</span>
                        </div>
                      </div>
                    </div>
                    {calculateDaysLeft(selectedEvent.start_date) <= 7 && (
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                        Hurry!
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Progress - Only for upcoming events */}
              {new Date(selectedEvent.start_date) > now && selectedEvent.max_capacity && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Registration Progress</span>
                    <span className="text-sm font-bold text-blue-600">
                      {selectedEvent.attendee_count || 0} / {selectedEvent.max_capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        ((selectedEvent.attendee_count || 0) / selectedEvent.max_capacity) * 100 > 80 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                          : 'bg-gradient-to-r from-blue-500 to-green-500'
                      }`}
                      style={{ width: `${Math.min(((selectedEvent.attendee_count || 0) / selectedEvent.max_capacity) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">
                      {selectedEvent.spots_remaining || 0} spots remaining
                    </span>
                    {selectedEvent.is_full && (
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                        SOLD OUT
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Location with Map Link */}
              {selectedEvent.location_name && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full p-2 mt-1">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                      <p className="text-gray-700">{selectedEvent.location_name}</p>
                      <p className="text-sm text-gray-500">{selectedEvent.city || 'Kedah'}</p>
                      {(selectedEvent.lat && selectedEvent.lon) && (
                        <a
                          href={`https://www.google.com/maps?q=${selectedEvent.lat},${selectedEvent.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-2 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-900">{selectedEvent.expected_attendance || 0}</div>
                  <div className="text-xs text-blue-600 font-medium">Expected</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-900">{selectedEvent.actual_attendance || 0}</div>
                  <div className="text-xs text-green-600 font-medium">Actual</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-900">{selectedEvent.max_capacity || 'N/A'}</div>
                  <div className="text-xs text-purple-600 font-medium">Capacity</div>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

              {/* Event Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(selectedEvent.start_date).toLocaleDateString()}
                      {selectedEvent.end_date && ` - ${new Date(selectedEvent.end_date).toLocaleDateString()}`}
                    </span>
                  </div>
                  {selectedEvent.location_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEvent.location_name}, {selectedEvent.city || 'Kedah'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map((tag, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700 border-blue-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity Info */}
              {(selectedEvent.max_capacity || selectedEvent.spots_remaining !== undefined) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Capacity Information</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedEvent.max_capacity && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Max Capacity:</span>
                        <span className="font-semibold text-gray-900">{selectedEvent.max_capacity}</span>
                      </div>
                    )}
                    {selectedEvent.attendee_count !== undefined && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Current Attendance:</span>
                        <span className="font-semibold text-gray-900">{selectedEvent.attendee_count}</span>
                      </div>
                    )}
                    {selectedEvent.spots_remaining !== null && selectedEvent.spots_remaining !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spots Remaining:</span>
                        <span className={`font-semibold ${selectedEvent.is_full ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedEvent.is_full ? 'Full' : selectedEvent.spots_remaining}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DetailPanel>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select an event</h3>
                <p className="text-gray-500">Choose an event from the list to view details</p>
              </div>
            </div>
          )
        }
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

      {/* Registration Modal */}
      {isRegistrationModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Join Event</h2>
                  <p className="text-green-100 text-sm line-clamp-1">{selectedEvent.title}</p>
                </div>
                <button
                  onClick={() => setIsRegistrationModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Event Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{new Date(selectedEvent.start_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span>{selectedEvent.location_name || selectedEvent.city || 'Kedah'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>
                    {selectedEvent.attendee_count || 0} / {selectedEvent.max_capacity || 'Unlimited'} registered
                  </span>
                </div>
                {calculateDaysLeft(selectedEvent.start_date) > 0 && (
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <Clock className="w-5 h-5" />
                    <span>{calculateDaysLeft(selectedEvent.start_date)} days until event</span>
                  </div>
                )}
              </div>

              {/* Registration Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                // Handle registration submission
                alert(`Registration submitted for ${registrationForm.name}!\n\nYou'll receive a confirmation email at ${registrationForm.email}`);
                setIsRegistrationModalOpen(false);
                setRegistrationForm({ name: '', email: '', phone: '' });
              }} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="+60 12-345 6789"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="text-blue-600 mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 text-sm text-blue-900">
                      <p className="font-semibold mb-1">Confirmation Details</p>
                      <p className="text-blue-700">You'll receive a confirmation email with event details and QR code for check-in.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsRegistrationModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedEvent.is_full}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedEvent.is_full ? 'Event Full' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
