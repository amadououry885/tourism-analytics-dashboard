import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApprovalQueue from '../../components/admin/ApprovalQueue';

type Tab = 'approvals' | 'places' | 'events' | 'transport';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('approvals');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'approvals' as Tab, name: 'User Approvals', icon: '👥' },
    { id: 'places' as Tab, name: 'Tourist Places', icon: '📍' },
    { id: 'events' as Tab, name: 'Events', icon: '🎉' },
    { id: 'transport' as Tab, name: 'Transport Routes', icon: '🚌' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tourism Council Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.username} 👋
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'approvals' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Manage User Applications
              </h2>
              <p className="text-gray-600">
                Review and approve vendor and accommodation owner registrations
              </p>
            </div>
            <ApprovalQueue />
          </div>
        )}

        {activeTab === 'places' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Manage Tourist Places
              </h2>
              <p className="text-gray-600">
                Add and manage tourist destinations in Kedah
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                Places management UI coming soon...
              </p>
              <p className="text-sm text-gray-400 mt-2">
                You can create places via API at <code className="bg-gray-100 px-2 py-1 rounded">/api/analytics/places/</code>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Manage Events
              </h2>
              <p className="text-gray-600">
                Add and manage tourism events and festivals
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                Events management UI coming soon...
              </p>
              <p className="text-sm text-gray-400 mt-2">
                You can create events via API at <code className="bg-gray-100 px-2 py-1 rounded">/api/events/</code>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'transport' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Manage Transport Routes
              </h2>
              <p className="text-gray-600">
                Add and manage transportation routes in Kedah
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                Transport routes management UI coming soon...
              </p>
              <p className="text-sm text-gray-400 mt-2">
                You can create routes via API at <code className="bg-gray-100 px-2 py-1 rounded">/api/transport/api/routes/</code>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
