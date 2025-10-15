import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from './app/(customer)/_layout.jsx';
import ShopLayout from './app/(shop)/_layout.jsx';
import AuthLayout from './app/(auth)/_layout.jsx';
import Loading from './Loading.jsx';

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
      <Route path="/*" element={<CustomerLayout />} />
      <Route path="/shop/*" element={<ShopLayout />} />
      <Route path="/auth/*" element={<AuthLayout />} />
    </Routes>
  );
}

export default App;