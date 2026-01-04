import React from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
  }
`;
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
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
const SectionTitle = styled.h3`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;
const SubSection = styled.div`
  margin-bottom: 24px;
  &:last-child {
    margin-bottom: 0;
  }
`;
const SubTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0 0 16px 0;
`;
const VariationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;
const VariationTag = styled.span`
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  font-weight: 500;
  border: 1px solid #e8eaed;
`;
const ImagesGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;
const VariationImageWrapper = styled.div`
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
  }
`;
const VariationImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid ${props => props.selected ? '#00BC7D' : 'transparent'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  &:hover {
    border-color: #00BC7D;
    box-shadow: 0 4px 16px rgba(0, 188, 125, 0.3);
  }
  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
  }
`;
const Checkmark = styled.div`
  position: absolute;
  bottom: 6px;
  left: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00BC7D;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.4);
`;
const SizeGrid = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
const SizeButton = styled.button`
  min-width: 50px;
  padding: 10px 16px;
  border: 2px solid ${props => props.selected ? '#00BC7D' : props.disabled ? '#f0f2f5' : '#e8eaed'};
  background: ${props => props.selected ? '#00BC7D' : props.disabled ? '#fafbfc' : 'white'};
  color: ${props => props.selected ? 'white' : props.disabled ? '#c4c7cc' : '#1a1a2e'};
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  &:hover:not(:disabled) {
    border-color: #00BC7D;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.2);
  }
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
const NoDataText = styled.p`
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  text-align: center;
  margin: 20px 0;
  font-style: italic;
`;

const VariationsSection = ({
  variations,
  loading,
  showEmptyView,
  selectedVariation,
  onSelectVariation,
  selectedSize,
  onSelectSize,
  onVariationImagePress,
  selectedVariationId,
  isShoes,
}) => {
  const { t } = useTranslation();

  const uniqueColorVariations = [];
  const seenColors = new Set();
  for (const variation of variations) {
    if (!seenColors.has(variation.color)) {
      seenColors.add(variation.color);
      uniqueColorVariations.push(variation);
    }
  }

  const shoeSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
  const nonShoeSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const allSizes = isShoes ? shoeSizes : nonShoeSizes;

  const selectedVariationData = selectedVariationId
    ? variations.find((v) => v.id === selectedVariationId)
    : uniqueColorVariations[0];

  if (loading) {
    return (
      <Container>
        <SectionHeader>
          <IconWrapper><IoColorPaletteOutline size={22} /></IconWrapper>
          <SectionTitle>{t('Variations')}</SectionTitle>
        </SectionHeader>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <SectionHeader>
        <IconWrapper><IoColorPaletteOutline size={22} /></IconWrapper>
        <SectionTitle>{t('Variations')}</SectionTitle>
      </SectionHeader>
      {!showEmptyView ? (
        <>
          {uniqueColorVariations.length > 0 ? (
            <>
              <SubSection>
                <SubTitle>{t('CurrentSelection')}</SubTitle>
                <VariationRow>
                  {selectedVariationData && (
                    <VariationTag>{selectedVariationData.color}</VariationTag>
                  )}
                </VariationRow>
              </SubSection>
              <SubSection>
                <SubTitle>{t('AvailableColors')}</SubTitle>
                <ImagesGrid>
                  {uniqueColorVariations.map((item) => (
                    <VariationImageWrapper
                      key={item.id}
                      onClick={() => onVariationImagePress && onVariationImagePress(item.id)}
                    >
                      <VariationImage
                        src={item.img}
                        alt={item.color}
                        selected={selectedVariationId === item.id}
                      />
                      {selectedVariationId === item.id && (
                        <Checkmark><FaCheck size={10} /></Checkmark>
                      )}
                    </VariationImageWrapper>
                  ))}
                </ImagesGrid>
              </SubSection>
            </>
          ) : (
            <NoDataText>{t('NoVariationsAvailable')}</NoDataText>
          )}
        </>
      ) : (
        <>
          <SubSection>
            <SubTitle>{t('ColorOptions')}</SubTitle>
            {uniqueColorVariations.length > 0 ? (
              <ImagesGrid>
                {uniqueColorVariations.map((item) => (
                  <VariationImageWrapper
                    key={item.id}
                    onClick={() => {
                      onSelectVariation(item.id);
                      if (onVariationImagePress) onVariationImagePress(item.id);
                    }}
                  >
                    <VariationImage
                      src={item.img}
                      alt={item.color}
                      selected={selectedVariation === item.id}
                    />
                    {selectedVariation === item.id && (
                      <Checkmark><FaCheck size={10} /></Checkmark>
                    )}
                  </VariationImageWrapper>
                ))}
              </ImagesGrid>
            ) : (
              <NoDataText>{t('NoColorOptionsAvailable')}</NoDataText>
            )}
          </SubSection>
          <SubSection>
            <SubTitle>{t('SelectSize')}</SubTitle>
            <SizeGrid>
              {allSizes.map((size) => {
                const isAvailable = isShoes
                  ? variations.length === 0 || variations.some((v) => v.size === size || !v.size)
                  : variations.some((v) => v.size === size);
                return (
                  <SizeButton
                    key={size}
                    selected={selectedSize === size}
                    disabled={!isAvailable}
                    onClick={() => isAvailable && onSelectSize(size)}
                  >
                    {size}
                  </SizeButton>
                );
              })}
            </SizeGrid>
          </SubSection>
        </>
      )}
    </Container>
  );
};

export default VariationsSection;