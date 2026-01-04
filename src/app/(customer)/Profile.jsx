import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/ShopHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoStar, IoArrowForward, IoTicket, IoTime, IoGift } from 'react-icons/io5';
import { MdLocalShipping, MdRateReview, MdError } from 'react-icons/md';
import ProfileHeader from '../../components/ProfileHeader';
import TitleWithAction from '../../components/TitleWithAction';
import GridItems from '../../components/GridItems';
import ItemsList from '../../components/Items';
import MostPopular from '../../components/MostPopular';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;
const Container = styled.div`
  padding: 80px 16px 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;
const Greeting = styled.div`
  margin-top: 10px;
`;
const GreetingText = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  margin: 0;
  color: #202020;
`;
const SectionTitle = styled.h2`
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 30px;
  letter-spacing: -0.21px;
  margin: 0;
  color: #202020;
`;
const IconTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
const StarIcon = styled(IoStar)`
  font-size: 15px;
  color: #00BC7D;
  margin-top: -2px;
`;
const AnnouncementContainer = styled.div`
  background: ${props => props.$isExpiring
    ? 'linear-gradient(135deg, #FFF5F5 0%, #FFE8E8 100%)'
    : 'linear-gradient(135deg, #F0FDF9 0%, #E6FCF5 100%)'};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 2px solid ${props => props.$isExpiring ? '#FFD4D4' : '#D0FAE5'};
  box-shadow: 0 4px 16px ${props => props.$isExpiring
    ? 'rgba(255, 77, 79, 0.1)'
    : 'rgba(0, 188, 125, 0.1)'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$isExpiring
      ? 'linear-gradient(90deg, #FF4D4F 0%, #FF7875 100%)'
      : 'linear-gradient(90deg, #00BC7D 0%, #00E89D 100%)'};
  }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => props.$isExpiring
      ? 'rgba(255, 77, 79, 0.15)'
      : 'rgba(0, 188, 125, 0.15)'};
  }
`;
const AnnouncementHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
`;
const AnnouncementIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$isExpiring ? '#FFF' : '#FFF'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px ${props => props.$isExpiring
    ? 'rgba(255, 77, 79, 0.2)'
    : 'rgba(0, 188, 125, 0.2)'};
  svg {
    font-size: 20px;
    color: ${props => props.$isExpiring ? '#FF4D4F' : '#00BC7D'};
  }
`;
const AnnouncementTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$isExpiring ? '#D32F2F' : '#00BC7D'};
  margin: 0;
  flex: 1;
`;
const AnnouncementBody = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-left: 46px;
  @media (max-width: 768px) {
    padding-left: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;
const AnnouncementTextWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const AnnouncementText = styled.p`
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$isExpiring ? '#D32F2F' : '#333'};
  margin: 0;
`;
const AnnouncementSubtext = styled.p`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$isExpiring ? '#FF7875' : '#666'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  svg {
    font-size: 14px;
  }
`;
const ActionButton = styled.button`
  background: ${props => props.$isExpiring
    ? 'linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%)'
    : 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px ${props => props.$isExpiring
    ? 'rgba(255, 77, 79, 0.3)'
    : 'rgba(0, 188, 125, 0.3)'};
  white-space: nowrap;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.$isExpiring
      ? 'rgba(255, 77, 79, 0.4)'
      : 'rgba(0, 188, 125, 0.4)'};
  }
  &:active {
    transform: translateY(0);
  }
  svg {
    font-size: 18px;
  }
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;
const RecentlyViewedContainer = styled.div`
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
const OrderButton = styled.button`
  width: 100%;
  background: #FFFFFF;
  color: #00BC7D;
  border: 2px solid #00BC7D;
  border-radius: 16px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.1);
  &:hover {
    background: #00BC7D;
    color: #FFFFFF;
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.3);
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 188, 125, 0.2);
  }
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.4s ease, height 0.4s ease;
  }
  &:hover::after {
    width: 300px;
    height: 300px;
  }
`;
const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 10px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;
const OrderCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$color || '#00BC7D'};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: ${props => props.$color || '#00BC7D'};
  }
  &:hover::before {
    transform: scaleX(1);
  }
  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: flex-start;
    padding: 16px;
  }
`;
const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.$bgColor || 'rgba(0, 188, 125, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  svg {
    font-size: 28px;
    color: ${props => props.$iconColor || '#00BC7D'};
  }
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    svg {
      font-size: 24px;
    }
  }
`;
const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  @media (max-width: 768px) {
    align-items: flex-start;
    flex: 1;
  }
`;
const OrderTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0;
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;
const OrderSubtitle = styled.p`
  font-size: 13px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
  text-align: center;
  @media (max-width: 768px) {
    text-align: left;
    font-size: 12px;
  }
`;
const Badge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: ${props => props.$bgColor || '#FF4D4F'};
  color: white;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
  @media (max-width: 768px) {
    top: 8px;
    right: 8px;
  }
`;
const NoItemsText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 20px 0;
`;
const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
`;
const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Profile = () => {
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [hasProcessingOrder, setHasProcessingOrder] = useState(false);
  const [hasFailedOrder, setHasFailedOrder] = useState(false);
  const [hasItemsToReview, setHasItemsToReview] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [toReviewCount, setToReviewCount] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [isExpiring, setIsExpiring] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!profile?.id) return;
      try {
        const { data, error } = await supabase
          .from('product_views')
          .select(`
            product_id,
            products (id, name, image_url, price, description)
          `)
          .eq('user_id', profile.id)
          .order('viewed_at', { ascending: false })
          .limit(10);
        if (error) throw error;
        const viewedProducts = data.map((view) => ({
          id: view.product_id,
          name: view.products.name,
          image_url: view.products.image_url,
          price: view.products.price || 0,
          description: view.products.description || t('NoDescription'),
        }));
        setRecentlyViewed(viewedProducts);
      } catch (error) {
        console.error('Error fetching recently viewed:', error);
        setRecentlyViewed([]);
      }
    };
    fetchRecentlyViewed();
  }, [profile?.id, t]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!profile?.id) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('delivery_status')
          .eq('user_id', profile.id);
        if (error) throw error;

        const processingOrders = data.filter(order => order.delivery_status === 'processing');
        const failedOrders = data.filter(order => order.delivery_status === 'failed');
        const deliveredOrders = data.filter(order => order.delivery_status === 'delivered');

        setHasProcessingOrder(processingOrders.length > 0);
        setHasFailedOrder(failedOrders.length > 0);
        setHasItemsToReview(deliveredOrders.length > 0);

        setProcessingCount(processingOrders.length);
        setFailedCount(failedOrders.length);
        setToReviewCount(deliveredOrders.length);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, [profile?.id]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoadingTopProducts(true);
        const { data: orders, error } = await supabase
          .from('orders')
          .select('items')
          .eq('status', 'succeeded');
        if (error) throw error;
        const productCounts = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            const mainProductId = item.parent_product_id || item.id;
            if (!productCounts[mainProductId]) {
              productCounts[mainProductId] = {
                count: 0,
                product: { ...item, id: mainProductId }
              };
            }
            productCounts[mainProductId].count += item.quantity;
          });
        });
        const sortedProducts = Object.values(productCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 4)
          .map((item) => ({
            ...item.product,
            orderCount: item.count
          }));
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
    };
    fetchTopProducts();
  }, []);

 useEffect(() => {
  const fetchVoucherState = async () => {
    if (!profile?.id) {
      setAnnouncementMessage('');
      return;
    }
    try {
      // First, check if the user has made any successful purchases
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', profile.id)
        .eq('status', 'succeeded')
        .limit(1);
      
      if (ordersError) throw ordersError;
      
      // If no successful orders, don't show any voucher announcement
      if (!ordersData || ordersData.length === 0) {
        setAnnouncementMessage('');
        return;
      }
      
      // User has made a purchase, now check for voucher
      const { data: userRewardsData, error: userRewardsError } = await supabase
        .from('user_rewards')
        .select('is_collected, is_used, validity')
        .eq('user_id', profile.id)
        .eq('reward_id', 1);
      
      if (userRewardsError) throw userRewardsError;
      
      let message = '';
      let expiring = false;
      let expiryDateStr = '';

      if (userRewardsData && userRewardsData.length > 0) {
        const userReward = userRewardsData[0];
        
        // Check if voucher is collected but not used
        if (userReward.is_collected && !userReward.is_used) {
          const currentDate = new Date();
          const expiryDate = new Date(userReward.validity);
          const timeDiff = expiryDate - currentDate;
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          
          // Show expiring warning if within 3 days
          if (daysDiff >= 0 && daysDiff <= 3) {
            const formattedDate = expiryDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            message = t('VoucherExpiringSoon');
            expiryDateStr = formattedDate;
            expiring = true;
          }
        } else if (!userReward.is_collected && !userReward.is_used) {
          // Voucher exists but not collected yet
          message = t('NewVoucherUnlocked');
        }
        // If is_used is true, don't show any message
      } else {
        // User has made a purchase but no voucher record exists yet
        // This might be a timing issue - don't show message
        message = '';
      }
      
      setAnnouncementMessage(message);
      setIsExpiring(expiring);
      setExpiryDate(expiryDateStr);
    } catch (error) {
      console.error('Error fetching voucher state:', error);
      setAnnouncementMessage('');
    }
  };
  
  fetchVoucherState();
}, [profile?.id, t]);

  const handleProductPress = (product) => {
    const standardizedProduct = {
      id: product.id,
      image_url: product.image_url,
      description: product.description || t('NoDescription'),
      price: product.price,
      sale_percentage: product.sale_percentage || null,
    };
    navigate(`/ProductsView?product=${encodeURIComponent(JSON.stringify(standardizedProduct))}`);
  };

  const handleToReceivePress = () => {
    navigate('/Orders');
  };
  const handleToReviewPress = () => {
    navigate('/ToReview');
  };
  const handleFailedPress = () => {
    navigate('/FailedOrders');
  };
  const handleSeeAllNewItems = () => {
    navigate('/ProductList?section=new-items');
  };
  const handleSeeAllMostPopular = () => {
    navigate('/ProductList?section=most-popular');
  };
  const handleSeeAllCategories = () => {
    navigate('/CategoriesList');
  };
  const handleVoucherPress = () => {
    navigate('/Vouchers');
  };

  return (
    <PageContainer>
      <ProfileHeader
        profile={profile}
        customContent={
          <OrderButton onClick={() => console.log('My Activity Pressed!')}>
            {t('MyActivity')}
          </OrderButton>
        }
      />
      <Container>
        <Greeting>
          <GreetingText>{t('Hello')}, {profile?.first_name || t('User')}!</GreetingText>
        </Greeting>

        {announcementMessage && (
          <AnnouncementContainer $isExpiring={isExpiring}>
            <AnnouncementHeader>
              <AnnouncementIconWrapper $isExpiring={isExpiring}>
                {isExpiring ? <IoTime /> : <IoGift />}
              </AnnouncementIconWrapper>
              <AnnouncementTitle $isExpiring={isExpiring}>
                {isExpiring ? t('UrgentReminder') : t('SpecialOffer')}
              </AnnouncementTitle>
            </AnnouncementHeader>
            <AnnouncementBody>
              <AnnouncementTextWrapper>
                <AnnouncementText $isExpiring={isExpiring}>
                  {announcementMessage}
                </AnnouncementText>
                {isExpiring && expiryDate && (
                  <AnnouncementSubtext $isExpiring={isExpiring}>
                    <IoTime />
                    {t('ExpiresOn', { date: expiryDate })}
                  </AnnouncementSubtext>
                )}
                {!isExpiring && (
                  <AnnouncementSubtext>
                    <IoTicket />
                    {t('ClaimYourSpecialDiscount')}
                  </AnnouncementSubtext>
                )}
              </AnnouncementTextWrapper>
              <ActionButton $isExpiring={isExpiring} onClick={handleVoucherPress}>
                {isExpiring ? t('UseNow') : t('ClaimNow')}
                <IoArrowForward />
              </ActionButton>
            </AnnouncementBody>
          </AnnouncementContainer>
        )}

        <Greeting>
          <SectionTitle>{t('RecentlyViewed')}</SectionTitle>
        </Greeting>
        <RecentlyViewedContainer>
          {recentlyViewed.length === 0 ? (
            <NoItemsText>{t('NoRecentlyViewedItems')}</NoItemsText>
          ) : (
            recentlyViewed.map((item) => (
              <TopProductCard key={item.id} onClick={() => handleProductPress(item)}>
                <TopProductImage src={item.image_url} alt={item.name} />
              </TopProductCard>
            ))
          )}
        </RecentlyViewedContainer>

        <Greeting>
          <SectionTitle>{t('MyOrders')}</SectionTitle>
        </Greeting>
        <OrdersGrid>
          <OrderCard $color="#FF4D4F" onClick={handleFailedPress}>
            <IconWrapper $bgColor="rgba(255, 77, 79, 0.1)" $iconColor="#FF4D4F">
              <MdError />
              {hasFailedOrder && <Badge $bgColor="#FF4D4F">{failedCount}</Badge>}
            </IconWrapper>
            <OrderInfo>
              <OrderTitle>{t('Failed')}</OrderTitle>
              <OrderSubtitle>{t('FailedOrders')}</OrderSubtitle>
            </OrderInfo>
          </OrderCard>
          <OrderCard $color="#00BC7D" onClick={handleToReceivePress}>
            <IconWrapper $bgColor="rgba(0, 188, 125, 0.1)" $iconColor="#00BC7D">
              <MdLocalShipping />
              {hasProcessingOrder && <Badge $bgColor="#00BC7D">{processingCount}</Badge>}
            </IconWrapper>
            <OrderInfo>
              <OrderTitle>{t('ToReceive')}</OrderTitle>
              <OrderSubtitle>{t('ToReceive')}</OrderSubtitle>
            </OrderInfo>
          </OrderCard>
          <OrderCard $color="#FFA940" onClick={handleToReviewPress}>
            <IconWrapper $bgColor="rgba(255, 169, 64, 0.1)" $iconColor="#FFA940">
              <MdRateReview />
              {hasItemsToReview && <Badge $bgColor="#FFA940">{toReviewCount}</Badge>}
            </IconWrapper>
            <OrderInfo>
              <OrderTitle>{t('ToReview')}</OrderTitle>
              <OrderSubtitle>{t('ToReview')}</OrderSubtitle>
            </OrderInfo>
          </OrderCard>
        </OrdersGrid>

        <TitleWithAction
          title={t('NewItems')}
          showClock={false}
          onPress={handleSeeAllNewItems}
        />
        <ItemsList grid={false} onPress={handleProductPress} />

        <TitleWithAction
          title={t('MostPopular')}
          showClock={false}
          onPress={handleSeeAllMostPopular}
        />
        <MostPopular />

        <TitleWithAction
          title={t('Categories')}
          showClock={false}
          onPress={handleSeeAllCategories}
        />
        <GridItems limit={4} />

        <Greeting>
          <SectionTitle>{t('TopProducts')}</SectionTitle>
        </Greeting>
        {loadingTopProducts ? (
          <Loader><Spinner /></Loader>
        ) : (
          <RecentlyViewedContainer>
            {topProducts.length === 0 ? (
              <NoItemsText>{t('NoTopProductsAvailable')}</NoItemsText>
            ) : (
              topProducts.map((item) => (
                <TopProductCard key={item.id} onClick={() => handleProductPress(item)}>
                  <TopProductImage src={item.image_url} alt={item.name} />
                </TopProductCard>
              ))
            )}
          </RecentlyViewedContainer>
        )}

        <Greeting>
          <IconTextContainer>
            <SectionTitle>{t('JustForYou')}</SectionTitle>
            <StarIcon />
          </IconTextContainer>
        </Greeting>
        <ItemsList grid={true} limit={6} onPress={handleProductPress} />
      </Container>
    </PageContainer>
  );
};

export default Profile;