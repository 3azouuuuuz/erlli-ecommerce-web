import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import ShopHeader from '../../components/ShopHeader';
import BannerView from '../../components/BannerView';
import TitleWithAction from '../../components/TitleWithAction';
import GridItems from '../../components/GridItems';
import ItemsList from '../../components/Items';
import ItemWithBadge from '../../components/ItemWithBadge';
import MostPopular from '../../components/MostPopular';
import { supabase } from '../../lib/supabase';

const CustomerContainer = styled.div`
  padding: 80px 4px 20px 4px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const Greeting = styled.div`
  margin-top: 10px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 30px;
  letter-spacing: -0.21px;
`;

const IconTextContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StarIcon = styled.span`
  margin-left: 2px;
  font-size: 15px;
  color: #00BC7D;
`;

const Loader = styled.div`
  margin: 2% 0;
  text-align: center;
  color: #00BC7D;
  font-family: 'Raleway', sans-serif;
  font-size: 16px;
`;

const Placeholder = styled.div`
  padding: 40px 10px;
  background: linear-gradient(135deg, #f0f0f0 0%, #fafafa 100%);
  text-align: center;
  border-radius: 12px;
  border: 2px dashed #ddd;
  color: #666;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
`;

const TopProductsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding: 10px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TopProductCard = styled.div`
  min-width: 120px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  }
  &:active {
    transform: scale(0.98);
  }
`;

const TopProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);
  const [flashSaleId, setFlashSaleId] = useState(null);
  const [timerText, setTimerText] = useState('00:00:00:00');
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const timerRef = useRef(null);

  const fetchTopProducts = useCallback(async () => {
    try {
      setLoadingTopProducts(true);
      const { data: orders, error } = await supabase.from('orders').select('items').eq('status', 'succeeded');
      if (error) throw error;
      const productCounts = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          const mainProductId = item.parent_product_id || item.id;
          if (!productCounts[mainProductId]) {
            productCounts[mainProductId] = { count: 0, product: { ...item, id: mainProductId } };
          }
          productCounts[mainProductId].count += item.quantity;
        });
      });
      const sortedProducts = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
        .map(item => ({ ...item.product, orderCount: item.count }));
      const topProductIds = sortedProducts.map(p => p.id);
      if (topProductIds.length > 0) {
        const { data: mainProducts, error: productError } = await supabase
          .from('products')
          .select('*')
          .in('id', topProductIds);
        if (productError) throw productError;
        const enrichedProducts = sortedProducts.map(sp => {
          const mainProduct = mainProducts.find(mp => mp.id === sp.id) || sp;
          return { ...mainProduct, orderCount: sp.orderCount };
        });
        setTopProducts(enrichedProducts);
      } else {
        setTopProducts(sortedProducts);
      }
    } catch (err) {
      console.error('Error fetching top products:', err);
      setTopProducts([]);
    } finally {
      setLoadingTopProducts(false);
    }
  }, []);

  const fetchFlashSaleEndTime = useCallback(async () => {
    try {
      const { data: flashSaleData, error: flashSaleError } = await supabase
        .from('flash_sales')
        .select('id, end_time')
        .lte('start_time', 'now()')
        .gte('end_time', 'now()')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (flashSaleError || !flashSaleData) {
        throw new Error('No active flash sale event found');
      }
      const endTime = flashSaleData.end_time;
      const now = new Date();
      const end = new Date(endTime);
      if (end <= now) {
        throw new Error('Flash sale has ended');
      }
      setFlashSaleEndTime(endTime);
      setFlashSaleId(flashSaleData.id);
    } catch (err) {
      setFlashSaleEndTime(null);
      setFlashSaleId(null);
      setTimerText('00:00:00:00');
    }
  }, []);

  useEffect(() => {
    fetchFlashSaleEndTime();
    fetchTopProducts();
  }, [fetchFlashSaleEndTime, fetchTopProducts]);

  useEffect(() => {
    if (!flashSaleEndTime) {
      setTimerText('00:00:00:00');
      return;
    }
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(flashSaleEndTime);
      const difference = end - now;
      if (difference <= 0) {
        setTimerText('00:00:00:00');
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        fetchFlashSaleEndTime();
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const newTimerText = `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimerText(newTimerText);
    };
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [flashSaleEndTime, fetchFlashSaleEndTime]);

  const handleItemPress = () => {
    navigate('/FlashSale');
  };

  const handleSeeAllCategories = () => {
    navigate('/CategoriesList');
  };

  const handleSeeAllMostPopular = () => {
    navigate('/ProductList?section=most-popular');
  };

  const handleSeeAllNewItems = () => {
    navigate('/ProductList?section=new-items');
  };

  const handleProductPress = (product) => {
    const standardizedProduct = {
      id: product.id,
      image_url: product.image_url,
      description: product.description || 'No description available',
      price: product.price,
      sale_percentage: product.sale_percentage || null,
    };
    navigate(`/ProductsView?product=${encodeURIComponent(JSON.stringify(standardizedProduct))}`);
  };

  return (
    <>
      <ShopHeader
        isConnected={!!user}
        avatarUrl={profile?.avatar_url}
        userRole={profile?.role}
        userName={profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : profile?.first_name || profile?.email?.split('@')[0] || 'User'}
        userEmail={profile?.email || user?.email}
        onLogout={logout}
      />
      <CustomerContainer>
        <BannerView flashSaleId={flashSaleId} />
        
        <TitleWithAction
          title="Categories"
          showClock={false}
          onPress={handleSeeAllCategories}
        />
        <GridItems limit={4} />
        
        <Greeting>
          <Title>Top Products</Title>
        </Greeting>
        {loadingTopProducts ? (
          <Loader>Loading...</Loader>
        ) : topProducts.length > 0 ? (
          <TopProductsContainer>
            {topProducts.map((product) => (
              <TopProductCard key={product.id} onClick={() => handleProductPress(product)}>
                <TopProductImage src={product.image_url} alt={product.description} />
              </TopProductCard>
            ))}
          </TopProductsContainer>
        ) : (
          <Loader>No Top Products Available</Loader>
        )}
        
        <TitleWithAction
          title="New Items"
          showClock={false}
          onPress={handleSeeAllNewItems}
        />
        <ItemsList grid={false} onPress={handleProductPress} />
        
        {flashSaleEndTime && (
          <>
            <TitleWithAction
              title="Flash Sale"
              showClock={true}
              onPress={handleItemPress}
              timer={timerText}
            />
            <ItemWithBadge onPress={() => navigate('/FlashSale')} />
          </>
        )}
        
        <TitleWithAction
          title="Most Popular"
          showClock={false}
          onPress={handleSeeAllMostPopular}
        />
        <MostPopular />
        
        <Greeting>
          <IconTextContainer>
            <Title>Just For You</Title>
            <StarIcon>★</StarIcon>
          </IconTextContainer>
        </Greeting>
        <ItemsList grid={true} limit={6} onPress={handleProductPress} />
      </CustomerContainer>
    </>
  );
};

export default Index;