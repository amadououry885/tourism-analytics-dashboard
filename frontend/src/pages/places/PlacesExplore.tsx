import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, Star, Ticket, MapPin, ArrowRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import Pagination from '../../components/Pagination';

// --- Types ---
interface Place {
  id: number;
  name: string;
  city: string;
  category: string;
  image_url: string;
  rating: number;
  posts: number;
  is_open: boolean;
  is_free: boolean;
  description: string;
}

// --- Theme Constants ---
const THEME = {
  bg: '#374870ff',
  bgCard: '#093172ff',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  accent: '#2dd4bf',       // Teal
  highlight: '#fbef00',    // Yellow
  border: 'rgba(255, 255, 255, 0.1)',
};

const ITEMS_PER_PAGE = 9;

export default function PlacesExplore() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'name'>('popularity');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch Data Logic ---
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await api.get('/places/?page_size=100&public=true');
        const data = response.data.results || response.data || [];
        
        const transformedPlaces: Place[] = data.map((place: any, index: number) => ({
          id: place.id || index + 1,
          name: place.name || place.place_name || `Place ${index + 1}`,
          city: place.city || 'Kedah',
          category: place.category || 'Attraction',
          image_url: place.image_url || place.image,
          rating: place.rating || place.avg_rating || 4.0,
          posts: place.posts || place.total_posts || place.mentions || 0,
          is_open: place.is_open !== undefined ? place.is_open : true,
          is_free: place.is_free !== undefined ? place.is_free : false,
          description: place.description || `Discover the beauty of ${place.city || 'Kedah'}.`,
        }));
        
        setPlaces(transformedPlaces);
      } catch (err) {
        console.error('Error fetching places:', err);
        setError('Failed to load places.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // --- Carousel Data Derived from Places ---
  // We take the top 5 places to use as slides. 
  // If no places are loaded yet, we show a placeholder.
  const carouselSlides = useMemo(() => {
    if (places.length === 0) return [];
    return places.slice(0, 5); // Take the first 5 places
  }, [places]);

  // --- Carousel Auto-Play Logic ---
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
  const categories: string[] = useMemo(() => {
    const uniqueCats = places.map(p => p.category).filter(c => typeof c === 'string' && c.length > 0);
    return ['All', ...Array.from(new Set(uniqueCats)).sort()];
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return places
      .filter(place => {
        if (searchTerm && !place.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedCategory !== 'All' && place.category !== selectedCategory) return false;
        if (showFreeOnly && !place.is_free) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name': return a.name.localeCompare(b.name);
          case 'rating': return (b.rating || 0) - (a.rating || 0);
          case 'popularity': default: return (b.posts || 0) - (a.posts || 0);
        }
      });
  }, [places, searchTerm, selectedCategory, showFreeOnly, sortBy]);

  // Pagination Logic
  useEffect(() => setCurrentPage(1), [searchTerm, selectedCategory, showFreeOnly, sortBy]);
  const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
  const paginatedPlaces = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPlaces.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPlaces, currentPage]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, color: THEME.text, fontFamily: 'Poppins, sans-serif' }}>
      <SharedHeader />

      <style>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* --- HERO CAROUSEL SECTION --- */}
      {/* Only show carousel if we have data */}
      {!loading && carouselSlides.length > 0 && (
        <div style={{ position: 'relative', height: '500px', marginTop: '70px', overflow: 'hidden' }}>
          
          {carouselSlides.map((place, index) => (
            <div
              key={place.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <img 
                src={place.image_url || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600&q=80'} 
                alt={place.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.9))'
              }} />
            </div>
          ))}

          {/* Carousel Text Content */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 10,
            width: '90%',
            maxWidth: '800px'
          }}>
            <div className="glass-panel" 
              onClick={() => navigate(`/places/${carouselSlides[currentSlide].id}`)}
              style={{ padding: '40px', borderRadius: '24px', cursor: 'pointer' }}
            >
              <div style={{ 
                display: 'inline-block', 
                backgroundColor: THEME.highlight, 
                color: 'black',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '16px',
                textTransform: 'uppercase'
              }}>
                Featured Destination
              </div>
              <h1 style={{ 
                fontSize: 'clamp(32px, 5vw, 56px)', 
                fontWeight: 'bold', 
                color: 'white', 
                marginBottom: '16px',
                lineHeight: '1.2'
              }}>
                {carouselSlides[currentSlide].name}
              </h1>
              <p style={{ 
                fontSize: 'clamp(16px, 3vw, 20px)', 
                color: '#e2e8f0', 
                maxWidth: '600px', 
                margin: '0 auto',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {carouselSlides[currentSlide].description}
              </p>
              <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center', color: THEME.accent }}>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18}/> {carouselSlides[currentSlide].city}</span>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={18} fill={THEME.accent}/> {carouselSlides[currentSlide].rating}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <button onClick={prevSlide} style={{
            position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 20,
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white'
          }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} style={{
            position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 20,
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white'
          }}>
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 20 }}>
            {carouselSlides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentSlide(idx)}
                style={{
                  width: idx === currentSlide ? '32px' : '12px', height: '12px', borderRadius: '12px',
                  backgroundColor: idx === currentSlide ? THEME.highlight : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* --- FILTERS BAR --- */}
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${THEME.border}`,
        position: 'sticky',
        top: '70px',
        zIndex: 40,
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: THEME.textSecondary, width: '18px', height: '18px' }} />
            <input
              type="text"
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: '12px',
                border: `1px solid ${THEME.border}`,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '10px 32px 10px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedCategory !== 'All' ? THEME.accent : THEME.border}`,
                  color: selectedCategory !== 'All' ? THEME.accent : 'white',
                  appearance: 'none',
                  cursor: 'pointer',
                  minWidth: '140px'
                }}
              >
                {categories.map(c => <option key={c} value={c} style={{color: 'black'}}>{c}</option>)}
              </select>
              <Grid size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: THEME.textSecondary }} />
            </div>

            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: showFreeOnly ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                border: `1px solid ${showFreeOnly ? THEME.accent : THEME.border}`,
                color: showFreeOnly ? THEME.accent : THEME.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500'
              }}
            >
              <Ticket size={16} />
              Free Entry
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ color: THEME.accent }}>Loading places...</div>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: THEME.textSecondary }}>
            <MapPin size={48} style={{ opacity: 0.5, marginBottom: '16px', margin: '0 auto' }} />
            <h3>No places found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {paginatedPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => navigate(`/places/${place.id}`)}
                  style={{
                    backgroundColor: THEME.bgCard,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `1px solid ${THEME.border}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                    e.currentTarget.style.borderColor = THEME.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = THEME.border;
                  }}
                >
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={place.image_url || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80'}
                      alt={place.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                      padding: '4px 10px', borderRadius: '8px', fontSize: '12px', color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {place.category}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '12px', right: '12px',
                      backgroundColor: THEME.highlight, color: 'black',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Star size={12} fill="black" /> {place.rating}
                    </div>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {place.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', color: THEME.textSecondary, fontSize: '14px' }}>
                      <MapPin size={14} color={THEME.accent} />
                      {place.city}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${THEME.border}`, paddingTop: '16px' }}>
                      <span style={{ fontSize: '14px', color: place.is_free ? THEME.accent : 'white', fontWeight: '600' }}>
                        {place.is_free ? 'Free Entry' : 'Ticketed'}
                      </span>
                      <button style={{ backgroundColor: 'transparent', border: 'none', color: THEME.highlight, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                        Explore <ArrowRight size={16} />
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
              totalItems={filteredPlaces.length}
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