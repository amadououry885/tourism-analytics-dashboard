import { Link } from 'react-router-dom';
import { MapPin, Star, DollarSign, Clock, Flame } from 'lucide-react';

export interface Restaurant {
  id: number;
  name: string;
  city?: string;
  cuisine?: string;
  image_url?: string;
  rating?: number;
  reviews?: number;
  price_range?: string;
  is_open?: boolean;
  specialty?: string;
  is_halal?: boolean;
}

interface FoodCardProps {
  restaurant: Restaurant;
}

export function FoodCard({ restaurant }: FoodCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop';
  
  // Price range display
  const getPriceDisplay = (range?: string) => {
    if (!range) return '$$';
    const count = range.length;
    return Array(count).fill('$').join('');
  };

  return (
    <Link 
      to={`/food/${restaurant.id}`}
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
          src={restaurant.image_url || defaultImage}
          alt={restaurant.name}
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
        
        {/* Cuisine Badge */}
        {restaurant.cuisine && (
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
            {restaurant.cuisine}
          </div>
        )}
        
        {/* Open/Closed Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: restaurant.is_open ? '#10b981' : '#ef4444',
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
          {restaurant.is_open ? 'OPEN' : 'CLOSED'}
        </div>
        
        {/* Halal Badge */}
        {restaurant.is_halal && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
          }}>
            🕌 HALAL
          </div>
        )}
        
        {/* Price Range */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          backgroundColor: 'rgba(249, 115, 22, 0.9)',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
        }}>
          {getPriceDisplay(restaurant.price_range)}
        </div>
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
          {restaurant.name}
        </h3>
        
        {/* Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '14px',
          marginBottom: '8px',
        }}>
          <MapPin size={14} />
          <span>{restaurant.city || 'Kedah'}</span>
        </div>
        
        {/* Specialty */}
        {restaurant.specialty && (
          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            marginBottom: '12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {restaurant.specialty}
          </p>
        )}
        
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
              {restaurant.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          
          {/* Reviews */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#64748b',
            fontSize: '13px',
          }}>
            <span>{restaurant.reviews || 0} reviews</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
