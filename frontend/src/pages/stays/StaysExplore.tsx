import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Hotel, Star, MapPin, Wifi, Coffee, Car, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { FilterDropdown, SortDropdown } from '../../components/FilterDropdown';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import Pagination from '../../components/Pagination';

// --- Types ---
interface Stay {
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

// --- Theme Constants ---
const THEME = {
  bg: '#0f172a',           // Slate 900
  bgCard: '#1e293b',       // Slate 800
  text: '#ffffff',
  textSecondary: '#94a3b8',
  accent: '#2dd4bf',       // Teal
  highlight: '#fbef00',    // Yellow
  border: 'rgba(255, 255, 255, 0.1)',
};

const ITEMS_PER_PAGE = 9;

// --- Filter Options ---
const STAY_TYPES = [
  { value: 'All', label: 'All Types', icon: '🏨' },
  { value: 'Hotel', label: 'Hotel', icon: '🏨' },
  { value: 'Resort', label: 'Resort', icon: '🏖️' },
  { value: 'Apartment', label: 'Apartment', icon: '🏢' },
  { value: 'Homestay', label: 'Homestay', icon: '🏠' },
];

const DISTRICTS = [
  { value: 'All', label: 'All Districts', icon: '📍' },
  { value: 'Langkawi', label: 'Langkawi', icon: '🏝️' },
  { value: 'Alor Setar', label: 'Alor Setar', icon: '🏙️' },
  { value: 'Sungai Petani', label: 'Sungai Petani', icon: '🌆' },
];

export default function StaysExplore() {
  const navigate = useNavigate();
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name'>('rating');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchStays = async () => {
      try {
        setLoading(true);
        // Try hybrid search first, fall back to standard list
        let data: any[] = [];
        try {
          const response = await api.get('/stays/hybrid_search/');
          data = response.data.results || response.data || [];
        } catch {
          const response = await api.get('/stays/');
          data = response.data.results || response.data || [];
        }
        
        if (data.length > 0) {
          const transformedStays: Stay[] = data.map((stay: any) => ({
            id: stay.id,
            name: stay.name,
            district: stay.district || stay.city || 'Kedah',
            type: stay.type || stay.stay_type || 'Hotel',
            image_url: stay.image_url || stay.main_image || stay.main_image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
            rating: stay.rating || stay.average_rating || 4.5,
            reviews: stay.reviews || stay.review_count || 0,
            price_per_night: stay.priceNight || stay.price_per_night || stay.price || 250,
            amenities: stay.amenities || ['WiFi', 'Parking'],
            is_available: stay.is_available !== undefined ? stay.is_available : true,
            landmark: stay.landmark,
          }));
          setStays(transformedStays);
        } else {
            // Fallback for demo if API returns empty
           setStays([
            { id: 1, name: 'The Danna Langkawi', district: 'Langkawi', type: 'Resort', rating: 4.9, reviews: 520, price_per_night: 850, amenities: ['Pool', 'Spa', 'Gym'], is_available: true, image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600' },
            { id: 2, name: 'Four Seasons Resort', district: 'Langkawi', type: 'Resort', rating: 4.8, reviews: 380, price_per_night: 1200, amenities: ['Beach', 'Dining'], is_available: true, image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600' },
            { id: 3, name: 'Grand Alora Hotel', district: 'Alor Setar', type: 'Hotel', rating: 4.3, reviews: 240, price_per_night: 180, amenities: ['WiFi', 'City View'], is_available: true, image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600' },
           ]);
        }
      } catch (err) {
        console.error('Error fetching stays:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStays();
  }, []);

  // --- Carousel Logic (Top 5 Premium Stays) ---
  const carouselSlides = useMemo(() => {
    if (stays.length === 0) return [];
    // Sort by price descending to show "Luxury" options in hero
    return [...stays].sort((a, b) => b.price_per_night - a.price_per_night).slice(0, 5);
  }, [stays]);

  useEffect(() => {
    if (carouselSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);

  // --- Filtering Logic ---
  const filteredStays = useMemo(() => {
    return stays
      .filter(stay => {
        if (searchTerm && !stay.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedType !== 'All' && stay.type !== selectedType) return false;
        if (selectedDistrict !== 'All' && stay.district !== selectedDistrict) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name': return a.name.localeCompare(b.name);
          case 'price': return a.price_per_night - b.price_per_night;
          case 'rating': default: return b.rating - a.rating;
        }
      });
  }, [stays, searchTerm, selectedType, selectedDistrict, sortBy]);

  // Pagination Logic
  useEffect(() => setCurrentPage(1), [searchTerm, selectedType, selectedDistrict, sortBy]);
  const totalPages = Math.ceil(filteredStays.length / ITEMS_PER_PAGE);
  const paginatedStays = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStays.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStays, currentPage]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, color: THEME.text, fontFamily: 'Poppins, sans-serif' }}>
      <SharedHeader />
      
      <style>{`
        .glass-panel {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }
        .text-shadow { text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
      `}</style>

      {/* --- HERO CAROUSEL SECTION --- */}
      {!loading && carouselSlides.length > 0 ? (
        <div style={{ position: 'relative', height: '650px', marginTop: '70px', overflow: 'hidden' }}>
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              {/* Image */}
              <img 
                src={slide.image_url} 
                alt={slide.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Overlay Gradient */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to top, #0f172a 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.1) 100%)'
              }} />
            </div>
          ))}

          {/* Hero Content - Centered Style like Reference Image 3 */}
          <div style={{
            position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center', zIndex: 10, width: '100%', padding: '0 24px'
          }}>
            <span style={{ 
              backgroundColor: THEME.accent, color: '#000', padding: '6px 16px', borderRadius: '20px', 
              fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', display: 'inline-block' 
            }}>
              Featured Stay
            </span>
            <h1 className="text-shadow" style={{ 
              fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '300', color: 'white', marginBottom: '16px', fontFamily: 'Playfair Display, serif' 
            }}>
              {carouselSlides[currentSlide].name}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'center', marginBottom: '32px', color: '#e2e8f0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} color={THEME.highlight} /> {carouselSlides[currentSlide].district}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={18} fill={THEME.highlight} color={THEME.highlight} /> {carouselSlides[currentSlide].rating}</span>
              <span style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>RM {carouselSlides[currentSlide].price_per_night} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>/ night</span></span>
            </div>
            
            <button 
              onClick={() => navigate(`/stays/${carouselSlides[currentSlide].id}`)}
              style={{
                backgroundColor: 'white', color: 'black', padding: '14px 40px', borderRadius: '50px',
                fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Book Now
            </button>
          </div>

          {/* Controls */}
          <button onClick={prevSlide} style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white' }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white' }}>
            <ChevronRight size={24} />
          </button>
        </div>
      ) : (
        <div style={{ height: '300px', marginTop: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ color: THEME.accent }}>Loading Stays...</div>
        </div>
      )}

      {/* --- FILTER BAR --- */}
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${THEME.border}`,
        position: 'sticky',
        top: '70px',
        zIndex: 40,
        padding: '20px 0',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: THEME.textSecondary, width: '18px' }} />
            <input
              type="text"
              placeholder="Search hotels, resorts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px',
                border: `1px solid ${THEME.border}`, backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <FilterDropdown
              label="District"
              icon={<MapPin size={16} />}
              options={DISTRICTS}
              value={selectedDistrict}
              onChange={(val) => setSelectedDistrict(val as string)}
              accentColor={THEME.accent}
            />
            <FilterDropdown
              label="Type"
              icon={<Hotel size={16} />}
              options={STAY_TYPES}
              value={selectedType}
              onChange={(val) => setSelectedType(val as string)}
              accentColor={THEME.accent}
            />
            <SortDropdown
              options={[
                { value: 'rating', label: 'Top Rated', icon: '⭐' },
                { value: 'price', label: 'Price (Low to High)', icon: '💰' },
              ]}
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              accentColor={THEME.accent}
            />
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : filteredStays.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: THEME.textSecondary }}>
            <Hotel size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3>No stays found</h3>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
              {paginatedStays.map((stay) => (
                <div
                  key={stay.id}
                  onClick={() => navigate(`/stays/${stay.id}`)}
                  style={{
                    backgroundColor: THEME.bgCard,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `1px solid ${THEME.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5)';
                    e.currentTarget.style.borderColor = THEME.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = THEME.border;
                  }}
                >
                  {/* Card Image Area */}
                  <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={stay.image_url}
                      alt={stay.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{
                      position: 'absolute', top: '16px', right: '16px',
                      backgroundColor: 'white', color: 'black',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Star size={12} fill="black" /> {stay.rating}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '8px', color: THEME.accent, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      {stay.type} • {stay.district}
                    </div>
                    
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px', lineHeight: '1.4' }}>
                      {stay.name}
                    </h3>
                    
                    {/* Amenities Icons (Mini) */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', color: THEME.textSecondary }}>
                      <Wifi size={16} />
                      <Coffee size={16} />
                      <Car size={16} />
                      <span style={{ fontSize: '12px' }}>+ more</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                         <span style={{ fontSize: '12px', color: THEME.textSecondary }}>Start from</span>
                         <div style={{ fontSize: '18px', fontWeight: 'bold', color: THEME.highlight }}>RM {stay.price_per_night}</div>
                       </div>
                       
                       <button style={{
                         width: '36px', height: '36px', borderRadius: '50%',
                         backgroundColor: 'rgba(255,255,255,0.1)', border: 'none',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         color: 'white'
                       }}>
                         <ArrowRight size={18} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredStays.length}
              itemsPerPage={ITEMS_PER_PAGE}
              accentColor={THEME.accent}
            />
          </>
        )}
      </main>
      
      <SharedFooter />
    </div>
  );
}