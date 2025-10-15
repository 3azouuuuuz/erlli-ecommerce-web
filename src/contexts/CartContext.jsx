import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [timeouts, setTimeouts] = useState({});
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get user ID from supabase auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // LOAD DATA ON MOUNT - FIXED!
  useEffect(() => {
    const loadData = () => {
      console.log('🔄 LOADING DATA...');
      
      // Load cart
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        console.log('🛒 LOADED CART:', parsedCart);
        setCartItems(parsedCart);
      }

      // Load wishlist
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        const parsedWishlist = JSON.parse(storedWishlist);
        console.log('❤️ LOADED WISHLIST:', parsedWishlist);
        setWishlistItems(parsedWishlist);
      }

      // Load shipping
      const storedShipping = localStorage.getItem('selectedShippingOption');
      if (storedShipping) {
        setSelectedShippingOption(JSON.parse(storedShipping));
      }
    };
    loadData();
  }, []);

  // INSTANT WISHLIST SYNC WHEN USER LOGGED IN
  useEffect(() => {
    const syncWishlist = async () => {
      if (!userId) return;
      
      console.log('🔄 SYNCING WISHLIST FOR USER:', userId);
      try {
        // Get liked product IDs
        const { data: likes } = await supabase
          .from('product_likes')
          .select('product_id')
          .eq('user_id', userId);

        if (!likes || likes.length === 0) {
          console.log('❤️ NO LIKES FOUND');
          setWishlistItems([]);
          localStorage.setItem('wishlist', '[]');
          return;
        }

        const productIds = likes.map(like => like.product_id);
        console.log('📦 FETCHING PRODUCTS:', productIds);

        // Get product details
        const { data: products } = await supabase
          .from('products')
          .select('id, image_url, description, price, sale_percentage')
          .in('id', productIds);

        const wishlistData = products.map(product => ({
          id: product.id,
          image_url: product.image_url,
          description: product.description || 'No description',
          price: product.price,
          sale_percentage: product.sale_percentage || null,
        }));

        console.log('❤️ SYNCED WISHLIST:', wishlistData);
        setWishlistItems(wishlistData);
        localStorage.setItem('wishlist', JSON.stringify(wishlistData));
      } catch (error) {
        console.error('❌ WISHLIST SYNC ERROR:', error);
      }
    };

    syncWishlist();
  }, [userId]);

  // SAVE EVERYTHING
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    localStorage.setItem('selectedShippingOption', JSON.stringify(selectedShippingOption));
  }, [cartItems, wishlistItems, selectedShippingOption]);

  // CART FUNCTIONS
  const addToCart = (item) => {
    console.log('🛒 ADDING TO CART:', item);
    setCartItems(prev => {
      const existing = prev.find(i => 
        i.id === item.id && i.variation_id === item.variation_id && i.size === item.size
      );
      if (existing) {
        return prev.map(i => 
          i.id === item.id && i.variation_id === item.variation_id && i.size === item.size
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      const newItem = { ...item, addedAt: Date.now() };
      const timeoutId = setTimeout(() => removeFromCart(item.id), 24 * 60 * 60 * 1000);
      setTimeouts(prev => ({ ...prev, [item.id]: timeoutId }));
      console.log('🛒 CART UPDATED:', [...prev, newItem]);
      return [...prev, newItem];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setTimeouts(prev => {
      clearTimeout(prev[itemId]);
      const { [itemId]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    Object.values(timeouts).forEach(clearTimeout);
    setTimeouts({});
  };

  // WISHLIST FUNCTIONS - FIXED!
  const addToWishlist = async (product) => {
    if (!userId) {
      alert('Please log in to save to wishlist');
      return false;
    }

    try {
      console.log('❤️ ADDING TO WISHLIST:', product);
      
      // Save to Supabase
      const { error } = await supabase
        .from('product_likes')
        .insert([{ product_id: product.id, user_id: userId }]);

      if (error) throw error;

      // Add to local state INSTANTLY
      setWishlistItems(prev => {
        if (prev.find(i => i.id === product.id)) return prev;
        const newList = [...prev, product];
        localStorage.setItem('wishlist', JSON.stringify(newList));
        console.log('❤️ WISHLIST UPDATED:', newList);
        return newList;
      });
      return true;
    } catch (error) {
      console.error('❌ WISHLIST ERROR:', error);
      alert('Failed to save to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!userId) return;

    try {
      console.log('❤️ REMOVING FROM WISHLIST:', productId);
      
      // Remove from Supabase
      await supabase
        .from('product_likes')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId);

      // Remove from local state INSTANTLY
      setWishlistItems(prev => {
        const newList = prev.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(newList));
        console.log('❤️ WISHLIST UPDATED:', newList);
        return newList;
      });
    } catch (error) {
      console.error('❌ WISHLIST ERROR:', error);
    }
  };

  const clearWishlist = () => setWishlistItems([]);

  const toggleCart = () => setIsCartOpen(prev => !prev);
  const setShippingOption = (option) => setSelectedShippingOption(option);

  const value = {
    cartItems, addToCart, removeFromCart, clearCart, itemCount: cartItems.length,
    wishlistItems, addToWishlist, removeFromWishlist, clearWishlist, wishlistCount: wishlistItems.length,
    selectedShippingOption, setShippingOption, isCartOpen, toggleCart, userId
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}