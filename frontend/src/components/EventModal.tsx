import { X, Calendar, MapPin, Users, Navigation, Share2, Clock, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { useRef, useLayoutEffect } from 'react';

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
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  scrollToRegistration?: boolean; // ✨ NEW: Auto-scroll to image when JOIN US clicked
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

export function EventModal({ event, isOpen, onClose, scrollToRegistration = false }: EventModalProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  
  // ✨ Auto-scroll to image when JOIN US is clicked
  useLayoutEffect(() => {
    if (isOpen && scrollToRegistration && imageRef.current) {
      // Immediate scroll before paint for instant effect
      setTimeout(() => {
        imageRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Add pulse animation to image
        imageRef.current?.classList.add('animate-pulse');
        setTimeout(() => {
          imageRef.current?.classList.remove('animate-pulse');
        }, 1500);
      }, 100);
    }
  }, [isOpen, scrollToRegistration]);
  
  if (!isOpen || !event) return null;

  const eventType = event.tags && event.tags.length > 0 ? event.tags[0].toLowerCase() : 'default';
  const colors = eventTypeColors[eventType] || eventTypeColors.default;
  
  const isPastEvent = new Date(event.start_date) < new Date();
  
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
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Section - ✨ Added ref for auto-scroll */}
        <div 
          ref={imageRef}
          className={`relative h-80 overflow-hidden ${!event.image_url ? `bg-gradient-to-br ${colors.gradient}` : 'bg-gray-900'}`}
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
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${colors.badge} border`}>
                <span className="mr-1">{colors.icon}</span>
                {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
              </Badge>
              {event.tags.slice(1).map((tag, idx) => (
                <Badge key={idx} className="bg-white/20 text-white border-white/40">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.start_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{event.location_name || 'TBA'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-b border-gray-200 flex gap-3">
          <button
            onClick={handleAddToCalendar}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Add to Calendar
          </button>
          <button
            onClick={handleGetDirections}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            Get Directions
          </button>
          <button
            onClick={handleShare}
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 px-6 py-6 border-b border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-gray-600 mt-1">Start Date</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {isPastEvent && event.actual_attendance 
                ? event.actual_attendance.toLocaleString()
                : event.expected_attendance 
                ? event.expected_attendance.toLocaleString()
                : 'TBA'
              }
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {isPastEvent ? 'Actual Attendees' : 'Expected Attendees'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {attendanceRate || 'N/A'}
              {attendanceRate && '%'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Attendance Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {event.city || 'Malaysia'}
            </div>
            <div className="text-sm text-gray-600 mt-1">City</div>
          </div>
        </div>

        {/* About Section */}
        <div className="px-6 py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About This Event</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {event.description || 'No description available.'}
          </p>
        </div>

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
  );
}
