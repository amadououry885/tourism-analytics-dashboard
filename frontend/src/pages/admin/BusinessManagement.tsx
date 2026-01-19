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
          icon: <MapPin className="w-7 h-7" />, 
          iconBg: 'bg-teal-500',
          cardBg: 'bg-teal-50',
          border: 'border-teal-300',
          headerBg: 'bg-teal-500',
          label: business.category || 'Place'
        };
        case 'vendor': return { 
          icon: <Utensils className="w-7 h-7" />, 
          iconBg: 'bg-orange-500',
          cardBg: 'bg-orange-50',
          border: 'border-orange-300',
          headerBg: 'bg-orange-500',
          label: business.cuisines?.slice(0, 2).join(', ') || 'Restaurant'
        };
        case 'stay': return { 
          icon: <Hotel className="w-7 h-7" />, 
          iconBg: 'bg-purple-500',
          cardBg: 'bg-purple-50',
          border: 'border-purple-300',
          headerBg: 'bg-purple-500',
          label: business.type || 'Stay'
        };
      }
    };

    const config = getConfig();
    const location = business.city || business.district || 'Unknown';

    return (
      <div 
        key={`${type}-${business.id}`}
        className={`${config.cardBg} rounded-2xl overflow-hidden border-2 ${config.border} shadow-lg hover:shadow-xl transition-all ${
          !business.is_active ? 'opacity-70' : ''
        }`}
      >
        {/* Colored Header Bar */}
        <div className={`${config.headerBg} px-5 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg text-white">
              {config.icon}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight truncate max-w-[180px]">{business.name}</h3>
              <p className="text-sm text-white/80 font-medium">{config.label}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow ${
            business.is_active 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {business.is_active ? (
              <><CheckCircle className="w-4 h-4" /> Active</>
            ) : (
              <><XCircle className="w-4 h-4" /> Disabled</>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* Location */}
          <div className="flex items-center gap-2 mb-4 text-gray-700 bg-white rounded-lg px-4 py-3 border border-gray-200">
            <span className="text-2xl">📍</span>
            <span className="font-bold text-lg">{location}</span>
            {type === 'place' && business.is_council_managed === false && (
              <span className="ml-auto px-3 py-1 bg-amber-400 text-black text-sm rounded-full font-bold">Private</span>
            )}
          </div>

          {/* Owner Info */}
          <div className={`rounded-xl p-4 mb-5 ${business.owner ? 'bg-white border-2 border-blue-200' : 'bg-gray-100 border border-gray-200'}`}>
            {business.owner ? (
              <>
                <p className="text-xs text-blue-600 mb-3 font-bold uppercase tracking-wider">👤 Owner Information</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-800 font-bold text-base">
                    <User className="w-5 h-5 text-blue-500" />
                    {business.owner.username}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span className="truncate">{business.owner.email}</span>
                  </div>
                  {business.owner.phone_number && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-5 h-5 text-green-500" />
                      {business.owner.phone_number}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-3">
                <p className="text-gray-600 font-bold text-lg">🏛️ Council Managed</p>
                <p className="text-sm text-gray-500">No private owner</p>
              </div>
            )}
          </div>

          {/* Actions - BIGGER BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={() => handleToggle(type, business.id, business.is_active, business.name)}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-base font-bold transition-all transform hover:scale-105 ${
                business.is_active
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
              } disabled:opacity-50 disabled:transform-none`}
            >
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : business.is_active ? (
                <><ToggleRight className="w-6 h-6" /> DISABLE</>
              ) : (
                <><ToggleLeft className="w-6 h-6" /> ENABLE</>
              )}
            </button>
            
            <button
              onClick={() => setDeleteModal({ show: true, type, id: business.id, name: business.name })}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-base font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isDeleting ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'all', label: 'All', icon: <Building2 className="w-5 h-5" />, bg: 'bg-gray-600', activeBg: 'bg-gray-700' },
    { id: 'place', label: 'Places', icon: <MapPin className="w-5 h-5" />, bg: 'bg-teal-500', activeBg: 'bg-teal-600' },
    { id: 'vendor', label: 'Restaurants', icon: <Utensils className="w-5 h-5" />, bg: 'bg-orange-500', activeBg: 'bg-orange-600' },
    { id: 'stay', label: 'Stays', icon: <Hotel className="w-5 h-5" />, bg: 'bg-purple-500', activeBg: 'bg-purple-600' },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 p-6">
      {/* Header - Green Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-8 shadow-xl">
        <h1 className="text-3xl font-black text-white mb-2">
          🏢 Business Management
        </h1>
        <p className="text-green-100 text-lg">Manage all places, restaurants, and stays on the platform</p>
      </div>

      {/* Stats Cards - Colorful */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-lg">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Total</p>
          <p className="text-4xl font-black text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-green-500 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-green-100 font-bold uppercase tracking-wider mb-1">Active</p>
          <p className="text-4xl font-black text-white">{stats.active}</p>
        </div>
        <div className="bg-red-500 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-red-100 font-bold uppercase tracking-wider mb-1">Disabled</p>
          <p className="text-4xl font-black text-white">{stats.inactive}</p>
        </div>
        <div className="bg-teal-500 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-teal-100 font-bold uppercase tracking-wider mb-1">Places</p>
          <p className="text-4xl font-black text-white">{stats.places}</p>
        </div>
        <div className="bg-orange-500 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-orange-100 font-bold uppercase tracking-wider mb-1">Restaurants</p>
          <p className="text-4xl font-black text-white">{stats.vendors}</p>
        </div>
        <div className="bg-purple-500 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-purple-100 font-bold uppercase tracking-wider mb-1">Stays</p>
          <p className="text-4xl font-black text-white">{stats.stays}</p>
        </div>
      </div>

      {/* Filters - White/Light Background */}
      <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-lg mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-base font-bold transition-all ${
                  activeTab === tab.id
                    ? `${tab.bg} text-white shadow-lg`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="appearance-none pl-12 pr-12 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-bold text-base"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
            </select>
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Refresh Button - BIG */}
          <button
            onClick={fetchBusinesses}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold text-base transition-all disabled:opacity-50 shadow-lg"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Showing count */}
      {!loading && currentItems.length > 0 && (
        <div className="mb-6 text-gray-600 font-medium text-lg">
          Showing <span className="text-gray-900 font-bold">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, currentItems.length)}</span> of <span className="text-gray-900 font-bold">{currentItems.length}</span> businesses
        </div>
      )}

      {/* Business Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg animate-pulse">
              <div className="h-20 bg-gray-300" />
              <div className="p-5">
                <div className="h-12 bg-gray-200 rounded-lg mb-4" />
                <div className="h-24 bg-gray-100 rounded-xl mb-5" />
                <div className="flex gap-3">
                  <div className="flex-1 h-14 bg-gray-200 rounded-xl" />
                  <div className="w-16 h-14 bg-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No businesses found</h3>
          <p className="text-gray-500 text-lg">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedItems.map(({ business, type }) => renderBusinessCard(business, type))}
          </div>

          {/* Pagination - BIGGER BUTTONS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-lg">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-xl text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
                Previous
              </button>
              
              <div className="flex gap-2">
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
                        className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
                          currentPage === page
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return <span key={page} className="text-gray-400 px-2 self-center font-bold">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-xl text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border-2 border-gray-200 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-red-500 rounded-2xl shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Delete Business</h3>
                <p className="text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-8 text-lg">
              Are you sure you want to permanently delete <strong className="text-gray-900">{deleteModal.name}</strong>? 
              All associated data will be removed.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-base transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading !== null}
                className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <><Trash2 className="w-6 h-6" /> DELETE</>
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
