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
}

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
  }, []);

  const fetchRestaurants = async () => {
    try {
      console.log('[VendorDashboard] Fetching vendors...');
      console.log('[VendorDashboard] User authenticated:', user);
      // Add my_restaurants=true to only fetch vendor's own restaurants
      const data = await request('/vendors/?my_restaurants=true');
      console.log('[VendorDashboard] Vendors response:', data);
      console.log('[VendorDashboard] Results array:', data?.results);
      console.log('[VendorDashboard] Results count:', data?.count);
      
      // Handle paginated response - extract results array
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
    
    // Validation
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
      
      // Show specific validation errors
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
      amenities: restaurant.amenities || {
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
      
      // Update local state
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

  return (
    <div className="min-h-screen" style={{ background: '#f5f0eb' }}>
      {/* Header - Warm gradient like Admin */}
      <header style={{ background: 'linear-gradient(135deg, #d4a574 0%, #e8c9a8 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                <Store className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Restaurant Dashboard</h1>
                <p style={{ color: 'rgba(255,255,255,0.85)' }} className="text-sm">Welcome back, {user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Action */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#2d2d2d' }}>Manage Restaurants</h2>
            <p style={{ color: '#666' }}>Add and manage your restaurant listings</p>
          </div>
          <button
            onClick={() => {
              console.log('[VendorDashboard] Add Restaurant button clicked!');
              setShowAddModal(true);
            }}
            style={{ background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)', boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)' }}
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium transition-all hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Restaurant
          </button>
        </div>

        {/* Tabs Navigation - Warm color scheme */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px', overflow: 'hidden' }}>
          {/* Colored top band */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #d4a574 0%, #e8c9a8 50%, #d4a574 100%)' }} />
          <nav className="flex px-4 space-x-6 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('restaurants')}
              style={{
                borderBottom: activeTab === 'restaurants' ? '3px solid #d4a574' : '3px solid transparent',
                color: activeTab === 'restaurants' ? '#d4a574' : '#666',
              }}
              className="flex items-center gap-2 py-4 px-1 font-medium text-sm transition-colors"
            >
              <Store className="w-4 h-4" />
              My Restaurants
            </button>
            <button
              onClick={() => {
                if (restaurants.length > 0) {
                  setSelectedVendorId(restaurants[0].id);
                  setActiveTab('menu');
                } else {
                  alert('Please add a restaurant first');
                }
              }}
              style={{
                borderBottom: activeTab === 'menu' ? '3px solid #e67e22' : '3px solid transparent',
                color: activeTab === 'menu' ? '#e67e22' : '#666',
              }}
              className="flex items-center gap-2 py-4 px-1 font-medium text-sm transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Menu Management
            </button>
            <button
              onClick={() => {
                if (restaurants.length > 0) {
                  setSelectedVendorId(restaurants[0].id);
                  setActiveTab('hours');
                } else {
                  alert('Please add a restaurant first');
                }
              }}
              style={{
                borderBottom: activeTab === 'hours' ? '3px solid #3498db' : '3px solid transparent',
                color: activeTab === 'hours' ? '#3498db' : '#666',
              }}
              className="flex items-center gap-2 py-4 px-1 font-medium text-sm transition-colors"
            >
              <Clock className="w-4 h-4" />
              Opening Hours
            </button>
            <button
              onClick={() => {
                if (restaurants.length > 0) {
                  setSelectedVendorId(restaurants[0].id);
                  setActiveTab('reservations');
                } else {
                  alert('Please add a restaurant first');
                }
              }}
              style={{
                borderBottom: activeTab === 'reservations' ? '3px solid #9b59b6' : '3px solid transparent',
                color: activeTab === 'reservations' ? '#9b59b6' : '#666',
              }}
              className="flex items-center gap-2 py-4 px-1 font-medium text-sm transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Reservations
            </button>
          </nav>

          {/* Tab Content Area */}
          <div className="p-6">

        {/* Restaurant Selector (for Menu, Hours & Reservations tabs) */}
        {(activeTab === 'menu' || activeTab === 'hours' || activeTab === 'reservations') && restaurants.length > 1 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Restaurant:
            </label>
            <select
              value={selectedVendorId || ''}
              onChange={(e) => setSelectedVendorId(Number(e.target.value))}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
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
          <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(212, 165, 116, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Store style={{ width: '40px', height: '40px', color: '#d4a574' }} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '8px' }}>No restaurants yet</h3>
            <p style={{ color: '#666', marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>Add your first restaurant to get started with managing your business.</p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)', boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)' }}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Restaurant
            </button>
          </div>
        ) : (
          <>
            {/* Restaurant Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurants.map((restaurant) => (
                <div 
                  key={restaurant.id} 
                  style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid #d4a574',
                    transition: 'all 0.2s'
                  }}
                  className="hover:shadow-lg"
                >
                  {/* Restaurant Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div style={{ width: '40px', height: '40px', background: 'rgba(212, 165, 116, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store style={{ width: '20px', height: '20px', color: '#d4a574' }} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: '600', color: '#2d2d2d', fontSize: '16px' }}>{restaurant.name}</h4>
                        <p style={{ color: '#888', fontSize: '14px' }}>{restaurant.city}</p>
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
                        background: (restaurant.is_open ?? true) ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                        color: (restaurant.is_open ?? true) ? '#27ae60' : '#e74c3c',
                        transition: 'all 0.2s'
                      }}
                      title={`Click to ${(restaurant.is_open ?? true) ? 'close' : 'open'} restaurant`}
                    >
                      {(restaurant.is_open ?? true) ? '● Open' : '● Closed'}
                    </button>
                  </div>

                  {/* Cuisines */}
                  {restaurant.cuisines && restaurant.cuisines.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div className="flex flex-wrap gap-1.5">
                        {restaurant.cuisines.map((cuisine, idx) => (
                          <span key={idx} style={{ padding: '4px 10px', background: 'rgba(212, 165, 116, 0.1)', color: '#a07850', fontSize: '12px', fontWeight: '500', borderRadius: '6px' }}>
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                    <button
                      onClick={() => handleEdit(restaurant)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(212, 165, 116, 0.1)', color: '#a07850', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
                    >
                      <Edit2 style={{ width: '16px', height: '16px' }} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
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
