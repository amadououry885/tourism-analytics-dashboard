import { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import api from '../../services/api';
import { EventCard, Event } from './EventCard';
import { FilterDropdown, SortDropdown, ToggleFilter } from '../../components/FilterDropdown';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';

const EVENT_TYPES = [
  { value: 'All', label: 'All Events', icon: '🎉' },
  { value: 'festival', label: 'Festival', icon: '🎊' },
  { value: 'cultural', label: 'Cultural', icon: '🎭' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'sport', label: 'Sports', icon: '⚽' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎵' },
];

export default function EventsExplore() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'attendance' | 'name'>('date');

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/events/?page_size=100');
        const data = response.data.results || response.data || [];
        
        if (data.length > 0) {
          const transformedEvents: Event[] = data.map((event: any) => ({
            id: event.id,
            title: event.title,
            start_date: event.start_date,
            end_date: event.end_date,
            location_name: event.location_name,
            city: event.city,
            image_url: event.image_url,
            tags: event.tags || [],
            expected_attendance: event.expected_attendance,
            attendee_count: event.attendee_count || 0,
            max_capacity: event.max_capacity,
            spots_remaining: event.spots_remaining,
            is_full: event.is_full,
            is_happening_now: event.is_happening_now,
            description: event.description,
          }));
          
          setEvents(transformedEvents);
        } else {
          throw new Error('No data');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        // Demo data with future dates
        setEvents([
          { id: 1, title: 'Langkawi International Maritime & Aerospace Exhibition', start_date: '2026-03-15T09:00:00', location_name: 'Mahsuri International Exhibition Centre', city: 'Langkawi', tags: ['business', 'exhibition'], expected_attendance: 15000, attendee_count: 4500, max_capacity: 20000, spots_remaining: 15500, image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
          { id: 2, title: 'Alor Setar Heritage Festival', start_date: '2026-04-05T10:00:00', location_name: 'Dataran Alor Setar', city: 'Alor Setar', tags: ['cultural', 'festival'], expected_attendance: 8000, attendee_count: 7800, max_capacity: 10000, spots_remaining: 2200, image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800' },
          { id: 3, title: 'Kedah Paddy Harvest Festival', start_date: '2026-05-10T08:00:00', location_name: 'Yan Rice Fields', city: 'Yan', tags: ['cultural', 'festival'], expected_attendance: 5000, attendee_count: 3200, max_capacity: 6000, spots_remaining: 2800, image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800' },
          { id: 4, title: 'Langkawi International Food Festival', start_date: '2026-02-15T12:00:00', location_name: 'Pantai Cenang', city: 'Langkawi', tags: ['food', 'festival'], expected_attendance: 12000, attendee_count: 8500, max_capacity: 15000, spots_remaining: 6500, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800' },
          { id: 5, title: 'Kedah Tech Innovation Summit 2026', start_date: '2026-02-20T09:00:00', location_name: 'Aman Central', city: 'Alor Setar', tags: ['business', 'technology'], expected_attendance: 3000, attendee_count: 2100, max_capacity: 3000, spots_remaining: 900, image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
          { id: 6, title: 'Langkawi Jazz Festival', start_date: '2026-12-25T19:00:00', location_name: 'Pantai Tengah Beach', city: 'Langkawi', tags: ['entertainment', 'music'], expected_attendance: 5000, attendee_count: 2300, max_capacity: 6000, spots_remaining: 3700, image_url: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const now = new Date();
    
    return events
      .filter(event => {
        // Search filter
        if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        // Type filter
        if (selectedType !== 'All' && !event.tags?.some(tag => tag.toLowerCase() === selectedType.toLowerCase())) {
          return false;
        }
        // Date filter
        const eventDate = new Date(event.start_date);
        if (dateFilter === 'upcoming' && eventDate < now) return false;
        if (dateFilter === 'past' && eventDate >= now) return false;
        
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.title.localeCompare(b.title);
          case 'attendance':
            return (b.expected_attendance || 0) - (a.expected_attendance || 0);
          case 'date':
          default:
            return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        }
      });
  }, [events, searchTerm, selectedType, dateFilter, sortBy]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
    }}>
      {/* Shared Header */}
      <SharedHeader />

      {/* Page Title Section */}
      <div style={{
        paddingTop: '73px',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '89px 24px 16px 24px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <Calendar size={28} color="#a855f7" />
              Explore Events
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
              Discover exciting events in Kedah
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            color: '#a855f7',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {filteredEvents.length} events
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '16px 24px',
        position: 'sticky',
        top: '73px',
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{
            flex: '1',
            minWidth: '200px',
            maxWidth: '350px',
            position: 'relative',
          }}>
            <Search style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              width: '18px',
              height: '18px',
            }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Event Type Filter */}
          <FilterDropdown
            label="Type"
            icon={<Filter size={16} />}
            options={EVENT_TYPES}
            value={selectedType}
            onChange={(val) => setSelectedType(val as string)}
            accentColor="#a855f7"
          />

          {/* Date Filter */}
          <FilterDropdown
            label="When"
            icon={<Calendar size={16} />}
            options={[
              { value: 'all', label: 'All Time', icon: '📅' },
              { value: 'upcoming', label: 'Upcoming', icon: '🔜' },
              { value: 'past', label: 'Past Events', icon: '📆' },
            ]}
            value={dateFilter}
            onChange={(val) => setDateFilter(val as 'all' | 'upcoming' | 'past')}
            accentColor="#a855f7"
          />

          {/* Sort */}
          <SortDropdown
            options={[
              { value: 'date', label: 'Date', icon: '📅' },
              { value: 'attendance', label: 'Popularity', icon: '🔥' },
              { value: 'name', label: 'Name (A-Z)', icon: '🔤' },
            ]}
            value={sortBy}
            onChange={(val) => setSortBy(val as 'date' | 'attendance' | 'name')}
            accentColor="#a855f7"
          />
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  height: '380px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  animation: 'pulse 2s infinite',
                }}
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
          }}>
            <Calendar size={64} color="#475569" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
              No events found
            </h3>
            <p style={{ color: '#64748b' }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <SharedFooter />
    </div>
  );
}
