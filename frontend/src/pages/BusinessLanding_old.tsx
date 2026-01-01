import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, TrendingUp, Shield, HelpCircle, Phone, Mail, Clock, Star, Award, ChevronDown, ChevronUp, Utensils, Building2, Home as HomeIcon } from 'lucide-react';
import { NavigationTabs } from '../components/NavigationTabs';

const Home: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I register my business?",
      answer: "Simply click on either 'Restaurant' or 'Hotel/Stay' card above, fill out the simple form with your business details, and submit. You'll receive an email confirmation within 24 hours!"
    },
    {
      question: "Is there any fee to register?",
      answer: "No! Registration is completely FREE. We want to help grow tourism in Kedah by connecting local businesses with visitors."
    },
    {
      question: "What if I'm not good with computers?",
      answer: "Don't worry! Our registration process is simple with clear instructions at every step. If you need help, our support team is ready to assist you via phone or email."
    },
    {
      question: "How long does approval take?",
      answer: "Most applications are reviewed and approved within 24 hours during business days. You'll receive an email once approved."
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f3ee' }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="business-cross-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 L20 40 M0 20 L40 20" stroke="#d4a574" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#business-cross-pattern)"/>
        </svg>
      </div>

      {/* Header */}
      <header className="relative sticky top-0 z-50 bg-white shadow-md border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                🏢
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Kedah Tourism Analytics</h1>
                <p className="text-sm text-orange-600 font-semibold">Business Partner Portal</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-6 py-2.5 bg-white border-2 border-gray-900 hover:bg-gray-100 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <HomeIcon className="w-5 h-5 text-gray-900" />
                <span className="text-gray-900 font-bold text-base">Dashboard</span>
              </Link>
              <NavigationTabs />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-full font-bold mb-6 shadow-lg">
              <Star className="w-5 h-5" />
              <span>Welcome to Kedah Tourism</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Grow Your Tourism Business<br />
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Simple. Fast. Free.</span>
            </h1>
            <p className="text-xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
              Join over 500 local business partners and connect with <span className="font-bold text-orange-600">10,000+ visitors</span> every month across Alor Setar, Langkawi, Kulim, Jitra, and Sungai Petani
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl border-3 border-orange-200 hover:border-orange-400 transition-all hover:shadow-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mb-4 shadow-md">
                <Users className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600 font-semibold text-lg">Monthly Visitors</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl border-3 border-blue-200 hover:border-blue-400 transition-all hover:shadow-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4 shadow-md">
                <Award className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600 font-semibold text-lg">Trusted Partners</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl border-3 border-purple-200 hover:border-purple-400 transition-all hover:shadow-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mb-4 shadow-md">
                <Clock className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">24hrs</h3>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">24hrs</h3>
              <p className="text-gray-600 font-semibold text-lg">Quick Approval</p>
            </div>
          </div>

          {/* Registration Options */}
          <div className="mb-16">
            <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-6">
              Choose Your Business Type
            </h2>
            <p className="text-center text-gray-800 text-2xl mb-8 max-w-3xl mx-auto font-bold">
              Click on any card below to start your <span className="text-orange-600 underline decoration-4 decoration-orange-400">FREE</span> registration - it only takes 5 minutes!
            </p>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 bg-black text-yellow-400 px-10 py-5 rounded-full font-black shadow-2xl animate-pulse text-2xl border-4 border-yellow-400">
                <ArrowRight className="w-8 h-8 rotate-90 animate-bounce" />
                <span>👇 CLICK A CARD BELOW TO REGISTER 👇</span>
                <ArrowRight className="w-8 h-8 rotate-90 animate-bounce" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Restaurant Card */}
              <Link
                to="/register?role=vendor"
                className="block bg-white rounded-3xl overflow-hidden shadow-2xl border-8 border-orange-400 hover:border-orange-600 transition-all duration-300 hover:shadow-orange-400/50 hover:shadow-2xl hover:scale-110 transform group cursor-pointer relative animate-pulse hover:animate-none"
              >
                {/* Pulse Ring Effect */}
                <div className="absolute inset-0 rounded-3xl border-8 border-orange-500 animate-ping opacity-20"></div>
                
                {/* Clickable Badge */}
                <div className="absolute -top-8 -right-8 z-20 bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-5 rounded-full font-black text-2xl shadow-2xl group-hover:animate-bounce border-8 border-yellow-300 transform rotate-12">
                  👆 CLICK HERE! 👆
                </div>
                
                <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 p-12 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-24 -mt-24 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full -ml-28 -mb-28 animate-pulse"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <div className="bg-white/30 backdrop-blur-sm p-6 rounded-3xl group-hover:scale-125 transition-transform shadow-2xl border-4 border-white/50">
                        <Utensils className="w-16 h-16 text-white" />
                      </div>
                      <div className="bg-yellow-400 text-orange-900 px-6 py-3 rounded-full font-black text-lg shadow-xl">
                        FOR RESTAURANTS
                      </div>
                    </div>
                    <h3 className="text-5xl font-black mb-4 drop-shadow-lg">Restaurant Owner</h3>
                    <p className="text-orange-100 text-2xl font-bold">Perfect for cafes, restaurants, and food businesses</p>
                  </div>
                </div>
                
                <div className="p-10 bg-gradient-to-b from-white to-orange-50">
                  <h4 className="font-black text-gray-900 mb-6 flex items-center gap-3 text-2xl">
                    <CheckCircle className="w-8 h-8 text-orange-600" />
                    What You Get:
                  </h4>
                  <ul className="space-y-5 mb-10">
                    {[
                      { icon: '📋', text: 'Create and manage your menu online' },
                      { icon: '⭐', text: 'Receive and respond to customer reviews' },
                      { icon: '📊', text: 'Track visitor engagement and popularity' },
                      { icon: '📸', text: 'Showcase your food with photos' },
                      { icon: '🏷️', text: 'Display pricing and special offers' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <span className="text-4xl flex-shrink-0">{item.icon}</span>
                        <span className="text-gray-800 pt-2 text-xl font-bold">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 text-white px-10 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-orange-400/50 transition-all flex items-center justify-center gap-4 border-4 border-orange-400 transform group-hover:scale-105 animate-pulse group-hover:animate-none">
                    <span>🚀 CLICK TO REGISTER NOW! 🚀</span>
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform animate-bounce" />
                  </div>
                </div>
              </Link>

              {/* Hotel Card */}
              <Link
                to="/register?role=stay_owner"
                className="block bg-white rounded-3xl overflow-hidden shadow-2xl border-8 border-blue-400 hover:border-blue-600 transition-all duration-300 hover:shadow-blue-400/50 hover:shadow-2xl hover:scale-110 transform group cursor-pointer relative animate-pulse hover:animate-none"
              >
                {/* Pulse Ring Effect */}
                <div className="absolute inset-0 rounded-3xl border-8 border-blue-500 animate-ping opacity-20"></div>
                
                {/* Clickable Badge */}
                <div className="absolute -top-8 -right-8 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-full font-black text-2xl shadow-2xl group-hover:animate-bounce border-8 border-cyan-300 transform rotate-12">
                  👆 CLICK HERE! 👆
                </div>
                
                <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-12 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-24 -mt-24 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full -ml-28 -mb-28 animate-pulse"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <div className="bg-white/30 backdrop-blur-sm p-6 rounded-3xl group-hover:scale-125 transition-transform shadow-2xl border-4 border-white/50">
                        <Building2 className="w-16 h-16 text-white" />
                      </div>
                      <div className="bg-cyan-400 text-blue-900 px-6 py-3 rounded-full font-black text-lg shadow-xl">
                        FOR HOTELS
                      </div>
                    </div>
                    <h3 className="text-5xl font-black mb-4 drop-shadow-lg">Hotel / Stay Owner</h3>
                    <p className="text-blue-100 text-2xl font-bold">Perfect for hotels, homestays, and resorts</p>
                  </div>
                </div>
                
                <div className="p-10 bg-gradient-to-b from-white to-blue-50">
                  <h4 className="font-black text-gray-900 mb-6 flex items-center gap-3 text-2xl">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                    What You Get:
                  </h4>
                  <ul className="space-y-5 mb-10">
                    {[
                      { icon: '🏡', text: 'List your rooms and amenities' },
                      { icon: '🔗', text: 'Connect to Booking.com & Agoda' },
                      { icon: '📈', text: 'Monitor booking trends and revenue' },
                      { icon: '📸', text: 'Upload beautiful property photos' },
                      { icon: '💰', text: 'Show pricing and availability' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <span className="text-4xl flex-shrink-0">{item.icon}</span>
                        <span className="text-gray-800 pt-2 text-xl font-bold">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-10 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-blue-400/50 transition-all flex items-center justify-center gap-4 border-4 border-blue-400 transform group-hover:scale-105 animate-pulse group-hover:animate-none">
                    <span>🚀 CLICK TO REGISTER NOW! 🚀</span>
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform animate-bounce" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-12 bg-white rounded-3xl p-10 md:p-14 shadow-2xl border-2 border-orange-200">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              How It Works - Simple 3 Steps
            </h2>
            <p className="text-center text-gray-700 mb-12 text-xl font-medium">
              Getting started is easy! No technical knowledge required.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {[
                {
                  step: '1',
                  title: 'Click & Fill',
                  description: 'Choose your business type above and fill out a simple form with your business information',
                  icon: '📝',
                  gradient: 'from-orange-500 to-orange-600',
                  bg: 'from-orange-50 to-orange-100',
                  border: 'border-orange-300'
                },
                {
                  step: '2',
                  title: 'We Review',
                  description: 'Our team will review your application within 24 hours and send you an email confirmation',
                  icon: '✅',
                  gradient: 'from-blue-500 to-blue-600',
                  bg: 'from-blue-50 to-blue-100',
                  border: 'border-blue-300'
                },
                {
                  step: '3',
                  title: 'Start Growing',
                  description: 'Once approved, log in to manage your profile and start reaching thousands of visitors',
                  icon: '🚀',
                  gradient: 'from-purple-500 to-purple-600',
                  bg: 'from-purple-50 to-purple-100',
                  border: 'border-purple-300'
                }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`bg-gradient-to-br ${step.bg} rounded-2xl p-8 text-center border-3 ${step.border} shadow-lg hover:shadow-xl transition-all`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${step.gradient} text-white rounded-full font-bold text-3xl mb-5 shadow-xl`}>
                      {step.step}
                    </div>
                    <div className="text-6xl mb-5">{step.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed text-lg font-medium">{step.description}</p>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-10 h-10 text-orange-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Common Questions
            </h2>
            <p className="text-center text-gray-700 mb-10 text-xl font-medium">
              Got questions? We've got answers!
            </p>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden hover:border-orange-400 transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-8 py-5 flex items-center justify-between text-left hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <HelpCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                      <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                    </div>
                    {openFaq === idx ? (
                      <ChevronUp className="w-6 h-6 text-orange-600" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-8 pb-6 pt-2 bg-orange-50 border-t-2 border-orange-200">
                      <p className="text-gray-700 leading-relaxed text-lg">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-12 bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-500 rounded-3xl p-10 md:p-14 text-white text-center shadow-2xl border-4 border-orange-300">
            <h2 className="text-4xl font-bold mb-4">Need Help Getting Started?</h2>
            <p className="text-orange-100 text-xl mb-10 max-w-2xl mx-auto font-medium">
              Our friendly support team is here to help you every step of the way. Don't hesitate to reach out!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/30 shadow-xl hover:bg-white/30 transition-all">
                <Phone className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-2xl mb-3">Call Us</h3>
                <p className="text-orange-100 mb-3 text-lg">Monday - Friday, 9AM - 5PM</p>
                <a href="tel:+604-1234567" className="text-white font-bold text-2xl hover:underline">
                  +604-123-4567
                </a>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/30 shadow-xl hover:bg-white/30 transition-all">
                <Mail className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-2xl mb-3">Email Us</h3>
                <p className="text-orange-100 mb-3 text-lg">We respond within 24 hours</p>
                <a href="mailto:support@kedahtourism.my" className="text-white font-bold text-xl hover:underline">
                  support@kedahtourism.my
                </a>
              </div>
            </div>
          </div>

          {/* Already Registered CTA */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-8 shadow-2xl border-3 border-orange-200">
              <span className="text-gray-700 text-xl font-semibold">Already have an account?</span>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-bold hover:shadow-xl transition-all shadow-lg text-lg transform hover:scale-105"
              >
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-12 border-t-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-lg">
            © 2025 Kedah Tourism Analytics. Powered by Kedah State Tourism Council.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
