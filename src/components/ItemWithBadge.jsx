import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 0 10px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const ItemContainer = styled.div`
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
  
  ${ItemContainer}:hover & {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ItemImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SaleBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 60px;
  height: 28px;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 12px;
  background: linear-gradient(135deg, #FF5790 0%, #F81140 100%);
  box-shadow: 0 2px 8px rgba(248, 17, 64, 0.3);
  
  @media (max-width: 480px) {
    min-width: 50px;
    height: 24px;
    padding: 0 10px;
  }
`;

const SaleText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #FFFFFF;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  letter-spacing: 0.3px;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const ItemDetails = styled.div`
  padding: 8px 4px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemDescription = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 36px;
  
  @media (max-width: 480px) {
    font-size: 12px;
    min-height: 34px;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const CurrentPrice = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #00BC7D;
  font-family: 'Raleway', sans-serif;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const OriginalPrice = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #999;
  font-family: 'Raleway', sans-serif;
  text-decoration: line-through;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  grid-column: 1 / -1;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D0FAE5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  grid-column: 1 / -1;
`;

const ErrorText = styled.div`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
`;

const ItemWithBadge = ({ onPress }) => {
  const { t } = useTranslation();
  const [flashSaleItems, setFlashSaleItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formatCurrency } = useCurrency();

  const fetchFlashSaleItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: flashSaleData, error: flashSaleError } = await supabase
        .from('flash_sales')
        .select('id')
        .lte('start_time', 'now()')
        .gte('end_time', 'now()')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (flashSaleError || !flashSaleData) {
        throw new Error(t('NoActiveFlashSaleFound') || 'No active flash sale event found');
      }

      const { data, error } = await supabase
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
        .eq('flash_sale_id', flashSaleData.id)
        .limit(6);

      if (error) throw error;

      const formattedItems = await Promise.all(
        data.map(async (item) => {
          const originalPrice = item.products.price;
          const discountedPrice = originalPrice * (1 - item.discount_percentage / 100);
          
          const displayDiscountedPrice = await formatCurrency(discountedPrice);
          const displayOriginalPrice = await formatCurrency(originalPrice);

          return {
            id: item.products.id,
            image_url: item.products.image_url,
            description: item.products.description,
            price: originalPrice,
            discountedPrice: discountedPrice,
            displayDiscountedPrice,
            displayOriginalPrice,
            salePercentage: `${item.discount_percentage}% ${t('OFF') || 'OFF'}`,
            sale_percentage: item.discount_percentage,
          };
        })
      );

      setFlashSaleItems(formattedItems);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching flash sale items:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formatCurrency, t]);

  useEffect(() => {
    fetchFlashSaleItems();
  }, [fetchFlashSaleItems]);

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  if (flashSaleItems.length === 0) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>{t('NoFlashSaleItemsAvailable') || 'No flash sale items available'}</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      {flashSaleItems.map((item) => (
        <ItemContainer key={item.id} onClick={() => onPress && onPress(item)}>
          <ImageContainer>
            <ItemImage src={item.image_url} alt={item.description} />
            <SaleBadge>
              <SaleText>{item.salePercentage}</SaleText>
            </SaleBadge>
          </ImageContainer>
          <ItemDetails>
            <ItemDescription>{item.description}</ItemDescription>
            <PriceContainer>
              <CurrentPrice>{item.displayDiscountedPrice}</CurrentPrice>
              <OriginalPrice>{item.displayOriginalPrice}</OriginalPrice>
            </PriceContainer>
          </ItemDetails>
        </ItemContainer>
      ))}
    </Container>
  );
};

export default ItemWithBadge;