import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const OptionsContainer = styled.div`
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
const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0 0 20px 0;
  letter-spacing: -0.3px;
`;
const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 10px;
  margin-bottom: 28px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
`;
const SizeButton = styled.button`
  padding: 14px 8px;
  border: 2px solid ${props => props.selected ? '#00BC7D' : props.disabled ? '#f0f2f5' : '#e8eaed'};
  background: ${props => props.selected ? '#00BC7D' : props.disabled ? '#fafbfc' : 'white'};
  color: ${props => props.selected ? 'white' : props.disabled ? '#c4c7cc' : '#1a1a2e'};
  border-radius: 12px;
  font-weight: ${props => props.selected ? '700' : '600'};
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  letter-spacing: 0.3px;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: #00BC7D;
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.2);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  ${props => props.disabled && `
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 10%;
      right: 10%;
      height: 2px;
      background: #c4c7cc;
      transform: translateY(-50%) rotate(-15deg);
    }
  `}
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 6px;
  }
`;
const Divider = styled.div`
  height: 1px;
  background: #f0f2f5;
  margin: 24px 0;
`;
const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`;
const QuantityLabel = styled.span`
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  font-size: 17px;
  letter-spacing: -0.2px;
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;
const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8f9fa;
  padding: 10px 20px;
  border-radius: 16px;
  border: 1px solid #e8eaed;
`;
const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #00BC7D;
  color: white;
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;
  &:hover {
    background: #00A66A;
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
`;
const QuantityDisplay = styled.div`
  font-size: 19px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  min-width: 32px;
  text-align: center;
  @media (max-width: 768px) {
    font-size: 17px;
  }
`;
const LoadingText = styled.p`
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  text-align: center;
  margin: 20px 0;
  font-style: italic;
`;

const ProductOptions = ({
  variations,
  loading,
  showEmptyView,
  selectedSize,
  onSelectSize,
  isShoes,
  quantity,
  onIncrement,
  onDecrement,
}) => {
  const { t } = useTranslation();

  const shoeSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
  const nonShoeSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const allSizes = isShoes ? shoeSizes : nonShoeSizes;

  return (
    <OptionsContainer>
      <SectionTitle>{t('SelectSize')}</SectionTitle>
      {loading ? (
        <LoadingText>{t('LoadingSizeOptions')}</LoadingText>
      ) : (
        <>
          <SizeGrid>
            {allSizes.map((size) => {
              const isAvailable = variations.some((v) => v.size === size);
              return (
                <SizeButton
                  key={size}
                  selected={selectedSize === size}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && onSelectSize(size)}
                  aria-label={`Select ${size} ${isAvailable ? '(available)' : '(unavailable)'} size`}
                >
                  {size}
                </SizeButton>
              );
            })}
          </SizeGrid>
          {showEmptyView && (
            <>
              <Divider />
              <QuantitySection>
                <QuantityLabel>{t('Quantity')}</QuantityLabel>
                <QuantityControl>
                  <QuantityButton onClick={onDecrement} aria-label="Decrease quantity">
                    −
                  </QuantityButton>
                  <QuantityDisplay aria-live="polite">{quantity}</QuantityDisplay>
                  <QuantityButton onClick={onIncrement} aria-label="Increase quantity">
                    +
                  </QuantityButton>
                </QuantityControl>
              </QuantitySection>
            </>
          )}
        </>
      )}
    </OptionsContainer>
  );
};

export default ProductOptions;