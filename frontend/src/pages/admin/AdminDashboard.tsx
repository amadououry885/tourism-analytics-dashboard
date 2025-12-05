import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  DollarSign,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { FormInput } from '../../components/FormInput';
import { FormSelect } from '../../components/FormSelect';
import PlacesManagement from './PlacesManagement';

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
  title: string;
  description: string;
  location_name: string;
  start_date: string;
  end_date: string;
  tags: string[];
  city?: string;
  image_url?: string;
  expected_attendance?: number;
  actual_attendance?: number;
}

interface TransportRoute {
  id: number;
  route_name: string;
  transport_type: string;
  departure_location: string;
  arrival_location: string;
  duration_minutes: number;
  price: number;
  city?: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { request, loading } = useApi();
  const navigate = useNavigate();
  
  // Empty form template
  const emptyEventForm = {
    title: '',
    description: '',
    location_name: '',
    start_date: '',
    end_date: '',
    tags: [] as string[],
    city: '',
    image_url: '',
    recurrence_type: '', // ✨ NEW: daily, weekly, monthly, yearly, or empty for one-time
    max_capacity: null as number | null, // ✨ NEW: Maximum attendees
  };
  
  const [activeTab, setActiveTab] = useState<'approvals' | 'events' | 'transport' | 'places'>('approvals');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingTransport, setEditingTransport] = useState<TransportRoute | null>(null);

  const [eventForm, setEventForm] = useState(emptyEventForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [transportForm, setTransportForm] = useState({
    route_name: '',
    transport_type: '',
    departure_location: '',
    arrival_location: '',
    duration_minutes: '',
    price: '',
    city: '',  // ✅ ADD CITY FIELD
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

  const cityOptions = [
    { value: 'Alor Setar', label: '🏛️ Alor Setar' },
    { value: 'Langkawi', label: '🏝️ Langkawi' },
    { value: 'Sungai Petani', label: '🌳 Sungai Petani' },
    { value: 'Kedah Darul Aman Negara', label: '👑 Kedah Darul Aman Negara' },
    { value: 'Kuah', label: '⛵ Kuah' },
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
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const data = await request(`/events/?page_size=100&_t=${timestamp}`);
      console.log('Events data:', data);
      console.log('Number of events:', data.results?.length || data.length);
      // Log which events have images
      const eventsArray = data.results || data;
      eventsArray.forEach((event: Event) => {
        if (event.image_url && event.image_url.trim() !== '') {
          console.log(`Event "${event.title}" (ID: ${event.id}) has image (${event.image_url.substring(0, 30)}...)`);
        }
      });
      setEvents(eventsArray);
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
      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchEvents();
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
    setEventForm(emptyEventForm);
    setEditingEvent(null);
    setShowEventModal(false);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEventForm({ ...eventForm, image_url: base64 });
      setImagePreview(base64);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const resetTransportForm = () => {
    setTransportForm({
      route_name: '',
      transport_type: '',
      departure_location: '',
      arrival_location: '',
      duration_minutes: '',
      price: '',
      city: '',  // ✅ RESET CITY
    });
    setEditingTransport(null);
    setShowTransportModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: `linear-gradient(rgba(245, 243, 238, 0.95), rgba(245, 243, 238, 0.95))`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}>
      {/* Left Sidebar - Orange Gradient */}
      <div style={{
        width: '160px',
        background: 'linear-gradient(180deg, #d4a574 0%, #c89963 100%)',
        padding: '32px 16px',
        flexShrink: 0,
        boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
      }}>
        {/* Logo */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            🛡️
          </div>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            ADMIN
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ marginBottom: '32px' }}>
          {[
            { id: 'approvals', label: 'User Approvals', icon: Users, badge: pendingUsers.length },
            { id: 'events', label: 'Events', icon: Calendar, badge: 0 },
            { id: 'transport', label: 'Transport', icon: Bus, badge: 0 },
            { id: 'places', label: 'Places', icon: MapPin, badge: 0 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 8px',
                  marginBottom: '8px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: isActive ? 'white' : 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon style={{ 
                    width: '20px', 
                    height: '20px', 
                    color: isActive ? '#d4a574' : 'white' 
                  }} />
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}>
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'red',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    textAlign: 'center',
                    animation: 'pulse 2s infinite',
                  }}>
                    {item.badge}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 8px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: 'auto',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LogOut style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'white',
            textAlign: 'center',
          }}>
            Logout
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Center Content Area */}
        <div style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            {/* Back to Dashboard Button */}
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'white',
                border: '2px solid #d4a574',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#d4a574',
                cursor: 'pointer',
                marginBottom: '24px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d4a574';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#d4a574';
              }}
            >
              <Home style={{ width: '18px', height: '18px' }} />
              Back to Analytics Dashboard
            </button>

            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              margin: 0,
              marginBottom: '8px',
              color: '#2d2d2d',
            }}>
              Admin Control Panel 🛡️
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: '#666',
              margin: 0,
            }}>
              Welcome back, {user?.username}! Manage your tourism platform
            </p>
          </div>

        {/* User Approvals Tab */}
        {activeTab === 'approvals' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>
                👥 Pending User Approvals
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                Review and approve vendor and stay owner registrations
              </p>
            </div>

            {pendingUsers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <UserCheck style={{ width: '96px', height: '96px', color: '#d4a574', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '8px' }}>
                  ✅ All Caught Up!
                </h3>
                <p style={{ fontSize: '18px', color: '#666' }}>
                  No pending user approvals at the moment.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {pendingUsers.map((pendingUser) => (
                  <div key={pendingUser.id} style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #d4a574',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(212,165,116,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {pendingUser.role === 'vendor' ? (
                          <div style={{ padding: '12px', background: 'rgba(212, 165, 116, 0.1)', borderRadius: '12px' }}>
                            <Store style={{ width: '32px', height: '32px', color: '#d4a574' }} />
                          </div>
                        ) : (
                          <div style={{ padding: '12px', background: 'rgba(107, 165, 135, 0.1)', borderRadius: '12px' }}>
                            <Building2 style={{ width: '32px', height: '32px', color: '#6ba587' }} />
                          </div>
                        )}
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '4px' }}>
                            {pendingUser.first_name} {pendingUser.last_name}
                          </h3>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            background: pendingUser.role === 'vendor' ? 'rgba(212, 165, 116, 0.1)' : 'rgba(107, 165, 135, 0.1)',
                            color: pendingUser.role === 'vendor' ? '#d4a574' : '#6ba587',
                          }}>
                            {pendingUser.role === 'vendor' ? '🍽️ Restaurant Owner' : '🏨 Hotel Owner'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px', background: '#f8f8f8', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '8px' }}>
                        <Users style={{ width: '16px', height: '16px', color: '#d4a574' }} />
                        <span style={{ fontWeight: '600' }}>Username:</span>
                        <span style={{ color: '#666' }}>@{pendingUser.username}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '8px' }}>
                        <Mail style={{ width: '16px', height: '16px', color: '#d4a574' }} />
                        <span style={{ fontWeight: '600' }}>Email:</span>
                        <span style={{ color: '#666' }}>{pendingUser.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <Clock style={{ width: '16px', height: '16px', color: '#d4a574' }} />
                        <span style={{ fontWeight: '600' }}>Registered:</span>
                        <span style={{ color: '#666' }}>{new Date(pendingUser.date_joined).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleApproveUser(pendingUser.id)}
                        disabled={loading}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          background: loading ? '#ccc' : '#6ba587',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#5a9175')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#6ba587')}
                      >
                        <CheckCircle style={{ width: '20px', height: '20px' }} />
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectUser(pendingUser.id)}
                        disabled={loading}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          background: loading ? '#ccc' : '#e74c3c',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#c0392b')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#e74c3c')}
                      >
                        <XCircle style={{ width: '20px', height: '20px' }} />
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
            {/* Action Card - Add Event */}
            <button
              onClick={() => {
                setEventForm(emptyEventForm);
                setImagePreview('');
                setImageFile(null);
                setEditingEvent(null);
                setShowEventModal(true);
              }}
              style={{
                width: '100%',
                minHeight: '180px',
                background: 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '32px',
                cursor: 'pointer',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 165, 116, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 165, 116, 0.3)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    🎉 Add New Tourism Event
                  </h2>
                  <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
                    Create festivals, concerts, exhibitions, and attractions
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'white' }}>
                    <Plus style={{ width: '20px', height: '20px' }} />
                    Click to Add Event
                  </div>
                </div>
                <Calendar style={{ width: '64px', height: '64px', color: 'rgba(255,255,255,0.3)' }} />
              </div>
            </button>

            {events.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 24px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <Calendar style={{ width: '128px', height: '128px', color: '#d4a574', margin: '0 auto 24px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '12px' }}>
                  No Events Yet 📅
                </h3>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                  Use the action card above to create your first tourism event!
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                {/* Single Scrollable Card Container */}
                <div className="max-h-[800px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                  {(() => {
                    const now = new Date();
                    const upcomingEvents = events.filter(event => new Date(event.end_date) >= now);
                    const pastEvents = events.filter(event => new Date(event.end_date) < now);

                    return (
                      <div className="space-y-8">
                        {/* Upcoming Events Section */}
                        {upcomingEvents.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 mb-4 sticky top-0 bg-white py-2 z-10">
                              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <h3 className="text-xl font-bold text-green-900">🔥 ACTIVE & UPCOMING EVENTS</h3>
                              </div>
                              <span className="text-gray-500 text-lg">({upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''})</span>
                            </div>
                          <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {upcomingEvents.map((event) => (
                              <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-3 border border-green-200 hover:border-green-400 relative overflow-hidden">
                                {/* Event Image */}
                                {event.image_url && event.image_url.trim() !== '' ? (
                                  <div className="mb-2 -mx-3 -mt-3 bg-gray-100">
                                    <img 
                                      key={`event-img-${event.id}-${Date.now()}`}
                                      src={event.image_url} 
                                      alt={event.title}
                                      className="w-full h-24 object-cover"
                                      onLoad={() => console.log(`✅ Image loaded for event ${event.id}: ${event.title}`)}
                                      onError={(e) => {
                                        console.error('❌ Image failed to load for event:', event.id, event.title);
                                        console.error('Image URL length:', event.image_url?.length);
                                        console.error('Image URL start:', event.image_url?.substring(0, 50));
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="mb-2 -mx-3 -mt-3 bg-gradient-to-br from-purple-100 to-blue-100 h-24 flex items-center justify-center">
                                    <Calendar className="w-8 h-8 text-purple-400" />
                                  </div>
                                )}
                                
                                {/* Active Badge */}
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow">
                                  ✓ ACTIVE
                                </div>

                                <div className="mb-2">
                                  <h3 className="text-sm font-bold text-gray-900 mb-1 pr-12 line-clamp-2">{event.title}</h3>
                                  <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-semibold rounded-full">
                                    {event.tags && event.tags.length > 0 ? event.tags[0] : 'Event'}
                                  </span>
                                </div>

                                <div className="space-y-1 text-xs text-gray-600 mb-2">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
                                    <span className="font-medium truncate">{event.location_name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-green-600 flex-shrink-0" />
                                    <span className="text-[10px] font-semibold truncate">
                                      {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-1 pt-2 border-t border-gray-100">
                                  <button
                                    onClick={() => navigate(`/admin/events/${event.id}/registrations`)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors font-bold shadow-sm"
                                  >
                                    <Users className="w-3 h-3" />
                                    Attendees
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingEvent(event);
                                      setEventForm({
                                        title: event.title,
                                        description: event.description,
                                        location_name: event.location_name,
                                        start_date: event.start_date.split('T')[0],
                                        end_date: event.end_date.split('T')[0],
                                        tags: event.tags || [],
                                        city: event.city || '',
                                        image_url: event.image_url || '',
                                      });
                                      setImagePreview(event.image_url || '');
                                      setShowEventModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors font-bold shadow-sm"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors font-bold shadow-sm"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Past Events Section */}
                      {pastEvents.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 mt-8">
                            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                              <Clock className="w-5 h-5 text-gray-600" />
                              <h3 className="text-xl font-bold text-gray-700">PAST EVENTS (Read-Only)</h3>
                            </div>
                            <span className="text-gray-500 text-lg">({pastEvents.length} event{pastEvents.length !== 1 ? 's' : ''})</span>
                          </div>
                          <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {pastEvents.map((event) => (
                              <div key={event.id} className="bg-gray-50 rounded-lg shadow-sm p-3 border border-gray-200 opacity-75 relative">
                                {/* Event Image (grayscale for past events) */}
                                {event.image_url && event.image_url.trim() !== '' ? (
                                  <div className="mb-2 -mx-3 -mt-3 bg-gray-200">
                                    <img 
                                      key={`past-event-img-${event.id}-${Date.now()}`}
                                      src={event.image_url} 
                                      alt={event.title}
                                      className="w-full h-24 object-cover grayscale"
                                      onLoad={() => console.log(`✅ Past event image loaded for ${event.id}: ${event.title}`)}
                                      onError={(e) => {
                                        console.error('❌ Image failed to load for past event:', event.id, event.title);
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="mb-2 -mx-3 -mt-3 bg-gradient-to-br from-gray-200 to-gray-300 h-24 flex items-center justify-center">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                
                                {/* Past Badge */}
                                <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  ✓ ENDED
                                </div>

                                <div className="mb-2">
                                  <h3 className="text-sm font-bold text-gray-700 mb-1 pr-12 line-clamp-2">{event.title}</h3>
                                  <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-semibold rounded-full">
                                    {event.tags && event.tags.length > 0 ? event.tags[0] : 'Event'}
                                  </span>
                                </div>

                                <div className="space-y-1 text-xs text-gray-500 mb-2">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{event.location_name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span className="text-[10px] truncate">
                                      {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200">
                                  <div className="text-center text-gray-500 italic text-[10px] py-1">
                                    📅 Event ended
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transport Tab */}
        {activeTab === 'transport' && (
          <div>
            {/* Action Card - Add Transport Route */}
            <button
              onClick={() => setShowTransportModal(true)}
              style={{
                width: '100%',
                minHeight: '180px',
                background: 'linear-gradient(135deg, #6ba587 0%, #5a9175 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '32px',
                cursor: 'pointer',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(107, 165, 135, 0.3)',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 165, 135, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 165, 135, 0.3)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    🚌 Add Transport Route
                  </h2>
                  <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
                    Manage buses, trains, ferries, and taxis for tourists
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'white' }}>
                    <Plus style={{ width: '20px', height: '20px' }} />
                    Click to Add Route
                  </div>
                </div>
                <Bus style={{ width: '64px', height: '64px', color: 'rgba(255,255,255,0.3)' }} />
              </div>
            </button>

            {transportRoutes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 24px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <Bus style={{ width: '128px', height: '128px', color: '#6ba587', margin: '0 auto 24px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '12px' }}>
                  No Routes Yet 🚌
                </h3>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                  Use the action card above to create your first transport route!
                </p>
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
                            city: route.city || '',  // ✅ ADD CITY FIELD WHEN EDITING
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

        {/* Places Tab */}
        {activeTab === 'places' && (
          <PlacesManagement />
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={(e) => e.target === e.currentTarget && resetEventForm()}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" style={{ border: '3px solid #d4a574' }}>
              {/* Vibrant Header */}
              <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 px-8 py-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl">{editingEvent ? '✏️' : '🎉'}</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      {editingEvent ? 'Edit Tourism Event' : 'Add New Tourism Event'}
                    </h2>
                    <p className="text-orange-100 text-base">
                      {editingEvent ? 'Update event information below' : 'Create an exciting event to attract tourists!'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
                <form onSubmit={handleEventSubmit} className="p-8 space-y-8">
                  {/* Step 1 */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        1
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-900">📋 Event Details</h3>
                        <p className="text-sm text-orange-700">What is this event called?</p>
                      </div>
                    </div>

                <FormInput
                  label="Event Name"
                  name="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  placeholder="e.g., Langkawi International Maritime & Aerospace Exhibition"
                  required
                  hint="Give your event a clear, attractive name"
                />

                  </div>

                  {/* Step 2 */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        2
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-900">🎭 Event Category</h3>
                        <p className="text-sm text-purple-700">Choose the type that best fits</p>
                      </div>
                    </div>

                <FormSelect
                  label="Event Category"
                  name="tags"
                  value={eventForm.tags && eventForm.tags.length > 0 ? eventForm.tags[0] : ''}
                  onChange={(e) => setEventForm({...eventForm, tags: e.target.value ? [e.target.value] : []})}
                  options={eventCategories}
                  required
                  hint="This helps tourists find events they're interested in"
                />

                  </div>

                  {/* Step 3 */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        3
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-900">📍 Event Location</h3>
                        <p className="text-sm text-green-700">Where will it happen?</p>
                      </div>
                    </div>

                <FormInput
                  label="Event Location"
                  name="location_name"
                  value={eventForm.location_name}
                  onChange={(e) => setEventForm({...eventForm, location_name: e.target.value})}
                  placeholder="e.g., Mahsuri International Exhibition Centre, Langkawi"
                  required
                  icon={<MapPin className="w-5 h-5" />}
                  hint="Include the venue name and city"
                />

                    <div className="mt-6 pt-6 border-t-2 border-green-200">
                      <div className="mb-4">
                        <h4 className="font-bold text-green-900 mb-1 flex items-center gap-2">
                          <span className="text-lg">🏙️</span> City
                        </h4>
                        <p className="text-sm text-green-700">Which city is this event in?</p>
                      </div>

                <FormSelect
                  label="📍 City"
                  name="city"
                  value={eventForm.city}
                  onChange={(e) => setEventForm({...eventForm, city: e.target.value})}
                  options={cityOptions}
                  required
                  hint="Select the city where the event will take place"
                />

                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        4
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">📅 Event Dates</h3>
                        <p className="text-sm text-blue-700">When will it take place?</p>
                      </div>
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

                  </div>

                  {/* Step 5 */}
                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 border-2 border-pink-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        5
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-pink-900">📝 Event Description</h3>
                        <p className="text-sm text-pink-700">Tell us what makes this event special (optional)</p>
                      </div>
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

                {/* Image upload for event (optional) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event Image (optional)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm text-gray-700"
                    />
                    {imagePreview ? (
                      <div className="w-28 h-20 rounded overflow-hidden border">
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-28 h-20 rounded border flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Tip: Upload a poster or hero image (max 5MB). We accept JPG, PNG.</p>
                </div>
                  </div>

                  {/* ✨ NEW: Step 6 - Recurring Event Settings */}
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        6
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-indigo-900">🔄 Advanced Settings (Optional)</h3>
                        <p className="text-sm text-indigo-700">Make this event recurring and set capacity</p>
                      </div>
                    </div>

                    {/* Recurring Event Toggle */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          🔄 Recurring Event
                        </label>
                        <select
                          name="recurrence_type"
                          value={eventForm.recurrence_type || ''}
                          onChange={(e) => setEventForm({...eventForm, recurrence_type: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 bg-white"
                        >
                          <option value="">📅 One-time event (no repeat)</option>
                          <option value="daily">🌅 Daily - Repeats every day</option>
                          <option value="weekly">📆 Weekly - Repeats every week</option>
                          <option value="monthly">🗓️ Monthly - Repeats every month</option>
                          <option value="yearly">🎊 Yearly - Repeats every year</option>
                        </select>
                        <p className="mt-2 text-sm text-indigo-600 flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <span>
                            {eventForm.recurrence_type ? (
                              <>
                                <strong>Recurring event enabled!</strong> New instances will be automatically created {eventForm.recurrence_type}.
                                Example: Weekly markets, annual festivals, daily tours.
                              </>
                            ) : (
                              <>Select a recurrence pattern to automatically generate future event instances. Perfect for regular markets, tours, or annual celebrations!</>
                            )}
                          </span>
                        </p>
                      </div>

                      {/* Max Capacity */}
                      <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          👥 Maximum Capacity (Optional)
                        </label>
                        <input
                          type="number"
                          name="max_capacity"
                          value={eventForm.max_capacity || ''}
                          onChange={(e) => setEventForm({...eventForm, max_capacity: e.target.value ? parseInt(e.target.value) : null})}
                          placeholder="e.g., 500"
                          min="1"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500"
                        />
                        <p className="mt-2 text-sm text-gray-600">
                          💡 Set a maximum number of attendees. Leave blank for unlimited capacity.
                        </p>
                      </div>

                      {/* Visual Indicator when Recurring is Active */}
                      {eventForm.recurrence_type && (
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                              <span className="text-2xl">🔄</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-purple-900">Recurring Event Active</h4>
                              <p className="text-sm text-purple-700">
                                This event will automatically repeat <strong>{eventForm.recurrence_type}</strong>. 
                                Create once, runs forever!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Action Buttons */}
                <div className="flex gap-4 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2">
                  <button
                    type="button"
                    onClick={resetEventForm}
                    className="flex-1 px-8 py-4 bg-white border-3 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-bold text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">❌</span> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 text-white rounded-xl hover:from-orange-600 hover:via-orange-500 hover:to-yellow-600 transition-all font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
                  >
                    {loading ? (
                      <><span className="text-xl">⏳</span> Saving...</>
                    ) : editingEvent ? (
                      <><span className="text-xl">✅</span> Update Event</>
                    ) : (
                      <><span className="text-xl">✅</span> Add Event</>
                    )}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Transport Modal */}
        {showTransportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && resetTransportForm()}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8" style={{ border: '3px solid #6ba587' }}>
              {/* Vibrant Header - Green Theme */}
              <div className="bg-gradient-to-r from-green-500 via-green-400 to-teal-500 px-8 py-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl">{editingTransport ? '✏️' : '🚌'}</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      {editingTransport ? 'Update Transport Route' : 'Add Transport Route'}
                    </h2>
                    <p className="text-green-100 text-base">
                      {editingTransport ? 'Update route information below' : 'Help tourists get around easily!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Form Area */}
              <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
                <form onSubmit={handleTransportSubmit} className="p-8 space-y-8">
                  {/* Step 1 */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        1
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">🚌 Route Name</h3>
                        <p className="text-sm text-blue-700">Make it easy for tourists to remember!</p>
                      </div>
                    </div>
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

                  {/* Step 2 */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        2
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-900">🚍 Transport Type</h3>
                        <p className="text-sm text-purple-700">What vehicle will tourists use?</p>
                      </div>
                    </div>

                    <FormSelect
                      label="Transport Type"
                      name="transport_type"
                      value={transportForm.transport_type}
                      onChange={(e) => setTransportForm({...transportForm, transport_type: e.target.value})}
                      options={transportTypes}
                      required
                      hint="💡 Choose the vehicle type tourists will use"
                    />

                    <div className="mt-6 pt-6 border-t-2 border-purple-200">
                      <div className="mb-4">
                        <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-2">
                          <span className="text-lg">🏙️</span> City
                        </h4>
                        <p className="text-sm text-purple-700">Which city is this route in?</p>
                      </div>
                    <FormSelect
                      label="📍 City"
                      name="city"
                      value={transportForm.city}
                      onChange={(e) => setTransportForm({...transportForm, city: e.target.value})}
                      options={cityOptions}
                      required
                      hint="Select the city where this transport route operates"
                    />
                  </div>

                  </div>

                  {/* Step 3 */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        3
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-900">📍 Route Locations</h3>
                        <p className="text-sm text-green-700">Where does it start and end?</p>
                      </div>
                    </div>

                    <div className="space-y-4">
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
                  </div>

                  {/* Step 4 */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        4
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-900">⏱️ Duration & Price</h3>
                        <p className="text-sm text-orange-700">How long and how much?</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
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

                    <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
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

                  {/* Action Buttons */}
                  <div className="flex gap-4 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2">
                    <button
                      type="button"
                      onClick={resetTransportForm}
                      className="flex-1 px-8 py-4 bg-white border-3 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-bold text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">❌</span> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 via-green-400 to-teal-500 text-white rounded-xl hover:from-green-600 hover:via-green-500 hover:to-teal-600 transition-all font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
                    >
                      {loading ? (
                        <><span className="text-xl">⏳</span> Saving...</>
                      ) : editingTransport ? (
                        <><span className="text-xl">✅</span> Update Route</>
                      ) : (
                        <><span className="text-xl">✅</span> Add Route</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;