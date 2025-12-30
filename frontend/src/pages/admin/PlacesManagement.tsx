import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MapPin, Upload, Power } from 'lucide-react';
import axios from '../../services/api';

interface Place {
  id?: number;
  name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  country: string;
  is_free: boolean;
  is_open: boolean;
  price: string;
  currency: string;
  latitude: string;
  longitude: string;
  image_url: string;
  // New fields
  wikipedia_url?: string;
  official_website?: string;
  tripadvisor_url?: string;
  google_maps_url?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  opening_hours?: string;
  best_time_to_visit?: string;
  amenities?: {
    parking?: boolean;
    wifi?: boolean;
    wheelchair_accessible?: boolean;
    restaurant?: boolean;
    restroom?: boolean;
  };
}

const emptyPlace: Place = {
  name: '',
  description: '',
  category: '',
  city: '',
  state: 'Kedah',
  country: 'Malaysia',
  is_free: true,
  is_open: true,
  price: '0.00',
  currency: 'MYR',
  latitude: '',
  longitude: '',
  image_url: '',
  // New fields with defaults
  wikipedia_url: '',
  official_website: '',
  tripadvisor_url: '',
  google_maps_url: '',
  contact_phone: '',
  contact_email: '',
  address: '',
  opening_hours: '',
  best_time_to_visit: '',
  amenities: {
    parking: false,
    wifi: false,
    wheelchair_accessible: false,
    restaurant: false,
    restroom: false
  }
};

export default function PlacesManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState<Place>(emptyPlace);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      // Fetch all places without pagination
      const response = await axios.get('/places/?page_size=1000');
      const placesData = response.data.results || response.data;
      console.log('[Admin Places] First 3 places:', placesData.slice(0, 3).map((p: any) => ({ 
        name: p.name, 
        is_open: p.is_open 
      })));
      setPlaces(placesData);
      setError('');
    } catch (err: any) {
      setError('Failed to load places: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, GIF, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setSuccess('✓ Image selected! Click "SAVE PLACE" to save changes.');
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let finalFormData = { ...formData };

      // If there's an uploaded image file, convert to base64 and include in form data
      if (imageFile) {
        finalFormData.image_url = imagePreview; // Use base64 preview as image_url
      }

      if (editingPlace?.id) {
        // Update existing place
        await axios.put(`/places/${editingPlace.id}/`, finalFormData);
        setSuccess('Place updated successfully!');
      } else {
        // Create new place
        await axios.post('/places/', finalFormData);
        setSuccess('Place created successfully!');
      }
      
      fetchPlaces();
      handleCancel();
    } catch (err: any) {
      setError('Failed to save place: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setFormData(place);
    setIsAddingNew(false);
    // Load existing image preview
    setImageFile(null);
    setImagePreview(place.image_url || '');
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;

    try {
      await axios.delete(`/places/${id}/`);
      setSuccess('Place deleted successfully!');
      fetchPlaces();
    } catch (err: any) {
      setError('Failed to delete place: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await axios.post(`/places/${id}/toggle_status/`);
      const newStatus = response.data.is_open;
      setSuccess(`Place ${newStatus ? 'opened' : 'closed'} successfully!`);
      fetchPlaces();
    } catch (err: any) {
      setError('Failed to toggle status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setFormData(emptyPlace);
    setEditingPlace(null);
    setIsAddingNew(false);
    setImageFile(null);
    setImagePreview('');
  };

  const handleAddNew = () => {
    setFormData(emptyPlace);
    setEditingPlace(null);
    setIsAddingNew(true);
    setImageFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-600">Loading places...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Places Management</h1>
                <p className="text-gray-600">Add, edit, and manage tourism destinations</p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Place
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAddingNew || editingPlace) && (
          <div className={`rounded-lg shadow-lg p-6 mb-6 border-4 ${editingPlace ? 'bg-blue-50 border-blue-400' : 'bg-white border-emerald-400'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${editingPlace ? 'text-blue-900' : 'text-gray-900'}`}>
                {editingPlace ? '✏️ EDIT PLACE: ' + formData.name : '➕ ADD NEW PLACE'}
              </h2>
              {editingPlace && (
                <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-sm">
                  EDITING MODE
                </span>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Place Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Eagle Square"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select category...</option>
                    <option value="Tourist Attraction / Landmark">Tourist Attraction / Landmark</option>
                    <option value="Beach">Beach</option>
                    <option value="Museum">Museum</option>
                    <option value="Park">Park</option>
                    <option value="Temple">Temple</option>
                    <option value="Shopping Mall">Shopping Mall</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel">Hotel</option>
                    <option value="City">City</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Kuah (town)"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Kedah"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Place Image *
                  </label>
                  
                  {/* File Upload Button */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors shadow-md">
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">Choose Image from Computer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    
                    {/* OR divider */}
                    <div className="flex items-center gap-2">
                      <div className="h-px w-12 bg-gray-300"></div>
                      <span className="text-gray-500 text-sm">OR</span>
                      <div className="h-px w-12 bg-gray-300"></div>
                    </div>
                    
                    {/* URL Input */}
                    <div className="flex-1">
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Paste image URL"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    📁 Click "Choose Image" to upload from your computer, or paste an image URL
                  </p>
                  
                  {/* Image Preview */}
                  {(imagePreview || formData.image_url) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img
                        src={imagePreview || formData.image_url}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg border shadow-md"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.alt = 'Invalid image';
                        }}
                      />
                      {imageFile && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ Image selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Brief description of the place..."
                  />
                </div>

                {/* Pricing */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      name="is_free"
                      checked={formData.is_free}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Free Entry
                  </label>
                </div>

                {/* Open/Closed Status */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      name="is_open"
                      checked={formData.is_open}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Open for Visitors
                  </label>
                </div>

                {!formData.is_free && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="MYR">MYR (Malaysian Ringgit)</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="6.3200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="99.8431"
                  />
                </div>

                {/* External Links & Resources */}
                <div className="md:col-span-2 border-t-2 border-blue-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    🔗 External Links & Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wikipedia URL
                      </label>
                      <input
                        type="url"
                        name="wikipedia_url"
                        value={formData.wikipedia_url || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://en.wikipedia.org/wiki/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Official Website
                      </label>
                      <input
                        type="url"
                        name="official_website"
                        value={formData.official_website || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TripAdvisor URL
                      </label>
                      <input
                        type="url"
                        name="tripadvisor_url"
                        value={formData.tripadvisor_url || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://www.tripadvisor.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Google Maps URL
                      </label>
                      <input
                        type="url"
                        name="google_maps_url"
                        value={formData.google_maps_url || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="md:col-span-2 border-t-2 border-emerald-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    📞 Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="+604-730 8888"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="info@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Full street address"
                      />
                    </div>
                  </div>
                </div>

                {/* Visitor Information */}
                <div className="md:col-span-2 border-t-2 border-amber-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    🕒 Visitor Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Hours
                      </label>
                      <textarea
                        name="opening_hours"
                        value={formData.opening_hours || ''}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Mon-Sun: 10:00 AM - 10:00 PM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Best Time to Visit
                      </label>
                      <textarea
                        name="best_time_to_visit"
                        value={formData.best_time_to_visit || ''}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Weekday afternoons for less crowd"
                      />
                    </div>
                  </div>
                </div>

                {/* Facilities & Amenities */}
                <div className="md:col-span-2 border-t-2 border-green-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    ✨ Facilities & Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities?.parking || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            amenities: {
                              ...prev.amenities,
                              parking: e.target.checked
                            }
                          }));
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">🅿️ Parking</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities?.wifi || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            amenities: {
                              ...prev.amenities,
                              wifi: e.target.checked
                            }
                          }));
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">📶 WiFi</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities?.wheelchair_accessible || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            amenities: {
                              ...prev.amenities,
                              wheelchair_accessible: e.target.checked
                            }
                          }));
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">♿ Accessible</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities?.restaurant || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            amenities: {
                              ...prev.amenities,
                              restaurant: e.target.checked
                            }
                          }));
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">🍽️ Restaurant</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities?.restroom || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            amenities: {
                              ...prev.amenities,
                              restroom: e.target.checked
                            }
                          }));
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">🚻 Restroom</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-blue-800 font-semibold text-center">
                  ⚠️ Don't forget to click the <span className="text-emerald-600">"SAVE PLACE"</span> button below to save your changes!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-200 mt-6">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105 font-bold text-lg shadow-xl"
                >
                  <Save className="w-6 h-6" />
                  {editingPlace ? '💾 UPDATE PLACE' : '💾 SAVE PLACE'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-3 px-10 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-bold text-lg"
                >
                  <X className="w-6 h-6" />
                  ❌ CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Places Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            All Places ({places.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div key={place.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {place.image_url ? (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.alt = 'No image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <MapPin className="w-12 h-12" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {place.is_open ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                        <Power className="w-3 h-3" />
                        OPEN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                        <Power className="w-3 h-3" />
                        CLOSED
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{place.name}</h3>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="font-medium">Category:</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{place.category}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {place.city}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => place.id && handleToggleStatus(place.id, place.is_open)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                        place.is_open 
                          ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      title={place.is_open ? 'Close Place' : 'Open Place'}
                    >
                      <Power className="w-4 h-4" />
                      {place.is_open ? 'Close' : 'Open'}
                    </button>
                    <button
                      onClick={() => handleEdit(place)}
                      className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => place.id && handleDelete(place.id)}
                      className="flex items-center justify-center p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {places.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No places found</p>
              <p className="text-sm">Click "Add New Place" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
