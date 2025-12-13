import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Store, Building2, ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const SignIn: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'vendor' | 'stay_owner' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const portals = [
    {
      role: 'admin' as const,
      title: 'Admin Portal',
      description: 'Manage users, approve vendors, oversee platform',
      icon: Shield,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
    },
    {
      role: 'vendor' as const,
      title: 'Vendor Portal',
      description: 'Manage your restaurants and view analytics',
      icon: Store,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      role: 'stay_owner' as const,
      title: 'Stay Owner Portal',
      description: 'Manage your hotels and accommodations',
      icon: Building2,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select a portal');
      return;
    }

    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await login(username, password);
      
      console.log('Logged in user:', loggedInUser);
      console.log('Selected portal:', selectedRole);
      
      // Check if user role matches selected portal
      if (loggedInUser.role !== selectedRole) {
        toast.error(`Access denied! You don't have access to the ${selectedPortal?.title}. Your role is: ${loggedInUser.role}`);
        setIsLoading(false);
        return;
      }

      // Check if user is approved (for vendors and stay owners)
      if ((loggedInUser.role === 'vendor' || loggedInUser.role === 'stay_owner') && !loggedInUser.is_approved) {
        toast.error('Your account is pending approval. Please wait for admin approval.');
        setIsLoading(false);
        return;
      }

      toast.success('Login successful!');
      
      // Navigate based on user role with a small delay to ensure state is updated
      setTimeout(() => {
        switch (loggedInUser.role) {
          case 'admin':
            console.log('Navigating to admin dashboard');
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'vendor':
            console.log('Navigating to vendor dashboard');
            navigate('/vendor/dashboard', { replace: true });
            break;
          case 'stay_owner':
            console.log('Navigating to stay owner dashboard');
            navigate('/stay-owner/dashboard', { replace: true });
            break;
          default:
            console.log('Navigating to default dashboard');
            navigate('/dashboard', { replace: true });
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPortal = portals.find(p => p.role === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        
        {/* Back to Home Button - Always visible */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        {!selectedRole && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-lg text-gray-600">Choose your portal to sign in</p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {portals.map((portal) => {
                const Icon = portal.icon;
                return (
                  <button
                    key={portal.role}
                    onClick={() => setSelectedRole(portal.role)}
                    className={`relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br ${portal.bgGradient} border-2 border-gray-200 hover:border-gray-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group`}
                  >
                    <Icon className="w-16 h-16 mx-auto mb-4 text-gray-700 group-hover:text-gray-900 transition-colors" />
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{portal.title}</h3>
                    <p className="text-sm text-gray-600">{portal.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedRole && selectedPortal && (
          <div className="max-w-md mx-auto">
            <button
              onClick={() => {
                setSelectedRole(null);
                setUsername('');
                setPassword('');
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Portal
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-full bg-blue-600 mb-4">
                  <selectedPortal.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPortal.title}</h2>
                <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Enter password"
                  />
                </div>

                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-3 px-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 disabled:bg-gray-400"
                >
                  {isLoading ? 'Signing in...' : 'SIGN IN'}
                </button>

                <p className="text-center text-gray-600 text-sm mt-6">
                  Don't have an account?{' '}
                  <Link to="/business" className="text-blue-600 font-semibold hover:underline">
                    Register Here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;