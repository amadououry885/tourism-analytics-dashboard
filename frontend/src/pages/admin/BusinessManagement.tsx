import React, { useState, useEffect } from 'react';
import { 
  Building2, Hotel, MapPin, Search, ToggleLeft, ToggleRight, 
  Trash2, AlertTriangle, CheckCircle, XCircle, User, Mail, Phone,
  ChevronDown, Filter, RefreshCw, ChevronLeft, ChevronRight, Utensils
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

const ITEMS_PER_PAGE = 12;

const BusinessManagement: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'place' | 'vendor' | 'stay'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteModal, setDeleteModal] = useState<{show: boolean; type: string; id: number; name: string} | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('type', activeTab);
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await api.get(`/auth/admin/businesses/?${params.toString()}`);
      setBusinesses(response.data);
      setCurrentPage(1);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinesses();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleToggle = async (type: string, id: number, currentStatus: boolean, name: string) => {
    const action = currentStatus ? 'disable' : 'enable';
    setActionLoading(`${type}-${id}`);
    
    try {
      await api.post('/auth/admin/businesses/toggle/', { type, id, action });
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
    
    const getConfig = () => {
      switch (type) {
        case 'place': return { 
          icon: <MapPin className="w-6 h-6" />, 
          gradient: 'from-teal-500 to-emerald-600',
          bg: 'bg-gradient-to-br from-teal-500/20 to-emerald-500/10',
          border: 'border-teal-500/50',
          label: business.category || 'Place'
        };
        case 'vendor': return { 
          icon: <Utensils className="w-6 h-6" />, 
          gradient: 'from-orange-500 to-amber-600',
          bg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/10',
          border: 'border-orange-500/50',
          label: business.cuisines?.slice(0, 2).join(', ') || 'Restaurant'
        };
        case 'stay': return { 
          icon: <Hotel className="w-6 h-6" />, 
          gradient: 'from-purple-500 to-pink-600',
          bg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/10',
          border: 'border-purple-500/50',
          label: business.type || 'Stay'
        };
      }
    };

    const config = getConfig();
    const location = business.city || business.district || 'Unknown';

    return (
      <div 
        key={`${type}-${business.id}`}
        className={`${config.bg} rounded-2xl p-5 border-2 ${config.border} transition-all hover:scale-[1.02] hover:shadow-2xl flex flex-col ${
          !business.is_active ? 'opacity-70' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg leading-tight truncate">{business.name}</h3>
              <p className="text-sm text-gray-300 font-medium">{config.label}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap ${
            business.is_active 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
          }`}>
            {business.is_active ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Active</>
            ) : (
              <><XCircle className="w-3.5 h-3.5" /> Disabled</>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-4 text-gray-300">
          <span className="text-xl">📍</span>
          <span className="font-semibold">{location}</span>
          {type === 'place' && business.is_council_managed === false && (
            <span className="ml-auto px-2 py-1 bg-amber-500 text-black text-xs rounded-full font-bold">Private</span>
          )}
        </div>

        {/* Owner Info */}
        <div className={`rounded-xl p-4 mb-4 flex-1 ${business.owner ? 'bg-slate-800/80' : 'bg-slate-800/40'}`}>
          {business.owner ? (
            <>
              <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">👤 Owner</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <User className="w-4 h-4 text-cyan-400" />
                  {business.owner.username}
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="truncate">{business.owner.email}</span>
                </div>
                {business.owner.phone_number && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Phone className="w-4 h-4 text-green-400" />
                    {business.owner.phone_number}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-gray-400 font-medium">🏛️ Council Managed</p>
              <p className="text-xs text-gray-500">No private owner</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => handleToggle(type, business.id, business.is_active, business.name)}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
              business.is_active
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50'
            } disabled:opacity-50 disabled:transform-none`}
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : business.is_active ? (
              <><ToggleRight className="w-5 h-5" /> Disable</>
            ) : (
              <><ToggleLeft className="w-5 h-5" /> Enable</>
            )}
          </button>
          
          <button
            onClick={() => setDeleteModal({ show: true, type, id: business.id, name: business.name })}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {isDeleting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'all', label: 'All', icon: <Building2 className="w-4 h-4" />, gradient: 'from-slate-500 to-slate-600' },
    { id: 'place', label: 'Places', icon: <MapPin className="w-4 h-4" />, gradient: 'from-teal-500 to-emerald-600' },
    { id: 'vendor', label: 'Restaurants', icon: <Utensils className="w-4 h-4" />, gradient: 'from-orange-500 to-amber-600' },
    { id: 'stay', label: 'Stays', icon: <Hotel className="w-4 h-4" />, gradient: 'from-purple-500 to-pink-600' },
  ];

  const allBusinesses: { business: Business; type: 'place' | 'vendor' | 'stay' }[] = [
    ...(businesses.places || []).map(b => ({ business: b, type: 'place' as const })),
    ...(businesses.vendors || []).map(b => ({ business: b, type: 'vendor' as const })),
    ...(businesses.stays || []).map(b => ({ business: b, type: 'stay' as const })),
  ];

  const getCurrentItems = () => {
    if (activeTab === 'all') return allBusinesses;
    if (activeTab === 'place') return (businesses.places || []).map(b => ({ business: b, type: 'place' as const }));
    if (activeTab === 'vendor') return (businesses.vendors || []).map(b => ({ business: b, type: 'vendor' as const }));
    return (businesses.stays || []).map(b => ({ business: b, type: 'stay' as const }));
  };

  const currentItems = getCurrentItems();
  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = currentItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      <div className="mb-8">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 mb-2">
          Business Management
        </h1>
        <p className="text-gray-400 text-lg">Manage all places, restaurants, and stays on the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-5 border border-slate-600 shadow-xl">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total</p>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl p-5 border border-green-500/30 shadow-xl">
          <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">Active</p>
          <p className="text-3xl font-black text-green-400">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-red-900/50 to-rose-900/50 rounded-2xl p-5 border border-red-500/30 shadow-xl">
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Disabled</p>
          <p className="text-3xl font-black text-red-400">{stats.inactive}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-900/50 to-emerald-900/50 rounded-2xl p-5 border border-teal-500/30 shadow-xl">
          <p className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-1">Places</p>
          <p className="text-3xl font-black text-teal-400">{stats.places}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/50 to-amber-900/50 rounded-2xl p-5 border border-orange-500/30 shadow-xl">
          <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">Restaurants</p>
          <p className="text-3xl font-black text-orange-400">{stats.vendors}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-5 border border-purple-500/30 shadow-xl">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Stays</p>
          <p className="text-3xl font-black text-purple-400">{stats.stays}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Tabs */}
        <div className="flex bg-slate-800/80 rounded-2xl p-1.5 border border-slate-700 shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-base shadow-lg"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="appearance-none pl-12 pr-12 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-purple-500 cursor-pointer font-semibold shadow-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
          </select>
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Refresh */}
        <button
          onClick={fetchBusinesses}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 shadow-lg"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Showing count */}
      {!loading && currentItems.length > 0 && (
        <div className="mb-4 text-gray-400">
          Showing <span className="text-white font-bold">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, currentItems.length)}</span> of <span className="text-white font-bold">{currentItems.length}</span> businesses
        </div>
      )}

      {/* Business Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-slate-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-24 bg-slate-700/50 rounded-xl mb-4" />
              <div className="flex gap-3">
                <div className="flex-1 h-12 bg-slate-700 rounded-xl" />
                <div className="w-14 h-12 bg-slate-700 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Building2 className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No businesses found</h3>
          <p className="text-gray-400 text-lg">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedItems.map(({ business, type }) => renderBusinessCard(business, type))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Prev
              </button>
              
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-11 h-11 rounded-xl font-bold transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-slate-800 border border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return <span key={page} className="text-gray-500 px-2 self-center">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Business</h3>
                <p className="text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-8 text-lg">
              Are you sure you want to permanently delete <strong className="text-white">{deleteModal.name}</strong>? 
              All associated data will be removed.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading !== null}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <><Trash2 className="w-5 h-5" /> Delete</>
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
