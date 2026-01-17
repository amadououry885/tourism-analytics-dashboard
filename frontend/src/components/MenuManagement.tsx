import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, UtensilsCrossed, Upload, Camera } from 'lucide-react';
import api from '../services/api';

interface MenuItem {
  id?: number;
  vendor: number;
  name: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_halal: boolean;
  spiciness_level: number;
  allergens: string[];
  image_url: string;
}

interface MenuManagementProps {
  vendorId: number;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({ vendorId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<MenuItem>({
    vendor: vendorId,
    name: '',
    description: '',
    category: '',
    price: '',
    currency: 'MYR',
    is_available: true,
    is_vegetarian: false,
    is_halal: true,
    spiciness_level: 0,
    allergens: [],
    image_url: '',
  });

  const categories = [
    'Appetizer', 'Main Course', 'Dessert', 'Beverage', 
    'Side Dish', 'Salad', 'Soup', 'Special'
  ];

  const allergenOptions = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Fish', 
    'Shellfish', 'Soy', 'Wheat', 'Gluten'
  ];

  useEffect(() => {
    fetchMenuItems();
  }, [vendorId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menu-items/', {
        params: { vendor_id: vendorId }
      });
      // Handle paginated response
      const items = response.data.results || response.data;
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate price
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Please enter a valid price');
      return;
    }
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a menu item name');
      return;
    }
    
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    
    // Validate spiciness level
    const spicinessValue = isNaN(formData.spiciness_level) ? 0 : formData.spiciness_level;
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('vendor', String(formData.vendor));
      submitData.append('name', formData.name.trim());
      submitData.append('description', formData.description || '');
      submitData.append('category', formData.category);
      submitData.append('price', priceValue.toFixed(2));
      submitData.append('currency', formData.currency || 'MYR');
      submitData.append('is_available', String(formData.is_available));
      submitData.append('is_vegetarian', String(formData.is_vegetarian));
      submitData.append('is_halal', String(formData.is_halal));
      submitData.append('spiciness_level', String(spicinessValue));
      
      // Send allergens as JSON string if there are any
      if (formData.allergens && formData.allergens.length > 0) {
        submitData.append('allergens', JSON.stringify(formData.allergens));
      } else {
        submitData.append('allergens', '[]');
      }
      
      // Add image file if selected
      if (selectedImage) {
        submitData.append('image', selectedImage);
      } else if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      console.log('Submitting menu item:', {
        vendor: formData.vendor,
        name: formData.name,
        category: formData.category,
        price: priceValue.toFixed(2),
        allergens: formData.allergens
      });

      if (editingItem?.id) {
        await api.put(`/menu-items/${editingItem.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/menu-items/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      await fetchMenuItems();
      resetForm();
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      // Show more detailed error message
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Failed to save menu item';
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    // If item has an existing image URL, set it as preview
    if (item.image_url) {
      setImagePreview(item.image_url);
    } else {
      setImagePreview(null);
    }
    setSelectedImage(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/menu-items/${id}/`);
      await fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const resetForm = () => {
    setFormData({
      vendor: vendorId,
      name: '',
      description: '',
      category: '',
      price: '',
      currency: 'MYR',
      is_available: true,
      is_vegetarian: false,
      is_halal: true,
      spiciness_level: 0,
      allergens: [],
      image_url: '',
    });
    setEditingItem(null);
    setShowForm(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large. Please choose an image under 5MB.');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, etc.)');
        return;
      }
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large. Please choose an image under 5MB.');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showForm]);

  // Group items by category
  const groupedItems = (Array.isArray(menuItems) ? menuItems : []).reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return <div className="text-center py-8">Loading menu items...</div>;
  }

  return (
    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* Warm color band */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #e67e22 0%, #f5a855 50%, #e67e22 100%)' }} />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2d2d2d', margin: 0 }}>Menu Management</h2>
          <p style={{ fontSize: '14px', color: '#888', margin: '4px 0 0 0' }}>Add and manage your menu items</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', boxShadow: '0 4px 12px rgba(230, 126, 34, 0.3)' }}
        >
          <Plus className="w-5 h-5" />
          Add Menu Item
        </button>
      </div>

      {/* Form Modal */}
      {showForm && ReactDOM.createPortal(
        <div 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => e.target === e.currentTarget && resetForm()}
        >
          <div 
            className="bg-white rounded-2xl w-full overflow-hidden relative"
            style={{
              maxWidth: '900px',
              maxHeight: '95vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1)',
              zIndex: 1000000,
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors bg-white rounded-full p-2 shadow-md border border-gray-200"
              style={{ zIndex: 1000001 }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header - White with warm accent */}
            <div style={{ background: 'white', padding: '20px 24px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(230, 126, 34, 0.1)', borderRadius: '10px' }}>
                  <UtensilsCrossed style={{ width: '24px', height: '24px', color: '#e67e22' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2d2d2d', margin: 0 }}>
                    {editingItem ? 'Update Menu Item' : 'Add Menu Item'}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#888', margin: '4px 0 0 0' }}>Fill in the details below</p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Content - White background */}
            <div 
              style={{ 
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                background: 'white',
                maxHeight: 'calc(95vh - 180px)', 
                minHeight: '400px'
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section 1: Basic Information */}
                <section style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d2d2d', margin: 0 }}>Basic Information</h3>
                    <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>Essential details about this menu item</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Nasi Lemak Special"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-400 transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 transition-all"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (MYR) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your dish..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-400 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spiciness Level (0-5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={formData.spiciness_level}
                      onChange={(e) => setFormData({ ...formData, spiciness_level: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 transition-all"
                    />
                  </div>
                </section>

                {/* Section 2: Dish Photo - Easy Upload for Non-Technical Users */}
                <section style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d2d2d', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Camera style={{ width: '20px', height: '20px', color: '#e67e22' }} />
                      Dish Photo (optional)
                    </h3>
                    <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                      Upload a photo from your phone or computer. This helps customers recognize your dish.
                    </p>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />

                  {/* Show preview if image selected or existing URL */}
                  {(imagePreview || formData.image_url) ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={imagePreview || formData.image_url}
                        alt="Dish preview"
                        style={{
                          width: '200px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '2px solid #e67e22'
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                        title="Remove photo"
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                      <p style={{ fontSize: '12px', color: '#27ae60', marginTop: '8px', fontWeight: '500' }}>
                        ✓ Photo added successfully
                      </p>
                    </div>
                  ) : (
                    /* Upload area - drag & drop or click */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      style={{
                        border: '2px dashed #d4a574',
                        borderRadius: '12px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'rgba(212, 165, 116, 0.05)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(212, 165, 116, 0.1)';
                        e.currentTarget.style.borderColor = '#c89963';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(212, 165, 116, 0.05)';
                        e.currentTarget.style.borderColor = '#d4a574';
                      }}
                    >
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        background: 'rgba(230, 126, 34, 0.1)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <Upload style={{ width: '28px', height: '28px', color: '#e67e22' }} />
                      </div>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#2d2d2d', marginBottom: '4px' }}>
                        Click to upload or drag & drop
                      </p>
                      <p style={{ fontSize: '14px', color: '#888' }}>
                        PNG, JPG up to 5MB
                      </p>
                      <p style={{ fontSize: '12px', color: '#aaa', marginTop: '12px' }}>
                        📱 On mobile? Tap to open your camera or gallery
                      </p>
                    </div>
                  )}
                </section>

                {/* Section 3: Dietary Information */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dietary Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Help customers make informed choices</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      formData.is_available
                        ? 'bg-emerald-50 border-2 border-emerald-500'
                        : 'bg-white border border-gray-200 hover:border-emerald-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm text-gray-900">Available</span>
                    </label>

                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      formData.is_vegetarian
                        ? 'bg-emerald-50 border-2 border-emerald-500'
                        : 'bg-white border border-gray-200 hover:border-emerald-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.is_vegetarian}
                        onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm text-gray-900">Vegetarian</span>
                    </label>

                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      formData.is_halal
                        ? 'bg-emerald-50 border-2 border-emerald-500'
                        : 'bg-white border border-gray-200 hover:border-emerald-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.is_halal}
                        onChange={(e) => setFormData({ ...formData, is_halal: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm text-gray-900">Halal</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {allergenOptions.map(allergen => (
                        <label 
                          key={allergen} 
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                            formData.allergens.includes(allergen)
                              ? 'bg-emerald-50 border-2 border-emerald-500'
                              : 'bg-white border border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.allergens.includes(allergen)}
                            onChange={() => toggleAllergen(allergen)}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className="text-sm text-gray-900">{allergen}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>
              </form>
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.category || !formData.price}
                className={`px-8 py-2.5 rounded-lg font-medium transition-all ${
                  !formData.name || !formData.category || !formData.price
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                }`}
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Menu Items Grid */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="px-6 py-16">
          <div style={{ maxWidth: '350px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(230, 126, 34, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <UtensilsCrossed style={{ width: '40px', height: '40px', color: '#e67e22' }} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '8px' }}>No menu items yet</h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>Add your first menu item to start building your restaurant's menu.</p>
            <button
              onClick={() => setShowForm(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', boxShadow: '0 4px 12px rgba(230, 126, 34, 0.3)' }}
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '24px' }}>
          {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
            <div key={category} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e67e22' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2d2d2d' }}>{category}</h3>
                </div>
                <span style={{ fontSize: '14px', color: '#888' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <div key={item.id} className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow border-l-4 ${
                    categoryIndex % 4 === 0 ? 'border-l-orange-500' :
                    categoryIndex % 4 === 1 ? 'border-l-emerald-500' :
                    categoryIndex % 4 === 2 ? 'border-l-blue-500' :
                    'border-l-purple-500'
                  }`}>
                    {item.image_url && (
                      <div className="h-36 bg-gray-50">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className="text-gray-900 font-semibold text-sm">
                          {item.currency} {parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {!item.is_available && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">Unavailable</span>
                        )}
                        {item.is_vegetarian && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Vegetarian</span>
                        )}
                        {item.is_halal && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">Halal</span>
                        )}
                        {item.spiciness_level > 0 && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                            Spicy {'🌶️'.repeat(Math.min(item.spiciness_level, 3))}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 px-3 py-1.5 text-gray-700 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="flex-1 px-3 py-1.5 text-red-600 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
