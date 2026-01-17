import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, Clock, Navigation, Share2, Bell, BellOff, UserPlus, UserMinus, Home, Utensils, AlertCircle, CheckCircle, Loader2, Star, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { EventRegistrationModal } from '../../components/EventRegistrationModal';

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
  requires_approval?: boolean;
}

interface NearbyPlace {
  id: number;
  name: string;
  city?: string;
  distance_km?: number;
  rating?: number;
  type?: string;
  image_url?: string;
}

type RegistrationStatus = 'unknown' | 'not-registered' | 'registered' | 'pending-approval' | 'checking';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('unknown');
  const [unregistering, setUnregistering] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  // Reminder state
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  
  // Nearby places state
  const [nearbyStays, setNearbyStays] = useState<NearbyPlace[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<NearbyPlace[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${id}/`);
        setEvent(response.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        // Demo fallback data
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

  // Check if user is already registered (only if authenticated)
  useEffect(() => {
    const checkRegistration = async () => {
      if (!isAuthenticated || !id) {
        setRegistrationStatus('not-registered');
        return;
      }

      try {
        setRegistrationStatus('checking');
        const response = await api.get(`/events/${id}/my_registration/`);
        // If we get a response, user is registered
        if (response.data && response.data.status === 'confirmed') {
          setRegistrationStatus('registered');
        } else if (response.data && response.data.status === 'pending') {
          setRegistrationStatus('pending-approval');
        } else {
          setRegistrationStatus('not-registered');
        }
      } catch (err: any) {
        // 404 means not registered (expected behavior)
        if (err.response?.status === 404) {
          setRegistrationStatus('not-registered');
        } else {
          console.error('Error checking registration:', err);
          setRegistrationStatus('not-registered');
        }
      }
    };

    checkRegistration();
  }, [id, isAuthenticated]);

  // Fetch nearby stays and restaurants
  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!id) return;
      
      setLoadingNearby(true);
      try {
        // Fetch nearby stays
        const staysResponse = await api.get(`/events/${id}/nearby_stays/`);
        setNearbyStays(staysResponse.data?.stays || staysResponse.data || []);
      } catch (err) {
        console.warn('Could not fetch nearby stays:', err);
        setNearbyStays([]);
      }
      
      try {
        // Fetch nearby restaurants
        const restaurantsResponse = await api.get(`/events/${id}/nearby_restaurants/`);
        setNearbyRestaurants(restaurantsResponse.data?.restaurants || restaurantsResponse.data || []);
      } catch (err) {
        console.warn('Could not fetch nearby restaurants:', err);
        setNearbyRestaurants([]);
      }
      
      setLoadingNearby(false);
    };

    fetchNearbyPlaces();
  }, [id]);

  // Check if user has a reminder set (only if authenticated)
  useEffect(() => {
    const checkReminder = async () => {
      if (!isAuthenticated || !id) {
        setHasReminder(false);
        return;
      }

      try {
        const response = await api.get(`/events/${id}/my_reminders/`);
        // If we get reminders back, user has at least one set
        setHasReminder(response.data && response.data.length > 0);
      } catch (err) {
        // User doesn't have reminders or not authenticated
        setHasReminder(false);
      }
    };

    checkReminder();
  }, [id, isAuthenticated]);

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
      setActionMessage({ type: 'success', text: 'Link copied to clipboard!' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Handle reminder toggle
  const handleToggleReminder = async () => {
    if (!event) return;
    
    // Require authentication for reminders
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: `/events/${event.id}` } });
      return;
    }
    
    setReminderLoading(true);
    
    try {
      if (hasReminder) {
        // Remove reminder
        await api.post(`/events/${event.id}/remove_reminder/`);
        setHasReminder(false);
        setActionMessage({ type: 'success', text: 'Reminder removed.' });
      } else {
        // Set reminder (default: 1 day before)
        await api.post(`/events/${event.id}/set_reminder/`, { reminder_time: '1_day' });
        setHasReminder(true);
        setActionMessage({ type: 'success', text: 'Reminder set for 1 day before the event!' });
      }
      clearMessage();
    } catch (err: any) {
      console.error('Reminder error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update reminder.';
      setActionMessage({ type: 'error', text: errorMsg });
      clearMessage();
    } finally {
      setReminderLoading(false);
    }
  };

  const clearMessage = () => {
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleRegister = () => {
    if (!event) return;

    // Check if event is full
    if (event.is_full) {
      setActionMessage({ type: 'error', text: 'This event is at full capacity.' });
      clearMessage();
      return;
    }

    // Open the registration modal - the modal will handle auth check
    setShowRegistrationModal(true);
  };

  const handleUnregister = async () => {
    if (!event || !isAuthenticated) return;

    setUnregistering(true);
    setActionMessage(null);

    try {
      const response = await api.post(`/events/${event.id}/cancel_registration/`);
      
      // Update local state
      setRegistrationStatus('not-registered');
      setEvent(prev => prev ? {
        ...prev,
        attendee_count: response.data.attendee_count ?? Math.max(0, (prev.attendee_count || 1) - 1),
        spots_remaining: response.data.spots_remaining ?? (prev.spots_remaining ? prev.spots_remaining + 1 : undefined),
        is_full: false,
      } : null);
      
      setActionMessage({ type: 'success', text: 'Successfully cancelled your registration.' });
      clearMessage();
    } catch (err: any) {
      console.error('Unregister error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to cancel registration. Please try again.';
      setActionMessage({ type: 'error', text: errorMsg });
      clearMessage();
    } finally {
      setUnregistering(false);
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

        {/* Action Message */}
        {actionMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '12px',
            marginBottom: '24px',
          }}>
            {actionMessage.type === 'success' ? (
              <CheckCircle size={20} color="#10b981" />
            ) : (
              <AlertCircle size={20} color="#ef4444" />
            )}
            <span style={{
              color: actionMessage.type === 'success' ? '#10b981' : '#ef4444',
              fontSize: '15px',
              fontWeight: '500',
            }}>
              {actionMessage.text}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '40px',
          flexWrap: 'wrap',
        }}>
          {/* Register Button - Show when not registered, not pending, and event not full */}
          {registrationStatus !== 'registered' && registrationStatus !== 'pending-approval' && !event.is_full && (
            <button
              onClick={handleRegister}
              style={{
                flex: 1,
                minWidth: '200px',
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
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <UserPlus size={20} />
              Register Now
            </button>
          )}
          
          {/* Pending Approval Status */}
          {registrationStatus === 'pending-approval' && (
            <div style={{
              flex: 1,
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 24px',
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              color: '#eab308',
              border: '2px solid rgba(234, 179, 8, 0.4)',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
            }}>
              <Clock size={20} />
              Pending Approval
            </div>
          )}
          
          {/* Registered Status with Unregister option */}
          {registrationStatus === 'registered' && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 24px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '700',
              }}>
                <CheckCircle size={20} />
                You're Registered
              </div>
              <button
                onClick={handleUnregister}
                disabled={unregistering}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: unregistering ? 'wait' : 'pointer',
                  opacity: unregistering ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {unregistering ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <UserMinus size={16} />
                    Cancel Registration
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Event Full - Show when event is at capacity */}
          {event.is_full && registrationStatus !== 'registered' && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 24px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
            }}>
              <AlertCircle size={20} />
              Event Full - Registration Closed
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
          
          {/* Reminder Button */}
          <button
            onClick={handleToggleReminder}
            disabled={reminderLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 24px',
              backgroundColor: hasReminder ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.1)',
              color: hasReminder ? '#3b82f6' : '#ffffff',
              border: hasReminder ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              cursor: reminderLoading ? 'wait' : 'pointer',
              opacity: reminderLoading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {reminderLoading ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : hasReminder ? (
              <BellOff size={20} />
            ) : (
              <Bell size={20} />
            )}
          </button>
        </div>

        {/* Nearby Places Section */}
        {(nearbyStays.length > 0 || nearbyRestaurants.length > 0) && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
              Nearby Recommendations
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Nearby Stays */}
              {nearbyStays.length > 0 && (
                <div style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Home size={20} color="#a855f7" />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#a855f7', margin: 0 }}>
                      Nearby Stays
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {nearbyStays.slice(0, 3).map((stay) => (
                      <Link
                        key={stay.id}
                        to={`/stays/${stay.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div>
                          <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                            {stay.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            {stay.distance_km && (
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                                {stay.distance_km.toFixed(1)} km away
                              </span>
                            )}
                            {stay.rating && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24', fontSize: '12px' }}>
                                <Star size={12} fill="#fbbf24" />
                                {Number(stay.rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink size={16} color="#94a3b8" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Nearby Restaurants */}
              {nearbyRestaurants.length > 0 && (
                <div style={{
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Utensils size={20} color="#f97316" />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f97316', margin: 0 }}>
                      Nearby Restaurants
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {nearbyRestaurants.slice(0, 3).map((restaurant) => (
                      <Link
                        key={restaurant.id}
                        to={`/food/${restaurant.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div>
                          <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                            {restaurant.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            {restaurant.distance_km && (
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                                {restaurant.distance_km.toFixed(1)} km away
                              </span>
                            )}
                            {restaurant.rating && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24', fontSize: '12px' }}>
                                <Star size={12} fill="#fbbf24" />
                                {Number(restaurant.rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink size={16} color="#94a3b8" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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

      {/* Registration Modal */}
      {event && (
        <EventRegistrationModal
          event={{
            id: event.id,
            title: event.title,
            start_date: event.start_date,
            location_name: event.location_name,
            city: event.city,
          }}
          isOpen={showRegistrationModal}
          onClose={() => {
            setShowRegistrationModal(false);
            // Re-check registration status after modal closes
            // (in case user completed registration)
            if (isAuthenticated) {
              api.get(`/events/${event.id}/my_registration/`)
                .then(response => {
                  if (response.data && response.data.status === 'confirmed') {
                    setRegistrationStatus('registered');
                    setActionMessage({ type: 'success', text: 'Successfully registered for this event!' });
                    clearMessage();
                  }
                })
                .catch(() => {
                  // Not registered or error - keep current status
                });
            }
          }}
        />
      )}
    </div>
  );
}
