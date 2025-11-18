import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import CustomerLayout from './app/(customer)/_layout.jsx';
import ShopLayout from './app/(shop)/_layout.jsx';
import AuthLayout from './app/(auth)/_layout.jsx';
import VendorLayout from './app/(vendor)/_layout.jsx';
import Loading from './Loading.jsx';

// Protected Customer Route Component
function ProtectedCustomerRoute({ children }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  // If user is a vendor, redirect to vendor dashboard
  if (user && profile && profile.role === 'vendor') {
    return <Navigate to="/vendor" replace />;
  }
  
  // Allow access to customers and guests
  return children;
}

// Protected Vendor Route Component
function ProtectedVendorRoute({ children }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // If user is not a vendor, redirect to customer home
  if (profile && profile.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      {/* Auth Routes - Accessible to everyone */}
      <Route path="/auth/*" element={<AuthLayout />} />
      
      {/* Vendor Routes - Only for vendors */}
      <Route 
        path="/vendor/*" 
        element={
          <ProtectedVendorRoute>
            <VendorLayout />
          </ProtectedVendorRoute>
        } 
      />
      
      {/* Shop Routes - Accessible to everyone */}
      <Route path="/shop/*" element={<ShopLayout />} />
      
      {/* Customer Routes - Protected from vendors */}
      <Route 
        path="/*" 
        element={
          <ProtectedCustomerRoute>
            <CustomerLayout />
          </ProtectedCustomerRoute>
        } 
      />
    </Routes>
  );
}

export default App;