import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, Clock, Navigation, Share2, Bell, UserPlus, Home, Utensils } from 'lucide-react';
import api from '../../services/api';

interface EventDetail {
  id: number;
  title: string;
  start_date: string;
  end_date?: string;
  location_name?: string;
  city?: string;
  image_url?: string;
  tags?: string[];
  expected_attendance?: number;
  attendee_count?: number;
  max_capacity?: number;
  spots_remaining?: number;
  is_full?: boolean;
  is_happening_now?: boolean;
  description?: string;
  lat?: number;
  lon?: number;
  user_registered?: boolean;
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${id}/`);
        setEvent(response.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        // Demo data
        setEvent({
          id: parseInt(id || '1'),
          title: 'Langkawi International Maritime & Aerospace Exhibition',
          start_date: '2026-03-15T09:00:00',
          end_date: '2026-03-19T18:00:00',
          location_name: 'Mahsuri International Exhibition Centre',
          city: 'Langkawi',
          image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
          tags: ['business', 'exhibition'],
          expected_attendance: 15000,
          attendee_count: 4500,
          max_capacity: 20000,
          spots_remaining: 15500,
          is_full: false,
          description: 'LIMA is a biennial event that showcases the latest in maritime and aerospace technology. The exhibition brings together industry leaders, government officials, and aviation enthusiasts from around the world. Visitors can expect spectacular aerial displays, cutting-edge military and civilian aircraft exhibitions, and networking opportunities with top defense contractors.',
          lat: 6.3307,
          lon: 99.7258,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const handleGetDirections = () => {
    if (!event) return;
    if (event.lat && event.lon) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lon}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_name + ' ' + event.city)}`, '_blank');
    }
  };

  const handleShare = () => {
    if (!event) return;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Join ${event.title} on ${formatDate(event.start_date)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    try {
      await api.post(`/events/${event.id}/register/`);
      setEvent(prev => prev ? { ...prev, user_registered: true, attendee_count: (prev.attendee_count || 0) + 1 } : null);
      alert('Successfully registered for event!');
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Please sign in to register for events.');
      } else {
        alert(err.response?.data?.error || 'Registration failed.');
      }
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const capacityPercent = event?.max_capacity && event?.attendee_count
    ? Math.round((event.attendee_count / event.max_capacity) * 100)
    : null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(168, 85, 247, 0.3)',
          borderTopColor: '#a855f7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <Calendar size={64} color="#475569" />
        <h2 style={{ color: '#e2e8f0', marginTop: '16px', fontSize: '24px' }}>Event not found</h2>
        <Link
          to="/events"
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            backgroundColor: '#a855f7',
            color: '#ffffff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Hero Image */}
      <div style={{
        position: 'relative',
        height: '50vh',
        minHeight: '400px',
        maxHeight: '500px',
      }}>
        <img
          src={event.image_url || defaultImage}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.8) 70%, rgba(15, 23, 42, 1) 100%)',
        }} />

        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Live Badge */}
        {event.is_happening_now && (
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'pulse 2s infinite',
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
            }} />
            HAPPENING NOW
          </div>
        )}

        {/* Title Section */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '0 24px 32px',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {event.tags?.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#a855f7',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '12px',
              lineHeight: '1.2',
            }}>
              {event.title}
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              color: '#94a3b8',
              fontSize: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#a855f7" />
                <span>{formatDate(event.start_date)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} />
                <span>{event.location_name || event.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <Calendar size={28} color="#a855f7" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Date & Time</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#a855f7' }}>
              {formatTime(event.start_date)}
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <Users size={28} color="#3b82f6" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Expected</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>
              {event.expected_attendance?.toLocaleString() || 'TBA'}
            </div>
          </div>
          
          <div style={{
            backgroundColor: event.is_full ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${event.is_full ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <UserPlus size={28} color={event.is_full ? '#ef4444' : '#10b981'} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Spots Left</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: event.is_full ? '#ef4444' : '#10b981' }}>
              {event.is_full ? 'SOLD OUT' : event.spots_remaining?.toLocaleString() || 'Open'}
            </div>
          </div>
        </div>

        {/* Capacity Progress */}
        {capacityPercent !== null && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '32px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                {event.attendee_count?.toLocaleString()} registered
              </span>
              <span style={{ color: '#94a3b8' }}>
                {event.max_capacity?.toLocaleString()} capacity
              </span>
            </div>
            <div style={{
              height: '12px',
              backgroundColor: '#1e293b',
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${capacityPercent}%`,
                height: '100%',
                backgroundColor: capacityPercent > 90 ? '#ef4444' : capacityPercent > 70 ? '#f59e0b' : '#10b981',
                borderRadius: '6px',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              fontSize: '14px',
              color: '#94a3b8',
            }}>
              {capacityPercent}% filled
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {!event.is_full && !event.user_registered && (
            <button
              onClick={handleRegister}
              disabled={registering}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 24px',
                backgroundColor: '#a855f7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: registering ? 'wait' : 'pointer',
                opacity: registering ? 0.7 : 1,
              }}
            >
              <UserPlus size={20} />
              {registering ? 'Registering...' : 'Register Now'}
            </button>
          )}
          
          {event.user_registered && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 24px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              border: '2px solid #10b981',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
            }}>
              ✓ You're Registered
            </div>
          )}
          
          <button
            onClick={handleGetDirections}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Navigation size={20} />
            Directions
          </button>
          
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              cursor: 'pointer',
            }}
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Description */}
        {event.description && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
              About This Event
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#cbd5e1' }}>
              {event.description}
            </p>
          </div>
        )}

        {/* Details */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
            Event Details
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Calendar size={20} color="#64748b" />
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Date</div>
                <div style={{ fontSize: '15px', color: '#e2e8f0' }}>
                  {formatDate(event.start_date)}
                  {event.end_date && ` - ${formatDate(event.end_date)}`}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Clock size={20} color="#64748b" />
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Time</div>
                <div style={{ fontSize: '15px', color: '#e2e8f0' }}>
                  {formatTime(event.start_date)}
                  {event.end_date && ` - ${formatTime(event.end_date)}`}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MapPin size={20} color="#64748b" />
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Location</div>
                <div style={{ fontSize: '15px', color: '#e2e8f0' }}>
                  {event.location_name}
                  {event.city && `, ${event.city}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          © 2026 Kedah Tourism Analytics Dashboard
        </p>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
          School of Computing & Informatics, Albukhary International University
        </p>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
