import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';

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

  return (
    <Link 
      to={`/events/${event.id}`}
      style={{
        display: 'block',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={event.image_url || defaultImage}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        {/* Live Now Badge */}
        {event.is_happening_now && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'pulse 2s infinite',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
            }} />
            HAPPENING NOW
          </div>
        )}
        
        {/* Days Until Badge */}
        {!event.is_happening_now && daysUntil > 0 && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            backdropFilter: 'blur(4px)',
          }}>
            {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
          </div>
        )}
        
        {/* Tag Badge */}
        {event.tags && event.tags[0] && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#8b5cf6',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'capitalize',
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
            backgroundColor: '#ef4444',
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
            backgroundColor: event.registration_status === 'pending' ? '#f59e0b' : '#10b981',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {event.registration_status === 'pending' ? '⏳ Pending' : '✓ Registered'}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '8px',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {event.title}
        </h3>
        
        {/* Date */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#8b5cf6',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '8px',
        }}>
          <Calendar size={14} />
          <span>{formatDate(event.start_date)}</span>
        </div>
        
        {/* Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '14px',
          marginBottom: '12px',
        }}>
          <MapPin size={14} />
          <span>{event.location_name || event.city || 'Kedah'}</span>
        </div>
        
        {/* Capacity Progress */}
        {capacityPercent !== null && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '6px',
            }}>
              <span>{event.attendee_count} attending</span>
              <span>{event.spots_remaining} spots left</span>
            </div>
            <div style={{
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${capacityPercent}%`,
                height: '100%',
                backgroundColor: capacityPercent > 90 ? '#ef4444' : capacityPercent > 70 ? '#f59e0b' : '#10b981',
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
          paddingTop: '12px',
          borderTop: '1px solid #e2e8f0',
        }}>
          {/* Expected Attendance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <Users size={16} color="#64748b" />
            <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
              {event.expected_attendance?.toLocaleString() || 'TBA'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>expected</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
