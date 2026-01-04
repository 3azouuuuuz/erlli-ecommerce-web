// Orders.jsx (Vendor)
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoChevronForwardOutline, IoRocketOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FA;
`;

const Container = styled.div`
  padding: 80px 16px 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  letter-spacing: -0.5px;
  margin: 0 0 8px 0;
  color: #202020;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
`;

const FilterWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`;

const FilterContainer = styled.div`
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #00BC7D 0%, #00E89D 100%)' 
    : 'transparent'};
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$active ? 'white' : '#666'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  svg {
    font-size: 18px;
  }

  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #00BC7D 0%, #00E89D 100%)' 
      : 'rgba(0, 188, 125, 0.1)'};
    color: ${props => props.$active ? 'white' : '#00BC7D'};
  }

  ${props => props.$active && `
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  `}
`;

const FilterCount = styled.span`
  background: ${props => props.$active ? 'rgba(255,255,255,0.25)' : '#E8E8E8'};
  color: ${props => props.$active ? 'white' : '#666'};
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #00BC7D;
    transform: translateY(-2px);
  }
`;

const OrderContent = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ImagesSection = styled.div`
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 100%;
    height: 140px;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  gap: 2px;
  grid-template-columns: ${props => 
    props.$count === 1 ? '1fr' :
    props.$count === 2 ? '1fr 1fr' : '1fr 1fr'};
  grid-template-rows: ${props =>
    props.$count <= 2 ? '1fr' : '1fr 1fr'};
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  grid-column: ${props => props.$span ? `span ${props.$span}` : 'auto'};
`;

const OrderDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const ProductName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0;
  flex: 1;
`;

const ViewButton = styled.button`
  background: #F0FDF9;
  border: none;
  color: #00BC7D;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  svg {
    font-size: 20px;
  }

  &:hover {
    background: #00BC7D;
    color: white;
    transform: translateX(4px);
  }
`;

const OrderDate = styled.p`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #999;
  margin: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #F0F0F0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionButton = styled.button`
  padding: 12px 28px;
  background: ${props => props.$variant === 'primary' 
    ? 'linear-gradient(135deg, #00BC7D 0%, #00E89D 100%)' 
    : 'white'};
  border: ${props => props.$variant === 'primary' ? 'none' : '2px solid #00BC7D'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#00BC7D'};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.3);
    ${props => props.$variant !== 'primary' && `
      background: #00BC7D;
      color: white;
    `}
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 20px;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #E8E8E8;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const EmptyStateIcon = styled.div`
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.4;
`;

const EmptyStateText = styled.p`
  font-size: 18px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #FFF5F5;
  border-radius: 16px;
  border: 1px solid #FFCDD2;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #D32F2F;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 16px 0;
`;

const Orders = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const statusParam = searchParams.get('status');

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('To Be Shipped');

  // Count orders by status
  const toBeShippedCount = orders.filter(o => o.delivery_status === 'processing').length;
  const shippedCount = orders.filter(o => 
    o.delivery_status === 'shipped' || o.delivery_status === 'delivered'
  ).length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  useEffect(() => {
    if (statusParam) {
      const filterMap = {
        'processing': 'To Be Shipped',
        'shipped': 'Shipped',
        'delivered': 'Shipped',
        'cancelled': 'Cancelled',
        'all': 'To Be Shipped'
      };
      setSelectedFilter(filterMap[statusParam] || 'To Be Shipped');
    }
  }, [statusParam]);

  useEffect(() => {
    fetchOrders();
  }, [profile?.id]);

  useEffect(() => {
    filterOrders(orders, selectedFilter);
  }, [selectedFilter, orders]);

  const fetchOrders = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: vendorOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', profile.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithCustomers = await Promise.all(
        (vendorOrders || []).map(async (order) => {
          const { data: customerProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, address_line1, address_line2, city, state, zip_code, country')
            .eq('id', order.user_id)
            .single();

          const convertedAmount = await formatCurrency(order.amount);

          return { 
            ...order, 
            profiles: customerProfile,
            convertedAmount: convertedAmount
          };
        })
      );

      setOrders(ordersWithCustomers);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(t('FailedToLoadOrders') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (ordersList, filter) => {
    switch (filter) {
      case 'Shipped':
        setFilteredOrders(ordersList.filter(o => 
          o.delivery_status === 'shipped' || o.delivery_status === 'delivered'
        ));
        break;
      case 'To Be Shipped':
        setFilteredOrders(ordersList.filter(o => o.delivery_status === 'processing'));
        break;
      case 'Cancelled':
        setFilteredOrders(ordersList.filter(o => o.status === 'cancelled'));
        break;
      default:
        setFilteredOrders(ordersList);
    }
  };

  const handleOrderClick = (order) => {
    navigate(`/vendor/orders/${order.id}`, { state: { order } });
  };

  const renderOrderImages = (items) => {
    const images = items.slice(0, 4).map(item => item.image_url || 'https://via.placeholder.com/100');
    const count = Math.min(items.length, 4);

    return (
      <ImageGrid $count={count}>
        {count === 1 && <ProductImage src={images[0]} alt={t('Product')} />}
        {count === 2 && images.map((img, i) => <ProductImage key={i} src={img} alt={t('Product')} />)}
        {count === 3 && (
          <>
            <ProductImage src={images[0]} alt={t('Product')} $span={2} />
            <ProductImage src={images[1]} alt={t('Product')} />
            <ProductImage src={images[2]} alt={t('Product')} />
          </>
        )}
        {count === 4 && images.map((img, i) => <ProductImage key={i} src={img} alt={t('Product')} />)}
      </ImageGrid>
    );
  };

  return (
    <PageContainer>
      <VendorHeader profile={profile} />
      <Container>
        <Header>
          <PageTitle>{t('Orders')}</PageTitle>
          <PageSubtitle>{t('ManageAndTrackOrders')}</PageSubtitle>
        </Header>

        <FilterWrapper>
          <FilterContainer>
            <FilterButton
              $active={selectedFilter === 'To Be Shipped'}
              onClick={() => setSelectedFilter('To Be Shipped')}
            >
              <IoRocketOutline />
              {t('ToBeShipped')}
              <FilterCount $active={selectedFilter === 'To Be Shipped'}>{toBeShippedCount}</FilterCount>
            </FilterButton>
            <FilterButton
              $active={selectedFilter === 'Shipped'}
              onClick={() => setSelectedFilter('Shipped')}
            >
              <IoCheckmarkCircleOutline />
              {t('Shipped')}
              <FilterCount $active={selectedFilter === 'Shipped'}>{shippedCount}</FilterCount>
            </FilterButton>
            <FilterButton
              $active={selectedFilter === 'Cancelled'}
              onClick={() => setSelectedFilter('Cancelled')}
            >
              <IoCloseCircleOutline />
              {t('Cancelled')}
              <FilterCount $active={selectedFilter === 'Cancelled'}>{cancelledCount}</FilterCount>
            </FilterButton>
          </FilterContainer>
        </FilterWrapper>

        {loading ? (
          <LoadingContainer>
            <Spinner />
            <LoadingText>{t('LoadingOrders')}</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <ErrorText>{error}</ErrorText>
            <ActionButton $variant="primary" onClick={fetchOrders}>{t('Retry')}</ActionButton>
          </ErrorContainer>
        ) : filteredOrders.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>📦</EmptyStateIcon>
            <EmptyStateText>{t('NoOrdersInCategory', { category: t(selectedFilter.replace(' ', '')) })}</EmptyStateText>
          </EmptyState>
        ) : (
          <OrdersList>
            {filteredOrders.map((order) => {
              const customerName = `${order.profiles?.first_name || t('NA')} ${order.profiles?.last_name || ''}`.trim();
              const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });
              const isProcessing = order.delivery_status === 'processing';

              let shippingOption;
              try {
                shippingOption = typeof order.shipping_option === 'string' 
                  ? JSON.parse(order.shipping_option) 
                  : order.shipping_option;
              } catch (e) {
                shippingOption = null;
              }

              return (
                <OrderCard key={order.id}>
                  <OrderContent>
                    <ImagesSection>{renderOrderImages(order.items)}</ImagesSection>
                    <OrderDetails>
                      <OrderHeader>
                        <div>
                          <ProductName>{order.items?.[0]?.description || t('Product')}</ProductName>
                          <OrderDate>{orderDate}</OrderDate>
                        </div>
                        <ViewButton onClick={() => handleOrderClick(order)}>
                          <IoChevronForwardOutline />
                        </ViewButton>
                      </OrderHeader>

                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>{t('OrderNo')}</InfoLabel>
                          <InfoValue>#{order.id}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>{t('Amount')}</InfoLabel>
                          <InfoValue>{order.convertedAmount || `$${order.amount.toFixed(2)}`}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>{t('Customer')}</InfoLabel>
                          <InfoValue>{customerName}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>{t('Courier')}</InfoLabel>
                          <InfoValue>{shippingOption?.name || 'InPost'}</InfoValue>
                        </InfoItem>
                      </InfoGrid>

                      <OrderFooter>
                        {isProcessing ? (
                          <ActionButton $variant="primary" onClick={() => handleOrderClick(order)}>
                            {t('FulfillOrder')}
                          </ActionButton>
                        ) : (
                          <ActionButton $variant="secondary" onClick={() => handleOrderClick(order)}>
                            {t('ViewTracking')}
                          </ActionButton>
                        )}
                      </OrderFooter>
                    </OrderDetails>
                  </OrderContent>
                </OrderCard>
              );
            })}
          </OrdersList>
        )}
      </Container>
    </PageContainer>
  );
};

export default Orders;