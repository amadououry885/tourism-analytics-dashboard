import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  MapPin,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { FormInput } from '../../components/FormInput';

interface Restaurant {
  id: number;
  name: string;
  city: string;
  cuisines: string[];
  lat?: number;
  lon?: number;
  is_active: boolean;
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
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    cuisines: [] as string[],
    lat: '',
    lon: '',
  });

  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese',
    'French', 'American', 'Thai', 'Mediterranean', 'Malay', 'Other',
  ];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      console.log('Fetching vendors...');
      const data = await request('/vendors/');
      console.log('Vendors data:', data);
      // Handle paginated response - extract results array
      setRestaurants(data.results || data); // Use results if paginated, otherwise use data directly
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
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
    
    const payload = {
      name: formData.name,
      city: formData.city,
      cuisines: formData.cuisines,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lon: formData.lon ? parseFloat(formData.lon) : null,
    };

    console.log('Submitting payload:', payload);
    
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
    } catch (error) {
      console.error('Failed to save restaurant:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await request(
          `/vendors/${id}/`,
          { method: 'DELETE' },
          '✅ Restaurant deleted successfully!'
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
      lat: restaurant.lat?.toString() || '',
      lon: restaurant.lon?.toString() || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      cuisines: [],
      lat: '',
      lon: '',
    });
    setEditingRestaurant(null);
    setShowAddModal(false);
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card with Instructions */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Manage Your Restaurants 🍽️</h2>
          <p className="text-purple-100 mb-4">
            Add your restaurants, update menus, and attract more customers!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            ➕ Add My First Restaurant
          </button>
        </div>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mb-6">
              <Store className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Restaurants Yet</h3>
              <p className="text-gray-600 text-lg mb-2">Let's get started! 🚀</p>
              <p className="text-gray-500 max-w-md mx-auto">
                Click the button below to add your restaurant. It only takes a few minutes!
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg shadow-lg"
            >
              <Plus className="w-6 h-6" />
              Add My Restaurant
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Your Restaurants ({restaurants.length})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Another Restaurant
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-2 border-transparent hover:border-purple-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
                      {restaurant.cuisines && restaurant.cuisines.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {restaurant.cuisines.map((cuisine, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm">{restaurant.city}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(restaurant)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Modal - More User Friendly */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingRestaurant ? '✏️ Update Your Restaurant' : '➕ Add Your Restaurant'}
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                {editingRestaurant ? 'Make changes to your restaurant info' : "Let's get your restaurant listed! Fill in the details below"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Step 1: Basic Info */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-blue-900 mb-1">📝 Step 1: Basic Information</h3>
                <p className="text-sm text-blue-700">Tell us about your restaurant</p>
              </div>

              <FormInput
                label="Restaurant Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Mario's Italian Bistro"
                required
                hint="What do you call your restaurant?"
              />

              <FormInput
                label="City or Location"
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="e.g., Kuala Lumpur, Langkawi"
                required
                icon={<MapPin className="w-5 h-5" />}
                hint="Which city is your restaurant in?"
              />

              {/* Step 2: Cuisine Selection */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-1">🍽️ Step 2: What Food Do You Serve?</h3>
                <p className="text-sm text-purple-700">Select all types of food you offer (you can choose more than one!)</p>
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-2 gap-3">
                  {cuisineOptions.map((cuisine) => (
                    <label 
                      key={cuisine} 
                      className={`
                        flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                        ${formData.cuisines.includes(cuisine) 
                          ? 'border-purple-500 bg-purple-50 shadow-md' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.cuisines.includes(cuisine)}
                        onChange={() => handleCuisineChange(cuisine)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm font-medium">{cuisine}</span>
                      {formData.cuisines.includes(cuisine) && (
                        <span className="ml-auto text-purple-600">✓</span>
                      )}
                    </label>
                  ))}
                </div>
                {formData.cuisines.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">⚠️ Please select at least one cuisine type</p>
                )}
              </div>

              {/* Optional Location */}
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-1">📍 Step 3: Location (Optional)</h3>
                <p className="text-sm text-gray-700">Help customers find you on the map - you can skip this if you don't know</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  label="Latitude (Optional)"
                  name="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  placeholder="e.g., 3.1390"
                  hint="You can skip this"
                />
                <FormInput
                  label="Longitude (Optional)"
                  name="lon"
                  type="number"
                  step="any"
                  value={formData.lon}
                  onChange={(e) => setFormData({...formData, lon: e.target.value})}
                  placeholder="e.g., 101.6869"
                  hint="You can skip this"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg"
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.cuisines.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Saving...' : (editingRestaurant ? '✅ Update Restaurant' : '✅ Add Restaurant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
