import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, Mail, Phone, MessageSquare, Trash2, Archive, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

interface Reservation {
  id: number;
  vendor: number;
  vendor_name?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string;
  time: string;
  party_size: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface ReservationManagementProps {
  vendorId: number;
}

export const ReservationManagement: React.FC<ReservationManagementProps> = ({ vendorId }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'past'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [vendorId]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations/', {
        params: { vendor_id: vendorId }
      });
      const data = response.data.results || response.data;
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if a reservation date has passed
  const isPastReservation = (reservation: Reservation) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(reservation.date);
    return reservationDate < today;
  };

  // Delete a reservation
  const handleDelete = async (reservationId: number) => {
    try {
      setProcessingId(reservationId);
      await api.delete(`/reservations/${reservationId}/`);
      await fetchReservations();
      setDeleteConfirm(null);
      alert('🗑️ Reservation deleted successfully.');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Failed to delete reservation');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete all past/cancelled reservations using bulk endpoint
  const handleCleanup = async () => {
    const toDelete = reservations.filter(r => 
      isPastReservation(r) || r.status === 'cancelled'
    );
    
    if (toDelete.length === 0) {
      alert('No past or cancelled reservations to clean up.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${toDelete.length} past/cancelled reservation(s)? This cannot be undone.`)) {
      return;
    }
    
    try {
      setProcessingId(-1); // Special indicator for bulk delete
      // Use bulk cleanup endpoint
      const response = await api.post('/reservations/cleanup/');
      await fetchReservations();
      alert(`🧹 ${response.data.message || `Cleaned up ${toDelete.length} reservation(s).`}`);
    } catch (error) {
      console.error('Error during cleanup:', error);
      alert('Some reservations could not be deleted.');
      await fetchReservations();
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirm = async (reservationId: number) => {
    try {
      setProcessingId(reservationId);
      await api.post(`/reservations/${reservationId}/confirm/`);
      await fetchReservations();
      alert('✅ Reservation confirmed! Customer will receive an email confirmation.');
    } catch (error) {
      console.error('Error confirming reservation:', error);
      alert('Failed to confirm reservation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reservationId: number) => {
    try {
      setProcessingId(reservationId);
      await api.post(`/reservations/${reservationId}/cancel/`, { reason: rejectReason });
      await fetchReservations();
      setShowRejectModal(null);
      setRejectReason('');
      alert('❌ Reservation rejected. Customer will be notified via email.');
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      alert('Failed to reject reservation');
    } finally {
      setProcessingId(null);
    }
  };

  // Separate reservations into upcoming and past
  const upcomingReservations = reservations.filter(r => !isPastReservation(r));
  const pastReservations = reservations.filter(r => isPastReservation(r));
  
  // Count for cleanup button
  const cleanupCount = reservations.filter(r => isPastReservation(r) || r.status === 'cancelled').length;

  // Filter logic - only show upcoming by default unless viewing past/all
  const getFilteredReservations = () => {
    let filtered = showPast ? reservations : upcomingReservations;
    
    if (filter === 'past') {
      return pastReservations;
    }
    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter);
    }
    return filtered;
  };
  
  const filteredReservations = getFilteredReservations();

  const getStatusBadge = (status: string, isPast: boolean = false) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
      confirmed: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
    };
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      cancelled: '❌',
    };
    const style = styles[status as keyof typeof styles] || styles.pending;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        background: isPast ? '#e5e7eb' : style.bg,
        color: isPast ? '#6b7280' : style.color,
        border: `2px solid ${isPast ? '#9ca3af' : style.border}`
      }}>
        {isPast ? '📅' : icons[status as keyof typeof icons]} {isPast ? 'Past' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#d4a574', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading reservations...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>📅</span> Reservations
          </h2>
          <p style={{ color: '#6b7280' }}>Manage your restaurant bookings - approve or reject customer reservations</p>
        </div>
        
        {/* Cleanup Button */}
        {cleanupCount > 0 && (
          <button
            onClick={handleCleanup}
            disabled={processingId === -1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: processingId === -1 ? '#9ca3af' : '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: processingId === -1 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
            {processingId === -1 ? 'Cleaning...' : `🧹 Clean Up (${cleanupCount})`}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0', flexWrap: 'wrap', alignItems: 'center' }}>
        {(['pending', 'confirmed', 'all', 'cancelled', 'past'] as const).map((tab) => {
          let count = 0;
          if (tab === 'all') count = upcomingReservations.length;
          else if (tab === 'past') count = pastReservations.length;
          else count = upcomingReservations.filter(r => r.status === tab).length;
          
          const isActive = filter === tab;
          const colors: Record<string, string> = {
            all: '#6b7280',
            pending: '#f59e0b',
            confirmed: '#10b981',
            cancelled: '#ef4444',
            past: '#9ca3af'
          };
          const labels: Record<string, string> = {
            all: '📋 Upcoming',
            pending: '⏳ Pending',
            confirmed: '✅ Confirmed',
            cancelled: '❌ Cancelled',
            past: '📅 Past'
          };
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '12px 16px',
                fontWeight: '600',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: isActive ? `3px solid ${colors[tab]}` : '3px solid transparent',
                color: isActive ? colors[tab] : '#6b7280',
                marginBottom: '-2px',
                transition: 'all 0.2s',
                fontSize: '14px'
              }}
            >
              {labels[tab]}
              <span style={{
                marginLeft: '6px',
                padding: '2px 8px',
                background: isActive ? colors[tab] : '#e5e7eb',
                color: isActive ? 'white' : '#6b7280',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#f9fafb', borderRadius: '16px' }}>
          <Calendar style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            No {filter === 'past' ? 'past' : filter !== 'all' ? filter : 'upcoming'} reservations
          </h3>
          <p style={{ color: '#6b7280' }}>
            {filter === 'pending' 
              ? "No pending reservations waiting for your approval."
              : filter === 'past'
              ? "No past reservations. Past reservations will appear here after their date passes."
              : "Reservations will appear here when customers book."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReservations.map((reservation) => {
            const isPast = isPastReservation(reservation);
            const canDelete = isPast || reservation.status === 'cancelled';
            
            return (
            <div
              key={reservation.id}
              style={{
                background: isPast ? '#f9fafb' : 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: isPast ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                opacity: isPast ? 0.8 : 1
              }}
            >
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: isPast ? '#6b7280' : '#1f2937', marginBottom: '8px' }}>
                    {reservation.customer_name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {getStatusBadge(reservation.status, false)}
                    {isPast && (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: '#e5e7eb',
                        color: '#6b7280',
                        border: '2px solid #9ca3af'
                      }}>
                        📅 Past
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Delete Button for past/cancelled */}
                {canDelete && (
                  <button
                    onClick={() => setDeleteConfirm(reservation.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                    Delete
                  </button>
                )}
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPast ? '#9ca3af' : '#374151' }}>
                  <Calendar style={{ width: '20px', height: '20px', color: isPast ? '#9ca3af' : '#d4a574' }} />
                  <span style={{ fontWeight: '600' }}>Date:</span>
                  <span>{new Date(reservation.date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPast ? '#9ca3af' : '#374151' }}>
                  <Clock style={{ width: '20px', height: '20px', color: isPast ? '#9ca3af' : '#d4a574' }} />
                  <span style={{ fontWeight: '600' }}>Time:</span>
                  <span>{reservation.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPast ? '#9ca3af' : '#374151' }}>
                  <Users style={{ width: '20px', height: '20px', color: isPast ? '#9ca3af' : '#d4a574' }} />
                  <span style={{ fontWeight: '600' }}>Party Size:</span>
                  <span>{reservation.party_size} guests</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPast ? '#9ca3af' : '#374151' }}>
                  <Mail style={{ width: '20px', height: '20px', color: isPast ? '#9ca3af' : '#d4a574' }} />
                  <span style={{ fontWeight: '600' }}>Email:</span>
                  <a href={`mailto:${reservation.customer_email}`} style={{ color: isPast ? '#9ca3af' : '#d4a574' }}>
                    {reservation.customer_email}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPast ? '#9ca3af' : '#374151' }}>
                  <Phone style={{ width: '20px', height: '20px', color: isPast ? '#9ca3af' : '#d4a574' }} />
                  <span style={{ fontWeight: '600' }}>Phone:</span>
                  <a href={`tel:${reservation.customer_phone}`} style={{ color: isPast ? '#9ca3af' : '#d4a574' }}>
                    {reservation.customer_phone}
                  </a>
                </div>
              </div>

              {/* Special Requests */}
              {reservation.special_requests && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: isPast ? '#f3f4f6' : '#fef3c7', borderLeft: `4px solid ${isPast ? '#9ca3af' : '#f59e0b'}`, borderRadius: '0 8px 8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MessageSquare style={{ width: '20px', height: '20px', color: isPast ? '#9ca3af' : '#d97706', marginTop: '2px' }} />
                    <div>
                      <p style={{ fontWeight: '600', color: isPast ? '#6b7280' : '#92400e', marginBottom: '4px' }}>Special Requests:</p>
                      <p style={{ color: isPast ? '#9ca3af' : '#78350f' }}>{reservation.special_requests}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS - Only show for pending reservations that are NOT past */}
              {reservation.status === 'pending' && !isPast && (
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginTop: '20px', 
                  paddingTop: '20px', 
                  borderTop: '2px solid #e5e7eb' 
                }}>
                  <button
                    onClick={() => handleConfirm(reservation.id)}
                    disabled={processingId === reservation.id}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px 24px',
                      background: processingId === reservation.id ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: processingId === reservation.id ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <CheckCircle style={{ width: '20px', height: '20px' }} />
                    {processingId === reservation.id ? 'Processing...' : '✅ Approve Reservation'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(reservation.id)}
                    disabled={processingId === reservation.id}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px 24px',
                      background: processingId === reservation.id ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: processingId === reservation.id ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <XCircle style={{ width: '20px', height: '20px' }} />
                    ❌ Reject Reservation
                  </button>
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Trash2 style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                Delete Reservation?
              </h3>
              <p style={{ color: '#6b7280' }}>
                This will permanently remove this reservation from your records. This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              ❌ Reject Reservation
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Please provide a reason for rejecting this reservation (optional). The customer will be notified via email.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., We are fully booked at this time, Restaurant is closed for maintenance..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '100px',
                resize: 'vertical',
                marginBottom: '16px',
                fontSize: '14px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {processingId === showRejectModal ? 'Rejecting...' : 'Reject Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

