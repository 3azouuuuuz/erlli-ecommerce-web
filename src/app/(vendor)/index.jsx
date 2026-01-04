// index.jsx (Vendor)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoTrashOutline, IoPencilOutline, IoTrendingUpSharp, IoTrendingDownSharp, IoEyeOutline, IoCubeOutline, IoCartOutline, IoAnalyticsOutline, IoPeopleOutline, IoChevronForwardOutline } from 'react-icons/io5';
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
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EarningsCard = styled.div`
  background: linear-gradient(135deg, #D0FAE5 0%, #E6FCF5 100%);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 16px rgba(0, 188, 125, 0.12);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #00BC7D 0%, #00E89D 100%);
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 188, 125, 0.18);
  }
`;

const EarningsLabel = styled.p`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #666;
  margin: 0 0 12px 0;
`;

const EarningsAmount = styled.h2`
  font-size: 36px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$color || '#00BC7D'};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &::after {
    content: '→';
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 20px;
    color: ${props => props.$color || '#00BC7D'};
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: ${props => props.$color || '#00BC7D'};
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
  
  &:hover::after {
    opacity: 1;
    right: 12px;
  }
`;

const OrderValue = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 8px 0;
`;

const OrderLabel = styled.p`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #666;
  margin: 0;
`;

const ChartSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: 'View Details →';
    position: absolute;
    top: 28px;
    right: 28px;
    font-size: 13px;
    font-weight: 600;
    color: #00BC7D;
    opacity: 0;
    transition: all 0.3s ease;
    font-family: 'Raleway', sans-serif;
  }
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
  
  &:hover::after {
    opacity: 1;
  }
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

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 32px;
`;

const QuickActionCard = styled.div`
  background: ${props => props.$gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  }
`;

const QuickActionIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  
  svg {
    font-size: 24px;
    color: white;
  }
`;

const QuickActionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: white;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 6px 0;
`;

const QuickActionSubtitle = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Raleway', sans-serif;
  margin: 0;
  line-height: 1.4;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32px 0 20px 0;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 1.2;
  margin: 0;
  color: #202020;
`;

const ViewAllLink = styled.button`
  background: transparent;
  border: none;
  color: #00BC7D;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    gap: 10px;
    color: #00A66A;
  }
  
  svg {
    font-size: 16px;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
    border-color: #00BC7D;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    height: 160px;
  }
`;

const ProductInfo = styled.div`
  padding: 16px;
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
  margin: 0 0 12px 0;
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
  gap: 8px;
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
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

const DeleteButton = styled(ActionButton)`
  background: #FFEBEE;
  color: #D32F2F;
  
  &:hover {
    background: #D32F2F;
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
  color: #999;
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

const VendorIndex = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { currency, formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // Store raw USD values
  const [earningsUSD, setEarningsUSD] = useState(0);
  const [totalSalesUSD, setTotalSalesUSD] = useState(0);
  
  // Display values (formatted)
  const [earnings, setEarnings] = useState('$0.00');
  const [totalSales, setTotalSales] = useState('$0.00');
  const [pendingOrders, setPendingOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [formattedRevenue, setFormattedRevenue] = useState('$0.00');
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

  // Fetch vendor data on mount
  useEffect(() => {
    fetchVendorData();
  }, [profile?.id]);

  // Convert currency when currency changes
  useEffect(() => {
    const convertAllValues = async () => {
      console.log('Converting currency, earningsUSD:', earningsUSD, 'totalSalesUSD:', totalSalesUSD);
      
      // Convert earnings and sales from stored USD values
      if (earningsUSD > 0 || totalSalesUSD > 0) {
        const convertedEarnings = await formatCurrency(earningsUSD);
        const convertedSales = await formatCurrency(totalSalesUSD);
        console.log('Converted:', convertedEarnings, convertedSales);
        setEarnings(convertedEarnings);
        setTotalSales(convertedSales);
      }

      // Convert chart revenue values
      if (chartData.length > 0 && currentRevenue !== undefined) {
        const convertedCurrent = await formatCurrency(currentRevenue);
        const convertedPrev = await formatCurrency(previousRevenue || 0);
        setFormattedRevenue(convertedCurrent);
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
      }

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
  }, [currency, earningsUSD, totalSalesUSD, chartData, currentRevenue, previousRevenue]);

  const fetchVendorData = async () => {
    if (!profile?.id) {
      console.log('No profile ID');
      return;
    }

    setLoadingTopProducts(true);
    setError(null);

    try {
      console.log('Fetching orders for vendor:', profile.id);
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, amount, delivery_status, status, items, created_at')
        .eq('vendor_id', profile.id)
        .in('status', ['succeeded', 'cancelled']);

      if (ordersError) throw ordersError;

      console.log('Orders fetched:', orders);

      const { data: vendorProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, vendor_id')
        .eq('vendor_id', profile.id);

      if (productsError) throw productsError;

      console.log('Products fetched:', vendorProducts);

      const monthKeys = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const months = [];
const currentYear = now.getFullYear();
for (let month = 1; month <= 12; month++) {
  months.push({
    year: currentYear,
    month: month,
    monthName: t(monthKeys[month - 1]),
  });
}

      const monthlyRevenue = months.map(({ year, month, monthName }) => {
  const monthOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate.getFullYear() === year && orderDate.getMonth() + 1 === month && order.status === 'succeeded';
  });
  const revenueBeforeFee = monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const revenue = revenueBeforeFee * 0.88;
  return {
    month: monthName,
    revenue,
    isHighlighted: month === currentMonth,
  };
});

      setChartData(monthlyRevenue);

      const productCounts = {};
      let vendorTotalSales = 0;
      const vendorOrderStatuses = { processing: 0, delivered: 0, canceled: 0 };

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

          if (product) {
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

        if (order.status === 'succeeded') {
          vendorTotalSales += order.amount;
        }

        if (order.status === 'cancelled') {
          vendorOrderStatuses.canceled += 1;
        } else if (order.delivery_status === 'processing') {
          vendorOrderStatuses.processing += 1;
        } else if (order.delivery_status === 'delivered') {
          vendorOrderStatuses.delivered += 1;
        }
      });

      console.log('Vendor Total Sales:', vendorTotalSales);
      console.log('Product Counts:', productCounts);

      const sortedProducts = Object.values(productCounts)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 4)
        .map((item) => ({
          id: item.product.id.toString(),
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          image_url: item.product.image_url,
          vendor_id: profile.id,
        }));

      // Store the raw USD values
      setTotalSalesUSD(vendorTotalSales);
      setEarningsUSD(vendorTotalSales * 0.88);
      
      // Set formatted values immediately for initial load
      const initialEarnings = await formatCurrency(vendorTotalSales * 0.88);
      const initialSales = await formatCurrency(vendorTotalSales);
      setEarnings(initialEarnings);
      setTotalSales(initialSales);
      
      setPendingOrders(vendorOrderStatuses.processing);
      setDeliveredOrders(vendorOrderStatuses.delivered);
      setCanceledOrders(vendorOrderStatuses.canceled);
      setTopSellingProducts(sortedProducts);
      
      console.log('Set earningsUSD:', vendorTotalSales * 0.88);
      console.log('Set totalSalesUSD:', vendorTotalSales);
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      setError(t('FailedToLoadVendorData'));
      setTopSellingProducts([]);
      setChartData([]);
    } finally {
      setLoadingTopProducts(false);
    }
  };

  const handleDeleteProduct = async (e, productId) => {
    e.stopPropagation();
    if (!window.confirm(t('AreYouSureDeleteProduct'))) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', parseInt(productId))
        .eq('vendor_id', profile.id);

      if (error) throw error;

      setTopSellingProducts(topSellingProducts.filter(p => p.id !== productId));
      alert(t('ProductDeletedSuccessfully'));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(t('FailedToDeleteProduct'));
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
        <StatsRow>
          <EarningsCard>
            <EarningsLabel>{t('YourEarnings')}</EarningsLabel>
            <EarningsAmount>{earnings}</EarningsAmount>
          </EarningsCard>
        </StatsRow>

        <QuickActionsGrid>
          <QuickActionCard 
            $gradient="linear-gradient(135deg, #00BC7D 0%, #00E89D 100%)"
            onClick={() => navigate('/vendor/inventory')}
          >
            <QuickActionIcon>
              <IoCubeOutline />
            </QuickActionIcon>
          <QuickActionTitle>{t('Inventory')}</QuickActionTitle>
<QuickActionSubtitle>{t('ManageProductsAndStock')}</QuickActionSubtitle>
          </QuickActionCard>

          <QuickActionCard 
            $gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            onClick={() => navigate('/vendor/orders')}
          >
            <QuickActionIcon>
              <IoCartOutline />
            </QuickActionIcon>
            <QuickActionTitle>{t('Orders')}</QuickActionTitle>
<QuickActionSubtitle>{t('ViewProcessCustomerOrders')}</QuickActionSubtitle>
          </QuickActionCard>

          <QuickActionCard 
            $gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            onClick={() => navigate('/vendor/analytics')}
          >
            <QuickActionIcon>
              <IoAnalyticsOutline />
            </QuickActionIcon>
          <QuickActionTitle>{t('Analytics')}</QuickActionTitle>
<QuickActionSubtitle>{t('TrackSalesPerformance')}</QuickActionSubtitle>
          </QuickActionCard>
        </QuickActionsGrid>

        <OrdersGrid>
          <OrderCard $color="#00BC7D" onClick={() => navigate('/vendor/orders?status=all')}>
            <OrderValue>{totalSales}</OrderValue>
            <OrderLabel>{t('TotalSales')}</OrderLabel>
          </OrderCard>
          <OrderCard $color="#FFA940" onClick={() => navigate('/vendor/orders?status=processing')}>
            <OrderValue>{pendingOrders}</OrderValue>
            <OrderLabel>{t('PendingOrders')}</OrderLabel>
          </OrderCard>
          <OrderCard $color="#52C41A" onClick={() => navigate('/vendor/orders?status=shipped')}>
            <OrderValue>{deliveredOrders}</OrderValue>
            <OrderLabel>{t('DeliveredOrders')}</OrderLabel>
          </OrderCard>
          <OrderCard $color="#FF4D4F" onClick={() => navigate('/vendor/orders?status=cancelled')}>
            <OrderValue>{canceledOrders}</OrderValue>
            <OrderLabel>{t('CanceledOrders')}</OrderLabel>
          </OrderCard>
        </OrdersGrid>

        <ChartSection onClick={() => navigate('/vendor/analytics')}>
          <ChartHeader>
            <ChartTitle>{t('Revenue')}</ChartTitle>
            <ChartValue>{formattedRevenue}</ChartValue>
            <ChartGrowth>
              <GrowthBubble $type={growthState}>
                <IconCircle>
                  {growthState === 'up' ? <IoTrendingUpSharp /> : <IoTrendingDownSharp />}
                </IconCircle>
                <GrowthText>
                  {growthState === 'stable' ? '0.0%' : `${Math.abs(percentageChange)}%`}
                </GrowthText>
              </GrowthBubble>
              <GrowthComparison>From {formattedPrevRevenue}</GrowthComparison>
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
                  <YAxisLabel key={index}>{currency === 'usd' ? '$' : '€'}{label}</YAxisLabel>
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

        <SectionHeader>
          <SectionTitle>{t('TopSellingProducts')}</SectionTitle>
          <ViewAllLink onClick={() => navigate('/vendor/inventory')}>
            {t('ViewAll')}
            <IoChevronForwardOutline />
          </ViewAllLink>
        </SectionHeader>

        {loadingTopProducts ? (
          <LoadingContainer>
            <Spinner />
            <LoadingText>{t('LoadingProducts')}</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorText>{error}</ErrorText>
        ) : topSellingProducts.length === 0 ? (
          <EmptyState>
            <EmptyStateText>{t('NoProductsAvailableYet')}</EmptyStateText>
          </EmptyState>
        ) : (
          <ProductsGrid>
            {topSellingProducts.map((item) => (
              <ProductCard key={item.id} onClick={() => handleViewProduct(item.id)}>
                <ProductImage src={item.image_url} alt={item.name} />
                <ProductInfo>
                  <ProductName>{item.name}</ProductName>
                  <ProductDescription>{item.description}</ProductDescription>
                  <ProductFooter>
                    <ProductPrice>{item.displayPrice || `$${item.price.toFixed(2)}`}</ProductPrice>
                    <ActionButtons onClick={(e) => e.stopPropagation()}>
                      <ViewButton onClick={() => handleViewProduct(item.id)} title="View">
                        <IoEyeOutline size={18} />
                      </ViewButton>
                      <EditButton onClick={(e) => handleEditProduct(e, item.id)} title="Edit">
                        <IoPencilOutline size={16} />
                      </EditButton>
                      <DeleteButton onClick={(e) => handleDeleteProduct(e, item.id)} title="Delete">
                        <IoTrashOutline size={18} />
                      </DeleteButton>
                    </ActionButtons>
                  </ProductFooter>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        )}
      </Container>
    </PageContainer>
  );
};

export default VendorIndex;