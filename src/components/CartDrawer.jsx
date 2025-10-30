import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoClose, IoTrash, IoCartOutline, IoHeartOutline } from 'react-icons/io5';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: ${props => (props.isOpen ? 'block' : 'none')};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const CartDrawer = styled.div`
  position: fixed;
  top: 0;
  right: ${props => (props.isOpen ? '0' : '-400px')};
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100vw;
    right: ${props => (props.isOpen ? '0' : '-100vw')};
  }
`;

const CartHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CartTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s ease;

  &:hover {
    color: #1a1a2e;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 16px 0;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: ${props => (props.active ? '700' : '500')};
  color: ${props => (props.active ? '#00BC7D' : '#666')};
  border-bottom: 3px solid ${props => (props.active ? '#00BC7D' : 'transparent')};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    color: #00BC7D;
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const ContentSection = styled.div`
  display: ${props => (props.active ? 'block' : 'none')};
`;

const CartItemsList = styled.div`
  min-height: 200px;
`;

const WishlistItemsList = styled.div`
  min-height: 200px;
`;

const CartItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const WishlistItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  background: ${props => props.addedToCart ? '#f0f8f0' : 'white'};
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
`;

const ItemPrice = styled.div`
  color: #00BC7D;
  font-weight: 600;
`;

const WishlistPrice = styled.div`
  color: #666;
  font-size: 14px;
`;

const RemoveItemButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s ease;

  &:hover {
    color: #f5576c;
  }
`;

const AddToCartButton = styled.button`
  padding: 8px 12px;
  background: #00BC7D;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #00A66A;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const AddedToCartMessage = styled.div`
  color: #00BC7D;
  font-size: 12px;
  margin-top: 4px;
`;

const CartFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const Total = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  text-align: right;
  margin-bottom: 16px;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyWishlist = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const CartDrawerComponent = () => {
  const [activeTab, setActiveTab] = useState('cart');
  const [addedToCartItems, setAddedToCartItems] = useState(new Set());
  const { 
    cartItems, 
    removeFromCart, 
    itemCount, 
    isCartOpen, 
    toggleCart, 
    wishlistItems, 
    removeFromWishlist, 
    wishlistCount,
    addToCart 
  } = useCart();
  const navigate = useNavigate();

  // FORCE INSTANT REFRESH when drawer opens
  useEffect(() => {
    if (isCartOpen) {
      // Trigger immediate wishlist sync
      const refreshWishlist = () => {
        window.dispatchEvent(new Event('wishlistRefresh'));
      };
      refreshWishlist();
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    toggleCart();
    navigate('/Payment');
  };

  const handleAddWishlistToCart = async (wishlistItem) => {
    const cartItem = {
      ...wishlistItem,
      quantity: 1,
      variation_id: null,
      size: null,
      shipping_option: null
    };
    
    addToCart(cartItem);
    setAddedToCartItems(prev => new Set([...prev, wishlistItem.id]));
    
    // Auto-show success message for 3 seconds
    setTimeout(() => {
      setAddedToCartItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(wishlistItem.id);
        return newSet;
      });
    }, 3000);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2);

  return (
    <>
      <CartDrawerOverlay isOpen={isCartOpen} onClick={toggleCart} />
      <CartDrawer isOpen={isCartOpen}>
        <CartHeader>
          <CartTitle>My Bag ({itemCount + wishlistCount})</CartTitle>
          <CloseButton onClick={toggleCart}>
            <IoClose />
          </CloseButton>
        </CartHeader>

        <TabContainer>
          <TabButton active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>
            <IoCartOutline size={18} />
            Cart ({itemCount})
          </TabButton>
          <TabButton active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')}>
            <IoHeartOutline size={18} />
            Wishlist ({wishlistCount})
          </TabButton>
        </TabContainer>

        <TabContent>
          <ContentSection active={activeTab === 'cart'}>
            <CartItemsList>
              {cartItems.length === 0 ? (
                <EmptyCart>
                  <EmptyIcon>🛒</EmptyIcon>
                  <EmptyMessage>Your cart is empty</EmptyMessage>
                </EmptyCart>
              ) : (
                cartItems.map((item) => (
                  <CartItem key={`${item.id}-${item.variation_id}-${item.size}`}>
                    <ItemImage src={item.image_url} alt={item.description} />
                    <ItemDetails>
                      <ItemName>{item.description}</ItemName>
                      <ItemPrice>${item.price.toFixed(2)} x {item.quantity || 1}</ItemPrice>
                    </ItemDetails>
                    <RemoveItemButton onClick={() => removeFromCart(item.id)}>
                      <IoTrash size={20} />
                    </RemoveItemButton>
                  </CartItem>
                ))
              )}
            </CartItemsList>
          </ContentSection>

          <ContentSection active={activeTab === 'wishlist'}>
            <WishlistItemsList>
              {wishlistItems.length === 0 ? (
                <EmptyWishlist>
                  <EmptyIcon>❤️</EmptyIcon>
                  <EmptyMessage>Your wishlist is empty. Like some products! 😊</EmptyMessage>
                </EmptyWishlist>
              ) : (
                wishlistItems.map((item) => (
                  <WishlistItem key={item.id} addedToCart={addedToCartItems.has(item.id)}>
                    <ItemImage src={item.image_url} alt={item.description} />
                    <ItemDetails>
                      <ItemName>{item.description}</ItemName>
                      <WishlistPrice>${item.price.toFixed(2)}</WishlistPrice>
                      <AddToCartButton 
                        onClick={() => handleAddWishlistToCart(item)}
                        disabled={addedToCartItems.has(item.id)}
                      >
                        {addedToCartItems.has(item.id) ? 'Added!' : 'Add to Cart'}
                      </AddToCartButton>
                      {addedToCartItems.has(item.id) && (
                        <AddedToCartMessage>✓ Added to Cart!</AddedToCartMessage>
                      )}
                    </ItemDetails>
                    <RemoveItemButton onClick={() => removeFromWishlist(item.id)}>
                      <IoTrash size={20} />
                    </RemoveItemButton>
                  </WishlistItem>
                ))
              )}
            </WishlistItemsList>
          </ContentSection>
        </TabContent>

        <CartFooter>
          <Total>Total: ${cartTotal}</Total>
          <CheckoutButton onClick={handleCheckout} disabled={cartItems.length === 0}>
            Checkout
          </CheckoutButton>
        </CartFooter>
      </CartDrawer>
    </>
  );
};

export default CartDrawerComponent;