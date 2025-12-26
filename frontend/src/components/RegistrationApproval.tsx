// RegistrationApproval.tsx - Admin interface for reviewing event registrations
import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import api from '../services/api';

interface Registration {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  form_data: Record<string, any>;
  registered_at: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

interface Event {
  id: number;
  title: string;
  start_date: string;
  requires_approval: boolean;
}

interface RegistrationApprovalProps {
  eventId: number;
}

export default function RegistrationApproval({ eventId }: RegistrationApprovalProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      const eventResp = await api.get(`/events/${eventId}/`);
      setEvent(eventResp.data);
      
      // Fetch pending registrations
      const regResp = await api.get(`/events/${eventId}/pending_registrations/`);
      setRegistrations(regResp.data.registrations);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: number) => {
    try {
      setProcessingId(registrationId);
      
      await api.post(`/events/${eventId}/registrations/${registrationId}/approve/`);
      
      // Remove from pending list
      setRegistrations(prev => prev.filter(r => r.id !== registrationId));
      setSelectedReg(null);
      
      alert('Registration approved! Confirmation email sent to attendee.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve registration');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (registrationId: number) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(registrationId);
      
      await api.post(`/events/${eventId}/registrations/${registrationId}/reject/`, {
        reason: rejectReason,
        admin_notes: rejectReason,
      });
      
      // Remove from pending list
      setRegistrations(prev => prev.filter(r => r.id !== registrationId));
      setSelectedReg(null);
      setRejectReason('');
      
      alert('Registration rejected. Notification email sent to applicant.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject registration');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event?.requires_approval) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
        <p className="font-medium">Auto-Approval Enabled</p>
        <p className="text-sm mt-1">This event automatically approves all registrations.</p>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 font-medium">No Pending Registrations</p>
        <p className="text-sm text-gray-500 mt-1">All registrations have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Pending Registrations</h3>
        <p className="text-sm text-gray-600">{registrations.length} registration{registrations.length !== 1 ? 's' : ''} awaiting review</p>
      </div>

      {registrations.map(reg => (
        <div key={reg.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{reg.contact_name}</h4>
                <p className="text-sm text-gray-500">
                  Registered {new Date(reg.registered_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
              Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              {reg.contact_email}
            </div>
            {reg.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {reg.contact_phone}
              </div>
            )}
          </div>

          {/* Form Data */}
          {Object.keys(reg.form_data).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Registration Details:</p>
              <div className="space-y-2">
                {Object.entries(reg.form_data).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="font-medium text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-gray-800">
                      {Array.isArray(value) ? value.join(', ') : value?.toString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedReg(reg);
                setRejectReason('');
              }}
              disabled={processingId === reg.id}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => handleApprove(reg.id)}
              disabled={processingId === reg.id}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
          </div>
        </div>
      ))}

      {/* Reject Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Registration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedReg.contact_name}'s registration.
              This message will be sent to them via email.
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Unfortunately, the event has reached capacity..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedReg(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedReg.id)}
                disabled={!rejectReason.trim() || processingId === selectedReg.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedReg.id ? 'Sending...' : 'Send Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
