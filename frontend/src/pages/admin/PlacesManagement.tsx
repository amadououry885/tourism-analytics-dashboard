import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MapPin, Upload } from 'lucide-react';
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
  price: string;
  currency: string;
  latitude: string;
  longitude: string;
  image_url: string;
}

const emptyPlace: Place = {
  name: '',
  description: '',
  category: '',
  city: '',
  state: 'Kedah',
  country: 'Malaysia',
  is_free: true,
  price: '0.00',
  currency: 'MYR',
  latitude: '',
  longitude: '',
  image_url: ''
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
      const response = await axios.get('/places/');
      setPlaces(response.data.results || response.data);
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

        {/* Places List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All Places ({places.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Image</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">City</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {place.image_url ? (
                        <img
                          src={place.image_url}
                          alt={place.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.alt = 'No image';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{place.name}</td>
                    <td className="py-3 px-4 text-gray-600">{place.category}</td>
                    <td className="py-3 px-4 text-gray-600">{place.city}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(place)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => place.id && handleDelete(place.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
