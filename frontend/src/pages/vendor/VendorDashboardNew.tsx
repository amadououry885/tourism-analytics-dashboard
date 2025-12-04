import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Home,
  UtensilsCrossed,
  Clock,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Star,
  DollarSign,
  Menu,
  FileText,
  MapPin,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Restaurant {
  id: number;
  name: string;
  city: string;
  cuisines: string[];
  is_active: boolean;
  rating_average?: number;
  total_reviews?: number;
}

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  is_available: boolean;
  description?: string;
  image_url?: string;
  is_vegetarian?: boolean;
  is_halal?: boolean;
  spiciness_level?: number;
  allergens?: string;
}

interface OpeningHours {
  [key: string]: { open: string; close: string; is_open: boolean };
}

interface Stats {
  total_restaurants: number;
  total_menu_items: number;
  total_reviews: number;
  avg_rating: number;
}

export default function VendorDashboardNew() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState<'dashboard' | 'restaurants' | 'menu' | 'hours' | 'settings'>('dashboard');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_restaurants: 0,
    total_menu_items: 0,
    total_reviews: 0,
    avg_rating: 0,
  });
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<number | null>(null);
  
  // Restaurant form
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    tripadvisor: '',
    google_maps: '',
    cuisines: [] as string[],
    description: '',
    year_established: '',
    price_range: '$$ Moderate (RM30-80)',
    latitude: '',
    longitude: '',
    logo_url: '',
    cover_image_url: '',
    amenities: [] as string[],
    dress_code: '',
    delivery_available: false,
    takeaway_available: false,
    reservation_required: false,
  });

  // Menu form
  const [menuForm, setMenuForm] = useState({
    restaurant: '',
    name: '',
    category: '',
    description: '',
    price: '',
    image_url: '',
    is_vegetarian: false,
    is_halal: false,
    spiciness_level: 0,
    allergens: '',
  });

  // Opening hours
  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    monday: { open: '09:00', close: '22:00', is_open: true },
    tuesday: { open: '09:00', close: '22:00', is_open: true },
    wednesday: { open: '09:00', close: '22:00', is_open: true },
    thursday: { open: '09:00', close: '22:00', is_open: true },
    friday: { open: '09:00', close: '23:00', is_open: true },
    saturday: { open: '09:00', close: '23:00', is_open: true },
    sunday: { open: '10:00', close: '22:00', is_open: true },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restaurantsRes, menuRes] = await Promise.all([
        axios.get('/api/vendors/'),
        axios.get('/api/vendors/menu-items/'),
      ]);
      
      const vendorData = restaurantsRes.data.results || [];
      const menuData = menuRes.data || [];
      
      setRestaurants(vendorData);
      setMenuItems(menuData);
      
      // Calculate stats
      setStats({
        total_restaurants: vendorData.length,
        total_menu_items: menuData.length,
        total_reviews: vendorData.reduce((sum: number, r: Restaurant) => sum + (r.total_reviews || 0), 0),
        avg_rating: vendorData.length > 0 
          ? vendorData.reduce((sum: number, r: Restaurant) => sum + (r.rating_average || 0), 0) / vendorData.length
          : 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteRestaurant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await axios.delete(`/api/vendors/${id}/`);
      await fetchData();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/vendors/${id}/`, { is_active: !currentStatus });
      await fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Restaurant form handlers
  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...restaurantForm,
        cuisines: restaurantForm.cuisines.join(','),
        amenities: restaurantForm.amenities.join(','),
        latitude: restaurantForm.latitude ? parseFloat(restaurantForm.latitude) : null,
        longitude: restaurantForm.longitude ? parseFloat(restaurantForm.longitude) : null,
        year_established: restaurantForm.year_established ? parseInt(restaurantForm.year_established) : null,
      };

      if (editingRestaurant) {
        await axios.put(`/api/vendors/${editingRestaurant}/`, payload);
        alert('Restaurant updated successfully!');
      } else {
        await axios.post('/api/vendors/', payload);
        alert('Restaurant added successfully!');
      }
      
      setShowAddRestaurant(false);
      setEditingRestaurant(null);
      setRestaurantForm({
        name: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        facebook: '',
        instagram: '',
        tripadvisor: '',
        google_maps: '',
        cuisines: [],
        description: '',
        year_established: '',
        price_range: '$$ Moderate (RM30-80)',
        latitude: '',
        longitude: '',
        logo_url: '',
        cover_image_url: '',
        amenities: [],
        dress_code: '',
        delivery_available: false,
        takeaway_available: false,
        reservation_required: false,
      });
      await fetchData();
    } catch (error: any) {
      console.error('Error saving restaurant:', error);
      alert(error.response?.data?.detail || 'Failed to save restaurant');
    }
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant.id);
    // Load restaurant data into form
    axios.get(`/api/vendors/${restaurant.id}/`).then(res => {
      const data = res.data;
      setRestaurantForm({
        name: data.name || '',
        city: data.city || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        tripadvisor: data.tripadvisor || '',
        google_maps: data.google_maps || '',
        cuisines: data.cuisines ? data.cuisines.split(',').map((c: string) => c.trim()) : [],
        description: data.description || '',
        year_established: data.year_established?.toString() || '',
        price_range: data.price_range || '$$ Moderate (RM30-80)',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        logo_url: data.logo_url || '',
        cover_image_url: data.cover_image_url || '',
        amenities: data.amenities ? data.amenities.split(',').map((a: string) => a.trim()) : [],
        dress_code: data.dress_code || '',
        delivery_available: data.delivery_available || false,
        takeaway_available: data.takeaway_available || false,
        reservation_required: data.reservation_required || false,
      });
      setShowAddRestaurant(true);
      setActiveSection('restaurants');
    });
  };

  // Menu form handlers
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.restaurant) {
      alert('Please select a restaurant');
      return;
    }
    try {
      const payload = {
        ...menuForm,
        restaurant: parseInt(menuForm.restaurant),
        price: parseFloat(menuForm.price),
        spiciness_level: menuForm.spiciness_level,
      };
      await axios.post('/api/vendors/menu-items/', payload);
      alert('Menu item added successfully!');
      setMenuForm({
        restaurant: '',
        name: '',
        category: '',
        description: '',
        price: '',
        image_url: '',
        is_vegetarian: false,
        is_halal: false,
        spiciness_level: 0,
        allergens: '',
      });
      setShowAddMenu(false);
      await fetchData();
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      alert(error.response?.data?.detail || 'Failed to add menu item');
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await axios.delete(`/api/vendors/menu-items/${id}/`);
      await fetchData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleToggleMenuAvailability = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/vendors/menu-items/${id}/`, { is_available: !currentStatus });
      await fetchData();
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Failed to update menu item');
    }
  };

  // Cuisine toggle
  const toggleCuisine = (cuisine: string) => {
    setRestaurantForm(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  // Amenity toggle
  const toggleAmenity = (amenity: string) => {
    setRestaurantForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'restaurants', label: 'My Restaurants', icon: Store },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'hours', label: 'Opening Hours', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: `
        linear-gradient(rgba(245, 243, 238, 0.95), rgba(245, 243, 238, 0.95)),
        repeating-linear-pattern`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}>
      {/* Left Sidebar */}
      <div style={{
        width: '160px',
        background: 'linear-gradient(180deg, #d4a574 0%, #c89963 100%)',
        padding: '32px 16px',
        flexShrink: 0,
        boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
      }}>
        {/* Logo */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '32px',
          }}>
            😊
          </div>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Pucece
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ marginBottom: '32px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 8px',
                  marginBottom: '8px',
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: 'white',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: isActive ? 'white' : 'rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon style={{ 
                    width: '20px', 
                    height: '20px',
                    color: isActive ? '#d4a574' : 'white',
                  }} />
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: isActive ? '600' : '500',
                  textAlign: 'center',
                  lineHeight: '1.3',
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Center Content Area */}
        <div style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            {/* Back to Analytics Dashboard Button */}
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'white',
                border: '2px solid #d4a574',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#d4a574',
                cursor: 'pointer',
                marginBottom: '24px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d4a574';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#d4a574';
              }}
            >
              <Home style={{ width: '18px', height: '18px' }} />
              Back to Analytics Dashboard
            </button>

            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              margin: 0,
              marginBottom: '8px',
              color: '#2d2d2d',
            }}>
              Super-Friendly 😊
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: '#666',
              margin: 0,
            }}>
              Your one-stop solution for managing your restaurant online
            </p>
          </div>
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <>
              {/* Large Action Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
                marginBottom: '32px',
              }}>
                {/* Add New Restaurant Card */}
                <button
                  onClick={() => {
                    setShowAddRestaurant(true);
                    setEditingRestaurant(null);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '48px 32px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
                    transition: 'transform 0.2s',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'white',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Store style={{ width: '40px', height: '40px', color: '#d4a574' }} />
                  </div>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                  }}>
                    Add New Restaurant
                  </span>
                </button>

                {/* Add New Menu Card */}
                <button
                  onClick={() => {
                    if (restaurants.length === 0) {
                      alert('Please add a restaurant first!');
                      return;
                    }
                    setShowAddMenu(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #6ba587 0%, #5a9175 100%)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '48px 32px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(107, 165, 135, 0.3)',
                    transition: 'transform 0.2s',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'white',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Menu style={{ width: '40px', height: '40px', color: '#6ba587' }} />
                  </div>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                  }}>
                    Add New Menu
                  </span>
                </button>
              </div>

              {/* Manage Section */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '24px',
                }}>
                  <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    margin: 0,
                    color: '#2d2d2d',
                  }}>
                    Manage Menus
                  </h2>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{
                      padding: '8px 20px',
                      background: '#6ba587',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}>
                      Rampage
                    </button>
                    <button style={{
                      padding: '8px 20px',
                      background: '#d4a574',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}>
                      Comagen
                    </button>
                    <button style={{
                      padding: '8px 20px',
                      background: '#e8a965',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}>
                      Eslace
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d2d2d',
                      marginBottom: '8px',
                    }}>
                      Restaurant Name
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                    }}>
                      <option>Restaurant</option>
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d2d2d',
                      marginBottom: '8px',
                    }}>
                      Contact Number
                    </label>
                    <input 
                      type="text"
                      placeholder="Restaurant"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d2d2d',
                      marginBottom: '8px',
                    }}>
                      Eggall Conyine
                    </label>
                    <input 
                      type="text"
                      placeholder="Manual"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d2d2d',
                      marginBottom: '8px',
                    }}>
                      Contact Number
                    </label>
                    <input 
                      type="text"
                      placeholder="Contact Number"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d2d2d',
                      marginBottom: '8px',
                    }}>
                      Vagge Eunnfels
                    </label>
                    <input 
                      type="text"
                      placeholder="Contact Number"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d2d2d',
                      marginBottom: '8px',
                    }}>
                      Pocuet
                    </label>
                    <input 
                      type="text"
                      placeholder="Contact Number"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

        {/* Restaurants Section */}
        {activeSection === 'restaurants' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2d2d2d' }}>
                My Restaurants 🍽️
              </h2>
              <button
                onClick={() => {
                  setShowAddRestaurant(true);
                  setEditingRestaurant(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Plus style={{ width: '20px', height: '20px' }} />
                Add Restaurant
              </button>
            </div>

            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Great Job! Your Restaurants are Listed 🎉<br/>
              You have {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} listed. You can edit or add more below.
            </p>

            {/* Restaurants Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px',
            }}>
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Store style={{ width: '24px', height: '24px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '4px', color: '#2d2d2d' }}>
                        {restaurant.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '14px', height: '14px' }} />
                        {restaurant.city}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>Food Types:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(restaurant.cuisines || []).slice(0, 3).map((cuisine, idx) => (
                        <span key={idx} style={{
                          padding: '4px 12px',
                          background: '#f3f4f6',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#666',
                        }}>
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditRestaurant(restaurant)}
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Edit2 style={{ width: '14px', height: '14px' }} />
                      Edit Info
                    </button>
                    <button
                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#991b1b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {restaurants.length === 0 && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <Store style={{ width: '64px', height: '64px', color: '#d4a574', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#2d2d2d' }}>
                  No Restaurants Yet
                </h3>
                <p style={{ color: '#666', marginBottom: '24px' }}>
                  Click "Add Restaurant" to get started!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Menu Management Section */}
        {activeSection === 'menu' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              Menu Management
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Select a restaurant to manage its menu items
            </p>
            {/* Menu management component would go here */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <UtensilsCrossed style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
              <p style={{ color: '#6b7280' }}>Select a restaurant from the dropdown to manage menu items</p>
            </div>
          </div>
        )}

        {/* Opening Hours Section */}
        {activeSection === 'hours' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              Opening Hours
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Set your restaurant opening hours
            </p>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <Clock style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
              <p style={{ color: '#6b7280' }}>Select a restaurant to manage opening hours</p>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              Settings
            </h2>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                Account Information
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Username: {user?.username}
              </p>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Email: {user?.email}
              </p>
              <p style={{ color: '#6b7280' }}>
                Role: Vendor
              </p>
            </div>
          </div>
        )}
        </div>

        {/* Right Sidebar - Process Steps */}
        <div style={{
          width: '320px',
          padding: '40px 24px',
          background: 'rgba(255, 255, 255, 0.6)',
          overflow: 'auto',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#2d2d2d',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            How It Works
          </h3>

          {/* Step 1 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            position: 'relative',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <FileText style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d2d2d',
              marginBottom: '8px',
            }}>
              Enter Restaurant Details
            </h4>
            <p style={{
              fontSize: '13px',
              color: '#666',
              lineHeight: '1.5',
              margin: 0,
            }}>
              Fill in basic information about your restaurant including name, location, and contact details
            </p>
          </div>

          {/* Connector Line */}
          <div style={{
            width: '2px',
            height: '24px',
            background: 'repeating-linear-gradient(to bottom, #d4a574 0, #d4a574 4px, transparent 4px, transparent 8px)',
            margin: '0 auto 16px',
          }} />

          {/* Step 2 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #6ba587 0%, #5a9175 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <Menu style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d2d2d',
              marginBottom: '8px',
            }}>
              Set Up Your Menu
            </h4>
            <p style={{
              fontSize: '13px',
              color: '#666',
              lineHeight: '1.5',
              margin: 0,
            }}>
              Add your delicious dishes, set prices, and upload mouth-watering photos
            </p>
          </div>

          {/* Connector Line */}
          <div style={{
            width: '2px',
            height: '24px',
            background: 'repeating-linear-gradient(to bottom, #d4a574 0, #d4a574 4px, transparent 4px, transparent 8px)',
            margin: '0 auto 16px',
          }} />

          {/* Step 3 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #e8a965 0%, #d99a58 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <Clock style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d2d2d',
              marginBottom: '8px',
            }}>
              Set Opening Hours
            </h4>
            <p style={{
              fontSize: '13px',
              color: '#666',
              lineHeight: '1.5',
              margin: 0,
            }}>
              Let customers know when you're open for business
            </p>
          </div>

          {/* Connector Line */}
          <div style={{
            width: '2px',
            height: '24px',
            background: 'repeating-linear-gradient(to bottom, #d4a574 0, #d4a574 4px, transparent 4px, transparent 8px)',
            margin: '0 auto 16px',
          }} />

          {/* Step 4 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <Store style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d2d2d',
              marginBottom: '8px',
            }}>
              Now You Own Restaurant! 🎉
            </h4>
            <p style={{
              fontSize: '13px',
              color: '#666',
              lineHeight: '1.5',
              margin: 0,
            }}>
              Your restaurant is live and ready to receive customers
            </p>
          </div>

          {/* Footer Note */}
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#999',
            fontStyle: 'italic',
          }}>
            Simple & Easy Management
          </div>
        </div>
      </div>

      {/* Restaurant Form Modal */}
      {showAddRestaurant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '32px',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#2d2d2d' }}>
              {editingRestaurant ? '✏️ Update Your Restaurant' : '📝 About Your Restaurant'}
            </h2>
            
            <form onSubmit={handleRestaurantSubmit}>
              {/* Basic Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d2d2d' }}>
                  Basic Information
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Tell us about your restaurant
                </p>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      📝 What's your restaurant called? *
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantForm.name}
                      onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                      placeholder="e.g., Nasi Kandar Pelita"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      💡 Use the name customers know you by
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      📍 Which city are you in? *
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantForm.city}
                      onChange={(e) => setRestaurantForm({...restaurantForm, city: e.target.value})}
                      placeholder="e.g., Kulim, Langkawi"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      ⭐ This helps customers find you
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      What Food Do You Serve?
                    </label>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                      Select all that apply - you can pick more than one!
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai', 'Korean', 'Malaysian', 'Seafood', 'Western', 'Vegetarian', 'Halal'].map(cuisine => (
                        <label key={cuisine} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={restaurantForm.cuisines.includes(cuisine)}
                            onChange={() => toggleCuisine(cuisine)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '14px' }}>{cuisine}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d2d2d' }}>
                  📞 Contact Information
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  How customers can reach you
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      📞 Phone Number
                    </label>
                    <input
                      type="text"
                      value={restaurantForm.phone}
                      onChange={(e) => setRestaurantForm({...restaurantForm, phone: e.target.value})}
                      placeholder="+604-730 8888"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      📧 Email Address
                    </label>
                    <input
                      type="email"
                      value={restaurantForm.email}
                      onChange={(e) => setRestaurantForm({...restaurantForm, email: e.target.value})}
                      placeholder="info@restaurant.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    📌 Full Address
                  </label>
                  <textarea
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({...restaurantForm, address: e.target.value})}
                    placeholder="Street address, building, city, postal code"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Online Presence */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d2d2d' }}>
                  🌐 Online Presence
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Your website and social media links
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      🌍 Official Website
                    </label>
                    <input
                      type="url"
                      value={restaurantForm.website}
                      onChange={(e) => setRestaurantForm({...restaurantForm, website: e.target.value})}
                      placeholder="https://yourrestaurant.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      📘 Facebook Page
                    </label>
                    <input
                      type="url"
                      value={restaurantForm.facebook}
                      onChange={(e) => setRestaurantForm({...restaurantForm, facebook: e.target.value})}
                      placeholder="https://facebook.com/yourrestaurant"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      📸 Instagram Profile
                    </label>
                    <input
                      type="url"
                      value={restaurantForm.instagram}
                      onChange={(e) => setRestaurantForm({...restaurantForm, instagram: e.target.value})}
                      placeholder="https://instagram.com/yourrestaurant"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      ⭐ TripAdvisor Link
                    </label>
                    <input
                      type="url"
                      value={restaurantForm.tripadvisor}
                      onChange={(e) => setRestaurantForm({...restaurantForm, tripadvisor: e.target.value})}
                      placeholder="https://tripadvisor.com/..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Images & Branding */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d2d2d' }}>
                  🖼️ Images & Branding
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Make your restaurant look attractive!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={restaurantForm.logo_url}
                      onChange={(e) => setRestaurantForm({...restaurantForm, logo_url: e.target.value})}
                      placeholder="https://example.com/logo.jpg"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={restaurantForm.cover_image_url}
                      onChange={(e) => setRestaurantForm({...restaurantForm, cover_image_url: e.target.value})}
                      placeholder="https://example.com/cover.jpg"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Facilities & Amenities */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d2d2d' }}>
                  ⭐ Facilities & Amenities
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  What features do you offer?
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {['Parking', 'Outdoor Seating', 'Live Music', 'Delivery', 'Free WiFi', 'Halal Certified', 'TV/Sports', 'Takeaway', 'Wheelchair Accessible', 'Non-Smoking Area', 'Private Events', 'Reservations'].map(amenity => (
                    <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={restaurantForm.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '13px' }}>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Operational Settings */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d2d2d' }}>
                  ⚙️ Operational Settings
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Service options and policies
                </p>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={restaurantForm.delivery_available}
                      onChange={(e) => setRestaurantForm({...restaurantForm, delivery_available: e.target.checked})}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>🚚 Delivery Available</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={restaurantForm.takeaway_available}
                      onChange={(e) => setRestaurantForm({...restaurantForm, takeaway_available: e.target.checked})}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>🥡 Takeaway Available</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={restaurantForm.reservation_required}
                      onChange={(e) => setRestaurantForm({...restaurantForm, reservation_required: e.target.checked})}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>🎫 Reservation Required</span>
                  </label>
                </div>

                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      💰 Price Range
                    </label>
                    <select
                      value={restaurantForm.price_range}
                      onChange={(e) => setRestaurantForm({...restaurantForm, price_range: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <option>$ Budget (RM10-30)</option>
                      <option>$$ Moderate (RM30-80)</option>
                      <option>$$$ Fine Dining (RM80-150)</option>
                      <option>$$$$ Luxury (RM150+)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      👔 Dress Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={restaurantForm.dress_code}
                      onChange={(e) => setRestaurantForm({...restaurantForm, dress_code: e.target.value})}
                      placeholder="e.g., Casual, Smart Casual, Formal"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* About */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d2d2d' }}>
                  📖 About Your Restaurant
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Describe your restaurant, specialties, ambiance, history...
                </p>

                <textarea
                  value={restaurantForm.description}
                  onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                  placeholder="Tell customers what makes your restaurant special..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    🎂 Year Established (Optional)
                  </label>
                  <input
                    type="number"
                    value={restaurantForm.year_established}
                    onChange={(e) => setRestaurantForm({...restaurantForm, year_established: e.target.value})}
                    placeholder="e.g., 2010"
                    style={{
                      width: '200px',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* Map Location */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#2d2d2d' }}>
                  📍 Map Location (Optional - You Can Skip This)
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Only if you know your GPS coordinates - otherwise leave empty
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Latitude (Optional)
                    </label>
                    <input
                      type="text"
                      value={restaurantForm.latitude}
                      onChange={(e) => setRestaurantForm({...restaurantForm, latitude: e.target.value})}
                      placeholder="e.g., 3.1390"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                    <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                      💡 Skip if you don't know
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Longitude (Optional)
                    </label>
                    <input
                      type="text"
                      value={restaurantForm.longitude}
                      onChange={(e) => setRestaurantForm({...restaurantForm, longitude: e.target.value})}
                      placeholder="e.g., 101.6869"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                    <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                      💡 Skip if you don't know
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRestaurant(false);
                    setEditingRestaurant(null);
                  }}
                  style={{
                    padding: '12px 32px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  ✓ {editingRestaurant ? 'UPDATE RESTAURANT' : 'CREATE RESTAURANT'}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '16px' }}>
                Need help? Don't worry! Just fill in the required fields marked with *
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Menu Form Modal */}
      {showAddMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '32px',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#2d2d2d' }}>
              🍽️ Add New Menu Item
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Add your delicious dishes, set prices, and upload mouth-watering photos
            </p>
            
            <form onSubmit={handleMenuSubmit}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    🏪 Restaurant *
                  </label>
                  <select
                    required
                    value={menuForm.restaurant}
                    onChange={(e) => setMenuForm({...menuForm, restaurant: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    📝 Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                    placeholder="e.g., Nasi Lemak Special"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    📂 Category *
                  </label>
                  <select
                    required
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Select Category</option>
                    <option>Appetizers</option>
                    <option>Main Courses</option>
                    <option>Desserts</option>
                    <option>Drinks</option>
                    <option>Sides</option>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    📖 Description
                  </label>
                  <textarea
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                    placeholder="Describe your dish..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    💰 Price (RM) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                    placeholder="e.g., 15.90"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    🖼️ Image URL
                  </label>
                  <input
                    type="url"
                    value={menuForm.image_url}
                    onChange={(e) => setMenuForm({...menuForm, image_url: e.target.value})}
                    placeholder="https://example.com/dish.jpg"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    🏷️ Special Tags
                  </label>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={menuForm.is_vegetarian}
                        onChange={(e) => setMenuForm({...menuForm, is_vegetarian: e.target.checked})}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px' }}>🥬 Vegetarian</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={menuForm.is_halal}
                        onChange={(e) => setMenuForm({...menuForm, is_halal: e.target.checked})}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px' }}>🕌 Halal</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    🌶️ Spiciness Level
                  </label>
                  <select
                    value={menuForm.spiciness_level}
                    onChange={(e) => setMenuForm({...menuForm, spiciness_level: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value={0}>Not Spicy</option>
                    <option value={1}>🌶️ Mild</option>
                    <option value={2}>🌶️🌶️ Medium</option>
                    <option value={3}>🌶️🌶️🌶️ Hot</option>
                    <option value={4}>🌶️🌶️🌶️🌶️ Extra Hot</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    ⚠️ Allergens (Optional)
                  </label>
                  <input
                    type="text"
                    value={menuForm.allergens}
                    onChange={(e) => setMenuForm({...menuForm, allergens: e.target.value})}
                    placeholder="e.g., Peanuts, Shellfish, Dairy"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '24px', marginTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMenu(false)}
                  style={{
                    padding: '12px 32px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #6ba587 0%, #5a9175 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  ✓ ADD MENU ITEM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
