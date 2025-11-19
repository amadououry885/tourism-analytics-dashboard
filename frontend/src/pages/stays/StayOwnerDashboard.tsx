import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Phone, 
  MapPin,
  Wifi,
  Coffee,
  Car,
  Tv,
  Wind,
  Users,
  Star,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { FormInput } from '../../components/FormInput';
import { FormSelect } from '../../components/FormSelect';

interface Stay {
  id: number;
  name: string;
  type: string;
  district: string;
  rating?: number;
  priceNight: number;
  amenities: string[];
  lat?: number;
  lon?: number;
  images?: string[];
  landmark?: string;
  distanceKm?: number;
  is_active: boolean;
  owner?: number;
  owner_username?: string;
  booking_com_url?: string;
  agoda_url?: string;
  booking_provider?: string;
}

const StayOwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { request, loading } = useApi();
  const navigate = useNavigate();
  
  const [stays, setStays] = useState<Stay[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStay, setEditingStay] = useState<Stay | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    district: '',
    priceNight: '',
    amenities: [] as string[],
    landmark: '',
    lat: '',
    lon: '',
    booking_com_url: '',
    agoda_url: '',
    booking_provider: 'booking.com',
  });

  const stayTypes = [
    { value: 'Hotel', label: '🏨 Hotel' },
    { value: 'Apartment', label: '🏢 Apartment' },
    { value: 'Guest House', label: '🏚️ Guest House' },
    { value: 'Homestay', label: '🏠 Homestay' },
  ];

  const commonAmenities = [
    'WiFi',
    'Parking',
    'Pool',
    'Gym',
    'Breakfast',
    'Air Conditioning',
    'Kitchen',
    'TV',
    'Laundry',
    'Pet Friendly',
  ];

  useEffect(() => {
    fetchStays();
  }, []);

  const fetchStays = async () => {
    try {
      console.log('Fetching stays...');
      const data = await request('/stays/');
      console.log('Stays data:', data);
      // Handle paginated response - extract results array
      setStays(data.results || data); // Use results if paginated, otherwise use data directly
    } catch (error) {
      console.error('Failed to fetch stays:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStay) {
        await request(
          `/stays/${editingStay.id}/`,
          {
            method: 'PUT',
            body: JSON.stringify(formData),
          },
          '✅ Accommodation updated successfully!'
        );
      } else {
        await request(
          '/stays/',
          {
            method: 'POST',
            body: JSON.stringify(formData),
          },
          '✅ Accommodation added successfully!'
        );
      }
      
      fetchStays();
      resetForm();
    } catch (error) {
      console.error('Failed to save accommodation:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this accommodation?')) {
      try {
        await request(
          `/stays/${id}/`,
          { method: 'DELETE' },
          '✅ Accommodation deleted successfully!'
        );
        fetchStays();
      } catch (error) {
        console.error('Failed to delete accommodation:', error);
      }
    }
  };

  const handleEdit = (stay: Stay) => {
    setEditingStay(stay);
    setFormData({
      name: stay.name,
      type: stay.type,
      district: stay.district,
      priceNight: stay.priceNight.toString(),
      amenities: stay.amenities || [],
      landmark: stay.landmark || '',
      lat: stay.lat?.toString() || '',
      lon: stay.lon?.toString() || '',
      booking_com_url: stay.booking_com_url || '',
      agoda_url: stay.agoda_url || '',
      booking_provider: stay.booking_provider || 'booking.com',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      district: '',
      priceNight: '',
      amenities: [],
      landmark: '',
      lat: '',
      lon: '',
      booking_com_url: '',
      agoda_url: '',
      booking_provider: 'booking.com',
    });
    setEditingStay(null);
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
              <Building2 className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Accommodations</h1>
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Manage Your Properties 🏨</h2>
          <p className="text-green-100 mb-4">
            List your hotels, apartments, or homestays and welcome more guests!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            ➕ Add My First Property
          </button>
        </div>

        {/* Stays Grid */}
        {stays.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mb-6">
              <Building2 className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 text-lg mb-2">Let's get started! 🚀</p>
              <p className="text-gray-500 max-w-md mx-auto">
                Click the button below to list your accommodation. It's quick and easy!
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg"
            >
              <Plus className="w-6 h-6" />
              Add My Property
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Your Properties ({stays.length})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Another Property
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stays.map((stay) => (
                <div key={stay.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-2 border-transparent hover:border-green-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{stay.name}</h3>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        {stay.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{stay.district}</span>
                    </div>
                    {stay.landmark && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs">Near {stay.landmark}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-lg font-bold text-green-700">RM {stay.priceNight}/night</span>
                    </div>
                    {stay.rating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{stay.rating}/10</span>
                      </div>
                    )}
                  </div>

                  {stay.amenities && stay.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 mb-4">
                      {stay.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {amenity}
                        </span>
                      ))}
                      {stay.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          +{stay.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(stay)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(stay.id)}
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

      {/* Add/Edit Modal - User Friendly */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingStay ? '✏️ Update Your Property' : '➕ Add Your Property'}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {editingStay ? 'Make changes to your property info' : "Let's get your accommodation listed! Fill in the details below"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Step 1: Basic Info */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-blue-900 mb-1">📝 Step 1: Basic Information</h3>
                <p className="text-sm text-blue-700">Tell us about your property</p>
              </div>

              <FormInput
                label="Property Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Sunset Beach Resort"
                required
                hint="What's the name of your hotel/property?"
              />

              <FormSelect
                label="Property Type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                options={stayTypes}
                required
                hint="What type of accommodation do you offer?"
              />

              {/* Step 2: Location */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-bold text-green-900 mb-1">📍 Step 2: Where Is Your Property?</h3>
                <p className="text-sm text-green-700">Help guests find you easily</p>
              </div>

              <FormInput
                label="District or Area"
                name="district"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                placeholder="e.g., Langkawi, Alor Setar, Kuah"
                required
                icon={<MapPin className="w-5 h-5" />}
                hint="Which area/district is your property in?"
              />

              <FormInput
                label="Nearby Landmark (Optional)"
                name="landmark"
                value={formData.landmark}
                onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                placeholder="e.g., Near Pantai Cenang Beach"
                hint="Any famous place nearby? (You can skip this)"
              />

              {/* Step 3: Pricing */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h3 className="font-bold text-yellow-900 mb-1">💰 Step 3: How Much Per Night?</h3>
                <p className="text-sm text-yellow-700">Set your nightly rate</p>
              </div>

              <FormInput
                label="Price Per Night (RM)"
                name="priceNight"
                type="number"
                step="0.01"
                value={formData.priceNight}
                onChange={(e) => setFormData({...formData, priceNight: e.target.value})}
                placeholder="e.g., 150"
                required
                icon={<DollarSign className="w-5 h-5" />}
                hint="How much do you charge per night? (in Malaysian Ringgit)"
              />

              {/* Step 4: Amenities */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-1">✨ Step 4: What Do You Offer?</h3>
                <p className="text-sm text-purple-700">Select all amenities available (guests love to know this!)</p>
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-2 gap-3">
                  {commonAmenities.map((amenity) => (
                    <label 
                      key={amenity} 
                      className={`
                        flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                        ${formData.amenities.includes(amenity) 
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="w-5 h-5 text-green-600 rounded"
                      />
                      <span className="text-sm font-medium">{amenity}</span>
                      {formData.amenities.includes(amenity) && (
                        <span className="ml-auto text-green-600">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional GPS Location */}
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-1">🗺️ Step 5: GPS Location (Optional)</h3>
                <p className="text-sm text-gray-700">Help guests find you on the map - you can skip this if you don't know</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  label="Latitude (Optional)"
                  name="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  placeholder="e.g., 6.3500"
                  hint="You can skip this"
                />
                <FormInput
                  label="Longitude (Optional)"
                  name="lon"
                  type="number"
                  step="any"
                  value={formData.lon}
                  onChange={(e) => setFormData({...formData, lon: e.target.value})}
                  placeholder="e.g., 99.8000"
                  hint="You can skip this"
                />
              </div>

              {/* Step 6: Booking Platform Integration */}
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                <h3 className="font-bold text-indigo-900 mb-1">🔗 Step 6: Online Booking Links</h3>
                <p className="text-sm text-indigo-700">Add links to your property on Booking.com or Agoda</p>
              </div>

              <FormSelect
                label="Booking Provider"
                name="booking_provider"
                value={formData.booking_provider}
                onChange={(e) => setFormData({...formData, booking_provider: e.target.value})}
                options={[
                  { value: 'booking.com', label: '🔵 Booking.com' },
                  { value: 'agoda', label: '🟣 Agoda' },
                  { value: 'both', label: '🎯 Both Platforms' },
                  { value: 'direct', label: '📞 Direct Booking Only' },
                ]}
                hint="Where can guests book your property online?"
              />

              {(formData.booking_provider === 'booking.com' || formData.booking_provider === 'both') && (
                <FormInput
                  label="Booking.com Property URL"
                  name="booking_com_url"
                  type="url"
                  value={formData.booking_com_url}
                  onChange={(e) => setFormData({...formData, booking_com_url: e.target.value})}
                  placeholder="https://www.booking.com/hotel/my/your-property.html"
                  hint="Copy the full URL from your Booking.com property page"
                />
              )}

              {(formData.booking_provider === 'agoda' || formData.booking_provider === 'both') && (
                <FormInput
                  label="Agoda Property URL"
                  name="agoda_url"
                  type="url"
                  value={formData.agoda_url}
                  onChange={(e) => setFormData({...formData, agoda_url: e.target.value})}
                  placeholder="https://www.agoda.com/your-property"
                  hint="Copy the full URL from your Agoda property page"
                />
              )}

              {formData.booking_provider === 'direct' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Direct Booking:</strong> Guests will be able to search for your property on Booking.com using your property name and location.
                  </p>
                </div>
              )}

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
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Saving...' : (editingStay ? '✅ Update Property' : '✅ Add Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StayOwnerDashboard;
