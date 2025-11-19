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
                <div key={restaurant.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border-2 border-gray-100 hover:border-emerald-300 transform hover:-translate-y-1">
                  {/* Restaurant Header */}
                  <div className="mb-4">
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

              {/* Step 3: Optional Location */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-l-8 border-gray-400 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    3
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
