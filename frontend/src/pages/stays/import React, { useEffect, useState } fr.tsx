import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, TrendingUp, MapPin, Star, Award, BarChart3, Zap, Shield } from 'lucide-react';

// Define the structure of the destination data
interface DestinationData {
  name: string;
  visitors: number;
  posts: number;
  growth: number;
}

const Stays: React.FC = () => {
  // State to store destination statistics
  const [destinationData, setDestinationData] = useState<DestinationData[]>([]);

  // Fetch destination statistics from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use relative path so Vite proxy is used
        const response = await fetch('/api/analytics/destinations/');
        if (!response.ok) {
          // handle non-OK response
          console.error('Failed to fetch destinations:', response.status);
          setDestinationData([]);
          return;
        }
        const data = await response.json();
        setDestinationData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching destination data:', error);
        setDestinationData([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    K
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Kedah Tourism Analytics</h1>
                  <p className="text-xs text-gray-500 font-medium">Business Partner Portal</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-6 py-2.5 text-gray-700 hover:text-indigo-600 font-semibold transition-colors relative group"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Grow Your Tourism Business
            </h1>
            <p className="text-xl text-gray-700 mb-8 font-medium">
              Join 500+ partners reaching 10K+ monthly visitors across 5 cities in Kedah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            <Link
              to="/register?role=vendor"
              className="group relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-3xl p-8 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden hover:scale-105 transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 group-hover:from-white/10 group-hover:via-white/15 group-hover:to-white/10 transition-all duration-500"></div>
              <div className="relative">
                <div className="mb-4">
                  <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all">
                    <span className="text-5xl">🍜</span>
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-3 text-white">I Own a Restaurant</h3>
                <p className="text-purple-100 mb-6 leading-relaxed text-lg">Register your restaurant and reach food enthusiasts visiting Kedah</p>
                <ul className="space-y-2 mb-6">
                  {['Manage menu & pricing', 'Track customer reviews', 'Real-time analytics'].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-purple-100 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 transition-all">
                  <span className="font-bold text-white text-lg">Register Now</span>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              <div className="absolute top-6 right-6 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </Link>

            <Link
              to="/register?role=stay_owner"
              className="group relative bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-800 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden hover:scale-105 transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 group-hover:from-white/10 group-hover:via-white/15 group-hover:to-white/10 transition-all duration-500"></div>
              <div className="relative">
                <div className="mb-4">
                  <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all">
                    <span className="text-5xl">🏨</span>
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-3 text-white">I Own a Hotel / Stay</h3>
                <p className="text-blue-100 mb-6 leading-relaxed text-lg">Showcase your property to travelers seeking accommodation</p>
                <ul className="space-y-2 mb-6">
                  {['Showcase amenities', 'Booking management', 'Performance insights'].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-blue-100 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 transition-all">
                  <span className="font-bold text-white text-lg">Register Now</span>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              <div className="absolute top-6 right-6 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
            {[
              { icon: <Users className="w-5 h-5" />, title: "10K+ Monthly Visitors", color: "from-indigo-500 to-purple-600" },
              { icon: <TrendingUp className="w-5 h-5" />, title: "Real-time Analytics", color: "from-purple-500 to-pink-600" },
              { icon: <Shield className="w-5 h-5" />, title: "Tourism Council Verified", color: "from-blue-500 to-indigo-600" },
              { icon: <BarChart3 className="w-5 h-5" />, title: "24hr Approval", color: "from-pink-500 to-red-600" },
            ].map((benefit, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${benefit.color} rounded-2xl p-6 text-center text-white shadow-lg hover:shadow-xl transition-shadow`}>
                <div className="inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-3">
                  {benefit.icon}
                </div>
                <h3 className="text-sm font-bold">{benefit.title}</h3>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700 mb-6 font-medium">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Verified Partners</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span>Quick Approval</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Easy Setup</span>
              </div>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg text-lg"
            >
              Already have an account? Sign In
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Stays;