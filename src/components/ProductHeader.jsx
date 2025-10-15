import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { IoTrash, IoPencil, IoHeart, IoHeartOutline, IoChevronBack, IoChevronForward, IoCartOutline, IoFlashOutline } from 'react-icons/io5';
import { FaCheck } from 'react-icons/fa';

const ProductHeaderContainer = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
`;

const ImageSection = styled.div`
  position: relative;
  background: #f8f9fa;
`;

const SliderWrapper = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  cursor: pointer;

  @media (max-width: 768px) {
    aspect-ratio: 4 / 3;
  }
`;

const SliderTrack = styled.div`
  display: flex;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ImageSlide = styled.div`
  flex: 0 0 100%;
  height: 100%;
`;

const MainProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const NavigationArrows = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  pointer-events: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ArrowButton = styled.button`
  pointer-events: all;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a2e;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background: white;
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10;

  @media (max-width: 768px) {
    top: 12px;
    right: 12px;
  }
`;

const ActionButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    background: white;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const ImagePagination = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);

  @media (min-width: 769px) {
    display: none;
  }
`;

const PaginationDot = styled.div`
  width: ${props => (props.active ? '24px' : '8px')};
  height: 8px;
  border-radius: 4px;
  background: ${props => (props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
`;

const ContentSection = styled.div`
  padding: 32px;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const VariationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
  margin-bottom: 24px;
`;

const VariationTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.3px;
`;

const ColorSwatches = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ColorSwatch = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  cursor: pointer;
  border: 3px solid ${props => (props.selected ? '#00BC7D' : '#e8eaed')};
  background-color: ${props => props.color || '#ccc'};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    border-color: #00BC7D;
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const Checkmark = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00BC7D;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.4);
`;

const ActionsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PrimaryButton = styled.button`
  padding: 18px 24px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)' 
    : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'};
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 0.3px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => props.primary 
      ? 'rgba(0, 188, 125, 0.4)' 
      : 'rgba(26, 26, 46, 0.4)'};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    font-size: 15px;
  }
`;

const ProductHeader = ({
  productData,
  variations,
  selectedVariationId,
  profile,
  isVendorView = false,
  isLiked,
  onLikePress,
  onSelectVariation,
  onAddToCart,
  onBuyNow,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const images = variations
    .map((variation, index) => ({
      id: `variation_${index}`,
      uri: variation.img,
      variationId: variation.id,
    }))
    .filter(image => image.uri);

  const fallbackImage = images.length === 0 
    ? [{ id: 'main', uri: productData.image_url, variationId: null }] 
    : images;

  const totalImages = fallbackImage.length;

  const uniqueColorVariations = [];
  const seenColors = new Set();
  for (const variation of variations) {
    if (!seenColors.has(variation.color)) {
      seenColors.add(variation.color);
      uniqueColorVariations.push(variation);
    }
  }

  useEffect(() => {
    if (selectedVariationId !== null) {
      const targetImage = fallbackImage.find(image => image.variationId === selectedVariationId);
      if (targetImage) {
        const targetIndex = fallbackImage.indexOf(targetImage);
        setCurrentIndex(targetIndex);
        if (sliderRef.current) {
          sliderRef.current.style.transform = `translateX(-${targetIndex * 100}%)`;
        }
      }
    }
  }, [selectedVariationId, fallbackImage]);

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    setCurrentIndex(newIndex);
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
    }
  };

  const handleNext = () => {
    const newIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
    }
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
  };

  const handleColorSelect = (variation) => {
    onSelectVariation(variation.id);
  };

  const handleEditProduct = () => {
    navigate({
      pathname: '/EditProduct',
      search: `?product=${encodeURIComponent(JSON.stringify(productData))}`,
    });
  };

  const handleDeleteProduct = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productData.description}"? This action cannot be undone.`
    );
    if (confirmed) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productData.id)
          .eq('vendor_id', profile.id);

        if (error) throw error;
        window.alert('Product deleted successfully.');
        navigate('/Inventory');
      } catch (error) {
        console.error('Error deleting product:', error);
        window.alert('Failed to delete product.');
      }
    }
  };

  const isVendor = profile?.id === productData.vendor_id;

  return (
    <ProductHeaderContainer>
      <ImageSection>
        <SliderWrapper>
          <SliderTrack ref={sliderRef}>
            {fallbackImage.map((item) => (
              <ImageSlide key={item.id}>
                <MainProductImage src={item.uri} alt="Product" />
              </ImageSlide>
            ))}
          </SliderTrack>

          {totalImages > 1 && (
            <>
              <NavigationArrows>
                <ArrowButton onClick={handlePrev}>
                  <IoChevronBack size={24} />
                </ArrowButton>
                <ArrowButton onClick={handleNext}>
                  <IoChevronForward size={24} />
                </ArrowButton>
              </NavigationArrows>

              <ImagePagination>
                {fallbackImage.map((_, index) => (
                  <PaginationDot
                    key={index}
                    active={index === currentIndex}
                    onClick={() => handleDotClick(index)}
                  />
                ))}
              </ImagePagination>
            </>
          )}

          <ActionButtons>
            <ActionButton onClick={onLikePress}>
              {isLiked ? (
                <IoHeart size={24} color="#f5576c" />
              ) : (
                <IoHeartOutline size={24} color="#1a1a2e" />
              )}
            </ActionButton>
            {isVendor && isVendorView && (
              <>
                <ActionButton onClick={handleDeleteProduct}>
                  <IoTrash size={20} color="#D97474" />
                </ActionButton>
                <ActionButton onClick={handleEditProduct}>
                  <IoPencil size={18} color="#00BC7D" />
                </ActionButton>
              </>
            )}
          </ActionButtons>
        </SliderWrapper>
      </ImageSection>

      <ContentSection>
        {uniqueColorVariations.length > 0 && (
          <VariationSection>
            <VariationTitle>Available Colors</VariationTitle>
            <ColorSwatches>
              {uniqueColorVariations.map((item) => (
                <ColorSwatch
                  key={item.id}
                  color={item.color}
                  selected={selectedVariationId === item.id}
                  onClick={() => handleColorSelect(item)}
                >
                  {selectedVariationId === item.id && (
                    <Checkmark>
                      <FaCheck size={10} />
                    </Checkmark>
                  )}
                </ColorSwatch>
              ))}
            </ColorSwatches>
          </VariationSection>
        )}

        <ActionsSection>
          <PrimaryButton onClick={onAddToCart}>
            <IoCartOutline size={22} />
            Add to Cart
          </PrimaryButton>
          <PrimaryButton primary onClick={onBuyNow}>
            <IoFlashOutline size={22} />
            Buy Now
          </PrimaryButton>
        </ActionsSection>
      </ContentSection>
    </ProductHeaderContainer>
  );
};

export default ProductHeader;