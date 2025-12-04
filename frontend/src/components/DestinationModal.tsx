import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, MapPin, Star, Navigation, Share2, DollarSign, Users, TrendingUp,
  Globe, Phone, Mail, Clock, Calendar, Wifi, ParkingCircle, 
  Accessibility, Coffee, ExternalLink
} from 'lucide-react';

interface DestinationModalProps {
  destination: {
    id?: number;
    name: string;
    image_url?: string;
    posts?: number;
    engagement?: number;
    category?: string;
    city?: string;
    description?: string | null;
    is_free?: boolean;
    price?: number;
    currency?: string;
    latitude?: number;
    longitude?: number;
    rating?: number;
    // New fields
    wikipedia_url?: string;
    official_website?: string;
    tripadvisor_url?: string;
    google_maps_url?: string;
    contact_phone?: string;
    contact_email?: string;
    address?: string;
    opening_hours?: string;
    best_time_to_visit?: string;
    amenities?: {
      parking?: boolean;
      wifi?: boolean;
      wheelchair_accessible?: boolean;
      restaurant?: boolean;
      restroom?: boolean;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DestinationModal({ destination, isOpen, onClose }: DestinationModalProps) {
  if (!isOpen || !destination) return null;

  // DEBUG: Log the destination data
  console.log('DestinationModal - Full destination data:', destination);
  console.log('Wikipedia URL:', destination.wikipedia_url);
  console.log('Contact Phone:', destination.contact_phone);
  console.log('Amenities:', destination.amenities);

  const handleGetDirections = () => {
    if (destination.latitude && destination.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.city)}`, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination.name,
        text: `Check out ${destination.name} in ${destination.city}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return createPortal(
    <div 
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto'
      }}
      className="flex items-start justify-center p-4 py-8" 
      onClick={onClose}
    >
      <div 
        style={{ backgroundColor: 'white', maxWidth: '1100px' }}
        className="rounded-3xl shadow-2xl w-full my-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header with Image */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          {destination.image_url ? (
            <img
              src={destination.image_url}
              alt={destination.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              📍
            </div>
          )}
          
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg z-10"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>

          {/* Title & Category Badge */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">{destination.name}</h2>
                <div className="flex items-center gap-3 text-white/95">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{destination.city}</span>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 backdrop-blur-md rounded-full font-medium shadow-lg">
                    {destination.category}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Quick Stats - Colorful Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
              <Users className="w-8 h-8 mb-3 opacity-90" />
              <div className="text-3xl font-bold mb-1">{destination.posts || 0}</div>
              <div className="text-sm text-blue-100">Social Posts</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
              <TrendingUp className="w-8 h-8 mb-3 opacity-90" />
              <div className="text-3xl font-bold mb-1">{destination.engagement || 0}</div>
              <div className="text-sm text-purple-100">Engagement</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
              <Star className="w-8 h-8 mb-3 opacity-90" />
              <div className="text-3xl font-bold mb-1">{destination.rating?.toFixed(1) || '4.5'}</div>
              <div className="text-sm text-yellow-100">Rating</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
              <DollarSign className="w-8 h-8 mb-3 opacity-90" />
              <div className="text-2xl font-bold mb-1">
                {destination.is_free ? 'FREE' : `${destination.currency || 'MYR'} ${destination.price}`}
              </div>
              <div className="text-sm text-green-100">Entry Fee</div>
            </div>
          </div>

          {/* Action Buttons - Improved */}
          <div className="flex gap-3">
            <button
              onClick={handleGetDirections}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* External Resources - Redesigned */}
          {(destination.wikipedia_url || destination.official_website || destination.tripadvisor_url || destination.google_maps_url) && (
            <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600" />
                Explore More
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.wikipedia_url && (
                  <a
                    href={destination.wikipedia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-4 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700">Wikipedia</div>
                      <div className="text-xs text-gray-500">Educational info</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </a>
                )}
                {destination.official_website && (
                  <a
                    href={destination.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-4 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all border border-gray-200 hover:border-green-300 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-green-700">Official Site</div>
                      <div className="text-xs text-gray-500">Visit website</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
                  </a>
                )}
                {destination.tripadvisor_url && (
                  <a
                    href={destination.tripadvisor_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-4 bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 rounded-xl transition-all border border-gray-200 hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Star className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-amber-700">TripAdvisor</div>
                      <div className="text-xs text-gray-500">Reviews & ratings</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-amber-600 flex-shrink-0" />
                  </a>
                )}
                {destination.google_maps_url && (
                  <a
                    href={destination.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-4 bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all border border-gray-200 hover:border-red-300 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-red-700">Google Maps</div>
                      <div className="text-xs text-gray-500">View on map</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-red-600 flex-shrink-0" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Description - Redesigned */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📖</span>
              About This Place
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              {destination.description || 'Discover the beauty and history of this amazing destination. A must-visit place in Kedah that offers unforgettable experiences for tourists and locals alike.'}
            </p>
          </div>

          {/* Contact Information & Details - Redesigned */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Info */}
            {(destination.contact_phone || destination.contact_email || destination.address) && (
              <div className="bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 border-2 border-emerald-300 rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Phone className="w-6 h-6 text-blue-600" />
                  Contact Us
                </h3>
                <div className="space-y-4">
                  {destination.contact_phone && (
                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-500 mb-1">Phone Number</div>
                        <a href={`tel:${destination.contact_phone}`} className="text-gray-900 font-semibold hover:text-blue-600 transition-colors">
                          {destination.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {destination.contact_email && (
                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-500 mb-1">Email Address</div>
                        <a href={`mailto:${destination.contact_email}`} className="text-gray-900 font-semibold hover:text-purple-600 transition-colors break-all">
                          {destination.contact_email}
                        </a>
                      </div>
                    </div>
                  )}
                  {destination.address && (
                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
                        <p className="text-gray-900 font-medium">{destination.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hours & Best Time */}
            {(destination.opening_hours || destination.best_time_to_visit) && (
              <div className="bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                  Visitor Info
                </h3>
                <div className="space-y-4">
                  {destination.opening_hours && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-500 mb-2">Opening Hours</div>
                          <p className="text-gray-900 font-medium whitespace-pre-line leading-relaxed">{destination.opening_hours}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {destination.best_time_to_visit && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-500 mb-2">Best Time to Visit</div>
                          <p className="text-gray-900 font-medium">{destination.best_time_to_visit}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Amenities - Redesigned */}
          {destination.amenities && Object.keys(destination.amenities).length > 0 && (
            <div className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Facilities & Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {destination.amenities.parking && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ParkingCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Parking</span>
                  </div>
                )}
                {destination.amenities.wifi && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-purple-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Wifi className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Free WiFi</span>
                  </div>
                )}
                {destination.amenities.wheelchair_accessible && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-green-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Accessibility className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Accessible</span>
                  </div>
                )}
                {destination.amenities.restaurant && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-orange-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Coffee className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Dining</span>
                  </div>
                )}
                {destination.amenities.restroom && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                      🚻
                    </div>
                    <span className="font-semibold text-gray-900">Restrooms</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map Preview - Redesigned */}
          {destination.latitude && destination.longitude && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-red-600" />
                Find Us Here
              </h3>
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border-4 border-white">
                <iframe
                  src={`https://www.google.com/maps?q=${destination.latitude},${destination.longitude}&output=embed`}
                  width="100%"
                  height="320"
                  className="w-full"
                  loading="lazy"
                  style={{ border: 0 }}
                ></iframe>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Click the map to open in Google Maps</span>
              </div>
            </div>
          )}

          {/* Social Media Buzz - Redesigned */}
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📱</span>
              Social Media Buzz
            </h3>
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-purple-200">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-700 font-medium text-lg mb-2">Recent social media posts about {destination.name}</p>
              <p className="text-gray-500">Coming soon with live feeds from Instagram, Facebook & Twitter!</p>
              <div className="mt-6 flex justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-xl">📸</div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl">👥</div>
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl">🐦</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
