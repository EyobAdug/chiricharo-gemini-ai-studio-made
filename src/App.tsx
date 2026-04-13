/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerVerification from './pages/SellerVerification';
import SellerWelcome from './pages/SellerWelcome';
import SellerGuide from './pages/SellerGuide';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Legal from './pages/Legal';
import Profile from './pages/Profile';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading, isAuthReady } = useAuth();

  if (!isAuthReady || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/legal" element={<Legal />} />
                  
                  {/* Protected Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/seller-verification" element={
                    <ProtectedRoute allowedRoles={['seller']}>
                      <SellerVerification />
                    </ProtectedRoute>
                  } />
                  <Route path="/seller-welcome" element={
                    <ProtectedRoute allowedRoles={['seller']}>
                      <SellerWelcome />
                    </ProtectedRoute>
                  } />
                  <Route path="/seller-guide" element={
                    <ProtectedRoute allowedRoles={['seller']}>
                      <SellerGuide />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/*" element={
                    <ProtectedRoute allowedRoles={['admin', 'seller']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                      <p className="text-gray-600 mb-8 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
                      <a href="/" className="rounded-full bg-emerald-700 px-8 py-3 text-white font-bold hover:bg-emerald-800 transition-all">
                        Back to Home
                      </a>
                    </div>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

