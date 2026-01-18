import { useState, useEffect, useMemo } from 'react';
import { Search, Utensils, Star, DollarSign, Check } from 'lucide-react';
import api from '../../services/api';
import { FoodCard, Restaurant } from './FoodCard';
import { FilterDropdown, SortDropdown } from '../../components/FilterDropdown';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 12;

export default function FoodExplore() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [halalOnly, setHalalOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch restaurants
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
        setError('Failed to load restaurants. Please try again.');
        // Set demo data on error
        setRestaurants([
          { id: 1, name: 'Nasi Kandar Pelita', city: 'Alor Setar', cuisine: 'Malaysian', rating: 4.6, reviews: 320, price_range: '$$', is_open: true, specialty: 'Famous Nasi Kandar', is_halal: true, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600' },
          { id: 2, name: 'The Andaman Seafood', city: 'Langkawi', cuisine: 'Seafood', rating: 4.8, reviews: 450, price_range: '$$$', is_open: true, specialty: 'Fresh catches daily', is_halal: true, image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600' },
          { id: 3, name: 'Laksa Teluk Kechai', city: 'Alor Setar', cuisine: 'Local', rating: 4.5, reviews: 280, price_range: '$', is_open: true, specialty: 'Best laksa in town', is_halal: true, image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600' },
          { id: 4, name: 'Gulai Kawah Pak Din', city: 'Sungai Petani', cuisine: 'Traditional', rating: 4.4, reviews: 190, price_range: '$$', is_open: true, specialty: 'Authentic gulai', is_halal: true, image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600' },
          { id: 5, name: 'Yellow Curry House', city: 'Langkawi', cuisine: 'Thai', rating: 4.3, reviews: 210, price_range: '$$', is_open: false, specialty: 'Thai-Malay fusion', is_halal: true, image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600' },
          { id: 6, name: 'Mee Rebus Tok', city: 'Jitra', cuisine: 'Local', rating: 4.7, reviews: 340, price_range: '$', is_open: true, specialty: 'Traditional mee rebus', is_halal: true, image_url: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCuisine, selectedPrice, halalOnly, sortBy]);

  // Get unique cuisines - extracted to ensure proper typing
  const cuisines = useMemo(() => {
    const allCuisines: string[] = [];
    restaurants.forEach(r => {
      if (r.cuisine && typeof r.cuisine === 'string' && r.cuisine.length > 0) {
        allCuisines.push(r.cuisine);
      }
    });
    const unique = Array.from(new Set(allCuisines)).sort();
    return ['All', ...unique];
  }, [restaurants]);

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter(restaurant => {
        if (searchTerm && !restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (selectedCuisine !== 'All' && restaurant.cuisine !== selectedCuisine) {
          return false;
        }
        if (selectedPrice !== 'All' && restaurant.price_range !== selectedPrice) {
          return false;
        }
        if (halalOnly && !restaurant.is_halal) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'reviews':
            return (b.reviews || 0) - (a.reviews || 0);
          case 'rating':
          default:
            return (b.rating || 0) - (a.rating || 0);
        }
      });
  }, [restaurants, searchTerm, selectedCuisine, selectedPrice, halalOnly, sortBy]);

  // Paginated restaurants
  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRestaurants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRestaurants, currentPage]);

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
              <Utensils size={28} color="#f97316" />
              Explore Food
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
              Discover delicious cuisines in Kedah
            </p>
          </div>
          
          {/* Results Count */}
          <div style={{
            backgroundColor: 'rgba(249, 115, 22, 0.2)',
            color: '#f97316',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {filteredRestaurants.length} restaurants
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
        top: '73px',
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
              placeholder="Search restaurants..."
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

          {/* Cuisine Filter */}
          <FilterDropdown
            label="Cuisine"
            icon={<Utensils size={16} />}
            options={cuisines.map((cuisine) => {
              const cuisineLower = cuisine.toLowerCase();
              const icon = cuisine === 'All' ? '🍽️' : 
                    cuisineLower.includes('seafood') ? '🦐' :
                    cuisineLower.includes('malay') ? '🍛' :
                    cuisineLower.includes('thai') ? '🍜' :
                    cuisineLower.includes('local') ? '🥘' : '🍴';
              return {
                value: cuisine,
                label: cuisine,
                icon
              };
            })}
            value={selectedCuisine}
            onChange={(val) => setSelectedCuisine(val as string)}
            accentColor="#f97316"
          />

          {/* Price Filter */}
          <FilterDropdown
            label="Price"
            icon={<DollarSign size={16} />}
            options={[
              { value: 'All', label: 'All Prices', icon: '💰' },
              { value: '$', label: 'Budget ($)', icon: '💵' },
              { value: '$$', label: 'Moderate ($$)', icon: '💳' },
              { value: '$$$', label: 'Premium ($$$)', icon: '💎' },
            ]}
            value={selectedPrice}
            onChange={(val) => setSelectedPrice(val as string)}
            accentColor="#f97316"
          />

          {/* Halal Filter Toggle */}
          <button
            onClick={() => setHalalOnly(!halalOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: halalOnly ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: halalOnly ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: halalOnly ? '#10b981' : '#94a3b8',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '16px' }}>🕌</span>
            Halal Only
            {halalOnly && <Check size={16} color="#10b981" />}
          </button>

          {/* Sort */}
          <SortDropdown
            options={[
              { value: 'rating', label: 'Highest Rated', icon: '⭐' },
              { value: 'reviews', label: 'Most Reviewed', icon: '💬' },
              { value: 'name', label: 'Name (A-Z)', icon: '🔤' },
            ]}
            value={sortBy}
            onChange={(val) => setSortBy(val as 'rating' | 'reviews' | 'name')}
            accentColor="#f97316"
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
                  height: '340px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  animation: 'pulse 2s infinite',
                }}
              />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
          }}>
            <Utensils size={64} color="#475569" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
              No restaurants found
            </h3>
            <p style={{ color: '#64748b' }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {paginatedRestaurants.map((restaurant) => (
                <FoodCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredRestaurants.length}
              itemsPerPage={ITEMS_PER_PAGE}
              accentColor="#f97316"
            />
          </>
        )}
      </main>

      {/* Shared Footer */}
      <SharedFooter />
    </div>
  );
}
