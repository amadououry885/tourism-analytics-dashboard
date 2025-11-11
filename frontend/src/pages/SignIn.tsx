import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Store, Hotel, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

type UserRole = 'admin' | 'vendor' | 'stay_owner' | null;

export default function SignIn() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleConfig = {
    admin: {
      icon: Shield,
      title: 'Admin Portal',
      description: 'Manage users, approve vendors, and oversee the platform',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-500',
    },
    vendor: {
      icon: Store,
      title: 'Vendor Portal',
      description: 'Manage your restaurants and view analytics',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorder: 'hover:border-purple-500',
    },
    stay_owner: {
      icon: Hotel,
      title: 'Stay Owner Portal',
      description: 'Manage your hotels and accommodations',
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBorder: 'hover:border-green-500',
    },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select a role first');
      return;
    }

    setLoading(true);
    try {
      const user = await login(username, password);
      
      // Verify the user's actual role matches the selected portal
      if (user.role !== selectedRole) {
        toast.error(`Invalid credentials for ${roleConfig[selectedRole].title}. Your account is registered as ${user.role}.`);
        setLoading(false);
        return;
      }

      toast.success('Login successful!');
      
      // Redirect based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'vendor':
          navigate('/vendor/my-restaurants');
          break;
        case 'stay_owner':
          navigate('/stays/my-stays');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
  };

  const handleBack = () => {
    setSelectedRole(null);
    setUsername('');
    setPassword('');
  };

  if (!selectedRole) {
    // Role selection screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Sign In to Your Portal
            </h1>
            <p className="text-gray-600 text-lg">
              Choose your account type to continue
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {(Object.keys(roleConfig) as UserRole[]).map((role) => {
              if (!role) return null;
              const config = roleConfig[role];
              const Icon = config.icon;

              return (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-8 text-center transition-all hover:shadow-xl hover:scale-105 ${config.hoverBorder}`}
                >
                  <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {config.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Login form screen
  const config = roleConfig[selectedRole];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Portal
          </button>

          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {config.title}
            </h2>
            <p className="text-gray-600">
              Enter your credentials to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${config.color} text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{' '}
              <Link to="/business" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Register as Business
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
