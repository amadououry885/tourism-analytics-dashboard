import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

interface PendingUser {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

const ApprovalQueue: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getPendingUsers();
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Failed to load pending users:', error);
      toast.error('⚠️ Failed to load pending approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: number, username: string) => {
    setProcessingId(userId);
    try {
      await adminAPI.approveUser(userId);
      toast.success(`✅ ${username} has been approved!`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (error: any) {
      console.error('Approval failed:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to approve user';
      toast.error(`⚠️ ${errorMsg}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: number, username: string) => {
    if (!window.confirm(`Are you sure you want to reject ${username}'s application?`)) {
      return;
    }

    setProcessingId(userId);
    try {
      await adminAPI.rejectUser(userId);
      toast.success(`✅ ${username}'s application has been rejected`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (error: any) {
      console.error('Rejection failed:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to reject user';
      toast.error(`⚠️ ${errorMsg}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      vendor: 'bg-purple-100 text-purple-800',
      stay_owner: 'bg-blue-100 text-blue-800',
    };
    const colors = badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    const label = role === 'stay_owner' ? 'Hotel Owner' : 'Restaurant Owner';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors}`}>
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
        <p className="mt-1 text-sm text-gray-500">No pending approvals at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Approvals ({pendingUsers.length})
        </h3>
        <button
          onClick={loadPendingUsers}
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {pendingUsers.map((user) => (
        <div
          key={user.id}
          className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-semibold text-gray-900">
                  {user.first_name || user.last_name
                    ? `${user.first_name} ${user.last_name}`.trim()
                    : user.username}
                </h4>
                {getRoleBadge(user.role)}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Username:</span> {user.username}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Applied:</span>{' '}
                  {new Date(user.date_joined).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleApprove(user.id, user.username)}
                disabled={processingId === user.id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {processingId === user.id ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(user.id, user.username)}
                disabled={processingId === user.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {processingId === user.id ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalQueue;
