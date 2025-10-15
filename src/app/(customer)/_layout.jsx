import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { CartProvider } from '../../contexts/CartContext';
import CartDrawerComponent from '../../components/CartDrawer';

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

const CartButtonWrapper = () => {
  const { toggleCart, itemCount } = useCart();
  return (
    <FloatingCartButton onClick={toggleCart}>
      <CartIcon />
      {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
    </FloatingCartButton>
  );
};

function CustomerLayout() {
  return (
    <CartProvider>
      <Routes>
        <Route index element={<CustomerIndex />} />
        <Route path="ItemsCategory" element={<ItemsCategory />} />
        <Route path="SearchResults" element={<SearchResults />} />
        <Route path="ProductList" element={<ProductList />} />
        <Route path="CategoriesList" element={<CategoriesList />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="ProductsView" element={<ProductsView />} />
      </Routes>
      <CartDrawerComponent />
      <CartButtonWrapper />
    </CartProvider>
  );
}

export default CustomerLayout;