import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';
import { IoTrendingUpOutline } from 'react-icons/io5';
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
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;
const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
`;
const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.3px;
`;
const WeekRange = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  font-weight: 500;
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 8px;
`;
const ChartWrapper = styled.div`
  display: flex;
  gap: 16px;
  height: 200px;
  @media (max-width: 768px) {
    height: 160px;
  }
`;
const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 8px 24px 0;
  min-width: 50px;
`;
const YLabel = styled.span`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  text-align: right;
`;
const ChartContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 24px;
  border-left: 1px solid #e8eaed;
  border-bottom: 1px solid #e8eaed;
  position: relative;
`;
const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
  position: relative;
`;
const BarBackground = styled.div`
  width: 100%;
  max-width: 40px;
  height: 100%;
  background: #f0f2f5;
  border-radius: 8px 8px 0 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: #e8eaed;
  }
`;
const Bar = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: ${props => props.height}%;
  background: ${props => props.color};
  border-radius: 8px 8px 0 0;
  transition: height 0.4s ease;
`;
const DayLabel = styled.span`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  font-weight: 600;
  position: absolute;
  bottom: -24px;
`;
const Tooltip = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #1a1a2e;
  }
`;
const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f0f2f5;
  border-top: 3px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 60px auto;
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
const LoadingText = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  text-align: center;
  margin-top: 12px;
`;

const TooltipWrapper = ({ revenue, formatCurrency }) => {
  const [formattedRevenue, setFormattedRevenue] = useState('');
  useEffect(() => {
    const convertRevenue = async () => {
      const converted = await formatCurrency(revenue);
      setFormattedRevenue(converted);
    };
    convertRevenue();
  }, [revenue, formatCurrency]);
  return <Tooltip>{formattedRevenue}</Tooltip>;
};

const WeeklySalesChart = ({ productData }) => {
  const { formatCurrency } = useCurrency();
  const { t, i18n } = useTranslation();
  const days = [
    t('DayMo'), t('DayTu'), t('DayWe'), t('DayTh'),
    t('DayFr'), t('DaySa'), t('DaySu')
  ];
  const [dailyRevenues, setDailyRevenues] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [weekRange, setWeekRange] = useState('');
  const maxChartValue = 1000;

  useEffect(() => {
    const fetchWeeklySales = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const dayOfWeek = today.getDay();
        const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + offsetToMonday);
        monday.setUTCHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setUTCHours(23, 59, 59, 999);

        const locale = i18n.language || 'en-US';
        const options = { month: 'short', day: 'numeric' };
        const mondayStr = monday.toLocaleDateString(locale, options);
        const sundayStr = sunday.toLocaleDateString(locale, { ...options, year: 'numeric' });

        setWeekRange(`${mondayStr} – ${sundayStr}`);

        const { data: orders, error } = await supabase
          .from('orders')
          .select('id, items, status, created_at')
          .eq('vendor_id', productData.vendor_id)
          .eq('status', 'succeeded')
          .gte('created_at', monday.toISOString())
          .lte('created_at', sunday.toISOString());

        if (error) throw error;

        const revenues = [0, 0, 0, 0, 0, 0, 0];
        orders.forEach((order) => {
          const orderDate = new Date(order.created_at);
          const dayIndex = (orderDate.getDay() + 6) % 7;
          order.items.forEach((item) => {
            if (Number(item.id) === Number(productData.id)) {
              const qty = item.quantity || 1;
              const price = item.price || productData.price || 0;
              revenues[dayIndex] += price * qty;
            }
          });
        });
        setDailyRevenues(revenues);
      } catch (err) {
        console.error('Error fetching weekly sales:', err.message);
        setDailyRevenues([0, 0, 0, 0, 0, 0, 0]);
      } finally {
        setLoading(false);
      }
    };
    if (productData?.id && productData?.vendor_id) {
      fetchWeeklySales();
    }
  }, [productData.id, productData.vendor_id, i18n.language]);

  const getBarColor = (revenue) => {
    if (revenue > 750) return 'linear-gradient(180deg, #A9D4FF 0%, #7AB8FF 100%)';
    if (revenue > 500) return 'linear-gradient(180deg, #B6FFD4 0%, #00BC7D 100%)';
    if (revenue > 250) return 'linear-gradient(180deg, #FFDFB2 0%, #FFB800 100%)';
    return 'linear-gradient(180deg, #FFAFA2 0%, #FF6B6B 100%)';
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <TitleWrapper>
            <IconWrapper><IoTrendingUpOutline size={22} /></IconWrapper>
            <Title>{t('WeeklyRevenue')}</Title>
          </TitleWrapper>
        </Header>
        <LoadingSpinner />
        <LoadingText>{t('LoadingSalesData')}</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <IconWrapper><IoTrendingUpOutline size={22} /></IconWrapper>
          <Title>{t('WeeklyRevenue')}</Title>
        </TitleWrapper>
        <WeekRange>{weekRange}</WeekRange>
      </Header>
      <ChartWrapper>
        <YAxis>
          <YLabel>{t('Currency1k')}</YLabel>
          <YLabel>{t('Currency500')}</YLabel>
          <YLabel>{t('Currency0')}</YLabel>
        </YAxis>
        <ChartContainer>
          {dailyRevenues.map((revenue, index) => {
            const barHeight = Math.min((revenue / maxChartValue) * 100, 100);
            return (
              <BarWrapper key={index}>
                {hoveredBar === index && revenue > 0 && (
                  <TooltipWrapper revenue={revenue} formatCurrency={formatCurrency} />
                )}
                <BarBackground
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <Bar height={barHeight} color={getBarColor(revenue)} />
                </BarBackground>
                <DayLabel>{days[index]}</DayLabel>
              </BarWrapper>
            );
          })}
        </ChartContainer>
      </ChartWrapper>
    </Container>
  );
};

export default WeeklySalesChart;