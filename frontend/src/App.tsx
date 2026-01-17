import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import TourismDashboard from './pages/TourismDashboard';
// SignInPage uses the original AuthModal (centered popup with username + password only)
import SignInPage from './pages/SignInPage';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import PlacesManagement from './pages/admin/PlacesManagement';
import EventRegistrations from './pages/EventRegistrations';
import VendorDashboard from './pages/vendor/VendorDashboard';
import StayOwnerDashboard from './pages/stays/StayOwnerDashboard';

// New Explore → Detail pages
import PlacesExplore from './pages/places/PlacesExplore';
import PlaceDetails from './pages/places/PlaceDetails';
import FoodExplore from './pages/food/FoodExplore';
import FoodDetails from './pages/food/FoodDetails';
import EventsExplore from './pages/events/EventsExplore';
import EventDetails from './pages/events/EventDetails';
import StaysExplore from './pages/stays/StaysExplore';
import StayDetails from './pages/stays/StayDetails';
import AnalyticsPage from './pages/analytics/AnalyticsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App min-h-screen bg-background text-foreground">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<TourismDashboard />} />
            
            {/* New Explore → Detail Pattern for Places */}
            <Route path="/places" element={<PlacesExplore />} />
            <Route path="/places/:id" element={<PlaceDetails />} />
            
            {/* Food Explore → Detail */}
            <Route path="/food" element={<FoodExplore />} />
            <Route path="/food/:id" element={<FoodDetails />} />
            
            {/* Events Explore → Detail */}
            <Route path="/events" element={<EventsExplore />} />
            <Route path="/events/:id" element={<EventDetails />} />
            
            {/* Stays Explore → Detail */}
            <Route path="/stays" element={<StaysExplore />} />
            <Route path="/stays/:id" element={<StayDetails />} />
            
            {/* Analytics Page */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            {/* /business redirects to /register */}
            <Route path="/business" element={<Navigate to="/register" replace />} />
            {/* /login redirects to /sign-in for unified auth flow */}
            <Route path="/login" element={<Navigate to="/sign-in" replace />} />
            {/* SignInPage shows the centered AuthModal (username + password only, no portal selector) */}
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/places"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PlacesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/:eventId/registrations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EventRegistrations />
                </ProtectedRoute>
              }
            />
            
            {/* Vendor Routes */}
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['vendor']} requireApproval={true}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/my-restaurants"
              element={
                <ProtectedRoute allowedRoles={['vendor']} requireApproval={true}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Stay Owner Routes */}
            <Route
              path="/stay-owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={['stay_owner']} requireApproval={true}>
                  <StayOwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stays/my-stays"
              element={
                <ProtectedRoute allowedRoles={['stay_owner']} requireApproval={true}>
                  <StayOwnerDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </Router>
  );
}
// Trigger redeploy Sun Dec 14 09:52:42 AM +08 2025
