import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, Car, ArrowRight, Search, Grid, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import api from '../../services/api';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import Pagination from '../../components/Pagination';

export interface Stay {
  id: number;
  name: string;
  district: string;
  type: string;
  image_url: string;
  rating: number;
  reviews: number;
  price_per_night: number;
  amenities: string[];
  is_available: boolean;
  landmark?: string;
}

const ITEMS_PER_PAGE = 9;

// --- Theme Constants (Light Mode) ---
const THEME = {
  bg: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#64748b',
  accent: '#1e3a8a',
  highlight: '#f97316',
  border: '#e2e8f0',
};

interface StayCardProps {
  stay: Stay;
}

export function StayCard({ stay }: StayCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

  return (
    <Link 
      to={`/stays/${stay.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0', // Light border
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Image Section */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
        <img
          src={stay.image_url || defaultImage}
          alt={stay.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.0)'}
        />
        
        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
          <span style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(4px)',
            color: '#1e3a8a', // Primary Blue
            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {stay.type}
          </span>
        </div>

        {/* Rating Badge */}
        <div style={{ 
          position: 'absolute', top: '12px', right: '12px',
          backgroundColor: '#ffffff', color: '#0f172a',
          padding: '4px 8px', borderRadius: '8px', 
          fontSize: '12px', fontWeight: '800', 
          display: 'flex', alignItems: 'center', gap: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Star size={12} fill="#f97316" color="#f97316" /> {stay.rating}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
          <MapPin size={14} color="#f97316" />
          {stay.district}
        </div>

        {/* Title */}
        <h3 style={{ 
          fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', lineHeight: '1.4',
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {stay.name}
        </h3>

        {/* Amenities Preview */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', color: '#94a3b8' }}>
          <Wifi size={16} />
          <Coffee size={16} />
          <Car size={16} />
          <span style={{ fontSize: '12px', alignSelf: 'center' }}>+ more</span>
        </div>

        {/* Footer: Price & Action */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Start from</span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#f97316' }}>
              RM {stay.price_per_night}
            </div>
          </div>
          
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: '#eff6ff', // Light blue bg
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1e3a8a',
            transition: 'background 0.2s'
          }}>
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Demo data for fallback
const demoStays: Stay[] = [
  { id: 1, name: 'The Westin Langkawi Resort & Spa', district: 'Langkawi', type: 'Resort', image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', rating: 4.8, reviews: 256, price_per_night: 450, amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant'], is_available: true },
  { id: 2, name: 'Four Seasons Resort Langkawi', district: 'Langkawi', type: 'Resort', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', rating: 4.9, reviews: 189, price_per_night: 680, amenities: ['Beach', 'Pool', 'Spa', 'Fine Dining'], is_available: true },
  { id: 3, name: 'Aloft Langkawi Pantai Tengah', district: 'Langkawi', type: 'Hotel', image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', rating: 4.5, reviews: 312, price_per_night: 280, amenities: ['Pool', 'WiFi', 'Bar', 'Gym'], is_available: true },
  { id: 4, name: 'Kampung House Homestay', district: 'Alor Setar', type: 'Homestay', image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', rating: 4.6, reviews: 78, price_per_night: 120, amenities: ['WiFi', 'Parking', 'Kitchen'], is_available: true },
  { id: 5, name: 'Meritus Pelangi Beach Resort', district: 'Langkawi', type: 'Resort', image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', rating: 4.7, reviews: 423, price_per_night: 350, amenities: ['Beach', 'Pool', 'Tennis', 'Kids Club'], is_available: true },
  { id: 6, name: 'Hotel Grand Continental', district: 'Alor Setar', type: 'Hotel', image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', rating: 4.2, reviews: 156, price_per_night: 180, amenities: ['WiFi', 'Restaurant', 'Meeting Rooms'], is_available: true },
];

export default function StaysExplore() {
  const navigate = useNavigate();
  const [stays, setStays] = useState<Stay[]>(demoStays);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price'>('popularity');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch Data Logic ---
  useEffect(() => {
    const fetchStays = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stays/?page_size=100');
        const data = response.data.results || response.data || [];
        
        if (data.length > 0) {
          const transformedStays: Stay[] = data.map((stay: any, index: number) => ({
            id: stay.id || index + 1,
            name: stay.name || `Stay ${index + 1}`,
            district: stay.district || stay.location || 'Kedah',
            type: stay.type || stay.stay_type || 'Hotel',
            image_url: stay.image_url || stay.image,
            rating: stay.rating || stay.avg_rating || 4.0,
            reviews: stay.reviews || stay.review_count || 0,
            price_per_night: stay.price_per_night || stay.price || 200,
            amenities: stay.amenities || ['WiFi', 'Parking'],
            is_available: stay.is_available !== undefined ? stay.is_available : true,
            landmark: stay.landmark,
          }));
          setStays(transformedStays);
        }
      } catch (err) {
        console.error('Error fetching stays:', err);
        // Keep demo data on error
      } finally {
        setLoading(false);
      }
    };
    fetchStays();
  }, []);

  // --- Carousel Logic ---
  const carouselSlides = useMemo(() => {
    if (stays.length === 0) return [];
    return stays.slice(0, 5); 
  }, [stays]);

  useEffect(() => {
    if (carouselSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);

  // --- Filtering Logic ---
  const stayTypes: string[] = useMemo(() => {
    const uniqueTypes = stays.map(s => s.type).filter(t => typeof t === 'string' && t.length > 0) as string[];
    return ['All', ...Array.from(new Set(uniqueTypes)).sort()];
  }, [stays]);

  const filteredStays = useMemo(() => {
    return stays
      .filter(stay => {
        if (searchTerm && !stay.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedType !== 'All' && stay.type !== selectedType) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price': return a.price_per_night - b.price_per_night;
          case 'rating': return (b.rating || 0) - (a.rating || 0);
          case 'popularity': default: return (b.reviews || 0) - (a.reviews || 0);
        }
      });
  }, [stays, searchTerm, selectedType, sortBy]);

  // Pagination Logic
  useEffect(() => setCurrentPage(1), [searchTerm, selectedType, sortBy]);
  const totalPages = Math.ceil(filteredStays.length / ITEMS_PER_PAGE);
  const paginatedStays = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStays.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStays, currentPage]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, color: THEME.text, fontFamily: 'Poppins, sans-serif' }}>
      <SharedHeader />

      <style>{`
        .glass-panel-dark {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* --- HERO CAROUSEL SECTION --- */}
      {!loading && carouselSlides.length > 0 && (
        <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
          {carouselSlides.map((stay, index) => (
            <div
              key={stay.id}
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <img 
                src={stay.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80'} 
                alt={stay.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to bottom, rgba(30,58,138,0.2), rgba(15,23,42,0.6))'
              }} />
            </div>
          ))}

          {/* Carousel Text Content */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', zIndex: 10, width: '90%', maxWidth: '800px'
          }}>
            <div className="glass-panel-dark" 
              onClick={() => navigate(`/stays/${carouselSlides[currentSlide].id}`)}
              style={{ padding: '40px', borderRadius: '24px', cursor: 'pointer' }}
            >
              <div style={{ 
                display: 'inline-block', backgroundColor: THEME.highlight, color: 'white',
                padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                Featured Accommodation
              </div>
              <h1 style={{ 
                fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '800', color: 'white', 
                marginBottom: '16px', lineHeight: '1.1', textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                {carouselSlides[currentSlide].name}
              </h1>
              <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: '#e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
                {carouselSlides[currentSlide].type} in {carouselSlides[currentSlide].district} · From RM {carouselSlides[currentSlide].price_per_night}/night
              </p>
            </div>
          </div>

          {/* Controls */}
          <button onClick={prevSlide} style={{
            position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 20,
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', 
            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white'
          }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} style={{
            position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 20,
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', 
            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white'
          }}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* --- FILTERS BAR --- */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${THEME.border}`, position: 'sticky', top: '70px', zIndex: 40,
        padding: '16px 24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: THEME.textSecondary, width: '18px', height: '18px' }} />
            <input
              type="text"
              placeholder="Search accommodations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 44px', borderRadius: '50px',
                border: `1px solid ${THEME.border}`, backgroundColor: '#f1f5f9',
                color: THEME.text, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = THEME.accent}
              onBlur={(e) => e.target.style.borderColor = THEME.border}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '10px 36px 10px 16px', borderRadius: '8px', backgroundColor: 'white',
                  border: `1px solid ${selectedType !== 'All' ? THEME.accent : THEME.border}`,
                  color: selectedType !== 'All' ? THEME.accent : THEME.text,
                  appearance: 'none', cursor: 'pointer', minWidth: '140px', fontWeight: '500'
                }}
              >
                {stayTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <Home size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: THEME.textSecondary }} />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popularity' | 'rating' | 'price')}
              style={{
                padding: '10px 16px', borderRadius: '8px', backgroundColor: 'white',
                border: `1px solid ${THEME.border}`, color: THEME.text,
                appearance: 'none', cursor: 'pointer', fontWeight: '500'
              }}
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: THEME.text }}>
            {filteredStays.length} Accommodations Found
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '18px', color: THEME.textSecondary }}>Loading stays...</div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px'
            }}>
              {paginatedStays.map((stay) => (
                <StayCard key={stay.id} stay={stay} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ marginTop: '40px' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </main>

      <SharedFooter />
    </div>
  );
}