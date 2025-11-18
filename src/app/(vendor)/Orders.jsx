// Orders.jsx (Vendor)
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoChevronForwardOutline, IoRefreshOutline } from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';

// Styled Components
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  margin: 0;
  color: #202020;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #E8E8E8;
  color: #666;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  
  svg {
    font-size: 18px;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    border-color: #00BC7D;
    color: #00BC7D;
    
    svg {
      transform: rotate(180deg);
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 8px;
  background: white;
  border-radius: 12px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #F0F0F0;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00BC7D;
    border-radius: 3px;
  }
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.$active ? '#D0FAE5' : '#F9F9F9'};
  border: 2px solid ${props => props.$active ? '#00BC7D' : 'transparent'};
  border-radius: 18px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$active ? '#00BC7D' : '#000'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #D0FAE5;
    border-color: #00BC7D;
    color: #00BC7D;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: #00BC7D;
  }
`;

const OrderContent = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ImagesSection = styled.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 120px;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  gap: 2px;
  grid-template-columns: ${props => 
    props.$count === 1 ? '1fr' :
    props.$count === 2 ? '1fr 1fr' :
    '1fr 1fr'};
  grid-template-rows: ${props =>
    props.$count === 1 ? '1fr' :
    props.$count === 2 ? '1fr' :
    props.$count === 3 ? '1fr 1fr' :
    '1fr 1fr'};
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
  gap: 12px;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0;
  flex: 1;
`;

const ViewButton = styled.button`
  background: transparent;
  border: none;
  color: #00BC7D;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
  
  svg {
    font-size: 20px;
  }
  
  &:hover {
    transform: translateX(4px);
  }
`;

const OrderDate = styled.p`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #999;
  margin: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
  color: #666;
`;

const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #F0F0F0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionButton = styled.button`
  padding: 10px 24px;
  background: ${props => props.$variant === 'primary' ? '#00BC7D' : 'transparent'};
  border: ${props => props.$variant === 'primary' ? 'none' : '2px solid #00BC7D'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#00BC7D'};
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? '#00A66A' : '#00BC7D'};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
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
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #FFEBEE;
  border-radius: 12px;
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
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('To Be Shipped');

  useEffect(() => {
    // Set initial filter based on URL param
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

  const fetchOrders = async (isRefresh = false) => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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

          return {
            ...order,
            profiles: customerProfile,
          };
        })
      );

      setOrders(ordersWithCustomers);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = (ordersList, filter) => {
    switch (filter) {
      case 'Shipped':
        setFilteredOrders(ordersList.filter(order => order.delivery_status === 'shipped'));
        break;
      case 'To Be Shipped':
        setFilteredOrders(ordersList.filter(order => order.delivery_status === 'processing'));
        break;
      case 'Cancelled':
        setFilteredOrders(ordersList.filter(order => order.status === 'cancelled'));
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
        {count === 1 && (
          <ProductImage src={images[0]} alt="Product" />
        )}
        {count === 2 && images.map((img, i) => (
          <ProductImage key={i} src={img} alt="Product" />
        ))}
        {count === 3 && (
          <>
            <ProductImage src={images[0]} alt="Product" $span={2} />
            <ProductImage src={images[1]} alt="Product" />
            <ProductImage src={images[2]} alt="Product" />
          </>
        )}
        {count === 4 && images.map((img, i) => (
          <ProductImage key={i} src={img} alt="Product" />
        ))}
      </ImageGrid>
    );
  };

  return (
    <PageContainer>
      <VendorHeader profile={profile} />
      <Container>
        <Header>
          <PageTitle>Orders</PageTitle>
          <RefreshButton onClick={() => fetchOrders(true)} disabled={refreshing}>
            <IoRefreshOutline />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
        </Header>

        <FilterContainer>
          <FilterButton
            $active={selectedFilter === 'To Be Shipped'}
            onClick={() => setSelectedFilter('To Be Shipped')}
          >
            To Be Shipped
          </FilterButton>
          <FilterButton
            $active={selectedFilter === 'Shipped'}
            onClick={() => setSelectedFilter('Shipped')}
          >
            Shipped
          </FilterButton>
          <FilterButton
            $active={selectedFilter === 'Cancelled'}
            onClick={() => setSelectedFilter('Cancelled')}
          >
            Cancelled
          </FilterButton>
        </FilterContainer>

        {loading ? (
          <LoadingContainer>
            <Spinner />
            <LoadingText>Loading orders...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <ErrorText>{error}</ErrorText>
            <ActionButton $variant="primary" onClick={() => fetchOrders(true)}>
              Retry
            </ActionButton>
          </ErrorContainer>
        ) : filteredOrders.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>📦</EmptyStateIcon>
            <EmptyStateText>No {selectedFilter.toLowerCase()} orders</EmptyStateText>
          </EmptyState>
        ) : (
          <OrdersList>
            {filteredOrders.map((order) => {
              const customerName = `${order.profiles?.first_name || 'N/A'} ${order.profiles?.last_name || ''}`.trim();
              const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const isProcessing = order.delivery_status === 'processing';

              let shippingOption;
              if (typeof order.shipping_option === 'string') {
                try {
                  shippingOption = JSON.parse(order.shipping_option);
                } catch (e) {
                  shippingOption = null;
                }
              } else {
                shippingOption = order.shipping_option;
              }
              const shippingName = shippingOption?.name || 'N/A';

              return (
                <OrderCard key={order.id}>
                  <OrderContent>
                    <ImagesSection>
                      {renderOrderImages(order.items)}
                    </ImagesSection>
                    
                    <OrderDetails>
                      <OrderHeader>
                        <ProductName>
                          {order.items?.[0]?.description || 'Product Name'}
                        </ProductName>
                        <ViewButton onClick={() => handleOrderClick(order)}>
                          <IoChevronForwardOutline />
                        </ViewButton>
                      </OrderHeader>
                      
                      <OrderDate>{orderDate}</OrderDate>
                      
                      <InfoGrid>
                        <InfoItem>
                          <InfoLabel>Order No</InfoLabel>
                          <InfoValue>#{order.id}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Price</InfoLabel>
                          <InfoValue>${order.amount.toFixed(2)}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Customer</InfoLabel>
                          <InfoValue>{customerName}</InfoValue>
                        </InfoItem>
                      </InfoGrid>
                      
                      <OrderFooter>
                        <InfoItem>
                          <InfoLabel>Courier</InfoLabel>
                          <InfoValue>{shippingName}</InfoValue>
                        </InfoItem>
                        
                        {isProcessing ? (
                          <ActionButton
                            $variant="primary"
                            onClick={() => handleOrderClick(order)}
                          >
                            Fulfill Order
                          </ActionButton>
                        ) : (
                          <ActionButton
                            $variant="secondary"
                            onClick={() => handleOrderClick(order)}
                          >
                            Tracking
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