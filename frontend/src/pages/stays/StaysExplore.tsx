import { useState, useEffect, useMemo } from 'react';
import { Search, Hotel, Star, DollarSign, Filter } from 'lucide-react';
import api from '../../services/api';
import { StayCard, Stay } from './StayCard';
import { FilterDropdown, SortDropdown } from '../../components/FilterDropdown';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';

const STAY_TYPES = [
  { value: 'All', label: 'All Types', icon: '🏨' },
  { value: 'Hotel', label: 'Hotel', icon: '🏨' },
  { value: 'Resort', label: 'Resort', icon: '🏖️' },
  { value: 'Apartment', label: 'Apartment', icon: '🏢' },
  { value: 'Homestay', label: 'Homestay', icon: '🏠' },
  { value: 'Guest House', label: 'Guest House', icon: '🏚️' },
];

const DISTRICTS = [
  { value: 'All', label: 'All Districts', icon: '📍' },
  { value: 'Langkawi', label: 'Langkawi', icon: '🏝️' },
  { value: 'Alor Setar', label: 'Alor Setar', icon: '🏙️' },
  { value: 'Sungai Petani', label: 'Sungai Petani', icon: '🌆' },
  { value: 'Kulim', label: 'Kulim', icon: '🏘️' },
  { value: 'Jitra', label: 'Jitra', icon: '🌾' },
];

export default function StaysExplore() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name'>('rating');

  // Fetch stays
  useEffect(() => {
    const fetchStays = async () => {
      try {
        setLoading(true);
        // Try hybrid search first, then fall back to regular stays endpoint
        let data: any[] = [];
        try {
          const response = await api.get('/stays/hybrid_search/');
          data = response.data.results || response.data || [];
        } catch {
          // Fallback to regular stays endpoint
          const response = await api.get('/stays/');
          data = response.data.results || response.data || [];
        }
        
        if (data.length > 0) {
          const transformedStays: Stay[] = data.map((stay: any) => ({
            id: stay.id,
            name: stay.name,
            district: stay.district || stay.city || 'Kedah',
            type: stay.type || stay.stay_type || 'Hotel',
            image_url: stay.image_url || stay.main_image,
            rating: stay.rating || stay.average_rating || 4.0,
            reviews: stay.reviews || stay.review_count || 0,
            price_per_night: stay.price_per_night || stay.price || 150,
            amenities: stay.amenities || [],
            is_available: stay.is_available !== undefined ? stay.is_available : true,
            landmark: stay.landmark,
          }));
          
          setStays(transformedStays);
        } else {
          throw new Error('No data');
        }
      } catch (err) {
        console.error('Error fetching stays:', err);
        // Demo data
        setStays([
          { id: 1, name: 'The Danna Langkawi', district: 'Langkawi', type: 'Resort', rating: 4.9, reviews: 520, price_per_night: 850, amenities: ['WiFi', 'Pool', 'Spa', 'Parking'], is_available: true, image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600' },
          { id: 2, name: 'Four Seasons Resort', district: 'Langkawi', type: 'Resort', rating: 4.8, reviews: 380, price_per_night: 1200, amenities: ['WiFi', 'Pool', 'Beach Access', 'Parking'], is_available: true, image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600' },
          { id: 3, name: 'Holiday Villa Alor Setar', district: 'Alor Setar', type: 'Hotel', rating: 4.3, reviews: 240, price_per_night: 180, amenities: ['WiFi', 'Pool', 'Parking'], is_available: true, image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600' },
          { id: 4, name: 'Langkawi Lagoon Resort', district: 'Langkawi', type: 'Resort', rating: 4.5, reviews: 290, price_per_night: 450, amenities: ['WiFi', 'Pool', 'Restaurant'], is_available: true, image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600' },
          { id: 5, name: 'Swiss Garden Sungai Petani', district: 'Sungai Petani', type: 'Hotel', rating: 4.2, reviews: 180, price_per_night: 150, amenities: ['WiFi', 'Parking', 'Restaurant'], is_available: true, image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600' },
          { id: 6, name: 'Cozy Homestay Langkawi', district: 'Langkawi', type: 'Homestay', rating: 4.6, reviews: 95, price_per_night: 120, amenities: ['WiFi', 'Kitchen', 'Parking'], is_available: true, image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStays();
  }, []);

  // Filter and sort stays
  const filteredStays = useMemo(() => {
    return stays
      .filter(stay => {
        if (searchTerm && !stay.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (selectedType !== 'All' && stay.type !== selectedType) {
          return false;
        }
        if (selectedDistrict !== 'All' && stay.district !== selectedDistrict) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return (a.price_per_night || 0) - (b.price_per_night || 0);
          case 'rating':
          default:
            return (b.rating || 0) - (a.rating || 0);
        }
      });
  }, [stays, searchTerm, selectedType, selectedDistrict, sortBy]);

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
              <Hotel size={28} color="#3b82f6" />
              Find Your Stay
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
              Discover perfect accommodations in Kedah
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            color: '#3b82f6',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {filteredStays.length} stays
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
              placeholder="Search stays..."
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

          {/* District Filter */}
          <FilterDropdown
            label="District"
            icon={<Filter size={16} />}
            options={DISTRICTS}
            value={selectedDistrict}
            onChange={(val) => setSelectedDistrict(val as string)}
            accentColor="#3b82f6"
          />

          {/* Type Filter */}
          <FilterDropdown
            label="Type"
            icon={<Hotel size={16} />}
            options={STAY_TYPES}
            value={selectedType}
            onChange={(val) => setSelectedType(val as string)}
            accentColor="#3b82f6"
          />

          {/* Sort */}
          <SortDropdown
            options={[
              { value: 'rating', label: 'Highest Rated', icon: '⭐' },
              { value: 'price', label: 'Lowest Price', icon: '💰' },
              { value: 'name', label: 'Name (A-Z)', icon: '🔤' },
            ]}
            value={sortBy}
            onChange={(val) => setSortBy(val as 'rating' | 'price' | 'name')}
            accentColor="#3b82f6"
          />
        </div>
      </div>

      {/* Main Content */}
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
                  height: '360px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  animation: 'pulse 2s infinite',
                }}
              />
            ))}
          </div>
        ) : filteredStays.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
          }}>
            <Hotel size={64} color="#475569" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
              No stays found
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
            {filteredStays.map((stay) => (
              <StayCard key={stay.id} stay={stay} />
            ))}
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <SharedFooter />
    </div>
  );
}
