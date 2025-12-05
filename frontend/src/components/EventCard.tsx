import { Calendar, MapPin, Users, Clock, TrendingUp, Navigation, Share2, Heart, Hotel, Utensils } from 'lucide-react';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// ✨ UPDATED: Extended Event interface with live status fields
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
  is_published?: boolean;
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

interface EventCardProps {
  event: Event;
  rank?: number;
  isHappeningNow?: boolean;
  isNew?: boolean;
  isFree?: boolean;
  price?: number;
  onViewDetails: (event: Event, scrollToRegistration?: boolean) => void; // ✨ NEW: Added scrollToRegistration param
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

export function EventCard({ event, rank, isHappeningNow, isNew, isFree, price, onViewDetails }: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const eventType = event.tags && event.tags.length > 0 ? event.tags[0].toLowerCase() : 'default';
  const colors = eventTypeColors[eventType] || eventTypeColors.default;
  
  // Calculate countdown
  const getCountdown = () => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const isPast = startDate < now;
    
    if (isPast) {
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return { text: `Ended ${diffDays} days ago`, isPast: true };
    }
    
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays === 0 && diffHours === 0) {
      return { text: 'Starting soon', isPast: false, urgent: true };
    }
    if (diffDays === 0) {
      return { text: `Starts in ${diffHours}h`, isPast: false, urgent: true };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', isPast: false };
    }
    return { text: `In ${diffDays} days`, isPast: false };
  };
  
  const countdown = getCountdown();
  
  // Calculate attendance rate for past events
  const getAttendanceRate = () => {
    if (event.actual_attendance && event.expected_attendance) {
      const rate = (event.actual_attendance / event.expected_attendance) * 100;
      return {
        percentage: Math.min(rate, 100),
        exceeded: rate > 100,
        met: rate >= 90 && rate <= 100,
        below: rate < 90
      };
    }
    return null;
  };
  
  const attendanceRate = getAttendanceRate();
  
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
  
  const handleGetDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${event.location_name || event.title}, ${event.city || 'Malaysia'}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };
  
  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Google Calendar format
    const startDate = new Date(event.start_date).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = event.end_date 
      ? new Date(event.end_date).toISOString().replace(/-|:|\.\d\d\d/g, '')
      : new Date(new Date(event.start_date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location_name || '')}`;
    window.open(calUrl, '_blank');
  };
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  const handleCardClick = () => {
    onViewDetails(event, false); // ✨ UPDATED: Normal click = no scroll
  };

  // ✨ NEW: Handle JOIN US button click
  const handleJoinUsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(event, true); // Scroll to registration section
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-2 animate-fadeIn"
    >
      {/* Hero Image or Gradient Background */}
      <div className={`relative h-48 overflow-hidden ${!event.image_url ? `bg-gradient-to-br ${colors.gradient}` : 'bg-gray-900'}`}>
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add(`bg-gradient-to-br`, colors.gradient);
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
        
        {/* Rank Badge */}
        {rank && (
          <div className={`absolute top-4 left-4 w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-lg">{rank}</span>
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* ✨ NEW: Recurring Event Badge */}
          {event.recurrence_type && (
            <Badge className="bg-purple-500/90 text-white border-purple-600 shadow-lg backdrop-blur-sm">
              🔄 Repeats {event.recurrence_type}
            </Badge>
          )}
          
          {/* ✨ NEW: Capacity Badge */}
          {event.max_capacity && (
            <Badge className={`${
              event.is_full 
                ? 'bg-red-500 text-white border-red-600 shadow-lg'
                : (event.spots_remaining !== undefined && event.spots_remaining !== null && event.spots_remaining < 10)
                ? 'bg-orange-500 text-white border-orange-600 shadow-lg animate-pulse'
                : event.user_registered
                ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                : 'bg-green-500/90 text-white border-green-600 shadow-lg backdrop-blur-sm'
            }`}>
              {event.is_full ? (
                <>🚫 FULL</>
              ) : event.user_registered ? (
                <>✓ Registered</>
              ) : (event.spots_remaining !== undefined && event.spots_remaining !== null && event.spots_remaining < 10) ? (
                <>⚠️ {event.spots_remaining} spots left!</>
              ) : (
                <>👥 {event.attendee_count || 0}/{event.max_capacity}</>
              )}
            </Badge>
          )}
          
          {isHappeningNow && (
            <Badge className="bg-red-500 text-white border-red-600 shadow-lg animate-pulse">
              ⚡ HAPPENING NOW
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-green-500 text-white border-green-600 shadow-lg">
              ✨ NEW
            </Badge>
          )}
          {isFree && (
            <Badge className="bg-blue-500 text-white border-blue-600 shadow-lg">
              🎟️ FREE ENTRY
            </Badge>
          )}
          {!isFree && price && (
            <Badge className="bg-yellow-500 text-white border-yellow-600 shadow-lg">
              RM {price}
            </Badge>
          )}
        </div>
        
        {/* Quick Actions - Show on Hover */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full ${isFavorite ? 'bg-red-500' : 'bg-white'} shadow-lg hover:scale-110 transition-transform`}
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-white fill-white' : 'text-gray-700'}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            title="Share"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleGetDirections}
            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            title="Get Directions"
          >
            <Navigation className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Event Type Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={`${colors.badge} border`}>
            <span className="mr-1">{colors.icon}</span>
            {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
          </Badge>
          
          {/* Countdown */}
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            countdown.urgent ? 'bg-red-100 text-red-700' : 
            countdown.isPast ? 'bg-gray-100 text-gray-600' : 
            'bg-blue-100 text-blue-700'
          }`}>
            <Clock className="w-3 h-3 inline mr-1" />
            {countdown.text}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        {/* Location & City */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{event.location_name || 'TBA'}, {event.city || 'Malaysia'}</span>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Start Date</div>
            <div className="text-sm font-bold text-gray-900">
              {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">
              {countdown.isPast ? 'Attended' : 'Expected'}
            </div>
            <div className="text-sm font-bold text-gray-900">
              {countdown.isPast && event.actual_attendance 
                ? event.actual_attendance.toLocaleString()
                : event.expected_attendance 
                ? event.expected_attendance.toLocaleString()
                : 'TBA'
              }
            </div>
          </div>
        </div>

        {/* Attendance Progress Bar (for past events) */}
        {attendanceRate && countdown.isPast && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Attendance Rate</span>
              <span className={`text-xs font-bold ${
                attendanceRate.exceeded ? 'text-green-600' : 
                attendanceRate.met ? 'text-blue-600' : 
                'text-orange-600'
              }`}>
                {attendanceRate.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  attendanceRate.exceeded ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                  attendanceRate.met ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                  'bg-gradient-to-r from-orange-400 to-orange-600'
                }`}
                style={{ width: `${Math.min(attendanceRate.percentage, 100)}%` }}
              ></div>
            </div>
            {attendanceRate.exceeded && (
              <div className="text-xs text-green-600 mt-1 font-medium">
                🎯 Exceeded expectations!
              </div>
            )}
          </div>
        )}

        {/* ✨ NEW: JOIN US Button - White Card Style with Maximum Visibility */}
        {event.max_capacity && !countdown.isPast && !event.is_full && (
          <div 
            onClick={handleJoinUsClick}
            className="mb-4 bg-white rounded-xl shadow-lg border-2 border-green-500 p-4 hover:border-green-600 hover:shadow-xl transition-all duration-300 cursor-pointer group/join"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md group-hover/join:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-green-700 text-lg">JOIN US</div>
                  <div className="text-xs text-gray-600">
                    {event.spots_remaining || event.max_capacity} spots available
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {event.attendee_count || 0}
                </div>
                <div className="text-xs text-gray-500">
                  of {event.max_capacity?.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${((event.attendee_count || 0) / (event.max_capacity || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* ✨ NEW: Nearby Restaurants & Hotels Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Link
            to={`/?tab=restaurants&city=${event.city?.toLowerCase().replace(/\s+/g, '-') || 'all'}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Utensils className="w-4 h-4" />
            <span className="text-sm">Nearby Restaurants</span>
          </Link>
          
          <Link
            to={`/?tab=accommodation&city=${event.city?.toLowerCase().replace(/\s+/g, '-') || 'all'}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Hotel className="w-4 h-4" />
            <span className="text-sm">Nearby Hotels</span>
          </Link>
        </div>

        {/* View Details Button - Show on Hover */}
        <button 
          className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:from-blue-600 hover:to-purple-600"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}
