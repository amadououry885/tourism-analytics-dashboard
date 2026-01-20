import { Link } from 'react-router-dom';
import { MapPin, Star, MessageCircle, Clock, Tag } from 'lucide-react';

// --- Theme Constants (Consistent with EventCard) ---
const THEME = {
  primary: '#3b82f6',       // Blue 500
  secondary: '#06b6d4',     // Cyan 500
  success: '#10b981',       // Emerald
  danger: '#ef4444',        // Red
  warning: '#f59e0b',       // Amber
  textMain: '#1e293b',      // Slate 800
  textMuted: '#64748b',     // Slate 500
  bgCard: '#ffffff',
};

export interface Place {
  id: number;
  name: string;
  city?: string;
  category?: string;
  image_url?: string;
  rating?: number;
  posts?: number;
  is_open?: boolean;
  is_free?: boolean;
  description?: string;
}

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&h=400&fit=crop';
  
  return (
    <Link 
      to={`/places/${place.id}`}
      style={{
        display: 'block',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: THEME.bgCard,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        textDecoration: 'none',
        border: '1px solid rgba(226, 232, 240, 0.8)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.1)`;
        e.currentTarget.style.borderColor = THEME.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={place.image_url || defaultImage}
          alt={place.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1)'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        {/* Category Badge - Glassmorphism */}
        {place.category && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {place.category}
          </div>
        )}
        
        {/* Open/Closed Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: place.is_open ? THEME.success : THEME.danger,
          color: place.is_open ? '#064e3b' : '#ffffff', // Dark text on green, white on red
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Clock size={12} strokeWidth={3} />
          {place.is_open ? 'OPEN' : 'CLOSED'}
        </div>
        
        {/* Free Badge - Replaced Purple with Blue/Cyan */}
        {place.is_free && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: THEME.primary, // Blue
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
          }}>
            <Tag size={12} fill="white" />
            FREE ENTRY
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '800',
          color: THEME.textMain,
          marginBottom: '8px',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {place.name}
        </h3>
        
        {/* Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: THEME.textMuted,
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          <MapPin size={16} color={THEME.primary} />
          <span>{place.city || 'Kedah'}</span>
        </div>
        
        {/* Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
        }}>
          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Star size={16} fill={THEME.warning} color={THEME.warning} />
            <span style={{ fontWeight: '700', color: THEME.textMain, fontSize: '14px' }}>
              {place.rating?.toFixed(1) || 'New'}
            </span>
             <span style={{ color: '#cbd5e1' }}>•</span>
             {/* Posts/Reviews */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: THEME.textMuted,
                fontSize: '13px',
            }}>
                <span>{place.posts || 0} reviews</span>
            </div>
          </div>
          
           {/* Visual Link Indicator */}
           <div style={{
            color: THEME.primary,
            backgroundColor: '#eff6ff', // Light blue bg
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
           }}>
             <MapPin size={14} />
           </div>
        </div>
      </div>
    </Link>
  );
}