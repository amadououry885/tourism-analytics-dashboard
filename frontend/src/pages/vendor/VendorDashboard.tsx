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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { FormInput } from '../../components/FormInput';
import { MenuManagement } from '../../components/MenuManagement';
import { OpeningHoursManagement } from '../../components/OpeningHoursManagement';

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
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'menu' | 'hours'>('restaurants');
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
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
      const data = await request('/vendors/');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Restaurants</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.username}! 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchRestaurants}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                title="Refresh restaurant list"
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span className="font-bold">Refresh</span>
              </button>
              <Link
                to="/"
                className="px-6 py-2.5 bg-white border-2 border-gray-900 hover:bg-gray-100 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <Home className="w-5 h-5 text-gray-900" />
                <span className="text-gray-900 font-bold text-base">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
        {/* Welcome Card with Instructions - Enhanced for Non-Technical Users */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Welcome to Your Restaurant Dashboard! 👋</h2>
                <p className="text-emerald-100 text-lg">Easy tools to manage your business</p>
              </div>
            </div>
            
            {/* Simple 3-Step Guide */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-white text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">✓</span>
                Getting Started is Easy!
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <div className="text-4xl mb-2">1️⃣</div>
                  <h4 className="font-bold mb-1 text-lg">Click "Add Restaurant"</h4>
                  <p className="text-emerald-100 text-sm">Start by clicking the green button below</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <div className="text-4xl mb-2">2️⃣</div>
                  <h4 className="font-bold mb-1 text-lg">Fill Simple Form</h4>
                  <p className="text-emerald-100 text-sm">Enter your restaurant name and what food you serve</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <div className="text-4xl mb-2">3️⃣</div>
                  <h4 className="font-bold mb-1 text-lg">You're Done!</h4>
                  <p className="text-emerald-100 text-sm">Your restaurant will appear below instantly</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-bold shadow-2xl text-xl transform hover:scale-105 border-4 border-white/20 animate-pulse hover:animate-none"
            >
              <Plus className="w-7 h-7" />
              <span>🚀 CLICK HERE TO ADD YOUR RESTAURANT</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'restaurants'
                  ? 'bg-emerald-50 text-emerald-700 border-b-4 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Store className="w-5 h-5" />
              My Restaurants
            </button>
            <button
              onClick={() => {
                if (restaurants.length > 0) {
                  setSelectedVendorId(restaurants[0].id);
                  setActiveTab('menu');
                } else {
                  alert('Please add a restaurant first before managing menu items');
                }
              }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'bg-emerald-50 text-emerald-700 border-b-4 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              disabled={restaurants.length === 0}
            >
              <UtensilsCrossed className="w-5 h-5" />
              Menu Management
              {restaurants.length === 0 && <span className="text-xs">(Add restaurant first)</span>}
            </button>
            <button
              onClick={() => {
                if (restaurants.length > 0) {
                  setSelectedVendorId(restaurants[0].id);
                  setActiveTab('hours');
                } else {
                  alert('Please add a restaurant first before setting opening hours');
                }
              }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'hours'
                  ? 'bg-emerald-50 text-emerald-700 border-b-4 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              disabled={restaurants.length === 0}
            >
              <Clock className="w-5 h-5" />
              Opening Hours
              {restaurants.length === 0 && <span className="text-xs">(Add restaurant first)</span>}
            </button>
          </div>
        </div>

        {/* Restaurant Selector (for Menu & Hours tabs) */}
        {(activeTab === 'menu' || activeTab === 'hours') && restaurants.length > 1 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Select Restaurant:
            </label>
            <select
              value={selectedVendorId || ''}
              onChange={(e) => setSelectedVendorId(Number(e.target.value))}
              className="w-full md:w-auto px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border-4 border-dashed border-gray-300">
            <div className="max-w-lg mx-auto px-6">
              {/* Large Icon */}
              <div className="mb-6 relative">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Store className="w-16 h-16 text-emerald-600" />
                </div>
                <div className="absolute top-0 right-1/3 animate-bounce">
                  <span className="text-4xl">👈</span>
                </div>
              </div>
              
              {/* Main Message */}
              <h3 className="text-3xl font-bold text-gray-900 mb-3">No Restaurants Yet</h3>
              <p className="text-emerald-600 text-2xl font-bold mb-4">Let's Get Started! 🎉</p>
              
              {/* Friendly Explanation */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6 text-left">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Why Add Your Restaurant?
                </h4>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Customers can find you easily online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Show what type of food you serve</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Attract more visitors to your business</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Takes only 2 minutes to complete!</span>
                  </li>
                </ul>
              </div>
              
              {/* Big Action Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-bold text-xl shadow-2xl transform hover:scale-105 border-4 border-emerald-200"
              >
                <Plus className="w-7 h-7" />
                <span>ADD MY FIRST RESTAURANT NOW</span>
                <span className="text-2xl">→</span>
              </button>
              
              <p className="text-gray-500 text-sm mt-4">
                ⏱️ Quick and easy - no technical skills needed!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Success Badge */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900">Great Job! Your Restaurants are Listed 🎉</h3>
                <p className="text-green-700 text-sm">You have {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''} listed. You can edit or add more below.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-bold shadow-lg border-2 border-white"
              >
                <Plus className="w-5 h-5" />
                Add Another
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border-2 border-gray-100 hover:border-emerald-300 transform hover:-translate-y-1 relative">
                  {/* Status Toggle - Top Right Corner */}
                  <button
                    onClick={() => handleToggleStatus(restaurant.id, restaurant.is_open ?? true)}
                    className={`absolute top-4 right-4 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                      (restaurant.is_open ?? true)
                        ? 'bg-green-500 text-white hover:bg-green-600 border-2 border-green-400' 
                        : 'bg-red-500 text-white hover:bg-red-600 border-2 border-red-400'
                    }`}
                    title={`Click to ${(restaurant.is_open ?? true) ? 'close' : 'open'} restaurant`}
                  >
                    <span className="text-lg">{(restaurant.is_open ?? true) ? '✓' : '✕'}</span>
                    <span className="font-bold">{(restaurant.is_open ?? true) ? 'OPEN' : 'CLOSED'}</span>
                  </button>

                  {/* Restaurant Header */}
                  <div className="mb-4 pr-32">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-xl">
                        <Store className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium">{restaurant.city}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cuisine Tags */}
                    {restaurant.cuisines && restaurant.cuisines.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Food Types:</p>
                        <div className="flex flex-wrap gap-2">
                          {restaurant.cuisines.map((cuisine, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-bold rounded-full border border-emerald-200">
                              🍽️ {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - More Descriptive */}
                  <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
                    <button
                      onClick={() => handleEdit(restaurant)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all font-bold border-2 border-blue-200 hover:border-blue-300"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span>Edit Info</span>
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all font-bold border-2 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Remove</span>
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
      </main>

      {/* Add/Edit Modal - Super User Friendly */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border-4 border-emerald-200">
            {/* Colorful Header */}
            <div className="sticky top-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white px-8 py-8 rounded-t-3xl">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">
                    {editingRestaurant ? '✏️ Update Your Restaurant' : '🎉 Add Your Restaurant'}
                  </h2>
                  <p className="text-emerald-100 text-base mt-1">
                    {editingRestaurant ? 'Make changes to your restaurant information below' : "Fill out this simple form - it only takes 2 minutes!"}
                  </p>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-4">
                <p className="text-sm font-semibold mb-2">What you'll need:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">✓ Restaurant name</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">✓ City location</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">✓ Type of food</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Step 1: Basic Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-8 border-blue-500 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-xl">Basic Information</h3>
                    <p className="text-sm text-blue-700">Tell us about your restaurant</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-gray-900 font-bold mb-2 text-lg">
                    📝 What's your restaurant called? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Mario's Italian Bistro, Sushi Palace, Burger King"
                    required
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-lg"
                  />
                  <p className="text-gray-600 text-sm mt-2">💡 Use the name customers know you by</p>
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2 text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Which city are you in? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="e.g., Kuala Lumpur, Langkawi, Penang, Kedah"
                    required
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-lg"
                  />
                  <p className="text-gray-600 text-sm mt-2">💡 This helps customers find you</p>
                </div>
              </div>

              {/* Step 2: Cuisine Selection */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-8 border-purple-500 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-900 text-xl">What Food Do You Serve?</h3>
                    <p className="text-sm text-purple-700">Select all that apply - you can pick more than one!</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-4">
                  {cuisineOptions.map((cuisine) => (
                    <label 
                      key={cuisine} 
                      className={`
                        group flex items-center gap-3 p-5 border-3 rounded-2xl cursor-pointer transition-all transform hover:scale-105
                        ${formData.cuisines.includes(cuisine) 
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg scale-105' 
                          : 'border-gray-300 hover:border-emerald-300 hover:bg-gray-50 hover:shadow-md'
                        }
                      `}
                    >
                      <div className={`
                        w-7 h-7 rounded-lg border-3 flex items-center justify-center transition-all
                        ${formData.cuisines.includes(cuisine)
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-400 group-hover:border-emerald-400'
                        }
                      `}>
                        {formData.cuisines.includes(cuisine) && (
                          <span className="text-white font-bold text-lg">✓</span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.cuisines.includes(cuisine)}
                        onChange={() => handleCuisineChange(cuisine)}
                        className="sr-only"
                      />
                      <span className={`text-base font-bold ${formData.cuisines.includes(cuisine) ? 'text-emerald-900' : 'text-gray-700'}`}>
                        🍽️ {cuisine}
                      </span>
                    </label>
                  ))}
                </div>
                
                {formData.cuisines.length === 0 && (
                  <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <p className="text-red-800 font-semibold">Please select at least one type of food you serve</p>
                  </div>
                )}
                
                {formData.cuisines.length > 0 && (
                  <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-3xl">✅</span>
                    <p className="text-green-800 font-semibold">
                      Great! You've selected {formData.cuisines.length} cuisine type{formData.cuisines.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* NEW: Business Profile Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-8 border-indigo-500 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-xl">Business Details</h3>
                    <p className="text-sm text-indigo-700">Tell customers about your restaurant</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2 text-lg">
                    📝 About Your Restaurant
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your restaurant, specialties, ambiance, history..."
                    rows={4}
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all text-lg"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">
                      📅 Year Established (Optional)
                    </label>
                    <input
                      type="number"
                      name="established_year"
                      value={formData.established_year}
                      onChange={(e) => setFormData({...formData, established_year: e.target.value})}
                      placeholder="e.g., 2010"
                      className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-2">
                      💰 Price Range
                    </label>
                    <select
                      name="price_range"
                      value={formData.price_range}
                      onChange={(e) => setFormData({...formData, price_range: e.target.value})}
                      className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                    >
                      <option value="$">$ Budget (&lt; RM30)</option>
                      <option value="$$">$$ Moderate (RM30-80)</option>
                      <option value="$$$">$$$ Upscale (RM80-150)</option>
                      <option value="$$$$">$$$$ Fine Dining (&gt; RM150)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* NEW: Contact Information Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-8 border-emerald-500 p-6 rounded-xl shadow-sm mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-xl">📞 Contact Information</h3>
                    <p className="text-sm text-emerald-700">How customers can reach you</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    ☎️ Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    placeholder="+604-730 8888"
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    placeholder="info@restaurant.com"
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-900 font-bold mb-2">
                    📍 Full Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Street address, building, city, postal code"
                    rows={2}
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* NEW: Online Presence Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-8 border-blue-500 p-6 rounded-xl shadow-sm mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-xl">🌐 Online Presence</h3>
                    <p className="text-sm text-blue-700">Your website and social media links</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    🌐 Official Website
                  </label>
                  <input
                    type="url"
                    name="official_website"
                    value={formData.official_website}
                    onChange={(e) => setFormData({...formData, official_website: e.target.value})}
                    placeholder="https://yourrestaurant.com"
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    📘 Facebook Page
                  </label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                    placeholder="https://facebook.com/yourrestaurant"
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    📸 Instagram Profile
                  </label>
                  <input
                    type="url"
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                    placeholder="https://instagram.com/yourrestaurant"
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    ⭐ TripAdvisor Link
                  </label>
                  <input
                    type="url"
                    name="tripadvisor_url"
                    value={formData.tripadvisor_url}
                    onChange={(e) => setFormData({...formData, tripadvisor_url: e.target.value})}
                    placeholder="https://tripadvisor.com/..."
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-900 font-bold mb-2">
                    📍 Google Maps Link
                  </label>
                  <input
                    type="url"
                    name="google_maps_url"
                    value={formData.google_maps_url}
                    onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* NEW: Media Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-8 border-purple-500 p-6 rounded-xl shadow-sm mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    6
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-900 text-xl">📸 Images & Branding</h3>
                    <p className="text-sm text-purple-700">Logo, cover photo, and gallery images</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    🎨 Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                    placeholder="https://example.com/logo.jpg"
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    🖼️ Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="cover_image_url"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* NEW: Amenities Section */}
              <div className="bg-gradient-to-r from-green-50 to-lime-50 border-l-8 border-green-500 p-6 rounded-xl shadow-sm mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    7
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 text-xl">✨ Facilities & Amenities</h3>
                    <p className="text-sm text-green-700">What features do you offer?</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'parking', label: '🅿️ Parking', icon: '🅿️' },
                  { key: 'wifi', label: '📶 Free WiFi', icon: '📶' },
                  { key: 'wheelchair_accessible', label: '♿ Wheelchair Accessible', icon: '♿' },
                  { key: 'outdoor_seating', label: '🏠 Outdoor Seating', icon: '🏠' },
                  { key: 'halal_certified', label: '🍃 Halal Certified', icon: '🍃' },
                  { key: 'non_smoking', label: '🚭 Non-Smoking Area', icon: '🚭' },
                  { key: 'live_music', label: '🎵 Live Music', icon: '🎵' },
                  { key: 'tv_sports', label: '📺 TV/Sports', icon: '📺' },
                  { key: 'private_events', label: '🎉 Private Events', icon: '🎉' },
                  { key: 'delivery', label: '🚚 Delivery', icon: '🚚' },
                  { key: 'takeaway', label: '📦 Takeaway', icon: '📦' },
                  { key: 'reservations', label: '📅 Reservations', icon: '📅' },
                ].map((amenity) => (
                  <label
                    key={amenity.key}
                    className={`
                      flex items-center gap-2 px-4 py-3 border-3 rounded-2xl cursor-pointer transition-all transform hover:scale-105
                      ${formData.amenities[amenity.key as keyof typeof formData.amenities]
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-lg scale-105'
                        : 'border-gray-300 hover:border-green-300 hover:bg-gray-50 hover:shadow-md'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities[amenity.key as keyof typeof formData.amenities] || false}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          amenities: {
                            ...prev.amenities,
                            [amenity.key]: e.target.checked
                          }
                        }));
                      }}
                      className="w-5 h-5 text-green-600 border-gray-400 rounded focus:ring-green-500"
                    />
                    <span className={`text-sm font-bold ${formData.amenities[amenity.key as keyof typeof formData.amenities] ? 'text-green-900' : 'text-gray-700'}`}>
                      {amenity.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* NEW: Operational Options Section */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-8 border-amber-500 p-6 rounded-xl shadow-sm mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    8
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-xl">⚙️ Operational Settings</h3>
                    <p className="text-sm text-amber-700">Service options and policies</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 px-4 py-3 bg-white border-3 border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.delivery_available}
                      onChange={(e) => setFormData({...formData, delivery_available: e.target.checked})}
                      className="w-5 h-5 text-amber-600 border-gray-400 rounded focus:ring-amber-500"
                    />
                    <span className="text-gray-900 font-bold">🚚 Delivery Available</span>
                  </label>

                  <label className="flex items-center gap-3 px-4 py-3 bg-white border-3 border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.takeaway_available}
                      onChange={(e) => setFormData({...formData, takeaway_available: e.target.checked})}
                      className="w-5 h-5 text-amber-600 border-gray-400 rounded focus:ring-amber-500"
                    />
                    <span className="text-gray-900 font-bold">📦 Takeaway Available</span>
                  </label>

                  <label className="flex items-center gap-3 px-4 py-3 bg-white border-3 border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.reservation_required}
                      onChange={(e) => setFormData({...formData, reservation_required: e.target.checked})}
                      className="w-5 h-5 text-amber-600 border-gray-400 rounded focus:ring-amber-500"
                    />
                    <span className="text-gray-900 font-bold">📅 Reservation Required</span>
                  </label>
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    👔 Dress Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="dress_code"
                    value={formData.dress_code}
                    onChange={(e) => setFormData({...formData, dress_code: e.target.value})}
                    placeholder="e.g., Casual, Smart Casual, Formal"
                    className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Step 9: Optional Location */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-l-8 border-gray-400 p-6 rounded-xl shadow-sm mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    9
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">
                      Map Location <span className="text-gray-500 text-base font-normal">(Optional - You Can Skip This)</span>
                    </h3>
                    <p className="text-sm text-gray-700">Only if you know your GPS coordinates - otherwise leave empty</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Latitude (Optional)
                  </label>
                  <input
                    type="number"
                    name="lat"
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: e.target.value})}
                    placeholder="e.g., 3.1390"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-gray-200 focus:border-gray-500 transition-all"
                  />
                  <p className="text-gray-500 text-xs mt-1">💡 Skip if you don't know</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Longitude (Optional)
                  </label>
                  <input
                    type="number"
                    name="lon"
                    value={formData.lon}
                    onChange={(e) => setFormData({...formData, lon: e.target.value})}
                    placeholder="e.g., 101.6869"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-gray-200 focus:border-gray-500 transition-all"
                  />
                  <p className="text-gray-500 text-xs mt-1">💡 Skip if you don't know</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-8 border-t-3 border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-8 py-4 border-3 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.cuisines.length === 0}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {loading ? '⏳ Saving Your Restaurant...' : (editingRestaurant ? '✅ UPDATE RESTAURANT' : '✅ ADD RESTAURANT NOW')}
                </button>
              </div>
              
              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-blue-800 text-sm">
                  <span className="font-bold">Need help?</span> Don't worry! Just fill in the required fields marked with <span className="text-red-500">*</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
