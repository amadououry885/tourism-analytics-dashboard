import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, Mail, Phone, MessageSquare } from 'lucide-react';
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

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

  const updateReservationStatus = async (reservationId: number, status: 'confirmed' | 'cancelled') => {
    try {
      // Use the specific confirm/cancel endpoints that trigger email notifications
      const endpoint = status === 'confirmed' 
        ? `/reservations/${reservationId}/confirm/`
        : `/reservations/${reservationId}/cancel/`;
      
      await api.post(endpoint);
      await fetchReservations();
      
      // Show success message
      const message = status === 'confirmed' 
        ? 'Reservation confirmed! Customer will receive an email confirmation.'
        : 'Reservation cancelled. Customer will be notified via email.';
      alert(message);
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Failed to update reservation status');
    }
  };

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      cancelled: '❌',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📅 Reservations</h2>
        <p className="text-gray-600">Manage your restaurant bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-3 font-semibold transition-all ${
              filter === tab
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-gray-200 rounded-full text-xs">
                {reservations.filter(r => r.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No {filter !== 'all' ? filter : ''} reservations</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You don't have any reservations yet. They'll appear here when customers book."
              : `No ${filter} reservations found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{reservation.customer_name}</h3>
                    {getStatusBadge(reservation.status)}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Date:</span>
                      <span>{new Date(reservation.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Time:</span>
                      <span>{reservation.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Party Size:</span>
                      <span>{reservation.party_size} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Email:</span>
                      <a href={`mailto:${reservation.customer_email}`} className="text-blue-600 hover:underline">
                        {reservation.customer_email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Phone:</span>
                      <a href={`tel:${reservation.customer_phone}`} className="text-blue-600 hover:underline">
                        {reservation.customer_phone}
                      </a>
                    </div>
                  </div>

                  {reservation.special_requests && (
                    <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900">Special Requests:</p>
                          <p className="text-amber-800">{reservation.special_requests}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {reservation.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirm
                  </button>
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
