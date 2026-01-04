import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import ProfileHeader from '../../components/ProfileHeader';
import { useTranslation } from 'react-i18next';
import { IoMailOutline, IoCopyOutline, IoCheckmarkCircle } from 'react-icons/io5';

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

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #202020;
  margin: 0;
`;

const ContactButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ECFDF5;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #D0FAE5;
    transform: scale(1.05);
  }
`;

const ProgressBarContainer = styled.div`
  border-radius: 12px;
  padding: 20px 16px;
  margin-bottom: 10px;
  position: relative;
`;

const ProgressTrack = styled.div`
  height: 24px;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  top:25px;
  position: relative;
`;
const ViewTrackingButton = styled.button`
  background: linear-gradient(135deg, #00BC7D 0%, #10B981 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
  &:active {
    transform: translateY(0);
  }
`;

const ProgressBackgroundShadow = styled.div`
  position: absolute;
  right: 17px;
  height: 14px;
  width: 95%;
  background-color: #D0FAE5;
  border-radius: 6px;
  top: 70%;
  transform: translateY(-6px);
  z-index: 0;
`;

const ProgressBackground = styled.div`
  position: absolute;
  height: 10px;
  width: 100%;
  border-radius: 4px;
  top: 50%;
  border: 2px solid white;
  transform: translateY(-4px);
  z-index: 2;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
`;

const ProgressFill = styled.div`
  position: absolute;
  height: 8px;
  background-color: #00BC7D;
  border-radius: 4px;
  border: 2px solid white;
  top: 50%;
  left: 2px;
  transform: translateY(-4px);
  z-index: 2;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const CircleShadow = styled.div`
  position: absolute;
  background-color: #D0FAE5;
  border-radius: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 70%;
  z-index: 0;
  transform: translateY(-19px);
`;

const CircleContainer = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 18px;
  width: 26px;
  height: 26px;
  border: 2px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  transform: translateY(-12px);
  z-index: 1;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
`;

const CircleWrapper = styled.div`
  position: absolute;
  width: 26px;
  height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  transform: translateY(-12px);
  z-index: 3;
`;

const Circle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 12px;
  background-color: ${props => props.$active ? '#00BC7D' : '#E0E0E0'};
  z-index: 3;
  transition: background-color 0.3s ease;
`;

const CloudContainer = styled.div`
  position: absolute;
  top: -20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 4;
  padding-top:29px;

  ${props => props.$position === 'start' && `
    left: -21px;
    transform: translateX(5px);
  `}

  ${props => props.$position === 'middle' && `
    left: 51%;
    transform: translateX(-25px);
  `}

  ${props => props.$position === 'end' && `
    right: -17px;
    transform: translateX(-5px);
  `}
`;

const CloudBubble = styled.div`
  background-color: #10B981;
  border-radius: 15px;
  padding: 4px 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CloudText = styled.span`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #FFFFFF;
  text-align: center;
`;

const CloudTail = styled.div`
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #10B981;
  margin-top: -1px;
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const ArrivalContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArrivalLabel = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
  letter-spacing: -0.36px;
  color: #202020;
  margin-bottom: 4px;
`;

const DeliveryDate = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 14px;
  letter-spacing: -0.28px;
  color: #64748B;
  margin-left: 2px;
`;

const OrderNumber = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: -0.32px;
  text-align: right;
  color: #202020;
  margin-top: 8px;
`;

const Separator = styled.div`
  height: 1px;
  background-color: #E0E0E0;
  margin: 12px 0;
`;

const TrackingContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TrackingLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  background-color: #ECFDF5;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  margin-right: 12px;
`;

const CourierIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const TrackingDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CourierName = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.16px;
  color: #18181B;
`;

const TrackingRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const TrackingLabel = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: -0.16px;
  color: #18181B;
  margin-bottom: 8px;
`;

const TrackingNumberWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TrackingNumber = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: -0.16px;
  color: #64748B;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 12px 0 24px;
  align-items: center;
  padding: 8px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 5px;
  object-fit: cover;
  margin-right: 12px;
  @media (max-width: 768px) {
    width: 100%;
    height: 150px;
    margin-right: 0;
    margin-bottom: 12px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #202020;
  margin: 0 0 4px 0;
`;

const ItemPrice = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666666;
  margin: 0;
`;

const ItemSeparator = styled.div`
  height: 1px;
  background-color: #E0E0E0;
  margin: 12px 0 12px 92px;
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const SummaryContainer = styled.div`
  margin-top: 32px;
  background-color: #FFFFFF;
`;

const SummaryTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1C1129;
  line-height: 18px;
  letter-spacing: -0.2px;
  margin: 0 0 16px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SummaryLabel = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  color: #64748B;
  padding: 2px 0;
`;

const SummaryValue = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #1C1129;
`;

const SummarySeparator = styled.div`
  height: 1px;
  background-color: #E0E0E0;
  margin: 12px 0;
`;

const SummaryLabelTotal = styled(SummaryLabel)`
  font-weight: 700;
  color: #090314;
`;

const SummaryValueTotal = styled(SummaryValue)`
  font-weight: 700;
  color: #090314;
`;

const ShippingContainer = styled.div`
  margin-top: 32px;
  background-color: #FFFFFF;
  padding: 8px 0;
`;

const ShippingTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1C1129;
  line-height: 18px;
  letter-spacing: -0.2px;
  margin: 0 0 12px 0;
`;

const ShippingAddress = styled.p`
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.02px;
  color: #1C1129;
  margin: 0 0 12px 0;
`;

const ReceiverInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const ReceiverName = styled.span`
  font-size: 12px;
  color: #000000;
  line-height: 16px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
`;

const ReceiverLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: -0.14px;
  font-family: 'Raleway', sans-serif;
  color: #202020;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #D97474;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  text-align: center;
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

const ToastMessage = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #10B981;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease;
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

const CustomerOrderDetails = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const orderParam = params.get('order');

      if (orderParam) {
        const parsedOrder = JSON.parse(decodeURIComponent(orderParam));
        console.log('Parsed order data:', parsedOrder);
        setOrder(parsedOrder);
      }
    } catch (err) {
      console.error('Error parsing order data:', err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  if (loading) {
    return (
      <LoaderContainer>
        <Loader />
      </LoaderContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <ProfileHeader profile={profile} />
        <Container>
          <ErrorContainer>
            <ErrorText>{t('FailedToLoadOrder')}</ErrorText>
          </ErrorContainer>
        </Container>
      </PageContainer>
    );
  }

  const createdDate = new Date(order.created_at);
  const deliveryDate = new Date(createdDate);
  deliveryDate.setDate(createdDate.getDate() + 7);
  const formattedDeliveryDate = deliveryDate.toISOString().split('T')[0];

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let shippingOption;
  if (typeof order.shipping_option === 'string') {
    try {
      shippingOption = JSON.parse(order.shipping_option);
    } catch (e) {
      console.error('Error parsing shipping_option:', e);
      shippingOption = null;
    }
  } else {
    shippingOption = order.shipping_option;
  }

  const courierName = shippingOption?.name || t('NotAvailable');
  const shippingCosts = shippingOption?.price
    ? parseFloat(shippingOption.price.replace('$', '')) || 0
    : 0;

  const trackingNumber = shippingOption?.tracking_number || order.tracking_number || t('NotAvailable');

  const total = subtotal + shippingCosts;

  const orderSummary = {
    subtotal,
    courierName,
    trackingNumber,
    shippingCosts,
    coupon: 0,
    total,
  };

  const userAddress = order.profiles || order.shipping_address || {};
  const addressParts = [
    userAddress.line1 || userAddress.address_line1,
    userAddress.line2 || userAddress.address_line2,
    userAddress.city,
    userAddress.state,
    userAddress.postal_code || userAddress.zip_code,
    userAddress.country,
  ].filter(part => part);

  const formattedAddress = addressParts.length > 0
    ? addressParts.join(', ')
    : t('NoShippingAddressAvailable');

  const receiverName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : t('NotAvailable');

  const handleCopyTrackingNumber = () => {
    if (trackingNumber !== t('NotAvailable')) {
      navigator.clipboard.writeText(trackingNumber);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      alert(t('NoTrackingNumberToCopy'));
    }
  };

  const handleContactVendor = () => {
    console.log('Attempting to contact vendor, order.vendor_id:', order.vendor_id);
    if (!order.vendor_id) {
      console.error('vendor_id is missing from order data');
      alert(t('NoVendorId'));
      return;
    }
    navigate(`/customer/CustomerMessages?vendorId=${order.vendor_id}`);
  };

  const handleViewTracking = () => {
  if (trackingNumber && trackingNumber !== t('NotAvailable')) {
    navigate(`/tracking-details?trackingNumber=${trackingNumber}&orderId=${order.id}`);
  } else {
    alert('No tracking number available');
  }
};

  const statusToProgress = {
    processing: 25,
    shipped: 50,
    delivered: 99,
    failed: 0,
  };

  const progress = statusToProgress[order.delivery_status] || 0;
  const isProcessingActive = progress >= 0 && order.delivery_status !== 'failed';
  const isShippedActive = progress >= 33 && order.delivery_status !== 'failed';
  const isDeliveredActive = progress >= 66 && order.delivery_status !== 'failed';

  const headerContent = (
    <Header>
      <HeaderTitle>{t('OrderDetails')}</HeaderTitle>
      <ContactButton onClick={handleContactVendor} aria-label={t('ContactVendor')}>
        <IoMailOutline size={20} color="#00BC7D" />
      </ContactButton>
    </Header>
  );

  return (
    <PageContainer>
      <ProfileHeader profile={profile} customContent={headerContent} />
      <Container>
        <ProgressBarContainer>
          {isProcessingActive && (
            <CloudContainer $position="start">
              <CloudBubble>
                <CloudText>{t('Processing')}</CloudText>
              </CloudBubble>
              <CloudTail />
            </CloudContainer>
          )}
          {isShippedActive && (
            <CloudContainer $position="middle">
              <CloudBubble>
                <CloudText>{t('Shipped')}</CloudText>
              </CloudBubble>
              <CloudTail />
            </CloudContainer>
          )}
          {isDeliveredActive && (
            <CloudContainer $position="end">
              <CloudBubble>
                <CloudText>{t('Delivered')}</CloudText>
              </CloudBubble>
              <CloudTail />
            </CloudContainer>
          )}

          <ProgressBackgroundShadow />

          <CircleShadow style={{ left: 0, transform: 'translate(9px, -19px)' }} />
          <CircleShadow style={{ left: '50%', transform: 'translate(-2.5px, -20px)' }} />
          <CircleShadow style={{ right: 0, transform: 'translate(-9.5px, -19px)' }} />

          <ProgressTrack>
            <ProgressBackground />
            <ProgressFill $progress={progress} />

            <CircleContainer style={{ left: 0 }} />
            <CircleContainer style={{ left: '50%', transform: 'translate(-12px, -12px) translateX(17px)' }} />
            <CircleContainer style={{ right: 0 }} />

            <CircleWrapper style={{ left: 0 }}>
              <Circle $active={progress >= 0 && order.delivery_status !== 'failed'} />
            </CircleWrapper>
            <CircleWrapper style={{ left: '50%', transform: 'translate(-12px, -12px) translateX(17px)' }}>
              <Circle $active={progress >= 33 && order.delivery_status !== 'failed'} />
            </CircleWrapper>
            <CircleWrapper style={{ right: 0 }}>
              <Circle $active={progress >= 66 && order.delivery_status !== 'failed'} />
            </CircleWrapper>
          </ProgressTrack>
        </ProgressBarContainer>

        <OrderInfo>
          <ArrivalContainer>
            <ArrivalLabel>{t('ArrivalTime')}</ArrivalLabel>
            <DeliveryDate>{formattedDeliveryDate}</DeliveryDate>
          </ArrivalContainer>
          <OrderNumber>{t('OrderPrefix')}{order.id}</OrderNumber>
        </OrderInfo>

        <Separator />

        {order.delivery_status === 'shipped' && (
          <>
            <TrackingContainer>
              <TrackingLeft>
                <IconContainer>
                  <CourierIcon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300BC7D'%3E%3Cpath d='M18 18.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m1.5-9l1.96 2.5L17 12V9m-11 9.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2v-5l-3-4z'/%3E%3C/svg%3E" alt="Courier" />
                </IconContainer>
                <TrackingDetails>
                  <CourierName>{orderSummary.courierName}</CourierName>
                </TrackingDetails>
              </TrackingLeft>
              <TrackingRight>
  <TrackingLabel>{t('TrackingNo')}</TrackingLabel>
  <TrackingNumberWrapper>
    <TrackingNumber>{orderSummary.trackingNumber}</TrackingNumber>
    <CopyButton onClick={handleCopyTrackingNumber}>
      <IoCopyOutline size={16} color="#00BC7D" />
    </CopyButton>
  </TrackingNumberWrapper>
  <ViewTrackingButton onClick={handleViewTracking} style={{ marginTop: '12px' }}>
    {t('ViewTracking')}
  </ViewTrackingButton>
</TrackingRight>
            </TrackingContainer>
            <Separator />
          </>
        )}

        {order.items.map((item, index) => (
          <div key={index}>
            <ItemContainer>
              <ItemImage
                src={item.image_url || 'https://via.placeholder.com/80'}
                alt={item.description || t('Product')}
              />
              <ItemDetails>
                <ItemName>{item.description || t('UnnamedItem')}</ItemName>
                <ItemPrice>
                  {t('Price')}: ${item.price.toFixed(2)} • {t('Qty')}: {item.quantity}
                </ItemPrice>
              </ItemDetails>
            </ItemContainer>
            {index < order.items.length - 1 && <ItemSeparator />}
          </div>
        ))}

        <SummaryContainer>
          <SummaryTitle>{t('OrderSummary')}</SummaryTitle>
          <SummaryRow>
            <SummaryLabel>{t('Subtotal')}:</SummaryLabel>
            <SummaryValue>${orderSummary.subtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>{t('CourierName')}:</SummaryLabel>
            <SummaryValue>{orderSummary.courierName}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>{t('TrackingNumber')}:</SummaryLabel>
            <SummaryValue>{orderSummary.trackingNumber}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>{t('ShippingCosts')}:</SummaryLabel>
            <SummaryValue>${orderSummary.shippingCosts.toFixed(2)}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>{t('Coupon')}:</SummaryLabel>
            <SummaryValue>${orderSummary.coupon.toFixed(2)}</SummaryValue>
          </SummaryRow>
          <SummarySeparator />
          <SummaryRow>
            <SummaryLabelTotal>{t('Total')}:</SummaryLabelTotal>
            <SummaryValueTotal>${orderSummary.total.toFixed(2)}</SummaryValueTotal>
          </SummaryRow>
        </SummaryContainer>

        <ShippingContainer>
          <ShippingTitle>{t('ShippingAddress')}</ShippingTitle>
          <ShippingAddress>{formattedAddress}</ShippingAddress>
          <ReceiverInfo>
            <ArrivalContainer>
              <ReceiverName>{t('Receiver')}</ReceiverName>
              <ReceiverLabel>{receiverName}</ReceiverLabel>
            </ArrivalContainer>
          </ReceiverInfo>
        </ShippingContainer>

        {showToast && (
          <ToastMessage>
            <IoCheckmarkCircle size={20} color="white" />
            <span>{t('TrackingNumberCopied')}</span>
          </ToastMessage>
        )}
      </Container>
    </PageContainer>
  );
};

export default CustomerOrderDetails;