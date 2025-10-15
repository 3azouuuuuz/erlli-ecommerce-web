import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';

const DetailsContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    border-color: #00BC7D;
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const ProductPrice = styled.span`
  font-size: 42px;
  font-weight: 900;
  font-family: 'Raleway', sans-serif;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1.5px;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const RealPrice = styled.span`
  font-size: 22px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #999;
  text-decoration: line-through;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const DiscountBadge = styled.span`
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 12px;
  }
`;

const DescriptionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0 0 16px 0;
  letter-spacing: -0.3px;
`;

const ProductDescription = styled.div`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  line-height: 1.8;
  margin: 0;

  p {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  @media (max-width: 768px) {
    font-size: 15px;
    line-height: 1.7;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #f0f2f5;
  border-top: 3px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProductDetails = ({ productData }) => {
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFlashSale = async () => {
      setIsLoading(true);

      if (productData.sale_percentage && productData.sale_percentage > 0) {
        const discount = productData.sale_percentage;
        const realPrice = productData.price;
        const discounted = realPrice * (1 - discount / 100);
        setDiscountedPrice(discounted);
        setDiscountPercentage(discount);
        setIsLoading(false);
        return;
      }

      try {
        const currentTime = new Date().toISOString();
        const { data: flashSales, error: flashSaleError } = await supabase
          .from('flash_sales')
          .select('id, start_time, end_time')
          .lte('start_time', currentTime)
          .gte('end_time', currentTime);

        if (flashSaleError) {
          console.error('Flash sale query error:', flashSaleError);
          setIsLoading(false);
          return;
        }

        if (flashSales && flashSales.length > 0) {
          const flashSaleIds = flashSales.map(sale => sale.id);
          const { data: flashSaleProduct, error: flashSaleProductError } = await supabase
            .from('flash_sale_products')
            .select('discount_percentage')
            .in('flash_sale_id', flashSaleIds)
            .eq('product_id', productData.id)
            .single();

          if (flashSaleProductError && flashSaleProductError.code !== 'PGRST116') {
            console.error('Flash sale product error:', flashSaleProductError);
          }

          if (flashSaleProduct) {
            const discount = flashSaleProduct.discount_percentage;
            const realPrice = productData.price;
            const discounted = realPrice * (1 - discount / 100);
            setDiscountedPrice(discounted);
            setDiscountPercentage(discount);
          }
        }
      } catch (error) {
        console.error('Error checking flash sale:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (productData.id) {
      checkFlashSale();
    }
  }, [productData.id, productData.price, productData.sale_percentage]);

  const hasDiscount = discountedPrice !== null;

  if (isLoading) {
    return (
      <DetailsContainer>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </DetailsContainer>
    );
  }

  return (
    <DetailsContainer>
      <PriceSection>
        {hasDiscount ? (
          <>
            <ProductPrice>${discountedPrice.toFixed(2)}</ProductPrice>
            <RealPrice>${productData.price.toFixed(2)}</RealPrice>
            <DiscountBadge>-{discountPercentage}%</DiscountBadge>
          </>
        ) : (
          <ProductPrice>${productData.price.toFixed(2)}</ProductPrice>
        )}
      </PriceSection>

      <DescriptionTitle>Product Description</DescriptionTitle>
      <ProductDescription>
        {productData.description ? (
          <p dangerouslySetInnerHTML={{ __html: productData.description.replace(/\n/g, '<br />') }} />
        ) : (
          <p>No description available.</p>
        )}
      </ProductDescription>
    </DetailsContainer>
  );
};

export default ProductDetails;