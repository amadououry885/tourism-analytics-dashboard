import { Link } from 'react-router-dom';
import { MapPin, Star, MessageCircle, Clock } from 'lucide-react';

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
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
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
            transition: 'transform 0.3s ease',
          }}
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
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            backdropFilter: 'blur(4px)',
          }}>
            {place.category}
          </div>
        )}
        
        {/* Open/Closed Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: place.is_open ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Clock size={12} />
          {place.is_open ? 'OPEN' : 'CLOSED'}
        </div>
        
        {/* Free Badge */}
        {place.is_free && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: '#8b5cf6',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
          }}>
            FREE ENTRY
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b',
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
          color: '#64748b',
          fontSize: '14px',
          marginBottom: '12px',
        }}>
          <MapPin size={14} />
          <span>{place.city || 'Kedah'}</span>
        </div>
        
        {/* Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #e2e8f0',
        }}>
          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <Star size={16} fill="#fbbf24" color="#fbbf24" />
            <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
              {place.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          
          {/* Posts/Reviews */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#64748b',
            fontSize: '13px',
          }}>
            <MessageCircle size={14} />
            <span>{place.posts || 0} posts</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
