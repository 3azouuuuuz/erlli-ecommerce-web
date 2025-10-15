import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <header>
        <h1>Erlli Web</h1>
        <nav>
          <Link to="/">Shop</Link>
          <Link to="/auth/login">Login</Link>
          <Link to="/customer">Customer</Link>
          <Link to="/vendor">Vendor</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;