import { X, Calendar, MapPin, Users, Navigation, Share2, Clock, TrendingUp, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DynamicRegistrationForm } from './DynamicRegistrationForm';
import api from '../services/api';

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location_name?: string;
  city?: string;
  tags: string[];
  expected_attendance?: number;
  actual_attendance?: number;
  lat?: number;
  lon?: number;
  image_url?: string;
  has_custom_form?: boolean; // ✨ NEW: Check if event has registration form
  max_capacity?: number;
  attendee_count?: number;
  spots_remaining?: number;
  is_full?: boolean;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  scrollToRegistration?: boolean; // ✨ Show registration form when true
  onRegistrationModalOpen?: () => void; // ✨ Callback when registration popup opens
}

// Color schemes for event types
const eventTypeColors: Record<string, { gradient: string; badge: string; icon: string }> = {
  sports: { gradient: 'from-orange-400 to-red-500', badge: 'bg-orange-100 text-orange-700 border-orange-300', icon: '⚽' },
  food: { gradient: 'from-red-400 to-pink-500', badge: 'bg-red-100 text-red-700 border-red-300', icon: '🍽️' },
  festival: { gradient: 'from-purple-400 to-pink-500', badge: 'bg-purple-100 text-purple-700 border-purple-300', icon: '🎉' },
  cultural: { gradient: 'from-amber-400 to-orange-500', badge: 'bg-amber-100 text-amber-700 border-amber-300', icon: '🎭' },
  business: { gradient: 'from-blue-400 to-indigo-500', badge: 'bg-blue-100 text-blue-700 border-blue-300', icon: '💼' },
  entertainment: { gradient: 'from-pink-400 to-rose-500', badge: 'bg-pink-100 text-pink-700 border-pink-300', icon: '🎪' },
  exhibition: { gradient: 'from-teal-400 to-cyan-500', badge: 'bg-teal-100 text-teal-700 border-teal-300', icon: '🎨' },
  default: { gradient: 'from-gray-400 to-gray-500', badge: 'bg-gray-100 text-gray-700 border-gray-300', icon: '📅' }
};

export function EventModal({ event, isOpen, onClose, scrollToRegistration = false, onRegistrationModalOpen }: EventModalProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const registrationRef = useRef<HTMLDivElement>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [cancellingRegistration, setCancellingRegistration] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  // ✨ Auto-open registration modal when JOIN US is clicked
  useEffect(() => {
    if (scrollToRegistration && event?.has_custom_form) {
      console.log('✅ JOIN US clicked - Opening registration popup!');
      setShowRegistrationModal(true);
      // Notify parent to reset the scroll flag
      if (onRegistrationModalOpen) {
        onRegistrationModalOpen();
      }
    }
  }, [scrollToRegistration, event?.has_custom_form, onRegistrationModalOpen]);

  // 🎹 Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showRegistrationModal) {
        setShowRegistrationModal(false);
      }
    };
    
    if (showRegistrationModal) {
      window.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showRegistrationModal]);
  
  // ✨ Reset all modal states when modal closes
  useLayoutEffect(() => {
    if (!isOpen) {
      setShowRegistrationForm(false);
      setShowRegistrationModal(false);
      setShowCancelConfirm(false);
    }
  }, [isOpen]);
  
  // ✨ Check if user is already registered
  useEffect(() => {
    const checkUserRegistration = async () => {
      if (!isOpen || !event?.id) {
        console.log('❌ Modal not open or no event ID');
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('⚠️  No auth token found - user not logged in');
        setUserRegistration(null);
        return;
      }
      
      console.log('🔍 Checking registration for event:', event.id, event.title);
      console.log('📋 Event has_custom_form:', event.has_custom_form);
      
      setLoadingRegistration(true);
      try {
        const response = await api.get(`/events/${event.id}/my_registration/`);
        console.log('✅ User registration found:', response.data);
        setUserRegistration(response.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('ℹ️  No registration found for this event');
        } else {
          console.error('❌ Error checking registration:', error);
        }
        setUserRegistration(null);
      } finally {
        setLoadingRegistration(false);
      }
    };
    
    checkUserRegistration();
  }, [isOpen, event?.id, event?.has_custom_form]);
  
  // ✨ Handle registration cancellation
  const handleCancelRegistration = async () => {
    if (!event?.id) return;
    
    setCancellingRegistration(true);
    try {
      await api.post(`/events/${event.id}/cancel_registration/`);
      setUserRegistration(null);
      setShowCancelConfirm(false);
      alert('Registration cancelled successfully! Your spot has been freed for others.');
      // Optionally refresh the page or update event data
      window.location.reload();
    } catch (error: any) {
      console.error('Error cancelling registration:', error);
      alert(error.response?.data?.error || 'Failed to cancel registration. Please try again.');
    } finally {
      setCancellingRegistration(false);
    }
  };
  
  if (!isOpen || !event) return null;

  const eventType = event.tags && event.tags.length > 0 ? event.tags[0].toLowerCase() : 'default';
  const colors = eventTypeColors[eventType] || eventTypeColors.default;
  
  const isPastEvent = new Date(event.start_date) < new Date();
  
  // Debug rendering
  console.log('🎨 Rendering modal:', {
    eventId: event.id,
    has_custom_form: event.has_custom_form,
    loadingRegistration,
    userRegistration,
    userRegistrationStatus: userRegistration?.status
  });
  
  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: event.description,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  const handleGetDirections = () => {
    if (event.lat && event.lon) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lon}`, '_blank');
    } else {
      const query = encodeURIComponent(`${event.location_name || event.title}, ${event.city || 'Malaysia'}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };
  
  const handleAddToCalendar = () => {
    const startDate = new Date(event.start_date).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = event.end_date 
      ? new Date(event.end_date).toISOString().replace(/-|:|\.\d\d\d/g, '')
      : new Date(new Date(event.start_date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location_name || '')}`;
    window.open(calUrl, '_blank');
  };
  
  const attendanceRate = event.actual_attendance && event.expected_attendance
    ? ((event.actual_attendance / event.expected_attendance) * 100).toFixed(0)
    : null;

  return (
    <>
      {/* Main Event Details Modal - Rendered as Portal */}
      {createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50
          }}
          onClick={onClose}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Content */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {/* Compact Hero Section */}
              <div 
                ref={imageRef}
                className={`relative h-48 overflow-hidden ${!event.image_url ? `bg-gradient-to-br ${colors.gradient}` : 'bg-gray-900'}`}
              >
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add(`bg-gradient-to-br`, colors.gradient);
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${colors.badge} border text-xs`}>
                <span className="mr-1">{colors.icon}</span>
                {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
              </Badge>
              {event.tags.slice(1, 3).map((tag, idx) => (
                <Badge key={idx} className="bg-white/20 text-white border-white/40 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="text-2xl font-bold mb-1">{event.title}</h2>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(event.start_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{event.location_name || 'TBA'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-b border-gray-200 flex gap-2">
          <button
            onClick={handleAddToCalendar}
            className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </button>
          <button
            onClick={handleGetDirections}
            className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Directions
          </button>
          <button
            onClick={handleShare}
            className="py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Grid - Side by side layout */}
        <div className="grid grid-cols-2 gap-4 px-4 py-4">
          {/* Left Column - Event Info */}
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-600">
                  {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-gray-600 mt-1">Start Date</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-600">
                  {isPastEvent && event.actual_attendance 
                    ? event.actual_attendance.toLocaleString()
                    : event.expected_attendance 
                    ? event.expected_attendance.toLocaleString()
                    : 'TBA'
                  }
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {isPastEvent ? 'Attendees' : 'Expected'}
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">About This Event</h3>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-6">{event.description || 'No description available.'}</p>
            </div>
          </div>

          {/* Right Column - Location Map */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Event Location</h3>
            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
              {event.lat && event.lon ? (
                <iframe
                  title="Event Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${event.lat},${event.lon}&zoom=15`}
                  allowFullScreen
                ></iframe>
              ) : (
                <iframe
                  title="Event Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${event.location_name}, ${event.city || 'Malaysia'}`)}&zoom=15`}
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>

        {/* ✨ Registration Form Section */}
        {event.has_custom_form && (
          <div ref={registrationRef} className="px-6 py-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-t-4 border-blue-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              Event Registration
            </h3>
            
            {/* ✨ Show registration status if user is registered */}
            {loadingRegistration ? (
              <div className="text-gray-600 mb-6 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Checking your registration status...
              </div>
            ) : userRegistration && userRegistration.status === 'confirmed' ? (
              <div className="mb-6">
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-green-900 mb-2">✅ You're Registered!</h4>
                      <p className="text-green-800 mb-3">
                        You're all set for this event. We'll see you there!
                      </p>
                      <div className="bg-white/50 rounded-lg p-3 text-sm text-green-900">
                        <div><strong>Name:</strong> {userRegistration.contact_name}</div>
                        <div><strong>Email:</strong> {userRegistration.contact_email}</div>
                        <div><strong>Registered:</strong> {new Date(userRegistration.registered_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Cancel Registration Button */}
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full bg-white border-2 border-red-500 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel My Registration
                </button>
                
                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCancelConfirm(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Cancel Registration?</h3>
                          <p className="text-sm text-gray-600">This action cannot be undone</p>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-900">
                          <strong>Are you sure?</strong> Your registration will be cancelled and your spot will be made available to others. You'll need to register again if you change your mind.
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={cancellingRegistration}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
                        >
                          Keep Registration
                        </button>
                        <button
                          onClick={handleCancelRegistration}
                          disabled={cancellingRegistration}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                        >
                          {cancellingRegistration ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5" />
                              Yes, Cancel It
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                {event.is_full 
                  ? 'This event is currently at full capacity.' 
                  : `Register now to secure your spot! ${event.spots_remaining ? `${event.spots_remaining} spots remaining.` : ''}`
                }
              </p>
            )}

            {!userRegistration && !event.is_full && (
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Users className="w-6 h-6" />
                Register for This Event
              </button>
            )}
            
            {!userRegistration && event.is_full && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700 font-medium">This event is at full capacity</p>
              </div>
            )}
          </div>
        )}

        {/* Event Details */}
        <div className="px-6 py-6 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Event Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Start Date & Time</div>
                <div className="text-sm text-gray-600">
                  {new Date(event.start_date).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            
            {event.end_date && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">End Date & Time</div>
                  <div className="text-sm text-gray-600">
                    {new Date(event.end_date).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Location</div>
                <div className="text-sm text-gray-600">
                  {event.location_name || 'To be announced'}, {event.city || 'Malaysia'}
                </div>
              </div>
            </div>
            
            {(event.expected_attendance || event.actual_attendance) && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Attendance</div>
                  <div className="text-sm text-gray-600">
                    {isPastEvent && event.actual_attendance && event.expected_attendance ? (
                      <>
                        Actual: {event.actual_attendance.toLocaleString()} / Expected: {event.expected_attendance.toLocaleString()}
                        {attendanceRate && (
                          <span className={`ml-2 font-medium ${
                            Number(attendanceRate) >= 100 ? 'text-green-600' :
                            Number(attendanceRate) >= 90 ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            ({attendanceRate}%)
                          </span>
                        )}
                      </>
                    ) : (
                      `Expected: ${event.expected_attendance?.toLocaleString() || 'TBA'}`
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        {(event.lat && event.lon) || event.location_name ? (
          <div className="px-6 py-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Location Map</h3>
            <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden">
              {event.lat && event.lon ? (
                <iframe
                  title="Event Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${event.lat},${event.lon}&zoom=15`}
                  allowFullScreen
                ></iframe>
              ) : (
                <iframe
                  title="Event Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${event.location_name}, ${event.city || 'Malaysia'}`)}&zoom=15`}
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        ) : null}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* ✨ Registration Form Popup Modal - Rendered as Portal */}
      {(() => {
        console.log('🚀 Portal check:', { showRegistrationModal, has_custom_form: event.has_custom_form });
        if (showRegistrationModal && event.has_custom_form) {
          console.log('🎭 Creating portal to document.body');
          return createPortal(
            <div 
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                zIndex: 99999
              }}
              onClick={() => {
                console.log('🚪 Closing modal');
                setShowRegistrationModal(false);
              }}
            >
              {console.log('✨ Portal content rendering!')}
              <div 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  maxWidth: '800px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{
                  position: 'sticky',
                  top: 0,
                  background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                  color: 'white',
                  padding: '24px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Event Registration</h2>
                    <p style={{ color: '#bfdbfe', fontSize: '14px' }}>{event.title}</p>
                  </div>
                  <button
                    onClick={() => setShowRegistrationModal(false)}
                    style={{
                      padding: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <X style={{ width: '24px', height: '24px' }} />
                  </button>
                </div>
                
                {/* Modal Content - Scrollable */}
                <div style={{
                  overflowY: 'auto',
                  flex: 1,
                  padding: '32px',
                  background: 'linear-gradient(to bottom, rgba(239, 246, 255, 0.3), white)'
                }}>
                  <DynamicRegistrationForm
                    eventId={event.id}
                    eventTitle={event.title}
                    onSuccess={(data) => {
                      setShowRegistrationModal(false);
                      // Show success and reload to show updated status
                      setTimeout(() => window.location.reload(), 1500);
                    }}
                    onClose={() => setShowRegistrationModal(false)}
                  />
                </div>
              </div>
            </div>,
            document.body
          );
        }
        return null;
      })()}
    </>
  );
}
