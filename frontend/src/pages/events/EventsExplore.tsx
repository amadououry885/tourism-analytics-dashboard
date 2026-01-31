import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Calendar, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { getCachedData, cachedGet } from '../../services/api';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 9;

const THEME = {
  bg: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#64748b',
  accent: '#1e3a8a',
  highlight: '#f97316',
  border: '#e2e8f0',
};

export interface Event {
  id: number;
  title: string;
  start_date: string;
  end_date?: string;
  location_name: string;
  city: string;
  image_url: string;
  tags: string[];
  expected_attendance: number;
  attendee_count: number;
  max_capacity: number;
  spots_remaining: number;
  is_full: boolean;
  is_happening_now: boolean;
  description: string;
  user_registered: boolean;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' })
    };
  };

  const dateData = formatDate(event.start_date);

  return (
    <Link 
      to={`/events/${event.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Image Section */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={event.image_url || defaultImage}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.0)'}
        />
        
        {/* Date Badge (Floating) */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          backgroundColor: '#ffffff', borderRadius: '10px',
          padding: '6px 12px', textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          minWidth: '50px'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#f97316', fontWeight: '800' }}>
            {dateData.month}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>
            {dateData.day}
          </div>
        </div>

        {/* Live Badge */}
        {event.is_happening_now && (
           <div style={{
             position: 'absolute', top: '12px', right: '12px',
             backgroundColor: '#ef4444', color: 'white',
             padding: '4px 10px', borderRadius: '20px',
             fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px',
             boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
           }}>
             LIVE
           </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category Tag */}
        <div style={{ marginBottom: '8px' }}>
             <span style={{ 
               fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#3b82f6',
               backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px'
             }}>
               {event.tags[0] || 'Event'}
             </span>
        </div>

        {/* Title */}
        <h3 style={{ 
          fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', lineHeight: '1.4',
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {event.title}
        </h3>

        {/* Info Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#f97316" /> {dateData.time}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="#f97316" /> {event.location_name}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {event.is_full ? 'Sold Out' : 'Tickets Available'}
          </span>
          
          <div style={{ 
             display: 'flex', alignItems: 'center', gap: '6px', 
             fontSize: '13px', fontWeight: '700', color: '#1e3a8a' 
          }}>
            Join <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Demo data for fallback
const demoEvents: Event[] = [
  { id: 1, title: 'Kedah International Kite Festival', start_date: '2026-02-15T09:00:00', location_name: 'Padang Langkawi', city: 'Langkawi', image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', tags: ['Festival', 'Culture'], expected_attendance: 5000, attendee_count: 3200, max_capacity: 5000, spots_remaining: 1800, is_full: false, is_happening_now: false, description: 'Annual kite festival', user_registered: false },
  { id: 2, title: 'Langkawi Food & Music Fest', start_date: '2026-03-01T18:00:00', location_name: 'Pantai Cenang Beach', city: 'Langkawi', image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', tags: ['Food', 'Music'], expected_attendance: 3000, attendee_count: 2800, max_capacity: 3000, spots_remaining: 200, is_full: false, is_happening_now: false, description: 'Food and music festival', user_registered: false },
  { id: 3, title: 'Traditional Malay Dance Workshop', start_date: '2026-01-25T14:00:00', location_name: 'Kedah Cultural Centre', city: 'Alor Setar', image_url: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=800', tags: ['Workshop', 'Culture'], expected_attendance: 100, attendee_count: 75, max_capacity: 100, spots_remaining: 25, is_full: false, is_happening_now: true, description: 'Learn traditional dances', user_registered: false },
  { id: 4, title: 'Kedah Heritage Walk', start_date: '2026-02-20T07:00:00', location_name: 'Zahir Mosque', city: 'Alor Setar', image_url: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800', tags: ['Tour', 'Heritage'], expected_attendance: 50, attendee_count: 45, max_capacity: 50, spots_remaining: 5, is_full: false, is_happening_now: false, description: 'Heritage walking tour', user_registered: false },
  { id: 5, title: 'Sunset Cruise Party', start_date: '2026-02-14T17:00:00', location_name: 'Telaga Harbour', city: 'Langkawi', image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', tags: ['Party', 'Cruise'], expected_attendance: 200, attendee_count: 200, max_capacity: 200, spots_remaining: 0, is_full: true, is_happening_now: false, description: 'Valentine cruise party', user_registered: false },
  { id: 6, title: 'Batik Art Workshop', start_date: '2026-01-30T10:00:00', location_name: 'Craft Complex Langkawi', city: 'Langkawi', image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', tags: ['Workshop', 'Art'], expected_attendance: 30, attendee_count: 22, max_capacity: 30, spots_remaining: 8, is_full: false, is_happening_now: false, description: 'Learn batik making', user_registered: false },
];

export default function EventsExplore() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(demoEvents);
  const [loading, setLoading] = useState(true);
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch Data Logic ---
  useEffect(() => {
    const key = '/events/?page_size=100';
    const fetchEvents = async () => {
      try {
        setError(null);

        // Try synchronous cached read
        const cached = getCachedData(key, 120);
        if (cached) {
          const data = cached;
          if (Array.isArray(data) && data.length > 0) {
            const transformedEvents: Event[] = data.map((event: any, index: number) => ({
              id: event.id || index + 1,
              title: event.title || event.name || `Event ${index + 1}`,
              start_date: event.start_date || event.date || new Date().toISOString(),
              end_date: event.end_date,
              location_name: event.location_name || event.venue || 'Kedah',
              city: event.city || 'Kedah',
              image_url: event.image_url || event.image,
              tags: event.tags || event.categories || ['Event'],
              expected_attendance: event.expected_attendance || 100,
              attendee_count: event.attendee_count || 0,
              max_capacity: event.max_capacity || 100,
              spots_remaining: event.spots_remaining || 100,
              is_full: event.is_full || false,
              is_happening_now: event.is_happening_now || false,
              description: event.description || '',
              user_registered: event.user_registered || false,
            }));
            setEvents(transformedEvents);
            setLoading(false);
          }
        }

        // Background revalidation
        cachedGet(key, 120).then(response => {
          const data = response.data.results || response.data || [];
          if (Array.isArray(data) && data.length > 0) {
            const transformedEvents: Event[] = data.map((event: any, index: number) => ({
              id: event.id || index + 1,
              title: event.title || event.name || `Event ${index + 1}`,
              start_date: event.start_date || event.date || new Date().toISOString(),
              end_date: event.end_date,
              location_name: event.location_name || event.venue || 'Kedah',
              city: event.city || 'Kedah',
              image_url: event.image_url || event.image,
              tags: event.tags || event.categories || ['Event'],
              expected_attendance: event.expected_attendance || 100,
              attendee_count: event.attendee_count || 0,
              max_capacity: event.max_capacity || 100,
              spots_remaining: event.spots_remaining || 100,
              is_full: event.is_full || false,
              is_happening_now: event.is_happening_now || false,
              description: event.description || '',
              user_registered: event.user_registered || false,
            }));
            setEvents(transformedEvents);
            setLoading(false);
          }
        }).catch(() => {
          if (!cached) setLoading(false);
        });
      } catch (err) {
        console.error('Error fetching events:', err);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // --- Carousel Logic ---
  const carouselSlides = useMemo(() => {
    if (events.length === 0) return [];
    return events.slice(0, 5); 
  }, [events]);

  useEffect(() => {
    if (carouselSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);

  // --- Filtering Logic ---
  const eventTags: string[] = useMemo(() => {
    const allTags = events.flatMap(e => e.tags).filter(t => typeof t === 'string' && t.length > 0);
    return ['All', ...Array.from(new Set(allTags)).sort()];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedTag !== 'All' && !event.tags.includes(selectedTag)) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date': return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          case 'popularity': default: return (b.attendee_count || 0) - (a.attendee_count || 0);
        }
      });
  }, [events, searchTerm, selectedTag, sortBy]);

  // Pagination Logic
  useEffect(() => setCurrentPage(1), [searchTerm, selectedTag, sortBy]);
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, color: THEME.text, fontFamily: 'Poppins, sans-serif' }}>
      <SharedHeader />

      <style>{`
        .glass-panel-dark {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* --- HERO CAROUSEL SECTION --- */}
      {!loading && carouselSlides.length > 0 && (
        <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
          {carouselSlides.map((event, index) => (
            <div
              key={event.id}
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <img 
                src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80'} 
                alt={event.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to bottom, rgba(30,58,138,0.2), rgba(15,23,42,0.6))'
              }} />
            </div>
          ))}

          {/* Carousel Text Content */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', zIndex: 10, width: '90%', maxWidth: '800px'
          }}>
            <div className="glass-panel-dark" 
              onClick={() => navigate(`/events/${carouselSlides[currentSlide].id}`)}
              style={{ padding: '40px', borderRadius: '24px', cursor: 'pointer' }}
            >
              <div style={{ 
                display: 'inline-block', backgroundColor: THEME.highlight, color: 'white',
                padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                {carouselSlides[currentSlide].is_happening_now ? '🔴 Happening Now' : 'Upcoming Event'}
              </div>
              <h1 style={{ 
                fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '800', color: 'white', 
                marginBottom: '16px', lineHeight: '1.1', textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                {carouselSlides[currentSlide].title}
              </h1>
              <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: '#e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
                {formatDate(carouselSlides[currentSlide].start_date)} · {carouselSlides[currentSlide].location_name}
              </p>
            </div>
          </div>

          {/* Controls */}
          <button onClick={prevSlide} style={{
            position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 20,
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', 
            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white'
          }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} style={{
            position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 20,
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', 
            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white'
          }}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* --- FILTERS BAR --- */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${THEME.border}`, position: 'sticky', top: '70px', zIndex: 40,
        padding: '16px 24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: THEME.textSecondary, width: '18px', height: '18px' }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 44px', borderRadius: '50px',
                border: `1px solid ${THEME.border}`, backgroundColor: '#f1f5f9',
                color: THEME.text, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = THEME.accent}
              onBlur={(e) => e.target.style.borderColor = THEME.border}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={{
                  padding: '10px 36px 10px 16px', borderRadius: '8px', backgroundColor: 'white',
                  border: `1px solid ${selectedTag !== 'All' ? THEME.accent : THEME.border}`,
                  color: selectedTag !== 'All' ? THEME.accent : THEME.text,
                  appearance: 'none', cursor: 'pointer', minWidth: '140px', fontWeight: '500'
                }}
              >
                {eventTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <Calendar size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: THEME.textSecondary }} />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'popularity')}
              style={{
                padding: '10px 16px', borderRadius: '8px', backgroundColor: 'white',
                border: `1px solid ${THEME.border}`, color: THEME.text,
                appearance: 'none', cursor: 'pointer', fontWeight: '500'
              }}
            >
              <option value="date">Soonest First</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: THEME.text }}>
            {filteredEvents.length} Events Found
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '18px', color: THEME.textSecondary }}>Loading events...</div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px'
            }}>
              {paginatedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ marginTop: '40px' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </main>

      <SharedFooter />
    </div>
  );
}