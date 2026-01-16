import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Wifi, Car, Phone, Mail, Navigation, Share2, Hotel, Users, Calendar, Check } from 'lucide-react';
import api from '../../services/api';

interface StayDetail {
  id: number;
  name: string;
  district?: string;
  type?: string;
  image_url?: string;
  gallery_images?: string[];
  rating?: number;
  reviews?: number;
  price_per_night?: number;
  amenities?: string[];
  is_available?: boolean;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  check_in?: string;
  check_out?: string;
  max_guests?: number;
  rooms?: number;
}

export default function StayDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stay, setStay] = useState<StayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchStay = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/stays/${id}/`);
        setStay(response.data);
      } catch (err) {
        console.error('Error fetching stay:', err);
        // Demo data
        setStay({
          id: parseInt(id || '1'),
          name: 'The Danna Langkawi',
          district: 'Langkawi',
          type: 'Resort',
          image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
          gallery_images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
          ],
          rating: 4.9,
          reviews: 520,
          price_per_night: 850,
          amenities: ['WiFi', 'Swimming Pool', 'Spa', 'Parking', 'Restaurant', 'Room Service', 'Air Conditioning', 'Beach Access'],
          is_available: true,
          description: 'Experience colonial elegance meets Malaysian hospitality at The Danna Langkawi. This award-winning luxury resort offers stunning views of the Andaman Sea, world-class dining, and impeccable service. Each room features handcrafted furnishings, marble bathrooms, and private balconies overlooking the turquoise waters.',
          address: 'Telaga Harbour Park, Pantai Kok, 07000 Langkawi, Kedah',
          phone: '+60 4-959 3288',
          email: 'reservations@thedanna.com',
          check_in: '3:00 PM',
          check_out: '12:00 PM',
          max_guests: 4,
          rooms: 125,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStay();
  }, [id]);

  const handleGetDirections = () => {
    if (!stay) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.name + ' ' + stay.district)}`, '_blank');
  };

  const handleShare = () => {
    if (!stay) return;
    if (navigator.share) {
      navigator.share({
        title: stay.name,
        text: `Check out ${stay.name} in ${stay.district}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'hotel': return '🏨';
      case 'apartment': return '🏢';
      case 'homestay': return '🏠';
      case 'resort': return '🏖️';
      default: return '🛏️';
    }
  };

  const allImages = stay?.gallery_images?.length ? stay.gallery_images : [stay?.image_url || ''];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(59, 130, 246, 0.3)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!stay) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <Hotel size={64} color="#475569" />
        <h2 style={{ color: '#e2e8f0', marginTop: '16px', fontSize: '24px' }}>Stay not found</h2>
        <Link
          to="/stays"
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Back to Stays
        </Link>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Hero Image with Gallery */}
      <div style={{
        position: 'relative',
        height: '50vh',
        minHeight: '400px',
        maxHeight: '500px',
      }}>
        <img
          src={allImages[currentImageIndex] || defaultImage}
          alt={stay.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.8) 70%, rgba(15, 23, 42, 1) 100%)',
        }} />

        {/* Back Button */}
        <button
          onClick={() => navigate('/stays')}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Image Gallery Dots */}
        {allImages.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
          }}>
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              />
            ))}
          </div>
        )}

        {/* Title Section */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '0 24px 32px',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <span style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {getTypeIcon(stay.type)} {stay.type}
              </span>
              {stay.is_available && (
                <span style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>
                  Available
                </span>
              )}
            </div>
            
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '12px',
            }}>
              {stay.name}
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              fontSize: '18px',
            }}>
              <MapPin size={20} />
              <span>{stay.district}, Kedah</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <Star size={24} color="#fbbf24" fill="#fbbf24" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fbbf24' }}>
              {stay.rating?.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{stay.reviews} reviews</div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>From</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>
              RM {stay.price_per_night}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>per night</div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <Users size={24} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#e2e8f0' }}>
              {stay.max_guests || 2}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Max guests</div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <Hotel size={24} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#e2e8f0' }}>
              {stay.rooms || 1}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Rooms</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '40px',
        }}>
          <button
            onClick={handleGetDirections}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 24px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Navigation size={20} />
            Get Directions
          </button>
          
          {stay.phone && (
            <a
              href={`tel:${stay.phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '14px',
                textDecoration: 'none',
              }}
            >
              <Phone size={20} />
            </a>
          )}
          
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              cursor: 'pointer',
            }}
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Description */}
        {stay.description && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
              About
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#cbd5e1' }}>
              {stay.description}
            </p>
          </div>
        )}

        {/* Amenities */}
        {stay.amenities && stay.amenities.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
              Amenities
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
            }}>
              {stay.amenities.map((amenity, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Check size={16} color="#10b981" />
                  <span style={{ color: '#e2e8f0', fontSize: '14px' }}>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
            Details
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stay.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Address</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{stay.address}</div>
                </div>
              </div>
            )}
            
            {(stay.check_in || stay.check_out) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Calendar size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Check-in / Check-out</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>
                    {stay.check_in || '2:00 PM'} / {stay.check_out || '12:00 PM'}
                  </div>
                </div>
              </div>
            )}
            
            {stay.phone && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Phone size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Phone</div>
                  <a href={`tel:${stay.phone}`} style={{ fontSize: '15px', color: '#3b82f6', textDecoration: 'none' }}>
                    {stay.phone}
                  </a>
                </div>
              </div>
            )}
            
            {stay.email && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Mail size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Email</div>
                  <a href={`mailto:${stay.email}`} style={{ fontSize: '15px', color: '#3b82f6', textDecoration: 'none' }}>
                    {stay.email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          © 2026 Kedah Tourism Analytics Dashboard
        </p>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
          School of Computing & Informatics, Albukhary International University
        </p>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
