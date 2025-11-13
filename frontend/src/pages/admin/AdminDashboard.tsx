import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  LogOut,
  Calendar,
  Bus,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Mail,
  UserCheck,
  Store,
  Building2,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { FormInput } from '../../components/FormInput';
import { FormSelect } from '../../components/FormSelect';

interface PendingUser {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  category: string;
}

interface TransportRoute {
  id: number;
  route_name: string;
  transport_type: string;
  departure_location: string;
  arrival_location: string;
  duration_minutes: number;
  price: number;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { request, loading } = useApi();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'approvals' | 'events' | 'transport'>('approvals');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingTransport, setEditingTransport] = useState<TransportRoute | null>(null);

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    category: '',
  });

  const [transportForm, setTransportForm] = useState({
    route_name: '',
    transport_type: '',
    departure_location: '',
    arrival_location: '',
    duration_minutes: '',
    price: '',
  });

  const eventCategories = [
    { value: 'Festival', label: '🎉 Festival' },
    { value: 'Concert', label: '🎵 Concert' },
    { value: 'Sports', label: '⚽ Sports' },
    { value: 'Exhibition', label: '🎨 Exhibition' },
    { value: 'Cultural', label: '🎭 Cultural' },
    { value: 'Food', label: '🍽️ Food & Dining' },
    { value: 'Other', label: '📅 Other' },
  ];

  const transportTypes = [
    { value: 'Bus', label: '🚌 Bus' },
    { value: 'Train', label: '🚆 Train' },
    { value: 'Ferry', label: '⛴️ Ferry' },
    { value: 'Taxi', label: '🚕 Taxi' },
    { value: 'Shuttle', label: '🚐 Shuttle' },
  ];

  useEffect(() => {
    fetchPendingUsers();
    fetchEvents();
    fetchTransportRoutes();
  }, []);

  // Add this new effect to scroll to top when tab changes
  useEffect(() => {
    // Use setTimeout to ensure DOM is fully updated
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    try {
      const data = await request('/auth/admin/users/pending/');
      setPendingUsers(data);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const data = await request('/events/');
      console.log('Events data:', data);
      setEvents(data.results || data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchTransportRoutes = async () => {
    try {
      console.log('Fetching transport routes...');
      const data = await request('/transport/routes/');
      console.log('Transport routes data:', data);
      setTransportRoutes(data.results || data);
    } catch (error) {
      console.error('Failed to fetch transport routes:', error);
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await request(
        `/auth/admin/users/${userId}/approve/`,
        { method: 'POST' },
        '✅ User approved successfully!'
      );
      fetchPendingUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      try {
        await request(
          `/auth/admin/users/${userId}/reject/`,
          { method: 'POST' },
          '✅ User rejected successfully!'
        );
        fetchPendingUsers();
      } catch (error) {
        console.error('Failed to reject user:', error);
      }
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await request(
          `/events/${editingEvent.id}/`,
          { method: 'PUT', body: JSON.stringify(eventForm) },
          '✅ Event updated successfully!'
        );
      } else {
        await request(
          '/events/',
          { method: 'POST', body: JSON.stringify(eventForm) },
          '✅ Event added successfully!'
        );
      }
      fetchEvents();
      resetEventForm();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleTransportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTransport) {
        await request(
          `/transport/routes/${editingTransport.id}/`,
          { method: 'PUT', body: JSON.stringify(transportForm) },
          '✅ Transport route updated successfully!'
        );
      } else {
        await request(
          '/transport/routes/',
          { method: 'POST', body: JSON.stringify(transportForm) },
          '✅ Transport route added successfully!'
        );
      }
      fetchTransportRoutes();
      resetTransportForm();
    } catch (error) {
      console.error('Failed to save transport route:', error);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await request(`/events/${id}/`, { method: 'DELETE' }, '✅ Event deleted!');
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handleDeleteTransport = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await request(`/transport/routes/${id}/`, { method: 'DELETE' }, '✅ Route deleted!');
        fetchTransportRoutes();
      } catch (error) {
        console.error('Failed to delete route:', error);
      }
    }
  };

  const resetEventForm = () => {
    setEventForm({
      name: '',
      description: '',
      location: '',
      start_date: '',
      end_date: '',
      category: '',
    });
    setEditingEvent(null);
    setShowEventModal(false);
  };

  const resetTransportForm = () => {
    setTransportForm({
      route_name: '',
      transport_type: '',
      departure_location: '',
      arrival_location: '',
      duration_minutes: '',
      price: '',
    });
    setEditingTransport(null);
    setShowTransportModal(false);
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
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-6 py-4 font-semibold border-b-4 transition-all ${
                activeTab === 'approvals'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>👥 User Approvals</span>
                {pendingUsers.length > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {pendingUsers.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-4 font-semibold border-b-4 transition-all ${
                activeTab === 'events'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>🎉 Events & Tourism</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className={`px-6 py-4 font-semibold border-b-4 transition-all ${
                activeTab === 'transport'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5" />
                <span>🚌 Transport Routes</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Approvals Tab */}
        {activeTab === 'approvals' && (
          <div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg p-6 mb-8 text-white">
              <h2 className="text-2xl font-bold mb-2">👥 Pending User Approvals</h2>
              <p className="text-blue-100">
                Review and approve vendor and stay owner registrations
              </p>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <UserCheck className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">✅ All Caught Up!</h3>
                <p className="text-gray-600 text-lg">No pending user approvals at the moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pendingUsers.map((pendingUser) => (
                  <div key={pendingUser.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {pendingUser.role === 'vendor' ? (
                          <div className="p-3 bg-purple-100 rounded-full">
                            <Store className="w-8 h-8 text-purple-600" />
                          </div>
                        ) : (
                          <div className="p-3 bg-green-100 rounded-full">
                            <Building2 className="w-8 h-8 text-green-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {pendingUser.first_name} {pendingUser.last_name}
                          </h3>
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                            pendingUser.role === 'vendor' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {pendingUser.role === 'vendor' ? '🍽️ Restaurant Owner' : '🏨 Hotel Owner'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Username:</span>
                        <span className="text-gray-700">@{pendingUser.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Email:</span>
                        <span className="text-gray-700">{pendingUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Registered:</span>
                        <span className="text-gray-700">{new Date(pendingUser.date_joined).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveUser(pendingUser.id)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 shadow-md"
                      >
                        <CheckCircle className="w-5 h-5" />
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectUser(pendingUser.id)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-400 shadow-md"
                      >
                        <XCircle className="w-5 h-5" />
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 mb-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">🎉 Tourism Events</h2>
                  <p className="text-purple-100">
                    Manage festivals, concerts, and tourist attractions
                  </p>
                </div>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold shadow-lg whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Add Event
                </button>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Events Yet</h3>
                <p className="text-gray-600 text-lg mb-2">Start by adding tourism events! 🎪</p>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Add festivals, concerts, exhibitions, and other events to attract tourists
                </p>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 font-bold text-lg shadow-xl"
                >
                  <Plus className="w-6 h-6" />
                  Add First Event
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-2 border-transparent hover:border-purple-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-xs">
                          {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="mt-4 text-sm text-gray-600 line-clamp-3 mb-4">{event.description}</p>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setEventForm({
                            name: event.name,
                            description: event.description,
                            location: event.location,
                            start_date: event.start_date,
                            end_date: event.end_date,
                            category: event.category,
                          });
                          setShowEventModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transport Tab */}
        {activeTab === 'transport' && (
          <div>
            {/* Orange Header - BRIGHT VISIBLE BUTTON */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">🚌 Transport Routes</h2>
                  <p className="text-orange-100">Manage buses, trains, ferries</p>
                </div>
                <button
                  onClick={() => setShowTransportModal(true)}
                  className="px-8 py-4 bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 font-bold shadow-xl border-4 border-white transition-all transform hover:scale-110 flex items-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-lg font-bold">ADD ROUTE</span>
                </button>
              </div>
            </div>

            {transportRoutes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <Bus className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Routes Yet</h3>
                <p className="text-gray-600 text-lg mb-2">Start by adding transport routes! 🚌</p>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Add bus, train, ferry, or taxi routes to help tourists get around
                </p>
                <button
                  onClick={() => setShowTransportModal(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all transform hover:scale-105 font-bold text-lg shadow-xl"
                >
                  <Plus className="w-6 h-6" />
                  <span>Add First Route</span>
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {transportRoutes.map((route) => (
                  <div key={route.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-2 border-transparent hover:border-orange-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{route.route_name}</h3>
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                          {route.transport_type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">{route.departure_location}</span>
                          <span className="mx-2">→</span>
                          <span className="font-semibold">{route.arrival_location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span className="font-medium">{route.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-lg font-bold text-orange-600">
                        💵 RM {route.price}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => {
                          setEditingTransport(route);
                          setTransportForm({
                            route_name: route.route_name,
                            transport_type: route.transport_type,
                            departure_location: route.departure_location,
                            arrival_location: route.arrival_location,
                            duration_minutes: route.duration_minutes.toString(),
                            price: route.price.toString(),
                          });
                          setShowTransportModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTransport(route.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold">
                  {editingEvent ? '✏️ Edit Tourism Event' : '➕ Add New Tourism Event'}
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  {editingEvent ? 'Update event information' : 'Create a new event to attract tourists'}
                </p>
              </div>

              <form onSubmit={handleEventSubmit} className="p-6 space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold text-blue-900 mb-1">📋 Step 1: Event Details</h3>
                  <p className="text-sm text-blue-700">What is this event called?</p>
                </div>

                <FormInput
                  label="Event Name"
                  name="name"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                  placeholder="e.g., Langkawi International Maritime & Aerospace Exhibition"
                  required
                  hint="Give your event a clear, attractive name"
                />

                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <h3 className="font-bold text-purple-900 mb-1">🎭 Step 2: What Type of Event?</h3>
                  <p className="text-sm text-purple-700">Choose the category that best fits</p>
                </div>

                <FormSelect
                  label="Event Category"
                  name="category"
                  value={eventForm.category}
                  onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                  options={eventCategories}
                  required
                  hint="This helps tourists find events they're interested in"
                />

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="font-bold text-green-900 mb-1">📍 Step 3: Where Will It Happen?</h3>
                  <p className="text-sm text-green-700">Tell tourists the location</p>
                </div>

                <FormInput
                  label="Event Location"
                  name="location"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  placeholder="e.g., Mahsuri International Exhibition Centre, Langkawi"
                  required
                  icon={<MapPin className="w-5 h-5" />}
                  hint="Include the venue name and city"
                />

                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <h3 className="font-bold text-orange-900 mb-1">📅 Step 4: When Is the Event?</h3>
                  <p className="text-sm text-orange-700">Set the start and end dates</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={eventForm.start_date}
                      onChange={(e) => setEventForm({...eventForm, start_date: e.target.value})}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">When does it start?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={eventForm.end_date}
                      onChange={(e) => setEventForm({...eventForm, end_date: e.target.value})}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">When does it end?</p>
                  </div>
                </div>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded">
                  <h3 className="font-bold text-pink-900 mb-1">📝 Step 5: Tell Us More (Optional)</h3>
                  <p className="text-sm text-pink-700">Describe what makes this event special</p>
                </div>

                <FormInput
                  label="Event Description"
                  name="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  placeholder="Tell tourists what they can expect at this event..."
                  multiline
                  rows={4}
                  hint="You can skip this if you want"
                />

                <div className="flex gap-3 pt-6 border-t-2">
                  <button
                    type="button"
                    onClick={resetEventForm}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg"
                  >
                    ❌ Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold text-lg shadow-lg disabled:opacity-50"
                  >
                    {loading ? '⏳ Saving...' : (editingEvent ? '✅ Update Event' : '✅ Add Event')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transport Modal */}
        {showTransportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
              {/* Friendly Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 rounded-t-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <Bus className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">
                      {editingTransport ? '✏️ Update Your Route' : '🚌 Add a Transport Route'}
                    </h2>
                    <p className="text-orange-100 text-sm mt-1">
                      {editingTransport ? 'Make changes to help tourists travel better' : 'Help tourists get around easily!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Form Area */}
              <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
                <form onSubmit={handleTransportSubmit} className="p-8 space-y-8">
                  {/* Step 1: Route Name */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-5 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        1
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-900">🚌 Give Your Route a Name</h3>
                        <p className="text-sm text-blue-700">Make it easy for tourists to remember!</p>
                      </div>
                    </div>
                  </div>

                  <div className="pl-4">
                    <FormInput
                      label="Route Name"
                      name="route_name"
                      value={transportForm.route_name}
                      onChange={(e) => setTransportForm({...transportForm, route_name: e.target.value})}
                      placeholder="e.g., Kuah to Pantai Cenang Express"
                      required
                      hint="💡 Tip: Use departure and destination in the name"
                    />
                  </div>

                  {/* Step 2: Transport Type */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 p-5 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        2
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-purple-900">🚍 What Type of Transport?</h3>
                        <p className="text-sm text-purple-700">Bus, taxi, ferry, or train?</p>
                      </div>
                    </div>
                  </div>

                  <div className="pl-4">
                    <FormSelect
                      label="Transport Type"
                      name="transport_type"
                      value={transportForm.transport_type}
                      onChange={(e) => setTransportForm({...transportForm, transport_type: e.target.value})}
                      options={transportTypes}
                      required
                      hint="💡 Choose the vehicle type tourists will use"
                    />
                  </div>

                  {/* Step 3: Locations */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-5 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        3
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-900">📍 Where Does It Go?</h3>
                        <p className="text-sm text-green-700">Set the starting point and destination</p>
                      </div>
                    </div>
                  </div>

                  <div className="pl-4 space-y-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                      <FormInput
                        label="📍 Departure Location (Starting Point)"
                        name="departure_location"
                        value={transportForm.departure_location}
                        onChange={(e) => setTransportForm({...transportForm, departure_location: e.target.value})}
                        placeholder="e.g., Kuah Jetty"
                        required
                        icon={<MapPin className="w-5 h-5" />}
                        hint="Where does the journey begin?"
                      />
                    </div>

                    <div className="flex justify-center">
                      <div className="text-3xl text-green-500">↓</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                      <FormInput
                        label="🎯 Arrival Location (Destination)"
                        name="arrival_location"
                        value={transportForm.arrival_location}
                        onChange={(e) => setTransportForm({...transportForm, arrival_location: e.target.value})}
                        placeholder="e.g., Pantai Cenang Beach"
                        required
                        icon={<MapPin className="w-5 h-5" />}
                        hint="Where does the journey end?"
                      />
                    </div>
                  </div>

                  {/* Step 4: Time & Cost */}
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 p-5 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        4
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-yellow-900">⏱️ How Long & How Much?</h3>
                        <p className="text-sm text-yellow-700">Travel time and ticket price</p>
                      </div>
                    </div>
                  </div>

                  <div className="pl-4 grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border-2 border-yellow-200">
                      <FormInput
                        label="⏱️ Travel Duration"
                        name="duration_minutes"
                        type="number"
                        value={transportForm.duration_minutes}
                        onChange={(e) => setTransportForm({...transportForm, duration_minutes: e.target.value})}
                        placeholder="e.g., 25"
                        required
                        icon={<Clock className="w-5 h-5" />}
                        hint="How many minutes does the trip take?"
                      />
                    </div>

                    <div className="bg-white p-4 rounded-lg border-2 border-yellow-200">
                      <FormInput
                        label="💰 Ticket Price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={transportForm.price}
                        onChange={(e) => setTransportForm({...transportForm, price: e.target.value})}
                        placeholder="e.g., 15"
                        required
                        icon={<DollarSign className="w-5 h-5" />}
                        hint="How much does a ticket cost? (RM)"
                      />
                    </div>
                  </div>

                  {/* Helpful Example Card */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      Example Route:
                    </h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>✅ <strong>Name:</strong> Kuah to Pantai Cenang Express</p>
                      <p>✅ <strong>Type:</strong> 🚌 Bus</p>
                      <p>✅ <strong>From:</strong> Kuah Jetty → <strong>To:</strong> Pantai Cenang Beach</p>
                      <p>✅ <strong>Duration:</strong> 25 minutes</p>
                      <p>✅ <strong>Price:</strong> RM 15.00</p>
                    </div>
                  </div>
                </form>
              </div>

              {/* Action Buttons - Fixed at Bottom */}
              <div className="border-t-2 bg-gray-50 px-8 py-6 flex gap-4 rounded-b-2xl">
                <button
                  type="button"
                  onClick={resetTransportForm}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg flex items-center justify-center gap-2"
                >
                  <XCircle className="w-6 h-6" />
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleTransportSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
                >
                  {loading ? (
                    <>⏳ Saving...</>
                  ) : editingTransport ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      ✅ Update Route
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      ✅ Add Route
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;