import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  DollarSign,
  Home
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
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
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
      contact_email: (stay as any).contact_email || '',
      contact_phone: (stay as any).contact_phone || '',
      contact_whatsapp: (stay as any).contact_whatsapp || '',
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
      contact_email: '',
      contact_phone: '',
      contact_whatsapp: '',
    });
    setEditingStay(null);
    setShowAddModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f5f3ee' }}>
      {/* Sidebar - SAMS Portal Style */}
      <div 
        className="w-40 flex flex-col shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #d4a574 0%, #c89963 100%)'
        }}
      >
        {/* Logo */}
        <div className="p-6 flex justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
            🏨
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3">
          <button className="w-full text-white bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/30 transition-all shadow-md">
            <Building2 className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-medium">My Properties</span>
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full text-white hover:bg-white/20 rounded-lg p-3 text-center transition-all"
          >
            <Plus className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-medium">Add Property</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full text-white hover:bg-white/20 rounded-lg p-3 text-center transition-all"
          >
            <LogOut className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ marginLeft: '10rem' }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="cross-pattern-stay" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 L20 40 M0 20 L40 20" stroke="#d4a574" strokeWidth="1" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cross-pattern-stay)"/>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-8">
          {/* Back to Dashboard Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-white border-2 border-gray-900 hover:bg-gray-50 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Home className="w-5 h-5 text-gray-900" />
            <span className="text-gray-900 font-bold">Back to Analytics Dashboard</span>
          </Link>

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Accommodations</h1>
            <p className="text-lg text-gray-600">Welcome back, {user?.username}! 👋</p>
          </div>

          {/* Action Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full mb-8 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 rounded-2xl shadow-2xl p-8 text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg">
                🏨
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Manage Your Properties</h2>
                <p className="text-orange-100 text-lg">
                  List your hotels, apartments, or homestays and welcome more guests!
                </p>
              </div>
            </div>
          </button>

          {/* Stays Grid */}
          {stays.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-orange-200">
              <div className="mb-6">
                <Building2 className="w-24 h-24 text-orange-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 text-lg mb-2">Let's get started! 🚀</p>
                <p className="text-gray-500 max-w-md mx-auto">
                  Click the button above to list your accommodation. It's quick and easy!
                </p>
              </div>
            </div>
          ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Properties ({stays.length})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold shadow-md hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Another Property
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stays.map((stay) => (
                <div key={stay.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-orange-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{stay.name}</h3>
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                        {stay.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <span className="text-sm">{stay.district}</span>
                    </div>
                    {stay.landmark && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-xs">Near {stay.landmark}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <span className="text-lg font-bold text-orange-700">RM {stay.priceNight}/night</span>
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
        </div>
      </div>

      {/* Add/Edit Modal - Vibrant SAMS Portal Style */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={resetForm}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-4 border-orange-400"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Vibrant Header */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 text-white px-8 py-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                  🏨
                </div>
                <div>
                  <h2 className="text-3xl font-bold">
                    {editingStay ? 'Update Your Property' : 'Add Your Property'}
                  </h2>
                  <p className="text-orange-100 text-base mt-1">
                    {editingStay ? 'Make changes to your property information' : "Let's get your accommodation listed!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Basic Information - Orange */}
                <div className="bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-300 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-orange-900 text-lg">📝 Basic Information</h3>
                      <p className="text-sm text-orange-700">Tell us about your property</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
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
                  </div>
                </div>

                {/* Step 2: Location - Purple */}
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-300 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900 text-lg">📍 Location Details</h3>
                      <p className="text-sm text-purple-700">Where is your property?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
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

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormInput
                        label="Latitude (Optional)"
                        name="lat"
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => setFormData({...formData, lat: e.target.value})}
                        placeholder="e.g., 6.3500"
                        hint="GPS latitude"
                      />
                      <FormInput
                        label="Longitude (Optional)"
                        name="lon"
                        type="number"
                        step="any"
                        value={formData.lon}
                        onChange={(e) => setFormData({...formData, lon: e.target.value})}
                        placeholder="e.g., 99.8000"
                        hint="GPS longitude"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Pricing - Green */}
                <div className="bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-300 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 text-lg">💰 Pricing</h3>
                      <p className="text-sm text-green-700">Set your nightly rate</p>
                    </div>
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
                </div>

                {/* Step 4: Amenities - Blue */}
                <div className="bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-lg">✨ Amenities</h3>
                      <p className="text-sm text-blue-700">What do you offer?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {commonAmenities.map((amenity) => (
                      <label 
                        key={amenity} 
                        className={`
                          flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                          ${formData.amenities.includes(amenity) 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-sm font-medium">{amenity}</span>
                        {formData.amenities.includes(amenity) && (
                          <span className="ml-auto text-blue-600 font-bold">✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 5: Contact Information - Teal */}
                <div className="bg-gradient-to-r from-teal-100 to-teal-50 border-2 border-teal-300 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                      5
                    </div>
                    <div>
                      <h3 className="font-bold text-teal-900 text-lg">📞 Contact Information</h3>
                      <p className="text-sm text-teal-700">How can guests reach you?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormInput
                      label="Contact Email"
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="e.g., info@yourhotel.com"
                      icon={<Phone className="w-5 h-5" />}
                      hint="Email where guests can reach you"
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormInput
                        label="Contact Phone"
                        name="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                        placeholder="e.g., +60123456789"
                        icon={<Phone className="w-5 h-5" />}
                        hint="Phone number for calls"
                      />

                      <FormInput
                        label="WhatsApp Number"
                        name="contact_whatsapp"
                        type="tel"
                        value={formData.contact_whatsapp}
                        onChange={(e) => setFormData({...formData, contact_whatsapp: e.target.value})}
                        placeholder="e.g., +60123456789"
                        icon={<Phone className="w-5 h-5" />}
                        hint="WhatsApp for quick messages"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 6: Booking Platform Integration - Indigo */}
                <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 border-2 border-indigo-300 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                      6
                    </div>
                    <div>
                      <h3 className="font-bold text-indigo-900 text-lg">🔗 Online Booking</h3>
                      <p className="text-sm text-indigo-700">Add booking platform links (optional)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                          <strong>💡 Direct Booking:</strong> Guests will be able to search for your property using your property name and location.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-8 py-6 flex gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg"
              >
                ❌ Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading ? '⏳ Saving...' : (editingStay ? '✅ Update Property' : '✅ Add Property')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StayOwnerDashboard;
