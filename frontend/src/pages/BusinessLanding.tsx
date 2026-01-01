import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, Clock, Utensils, Building2, Home as HomeIcon, ChevronRight } from 'lucide-react';
import { NavigationTabs } from '../components/NavigationTabs';

const BusinessLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                KT
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kedah Tourism</h1>
                <p className="text-xs text-blue-600 font-medium">Business Portal</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 text-gray-700"
              >
                <HomeIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <NavigationTabs />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Grow Your Business
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with <strong>10,000+ monthly visitors</strong> across Kedah
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Visitors</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-3">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Partners</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-3">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">24h</div>
              <div className="text-sm text-gray-600">Approval</div>
            </div>
          </div>

          {/* Registration Cards */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
              Choose Your Business Type
            </h2>
            <p className="text-center text-gray-600 mb-8 text-lg">
              Free registration • 5 minutes setup
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              
              {/* Restaurant Card */}
              <Link
                to="/register?role=vendor"
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-500"
              >
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Click to Register
                </div>
                
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Utensils className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Restaurant</h3>
                      <p className="text-sm text-gray-600">Cafes & Food Businesses</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                      <span>Manage menu online</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                      <span>Track customer reviews</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                      <span>View analytics</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                      <span>Showcase photos</span>
                    </li>
                  </ul>

                  <div className="flex items-center justify-between text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>

              {/* Hotel Card */}
              <Link
                to="/register?role=stay_owner"
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-500"
              >
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Click to Register
                </div>
                
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Hotel / Stay</h3>
                      <p className="text-sm text-gray-600">Hotels & Accommodations</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                      <span>List rooms & amenities</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                      <span>Connect to booking sites</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                      <span>Monitor bookings</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                      <span>Upload property photos</span>
                    </li>
                  </ul>

                  <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Simple 3 Steps */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-3">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">Register</h3>
                <p className="text-gray-600 text-sm">Fill simple form with your business info</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-3">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">Get Approved</h3>
                <p className="text-gray-600 text-sm">We review within 24 hours</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-3">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">Start Growing</h3>
                <p className="text-gray-600 text-sm">Manage profile and reach visitors</p>
              </div>
            </div>
          </div>

          {/* Already Registered */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p className="text-sm">© 2025 Kedah Tourism Analytics. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BusinessLanding;
