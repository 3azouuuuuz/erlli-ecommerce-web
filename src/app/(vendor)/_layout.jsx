// VendorLayout.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import VendorIndex from './index.jsx';
import Inventory from './Inventory.jsx';
import AddProduct from './AddProduct.jsx';
import CreateStore from './CreateStore.jsx';
import PayoutSettings from './PayoutSettings.jsx';
import Orders from './Orders.jsx';
import Analytics from './Analytics.jsx';

// Styled Components
const LayoutContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

// Main Vendor Layout
function VendorLayout() {
  return (
    <LayoutContainer>
      <ContentWrapper>
        <Routes>
          <Route index element={<VendorIndex />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="AddProduct" element={<AddProduct />} />
          <Route path="CreateStore" element={<CreateStore />} />
          <Route path="payout-settings" element={<PayoutSettings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/vendor" replace />} />
        </Routes>
      </ContentWrapper>
    </LayoutContainer>
  );
}

export default VendorLayout;