import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Users, Download, Calendar, Mail, Phone, User, CheckCircle, XCircle, Clock, Send, Bell, Check, X, MapPin, Sparkles } from 'lucide-react';

interface Registration {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  form_data: Record<string, any>;
  registered_at: string;
  user_username?: string;
}

interface Event {
  id: number;
  title: string;
  start_date: string;
  location_name: string;
  attendee_count: number;
  max_capacity: number;
  requires_approval?: boolean;
}

const EventRegistrations: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<Registration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<{ type: 'approve' | 'reject', name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, regRes] = await Promise.all([
        api.get(`/events/${eventId}/`),
        api.get(`/events/${eventId}/attendees/`)
      ]);
      
      setEvent(eventRes.data);
      setRegistrations(regRes.data.attendees || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
      confirmed: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: <CheckCircle size={14} /> },
      cancelled: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: <XCircle size={14} /> },
      pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', icon: <Clock size={14} /> },
      rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: <XCircle size={14} /> },
    };
    
    const style = styles[status] || styles.pending;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        background: style.bg,
        color: style.color,
      }}>
        {style.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const exportToCSV = () => {
    if (!registrations.length) return;

    const allFields = new Set<string>();
    registrations.forEach(reg => {
      Object.keys(reg.form_data || {}).forEach(key => allFields.add(key));
    });

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Registered At', 'User', ...Array.from(allFields)];
    
    const rows = registrations.map(reg => {
      const baseData = [
        reg.contact_name,
        reg.contact_email,
        reg.contact_phone,
        reg.status,
        new Date(reg.registered_at).toLocaleString(),
        reg.user_username || 'Guest'
      ];
      
      const formData = Array.from(allFields).map(field => {
        const value = reg.form_data?.[field];
        if (Array.isArray(value)) return value.join('; ');
        return value || '';
      });
      
      return [...baseData, ...formData];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title.replace(/\s+/g, '_')}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendReminder = async () => {
    setSendingReminder(true);
    setReminderSuccess(false);
    
    try {
      await api.post(`/events/${eventId}/send_reminder/`, {
        message: `This is a friendly reminder about ${event?.title}!\n\nEvent Details:\nDate: ${new Date(event?.start_date || '').toLocaleDateString()}\nLocation: ${event?.location_name}\n\nWe look forward to seeing you there!`
      });
      
      setReminderSuccess(true);
      setShowReminderModal(false);
      setTimeout(() => setReminderSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminders. Please try again.');
    } finally {
      setSendingReminder(false);
    }
  };

  const handleApprove = async (registrationId: number, contactName: string) => {
    try {
      setProcessingId(registrationId);
      await api.post(`/events/${eventId}/registrations/${registrationId}/approve/`);
      
      setRegistrations(prev => prev.map(r => 
        r.id === registrationId ? { ...r, status: 'confirmed' } : r
      ));
      
      setActionSuccess({ type: 'approve', name: contactName });
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve registration');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(showRejectModal.id);
      await api.post(`/events/${eventId}/registrations/${showRejectModal.id}/reject/`, {
        reason: rejectReason,
        admin_notes: rejectReason,
      });
      
      setRegistrations(prev => prev.map(r => 
        r.id === showRejectModal.id ? { ...r, status: 'rejected' } : r
      ));
      
      setActionSuccess({ type: 'reject', name: showRejectModal.contact_name });
      setShowRejectModal(null);
      setRejectReason('');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject registration');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.status === filter;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(168, 85, 247, 0.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: '#94a3b8', fontSize: '16px' }}>Loading registrations...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>Event not found</div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Registrations', value: registrations.length, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', icon: Users },
    { label: 'Confirmed', value: registrations.filter(r => r.status === 'confirmed').length, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
    { label: 'Pending', value: registrations.filter(r => r.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
    { label: 'Cancelled', value: registrations.filter(r => r.status === 'cancelled' || r.status === 'rejected').length, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: XCircle },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px 32px',
      }}>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '15px',
            cursor: 'pointer',
            marginBottom: '20px',
            padding: '8px 0',
          }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', margin: '0 0 12px 0' }}>{event.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '15px' }}>
                <Calendar size={18} style={{ color: '#a855f7' }} />
                {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '15px' }}>
                <MapPin size={18} style={{ color: '#a855f7' }} />
                {event.location_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '15px' }}>
                <Users size={18} style={{ color: '#a855f7' }} />
                {event.attendee_count} / {event.max_capacity || '∞'} registered
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowReminderModal(true)}
              disabled={registrations.filter(r => r.status === 'confirmed').length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                color: '#22c55e',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                opacity: registrations.filter(r => r.status === 'confirmed').length === 0 ? 0.5 : 1,
              }}
            >
              <Send size={18} />
              Send Reminder
            </button>
            <button
              onClick={exportToCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 32px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
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

        {/* Filters */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}>
          {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: filter === status ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                background: filter === status ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                color: filter === status ? 'white' : '#94a3b8',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Registrations List */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
        }}>
          {filteredRegistrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <Users size={64} style={{ color: '#475569', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>No registrations found</h3>
              <p style={{ fontSize: '15px', color: '#64748b' }}>No attendees have registered yet for this event.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                    {['Attendee', 'Contact', 'Status', 'Registered', 'Details', 'Actions'].map((header) => (
                      <th key={header} style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((registration, idx) => (
                    <tr key={registration.id} style={{ borderTop: idx > 0 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                      <td style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '600',
                          }}>
                            {registration.contact_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{registration.contact_name}</div>
                            {registration.user_username && (
                              <div style={{ fontSize: '13px', color: '#64748b' }}>@{registration.user_username}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8' }}>
                            <Mail size={14} style={{ color: '#a855f7' }} />
                            {registration.contact_email}
                          </div>
                          {registration.contact_phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
                              <Phone size={14} style={{ color: '#a855f7' }} />
                              {registration.contact_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        {getStatusBadge(registration.status)}
                      </td>
                      <td style={{ padding: '20px', color: '#94a3b8', fontSize: '14px' }}>
                        {new Date(registration.registered_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(registration.registered_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <details style={{ fontSize: '14px' }}>
                          <summary style={{ cursor: 'pointer', color: '#a855f7', fontWeight: '500' }}>
                            View Form Data
                          </summary>
                          <div style={{
                            marginTop: '12px',
                            padding: '14px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}>
                            {Object.entries(registration.form_data || {}).map(([key, value]) => (
                              <div key={key} style={{ marginBottom: '8px' }}>
                                <span style={{ fontWeight: '500', color: '#94a3b8' }}>
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </span>{' '}
                                <span style={{ color: '#64748b' }}>
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </td>
                      <td style={{ padding: '20px' }}>
                        {registration.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleApprove(registration.id, registration.contact_name)}
                              disabled={processingId === registration.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                opacity: processingId === registration.id ? 0.6 : 1,
                              }}
                            >
                              <Check size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => setShowRejectModal(registration)}
                              disabled={processingId === registration.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '10px',
                                color: '#ef4444',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                opacity: processingId === registration.id ? 0.6 : 1,
                              }}
                            >
                              <X size={16} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '14px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Success Notifications */}
      {(reminderSuccess || actionSuccess) && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: actionSuccess?.type === 'reject' ? 'rgba(100, 116, 139, 0.95)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          padding: '18px 24px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          zIndex: 50,
          animation: 'slideIn 0.3s ease-out',
        }}>
          {actionSuccess?.type === 'reject' ? <XCircle size={24} style={{ color: 'white' }} /> : <CheckCircle size={24} style={{ color: 'white' }} />}
          <div>
            <div style={{ fontWeight: '700', color: 'white', fontSize: '16px' }}>
              {reminderSuccess ? 'Reminders Sent!' : actionSuccess?.type === 'approve' ? 'Registration Approved!' : 'Registration Rejected'}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
              {reminderSuccess ? 'All confirmed attendees have been notified' : `${actionSuccess?.name}'s registration has been ${actionSuccess?.type === 'approve' ? 'confirmed' : 'rejected'}. Email sent.`}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
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
        }} onClick={(e) => e.target === e.currentTarget && setShowRejectModal(null)}>
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(239, 68, 68, 0.15)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <XCircle size={28} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: 0 }}>Reject Registration</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Rejecting <strong style={{ color: '#94a3b8' }}>{showRejectModal.contact_name}</strong>
                </p>
              </div>
            </div>
            
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
              Please provide a reason for rejection. This message will be sent to the attendee via email.
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Unfortunately, the event has reached capacity..."
              rows={4}
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
                marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                disabled={processingId === showRejectModal.id}
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
                onClick={handleReject}
                disabled={!rejectReason.trim() || processingId === showRejectModal.id}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: !rejectReason.trim() || processingId === showRejectModal.id ? 0.5 : 1,
                }}
              >
                {processingId === showRejectModal.id ? 'Sending...' : 'Send Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
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
        }} onClick={(e) => e.target === e.currentTarget && setShowReminderModal(false)}>
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(34, 197, 94, 0.15)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bell size={28} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: 0 }}>Send Event Reminder</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Notify all confirmed attendees</p>
              </div>
            </div>

            <div style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Mail size={20} style={{ color: '#a855f7', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                  <p style={{ fontWeight: '600', marginBottom: '10px', color: '#ffffff' }}>This will send a friendly email reminder to:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                    <li><strong style={{ color: '#a855f7' }}>{registrations.filter(r => r.status === 'confirmed').length}</strong> confirmed attendees</li>
                    <li>Event: <strong style={{ color: '#ffffff' }}>{event?.title}</strong></li>
                    <li>Date: <strong style={{ color: '#ffffff' }}>{new Date(event?.start_date || '').toLocaleDateString()}</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '24px',
              fontSize: '13px',
              color: '#f59e0b',
            }}>
              <strong>Note:</strong> Make sure to send reminders at an appropriate time before the event.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowReminderModal(false)}
                disabled={sendingReminder}
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
                onClick={sendReminder}
                disabled={sendingReminder}
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
                {sendingReminder ? (
                  <>
                    <div style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Reminder Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        textarea::placeholder {
          color: #64748b;
        }
        textarea:focus {
          border-color: #a855f7 !important;
        }
        details summary::-webkit-details-marker {
          display: none;
        }
        details summary::before {
          content: '▶ ';
          font-size: 10px;
        }
        details[open] summary::before {
          content: '▼ ';
        }
      `}</style>
    </div>
  );
};

export default EventRegistrations;
