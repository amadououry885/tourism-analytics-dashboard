import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, DollarSign } from 'lucide-react';

export interface Stay {
  id: number;
  name: string;
  district?: string;
  type?: string;
  image_url?: string;
  rating?: number;
  reviews?: number;
  price_per_night?: number;
  amenities?: string[];
  is_available?: boolean;
  landmark?: string;
}

interface StayCardProps {
  stay: Stay;
}

export function StayCard({ stay }: StayCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop';
  
  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'hotel': return '🏨';
      case 'apartment': return '🏢';
      case 'homestay': return '🏠';
      case 'resort': return '🏖️';
      case 'guest house': return '🏚️';
      default: return '🛏️';
    }
  };

  const hasAmenity = (amenity: string) => {
    return stay.amenities?.some(a => a.toLowerCase().includes(amenity.toLowerCase()));
  };

  return (
    <Link 
      to={`/stays/${stay.id}`}
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
          src={stay.image_url || defaultImage}
          alt={stay.name}
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
        
        {/* Type Badge */}
        {stay.type && (
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
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>{getTypeIcon(stay.type)}</span>
            {stay.type}
          </div>
        )}
        
        {/* Price Badge */}
        {stay.price_per_night && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
          }}>
            RM {stay.price_per_night}
            <span style={{ fontSize: '11px', fontWeight: '500', opacity: 0.9 }}>/night</span>
          </div>
        )}

        {/* Availability Badge */}
        {stay.is_available === false && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
          }}>
            FULLY BOOKED
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
          {stay.name}
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
          <span>{stay.district || 'Kedah'}</span>
          {stay.landmark && (
            <span style={{ color: '#94a3b8' }}>• {stay.landmark}</span>
          )}
        </div>
        
        {/* Amenities Icons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
        }}>
          {hasAmenity('wifi') && (
            <div style={{
              backgroundColor: '#eff6ff',
              color: '#3b82f6',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <Wifi size={12} />
              WiFi
            </div>
          )}
          {hasAmenity('parking') && (
            <div style={{
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <Car size={12} />
              Parking
            </div>
          )}
          {hasAmenity('pool') && (
            <div style={{
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
            }}>
              🏊 Pool
            </div>
          )}
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
              {stay.rating ? Number(stay.rating).toFixed(1) : 'New'}
            </span>
            {stay.reviews && (
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                ({stay.reviews} reviews)
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
