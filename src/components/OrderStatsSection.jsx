import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';
import { IoCartOutline, IoCashOutline } from 'react-icons/io5';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';
const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    border-color: #00BC7D;
  }
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0 0 20px 0;
  letter-spacing: -0.3px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: 20px;
  border-radius: 14px;
  background: ${props => props.variant === 'orders' ? '#FFF9E6' : '#E6F7FF'};
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.variant === 'orders' ? '#FFB800' : '#00BC7D'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px ${props => props.variant === 'orders' ? 'rgba(255, 184, 0, 0.3)' : 'rgba(0, 188, 125, 0.3)'};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  line-height: 1;
  margin-bottom: 4px;
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f0f2f5;
  border-top: 3px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 20px auto;
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorText = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #D97474;
  text-align: center;
  margin: 20px 0;
`;

const OrderStatsSection = ({ productData }) => {
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0 });
  const [convertedRevenue, setConvertedRevenue] = useState('$0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
const { t } = useTranslation();
  const initialStats = useMemo(() => ({
    totalOrders: productData.total_orders || 0,
    revenue: productData.revenue || 0,
  }), [productData]);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      if (!productData?.id || !productData.vendor_id) {
        if (isMounted) {
          setStats(initialStats);
          const converted = await formatCurrency(initialStats.revenue);
          setConvertedRevenue(converted);
          setIsLoading(false);
        }
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, items, status')
          .eq('vendor_id', productData.vendor_id)
          .eq('status', 'succeeded');
        if (ordersError) throw ordersError;
        let orderCount = 0;
        let totalRevenue = 0;
        orders.forEach(order => {
          const hasProduct = order.items.some(item => Number(item.id) === Number(productData.id));
          if (hasProduct) {
            orderCount += 1;
            order.items.forEach(item => {
              if (Number(item.id) === Number(productData.id)) {
                const qty = item.quantity || 1;
                const price = item.price || productData.price || 0;
                totalRevenue += price * qty;
              }
            });
          }
        });
        if (isMounted) {
          setStats({ totalOrders: orderCount, revenue: totalRevenue });
          const converted = await formatCurrency(totalRevenue);
          setConvertedRevenue(converted);
        }
      } catch (err) {
        console.error('Failed to fetch product stats:', err.message);
        if (isMounted) {
          setError('Failed to load order stats');
          setStats(initialStats);
          const converted = await formatCurrency(initialStats.revenue);
          setConvertedRevenue(converted);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, [productData.id, productData.vendor_id, initialStats, formatCurrency]);

  if (isLoading) {
    return (
      <Container>
        <SectionTitle>Order Statistics</SectionTitle>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
  return (
    <Container>
      <SectionTitle>{t('OrderStatistics')}</SectionTitle>
      <ErrorText>{error}</ErrorText>
    </Container>
  );
  }

 return (
  <Container>
    <SectionTitle>{t('OrderStatistics')}</SectionTitle>
    <StatsGrid>
      <StatCard variant="orders">
        <IconWrapper variant="orders">
          <IoCartOutline size={24} />
        </IconWrapper>
        <StatContent>
          <StatValue>{stats.totalOrders}</StatValue>
          <StatLabel>{t('TotalOrders')}</StatLabel>
        </StatContent>
      </StatCard>
      <StatCard variant="revenue">
        <IconWrapper variant="revenue">
          <IoCashOutline size={24} />
        </IconWrapper>
        <StatContent>
          <StatValue>{convertedRevenue}</StatValue>
          <StatLabel>{t('Revenue')}</StatLabel>
        </StatContent>
      </StatCard>
    </StatsGrid>
  </Container>
);
};

export default OrderStatsSection;