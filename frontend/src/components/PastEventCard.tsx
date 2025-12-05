import { Calendar, MapPin, Users, Clock, TrendingUp, CheckCircle2, Award, Hotel, Utensils } from 'lucide-react';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// ✨ UPDATED: Event interface matching EventCard with live status fields
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

interface PastEventCardProps {
  event: Event;
  rank?: number;
  onViewDetails: (event: Event) => void;
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

export function PastEventCard({ event, rank, onViewDetails }: PastEventCardProps) {
  const [imageError, setImageError] = useState(false);

  const getEventTypeColors = () => {
    const eventType = event.tags?.[0]?.toLowerCase() || 'default';
    return eventTypeColors[eventType] || eventTypeColors.default;
  };

  const colors = getEventTypeColors();

  // Calculate attendance success rate
  const attendanceRate = event.actual_attendance && event.expected_attendance 
    ? (event.actual_attendance / event.expected_attendance) * 100 
    : null;

  const getAttendanceStatus = () => {
    if (!attendanceRate) return null;
    if (attendanceRate >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-700 border-green-300', icon: '🌟' };
    if (attendanceRate >= 70) return { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '👍' };
    if (attendanceRate >= 50) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '📊' };
    return { label: 'Low', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '📉' };
  };

  const attendanceStatus = getAttendanceStatus();

  // Calculate days since event
  const eventDate = new Date(event.start_date);
  const daysSince = Math.floor((new Date().getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div 
      onClick={() => onViewDetails(event)}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Past Event Badge - Top Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <Badge className="bg-gray-700 text-white border-gray-600 shadow-md flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Event Completed
        </Badge>
        
        {/* ✨ NEW: Recurring Event Badge for Past Events */}
        {event.recurrence_type && (
          <Badge className="bg-purple-500 text-white border-purple-600 shadow-md flex items-center gap-1">
            🔄 Repeats {event.recurrence_type}
          </Badge>
        )}
      </div>

      {/* Rank Badge - Top Right */}
      {rank && rank <= 3 && (
        <div className="absolute top-3 right-3 z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
            rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
            rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
            'bg-gradient-to-br from-orange-400 to-orange-600'
          }`}>
            #{rank}
          </div>
        </div>
      )}

      {/* Event Image with Grayscale Filter for Past Events */}
      <div className="relative h-56 overflow-hidden">
        {!imageError && event.image_url ? (
          <img 
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
            <Calendar className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Event Date Display */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-xs font-medium text-gray-600">
            {new Date(event.start_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Days Since Badge */}
        <div className="absolute bottom-3 right-3 bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
          <div className="text-xs font-medium text-white">
            {daysSince === 0 ? 'Today' : `${daysSince} days ago`}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Location */}
        {event.location_name && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="truncate">{event.location_name}</span>
            {event.city && <span className="text-gray-400">• {event.city}</span>}
          </div>
        )}

        {/* Attendance Stats */}
        {event.actual_attendance && event.expected_attendance && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-700 rounded-full flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Total Attendance</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {event.actual_attendance.toLocaleString()}
                  </div>
                </div>
              </div>
              {attendanceStatus && (
                <Badge className={`${attendanceStatus.color} border flex items-center gap-1`}>
                  <span>{attendanceStatus.icon}</span>
                  <span>{attendanceStatus.label}</span>
                </Badge>
              )}
            </div>
            
            {/* Attendance Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Expected: {event.expected_attendance.toLocaleString()}</span>
                <span className={attendanceRate && attendanceRate >= 100 ? 'text-green-600 font-bold' : 'text-gray-600'}>
                  {attendanceRate?.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    attendanceRate && attendanceRate >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    attendanceRate && attendanceRate >= 70 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                    attendanceRate && attendanceRate >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-orange-400 to-red-500'
                  }`}
                  style={{ width: `${Math.min(attendanceRate || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {event.tags?.map((tag, idx) => {
            const tagColors = eventTypeColors[tag.toLowerCase()] || eventTypeColors.default;
            return (
              <Badge key={idx} className={`${tagColors.badge} border`}>
                <span className="mr-1">{tagColors.icon}</span>
                {tag}
              </Badge>
            );
          })}
          
          {/* Recurring Event Badge */}
          {event.is_recurring_instance && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-300 border">
              🔄 Recurring
            </Badge>
          )}
        </div>

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

        {/* View Full Report Button */}
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={() => onViewDetails(event)}
            className="w-full py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 group"
          >
            <Award className="w-4 h-4" />
            View Event Report
            <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
