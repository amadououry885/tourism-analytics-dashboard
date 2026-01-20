// src/components/PlaceCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Tag } from 'lucide-react';

// --- Theme Constants ---
const THEME = {
  primary: '#1e3a8a',       // Deep Blue (Trip.com style)
  accent: '#f97316',        // Orange (Sofascore accent)
  success: '#10b981',       // Green
  danger: '#ef4444',        // Red
  textMain: '#0f172a',      // Slate 900
  textMuted: '#64748b',     // Slate 500
  bgCard: '#ffffff',
  bgHover: '#f8fafc',
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
        borderRadius: '16px', // Slightly less rounded for a cleaner look
        overflow: 'hidden',
        backgroundColor: THEME.bgCard,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', // Very subtle base shadow
        transition: 'all 0.3s ease-out', // Smooth ease-out
        cursor: 'pointer',
        textDecoration: 'none',
        border: '1px solid #e2e8f0',
        position: 'relative'
      }}
      // REDUCED HOVER EFFECTS HERE
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'; // Reduced from -6px
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'; // Soft gray shadow, no blue glow
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={place.image_url || defaultImage}
          alt={place.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          // REDUCED IMAGE ZOOM
          onMouseEnter={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.03)'} // Reduced from 1.05
          onMouseLeave={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.0)'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        {/* Category Badge */}
        {place.category && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: THEME.primary,
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '700',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {place.category}
          </div>
        )}
        
        {/* Open/Closed Status */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: place.is_open ? THEME.success : THEME.danger,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <Clock size={12} strokeWidth={3} />
          {place.is_open ? 'OPEN' : 'CLOSED'}
        </div>
        
        {/* Free Tag - Using Orange to pop */}
        {place.is_free && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: THEME.accent, // Orange
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
          }}>
            <Tag size={12} fill="white" />
            FREE
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: '17px',
          fontWeight: '700',
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
          gap: '6px',
          color: THEME.textMuted,
          fontSize: '13px',
          marginBottom: '16px',
        }}>
          <MapPin size={14} color={THEME.primary} />
          <span>{place.city || 'Kedah'}</span>
        </div>
        
        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#f1f5f9', marginBottom: '12px' }}></div>

        {/* Stats Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ 
              backgroundColor: '#fffbeb', // Light yellow bg
              padding: '2px 6px', 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: '700', color: '#b45309', fontSize: '13px' }}>
                {place.rating?.toFixed(1) || '4.5'}
              </span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>({place.posts || 12} reviews)</span>
          </div>
          
          <span style={{ 
            color: THEME.primary, 
            fontSize: '13px', 
            fontWeight: '600',
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px' 
          }}>
            Details →
          </span>
        </div>
      </div>
    </Link>
  );
}