
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';

// --- Theme Constants (Matches your Dashboard/Analytics look) ---
const THEME = {
  primary: '#3b82f6',       // Blue 500 (Replaces Purple)
  secondary: '#06b6d4',     // Cyan 500
  success: '#10b981',       // Emerald (For Live/Registered)
  danger: '#ef4444',        // Red (For Sold Out)
  warning: '#f59e0b',       // Amber (For Pending)
  textMain: '#1e293b',      // Slate 800
  textMuted: '#64748b',     // Slate 500
  bgCard: '#ffffff',
};

export interface Event {
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
  // User registration status
  user_registered?: boolean;
  registration_status?: 'confirmed' | 'pending' | 'cancelled' | null;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop';
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-MY', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil(event.start_date);
  const capacityPercent = event.max_capacity && event.attendee_count 
    ? Math.round((event.attendee_count / event.max_capacity) * 100)
    : null;

  // Logic to determine if event is truly live
  const isActuallyHappeningNow = (() => {
    if (!event.is_happening_now) return false;
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;
    
    if (endDate) return startDate <= now && endDate >= now;
    
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceStart <= 1; 
  })();

  return (
    <Link 
      to={`/events/${event.id}`}
      style={{
        display: 'block',
        borderRadius: '20px', // Slightly more rounded for modern look
        overflow: 'hidden',
        backgroundColor: THEME.bgCard,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        textDecoration: 'none',
        border: '1px solid rgba(226, 232, 240, 0.8)', // Subtle border
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.1)`; // Blue tinted shadow
        e.currentTarget.style.borderColor = THEME.primary; // Highlight border
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={event.image_url || defaultImage}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          className="hover:scale-105" // If you use Tailwind, else add generic css
          onMouseEnter={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1)'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        {/* Live Now Badge - Updated to Emerald/Green */}
        {isActuallyHappeningNow && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: THEME.success, // Green
            color: '#064e3b', // Dark Green text
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            animation: 'pulse 2s infinite',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
            }} />
            LIVE
          </div>
        )}
        
        {/* Days Until Badge - Glassmorphism */}
        {!isActuallyHappeningNow && daysUntil > 0 && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)', // Slate dark glass
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
          </div>
        )}
        
        {/* Tag Badge - Updated to Blue */}
        {event.tags && event.tags[0] && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: THEME.primary, // Blue
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
          }}>
            {event.tags[0]}
          </div>
        )}
        
        {/* Capacity Badge */}
        {event.is_full && !event.user_registered && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: THEME.danger,
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
          }}>
            SOLD OUT
          </div>
        )}
        
        {/* User Registration Badge */}
        {event.user_registered && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: event.registration_status === 'pending' ? THEME.warning : THEME.success,
            color: event.registration_status === 'pending' ? '#78350f' : '#064e3b',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {event.registration_status === 'pending' ? '⏳ Pending' : '✓ Registered'}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '800',
          color: THEME.textMain,
          marginBottom: '12px',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          height: '50px' // Fixed height for alignment
        }}>
          {event.title}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
             {/* Date - Updated to Blue Icon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: THEME.primary, // Blue Text
              fontSize: '14px',
              fontWeight: '600',
            }}>
              <Calendar size={16} color={THEME.primary} />
              <span>{formatDate(event.start_date)}</span>
            </div>
            
            {/* Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: THEME.textMuted,
              fontSize: '13px',
            }}>
              <MapPin size={16} />
              <span>{event.location_name || event.city || 'Kedah'}</span>
            </div>
        </div>
        
        {/* Capacity Progress */}
        {capacityPercent !== null && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: THEME.textMuted,
              marginBottom: '6px',
              fontWeight: '500'
            }}>
              <span>{event.attendee_count} attending</span>
              <span style={{ color: capacityPercent > 90 ? THEME.danger : THEME.textMuted }}>
                {event.spots_remaining} left
              </span>
            </div>
            <div style={{
              height: '6px',
              backgroundColor: '#f1f5f9',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${capacityPercent}%`,
                height: '100%',
                backgroundColor: capacityPercent > 90 ? THEME.danger : capacityPercent > 70 ? THEME.warning : THEME.success,
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
        
        {/* Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
        }}>
          {/* Expected Attendance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Users size={16} color={THEME.textMuted} />
            <span style={{ fontWeight: '700', color: THEME.textMain, fontSize: '13px' }}>
              {event.expected_attendance?.toLocaleString() || 'TBA'}
            </span>
            <span style={{ color: THEME.textMuted, fontSize: '12px' }}>expected</span>
          </div>

          {/* New "View" Text Link style */}
          <span style={{ fontSize: '12px', fontWeight: '700', color: THEME.primary }}>
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
