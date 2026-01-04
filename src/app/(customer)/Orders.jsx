import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ProfileHeader from '../../components/ProfileHeader';
import { useTranslation } from 'react-i18next';
import { IoCheckmarkCircle, IoStar, IoStarOutline, IoClose } from 'react-icons/io5';
import RoundShapeList from '../../components/RoundShapeList';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const Container = styled.div`
  padding: 80px 16px 20px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding-top: 100px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const HeaderText = styled.h1`
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  line-height: 30px;
  margin: 0;
`;

const HeaderText2 = styled.h2`
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  line-height: 18px;
  margin: 0;
`;

const OrdersList = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderItem = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #00BC7D;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ImagesContainer = styled.div`
  width: 100px;
  height: 100px;
  margin-right: 12px;
  @media (max-width: 768px) {
    width: 100%;
    height: 150px;
    margin-right: 0;
    margin-bottom: 12px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 9px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const SingleImage = styled.img`
  width: 92px;
  height: 92px;
  border-radius: 5px;
  object-fit: cover;
`;

const TwoImagesHorizontal = styled.div`
  display: flex;
  flex-direction: row;
  width: 92px;
  height: 92px;
  gap: 1px;
`;

const HorizontalImage = styled.img`
  width: 48%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
`;

const ThreeImagesLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 92px;
  height: 92px;
  gap: 1px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  height: 48%;
  width: 100%;
  gap: 1px;
`;

const TopImage = styled.img`
  width: 48%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
`;

const BottomImage = styled.img`
  width: 100%;
  height: 48%;
  border-radius: 5px;
  object-fit: cover;
`;

const FourImagesGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 92px;
  height: 92px;
  gap: 1px;
`;

const GridImage = styled.img`
  width: calc(50% - 0.5px);
  height: calc(50% - 0.5px);
  border-radius: 5px;
  object-fit: cover;
`;

const DetailsContainer = styled.div`
  flex: 1;
  margin-left: 8px;
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const OrderHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
`;

const OrderId = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: -0.14px;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin-right: 8px;
`;

const ItemsCountContainer = styled.div`
  width: 61px;
  height: 22px;
  background-color: #F9F9F9;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ItemsCount = styled.span`
  font-size: 13px;
  font-weight: 500;
  line-height: 17px;
  letter-spacing: -0.13px;
  font-family: 'Raleway', sans-serif;
  color: #000000;
`;

const ShippingOption = styled.p`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 4px 0;
`;

const StatusAndButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

const StatusText = styled.span`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: -0.18px;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$delivered ? '#000' : '#202020'};
`;

const CheckmarkIcon = styled(IoCheckmarkCircle)`
  font-size: 20px;
  color: #00BC7D;
`;

const ActionButton = styled.button`
  width: 100px;
  height: 30px;
  border-radius: 9px;
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.16px;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #00BC7D;
  color: #FFFFFF;
  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const ReviewButton = styled(ActionButton)`
  background: white;
  border: 2px solid #00BC7D;
  color: #00BC7D;
  &:hover {
    background: #f0fdf8;
  }
`;

const NoItemsText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 20px 0;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: white;
`;

const Loader = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #D0FAE5;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Orders = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .in('delivery_status', ['processing', 'shipped', 'delivered'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filteredOrders = data.filter(order =>
        ['processing', 'shipped', 'delivered'].includes(order.delivery_status)
      );
     
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile?.id) return;

    let pollInterval = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && profile?.id) {
        fetchOrders();
        pollInterval = setInterval(() => {
          fetchOrders();
        }, 30000);
      } else {
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    fetchOrders();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (document.visibilityState === 'visible') {
      pollInterval = setInterval(() => {
        fetchOrders();
      }, 30000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profile?.id]);

  const renderOrderItem = (item) => {
    const isDelivered = item.delivery_status === 'delivered';

    const images = item.items.slice(0, 4).map(
      product => product.image_url || 'https://via.placeholder.com/50'
    );

    const itemCount = item.items.length;

    let shippingOptionName = t('Unknown');
    let shippingOption = item.shipping_option;

    if (typeof shippingOption === 'string') {
      try {
        shippingOption = JSON.parse(shippingOption);
      } catch (error) {
        console.warn(`Failed to parse shipping_option for order ${item.id}:`, shippingOption, error);
        shippingOption = null;
      }
    }

    if (shippingOption && typeof shippingOption === 'object' && shippingOption.name) {
      shippingOptionName = shippingOption.name;
    }

    return (
      <OrderItem key={item.id}>
        <OrderHeader
          onClick={() =>
            navigate(
              `/CustomerOrderDetails?order=${encodeURIComponent(JSON.stringify(item))}`
            )
          }
        >
          <ImagesContainer>
            {itemCount === 1 ? (
              <ImageContainer>
                <SingleImage src={images[0]} alt={t('Product')} />
              </ImageContainer>
            ) : itemCount === 2 ? (
              <ImageContainer>
                <TwoImagesHorizontal>
                  <HorizontalImage src={images[0]} alt={t('Product') + ' 1'} />
                  <HorizontalImage src={images[1]} alt={t('Product') + ' 2'} />
                </TwoImagesHorizontal>
              </ImageContainer>
            ) : itemCount === 3 ? (
              <ImageContainer>
                <ThreeImagesLayout>
                  <TopRow>
                    <TopImage src={images[0]} alt={t('Product') + ' 1'} />
                    <TopImage src={images[1]} alt={t('Product') + ' 2'} />
                  </TopRow>
                  <BottomImage src={images[2]} alt={t('Product') + ' 3'} />
                </ThreeImagesLayout>
              </ImageContainer>
            ) : (
              <ImageContainer>
                <FourImagesGrid>
                  <GridImage src={images[0]} alt={t('Product') + ' 1'} />
                  <GridImage src={images[1]} alt={t('Product') + ' 2'} />
                  <GridImage src={images[2]} alt={t('Product') + ' 3'} />
                  <GridImage src={images[3]} alt={t('Product') + ' 4'} />
                </FourImagesGrid>
              </ImageContainer>
            )}
          </ImagesContainer>

          <DetailsContainer>
            <OrderHeaderRow>
              <OrderId>{t('Order')} #{item.id}</OrderId>
              <ItemsCountContainer>
                <ItemsCount>{item.items.length} {t('items')}</ItemsCount>
              </ItemsCountContainer>
            </OrderHeaderRow>

            <ShippingOption>{shippingOptionName} {t('Delivery')}</ShippingOption>

            <StatusAndButtonRow>
              <StatusContainer>
                <StatusText $delivered={isDelivered}>
                  {t(item.delivery_status.charAt(0).toUpperCase() + item.delivery_status.slice(1))}
                </StatusText>
                {isDelivered && <CheckmarkIcon />}
              </StatusContainer>
            </StatusAndButtonRow>
          </DetailsContainer>
        </OrderHeader>
      </OrderItem>
    );
  };

  const headerContent = (
    <HeaderContent>
      <HeaderText>{t('ToReceive')}</HeaderText>
      <HeaderText2>{t('MyOrders')}</HeaderText2>
    </HeaderContent>
  );

  if (loading) {
    return (
      <LoaderContainer>
        <Loader />
      </LoaderContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileHeader profile={profile} customContent={headerContent} />
      <Container>
        <OrdersList>
          {orders.length === 0 ? (
            <NoItemsText>{t('NoPendingOrdersFound')}</NoItemsText>
          ) : (
            orders.map(renderOrderItem)
          )}
        </OrdersList>
      </Container>
    </PageContainer>
  );
};

export default Orders;