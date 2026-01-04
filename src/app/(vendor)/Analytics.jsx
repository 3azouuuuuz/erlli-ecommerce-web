// Analytics.jsx (Vendor)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoTrendingUpSharp, IoTrendingDownSharp, IoTrashOutline, IoPencilOutline, IoEyeOutline } from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';
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
  margin-bottom: 32px;
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: #F9F9F9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: #00BC7D;
  }
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
`;

const ChartHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  gap: 8px;
`;

const ChartTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #666;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 0.5px;
`;

const ChartValue = styled.h3`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0;
`;

const ChartGrowth = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
`;

const GrowthBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 50px;
  background: ${props => props.$type === 'up' ? '#00D492' : props.$type === 'down' ? '#FF4D4F' : '#FFC107'};
  box-shadow: 0 2px 8px ${props => 
    props.$type === 'up' ? 'rgba(0, 212, 146, 0.3)' : 
    props.$type === 'down' ? 'rgba(255, 77, 79, 0.3)' : 
    'rgba(255, 193, 7, 0.3)'};
`;

const IconCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 12px;
    color: #000;
  }
`;

const GrowthText = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: white;
  font-weight: 600;
`;

const GrowthComparison = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  font-weight: 500;
`;

const ChartWrapper = styled.div`
  overflow-x: auto;
  margin-top: 20px;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  
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

const Chart = styled.div`
  min-width: 900px;
  height: 280px;
  display: flex;
  position: relative;
  padding: 20px 0;
`;

const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 70px;
  padding-right: 16px;
`;

const YAxisLabel = styled.span`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #999;
  text-align: right;
  font-weight: 500;
`;

const GridLines = styled.div`
  position: absolute;
  left: 70px;
  right: 0;
  top: 20px;
  bottom: 40px;
`;

const GridLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #E8E8E8;
  bottom: ${props => props.$position}%;
`;

const ChartBars = styled.div`
  display: flex;
  align-items: flex-end;
  flex: 1;
  position: relative;
  z-index: 1;
  gap: 12px;
  padding-bottom: 30px;
`;

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 50px;
`;

const Bar = styled.div`
  width: 32px;
  height: ${props => Math.max(props.$height, 2)}%;
  background: ${props => props.$highlighted ? 
    'linear-gradient(180deg, #00D492 0%, #00BC7D 100%)' : 
    'linear-gradient(180deg, #555555 0%, #333333 100%)'};
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$highlighted ? 
    '0 4px 12px rgba(0, 212, 146, 0.3)' : 
    '0 2px 6px rgba(0, 0, 0, 0.1)'};
  position: relative;
  cursor: pointer;
  
  &:hover {
    transform: scaleY(1.05);
    background: ${props => props.$highlighted ? 
      'linear-gradient(180deg, #00E89D 0%, #00D492 100%)' : 
      'linear-gradient(180deg, #666666 0%, #444444 100%)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background: ${props => props.$highlighted ? '#00D492' : '#555555'};
    border-radius: 50%;
    opacity: ${props => props.$highlighted ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

const XAxisLabel = styled.span`
  font-size: 11px;
  font-family: 'Raleway', sans-serif;
  color: #999;
  margin-top: 12px;
  font-weight: 500;
`;

const SectionTitle = styled.h2`
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 30px;
  letter-spacing: -0.21px;
  margin: 0 0 20px 0;
  color: #202020;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: #00BC7D;
  }
`;

const ProductImageWrapper = styled.div`
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.1);
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ProductHeader = styled.div`
  margin-bottom: 8px;
`;

const ProductName = styled.h3`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #202020;
  margin: 0 0 6px 0;
  line-height: 1.3;
`;

const ProductDescription = styled.p`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F0F0F0;
`;

const ProductPrice = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #00BC7D;
  font-family: 'Raleway', sans-serif;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ViewButton = styled(ActionButton)`
  background: #E3F2FD;
  color: #1976D2;
  
  &:hover {
    background: #1976D2;
    color: white;
  }
`;

const EditButton = styled(ActionButton)`
  background: #D0FAE5;
  color: #00BC7D;
  
  &:hover {
    background: #00BC7D;
    color: white;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #FFEBEE;
  color: #D32F2F;
  
  &:hover {
    background: #D32F2F;
    color: white;
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
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #D32F2F;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 40px 20px;
  background: #FFEBEE;
  border-radius: 12px;
  margin: 0;
`;

const Analytics = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currency, formatCurrency } = useCurrency();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Store raw USD values
  const [analyticsDataUSD, setAnalyticsDataUSD] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalRefunds: 0,
  });
  
  // Display values (formatted)
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalRefunds: 0,
  });
  
  const [chartData, setChartData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  
  const [formattedRevenue, setFormattedRevenue] = useState('$0.00');
  const [formattedAvgOrder, setFormattedAvgOrder] = useState('$0.00');
  const [formattedRefunds, setFormattedRefunds] = useState('$0.00');
  const [formattedCurrentRevenue, setFormattedCurrentRevenue] = useState('$0.00');
  const [formattedPrevRevenue, setFormattedPrevRevenue] = useState('$0.00');
  
  // Chart state for currency conversion
  const [maxRevenue, setMaxRevenue] = useState(2000);
  const [yAxisLabels, setYAxisLabels] = useState(['2000', '1500', '1000', '500', '0']);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentMonthIndex = currentMonth - 1;
  const previousMonthIndex = currentMonthIndex - 1;
  const currentRevenue = chartData[currentMonthIndex]?.revenue || 0;
  const previousRevenue = previousMonthIndex >= 0 ? chartData[previousMonthIndex]?.revenue || 0 : 0;

  const growthState = currentRevenue > previousRevenue ? 'up' : currentRevenue < previousRevenue ? 'down' : 'stable';
  const percentageChange = previousRevenue !== 0
    ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
    : currentRevenue > 0 ? 100 : 0;

  useEffect(() => {
    fetchAnalyticsData();
  }, [profile?.id]);

  useEffect(() => {
    const convertAllValues = async () => {
      if (chartData.length === 0) return;

      // Convert analytics metrics from stored USD values
      const convertedRevenue = await formatCurrency(analyticsDataUSD.totalRevenue);
      const convertedAvg = await formatCurrency(analyticsDataUSD.averageOrderValue);
      const convertedRefunds = await formatCurrency(analyticsDataUSD.totalRefunds);

      setFormattedRevenue(convertedRevenue);
      setFormattedAvgOrder(convertedAvg);
      setFormattedRefunds(convertedRefunds);

      // Convert chart revenue values
      const convertedCurrent = await formatCurrency(currentRevenue);
      const convertedPrev = await formatCurrency(previousRevenue);
      setFormattedCurrentRevenue(convertedCurrent);
      setFormattedPrevRevenue(convertedPrev);

      // Convert Y-axis labels based on currency
      const maxRevenueInCurrency = await formatCurrency(2000);
      const extractedMax = parseFloat(maxRevenueInCurrency.replace(/[^0-9.]/g, ''));
      setMaxRevenue(extractedMax);

      // Calculate proportional Y-axis values
      const step = extractedMax / 4;
      const newLabels = [
        Math.round(extractedMax).toString(),
        Math.round(extractedMax - step).toString(),
        Math.round(extractedMax - step * 2).toString(),
        Math.round(extractedMax - step * 3).toString(),
        '0'
      ];
      setYAxisLabels(newLabels);

      // Convert product prices
      if (topSellingProducts.length > 0) {
        const productsWithConvertedPrices = await Promise.all(
          topSellingProducts.map(async (product) => {
            return {
              ...product,
              displayPrice: await formatCurrency(product.price),
              priceCurrency: currency
            };
          })
        );
        setTopSellingProducts(productsWithConvertedPrices);
      }
    };

    convertAllValues();
  }, [currency, chartData, currentRevenue, previousRevenue, analyticsDataUSD]);

  const fetchAnalyticsData = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, amount, status, vendor_id, created_at, items')
        .eq('vendor_id', profile.id)
        .in('status', ['succeeded', 'cancelled']);

      if (ordersError) throw ordersError;

      const { data: vendorProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, vendor_id')
        .eq('vendor_id', profile.id);

      if (productsError) throw productsError;

      // Calculate analytics metrics
      const succeededOrders = orders.filter(order => order.status === 'succeeded');
      const cancelledOrders = orders.filter(order => order.status === 'cancelled');

      const totalOrders = succeededOrders.length;
      const totalRevenueBeforeFee = succeededOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const totalRevenue = totalRevenueBeforeFee * 0.88;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalRefunds = cancelledOrders.reduce((sum, order) => {
        const refundAmount = (order.amount || 0) * 0.88;
        return sum + refundAmount;
      }, 0);

      // Store raw USD values
      setAnalyticsDataUSD({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        totalRefunds,
      });

      // Set initial formatted values
      const initialRevenue = await formatCurrency(totalRevenue);
      const initialAvg = await formatCurrency(averageOrderValue);
      const initialRefunds = await formatCurrency(totalRefunds);

      setAnalyticsData({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        totalRefunds,
      });

      setFormattedRevenue(initialRevenue);
      setFormattedAvgOrder(initialAvg);
      setFormattedRefunds(initialRefunds);

      // Calculate monthly revenue
      const months = [];
      const currentYear = now.getFullYear();
      for (let month = 1; month <= 12; month++) {
        months.push({
          year: currentYear,
          month: month,
          monthName: new Date(currentYear, month - 1, 1).toLocaleString('default', { month: 'short' }),
        });
      }

      const monthlyRevenue = months.map(({ year, month }) => {
        const monthOrders = succeededOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getFullYear() === year && orderDate.getMonth() + 1 === month;
        });
        const revenueBeforeFee = monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const revenue = revenueBeforeFee * 0.88;
        return {
          month: months.find(m => m.month === month).monthName,
          revenue,
          isHighlighted: month === currentMonth,
        };
      });

      setChartData(monthlyRevenue);

      // Calculate top-selling products
      const productCounts = {};
      orders.forEach((order) => {
        let items = order.items;
        if (typeof order.items === 'string') {
          items = JSON.parse(order.items);
        }

        if (!Array.isArray(items)) return;

        items.forEach((item) => {
          const productId = item.id;
          const quantity = item.quantity || 0;
          const product = vendorProducts.find(p => p.id === productId);

          if (product && order.status === 'succeeded') {
            if (productCounts[productId]) {
              productCounts[productId].quantity += quantity;
            } else {
              productCounts[productId] = {
                quantity,
                product: {
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  image_url: item.image_url || product.image_url,
                },
              };
            }
          }
        });
      });

      const sortedProducts = Object.values(productCounts)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 4)
        .map((item) => ({
          id: item.product.id.toString(),
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          image_url: item.product.image_url,
        }));

      setTopSellingProducts(sortedProducts);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (e, productId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', parseInt(productId))
        .eq('vendor_id', profile.id);

      if (error) throw error;

      setTopSellingProducts(topSellingProducts.filter(p => p.id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleEditProduct = (e, productId) => {
    e.stopPropagation();
    const product = topSellingProducts.find(p => p.id === productId);
    if (product) {
      navigate(`/vendor/products/edit/${productId}`, { state: { product } });
    }
  };

  const handleViewProduct = (productId) => {
    const product = topSellingProducts.find(p => p.id === productId);
    if (product) {
      navigate(`/vendor/products/${productId}`, { state: { product } });
    }
  };

  return (
  <PageContainer>
    <VendorHeader profile={profile} />
    <Container>
      <Header>
        <PageTitle>{t('Analytics')}</PageTitle>
      </Header>
      {loading ? (
        <LoadingContainer>
          <Spinner />
          <LoadingText>{t('LoadingAnalytics')}</LoadingText>
        </LoadingContainer>
      ) : error ? (
        <ErrorText>{error}</ErrorText>
      ) : (
        <>
          <MetricsGrid>
            <MetricCard>
              <MetricValue>{analyticsData.totalOrders}</MetricValue>
              <MetricLabel>{t('TotalOrders')}</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{formattedRevenue}</MetricValue>
              <MetricLabel>{t('TotalRevenue')}</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{formattedAvgOrder}</MetricValue>
              <MetricLabel>{t('AverageOrderValue')}</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{formattedRefunds}</MetricValue>
              <MetricLabel>{t('TotalRefundsIssued')}</MetricLabel>
            </MetricCard>
          </MetricsGrid>
          <ChartSection>
            <ChartHeader>
              <ChartTitle>{t('Revenue')}</ChartTitle>
              <ChartValue>{formattedCurrentRevenue}</ChartValue>
              <ChartGrowth>
                <GrowthBubble $type={growthState}>
                  <IconCircle>
                    {growthState === 'up' ? <IoTrendingUpSharp /> : <IoTrendingDownSharp />}
                  </IconCircle>
                  <GrowthText>
                    {growthState === 'stable' ? '0.0%' : `${Math.abs(percentageChange)}%`}
                  </GrowthText>
                </GrowthBubble>
                <GrowthComparison>{t('From')} {formattedPrevRevenue}</GrowthComparison>
              </ChartGrowth>
            </ChartHeader>
            <ChartWrapper>
              <Chart>
                <GridLines>
                  {yAxisLabels.map((_, index) => (
                    <GridLine key={index} $position={(index / (yAxisLabels.length - 1)) * 100} />
                  ))}
                </GridLines>
                <YAxis>
                  {yAxisLabels.map((label, index) => (
                    <YAxisLabel key={index}>{label}</YAxisLabel>
                  ))}
                </YAxis>
                <ChartBars>
                  {chartData.map((data, index) => {
                    const barHeight = (data.revenue / maxRevenue) * 100;
                    return (
                      <BarContainer key={index}>
                        <Bar $height={barHeight} $highlighted={data.isHighlighted} />
                        <XAxisLabel>{data.month}</XAxisLabel>
                      </BarContainer>
                    );
                  })}
                </ChartBars>
              </Chart>
            </ChartWrapper>
          </ChartSection>
          <SectionTitle>{t('TopSellingProducts')}</SectionTitle>
          {topSellingProducts.length === 0 ? (
            <EmptyState>
              <EmptyStateText>{t('NoTopSellingProductsAvailable')}</EmptyStateText>
            </EmptyState>
          ) : (
            <ProductsGrid>
  {topSellingProducts.map((item) => (
    <ProductCard key={item.id} onClick={() => handleViewProduct(item.id)}>
      <ProductImageWrapper>
        <ProductImage src={item.image_url} alt={item.name} />
      </ProductImageWrapper>
      <ProductInfo>
        <ProductHeader>
          <ProductName>{item.name}</ProductName>
          <ProductDescription>{item.description}</ProductDescription>
        </ProductHeader>
        <ProductFooter>
          <ProductPrice>{item.displayPrice}</ProductPrice>
          <ActionButtons onClick={(e) => e.stopPropagation()}>
            <ViewButton onClick={() => handleViewProduct(item.id)} title={t('View')}>
              <IoEyeOutline size={16} />
            </ViewButton>
            <EditButton onClick={(e) => handleEditProduct(e, item.id)} title={t('Edit')}>
              <IoPencilOutline size={14} />
            </EditButton>
            <DeleteButton onClick={(e) => handleDeleteProduct(e, item.id)} title={t('Delete')}>
              <IoTrashOutline size={16} />
            </DeleteButton>
          </ActionButtons>
        </ProductFooter>
      </ProductInfo>
    </ProductCard>
  ))}
</ProductsGrid>
          )}
        </>
      )}
    </Container>
  </PageContainer>
);
};

export default Analytics;