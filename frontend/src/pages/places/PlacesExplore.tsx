import { useState, useEffect, useMemo } from 'react';
import { Search, Grid, Star, Ticket, MapPin } from 'lucide-react';
import api from '../../services/api';
import { PlaceCard, Place } from './PlaceCard';
import { FilterDropdown, SortDropdown, ToggleFilter } from '../../components/FilterDropdown';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';

const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function PlacesExplore() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'name'>('popularity');
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // Fetch places
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await api.get('/analytics/places/popular/');
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
          description: place.description || '',
        }));
        
        setPlaces(transformedPlaces);
        setError(null);
      } catch (err) {
        console.error('Error fetching places:', err);
        setError('Failed to load places. Please try again.');
        // Set demo data on error
        setPlaces([
          { id: 1, name: 'Menara Alor Setar', city: 'Alor Setar', category: 'Landmark', rating: 4.5, posts: 1250, is_open: true, is_free: false, image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600' },
          { id: 2, name: 'Pantai Cenang', city: 'Langkawi', category: 'Beach', rating: 4.8, posts: 3200, is_open: true, is_free: true, image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
          { id: 3, name: 'Langkawi Sky Bridge', city: 'Langkawi', category: 'Attraction', rating: 4.7, posts: 2800, is_open: true, is_free: false, image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600' },
          { id: 4, name: 'Masjid Zahir', city: 'Alor Setar', category: 'Heritage', rating: 4.9, posts: 980, is_open: true, is_free: true, image_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600' },
          { id: 5, name: 'Pekan Rabu', city: 'Alor Setar', category: 'Market', rating: 4.3, posts: 750, is_open: true, is_free: true, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600' },
          { id: 6, name: 'Kilim Geoforest Park', city: 'Langkawi', category: 'Nature', rating: 4.6, posts: 1890, is_open: true, is_free: false, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // Get unique categories
  const categories: string[] = useMemo((): string[] => {
    const uniqueCats = places.map(p => p.category).filter((c): c is string => typeof c === 'string' && c.length > 0);
    return ['All', ...Array.from(new Set(uniqueCats)).sort()];
  }, [places]);

  // Filter and sort places
  const filteredPlaces = useMemo(() => {
    return places
      .filter(place => {
        if (searchTerm && !place.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (selectedCategory !== 'All' && place.category !== selectedCategory) {
          return false;
        }
        if (showFreeOnly && !place.is_free) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'popularity':
          default:
            return (b.posts || 0) - (a.posts || 0);
        }
      });
  }, [places, searchTerm, selectedCategory, showFreeOnly, sortBy]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
    }}>
      {/* Shared Header */}
      <SharedHeader />

      {/* Page Title Section */}
      <div style={{
        paddingTop: '73px',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '89px 24px 16px 24px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <MapPin size={28} color="#2dd4bf" />
              Explore Places
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
              Discover amazing destinations in Kedah
            </p>
          </div>
          
          {/* Results Count */}
          <div style={{
            backgroundColor: 'rgba(45, 212, 191, 0.2)',
            color: '#2dd4bf',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {filteredPlaces.length} places
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '16px 24px',
        position: 'sticky',
        top: '57px',
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{
            flex: '1',
            minWidth: '200px',
            maxWidth: '350px',
            position: 'relative',
          }}>
            <Search style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              width: '18px',
              height: '18px',
            }} />
            <input
              type="text"
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Category Filter */}
          <FilterDropdown
            label="Category"
            icon={<Grid size={16} />}
            options={categories.map(cat => ({
              value: cat,
              label: cat,
              icon: cat === 'All' ? '🌍' : 
                    cat.toLowerCase().includes('beach') ? '🏖️' :
                    cat.toLowerCase().includes('nature') ? '🌿' :
                    cat.toLowerCase().includes('heritage') ? '🏛️' :
                    cat.toLowerCase().includes('landmark') ? '🏰' :
                    cat.toLowerCase().includes('market') ? '🛍️' : '📍'
            }))}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val as string)}
            accentColor="#2dd4bf"
          />

          {/* Sort */}
          <SortDropdown
            options={[
              { value: 'popularity', label: 'Most Popular', icon: '🔥' },
              { value: 'rating', label: 'Highest Rated', icon: '⭐' },
              { value: 'name', label: 'Name (A-Z)', icon: '🔤' },
            ]}
            value={sortBy}
            onChange={(val) => setSortBy(val as 'popularity' | 'rating' | 'name')}
            accentColor="#2dd4bf"
          />

          {/* Free Only Toggle */}
          <ToggleFilter
            label="Free Entry"
            icon={<Ticket size={16} />}
            checked={showFreeOnly}
            onChange={setShowFreeOnly}
            accentColor="#2dd4bf"
          />
        </div>
      </div>

      {/* Main Content - Card Grid */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  height: '320px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  animation: 'pulse 2s infinite',
                }}
              />
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
          }}>
            <MapPin size={64} color="#475569" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
              No places found
            </h3>
            <p style={{ color: '#64748b' }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <SharedFooter />
    </div>
  );
}
