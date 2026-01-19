import React, { useState, useEffect } from 'react';
import { 
  Building2, Hotel, MapPin, Search, ToggleLeft, ToggleRight, 
  Trash2, AlertTriangle, CheckCircle, XCircle, User, Mail, Phone,
  ChevronDown, Filter, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Owner {
  id: number;
  username: string;
  email: string;
  phone_number: string;
}

interface Business {
  id: number;
  name: string;
  city?: string;
  district?: string;
  category?: string;
  type?: string;
  cuisines?: string[];
  address?: string;
  is_active: boolean;
  is_council_managed?: boolean;
  owner: Owner | null;
  created_by?: string;
}

interface BusinessData {
  places?: Business[];
  vendors?: Business[];
  stays?: Business[];
}

const BusinessManagement: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'place' | 'vendor' | 'stay'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteModal, setDeleteModal] = useState<{show: boolean; type: string; id: number; name: string} | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('type', activeTab);
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await api.get(`/auth/admin/businesses/?${params.toString()}`);
      setBusinesses(response.data);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [activeTab, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinesses();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggle = async (type: string, id: number, currentStatus: boolean, name: string) => {
    const action = currentStatus ? 'disable' : 'enable';
    setActionLoading(`${type}-${id}`);
    
    try {
      await api.post('/auth/admin/businesses/toggle/', {
        type,
        id,
        action
      });
      
      toast.success(`${name} has been ${action}d`);
      fetchBusinesses();
    } catch (error) {
      toast.error(`Failed to ${action} ${name}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    
    setActionLoading(`delete-${deleteModal.type}-${deleteModal.id}`);
    
    try {
      await api.delete(`/auth/admin/businesses/delete/?type=${deleteModal.type}&id=${deleteModal.id}`);
      toast.success(`${deleteModal.name} has been permanently deleted`);
      setDeleteModal(null);
      fetchBusinesses();
    } catch (error) {
      toast.error(`Failed to delete ${deleteModal.name}`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderBusinessCard = (business: Business, type: 'place' | 'vendor' | 'stay') => {
    const isLoading = actionLoading === `${type}-${business.id}`;
    const isDeleting = actionLoading === `delete-${type}-${business.id}`;
    
    const getIcon = () => {
      switch (type) {
        case 'place': return <MapPin className="w-5 h-5 text-teal-400" />;
        case 'vendor': return <Building2 className="w-5 h-5 text-orange-400" />;
        case 'stay': return <Hotel className="w-5 h-5 text-purple-400" />;
      }
    };

    const getTypeLabel = () => {
      switch (type) {
        case 'place': return business.category || 'Place';
        case 'vendor': return business.cuisines?.join(', ') || 'Restaurant';
        case 'stay': return business.type || 'Stay';
      }
    };

    const getLocation = () => {
      return business.city || business.district || 'Unknown';
    };

    return (
      <div 
        key={`${type}-${business.id}`}
        className={`bg-slate-800 rounded-xl p-4 border-2 transition-all flex flex-col ${
          business.is_active 
            ? 'border-slate-600 hover:border-slate-500' 
            : 'border-red-600/50 bg-red-950/30'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${
              type === 'place' ? 'bg-teal-500/20' :
              type === 'vendor' ? 'bg-orange-500/20' :
              'bg-purple-500/20'
            }`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{business.name}</h3>
              <p className="text-xs text-gray-400">{getTypeLabel()}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            business.is_active 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {business.is_active ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Active
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                Disabled
              </>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="text-sm text-gray-300 mb-3 flex items-center gap-2">
          <span className="text-lg">📍</span> 
          <span className="font-medium">{getLocation()}</span>
          {type === 'place' && business.is_council_managed === false && (
            <span className="ml-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">Private</span>
          )}
        </div>

        {/* Owner Info */}
        {business.owner ? (
          <div className="bg-slate-700/50 rounded-lg p-3 mb-3 flex-1">
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Owner</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-white font-medium">
                <User className="w-4 h-4 text-purple-400" />
                {business.owner.username}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {business.owner.email}
              </div>
              {business.owner.phone_number && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="w-3.5 h-3.5 text-green-400" />
                  {business.owner.phone_number}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-700/30 rounded-lg p-3 mb-3 text-center flex-1 flex flex-col justify-center">
            <p className="text-sm text-gray-400 font-medium">No owner assigned</p>
            <p className="text-xs text-gray-500">Council managed</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-700/50">
          <button
            onClick={() => handleToggle(type, business.id, business.is_active, business.name)}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              business.is_active
                ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-600/20'
                : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/20'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : business.is_active ? (
              <>
                <ToggleRight className="w-4 h-4" />
                Disable
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4" />
                Enable
              </>
            )}
          </button>
          
          <button
            onClick={() => setDeleteModal({ show: true, type, id: business.id, name: business.name })}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'place', label: 'Places', icon: <MapPin className="w-4 h-4" />, color: 'text-teal-400' },
    { id: 'vendor', label: 'Restaurants', icon: <Building2 className="w-4 h-4" />, color: 'text-orange-400' },
    { id: 'stay', label: 'Stays', icon: <Hotel className="w-4 h-4" />, color: 'text-purple-400' },
  ];

  const allBusinesses: { business: Business; type: 'place' | 'vendor' | 'stay' }[] = [
    ...(businesses.places || []).map(b => ({ business: b, type: 'place' as const })),
    ...(businesses.vendors || []).map(b => ({ business: b, type: 'vendor' as const })),
    ...(businesses.stays || []).map(b => ({ business: b, type: 'stay' as const })),
  ];

  const stats = {
    places: businesses.places?.length || 0,
    vendors: businesses.vendors?.length || 0,
    stays: businesses.stays?.length || 0,
    total: allBusinesses.length,
    active: allBusinesses.filter(b => b.business.is_active).length,
    inactive: allBusinesses.filter(b => !b.business.is_active).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Business Management</h1>
        <p className="text-gray-400">Manage all places, restaurants, and stays on the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-green-900/30">
          <p className="text-xs text-green-400 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-red-900/30">
          <p className="text-xs text-red-400 mb-1">Disabled</p>
          <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-teal-900/30">
          <p className="text-xs text-teal-400 mb-1">Places</p>
          <p className="text-2xl font-bold text-teal-400">{stats.places}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-orange-900/30">
          <p className="text-xs text-orange-400 mb-1">Restaurants</p>
          <p className="text-2xl font-bold text-orange-400">{stats.vendors}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-900/30">
          <p className="text-xs text-purple-400 mb-1">Stays</p>
          <p className="text-2xl font-bold text-purple-400">{stats.stays}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Tabs */}
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.icon && <span className={tab.color}>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="appearance-none pl-10 pr-10 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>

        {/* Refresh */}
        <button
          onClick={fetchBusinesses}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-400 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Business Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-20 bg-slate-700/50 rounded-lg mb-3" />
              <div className="flex gap-2">
                <div className="flex-1 h-9 bg-slate-700 rounded-lg" />
                <div className="w-12 h-9 bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : allBusinesses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No businesses found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'all' ? (
            allBusinesses.map(({ business, type }) => renderBusinessCard(business, type))
          ) : activeTab === 'place' ? (
            businesses.places?.map(b => renderBusinessCard(b, 'place'))
          ) : activeTab === 'vendor' ? (
            businesses.vendors?.map(b => renderBusinessCard(b, 'vendor'))
          ) : (
            businesses.stays?.map(b => renderBusinessCard(b, 'stay'))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Business</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to permanently delete <strong className="text-white">{deleteModal.name}</strong>? 
              All associated data will be removed.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading !== null}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;
