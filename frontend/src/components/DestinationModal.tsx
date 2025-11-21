import React from 'react';
import { X, MapPin, Star, Navigation, Share2, DollarSign, Users, TrendingUp } from 'lucide-react';

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
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DestinationModal({ destination, isOpen, onClose }: DestinationModalProps) {
  if (!isOpen || !destination) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header with Image */}
        <div className="relative h-80 bg-gradient-to-br from-blue-400 to-purple-500">
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
            <div className="w-full h-full flex items-center justify-center text-9xl">
              📍
            </div>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{destination.name}</h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{destination.city}</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                {destination.category}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleGetDirections}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{destination.posts || 0}</div>
              <div className="text-xs text-gray-600">Posts</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{destination.engagement || 0}</div>
              <div className="text-xs text-gray-600">Engagement</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{destination.rating?.toFixed(1) || '4.5'}</div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {destination.is_free ? 'Free' : `${destination.currency} ${destination.price}`}
              </div>
              <div className="text-xs text-gray-600">Entry</div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">About</h3>
            <p className="text-gray-700 leading-relaxed">
              {destination.description || 'No description available for this destination.'}
            </p>
          </div>

          {/* Map Preview */}
          {destination.latitude && destination.longitude && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Location</h3>
              <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                <iframe
                  src={`https://www.google.com/maps?q=${destination.latitude},${destination.longitude}&output=embed`}
                  width="100%"
                  height="100%"
                  className="rounded-lg"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          )}

          {/* Recent Posts Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Social Media Buzz</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              <p>Recent social media posts about {destination.name} will appear here.</p>
              <p className="text-sm mt-2">Feature coming soon! 🎉</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
