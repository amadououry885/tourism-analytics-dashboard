import React, { useState, useEffect } from 'react';
import { Clock, Copy, Save, X } from 'lucide-react';
import api from '../services/api';

interface OpeningHour {
  id?: number;
  vendor: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  day_name?: string;
}

interface OpeningHoursManagementProps {
  vendorId: number;
}

export const OpeningHoursManagement: React.FC<OpeningHoursManagementProps> = ({ vendorId }) => {
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    fetchHours();
  }, [vendorId]);

  const fetchHours = async () => {
    try {
      setLoading(true);
      const response = await api.get('/opening-hours/', {
        params: { vendor_id: vendorId }
      });
      
      // Handle paginated response
      const data = response.data.results || response.data;
      const hoursData = Array.isArray(data) ? data : [];
      
      // Initialize hours for all days if not exists
      const existingDays = hoursData.map((h: OpeningHour) => h.day_of_week);
      const allHours: OpeningHour[] = [];
      
      for (let i = 0; i < 7; i++) {
        const existing = hoursData.find((h: OpeningHour) => h.day_of_week === i);
        if (existing) {
          allHours.push(existing);
        } else {
          allHours.push({
            vendor: vendorId,
            day_of_week: i,
            open_time: '09:00',
            close_time: '22:00',
            is_closed: false,
          });
        }
      }
      
      setHours(allHours);
    } catch (error) {
      console.error('Error fetching hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (dayIndex: number, field: 'open_time' | 'close_time', value: string) => {
    setHours(prev => prev.map((h, idx) => 
      idx === dayIndex ? { ...h, [field]: value } : h
    ));
  };

  const toggleClosed = (dayIndex: number) => {
    setHours(prev => prev.map((h, idx) => 
      idx === dayIndex ? { ...h, is_closed: !h.is_closed } : h
    ));
  };

  const copyToAll = (dayIndex: number) => {
    const source = hours[dayIndex];
    if (!confirm(`Copy ${daysOfWeek[dayIndex]}'s hours to all other days?`)) return;
    
    setHours(prev => prev.map(h => ({
      ...h,
      open_time: source.open_time,
      close_time: source.close_time,
      is_closed: source.is_closed,
    })));
  };

  const saveHours = async () => {
    try {
      setSaving(true);
      
      // Save or update each day's hours
      const promises = hours.map(async (hour) => {
        if (hour.id) {
          // Update existing
          await api.put(`/opening-hours/${hour.id}/`, hour);
        } else {
          // Create new
          await api.post('/opening-hours/', hour);
        }
      });
      
      await Promise.all(promises);
      await fetchHours(); // Refresh to get IDs
      alert('Opening hours saved successfully!');
    } catch (error) {
      console.error('Error saving hours:', error);
      alert('Failed to save opening hours');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading opening hours...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Opening Hours</h2>
          <p className="text-gray-600 mt-1">Set your restaurant's operating hours for each day</p>
        </div>
        <button
          onClick={saveHours}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Hours'}
        </button>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Day</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Opening Time</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Closing Time</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-gray-200 ${hour.is_closed ? 'bg-gray-50' : 'bg-white'} hover:bg-emerald-50 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Clock className={`w-5 h-5 ${hour.is_closed ? 'text-gray-400' : 'text-emerald-600'}`} />
                      <span className={`font-semibold ${hour.is_closed ? 'text-gray-500' : 'text-gray-900'}`}>
                        {daysOfWeek[idx]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hour.is_closed}
                        onChange={() => toggleClosed(idx)}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className={`text-sm font-medium ${hour.is_closed ? 'text-red-600' : 'text-green-600'}`}>
                        {hour.is_closed ? 'Closed' : 'Open'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="time"
                      value={hour.open_time}
                      onChange={(e) => handleTimeChange(idx, 'open_time', e.target.value)}
                      disabled={hour.is_closed}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="time"
                      value={hour.close_time}
                      onChange={(e) => handleTimeChange(idx, 'close_time', e.target.value)}
                      disabled={hour.is_closed}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => copyToAll(idx)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy to All
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          💡 Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use the "Copy to All" button to quickly apply the same hours to every day</li>
          <li>• Uncheck "Open" for days when your restaurant is closed</li>
          <li>• Make sure to click "Save All Hours" after making changes</li>
          <li>• Times are displayed in 24-hour format (e.g., 14:00 = 2:00 PM)</li>
        </ul>
      </div>

      {/* Current Status Preview */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6">
        <h3 className="font-bold text-emerald-900 mb-4">Weekly Schedule Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hours.map((hour, idx) => (
            <div 
              key={idx} 
              className={`px-4 py-3 rounded-lg ${
                hour.is_closed 
                  ? 'bg-red-100 border-2 border-red-300' 
                  : 'bg-white border-2 border-emerald-300'
              }`}
            >
              <div className="font-bold text-gray-900 mb-1">{daysOfWeek[idx]}</div>
              {hour.is_closed ? (
                <div className="text-red-700 font-medium">Closed</div>
              ) : (
                <div className="text-emerald-700 font-medium">
                  {hour.open_time} - {hour.close_time}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
