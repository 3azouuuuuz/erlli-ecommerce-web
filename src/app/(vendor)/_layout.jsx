// VendorLayout.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import VendorHeader from '../../components/VendorHeader';
import OrderDetails from './OrderDetails.jsx';
// Existing pages
import Currency from './Currency.jsx';
import VendorIndex from './index.jsx';
import Inventory from './Inventory.jsx';
import AddProduct from './AddProduct.jsx';
import EditProduct from './EditProduct.jsx';
import CreateStore from './CreateStore.jsx';
import PayoutSettings from './PayoutSettings.jsx';
import Orders from './Orders.jsx';
import Analytics from './Analytics.jsx';
import VendorProductView from './VendorProductView.jsx';
import Lang from './Lang.jsx';
// Settings pages
import VendorSettings from './VendorSettings.jsx';
import VendorProfileSettings from './VendorProfileSettings.jsx';
import VendorSecuritySettings from './VendorSecuritySettings.jsx';
import VendorCountry from './VendorCountry.jsx';
import StoreSettings from './StoreSettings.jsx';
import SubscriptionSettings from './SubscriptionSettings.jsx';
import AvailablePlans from './AvailablePlans.jsx';
import BulkAdd from './BulkAdd.jsx';
// Additional pages
import About from './About.jsx';
import VendorMessages from './VendorMessages.jsx';

// Styled Components
const LayoutContainer = styled.div`
  min-height: 100vh;
  background: #fafbfc;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 20px 20px;
  
  @media (max-width: 768px) {
    padding: 80px 10px 10px;
  }
`;

// No padding wrapper for full-width pages like Messages
const NoPaddingWrapper = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
`;

function VendorLayout() {
  const { profile } = useAuth();

  return (
    <LayoutContainer>
      <VendorHeader profile={profile} />
      
      <Routes>
        {/* Messages Route - Full width, no ContentWrapper padding */}
        <Route 
          path="messages" 
          element={
            <NoPaddingWrapper>
              <VendorMessages />
            </NoPaddingWrapper>
          } 
        />

        {/* All other routes - With ContentWrapper padding */}
        <Route path="/*" element={
          <ContentWrapper>
            <Routes>
              {/* Main Routes */}
              <Route index element={<VendorIndex />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="products/edit/:productId" element={<EditProduct />} />
              <Route path="products/:productId" element={<VendorProductView />} />
              <Route path="AddProduct" element={<AddProduct />} />
              <Route path="CreateStore" element={<CreateStore />} />
              <Route path="orders" element={<Orders />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="about" element={<About />} />
              <Route path="bulk-add" element={<BulkAdd />} />
<Route path="lang" element={<Lang />} />
              {/* Settings Routes */}
              <Route path="settings" element={<VendorSettings />} />
              <Route path="profile-settings" element={<VendorProfileSettings />} />
              <Route path="security-settings" element={<VendorSecuritySettings />} />
              <Route path="country" element={<VendorCountry />} />
              <Route path="payout-settings" element={<PayoutSettings />} />
              <Route path="store-settings" element={<StoreSettings />} />
              <Route path="subscription-settings" element={<SubscriptionSettings />} />
              <Route path="available-plans" element={<AvailablePlans />} />
              <Route path="orders/:orderId" element={<OrderDetails />} />
              <Route path="currency" element={<Currency />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/vendor" replace />} />
            </Routes>
          </ContentWrapper>
        } />
      </Routes>
    </LayoutContainer>
  );
}

export default VendorLayout;