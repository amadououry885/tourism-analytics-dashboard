import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, TrendingUp, Shield, HelpCircle, Phone, Mail, Clock, Star, Award, ChevronDown, ChevronUp, Utensils, Building2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    K
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Kedah Tourism Analytics</h1>
                  <p className="text-xs text-gray-500 font-medium">Business Partner Portal</p>
                </div>
              </Link>
            </div>
            <NavigationTabs />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold mb-4">
              <Star className="w-4 h-4" />
              <span>Welcome to Kedah Tourism</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
              Grow Your Tourism Business<br />
              <span className="text-emerald-600">Simple. Fast. Free.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Join over 500 local business partners and connect with 10,000+ visitors every month across Alor Setar, Langkawi, Kulim, Jitra, and Sungai Petani
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-emerald-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600 font-medium">Monthly Visitors</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600 font-medium">Trusted Partners</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-purple-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">24hrs</h3>
              <p className="text-gray-600 font-medium">Quick Approval</p>
            </div>
          </div>

          {/* Registration Options */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
              Choose Your Business Type
            </h2>
            <p className="text-center text-gray-600 text-lg mb-4 max-w-2xl mx-auto">
              Click on any card below to start your FREE registration - it only takes 5 minutes!
            </p>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-pulse">
                <ArrowRight className="w-5 h-5 rotate-90" />
                <span>Click a Card Below to Register</span>
                <ArrowRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Restaurant Card */}
              <Link
                to="/register?role=vendor"
                className="block bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-orange-200 hover:border-orange-500 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform group cursor-pointer relative"
              >
                {/* Clickable Badge */}
                <div className="absolute -top-4 -right-4 z-10 bg-black text-white px-6 py-3 rounded-full font-black text-base shadow-2xl group-hover:animate-bounce border-4 border-emerald-400">
                  👆 CLICK HERE TO REGISTER
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform">
                        <Utensils className="w-12 h-12 text-white" />
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-sm font-bold">For Restaurants</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Restaurant Owner</h3>
                    <p className="text-orange-100 text-lg">Perfect for cafes, restaurants, and food businesses</p>
                  </div>
                </div>
                
                <div className="p-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    What You Get:
                  </h4>
                  <ul className="space-y-3 mb-8">
                    {[
                      { icon: '📋', text: 'Create and manage your menu online' },
                      { icon: '⭐', text: 'Receive and respond to customer reviews' },
                      { icon: '📊', text: 'Track visitor engagement and popularity' },
                      { icon: '📸', text: 'Showcase your food with photos' },
                      { icon: '🏷️', text: 'Display pricing and special offers' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                        <span className="text-gray-700 pt-1">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-5 rounded-xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group-hover:from-orange-600 group-hover:to-red-600 border-2 border-orange-300">
                    <span>🚀 CLICK TO REGISTER NOW</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Hotel Card */}
              <Link
                to="/register?role=stay_owner"
                className="block bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-blue-200 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform group cursor-pointer relative"
              >
                {/* Clickable Badge */}
                <div className="absolute -top-4 -right-4 z-10 bg-black text-white px-6 py-3 rounded-full font-black text-base shadow-2xl group-hover:animate-bounce border-4 border-emerald-400">
                  👆 CLICK HERE TO REGISTER
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform">
                        <Building2 className="w-12 h-12 text-white" />
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-sm font-bold">For Accommodations</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Hotel / Stay Owner</h3>
                    <p className="text-blue-100 text-lg">Perfect for hotels, homestays, and resorts</p>
                  </div>
                </div>
                
                <div className="p-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    What You Get:
                  </h4>
                  <ul className="space-y-3 mb-8">
                    {[
                      { icon: '🏡', text: 'List your rooms and amenities' },
                      { icon: '🔗', text: 'Connect to Booking.com & Agoda' },
                      { icon: '📈', text: 'Monitor booking trends and revenue' },
                      { icon: '📸', text: 'Upload beautiful property photos' },
                      { icon: '💰', text: 'Show pricing and availability' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                        <span className="text-gray-700 pt-1">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-5 rounded-xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group-hover:from-blue-600 group-hover:to-indigo-700 border-2 border-blue-300">
                    <span>🚀 CLICK TO REGISTER NOW</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-12 bg-white rounded-3xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              How It Works - Simple 3 Steps
            </h2>
            <p className="text-center text-gray-600 mb-10 text-lg">
              Getting started is easy! No technical knowledge required.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: '1',
                  title: 'Click & Fill',
                  description: 'Choose your business type above and fill out a simple form with your business information',
                  icon: '📝',
                  color: 'emerald'
                },
                {
                  step: '2',
                  title: 'We Review',
                  description: 'Our team will review your application within 24 hours and send you an email confirmation',
                  icon: '✅',
                  color: 'blue'
                },
                {
                  step: '3',
                  title: 'Start Growing',
                  description: 'Once approved, log in to manage your profile and start reaching thousands of visitors',
                  icon: '🚀',
                  color: 'purple'
                }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`bg-gradient-to-br from-${step.color}-50 to-${step.color}-100 rounded-2xl p-6 text-center border-2 border-${step.color}-200`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-${step.color}-500 text-white rounded-full font-bold text-2xl mb-4 shadow-lg`}>
                      {step.step}
                    </div>
                    <div className="text-5xl mb-4">{step.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Common Questions
            </h2>
            <p className="text-center text-gray-600 mb-8 text-lg">
              Got questions? We've got answers!
            </p>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-gray-900">{faq.question}</span>
                    </div>
                    {openFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Need Help Getting Started?</h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
              Our friendly support team is here to help you every step of the way. Don't hesitate to reach out!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Phone className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold text-xl mb-2">Call Us</h3>
                <p className="text-emerald-100 mb-2">Monday - Friday, 9AM - 5PM</p>
                <a href="tel:+604-1234567" className="text-white font-bold text-lg hover:underline">
                  +604-123-4567
                </a>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Mail className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold text-xl mb-2">Email Us</h3>
                <p className="text-emerald-100 mb-2">We respond within 24 hours</p>
                <a href="mailto:support@kedahtourism.my" className="text-white font-bold text-lg hover:underline">
                  support@kedahtourism.my
                </a>
              </div>
            </div>
          </div>

          {/* Already Registered CTA */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <span className="text-gray-700 text-lg font-medium">Already have an account?</span>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 Kedah Tourism Analytics. Powered by Kedah State Tourism Council.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
