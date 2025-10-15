import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoLocationOutline } from 'react-icons/io5';
import { supabase } from '../lib/supabase';

const DeliveryContainer = styled.div`
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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.3px;
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

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionCard = styled.label`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid ${props => (props.selected ? '#00BC7D' : '#e8eaed')};
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => (props.selected ? 'rgba(0, 188, 125, 0.05)' : 'white')};

  &:hover {
    border-color: #00BC7D;
    transform: translateX(4px);
    box-shadow: 0 4px 16px rgba(0, 188, 125, 0.15);
  }

  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`;

const RadioInput = styled.input`
  width: 22px;
  height: 22px;
  accent-color: #00BC7D;
  cursor: pointer;
  flex-shrink: 0;
`;

const OptionIcon = styled.div`
  font-size: 28px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const OptionInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const OptionName = styled.div`
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  font-size: 17px;
  letter-spacing: -0.2px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const OptionDetails = styled.div`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DetailRow = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OptionPrice = styled.div`
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.free ? '#00BC7D' : '#1a1a2e'};
  font-size: 19px;
  text-align: right;
  min-width: 70px;
  letter-spacing: -0.3px;

  @media (max-width: 768px) {
    font-size: 17px;
  }
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f0f2f5;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 40px auto;
  display: block;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin: 32px auto;
  }
`;

const NoOptionsText = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  text-align: center;
  margin: 32px 0;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 15px;
    margin: 24px 0;
  }
`;

const DeliverySection = ({ productId, selectedShippingOption, onShippingOptionChange }) => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        setLoading(true);

        const { data: productDetails } = await supabase
          .from('products')
          .select('weight')
          .eq('id', productId)
          .maybeSingle();

        const productWeight = productDetails?.weight || 0;
        const isHeavyProduct = productWeight > 25;

        const { data: customData } = await supabase
          .from('shipping_options')
          .select('*')
          .eq('product_id', productId)
          .eq('is_admin_default', false);

        let allOptions = [];

        if (customData) {
          allOptions = customData.map(opt => ({
            id: opt.id,
            name: opt.name,
            duration: `${opt.min_days} - ${opt.max_days} Days`,
            returnDuration: opt.return_min_days && opt.return_max_days
              ? `${opt.return_min_days} - ${opt.return_max_days} Days`
              : 'Not Available',
            price: opt.price === 0 ? 'FREE' : `$${opt.price.toFixed(2)}`,
            priceNum: opt.price,
            icon: '🚚',
          }));
        }

        if (!isHeavyProduct) {
          const { data: globalData } = await supabase
            .from('shipping_options')
            .select('*')
            .eq('is_admin_default', true)
            .is('product_id', null);

          if (globalData) {
            const globalOptions = globalData.map(opt => ({
              id: opt.id,
              name: opt.name,
              duration: `${opt.min_days} - ${opt.max_days} Days`,
              returnDuration: opt.return_min_days && opt.return_max_days
                ? `${opt.return_min_days} - ${opt.return_max_days} Days`
                : 'Not Available',
              price: opt.price === 0 ? 'FREE' : `$${opt.price.toFixed(2)}`,
              priceNum: opt.price,
              icon: '🌍',
            }));
            allOptions = [...globalOptions, ...allOptions];
          }
        }

        setShippingOptions(allOptions);
        if (allOptions.length > 0 && !selectedShippingOption) {
          onShippingOptionChange(allOptions[0].id);
        }
      } catch (error) {
        console.error('Error fetching shipping options:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchShippingOptions();
    }
  }, [productId, selectedShippingOption, onShippingOptionChange]);

  return (
    <DeliveryContainer>
      <SectionHeader>
        <IconWrapper>
          <IoLocationOutline size={24} />
        </IconWrapper>
        <SectionTitle>Shipping Options</SectionTitle>
      </SectionHeader>

      {loading ? (
        <LoadingSpinner />
      ) : shippingOptions.length > 0 ? (
        <OptionsList>
          {shippingOptions.map((option) => (
            <OptionCard
              key={option.id}
              selected={selectedShippingOption === option.id}
            >
              <RadioInput
                type="radio"
                checked={selectedShippingOption === option.id}
                onChange={() => onShippingOptionChange(option.id)}
              />
              <OptionIcon>{option.icon}</OptionIcon>
              <OptionInfo>
                <OptionName>{option.name}</OptionName>
                <OptionDetails>
                  <DetailRow>📦 Delivery: {option.duration}</DetailRow>
                  <DetailRow>↩️ Returns: {option.returnDuration}</DetailRow>
                </OptionDetails>
              </OptionInfo>
              <OptionPrice free={option.price === 'FREE'}>
                {option.price}
              </OptionPrice>
            </OptionCard>
          ))}
        </OptionsList>
      ) : (
        <NoOptionsText>No shipping options available</NoOptionsText>
      )}
    </DeliveryContainer>
  );
};

export default DeliverySection;