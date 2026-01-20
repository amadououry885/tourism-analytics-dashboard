import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  LogOut,
  Calendar,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Mail,
  UserCheck,
  Store,
  Building2,
  Home,
  Eye,
  Sparkles,
  TrendingUp,
  Send,
  Bell,
  FileText,
  Phone,
  ExternalLink,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import PlacesManagement from './PlacesManagement';
import BusinessManagement from './BusinessManagement';

// Backend URL for media files
const BACKEND_URL = import.meta.env.DEV 
  ? 'http://localhost:8000'
  : 'https://tourism-analytics-backend.onrender.com';

// Helper to get full document URL
const getDocumentUrl = (documentPath: string | undefined): string => {
  if (!documentPath) return '';
  // If it's already a full URL, return as is
  if (documentPath.startsWith('http://') || documentPath.startsWith('https://')) {
    return documentPath;
  }
  // Otherwise prepend backend URL
  return `${BACKEND_URL}${documentPath}`;
};

interface PendingUser {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  // Verification fields
  phone_number?: string;
  business_registration_number?: string;
  verification_document?: string;
  claimed_vendor_id?: number;
  claimed_stay_id?: number;
  business_verification_notes?: string;
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
  // Registration management fields
  max_capacity?: number;
  attendee_count?: number;
  requires_approval?: boolean;
  pending_registrations_count?: number;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { request, loading } = useApi();
  const navigate = useNavigate();
  
  const emptyEventForm = {
    title: '',
    description: '',
    location_name: '',
    start_date: '',
    end_date: '',
    tags: [] as string[],
    city: '',
    image_url: '',
    recurrence_type: 'none',
    max_capacity: null as number | null,
  };
  
  const [activeTab, setActiveTab] = useState<'approvals' | 'events' | 'places' | 'businesses'>('approvals');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // NEW: States for verification document preview and send reminder modal
  const [showDocumentModal, setShowDocumentModal] = useState<PendingUser | null>(null);
  const [showReminderModal, setShowReminderModal] = useState<Event | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);

  const eventCategories = [
    { value: 'Festival', label: '🎉 Festival' },
    { value: 'Concert', label: '🎵 Concert' },
    { value: 'Sports', label: '⚽ Sports' },
    { value: 'Exhibition', label: '🎨 Exhibition' },
    { value: 'Cultural', label: '🎭 Cultural' },
    { value: 'Food', label: '🍽️ Food & Dining' },
    { value: 'Other', label: '📅 Other' },
  ];

  const cityOptions = [
    { value: 'Alor Setar', label: '🏛️ Alor Setar' },
    { value: 'Langkawi', label: '🏝️ Langkawi' },
    { value: 'Sungai Petani', label: '🌳 Sungai Petani' },
    { value: 'Kuah', label: '⛵ Kuah' },
    { value: 'Yan', label: '🌾 Yan' },
  ];

  useEffect(() => {
    fetchPendingUsers();
    fetchEvents();
  }, []);

  useEffect(() => {
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
      const timestamp = new Date().getTime();
      const data = await request(`/events/?page_size=100&hide_instances=1&_t=${timestamp}`);
      const eventsArray = data.results || data;
      
      // Fetch pending registration counts for events that require approval
      const eventsWithPending = await Promise.all(
        eventsArray.map(async (event: Event) => {
          if (event.requires_approval) {
            try {
              const pendingData = await request(`/events/${event.id}/pending_registrations/`);
              return { ...event, pending_registrations_count: pendingData.count || 0 };
            } catch {
              return { ...event, pending_registrations_count: 0 };
            }
          }
          return { ...event, pending_registrations_count: 0 };
        })
      );
      
      setEvents(eventsWithPending);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  // NEW: Send reminder to all confirmed attendees
  const handleSendReminder = async (event: Event) => {
    if (!event) return;
    setSendingReminder(true);
    try {
      await request(`/events/${event.id}/send_reminder/`, {
        method: 'POST',
        body: JSON.stringify({
          message: `This is a friendly reminder about ${event.title}!\n\nEvent Details:\nDate: ${new Date(event.start_date).toLocaleDateString()}\nLocation: ${event.location_name}\n\nWe look forward to seeing you there!`
        })
      }, '✅ Reminders sent to all attendees!');
      setReminderSuccess(true);
      setShowReminderModal(null);
      setTimeout(() => setReminderSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to send reminder:', error);
    } finally {
      setSendingReminder(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await request(`/auth/admin/users/${userId}/approve/`, { method: 'POST' }, '✅ User approved!');
      fetchPendingUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      try {
        await request(`/auth/admin/users/${userId}/reject/`, { method: 'POST' }, '✅ User rejected!');
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
        await request(`/events/${editingEvent.id}/`, { method: 'PUT', body: JSON.stringify(eventForm) }, '✅ Event updated!');
      } else {
        await request('/events/', { method: 'POST', body: JSON.stringify(eventForm) }, '✅ Event created!');
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchEvents();
      resetEventForm();
    } catch (error) {
      console.error('Failed to save event:', error);
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

  const resetEventForm = () => {
    setEventForm(emptyEventForm);
    setEditingEvent(null);
    setShowEventModal(false);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Please select an image smaller than 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEventForm({ ...eventForm, image_url: base64 });
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  // Calculate stats
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.end_date || e.start_date) >= now);
  const pastEvents = events.filter(e => new Date(e.end_date || e.start_date) < now);
  const nextEvent = upcomingEvents.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];
  const daysUntilNext = nextEvent ? Math.ceil((new Date(nextEvent.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield style={{ width: '26px', height: '26px', color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Admin Portal</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Kedah Tourism</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', padding: '0 12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Management
          </div>
          {[
            { id: 'approvals', label: 'User Approvals', icon: Users, badge: pendingUsers.length, color: '#f59e0b' },
            { id: 'events', label: 'Events', icon: Calendar, badge: upcomingEvents.length, color: '#a855f7' },
            { id: 'places', label: 'Places', icon: MapPin, badge: 0, color: '#22c55e' },
            { id: 'businesses', label: 'All Businesses', icon: Building2, badge: 0, color: '#14b8a6' },
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
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  marginBottom: '6px',
                  background: isActive ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: isActive ? '3px solid #a855f7' : '3px solid transparent',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: isActive ? item.color : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: isActive ? 'white' : '#94a3b8' }} />
                </div>
                <span style={{ flex: 1, textAlign: 'left', fontSize: '15px', fontWeight: isActive ? '600' : '500', color: isActive ? '#ffffff' : '#94a3b8' }}>
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span style={{
                    background: item.id === 'approvals' ? '#ef4444' : 'rgba(168, 85, 247, 0.3)',
                    color: item.id === 'approvals' ? 'white' : '#a855f7',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '12px',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: 'white',
            }}>
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{user?.username || 'Admin'}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              cursor: 'pointer',
              marginBottom: '10px',
              color: '#94a3b8',
              fontSize: '14px',
            }}
          >
            <Home style={{ width: '18px', height: '18px' }} />
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#ef4444',
              fontSize: '14px',
            }}
          >
            <LogOut style={{ width: '18px', height: '18px' }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Top Header */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              {activeTab === 'approvals' && <><Users size={28} style={{ color: '#f59e0b' }} /> User Approvals</>}
              {activeTab === 'events' && <><Calendar size={28} style={{ color: '#a855f7' }} /> Event Management</>}
              {activeTab === 'places' && <><MapPin size={28} style={{ color: '#22c55e' }} /> Places Management</>}
              {activeTab === 'businesses' && <><Building2 size={28} style={{ color: '#14b8a6' }} /> Business Management</>}
            </h1>
            <p style={{ fontSize: '15px', color: '#64748b', margin: '6px 0 0 0' }}>
              {activeTab === 'approvals' && 'Review and approve vendor registrations'}
              {activeTab === 'events' && 'Create and manage tourism events'}
              {activeTab === 'places' && 'Manage tourist attractions and places'}
              {activeTab === 'businesses' && 'Manage all places, restaurants, and stays'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeTab === 'events' && (
              <button
                onClick={() => setShowEventModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Plus size={20} />
                Add Event
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '28px 32px' }}>
          {/* Stats Cards */}
          {activeTab === 'events' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
              {[
                { label: 'Total Events', value: events.length, icon: Calendar, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
                { label: 'Upcoming', value: upcomingEvents.length, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                { label: 'Past Events', value: pastEvents.length, icon: Clock, color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
                { label: 'Days to Next', value: daysUntilNext, icon: Sparkles, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                }}>
                  <div style={{ width: '56px', height: '56px', background: stat.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={28} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>{stat.value}</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Approvals Tab */}
          {activeTab === 'approvals' && (
            <div>
              {pendingUsers.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '100px 24px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <UserCheck style={{ width: '96px', height: '96px', color: '#22c55e', margin: '0 auto 24px' }} />
                  <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>All Caught Up! ✅</h3>
                  <p style={{ fontSize: '18px', color: '#64748b' }}>No pending user approvals at the moment.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                  {pendingUsers.map((pendingUser) => (
                    <div key={pendingUser.id} style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden',
                    }}>
                      <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                          <div style={{
                            width: '64px',
                            height: '64px',
                            background: pendingUser.role === 'vendor' 
                              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                              : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {pendingUser.role === 'vendor' 
                              ? <Store style={{ width: '32px', height: '32px', color: 'white' }} />
                              : <Building2 style={{ width: '32px', height: '32px', color: 'white' }} />
                            }
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                              {pendingUser.first_name} {pendingUser.last_name}
                            </h3>
                            <span style={{
                              display: 'inline-block',
                              marginTop: '6px',
                              padding: '6px 14px',
                              fontSize: '13px',
                              fontWeight: '600',
                              borderRadius: '20px',
                              background: pendingUser.role === 'vendor' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                              color: pendingUser.role === 'vendor' ? '#f59e0b' : '#22c55e',
                            }}>
                              {pendingUser.role === 'vendor' ? '🍽️ Restaurant Owner' : '🏨 Stay Owner'}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ 
                          background: 'rgba(0, 0, 0, 0.2)', 
                          borderRadius: '14px', 
                          padding: '18px',
                          marginBottom: '20px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#94a3b8', fontSize: '15px' }}>
                            <Users size={18} style={{ color: '#a855f7' }} />
                            <span style={{ color: '#64748b' }}>@{pendingUser.username}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#94a3b8', fontSize: '15px' }}>
                            <Mail size={18} style={{ color: '#a855f7' }} />
                            <span>{pendingUser.email}</span>
                          </div>
                          {pendingUser.phone_number && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#94a3b8', fontSize: '15px' }}>
                              <Phone size={18} style={{ color: '#a855f7' }} />
                              <span>{pendingUser.phone_number}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '15px' }}>
                            <Clock size={18} style={{ color: '#a855f7' }} />
                            <span>Joined {new Date(pendingUser.date_joined).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Verification Info Section */}
                        {(pendingUser.business_registration_number || pendingUser.verification_document) && (
                          <div style={{ 
                            background: 'rgba(168, 85, 247, 0.1)', 
                            borderRadius: '14px', 
                            padding: '18px',
                            marginBottom: '20px',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                              <FileText size={18} style={{ color: '#a855f7' }} />
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#a855f7' }}>Verification Documents</span>
                            </div>
                            
                            {pendingUser.business_registration_number && (
                              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#94a3b8' }}>
                                <span style={{ fontWeight: '500' }}>Registration #:</span>{' '}
                                <span style={{ color: '#ffffff' }}>{pendingUser.business_registration_number}</span>
                              </div>
                            )}
                            
                            {pendingUser.verification_document && (
                              <button
                                onClick={() => setShowDocumentModal(pendingUser)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '10px 16px',
                                  background: 'rgba(168, 85, 247, 0.2)',
                                  border: '1px solid rgba(168, 85, 247, 0.3)',
                                  borderRadius: '10px',
                                  color: '#a855f7',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  width: '100%',
                                  justifyContent: 'center',
                                }}
                              >
                                <Eye size={16} />
                                View Document
                              </button>
                            )}
                          </div>
                        )}

                        {/* Warning if no verification document */}
                        {!pendingUser.verification_document && !pendingUser.business_registration_number && (
                          <div style={{ 
                            background: 'rgba(245, 158, 11, 0.1)', 
                            borderRadius: '14px', 
                            padding: '14px',
                            marginBottom: '20px',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}>
                            <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                            <span style={{ fontSize: '13px', color: '#f59e0b' }}>No verification documents provided</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '14px' }}>
                          <button
                            onClick={() => handleRejectUser(pendingUser.id)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '14px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '12px',
                              color: '#ef4444',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            <XCircle size={20} />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveUser(pendingUser.id)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '14px',
                              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              border: 'none',
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            <CheckCircle size={20} />
                            Approve
                          </button>
                        </div>
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
              {events.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '100px 24px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <Calendar style={{ width: '96px', height: '96px', color: '#a855f7', margin: '0 auto 24px', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>No Events Yet</h3>
                  <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '28px' }}>Create your first tourism event to get started!</p>
                  <button
                    onClick={() => setShowEventModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 28px',
                      background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={20} />
                    Add Event
                  </button>
                </div>
              ) : (
                <>
                  {/* Upcoming Events */}
                  {upcomingEvents.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(34, 197, 94, 0.15)', padding: '10px 20px', borderRadius: '24px' }}>
                          <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                          <span style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>🔜 Upcoming Events</span>
                        </div>
                        <span style={{ fontSize: '15px', color: '#64748b' }}>({upcomingEvents.length} events)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                        {upcomingEvents.map((event) => {
                          const daysUntil = Math.ceil((new Date(event.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <div key={event.id} style={{
                              background: 'rgba(30, 41, 59, 0.5)',
                              borderRadius: '20px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              overflow: 'hidden',
                              transition: 'all 0.3s',
                            }}>
                              {/* Image */}
                              <div style={{ position: 'relative', height: '180px', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}>
                                {event.image_url ? (
                                  <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar size={56} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                  </div>
                                )}
                                <div style={{
                                  position: 'absolute',
                                  top: '14px',
                                  left: '14px',
                                  background: 'rgba(0, 0, 0, 0.7)',
                                  backdropFilter: 'blur(8px)',
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: 'white',
                                }}>
                                  In {daysUntil} days
                                </div>
                                <div style={{
                                  position: 'absolute',
                                  top: '14px',
                                  right: '14px',
                                  background: '#a855f7',
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: 'white',
                                }}>
                                  {event.tags?.[0] || 'Event'}
                                </div>
                              </div>
                              {/* Content */}
                              <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '14px', lineHeight: '1.4' }}>{event.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>
                                  <Calendar size={16} style={{ color: '#a855f7' }} />
                                  <span>{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#94a3b8', fontSize: '14px' }}>
                                  <MapPin size={16} style={{ color: '#a855f7' }} />
                                  <span>{event.location_name}</span>
                                </div>
                                
                                {/* Registration Stats */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                  {event.max_capacity && (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      background: 'rgba(168, 85, 247, 0.15)',
                                      borderRadius: '8px',
                                      fontSize: '13px',
                                      color: '#a855f7',
                                    }}>
                                      <Users size={14} />
                                      {event.attendee_count || 0}/{event.max_capacity}
                                    </div>
                                  )}
                                  {(event.pending_registrations_count ?? 0) > 0 && (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      background: 'rgba(245, 158, 11, 0.15)',
                                      borderRadius: '8px',
                                      fontSize: '13px',
                                      color: '#f59e0b',
                                      fontWeight: '600',
                                    }}>
                                      <Clock size={14} />
                                      {event.pending_registrations_count} pending
                                    </div>
                                  )}
                                </div>
                                
                                {/* Actions Row 1: Attendees + Send Reminder */}
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                  <button
                                    onClick={() => navigate(`/admin/events/${event.id}/registrations`)}
                                    style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '8px',
                                      padding: '12px',
                                      background: 'rgba(34, 197, 94, 0.15)',
                                      border: 'none',
                                      borderRadius: '10px',
                                      color: '#22c55e',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Eye size={18} />
                                    Attendees
                                  </button>
                                  <button
                                    onClick={() => setShowReminderModal(event)}
                                    disabled={(event.attendee_count || 0) === 0}
                                    style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '8px',
                                      padding: '12px',
                                      background: 'rgba(59, 130, 246, 0.15)',
                                      border: 'none',
                                      borderRadius: '10px',
                                      color: '#3b82f6',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      cursor: (event.attendee_count || 0) === 0 ? 'not-allowed' : 'pointer',
                                      opacity: (event.attendee_count || 0) === 0 ? 0.5 : 1,
                                    }}
                                  >
                                    <Bell size={18} />
                                    Remind
                                  </button>
                                </div>
                                
                                {/* Actions Row 2: Edit + Delete */}
                                <div style={{ display: 'flex', gap: '10px' }}>
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
                                        recurrence_type: 'none',
                                        max_capacity: null,
                                      });
                                      setImagePreview(event.image_url || '');
                                      setShowEventModal(true);
                                    }}
                                    style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '8px',
                                      padding: '12px',
                                      background: 'rgba(168, 85, 247, 0.15)',
                                      border: 'none',
                                      borderRadius: '10px',
                                      color: '#a855f7',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Edit2 size={18} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '12px',
                                      background: 'rgba(239, 68, 68, 0.15)',
                                      border: 'none',
                                      borderRadius: '10px',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Past Events */}
                  {pastEvents.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(100, 116, 139, 0.15)', padding: '10px 20px', borderRadius: '24px' }}>
                          <Clock size={18} style={{ color: '#64748b' }} />
                          <span style={{ fontSize: '16px', fontWeight: '600', color: '#64748b' }}>📆 Past Events</span>
                        </div>
                        <span style={{ fontSize: '15px', color: '#475569' }}>({pastEvents.length} events)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', opacity: 0.7 }}>
                        {pastEvents.map((event) => (
                          <div key={event.id} style={{
                            background: 'rgba(30, 41, 59, 0.3)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            overflow: 'hidden',
                          }}>
                            <div style={{ position: 'relative', height: '140px', background: 'rgba(100, 116, 139, 0.2)' }}>
                              {event.image_url ? (
                                <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(50%)' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Calendar size={40} style={{ color: 'rgba(100, 116, 139, 0.5)' }} />
                                </div>
                              )}
                              <div style={{
                                position: 'absolute',
                                top: '14px',
                                right: '14px',
                                background: 'rgba(100, 116, 139, 0.8)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'white',
                              }}>
                                ENDED
                              </div>
                            </div>
                            <div style={{ padding: '20px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#94a3b8', marginBottom: '10px' }}>{event.title}</h3>
                              <div style={{ fontSize: '13px', color: '#64748b' }}>
                                {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Places Tab */}
          {activeTab === 'places' && <PlacesManagement />}
          
          {/* Business Management Tab */}
          {activeTab === 'businesses' && <BusinessManagement />}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 50,
        }} onClick={(e) => e.target === e.currentTarget && resetEventForm()}>
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              padding: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '32px' }}>{editingEvent ? '✏️' : '🎉'}</span>
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: '6px 0 0 0' }}>
                  {editingEvent ? 'Update event information' : 'Add a new tourism event'}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEventSubmit} style={{ padding: '28px', maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '10px' }}>Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g., Langkawi Jazz Festival"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '10px' }}>Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Describe your event..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '10px' }}>Start Date *</label>
                  <input
                    type="date"
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '10px' }}>End Date *</label>
                  <input
                    type="date"
                    value={eventForm.end_date}
                    onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '10px' }}>Location *</label>
                  <input
                    type="text"
                    value={eventForm.location_name}
                    onChange={(e) => setEventForm({ ...eventForm, location_name: e.target.value })}
                    placeholder="e.g., Pantai Cenang"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '10px' }}>City</label>
                  <select
                    value={eventForm.city}
                    onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  >
                    <option value="">Select city...</option>
                    {cityOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {eventCategories.map((cat) => {
                    const isSelected = eventForm.tags.includes(cat.value.toLowerCase());
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          const tag = cat.value.toLowerCase();
                          if (isSelected) {
                            setEventForm({ ...eventForm, tags: eventForm.tags.filter(t => t !== tag) });
                          } else {
                            setEventForm({ ...eventForm, tags: [...eventForm.tags, tag] });
                          }
                        }}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '24px',
                          border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                          background: isSelected ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                          color: isSelected ? 'white' : '#94a3b8',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>Event Image</label>
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '28px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: imagePreview ? `url(${imagePreview}) center/cover` : 'transparent',
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  {imagePreview && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '14px' }} />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <Plus size={36} style={{ color: '#a855f7', margin: '0 auto 10px' }} />
                    <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>
                      {imagePreview ? 'Click to change image' : 'Click to upload image'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  type="button"
                  onClick={resetEventForm}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#94a3b8',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Document Modal */}
      {showDocumentModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 50,
        }} onClick={(e) => e.target === e.currentTarget && setShowDocumentModal(null)}>
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <FileText size={28} style={{ color: 'white' }} />
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>Verification Documents</h2>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
                    {showDocumentModal.first_name} {showDocumentModal.last_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDocumentModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                }}
              >
                <X size={20} style={{ color: 'white' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* User Info */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Role</div>
                    <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>
                      {showDocumentModal.role === 'vendor' ? '🍽️ Restaurant Owner' : '🏨 Stay Owner'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email</div>
                    <div style={{ fontSize: '15px', color: '#ffffff' }}>{showDocumentModal.email}</div>
                  </div>
                  {showDocumentModal.phone_number && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Phone</div>
                      <div style={{ fontSize: '15px', color: '#ffffff' }}>{showDocumentModal.phone_number}</div>
                    </div>
                  )}
                  {showDocumentModal.business_registration_number && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Registration Number</div>
                      <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: '600' }}>{showDocumentModal.business_registration_number}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Preview */}
              {showDocumentModal.verification_document && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>Uploaded Document</div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '14px',
                    padding: '20px',
                    textAlign: 'center',
                  }}>
                    {/* Extract filename from path */}
                    {(() => {
                      const docUrl = getDocumentUrl(showDocumentModal.verification_document);
                      const filename = showDocumentModal.verification_document?.split('/').pop() || 'Document';
                      const isCloudinary = docUrl.includes('cloudinary.com') || docUrl.includes('res.cloudinary');
                      const isImage = showDocumentModal.verification_document?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      const isPDF = showDocumentModal.verification_document?.match(/\.pdf$/i);
                      const isDoc = showDocumentModal.verification_document?.match(/\.(doc|docx)$/i);
                      
                      return (
                        <>
                          {/* Document Icon or Image Preview */}
                          <div style={{ marginBottom: '16px' }}>
                            {isImage ? (
                              <img
                                src={docUrl}
                                alt="Verification Document"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '300px',
                                  borderRadius: '10px',
                                  border: '2px solid rgba(255,255,255,0.2)',
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : isPDF ? (
                              <div style={{ 
                                width: '80px', 
                                height: '100px', 
                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                borderRadius: '8px',
                                margin: '0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                              }}>
                                <FileText size={36} style={{ color: 'white' }} />
                                <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>PDF</span>
                              </div>
                            ) : (
                              <div style={{ 
                                width: '80px', 
                                height: '100px', 
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                borderRadius: '8px',
                                margin: '0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                              }}>
                                <FileText size={36} style={{ color: 'white' }} />
                                <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold', marginTop: '4px' }}>{isDoc ? 'DOC' : 'FILE'}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Show filename and status */}
                          <div style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '10px',
                            padding: '16px',
                            marginBottom: '16px',
                          }}>
                            <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600', wordBreak: 'break-all', marginBottom: '8px' }}>
                              {filename}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <CheckCircle size={18} style={{ color: '#22c55e' }} />
                              <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>
                                Document Successfully Uploaded
                              </p>
                            </div>
                          </div>
                          
                          {/* Open Document Button */}
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '14px 24px',
                              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                              border: 'none',
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: '15px',
                              fontWeight: '600',
                              textDecoration: 'none',
                              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(168, 85, 247, 0.5)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.4)';
                            }}
                          >
                            <ExternalLink size={18} />
                            Open Document
                          </a>
                          
                          {!isCloudinary && (
                            <p style={{ color: '#f59e0b', fontSize: '11px', marginTop: '12px' }}>
                              ⚠️ Note: Document may not be available if server was restarted
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Approve/Reject Buttons */}
              <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    handleRejectUser(showDocumentModal.id);
                    setShowDocumentModal(null);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    color: '#ef4444',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <XCircle size={20} />
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApproveUser(showDocumentModal.id);
                    setShowDocumentModal(null);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle size={20} />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {showReminderModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 50,
        }} onClick={(e) => e.target === e.currentTarget && setShowReminderModal(null)}>
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '480px',
            width: '100%',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bell size={26} style={{ color: 'white' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>Send Reminder</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
                  Notify all attendees
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '20px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>{showReminderModal.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
                  <Calendar size={14} />
                  {new Date(showReminderModal.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
                  <Users size={14} />
                  {showReminderModal.attendee_count || 0} confirmed attendees
                </div>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                This will send a reminder email to all confirmed attendees with event details and location information.
              </p>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  onClick={() => setShowReminderModal(null)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#94a3b8',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendReminder(showReminderModal)}
                  disabled={sendingReminder}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: sendingReminder ? 'not-allowed' : 'pointer',
                    opacity: sendingReminder ? 0.7 : 1,
                  }}
                >
                  <Send size={18} />
                  {sendingReminder ? 'Sending...' : 'Send Reminder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Success Notification */}
      {reminderSuccess && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          padding: '18px 24px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          zIndex: 100,
          animation: 'slideIn 0.3s ease-out',
        }}>
          <CheckCircle size={24} style={{ color: 'white' }} />
          <div>
            <div style={{ fontWeight: '700', color: 'white', fontSize: '16px' }}>Reminders Sent!</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>All attendees have been notified</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        input::placeholder, textarea::placeholder {
          color: #64748b;
        }
        input:focus, textarea:focus, select:focus {
          border-color: #a855f7 !important;
        }
        option {
          background: #1e293b;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
