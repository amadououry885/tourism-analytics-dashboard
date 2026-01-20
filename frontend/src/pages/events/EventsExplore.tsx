import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, Filter, ArrowRight, Clock, Users, Music, Zap } from 'lucide-react';
import api from '../../services/api';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import Pagination from '../../components/Pagination';

// --- Types ---
interface Event {
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

// --- Theme & Styles (Blue/Cyan/Slate Palette) ---
const THEME = {
  bg: '#0f172a',            // Slate 900
  bgCard: '#1e293b',        // Slate 800
  primary: '#3b82f6',       // Blue 500
  secondary: '#06b6d4',     // Cyan 500
  primaryGradient: 'linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%)', 
  text: '#ffffff',
  textSecondary: '#94a3b8',
  accent: '#f59e0b',        
  success: '#10b981',       
};

const ITEMS_PER_PAGE = 6;

const EVENT_TYPES = [
  { value: 'All', label: 'All Categories' },
  { value: 'festival', label: 'Festivals' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'business', label: 'Business' },
  { value: 'sport', label: 'Sports' },
  { value: 'music', label: 'Music' },
];

export default function EventsExplore() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [liveEvents, setLiveEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'attendance' | 'name'>('date');
  
  // Pagination
  const [upcomingPage, setUpcomingPage] = useState(1);

  // --- Fetch Data Logic ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Fallback or API logic here (simplified for brevity)
        const response = await api.get('/events/?page_size=100').catch(() => ({ data: [] }));
        const data = response.data.results || response.data || [];
        
        if (data.length > 0) {
          const transformedEvents: Event[] = data.map((event: any) => ({
            id: event.id,
            title: event.title,
            start_date: event.start_date,
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
            user_registered: event.user_registered || false,
          }));
          setEvents(transformedEvents);
        } else {
           // Demo Data
           setEvents([
            { id: 1, title: 'Neon Music Festival', start_date: '2026-03-15T19:00:00', location_name: 'Central Park', city: 'Alor Setar', tags: ['music', 'festival'], expected_attendance: 5000, attendee_count: 1200, max_capacity: 5000, spots_remaining: 3800, is_full: false, is_happening_now: false, description: '', user_registered: false, image_url: 'https://images.unsplash.com/photo-1459749411177-046f52bbace5?w=800' },
            { id: 2, title: 'Kedah Tech Summit', start_date: '2026-04-10T09:00:00', location_name: 'Convention Center', city: 'Langkawi', tags: ['business'], expected_attendance: 1000, attendee_count: 800, max_capacity: 1000, spots_remaining: 200, is_full: false, is_happening_now: false, description: '', user_registered: false, image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
            { id: 3, title: 'Street Food Carnival', start_date: '2026-02-28T17:00:00', location_name: 'Night Market', city: 'Sungai Petani', tags: ['food'], expected_attendance: 3000, attendee_count: 0, max_capacity: 3000, spots_remaining: 3000, is_full: false, is_happening_now: true, description: '', user_registered: false, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800' },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // --- Filtering Logic ---
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedType !== 'All' && !event.tags?.some(tag => tag.toLowerCase() === selectedType.toLowerCase())) return false;
      return true;
    }).map(e => ({ ...e, is_happening_now: e.title === 'Street Food Carnival' || e.is_happening_now }));
  }, [events, searchTerm, selectedType]);

  const { upcomingEvents } = useMemo(() => {
    const now = new Date();
    const upcoming = filteredEvents.filter(e => new Date(e.start_date) >= now || e.is_happening_now);
    return { upcomingEvents: upcoming };
  }, [filteredEvents]);

  const paginatedUpcoming = upcomingEvents.slice((upcomingPage - 1) * ITEMS_PER_PAGE, upcomingPage * ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        full: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, fontFamily: 'Plus Jakarta Sans, sans-serif', color: THEME.text }}>
      <SharedHeader />
      
      {/* --- HERO SECTION --- */}
      <div style={{
        background: THEME.primaryGradient,
        padding: '120px 24px 100px',
        position: 'relative',
        borderBottomRightRadius: '80px',
        overflow: 'hidden' // Keeps background shapes contained
      }}>
        {/* Abstract Background Shapes */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ maxWidth: '600px' }}>
                <div style={{ 
                    display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)',
                    padding: '8px 16px', borderRadius: '30px', marginBottom: '24px', fontSize: '14px', fontWeight: '600', color: '#e0f2fe'
                }}>
                    Find Your Next Experience
                </div>
                <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>
                    Discover & Promote <br /> Upcoming Events
                </h1>
                <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '480px', color: '#f0f9ff' }}>
                    Join the most vibrant community in Kedah. From music festivals to tech summits, find your crowd here.
                </p>
            </div>
            
            <div style={{ display: 'none', flexDirection: 'column', gap: '20px', '@media (min-width: 900px)': { display: 'flex' } }}>
                 <div style={{ width: '300px', height: '300px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                    <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Crowd" />
                 </div>
            </div>
        </div>
      </div>

      {/* --- FLOATING SEARCH PILL (Moved Outside Hero) --- */}
      <div style={{
          position: 'relative',
          marginTop: '-45px', // Negative margin pulls it up over the hero
          marginBottom: '40px',
          zIndex: 30, // Higher z-index to sit on top
          padding: '0 24px' // Ensure padding on mobile
      }}>
        <div style={{
            margin: '0 auto',
            maxWidth: '900px',
            backgroundColor: THEME.bgCard,
            borderRadius: '50px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            flexWrap: 'wrap' // Better mobile responsiveness
        }}>
            {/* Search Input */}
            <div style={{ flex: '2 1 200px', padding: '0 24px', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search size={20} color={THEME.primary} />
                <input 
                    type="text" 
                    placeholder="Search Event..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '15px' }}
                />
            </div>

            {/* Type Dropdown */}
            <div style={{ flex: '1.5 1 150px', padding: '0 24px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Filter size={18} color={THEME.textSecondary} />
                    <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                    >
                        {EVENT_TYPES.map(t => <option key={t.value} value={t.value} style={{color:'black'}}>{t.label}</option>)}
                    </select>
                </div>
            </div>
            
            {/* Sort Dropdown */}
             <div style={{ flex: '1.5 1 150px', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={18} color={THEME.textSecondary} />
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                    >
                        <option value="date" style={{color:'black'}}>Date: Soonest</option>
                        <option value="attendance" style={{color:'black'}}>Popularity</option>
                    </select>
                </div>
            </div>

            {/* Search Button */}
            <button style={{
                backgroundColor: THEME.primary,
                border: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.2s',
                marginLeft: 'auto'
            }}>
                <Search size={20} color="white" />
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        
        {/* LIVE SECTION */}
        {upcomingEvents.some(e => e.is_happening_now) && (
            <section style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: THEME.success, boxShadow: `0 0 10px ${THEME.success}` }} className="pulse" />
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Happening Now</h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {upcomingEvents.filter(e => e.is_happening_now).map(event => (
                        <div key={event.id} onClick={() => navigate(`/events/${event.id}`)} style={{
                            backgroundColor: 'rgba(30, 41, 59, 0.7)', // Transparent Slate
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px', overflow: 'hidden', 
                            border: `1px solid ${THEME.primary}40`,
                            cursor: 'pointer', display: 'flex', flexDirection: 'column'
                        }}>
                             <div style={{ position: 'relative', height: '200px' }}>
                                <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '16px', right: '16px', background: THEME.success, color: '#064e3b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>LIVE</div>
                             </div>
                             <div style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'white' }}>{event.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '14px' }}>
                                    <MapPin size={14} color={THEME.secondary} /> {event.location_name}
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* UPCOMING EVENTS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
             <div>
                <div style={{ color: THEME.primary, fontWeight: '600', marginBottom: '4px', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Upcoming Event</div>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>Featured Events</h2>
             </div>
        </div>

        {loading ? (
            <div style={{color: THEME.textSecondary}}>Loading events...</div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
                {paginatedUpcoming.filter(e => !e.is_happening_now).map((event) => {
                    const date = formatDate(event.start_date);
                    return (
                        <div 
                            key={event.id} 
                            onClick={() => navigate(`/events/${event.id}`)}
                            style={{ 
                                backgroundColor: 'white', 
                                borderRadius: '24px', 
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = `0 20px 40px -10px ${THEME.primary}40`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                            }}
                        >
                            <div style={{ height: '220px', position: 'relative' }}>
                                <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ 
                                    position: 'absolute', bottom: '16px', left: '16px', 
                                    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '8px 12px',
                                    textAlign: 'center', color: '#0f172a', fontWeight: 'bold', minWidth: '60px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ fontSize: '12px', textTransform: 'uppercase', color: THEME.primary, fontWeight: '800' }}>{date.month}</div>
                                    <div style={{ fontSize: '20px', lineHeight: '1' }}>{date.day}</div>
                                </div>
                                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                    <button style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', padding: '8px', color: 'white' }}>
                                        <Music size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <h3 style={{ 
                                    fontSize: '18px', fontWeight: '800', color: '#1e293b', 
                                    marginBottom: '12px', lineHeight: '1.4',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                                }}>
                                    {event.title}
                                </h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                                        <Clock size={14} color={THEME.primary} /> {date.full}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                                        <MapPin size={14} color={THEME.primary} /> {event.location_name}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                         <span style={{ fontSize: '12px', color: '#94a3b8' }}>Organized by</span>
                                         <span style={{ fontSize: '12px', color: THEME.secondary, fontWeight: '700' }}>KedahTourism</span>
                                    </div>
                                    <button style={{ 
                                        padding: '8px 20px', borderRadius: '8px', border: `1px solid ${THEME.primary}`,
                                        backgroundColor: 'transparent', color: THEME.primary, fontWeight: '700', fontSize: '12px',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = THEME.primary;
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = THEME.primary;
                                    }}
                                    >
                                        BUY TICKET
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        <div style={{ marginTop: '60px' }}>
             <Pagination
                currentPage={upcomingPage}
                totalPages={Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE)}
                onPageChange={setUpcomingPage}
                totalItems={upcomingEvents.length}
                itemsPerPage={ITEMS_PER_PAGE}
                accentColor={THEME.primary}
            />
        </div>
      </main>

      <SharedFooter />
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .pulse { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}