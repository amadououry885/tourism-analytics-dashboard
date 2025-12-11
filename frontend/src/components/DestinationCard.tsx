import React, { useState } from 'react';
import { MapPin, TrendingUp, Star, Share2, Heart, ExternalLink, Navigation, X } from 'lucide-react';

interface DestinationCardProps {
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
    trending?: number;  // Trending percentage from API
  };
  rank: number;
  isTrending?: boolean;
  isNew?: boolean;
  onViewDetails?: (destination: any) => void;
}

// Category color schemes
const categoryColors: Record<string, { gradient: string; icon: string }> = {
  'Beach': { gradient: 'from-blue-400 to-cyan-500', icon: '🏖️' },
  'City': { gradient: 'from-gray-400 to-slate-500', icon: '🏙️' },
  'Tourist Attraction / Landmark': { gradient: 'from-yellow-400 to-orange-500', icon: '🗿' },
  'Museum': { gradient: 'from-purple-400 to-indigo-500', icon: '🏛️' },
  'Park': { gradient: 'from-green-400 to-emerald-500', icon: '🌳' },
  'Temple': { gradient: 'from-amber-400 to-yellow-600', icon: '🛕' },
  'Shopping Mall': { gradient: 'from-pink-400 to-rose-500', icon: '🛍️' },
  'Restaurant': { gradient: 'from-red-400 to-orange-600', icon: '🍽️' },
  'Hotel': { gradient: 'from-indigo-400 to-blue-600', icon: '🏨' },
  'default': { gradient: 'from-gray-400 to-gray-600', icon: '📍' },
};

export function DestinationCard({ destination, rank, isTrending, isNew, onViewDetails }: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const categoryStyle = categoryColors[destination.category || 'default'] || categoryColors.default;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleGetDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (destination.latitude && destination.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.city)}`, '_blank');
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(destination);
    }
  };

  // Calculate engagement score (0-100)
  const engagementScore = Math.min(100, Math.round((destination.posts || 0) * 10));
  const sentimentScore = destination.rating || 4.5;

  return (
    <div
      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 sm:hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
        {destination.image_url ? (
          <img
            src={destination.image_url}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl md:text-6xl">
            {categoryStyle.icon}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${categoryStyle.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>

        {/* Rank Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${categoryStyle.gradient} flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base`}>
            {rank}
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2">
          {isTrending && (
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500 text-white rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
              🔥 <span className="hidden sm:inline">Trending</span>
            </div>
          )}
          {isNew && (
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
              ✨ <span className="hidden sm:inline">New</span>
            </div>
          )}
          {destination.is_free && (
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-500 text-white rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
              🎟️ <span className="hidden sm:inline">Free</span>
            </div>
          )}
          {!destination.is_free && destination.price && (
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500 text-white rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
              {destination.currency} {destination.price}
            </div>
          )}
        </div>

        {/* Quick Actions (Show on Hover) */}
        {isHovered && (
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 animate-fadeIn">
            <button
              onClick={handleFavorite}
              className={`p-1.5 sm:p-2 ${isFavorite ? 'bg-red-500' : 'bg-white/90'} backdrop-blur rounded-full hover:scale-110 transition-transform shadow-lg`}
              title="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-white fill-white' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur rounded-full hover:scale-110 transition-transform shadow-lg"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={handleGetDirections}
              className="p-2 bg-white/90 backdrop-blur rounded-full hover:scale-110 transition-transform shadow-lg"
              title="Get Directions"
            >
              <Navigation className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4">
        {/* Title & Category */}
        <div className="mb-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {destination.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
            <span className={`px-1.5 sm:px-2 py-0.5 bg-gradient-to-r ${categoryStyle.gradient} text-white text-[10px] sm:text-xs font-semibold rounded`}>
              {categoryStyle.icon} {destination.category || 'Place'}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {destination.city}
            </span>
          </div>
        </div>

        {/* Description Preview */}
        {destination.description && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
            {destination.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="bg-blue-50 rounded-lg p-1.5 sm:p-2">
            <div className="text-[10px] sm:text-xs text-gray-600">Posts</div>
            <div className="text-sm sm:text-lg font-bold text-blue-600">{destination.posts || 0}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-1.5 sm:p-2">
            <div className="text-[10px] sm:text-xs text-gray-600">Engagement</div>
            <div className="text-sm sm:text-lg font-bold text-purple-600">{destination.engagement || 0}</div>
          </div>
        </div>

        {/* Engagement Score Bar */}
        <div className="mb-2 sm:mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] sm:text-xs text-gray-600">Popularity</span>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{engagementScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className={`h-1.5 sm:h-2 rounded-full bg-gradient-to-r ${categoryStyle.gradient} transition-all duration-500`}
              style={{ width: `${engagementScore}%` }}
            ></div>
          </div>
        </div>

        {/* Sentiment Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${star <= sentimentScore ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs sm:text-sm text-gray-600 ml-1">{sentimentScore.toFixed(1)}</span>
          </div>
          
          {/* Trending Arrow */}
          <div className={`flex items-center gap-0.5 sm:gap-1 ${(destination.trending || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-semibold">
              {destination.trending !== undefined 
                ? `${destination.trending > 0 ? '+' : ''}${destination.trending.toFixed(1)}%`
                : '+12%'}
            </span>
          </div>
        </div>

        {/* View Details Button (Show on Hover or always on mobile) */}
        <button
          onClick={handleCardClick}
          className={`w-full mt-2 sm:mt-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-md text-xs sm:text-sm ${isHovered ? 'animate-fadeIn' : 'sm:hidden'}`}
        >
          View Details
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
