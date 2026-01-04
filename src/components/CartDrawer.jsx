import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoClose, IoTrash, IoCartOutline, IoHeartOutline } from 'react-icons/io5';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  font-family: 'Raleway', sans-serif;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s ease;
  &:hover { color: #1a1a2e; }
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
  font-family: 'Raleway', sans-serif;
  font-weight: ${props => (props.active ? '700' : '500')};
  color: ${props => (props.active ? '#00BC7D' : '#666')};
  border-bottom: 3px solid ${props => (props.active ? '#00BC7D' : 'transparent')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: color 0.3s ease;
  &:hover { color: #00BC7D; }
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
  transition: background 0.3s ease;
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
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
`;

const ItemPrice = styled.div`
  color: #00BC7D;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
`;

const RemoveItemButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
  &:hover { color: #f5576c; }
`;

const AddToCartButton = styled.button`
  padding: 8px 12px;
  background: #00BC7D;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s ease;
  &:hover:not(:disabled) { 
    background: #00A66A;
    transform: translateY(-2px);
  }
  &:disabled { 
    background: #ccc; 
    cursor: not-allowed; 
  }
`;

const AddedToCartMessage = styled.div`
  color: #00BC7D;
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  margin-top: 4px;
  font-weight: 500;
`;

const CartFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const Total = styled.div`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
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
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
  &:disabled { 
    background: #ccc; 
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  margin-bottom: 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
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

const LoadingPrices = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-family: 'Raleway', sans-serif;
`;

const CartDrawerComponent = () => {
  const [activeTab, setActiveTab] = useState('cart');
  const [addedToCartItems, setAddedToCartItems] = useState(new Set());
  const { t } = useTranslation();

  const { formatCurrency } = useCurrency();
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

  // States for converted prices
  const [displayCartItems, setDisplayCartItems] = useState([]);
  const [displayWishlistItems, setDisplayWishlistItems] = useState([]);
  const [displayTotal, setDisplayTotal] = useState('...');
  const [pricesReady, setPricesReady] = useState(false);

  // Convert prices safely without crashing React
  useEffect(() => {
    let canceled = false;

    const convertItems = async () => {
      if (cartItems.length === 0 && wishlistItems.length === 0) {
        if (!canceled) {
          setDisplayCartItems([]);
          setDisplayWishlistItems([]);
          setPricesReady(true);
        }
        return;
      }

      const processItem = async (item) => {
        const displayPrice = await formatCurrency(item.price);
        const lineTotal = item.price * (item.quantity || 1);
        const displayLineTotal = await formatCurrency(lineTotal);
        return { ...item, displayPrice, displayLineTotal };
      };

      const [cartConverted, wishlistConverted] = await Promise.all([
        Promise.all(cartItems.map(processItem)),
        Promise.all(wishlistItems.map(processItem))
      ]);

      if (!canceled) {
        setDisplayCartItems(cartConverted);
        setDisplayWishlistItems(wishlistConverted);
        setPricesReady(true);
      }
    };

    convertItems();

    return () => { canceled = true; };
  }, [cartItems, wishlistItems, formatCurrency]);

  // Convert total separately
  useEffect(() => {
    if (!pricesReady) return;

    const total = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    if (total === 0) {
      setDisplayTotal('0.00');
      return;
    }

    formatCurrency(total).then(setDisplayTotal);
  }, [pricesReady, cartItems, formatCurrency]);

  // Refresh wishlist on open
  useEffect(() => {
    if (isCartOpen) {
      window.dispatchEvent(new Event('wishlistRefresh'));
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    toggleCart();
    navigate('/Payment');
  };

  const handleAddWishlistToCart = (wishlistItem) => {
    const cartItem = {
      ...wishlistItem,
      quantity: 1,
      variation_id: null,
      size: null,
      shipping_option: null
    };
    addToCart(cartItem);
    setAddedToCartItems(prev => new Set([...prev, wishlistItem.id]));

    setTimeout(() => {
      setAddedToCartItems(prev => {
        const next = new Set(prev);
        next.delete(wishlistItem.id);
        return next;
      });
    }, 3000);
  };

  return (
    <>
      <CartDrawerOverlay isOpen={isCartOpen} onClick={toggleCart} />
      <CartDrawer isOpen={isCartOpen}>
        <CartHeader>
          <CartTitle>{t('MyBag') || 'My Bag'} ({itemCount + wishlistCount})</CartTitle>
          <CloseButton onClick={toggleCart}><IoClose /></CloseButton>
        </CartHeader>

        <TabContainer>
          <TabButton active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>
            <IoCartOutline size={18} /> {t('Cart') || 'Cart'} ({itemCount})
          </TabButton>
          <TabButton active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')}>
            <IoHeartOutline size={18} /> {t('Wishlist') || 'Wishlist'} ({wishlistCount})
          </TabButton>
        </TabContainer>

        <TabContent>
          <ContentSection active={activeTab === 'cart'}>
            <CartItemsList>
              {!pricesReady ? (
                <LoadingPrices>{t('LoadingPrices') || 'Loading prices'}...</LoadingPrices>
              ) : displayCartItems.length === 0 ? (
                <EmptyCart>
                  <EmptyIcon>🛒</EmptyIcon>
                  <EmptyMessage>{t('YourCartIsEmpty') || 'Your cart is empty'}</EmptyMessage>
                </EmptyCart>
              ) : (
                displayCartItems.map(item => (
                  <CartItem key={`${item.id}-${item.variation_id}-${item.size}`}>
                    <ItemImage src={item.image_url} alt={item.description} />
                    <ItemDetails>
                      <ItemName>{item.description}</ItemName>
                      <ItemPrice>
                        {item.displayPrice} × {item.quantity || 1} = {item.displayLineTotal}
                      </ItemPrice>
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
              {!pricesReady ? (
                <LoadingPrices>{t('LoadingPrices') || 'Loading prices'}...</LoadingPrices>
              ) : displayWishlistItems.length === 0 ? (
                <EmptyWishlist>
                  <EmptyIcon>💝</EmptyIcon>
                  <EmptyMessage>{t('YourWishlistIsEmpty') || 'Your wishlist is empty. Like some products!'}</EmptyMessage>
                </EmptyWishlist>
              ) : (
                displayWishlistItems.map(item => (
                  <WishlistItem key={item.id} addedToCart={addedToCartItems.has(item.id)}>
                    <ItemImage src={item.image_url} alt={item.description} />
                    <ItemDetails>
                      <ItemName>{item.description}</ItemName>
                      <ItemPrice>{item.displayPrice}</ItemPrice>
                      <AddToCartButton
                        onClick={() => handleAddWishlistToCart(item)}
                        disabled={addedToCartItems.has(item.id)}
                      >
                        {addedToCartItems.has(item.id) ? t('Added') || 'Added!' : t('AddToCart') || 'Add to Cart'}
                      </AddToCartButton>
                      {addedToCartItems.has(item.id) && (
                        <AddedToCartMessage>{t('AddedToCart') || 'Added to Cart'}!</AddedToCartMessage>
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
          <Total>{t('Total') || 'Total'}: {displayTotal}</Total>
          <CheckoutButton onClick={handleCheckout} disabled={cartItems.length === 0 || !pricesReady}>
            {t('Checkout') || 'Checkout'}
          </CheckoutButton>
        </CartFooter>
      </CartDrawer>
    </>
  );
};

export default CartDrawerComponent;