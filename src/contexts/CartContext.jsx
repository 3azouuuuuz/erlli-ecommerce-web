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
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  // ✅ Get user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // ✅ LOAD WISHLIST FROM DATABASE when user logs in
  useEffect(() => {
    if (userId) {
      loadWishlistFromDatabase();
    } else {
      setWishlistItems([]); // Clear wishlist if logged out
    }
  }, [userId]);

  // ✅ NEW: Fetch wishlist from database
  const loadWishlistFromDatabase = async () => {
    if (!userId) return;
   
    setIsLoadingWishlist(true);
    try {
      // Get product IDs from product_likes
      const { data: likes, error: likesError } = await supabase
        .from('product_likes')
        .select('product_id')
        .eq('user_id', userId);
      if (likesError) throw likesError;
      if (likes && likes.length > 0) {
        const productIds = likes.map(like => like.product_id);
        
        // Fetch full product details
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);
        if (productsError) throw productsError;
        setWishlistItems(products || []);
        console.log('✅ LOADED WISHLIST:', products);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('❌ WISHLIST LOAD ERROR:', error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  // Storage functions
  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const loadFromStorage = (key, defaultValue = []) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // LOAD CART ON MOUNT
  useEffect(() => {
    console.log('🔄 LOADING CART...');
    setCartItems(loadFromStorage('cart', []));
    const storedShipping = loadFromStorage('selectedShippingOption', null);
    setSelectedShippingOption(storedShipping);
    console.log('🛒 LOADED CART:', loadFromStorage('cart', []));
  }, []);

  // SAVE CART ON EVERY UPDATE
  useEffect(() => {
    if (cartItems.length > 0) {
      saveToStorage('cart', cartItems);
      console.log('💾 SAVED CART:', cartItems);
    }
  }, [cartItems]);

  useEffect(() => {
    saveToStorage('selectedShippingOption', selectedShippingOption);
  }, [selectedShippingOption]);

  // CART FUNCTIONS
  const addToCart = (item) => {
    console.log('🛒 ADDING TO CART:', item);
    setCartItems(prev => {
      const existing = prev.find(i =>
        i.id === item.id &&
        i.variation_id === item.variation_id &&
        i.size === item.size
      );
      
      let newCart;
      if (existing) {
        newCart = prev.map(i =>
          i.id === item.id && i.variation_id === item.variation_id && i.size === item.size
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        const newItem = { ...item, addedAt: Date.now() };
        newCart = [...prev, newItem];
        
        if (timeouts[item.id]) {
          clearTimeout(timeouts[item.id]);
        }
        const timeoutId = setTimeout(() => removeFromCart(item.id), 24 * 60 * 60 * 1000);
        setTimeouts(prev => ({ ...prev, [item.id]: timeoutId }));
      }
      
      saveToStorage('cart', newCart);
      console.log('🛒 CART SAVED:', newCart);
      return newCart;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => {
      const newCart = prev.filter(item => item.id !== itemId);
      saveToStorage('cart', newCart);
      console.log('🗑️ CART SAVED AFTER REMOVE:', newCart);
      return newCart;
    });
   
    setTimeouts(prev => {
      clearTimeout(prev[itemId]);
      const { [itemId]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    saveToStorage('cart', []);
    Object.values(timeouts).forEach(clearTimeout);
    setTimeouts({});
  };

  // ✅ FIXED: WISHLIST FUNCTIONS with full product data
  const addToWishlist = async (product) => {
    if (!userId) {
      alert('Please log in to save to wishlist');
      return false;
    }
    try {
      // Insert into product_likes
      const { error } = await supabase
        .from('product_likes')
        .insert([{ product_id: product.id, user_id: userId }]);
      
      if (error) {
        if (error.code === '23505') { // Duplicate key error
          console.log('Product already in wishlist');
          return true;
        }
        throw error;
      }
      
      // Add full product to local state
      setWishlistItems(prev => {
        if (prev.find(i => i.id === product.id)) return prev;
        const newList = [...prev, product];
        console.log('💝 ADDED TO WISHLIST:', product);
        return newList;
      });
      
      return true;
    } catch (error) {
      console.error('❌ WISHLIST ADD ERROR:', error);
      alert('Failed to save to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!userId) return;
   
    try {
      const { error } = await supabase
        .from('product_likes')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setWishlistItems(prev => {
        const newList = prev.filter(item => item.id !== productId);
        console.log('💔 REMOVED FROM WISHLIST:', productId);
        return newList;
      });
    } catch (error) {
      console.error('❌ WISHLIST REMOVE ERROR:', error);
    }
  };

  const clearWishlist = async () => {
    if (!userId) return;
   
    try {
      await supabase
        .from('product_likes')
        .delete()
        .eq('user_id', userId);
      
      setWishlistItems([]);
    } catch (error) {
      console.error('❌ WISHLIST CLEAR ERROR:', error);
    }
  };

  const toggleCart = () => setIsCartOpen(prev => !prev);
  const setShippingOption = (option) => setSelectedShippingOption(option);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    itemCount: cartItems.length,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    wishlistCount: wishlistItems.length,
    selectedShippingOption,
    setShippingOption,
    isCartOpen,
    toggleCart,
    userId,
    isLoadingWishlist,
    refreshWishlist: loadWishlistFromDatabase // ✅ Expose refresh function
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}