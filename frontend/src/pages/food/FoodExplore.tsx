import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Search, Utensils, Star, DollarSign, Check, ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { FilterDropdown, SortDropdown } from '../../components/FilterDropdown';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import Pagination from '../../components/Pagination';

// --- Types ---
interface Restaurant {
  id: number;
  name: string;
  city: string;
  cuisine: string;
  image_url: string;
  rating: number;
  reviews: number;
  price_range: string;
  is_open: boolean;
  specialty: string;
  is_halal: boolean;
}

// --- Theme Constants ---
const THEME = {
  bg: '#0f172a',           // Slate 900
  bgCard: '#1e293b',       // Slate 800
  text: '#ffffff',         // White
  textSecondary: '#94a3b8', // Slate 400
  accent: '#2dd4bf',       // Teal 400
  highlight: '#fbef00',    // Yellow
  border: 'rgba(255, 255, 255, 0.1)',
};

const ITEMS_PER_PAGE = 9;

export default function FoodExplore() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [halalOnly, setHalalOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch Data Logic ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get('/vendors/?page_size=100');
        const data = response.data.results || response.data || [];
        
        const transformedRestaurants: Restaurant[] = data.map((vendor: any, index: number) => ({
          id: vendor.id || index + 1,
          name: vendor.name || `Restaurant ${index + 1}`,
          city: vendor.city || 'Kedah',
          cuisine: vendor.cuisines?.[0] || vendor.cuisine || 'Local',
          image_url: vendor.cover_image_url || vendor.logo_url || vendor.gallery_images?.[0],
          rating: vendor.rating_average || vendor.rating || 4.0,
          reviews: vendor.total_reviews || vendor.reviews || 0,
          price_range: vendor.price_range || '$$',
          is_open: vendor.is_open !== undefined ? vendor.is_open : true,
          specialty: vendor.description || vendor.cuisines?.join(', ') || 'Local cuisine',
          is_halal: vendor.is_halal !== undefined ? vendor.is_halal : true,
        }));
        
        setRestaurants(transformedRestaurants);
        setError(null);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants.');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // --- Derived Carousel Data (Top 5 Rated) ---
  const carouselSlides = useMemo(() => {
    if (restaurants.length === 0) return [];
    return [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 5);
  }, [restaurants]);

  // --- Carousel Auto-Play ---
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
  useEffect(() => setCurrentPage(1), [searchTerm, selectedCuisine, selectedPrice, halalOnly, sortBy]);

  const cuisines = useMemo(() => {
    const allCuisines: string[] = [];
    restaurants.forEach(r => {
      if (r.cuisine && typeof r.cuisine === 'string' && r.cuisine.length > 0) allCuisines.push(r.cuisine);
    });
    return ['All', ...Array.from(new Set(allCuisines)).sort()];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter(restaurant => {
        if (searchTerm && !restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedCuisine !== 'All' && restaurant.cuisine !== selectedCuisine) return false;
        if (selectedPrice !== 'All' && restaurant.price_range !== selectedPrice) return false;
        if (halalOnly && !restaurant.is_halal) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name': return a.name.localeCompare(b.name);
          case 'reviews': return (b.reviews || 0) - (a.reviews || 0);
          case 'rating': default: return (b.rating || 0) - (a.rating || 0);
        }
      });
  }, [restaurants, searchTerm, selectedCuisine, selectedPrice, halalOnly, sortBy]);

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRestaurants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRestaurants, currentPage]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, color: THEME.text, fontFamily: 'Poppins, sans-serif' }}>
      <SharedHeader />

      {/* --- INLINE STYLES FOR ANIMATIONS & SCROLLBARS --- */}
      <style>{`
        /* Hide scrollbar for clean horizontal scrolling */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Smooth transitions for pills */
        .filter-action-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .filter-action-btn:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-1px);
        }
        .filter-action-btn:active {
          transform: translateY(0);
        }
        
        /* Search Input Focus Glow */
        .search-container:focus-within {
          border-color: ${THEME.accent} !important;
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.25);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* --- HERO CAROUSEL SECTION --- */}
      {!loading && carouselSlides.length > 0 ? (
        <div style={{ position: 'relative', height: '600px', marginTop: '70px', overflow: 'hidden' }}>
          {carouselSlides.map((item, index) => (
            <div
              key={item.id}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <img 
                src={item.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600'} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 60%, rgba(15,23,42,0.1) 100%)'
              }} />
            </div>
          ))}

          {/* Hero Content */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '100%', maxWidth: '1200px', padding: '0 24px', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <span style={{ color: THEME.highlight, fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>
                Taste of Kedah
              </span>
              <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 'bold', lineHeight: '1.1', marginBottom: '24px', fontFamily: 'Playfair Display, serif' }}>
                {carouselSlides[currentSlide].name}
              </h1>
              <p style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '32px', lineHeight: '1.6' }}>
                {carouselSlides[currentSlide].specialty} • Experience the finest {carouselSlides[currentSlide].cuisine} cuisine in {carouselSlides[currentSlide].city}.
              </p>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => navigate(`/food/${carouselSlides[currentSlide].id}`)}
                  style={{
                    backgroundColor: THEME.accent, color: '#000', padding: '14px 32px', borderRadius: '50px',
                    fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  View Details <ArrowRight size={18} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                  <div style={{ backgroundColor: THEME.highlight, padding: '8px', borderRadius: '50%' }}>
                     <Star size={20} color="black" fill="black" />
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{carouselSlides[currentSlide].rating}</span>
                  <span style={{ color: THEME.textSecondary, fontSize: '14px' }}>({carouselSlides[currentSlide].reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'none', 
              '@media (min-width: 768px)': { display: 'block' } 
            }} className="md:block">
              <div style={{
                width: '350px', height: '350px', borderRadius: '50%', 
                border: `4px solid ${THEME.accent}`, padding: '8px',
                animation: 'spin 60s linear infinite'
              }}>
                 <img 
                  src={carouselSlides[currentSlide].image_url} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  alt="Dish"
                 />
              </div>
            </div>
          </div>

          <button onClick={prevSlide} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white' }}>
            <ChevronLeft size={28} />
          </button>
          <button onClick={nextSlide} style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white' }}>
            <ChevronRight size={28} />
          </button>
        </div>
      ) : (
        <div style={{ paddingTop: '150px', paddingBottom: '60px', textAlign: 'center', background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>Explore Food</h1>
          <p style={{ color: THEME.textSecondary }}>Loading culinary delights...</p>
        </div>
      )}


      {/* --- IMPROVED FILTERS BAR (UNIFIED CAPSULE) --- */}
      <div style={{
        position: 'sticky',
        top: '70px',
        zIndex: 40,
        marginBottom: '30px',
        padding: '10px 24px',
        marginTop: '-30px', // Pull up slightly to overlap hero if desired, or keep flat
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'rgba(30, 41, 59, 0.8)', // Slate 800 with opacity
          backdropFilter: 'blur(16px)',            // Heavy blur for glass effect
          borderRadius: '50px',                    // Fully rounded capsule
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '8px 12px',
          gap: '16px',
          flexWrap: 'wrap' 
        }}>

          {/* 1. SEARCH SECTION */}
          <div 
            className="search-container"
            style={{ 
              flex: '1 1 300px', 
              position: 'relative', 
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.6)', 
              borderRadius: '50px',
              border: '1px solid transparent', 
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ paddingLeft: '16px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <Search size={18} color={THEME.textSecondary} />
            </div>
            <input
              type="text"
              placeholder="Search food, restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', 
                padding: '12px 12px', 
                backgroundColor: 'transparent',
                border: 'none', 
                color: 'white', 
                outline: 'none', 
                fontSize: '14px'
              }}
            />
             {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'transparent', border: 'none', color: THEME.textSecondary, paddingRight: '16px', cursor: 'pointer' }}
                >
                  ✕
                </button>
             )}
          </div>

          {/* 2. VERTICAL DIVIDER (Desktop Only) */}
          <div style={{ 
            width: '1px', 
            height: '24px', 
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'none',
            '@media (min-width: 768px)': { display: 'block' }
          }} className="hidden md:block"></div>

          {/* 3. FILTERS ROW */}
          <div className="no-scrollbar" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            overflowX: 'auto',
            padding: '4px 0',
            flex: '0 0 auto',
            maxWidth: '100%' 
          }}>
            
            <FilterDropdown
              label="Cuisine"
              icon={<Utensils size={14} />}
              options={cuisines.map(c => ({ value: c, label: c, icon: '🍽️' }))}
              value={selectedCuisine}
              onChange={(val) => setSelectedCuisine(val as string)}
              accentColor={THEME.accent}
            />
            
            <FilterDropdown
              label="Price"
              icon={<DollarSign size={14} />}
              options={[{ value: 'All', label: 'All', icon: '' }, { value: '$', label: '$', icon: '' }, { value: '$$', label: '$$', icon: '' }, { value: '$$$', label: '$$$', icon: '' }]}
              value={selectedPrice}
              onChange={(val) => setSelectedPrice(val as string)}
              accentColor={THEME.accent}
            />

            {/* Styled Halal Button */}
            <button
              onClick={() => setHalalOnly(!halalOnly)}
              className="filter-action-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', 
                padding: '8px 16px', borderRadius: '50px',
                border: halalOnly ? `1px solid ${THEME.accent}` : `1px solid rgba(255,255,255,0.1)`,
                backgroundColor: halalOnly ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: halalOnly ? THEME.accent : THEME.textSecondary,
                cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: '500'
              }}
            >
              {halalOnly ? <Check size={14} strokeWidth={3} /> : null}
              Halal Only
            </button>

             {/* Styled Sort Dropdown */}
             <div style={{ paddingLeft: '8px' }}>
               <SortDropdown
                  options={[
                    { value: 'rating', label: 'Top Rated', icon: '⭐' },
                    { value: 'reviews', label: 'Popular', icon: '🔥' },
                    { value: 'name', label: 'Name (A-Z)', icon: 'abc' },
                  ]}
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  accentColor={THEME.highlight}
                />
             </div>
          </div>
        </div>
      </div>


      {/* --- MAIN GRID CONTENT --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
        {loading ? (
           <div style={{ color: THEME.accent, textAlign: 'center', padding: '60px' }}>Loading...</div>
        ) : filteredRestaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: THEME.textSecondary }}>
            <Utensils size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3>No restaurants found</h3>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {paginatedRestaurants.map((place) => (
                <div
                  key={place.id}
                  onClick={() => navigate(`/food/${place.id}`)}
                  style={{
                    backgroundColor: THEME.bgCard,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: `1px solid ${THEME.border}`,
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(0, 0, 0, 0.5)`;
                    e.currentTarget.style.borderColor = THEME.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = THEME.border;
                  }}
                >
                  {/* Card Image Area */}
                  <div style={{ height: '220px', position: 'relative' }}>
                    <img
                      src={place.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'}
                      alt={place.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '12px', color: THEME.highlight, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Star size={14} fill={THEME.highlight} /> {place.rating}
                    </div>
                    {place.is_halal && (
                      <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: THEME.accent, color: 'black', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                        HALAL
                      </div>
                    )}
                  </div>

                  {/* Card Content Area */}
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0, flex: 1 }}>{place.name}</h3>
                      <span style={{ color: THEME.accent, fontWeight: '600' }}>{place.price_range}</span>
                    </div>
                    
                    <p style={{ color: THEME.textSecondary, fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <MapPin size={14} /> {place.city} • {place.cuisine}
                    </p>

                    <div style={{ 
                      marginTop: '16px', 
                      paddingTop: '16px', 
                      borderTop: `1px solid ${THEME.border}`,
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                       <span style={{ fontSize: '14px', color: place.is_open ? '#4ade80' : '#f87171', fontWeight: '500' }}>
                         {place.is_open ? 'Open Now' : 'Closed'}
                       </span>
                       
                       <button style={{
                         backgroundColor: THEME.highlight,
                         color: 'black',
                         border: 'none',
                         padding: '8px 16px',
                         borderRadius: '8px',
                         fontSize: '13px',
                         fontWeight: '600',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '6px',
                         cursor: 'pointer'
                       }}>
                         Reserve <ArrowRight size={14} />
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
              totalItems={filteredRestaurants.length}
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