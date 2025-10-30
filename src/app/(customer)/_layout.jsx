// CustomerLayout.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { IoCartOutline } from 'react-icons/io5';
import { useCart } from '../../contexts/CartContext';
import CustomerIndex from './index.jsx';
import ItemsCategory from './ItemsCategory.jsx';
import CategoriesList from './CategoriesList.jsx';
import SearchResults from './SearchResults.jsx';
import ProductList from './ProductList.jsx';
import Profile from './Profile.jsx';
import Settings from './Settings.jsx';
import ProductsView from './ProductsView.jsx';
import FlashSale from './FlashSale.jsx';
import ProfileSettings from './ProfileSettings.jsx';
import SecuritySettings from './SecuritySettings.jsx';
import AdressSettings from './AdressSettings.jsx';
import PaymentMethods from './PaymentMethods.jsx';
import Country from './Country.jsx';
import Currency from './Currency.jsx';
import Lang from './Lang.jsx';
import About from './About.jsx';
import { CartProvider } from '../../contexts/CartContext';
import CartDrawerComponent from '../../components/CartDrawer';
import Vouchers from './Vouchers.jsx';
import Payment from './Payment.jsx';
import Orders from './Orders.jsx';
import CustomerOrderDetails from './CustomerOrderDetails.jsx';
import SupportChat from './SupportChat.jsx';
import StoreDetail from './StoreDetails.jsx'
// Styled Components (unchanged)
const FloatingCartButton = styled.button`
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
  }
  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 50px;
    height: 50px;
  }
`;

const CartIcon = styled(IoCartOutline)`
  color: white;
  font-size: 28px;
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f5576c;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 10px;
    top: -6px;
    right: -6px;
  }
`;

// Cart Button Component
const CartButtonWrapper = () => {
  const { toggleCart, itemCount } = useCart();
  return (
    <FloatingCartButton onClick={toggleCart}>
      <CartIcon />
      {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
    </FloatingCartButton>
  );
};

// Main Layout
function CustomerLayout() {
  const location = useLocation();
  const isSupportChat = location.pathname.includes('SupportChat');

  return (
    <CartProvider>
      <Routes>
        <Route index element={<CustomerIndex />} />
        <Route path="ItemsCategory" element={<ItemsCategory />} />
        <Route path="CategoriesList" element={<CategoriesList />} />
        <Route path="FlashSale" element={<FlashSale />} />
        <Route path="SearchResults" element={<SearchResults />} />
        <Route path="ProductList" element={<ProductList />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="Settings" element={<Settings />} />
        <Route path="ProfileSettings" element={<ProfileSettings />} />
        <Route path="SecuritySettings" element={<SecuritySettings />} />
        <Route path="AdressSettings" element={<AdressSettings />} />
        <Route path="PaymentMethods" element={<PaymentMethods />} />
        <Route path="Country" element={<Country />} />
        <Route path="Currency" element={<Currency />} />
        <Route path="Lang" element={<Lang />} />
        <Route path="About" element={<About />} />
        <Route path="ProductsView" element={<ProductsView />} />
        <Route path="Vouchers" element={<Vouchers />} />
        <Route path="Payment" element={<Payment />} />
        <Route path="Orders" element={<Orders />} />
        <Route path="CustomerOrderDetails" element={<CustomerOrderDetails />} />
        <Route path="SupportChat" element={<SupportChat />} />
        <Route path='StoreDetail' element={<StoreDetail/>} />
      </Routes>

      
      {!isSupportChat && (
        <>
          <CartDrawerComponent />
          <CartButtonWrapper />
        </>
      )}
    </CartProvider>
  );
}

export default CustomerLayout;