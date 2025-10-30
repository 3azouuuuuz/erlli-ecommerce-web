import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import ShopHeader from '../../components/ShopHeader';
import TitleWithAction from '../../components/TitleWithAction';
import ItemsList from '../../components/Items';
import { IoCaretDown } from 'react-icons/io5';
const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding-top: 80px;
  position: relative;
  overflow: hidden;
`;
const BubbleImage = styled.img`
  position: absolute;
  z-index: ${props => props.$zIndex || 1};
  right: ${props => props.$right || '-5px'};
  top: ${props => props.$top || 0};
  pointer-events: none;
  opacity: 0.9;  // ✅ INCREASED: 0.8 → 0.9 (MORE VISIBLE)
 
  // ✅ DESKTOP: SUPER BIG
  width: 350px;  
  height: auto;
 
  @media (max-width: 768px) {
    width: 350px;        // ✅ SUPER BIG: 150px → 350px (2.3x BIGGER!)
    height: auto;
  }
 
  @media (max-width: 480px) {
    width: 280px;        // ✅ SMALLER MOBILE BUT STILL HUGE
    height: auto;
  }
`;
const ContentWrapper = styled.div`
  flex: 1;
  z-index: 10;
  margin-top: 24px;
  position: relative;
`;
const ScrollContainer = styled.div`
  flex-grow: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;
const Label = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #202020;
  margin-top: -10px;
`;
const DiscountContainer = styled.div`
  width: 100%;
  max-width: 365px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-self: center;
  background-color: #F9F9F9;
  align-items: center;
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;
const DiscountButton = styled.button`
  padding: ${props => props.$selected ? '10px' : '8px 16px'};
  border-radius: 15px;
  background: ${props => props.$selected ? '#fff' : 'transparent'};
  border: ${props => props.$selected
    ? `3px solid ${props.$borderColor || '#00BC7D'}`
    : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: ${props => props.$selected
    ? '0 1px 2px rgba(0, 0, 0, 0.1)'
    : 'none'};
  &:hover {
    background: ${props => props.$selected
      ? '#fff'
      : 'rgba(0, 188, 125, 0.1)'};
  }
  @media (max-width: 768px) {
    padding: ${props => props.$selected ? '10px' : '6px 12px'};
  }
`;
const DiscountText = styled.span`
  height: 17px;
  font-size: 13px;
  font-weight: 500;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  line-height: 17px;
`;
const CheckIcon = styled(IoCaretDown)`
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  color: ${props => props.$color};
`;
const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;
const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #D0FAE5;
  border-top: 3px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
const NoItemsText = styled.div`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  margin-top: 20px;
`;
const ItemsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const FlashSaleContent = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const themeContext = useTheme();
  const theme = themeContext?.theme || {};
  const setTheme = themeContext?.setTheme || (() => {});
  const [selectedDiscount, setSelectedDiscount] = useState('20%');
  const [flashSaleItems, setFlashSaleItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);
  const [timerText, setTimerText] = useState('00:00:00:00');
  const timerRef = useRef(null);
  const discountOptions = ['All', '10%', '20%', '30%', '40%', '50%'];
  const fetchFlashSaleItems = useCallback(async (discount) => {
    setIsLoading(true);
    setError(null);
   
    try {
      const { data: flashSaleData, error: flashSaleError } = await supabase
        .from('flash_sales')
        .select('id, end_time, theme')
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
     
      if (flashSaleData.theme && setTheme) {
        setTheme(flashSaleData.theme);
      }
      const discountFilterValue = discount === 'All' ? null : parseInt(discount.replace('%', ''));
      let query = supabase
        .from('flash_sale_products')
        .select(`
          product_id,
          discount_percentage,
          products!inner (
            id,
            image_url,
            description,
            price
          )
        `)
        .eq('flash_sale_id', flashSaleData.id);
      if (discountFilterValue !== null) {
        query = query.eq('discount_percentage', discountFilterValue);
      }
      const { data, error: productsError } = await query;
      if (productsError) throw productsError;
      const formattedItems = data.map((item) => ({
        id: item.products.id,
        image_url: item.products.image_url,
        description: item.products.description,
        price: item.products.price,
        sale_percentage: item.discount_percentage,
      }));
      setFlashSaleItems(formattedItems);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching flash sale items:', err.message);
      setFlashSaleEndTime(null);
      setTimerText('00:00:00:00');
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);
  useEffect(() => {
    const timer = setTimeout(() => fetchFlashSaleItems(selectedDiscount), 300);
    return () => clearTimeout(timer);
  }, [selectedDiscount, fetchFlashSaleItems]);
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
        fetchFlashSaleItems(selectedDiscount);
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
  }, [flashSaleEndTime, selectedDiscount, fetchFlashSaleItems]);
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
  const handleSeeAllFlashSale = () => {
    navigate(`/ProductList?section=flash-sale&discount=${selectedDiscount}`);
  };
  const checkIconColor = theme?.checkIconColor || '#00BC7D';
  const borderColor = theme?.styles?.selectedDiscountCell?.borderColor || '#00BC7D';
  return (
    <PageContainer>
      {theme?.bubble4 && (
        <BubbleImage
          src={theme.bubble4}
          alt=""
          $zIndex={1}
          $right="-5px"
          $top="40px"
        />
      )}
      {theme?.bubble3 && (
        <BubbleImage
          src={theme.bubble3}
          alt=""
          $zIndex={2}
          $right="-5px"
          $top="30px"
        />
      )}
      <ShopHeader  // ✅ UPDATED: Pass isFlashSale={true} to enable header decorations
        isConnected={!!user}
        avatarUrl={profile?.avatar_url}
        userRole={profile?.role}
        userName={profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : profile?.first_name || profile?.email?.split('@')[0] || 'User'}
        userEmail={profile?.email || user?.email}
        onLogout={logout}
        isFlashSale={true}
      />
      <ContentWrapper>
        <ScrollContainer>
          <TitleWithAction
            title="Flash Sale"
            showClock={true}
            timer={timerText}
          />
         
          <Label>Choose Your Discount</Label>
          <DiscountContainer>
            {discountOptions.map((discount) => (
              <DiscountButton
                key={discount}
                $selected={selectedDiscount === discount}
                onClick={() => setSelectedDiscount(discount)}
                $borderColor={borderColor}
              >
                <DiscountText>
                  {discount}
                </DiscountText>
                {selectedDiscount === discount && (
                  <CheckIcon $color={checkIconColor} />
                )}
              </DiscountButton>
            ))}
          </DiscountContainer>
          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          ) : error ? (
            <NoItemsText>{error}</NoItemsText>
          ) : flashSaleItems.length > 0 ? (
            <ItemsSection>
              <TitleWithAction
                title={`${selectedDiscount} Discount`}
                onPress={handleSeeAllFlashSale}
              />
              <ItemsList
                grid={true}
                badge={true}
                items={flashSaleItems}
                onPress={handleProductPress}
              />
            </ItemsSection>
          ) : (
            <NoItemsText>No flash sale items available for this discount</NoItemsText>
          )}
        </ScrollContainer>
      </ContentWrapper>
    </PageContainer>
  );
};
const FlashSale = () => {
  const [initialTheme, setInitialTheme] = useState('green');
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const fetchInitialTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('flash_sales')
          .select('theme')
          .lte('start_time', 'now()')
          .gte('end_time', 'now()')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (!error && data?.theme) {
          setInitialTheme(data.theme);
        }
      } catch (err) {
        console.error('Error fetching theme:', err);
      } finally {
        setIsReady(true);
      }
    };
    fetchInitialTheme();
  }, []);
  if (!isReady) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </PageContainer>
    );
  }
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <FlashSaleContent />
    </ThemeProvider>
  );
};
export default FlashSale;