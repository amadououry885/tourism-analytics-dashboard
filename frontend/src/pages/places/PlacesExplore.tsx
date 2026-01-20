// src/pages/places/PlacesExplore.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, MapPin, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import api from '../../services/api';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import Pagination from '../../components/Pagination';
import { PlaceCard, Place } from './PlaceCard'; // Ensure this path is correct!

// --- Types are imported from PlaceCard, but we need local state types ---
const ITEMS_PER_PAGE = 9;

// --- Theme Constants (Light Mode) ---
const THEME = {
  bg: '#f8fafc',           // Slate 50 (Very light gray)
  text: '#0f172a',         // Slate 900
  textSecondary: '#64748b',// Slate 500
  accent: '#1e3a8a',       // Deep Blue
  highlight: '#f97316',    // Orange
  border: '#e2e8f0',       // Light Border
};

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

  // --- Carousel Logic ---
  const carouselSlides = useMemo(() => {
    if (places.length === 0) return [];
    return places.slice(0, 5); 
  }, [places]);

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
    const uniqueCats = places.map(p => p.category).filter(c => typeof c === 'string' && c.length > 0) as string[];
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
        /* Glass panel for Carousel only */
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
              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to bottom, rgba(30,58,138,0.2), rgba(15,23,42,0.6))'
              }} />
            </div>
          ))}

          {/* Carousel Text Content - Keeps dark glass for contrast against image */}
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
            <div className="glass-panel-dark" 
              onClick={() => navigate(`/places/${carouselSlides[currentSlide].id}`)}
              style={{ padding: '40px', borderRadius: '24px', cursor: 'pointer' }}
            >
              <div style={{ 
                display: 'inline-block', 
                backgroundColor: THEME.highlight, // Orange
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Featured Destination
              </div>
              <h1 style={{ 
                fontSize: 'clamp(32px, 5vw, 56px)', 
                fontWeight: '800', 
                color: 'white', 
                marginBottom: '16px',
                lineHeight: '1.1',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                {carouselSlides[currentSlide].name}
              </h1>
              <p style={{ 
                fontSize: 'clamp(16px, 3vw, 18px)', 
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

      {/* --- FILTERS BAR (Clean White) --- */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${THEME.border}`,
        position: 'sticky',
        top: '70px',
        zIndex: 40,
        padding: '16px 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
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
                borderRadius: '50px', // Rounder search bar
                border: `1px solid ${THEME.border}`,
                backgroundColor: '#f1f5f9',
                color: THEME.text,
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = THEME.accent}
              onBlur={(e) => e.target.style.borderColor = THEME.border}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '10px 36px 10px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  border: `1px solid ${selectedCategory !== 'All' ? THEME.accent : THEME.border}`,
                  color: selectedCategory !== 'All' ? THEME.accent : THEME.text,
                  appearance: 'none',
                  cursor: 'pointer',
                  minWidth: '140px',
                  fontWeight: '500'
                }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Grid size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: THEME.textSecondary }} />
            </div>

            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: showFreeOnly ? '#eff6ff' : 'white', // Light blue bg when active
                border: `1px solid ${showFreeOnly ? THEME.accent : THEME.border}`,
                color: showFreeOnly ? THEME.accent : THEME.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              <Ticket size={16} />
              Free Entry
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ color: THEME.accent, fontWeight: 'bold' }}>Loading places...</div>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: THEME.textSecondary }}>
            <MapPin size={48} style={{ opacity: 0.3, marginBottom: '16px', margin: '0 auto' }} />
            <h3 style={{fontSize: '20px', color: THEME.text}}>No places found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {paginatedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
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