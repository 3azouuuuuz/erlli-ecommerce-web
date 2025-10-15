 
// Erlli Web/src/app/(shop)/_layout.jsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import ShopIndex from './index.jsx';

const ShopContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

function ShopLayout() {
  return (
    <ShopContainer>
      <h2>Shop</h2>
      <Routes>
        <Route element={<Outlet />}>
          <Route index element={<ShopIndex />} /> {/* Default route for /shop */}
        </Route>
      </Routes>
    </ShopContainer>
  );
}

export default ShopLayout;

//this is shop layout