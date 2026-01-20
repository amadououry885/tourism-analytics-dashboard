import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, Navigation, Share2, Phone, Mail, Globe, DollarSign, Utensils, Users, Calendar, Car, Wifi, Accessibility, Truck, ShoppingBag, CalendarCheck, Shirt, ExternalLink, Instagram, Facebook } from 'lucide-react';
import api from '../../services/api';
import { ReservationModal } from '../../components/ReservationModal';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  category?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
  is_halal?: boolean;
  spiciness_level?: number;
  image_url?: string;
}

interface OpeningHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface RestaurantDetail {
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
  description?: string;
  address?: string;
  opening_hours?: string;
  opening_hours_data?: OpeningHour[];
  phone?: string;
  email?: string;
  website?: string;
  is_halal?: boolean;
  // New fields from backend
  contact_phone?: string;
  contact_email?: string;
  official_website?: string;
  facebook_url?: string;
  instagram_url?: string;
  tripadvisor_url?: string;
  google_maps_url?: string;
  logo_url?: string;
  cover_image_url?: string;
  gallery_images?: string[];
  amenities?: {
    parking?: boolean;
    wifi?: boolean;
    wheelchair_accessible?: boolean;
    outdoor_seating?: boolean;
    air_conditioning?: boolean;
  };
  delivery_available?: boolean;
  takeaway_available?: boolean;
  reservation_required?: boolean;
  dress_code?: string;
  established_year?: number;
}

// Helper function to compute real-time open/closed status
function computeOpenStatus(openingHoursData?: OpeningHour[]): { isOpen: boolean; statusText: string } {
  if (!openingHoursData || openingHoursData.length === 0) {
    return { isOpen: true, statusText: 'OPEN' }; // Default to open if no hours data
  }

  const now = new Date();
  const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // Convert to 0=Monday format
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  // Find today's hours
  const todayHours = openingHoursData.find(h => h.day_of_week === currentDay);
  
  if (!todayHours || todayHours.is_closed) {
    // Find next opening day
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      const nextHours = openingHoursData.find(h => h.day_of_week === nextDay && !h.is_closed);
      if (nextHours) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return { isOpen: false, statusText: `CLOSED · Opens ${days[nextDay]}` };
      }
    }
    return { isOpen: false, statusText: 'CLOSED' };
  }

  // Parse opening and closing times
  const [openHour, openMin] = todayHours.open_time.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close_time.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  if (currentTime >= openTime && currentTime < closeTime) {
    // Currently open
    const closeFormatted = todayHours.close_time.slice(0, 5);
    return { isOpen: true, statusText: `OPEN · Closes ${closeFormatted}` };
  } else if (currentTime < openTime) {
    // Not yet open today
    const openFormatted = todayHours.open_time.slice(0, 5);
    return { isOpen: false, statusText: `CLOSED · Opens ${openFormatted}` };
  } else {
    // Already closed today, find next opening
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      const nextHours = openingHoursData.find(h => h.day_of_week === nextDay && !h.is_closed);
      if (nextHours) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const openFormatted = nextHours.open_time.slice(0, 5);
        return { isOpen: false, statusText: `CLOSED · Opens ${days[nextDay]} ${openFormatted}` };
      }
    }
    return { isOpen: false, statusText: 'CLOSED' };
  }
}

export default function FoodDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuCategory, setActiveMenuCategory] = useState('All');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [openStatus, setOpenStatus] = useState<{ isOpen: boolean; statusText: string }>({ isOpen: true, statusText: 'OPEN' });

  // Handle reservation button click - no sign-in required for tourists
  const handleMakeReservation = () => {
    setShowReservationModal(true);
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/vendors/${id}/`);
        const vendor = response.data;
        
        // Store opening hours data for real-time computation
        const openingHoursData = vendor.opening_hours_list || vendor.opening_hours_data || [];
        
        setRestaurant({
          id: vendor.id,
          name: vendor.name,
          city: vendor.city || 'Kedah',
          cuisine: vendor.cuisines?.[0] || vendor.cuisine || 'Local',
          image_url: vendor.cover_image_url || vendor.logo_url,
          rating: vendor.rating_average || 4.0,
          reviews: vendor.total_reviews || 0,
          price_range: vendor.price_range || '$$',
          is_open: vendor.is_open !== undefined ? vendor.is_open : true,
          specialty: vendor.cuisines?.join(', ') || 'Local cuisine',
          description: vendor.description,
          address: vendor.address,
          opening_hours: vendor.opening_hours,
          opening_hours_data: openingHoursData,
          phone: vendor.contact_phone || vendor.phone,
          email: vendor.contact_email || vendor.email,
          website: vendor.official_website || vendor.website,
          is_halal: vendor.is_halal,
          // New fields
          contact_phone: vendor.contact_phone,
          contact_email: vendor.contact_email,
          official_website: vendor.official_website,
          facebook_url: vendor.facebook_url,
          instagram_url: vendor.instagram_url,
          tripadvisor_url: vendor.tripadvisor_url,
          google_maps_url: vendor.google_maps_url,
          logo_url: vendor.logo_url,
          cover_image_url: vendor.cover_image_url,
          gallery_images: vendor.gallery_images,
          amenities: vendor.amenities,
          delivery_available: vendor.delivery_available,
          takeaway_available: vendor.takeaway_available,
          reservation_required: vendor.reservation_required,
          dress_code: vendor.dress_code,
          established_year: vendor.established_year,
        });

        // Compute real-time open/closed status from opening hours
        if (openingHoursData && openingHoursData.length > 0) {
          const status = computeOpenStatus(openingHoursData);
          setOpenStatus(status);
        } else {
          // Fallback to vendor's is_open field
          setOpenStatus({
            isOpen: vendor.is_open !== undefined ? vendor.is_open : true,
            statusText: vendor.is_open !== false ? 'OPEN' : 'CLOSED',
          });
        }

        // Fetch menu
        try {
          const menuResponse = await api.get(`/vendors/${id}/menu/`);
          setMenuItems(menuResponse.data || []);
        } catch {
          setMenuItems([]);
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        // Set demo data
        setRestaurant({
          id: parseInt(id || '1'),
          name: 'Nasi Kandar Pelita',
          city: 'Alor Setar',
          cuisine: 'Malaysian',
          image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
          rating: 4.6,
          reviews: 320,
          price_range: '$$',
          is_open: true,
          specialty: 'Famous Nasi Kandar with rich curries',
          description: 'Pelita Nasi Kandar is one of the most famous nasi kandar chains in Malaysia, known for its rich and flavorful curries. Our signature dishes include ayam goreng berempah, sotong goreng, and various curry options that have been perfected over generations.',
          address: 'Jalan Putra, 05100 Alor Setar, Kedah',
          opening_hours: '24 Hours',
          phone: '+60 4-123 4567',
          is_halal: true,
        });
        setMenuItems([
          { id: 1, name: 'Nasi Kandar Special', price: 'RM 12', category: 'Rice', is_available: true },
          { id: 2, name: 'Ayam Goreng Berempah', price: 'RM 8', category: 'Chicken', is_available: true },
          { id: 3, name: 'Sotong Goreng', price: 'RM 10', category: 'Seafood', is_available: true },
          { id: 4, name: 'Teh Tarik', price: 'RM 2.50', category: 'Drinks', is_available: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRestaurant();
  }, [id]);

  const handleGetDirections = () => {
    if (!restaurant) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.city)}`, '_blank');
  };

  const handleShare = () => {
    if (!restaurant) return;
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: `Check out ${restaurant.name} in ${restaurant.city}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const menuCategories = ['All', ...Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)))];
  const filteredMenu = activeMenuCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeMenuCategory);

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
          border: '4px solid rgba(249, 115, 22, 0.3)',
          borderTopColor: '#f97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!restaurant) {
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
        <Utensils size={64} color="#475569" />
        <h2 style={{ color: '#e2e8f0', marginTop: '16px', fontSize: '24px' }}>Restaurant not found</h2>
        <Link
          to="/food"
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            backgroundColor: '#f97316',
            color: '#ffffff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Back to Food
        </Link>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Hero Image */}
      <div style={{
        position: 'relative',
        height: '50vh',
        minHeight: '400px',
        maxHeight: '500px',
      }}>
        <img
          src={restaurant.image_url || defaultImage}
          alt={restaurant.name}
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
          onClick={() => navigate('/food')}
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

        {/* Badges */}
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          display: 'flex',
          gap: '12px',
        }}>
          <div style={{
            backgroundColor: openStatus.isOpen ? '#10b981' : '#ef4444',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Clock size={16} />
            {openStatus.statusText}
          </div>
          
          {restaurant.is_halal && (
            <div style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '700',
            }}>
              🕌 HALAL
            </div>
          )}
        </div>

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
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                color: '#f97316',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
              }}>
                {restaurant.cuisine}
              </span>
              <span style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
              }}>
                {restaurant.price_range}
              </span>
            </div>
            
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '12px',
            }}>
              {restaurant.name}
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              fontSize: '18px',
            }}>
              <MapPin size={20} />
              <span>{restaurant.city}, Malaysia</span>
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
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '40px',
        }}>
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <Star size={28} color="#fbbf24" fill="#fbbf24" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#fbbf24' }}>
              {restaurant.rating?.toFixed(1)}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Rating</div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <Users size={28} color="#3b82f6" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6' }}>
              {restaurant.reviews}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Reviews</div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <DollarSign size={28} color="#f97316" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f97316' }}>
              {restaurant.price_range}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Price Range</div>
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
              backgroundColor: '#f97316',
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
          
          <button
            onClick={handleMakeReservation}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 24px',
              backgroundColor: '#a855f7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Calendar size={20} />
            Make Reservation
          </button>
          
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
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
        {restaurant.description && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
              About
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#cbd5e1' }}>
              {restaurant.description}
            </p>
          </div>
        )}

        {/* Menu Section */}
        {menuItems.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
              Menu
            </h2>
            
            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {menuCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveMenuCategory(cat as string)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: activeMenuCategory === cat ? '#f97316' : 'rgba(255, 255, 255, 0.1)',
                    color: activeMenuCategory === cat ? '#ffffff' : '#94a3b8',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMenu.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  {/* Menu Item Image */}
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
                      {item.name}
                      {item.is_vegetarian && <span style={{ marginLeft: '8px' }}>🥬</span>}
                      {item.is_halal && <span style={{ marginLeft: '8px' }}>🕌</span>}
                    </h4>
                    {item.description && (
                      <p style={{ color: '#64748b', fontSize: '13px' }}>{item.description}</p>
                    )}
                  </div>
                  <span style={{ color: '#f97316', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                    {typeof item.price === 'number' ? `RM ${item.price.toFixed(2)}` : item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
            Details
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {restaurant.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Address</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{restaurant.address}</div>
                </div>
              </div>
            )}
            
            {restaurant.opening_hours && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Clock size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Opening Hours</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{restaurant.opening_hours}</div>
                </div>
              </div>
            )}
            
            {(restaurant.phone || restaurant.contact_phone) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Phone size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Phone</div>
                  <a href={`tel:${restaurant.contact_phone || restaurant.phone}`} style={{ fontSize: '15px', color: '#f97316', textDecoration: 'none' }}>
                    {restaurant.contact_phone || restaurant.phone}
                  </a>
                </div>
              </div>
            )}

            {(restaurant.email || restaurant.contact_email) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Mail size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Email</div>
                  <a href={`mailto:${restaurant.contact_email || restaurant.email}`} style={{ fontSize: '15px', color: '#f97316', textDecoration: 'none' }}>
                    {restaurant.contact_email || restaurant.email}
                  </a>
                </div>
              </div>
            )}

            {(restaurant.website || restaurant.official_website) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Globe size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Website</div>
                  <a href={restaurant.official_website || restaurant.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px', color: '#f97316', textDecoration: 'none' }}>
                    Visit Website
                  </a>
                </div>
              </div>
            )}

            {restaurant.dress_code && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Shirt size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Dress Code</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{restaurant.dress_code}</div>
                </div>
              </div>
            )}

            {restaurant.established_year && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Calendar size={20} color="#64748b" />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Established</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{restaurant.established_year}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        {(restaurant.delivery_available || restaurant.takeaway_available || restaurant.reservation_required !== undefined) && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
              Services
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {restaurant.delivery_available && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '10px',
                  color: '#22c55e',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  <Truck size={18} />
                  Delivery Available
                </div>
              )}
              {restaurant.takeaway_available && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  color: '#3b82f6',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  <ShoppingBag size={18} />
                  Takeaway Available
                </div>
              )}
              {restaurant.reservation_required && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '10px',
                  color: '#a855f7',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  <CalendarCheck size={18} />
                  Reservation Required
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amenities Section */}
        {restaurant.amenities && Object.values(restaurant.amenities).some(v => v) && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
              Amenities
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {restaurant.amenities.parking && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '10px', color: '#22c55e', fontSize: '14px', fontWeight: '500',
                }}>
                  <Car size={18} /> Parking
                </div>
              )}
              {restaurant.amenities.wifi && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px', color: '#3b82f6', fontSize: '14px', fontWeight: '500',
                }}>
                  <Wifi size={18} /> Free WiFi
                </div>
              )}
              {restaurant.amenities.wheelchair_accessible && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '10px', color: '#a855f7', fontSize: '14px', fontWeight: '500',
                }}>
                  <Accessibility size={18} /> Wheelchair Accessible
                </div>
              )}
              {restaurant.amenities.outdoor_seating && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)',
                  borderRadius: '10px', color: '#f97316', fontSize: '14px', fontWeight: '500',
                }}>
                  ☀️ Outdoor Seating
                </div>
              )}
              {restaurant.amenities.air_conditioning && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(45, 212, 191, 0.15)', border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '10px', color: '#2dd4bf', fontSize: '14px', fontWeight: '500',
                }}>
                  ❄️ Air Conditioning
                </div>
              )}
            </div>
          </div>
        )}

        {/* External Links */}
        {(restaurant.facebook_url || restaurant.instagram_url || restaurant.tripadvisor_url || restaurant.google_maps_url) && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
              Find Us Online
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {restaurant.facebook_url && (
                <a href={restaurant.facebook_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(59, 89, 152, 0.15)', border: '1px solid rgba(59, 89, 152, 0.3)',
                  borderRadius: '10px', color: '#3b5998', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                }}>
                  <Facebook size={18} /> Facebook
                </a>
              )}
              {restaurant.instagram_url && (
                <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(225, 48, 108, 0.15)', border: '1px solid rgba(225, 48, 108, 0.3)',
                  borderRadius: '10px', color: '#e1306c', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                }}>
                  <Instagram size={18} /> Instagram
                </a>
              )}
              {restaurant.tripadvisor_url && (
                <a href={restaurant.tripadvisor_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(0, 175, 135, 0.15)', border: '1px solid rgba(0, 175, 135, 0.3)',
                  borderRadius: '10px', color: '#00af87', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                }}>
                  <ExternalLink size={18} /> TripAdvisor
                </a>
              )}
              {restaurant.google_maps_url && (
                <a href={restaurant.google_maps_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  backgroundColor: 'rgba(66, 133, 244, 0.15)', border: '1px solid rgba(66, 133, 244, 0.3)',
                  borderRadius: '10px', color: '#4285f4', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                }}>
                  <MapPin size={18} /> Google Maps
                </a>
              )}
            </div>
          </div>
        )}
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

      {/* Reservation Modal */}
      {restaurant && (
        <ReservationModal
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          restaurant={{
            id: restaurant.id,
            name: restaurant.name,
            city: restaurant.city || 'Kedah',
          }}
        />
      )}
    </div>
  );
}
