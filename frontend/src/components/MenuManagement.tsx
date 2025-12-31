import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';
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
    try {
      if (editingItem?.id) {
        await api.put(`/menu-items/${editingItem.id}/`, formData);
      } else {
        await api.post('/menu-items/', formData);
      }
      await fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
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
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Menu Item
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (MYR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                      onChange={(e) => setFormData({ ...formData, spiciness_level: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Available</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_vegetarian}
                      onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Vegetarian</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_halal}
                      onChange={(e) => setFormData({ ...formData, is_halal: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Halal</span>
                  </label>
                </div>

                {/* Allergens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Allergens
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {allergenOptions.map(allergen => (
                      <label key={allergen} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.allergens.includes(allergen)}
                          onChange={() => toggleAllergen(allergen)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No menu items yet. Add your first item to get started!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                {category} ({items.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    {item.image_url && (
                      <div className="h-40 bg-gray-100">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <span className="text-emerald-600 font-bold">
                          {item.currency} {parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {!item.is_available && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Unavailable</span>
                        )}
                        {item.is_vegetarian && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">🌱 Vegetarian</span>
                        )}
                        {item.is_halal && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">☪️ Halal</span>
                        )}
                        {item.spiciness_level > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {'🌶️'.repeat(item.spiciness_level)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
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
