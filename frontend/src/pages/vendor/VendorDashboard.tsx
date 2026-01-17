import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  MapPin,
  Users,
  Home,
  UtensilsCrossed,
  Clock,
  Phone,
  Globe,
  Settings,
  CheckCircle,
  Image,
  X,
  ArrowLeft,
  ArrowRight,
  Save,
  Calendar,
  TrendingUp,
  Star,
  Eye,
  DollarSign,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { FormInput } from '../../components/FormInput';
import { MenuManagement } from '../../components/MenuManagement';
import { OpeningHoursManagement } from '../../components/OpeningHoursManagement';
import { ReservationManagement } from '../../components/ReservationManagement';
import { VendorDashboardModal } from './VendorDashboardModalNew';

interface Restaurant {
  id: number;
  name: string;
  city: string;
  cuisines: string[];
  description?: string;
  established_year?: number;
  price_range?: string;
  lat?: number;
  lon?: number;
  address?: string;
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
    halal_certified?: boolean;
    non_smoking?: boolean;
    live_music?: boolean;
    tv_sports?: boolean;
    private_events?: boolean;
    delivery?: boolean;
    takeaway?: boolean;
    reservations?: boolean;
  };
  delivery_available?: boolean;
  takeaway_available?: boolean;
  reservation_required?: boolean;
  dress_code?: string;
  is_active: boolean;
  is_open: boolean;
  owner?: number;
  owner_username?: string;
  rating?: number;
  total_reviews?: number;
}

// Dark theme colors for Vendor Portal (Orange/Amber accent)
const theme = {
  background: '#0f172a',
  cardBg: '#1e293b',
  cardBgHover: '#334155',
  primary: '#f97316',       // Orange-500
  primaryLight: '#fb923c',  // Orange-400
  primaryDark: '#ea580c',   // Orange-600
  primaryMuted: 'rgba(249, 115, 22, 0.15)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#334155',
  success: '#22c55e',
  successMuted: 'rgba(34, 197, 94, 0.15)',
  danger: '#ef4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  warning: '#eab308',
  warningMuted: 'rgba(234, 179, 8, 0.15)',
  purple: '#a855f7',
  purpleMuted: 'rgba(168, 85, 247, 0.15)',
};

const VendorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { request, loading } = useApi();
  const navigate = useNavigate();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'menu' | 'hours' | 'reservations'>('restaurants');
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [formStep, setFormStep] = useState<'basic' | 'details' | 'online' | 'amenities'>('basic');
  const [pendingReservationsCount, setPendingReservationsCount] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('[VendorDashboard] showAddModal changed:', showAddModal);
  }, [showAddModal]);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    cuisines: [] as string[],
    description: '',
    established_year: '',
    price_range: '$$',
    lat: '',
    lon: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    official_website: '',
    facebook_url: '',
    instagram_url: '',
    tripadvisor_url: '',
    google_maps_url: '',
    logo_url: '',
    cover_image_url: '',
    amenities: {
      parking: false,
      wifi: false,
      wheelchair_accessible: false,
      outdoor_seating: false,
      halal_certified: false,
      non_smoking: false,
      live_music: false,
      tv_sports: false,
      private_events: false,
      delivery: false,
      takeaway: false,
      reservations: false,
    },
    delivery_available: false,
    takeaway_available: true,
    reservation_required: false,
    dress_code: '',
  });

  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese',
    'French', 'American', 'Thai', 'Mediterranean', 'Malay', 'Other',
  ];

  useEffect(() => {
    console.log('[VendorDashboard] Component mounted, user:', user);
    fetchRestaurants();
    fetchPendingReservations();
  }, []);

  // Fetch pending reservations count across all vendor's restaurants
  const fetchPendingReservations = async () => {
    try {
      const response = await request('/reservations/');
      const data = response?.results || response || [];
      const pendingCount = Array.isArray(data) 
        ? data.filter((r: any) => r.status === 'pending').length 
        : 0;
      setPendingReservationsCount(pendingCount);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      setPendingReservationsCount(0);
    }
  };

  const fetchRestaurants = async () => {
    try {
      console.log('[VendorDashboard] Fetching vendors...');
      console.log('[VendorDashboard] User authenticated:', user);
      const data = await request('/vendors/?my_restaurants=true');
      console.log('[VendorDashboard] Vendors response:', data);
      console.log('[VendorDashboard] Results array:', data?.results);
      console.log('[VendorDashboard] Results count:', data?.count);
      
      const restaurantsList = data?.results || data || [];
      console.log('[VendorDashboard] Setting restaurants to:', restaurantsList);
      setRestaurants(restaurantsList);
      
      if (restaurantsList.length > 0) {
        console.log('[VendorDashboard] ✅ Successfully loaded', restaurantsList.length, 'restaurants');
      } else {
        console.log('[VendorDashboard] ⚠️ No restaurants found in response');
      }
    } catch (error: any) {
      console.error('[VendorDashboard] ❌ Failed to fetch restaurants:', error);
      console.error('[VendorDashboard] Error details:', error.response || error.message);
    }
  };

  const handleCuisineChange = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.name.trim()) {
      alert('⚠️ Restaurant name is required!');
      return;
    }
    
    if (!formData.city || !formData.city.trim()) {
      alert('⚠️ City is required!');
      return;
    }
    
    console.log('[VendorDashboard] Form data before payload:', {
      name: formData.name,
      city: formData.city,
      cuisines: formData.cuisines,
      cuisines_length: formData.cuisines.length,
      price_range: formData.price_range,
      price_range_type: typeof formData.price_range,
    });
    
    const payload = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      cuisines: formData.cuisines,
      description: formData.description.trim(),
      established_year: formData.established_year ? parseInt(formData.established_year) : null,
      price_range: formData.price_range,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lon: formData.lon ? parseFloat(formData.lon) : null,
      address: formData.address.trim(),
      contact_phone: formData.contact_phone.trim(),
      contact_email: formData.contact_email.trim(),
      official_website: formData.official_website.trim(),
      facebook_url: formData.facebook_url.trim(),
      instagram_url: formData.instagram_url.trim(),
      tripadvisor_url: formData.tripadvisor_url.trim(),
      google_maps_url: formData.google_maps_url.trim(),
      logo_url: formData.logo_url.trim(),
      cover_image_url: formData.cover_image_url.trim(),
      amenities: formData.amenities,
      delivery_available: formData.delivery_available,
      takeaway_available: formData.takeaway_available,
      reservation_required: formData.reservation_required,
      dress_code: formData.dress_code.trim(),
    };

    console.log('[VendorDashboard] Submitting payload:', JSON.stringify(payload, null, 2));
    
    try {
      if (editingRestaurant) {
        await request(
          `/vendors/${editingRestaurant.id}/`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          },
          '✅ Restaurant updated successfully!'
        );
      } else {
        await request(
          '/vendors/',
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
          '✅ Restaurant added successfully!'
        );
      }
      
      fetchRestaurants();
      resetForm();
      setShowForm(false);
      setEditingRestaurant(null);
    } catch (error: any) {
      console.error('Failed to save restaurant:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to save restaurant:\n\n';
        
        if (typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessage += `${field}: ${messages.join(', ')}\n`;
            } else {
              errorMessage += `${field}: ${messages}\n`;
            }
          });
        } else {
          errorMessage += errorData;
        }
        
        alert(errorMessage);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = `⚠️ Are you sure you want to remove this restaurant?\n\n` +
                          `This will permanently delete it from your list.\n\n` +
                          `Click OK to remove, or Cancel to keep it.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await request(
          `/vendors/${id}/`,
          { method: 'DELETE' },
          '✅ Restaurant removed successfully!'
        );
        fetchRestaurants();
      } catch (error) {
        console.error('Failed to delete restaurant:', error);
      }
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      city: restaurant.city,
      cuisines: restaurant.cuisines || [],
      description: restaurant.description || '',
      established_year: restaurant.established_year?.toString() || '',
      price_range: restaurant.price_range || '$$',
      lat: restaurant.lat?.toString() || '',
      lon: restaurant.lon?.toString() || '',
      address: restaurant.address || '',
      contact_phone: restaurant.contact_phone || '',
      contact_email: restaurant.contact_email || '',
      official_website: restaurant.official_website || '',
      facebook_url: restaurant.facebook_url || '',
      instagram_url: restaurant.instagram_url || '',
      tripadvisor_url: restaurant.tripadvisor_url || '',
      google_maps_url: restaurant.google_maps_url || '',
      logo_url: restaurant.logo_url || '',
      cover_image_url: restaurant.cover_image_url || '',
      amenities: {
        parking: restaurant.amenities?.parking ?? false,
        wifi: restaurant.amenities?.wifi ?? false,
        wheelchair_accessible: restaurant.amenities?.wheelchair_accessible ?? false,
        outdoor_seating: restaurant.amenities?.outdoor_seating ?? false,
        halal_certified: restaurant.amenities?.halal_certified ?? false,
        non_smoking: restaurant.amenities?.non_smoking ?? false,
        live_music: restaurant.amenities?.live_music ?? false,
        tv_sports: restaurant.amenities?.tv_sports ?? false,
        private_events: restaurant.amenities?.private_events ?? false,
        delivery: restaurant.amenities?.delivery ?? false,
        takeaway: restaurant.amenities?.takeaway ?? false,
        reservations: restaurant.amenities?.reservations ?? false,
      },
      delivery_available: restaurant.delivery_available || false,
      takeaway_available: restaurant.takeaway_available !== undefined ? restaurant.takeaway_available : true,
      reservation_required: restaurant.reservation_required || false,
      dress_code: restaurant.dress_code || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      cuisines: [],
      description: '',
      established_year: '',
      price_range: '$$',
      lat: '',
      lon: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      official_website: '',
      facebook_url: '',
      instagram_url: '',
      tripadvisor_url: '',
      google_maps_url: '',
      logo_url: '',
      cover_image_url: '',
      amenities: {
        parking: false,
        wifi: false,
        wheelchair_accessible: false,
        outdoor_seating: false,
        halal_certified: false,
        non_smoking: false,
        live_music: false,
        tv_sports: false,
        private_events: false,
        delivery: false,
        takeaway: false,
        reservations: false,
      },
      delivery_available: false,
      takeaway_available: true,
      reservation_required: false,
      dress_code: '',
    });
    setEditingRestaurant(null);
    setShowAddModal(false);
    setFormStep('basic');
  };

  const handleToggleStatus = async (restaurantId: number, currentStatus: boolean) => {
    try {
      const response = await request(
        `/vendors/${restaurantId}/toggle_status/`,
        {
          method: 'POST',
        },
        `✅ Restaurant ${currentStatus ? 'closed' : 'opened'} successfully!`
      );
      
      setRestaurants(restaurants.map(r => 
        r.id === restaurantId ? { ...r, is_open: response.is_open } : r
      ));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  // Calculate stats
  const totalRestaurants = restaurants.length;
  const openRestaurants = restaurants.filter(r => r.is_open ?? true).length;
  const closedRestaurants = totalRestaurants - openRestaurants;
  const avgRating = restaurants.length > 0 
    ? (restaurants.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / restaurants.length).toFixed(1)
    : '0.0';

  return (
    <div style={{ minHeight: '100vh', background: theme.background }}>
      {/* Header */}
      <header style={{ 
        background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${theme.background} 100%)`,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                background: theme.primaryMuted, 
                padding: '12px', 
                borderRadius: '14px',
                border: `1px solid ${theme.primary}30`
              }}>
                <Store style={{ width: '28px', height: '28px', color: theme.primary }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '22px', 
                  fontWeight: '700', 
                  color: theme.text,
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}>
                  Restaurant Dashboard
                </h1>
                <p style={{ 
                  color: theme.textSecondary, 
                  fontSize: '14px',
                  margin: '2px 0 0 0'
                }}>
                  Welcome back, <span style={{ color: theme.primary }}>{user?.username}</span>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to="/"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: theme.primaryMuted,
                  color: theme.primary,
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: `1px solid ${theme.primary}40`,
                  transition: 'all 0.2s'
                }}
              >
                <Home style={{ width: '18px', height: '18px' }} />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: theme.cardBg,
                  color: theme.textSecondary,
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <LogOut style={{ width: '18px', height: '18px' }} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Total Restaurants */}
          <div style={{ 
            background: theme.cardBg, 
            borderRadius: '16px', 
            padding: '20px',
            border: `1px solid ${theme.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Restaurants
                </p>
                <p style={{ color: theme.text, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                  {totalRestaurants}
                </p>
              </div>
              <div style={{ 
                background: theme.primaryMuted, 
                padding: '12px', 
                borderRadius: '12px' 
              }}>
                <Store style={{ width: '24px', height: '24px', color: theme.primary }} />
              </div>
            </div>
          </div>

          {/* Open Now */}
          <div style={{ 
            background: theme.cardBg, 
            borderRadius: '16px', 
            padding: '20px',
            border: `1px solid ${theme.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Open Now
                </p>
                <p style={{ color: theme.success, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                  {openRestaurants}
                </p>
              </div>
              <div style={{ 
                background: theme.successMuted, 
                padding: '12px', 
                borderRadius: '12px' 
              }}>
                <CheckCircle style={{ width: '24px', height: '24px', color: theme.success }} />
              </div>
            </div>
          </div>

          {/* Closed */}
          <div style={{ 
            background: theme.cardBg, 
            borderRadius: '16px', 
            padding: '20px',
            border: `1px solid ${theme.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Closed
                </p>
                <p style={{ color: theme.danger, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                  {closedRestaurants}
                </p>
              </div>
              <div style={{ 
                background: theme.dangerMuted, 
                padding: '12px', 
                borderRadius: '12px' 
              }}>
                <X style={{ width: '24px', height: '24px', color: theme.danger }} />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div style={{ 
            background: theme.cardBg, 
            borderRadius: '16px', 
            padding: '20px',
            border: `1px solid ${theme.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Avg Rating
                </p>
                <p style={{ color: theme.warning, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                  {avgRating}
                </p>
              </div>
              <div style={{ 
                background: theme.warningMuted, 
                padding: '12px', 
                borderRadius: '12px' 
              }}>
                <Star style={{ width: '24px', height: '24px', color: theme.warning }} />
              </div>
            </div>
          </div>

          {/* Pending Reservations */}
          <div 
            style={{ 
              background: theme.cardBg, 
              borderRadius: '16px', 
              padding: '20px',
              border: pendingReservationsCount > 0 ? `2px solid ${theme.purple}` : `1px solid ${theme.border}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => {
              if (restaurants.length > 0) {
                setSelectedVendorId(restaurants[0].id);
                setActiveTab('reservations');
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pending
                </p>
                <p style={{ color: theme.purple, fontSize: '32px', fontWeight: '700', margin: 0 }}>
                  {pendingReservationsCount}
                </p>
              </div>
              <div style={{ 
                background: theme.purpleMuted, 
                padding: '12px', 
                borderRadius: '12px',
                position: 'relative',
              }}>
                <Bell style={{ width: '24px', height: '24px', color: theme.purple }} />
                {pendingReservationsCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '12px',
                    height: '12px',
                    background: theme.danger,
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                  }} />
                )}
              </div>
            </div>
            {pendingReservationsCount > 0 && (
              <p style={{ color: theme.purple, fontSize: '12px', margin: '8px 0 0 0', fontWeight: '500' }}>
                Click to review →
              </p>
            )}
          </div>
        </div>

        {/* Page Header with Action */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '20px' 
        }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: theme.text,
              margin: '0 0 4px 0'
            }}>
              Manage Restaurants
            </h2>
            <p style={{ color: theme.textSecondary, margin: 0, fontSize: '14px' }}>
              Add and manage your restaurant listings
            </p>
          </div>
          <button
            onClick={() => {
              console.log('[VendorDashboard] Add Restaurant button clicked!');
              setShowAddModal(true);
            }}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
              color: 'white',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${theme.primary}40`,
              transition: 'all 0.2s'
            }}
          >
            <Plus style={{ width: '20px', height: '20px' }} />
            Add Restaurant
          </button>
        </div>

        {/* Tabs Navigation */}
        <div style={{ 
          background: theme.cardBg, 
          borderRadius: '16px', 
          border: `1px solid ${theme.border}`,
          marginBottom: '24px', 
          overflow: 'hidden' 
        }}>
          {/* Colored top band */}
          <div style={{ 
            height: '3px', 
            background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryLight} 50%, ${theme.primary} 100%)` 
          }} />
          <nav style={{ 
            display: 'flex', 
            padding: '0 16px', 
            gap: '8px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            {[
              { key: 'restaurants', label: 'My Restaurants', icon: Store, color: theme.primary },
              { key: 'menu', label: 'Menu Management', icon: UtensilsCrossed, color: '#22c55e' },
              { key: 'hours', label: 'Opening Hours', icon: Clock, color: '#3b82f6' },
              { key: 'reservations', label: 'Reservations', icon: Calendar, color: '#a855f7' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.key === 'restaurants') {
                      setActiveTab('restaurants');
                    } else if (restaurants.length > 0) {
                      setSelectedVendorId(restaurants[0].id);
                      setActiveTab(tab.key as any);
                    } else {
                      alert('Please add a restaurant first');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                    color: isActive ? tab.color : theme.textMuted,
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '-1px'
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Tab Content Area */}
          <div style={{ padding: '24px' }}>
            {/* Restaurant Selector (for Menu, Hours & Reservations tabs) */}
            {(activeTab === 'menu' || activeTab === 'hours' || activeTab === 'reservations') && restaurants.length > 1 && (
              <div style={{ 
                background: theme.background, 
                border: `1px solid ${theme.border}`,
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <label style={{ 
                  display: 'block', 
                  color: theme.textSecondary, 
                  fontSize: '13px', 
                  fontWeight: '500',
                  marginBottom: '8px' 
                }}>
                  Select Restaurant:
                </label>
                <select
                  value={selectedVendorId || ''}
                  onChange={(e) => setSelectedVendorId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '10px 14px',
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.text,
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'restaurants' && (
              <>
                {/* Restaurants Grid */}
                {restaurants.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '64px 24px', 
                    background: theme.background, 
                    borderRadius: '16px',
                    border: `1px dashed ${theme.border}`
                  }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: theme.primaryMuted, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 16px' 
                    }}>
                      <Store style={{ width: '40px', height: '40px', color: theme.primary }} />
                    </div>
                    <h3 style={{ 
                      fontSize: '22px', 
                      fontWeight: 'bold', 
                      color: theme.text, 
                      marginBottom: '8px' 
                    }}>
                      No restaurants yet
                    </h3>
                    <p style={{ 
                      color: theme.textSecondary, 
                      marginBottom: '24px', 
                      maxWidth: '300px', 
                      margin: '0 auto 24px' 
                    }}>
                      Add your first restaurant to get started with managing your business.
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 24px',
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
                        color: 'white',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: 'pointer',
                        boxShadow: `0 4px 12px ${theme.primary}40`
                      }}
                    >
                      <Plus style={{ width: '20px', height: '20px' }} />
                      Add Restaurant
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Restaurant Count */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      marginBottom: '16px' 
                    }}>
                      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: 0 }}>
                        {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                      gap: '20px' 
                    }}>
                      {restaurants.map((restaurant) => (
                        <div 
                          key={restaurant.id} 
                          style={{ 
                            background: theme.background, 
                            borderRadius: '16px', 
                            padding: '20px',
                            border: `1px solid ${theme.border}`,
                            borderLeft: `4px solid ${theme.primary}`,
                            transition: 'all 0.2s'
                          }}
                        >
                          {/* Restaurant Header */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            justifyContent: 'space-between', 
                            marginBottom: '16px' 
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                background: theme.primaryMuted, 
                                borderRadius: '12px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                              }}>
                                <Store style={{ width: '24px', height: '24px', color: theme.primary }} />
                              </div>
                              <div>
                                <h4 style={{ 
                                  fontWeight: '600', 
                                  color: theme.text, 
                                  fontSize: '17px',
                                  margin: '0 0 4px 0'
                                }}>
                                  {restaurant.name}
                                </h4>
                                <p style={{ 
                                  color: theme.textMuted, 
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  margin: 0
                                }}>
                                  <MapPin style={{ width: '12px', height: '12px' }} />
                                  {restaurant.city}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleStatus(restaurant.id, restaurant.is_open ?? true)}
                              style={{
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: '600',
                                borderRadius: '20px',
                                border: 'none',
                                cursor: 'pointer',
                                background: (restaurant.is_open ?? true) ? theme.successMuted : theme.dangerMuted,
                                color: (restaurant.is_open ?? true) ? theme.success : theme.danger,
                                transition: 'all 0.2s'
                              }}
                              title={`Click to ${(restaurant.is_open ?? true) ? 'close' : 'open'} restaurant`}
                            >
                              {(restaurant.is_open ?? true) ? '● Open' : '● Closed'}
                            </button>
                          </div>

                          {/* Rating & Price */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '16px',
                            marginBottom: '12px'
                          }}>
                            {restaurant.rating && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                color: theme.warning
                              }}>
                                <Star style={{ width: '14px', height: '14px', fill: theme.warning }} />
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                  {Number(restaurant.rating).toFixed(1)}
                                </span>
                              </div>
                            )}
                            {restaurant.price_range && (
                              <span style={{ 
                                color: theme.textMuted, 
                                fontSize: '13px' 
                              }}>
                                {restaurant.price_range}
                              </span>
                            )}
                          </div>

                          {/* Cuisines */}
                          {restaurant.cuisines && restaurant.cuisines.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {restaurant.cuisines.map((cuisine, idx) => (
                                  <span 
                                    key={idx} 
                                    style={{ 
                                      padding: '4px 10px', 
                                      background: theme.primaryMuted, 
                                      color: theme.primaryLight, 
                                      fontSize: '12px', 
                                      fontWeight: '500', 
                                      borderRadius: '6px' 
                                    }}
                                  >
                                    {cuisine}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            paddingTop: '16px', 
                            borderTop: `1px solid ${theme.border}` 
                          }}>
                            <button
                              onClick={() => handleEdit(restaurant)}
                              style={{ 
                                flex: 1, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px', 
                                padding: '10px 14px', 
                                background: theme.primaryMuted, 
                                color: theme.primary, 
                                borderRadius: '10px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Edit2 style={{ width: '16px', height: '16px' }} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(restaurant.id)}
                              style={{ 
                                flex: 1, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px', 
                                padding: '10px 14px', 
                                background: theme.dangerMuted, 
                                color: theme.danger, 
                                borderRadius: '10px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Menu Management Tab */}
            {activeTab === 'menu' && selectedVendorId && (
              <MenuManagement vendorId={selectedVendorId} />
            )}

            {/* Opening Hours Tab */}
            {activeTab === 'hours' && selectedVendorId && (
              <OpeningHoursManagement vendorId={selectedVendorId} />
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && selectedVendorId && (
              <ReservationManagement vendorId={selectedVendorId} />
            )}
          </div>
        </div>
      </main>

      {/* Professional Tabbed Modal */}
      {showAddModal && (
        <>
          {console.log('[VendorDashboard] Rendering modal, showAddModal:', showAddModal)}
          <VendorDashboardModal
            editingRestaurant={editingRestaurant}
            formStep={formStep}
            setFormStep={setFormStep}
            formData={formData}
            setFormData={setFormData}
            cuisineOptions={cuisineOptions}
            handleCuisineChange={handleCuisineChange}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default VendorDashboard;
