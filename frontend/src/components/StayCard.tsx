import React from 'react';
import { Star, MapPin, Users, Wifi, Coffee, Car, ExternalLink, Mail, Phone, MessageCircle, TrendingUp, TrendingDown, Heart } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Stay } from '../types/stay';

interface StayCardProps {
  stay: Stay;
  onViewDetails?: (stay: Stay) => void;
}

export function StayCard({ stay, onViewDetails }: StayCardProps) {
  const isInternal = stay.is_internal;
  
  // Amenity icons mapping
  const amenityIcons: Record<string, React.ReactNode> = {
    'WiFi': <Wifi className="w-4 h-4" />,
    'Parking': <Car className="w-4 h-4" />,
    'Pool': <span className="text-sm">🏊</span>,
    'Breakfast': <Coffee className="w-4 h-4" />,
  };

  const handleContactEmail = () => {
    if (stay.contact_email) {
      window.location.href = `mailto:${stay.contact_email}?subject=Inquiry about ${stay.name}`;
    }
  };

  const handleContactPhone = () => {
    if (stay.contact_phone) {
      window.location.href = `tel:${stay.contact_phone}`;
    }
  };

  const handleContactWhatsApp = () => {
    if (stay.contact_whatsapp) {
      const message = encodeURIComponent(`Hi! I'm interested in booking ${stay.name}`);
      window.open(`https://wa.me/${stay.contact_whatsapp}?text=${message}`, '_blank');
    }
  };

  const handleBookingExternal = (url?: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
      isInternal ? 'border-green-200 hover:border-green-400' : 'border-blue-200 hover:border-blue-400'
    }`}>
      
      {/* Internal/External Badge */}
      <div className="absolute top-4 right-4 z-10">
        {isInternal ? (
          <Badge className="bg-green-600 text-white border-green-700 shadow-lg">
            ✓ Local Partner
          </Badge>
        ) : (
          <Badge className="bg-blue-600 text-white border-blue-700 shadow-lg">
            🌐 External Booking
          </Badge>
        )}
      </div>

      {/* Image or Gradient */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {stay.images && stay.images.length > 0 ? (
          <img 
            src={stay.images[0]} 
            alt={stay.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {stay.type === 'Hotel' ? '🏨' : stay.type === 'Apartment' ? '🏢' : stay.type === 'Guest House' ? '🏚️' : '🏠'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
            {stay.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{stay.district}</span>
            {stay.landmark && <span className="text-gray-400">• {stay.landmark}</span>}
          </div>
        </div>

        {/* Rating & Type */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {stay.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{stay.rating}</span>
              {stay.social_mentions && stay.social_mentions > 0 && (
                <span className="text-xs text-gray-500">({stay.social_mentions} mentions)</span>
              )}
            </div>
          )}
          <Badge className="bg-purple-100 text-purple-700 border-purple-300">
            {stay.type}
          </Badge>
          {stay.is_trending && (
            <Badge className={`${
              stay.trending_percentage && stay.trending_percentage > 0 
                ? 'bg-orange-100 text-orange-700 border-orange-300' 
                : 'bg-gray-100 text-gray-600 border-gray-300'
            }`}>
              {stay.trending_percentage && stay.trending_percentage > 0 ? (
                <>
                  🔥 +{stay.trending_percentage}%
                </>
              ) : (
                <>
                  📊 Trending
                </>
              )}
            </Badge>
          )}
        </div>

        {/* Social Metrics */}
        {(stay.social_engagement || stay.estimated_interest) && (
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
            {stay.estimated_interest && stay.estimated_interest > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{stay.estimated_interest.toLocaleString()} interested</span>
              </div>
            )}
            {stay.social_engagement && stay.social_engagement > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{stay.social_engagement.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Amenities */}
        {stay.amenities && stay.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {stay.amenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {amenityIcons[amenity] || <span>•</span>}
                <span>{amenity}</span>
              </div>
            ))}
            {stay.amenities.length > 4 && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                +{stay.amenities.length - 4} more
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-600">
              RM {typeof stay.priceNight === 'number' ? stay.priceNight : parseFloat(stay.priceNight)}
            </span>
            <span className="text-gray-500 text-sm">/ night</span>
          </div>
        </div>

        {/* Booking Options */}
        <div className="space-y-2">
          {isInternal ? (
            // Internal stay - show contact options
            <>
              <p className="text-sm text-gray-700 font-medium mb-2">📞 Contact Owner Directly:</p>
              <div className="grid grid-cols-3 gap-2">
                {stay.contact_email && (
                  <Button
                    onClick={handleContactEmail}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs hover:bg-green-50 hover:border-green-300"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </Button>
                )}
                {stay.contact_phone && (
                  <Button
                    onClick={handleContactPhone}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs hover:bg-green-50 hover:border-green-300"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </Button>
                )}
                {stay.contact_whatsapp && (
                  <Button
                    onClick={handleContactWhatsApp}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs bg-green-50 border-green-300 hover:bg-green-100"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </Button>
                )}
              </div>
              {!stay.contact_email && !stay.contact_phone && !stay.contact_whatsapp && (
                <p className="text-xs text-gray-500 italic">Contact information not available</p>
              )}
            </>
          ) : (
            // External stay - show booking platform buttons
            <>
              <p className="text-sm text-gray-700 font-medium mb-2">🌐 Book via Partner:</p>
              <div className="space-y-2">
                {stay.booking_com_url && (
                  <Button
                    onClick={() => handleBookingExternal(stay.booking_com_url)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Book on Booking.com
                  </Button>
                )}
                {stay.agoda_url && (
                  <Button
                    onClick={() => handleBookingExternal(stay.agoda_url)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Book on Agoda
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
