import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const BannerContainer = styled.div`
  width: 100%;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const BannerWrapper = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  background: #FFC107;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const BannerSlider = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
  transform: translateX(${props => -props.$currentIndex * 100}%);
`;

const BannerImageWrapper = styled.div`
  min-width: 100%;
  height: 100%;
  position: relative;
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const Dot = styled.div`
  width: ${props => props.active ? '24px' : '10px'};
  height: 10px;
  border-radius: 5px;
  background-color: ${props => props.active ? '#00BC7D' : '#C4C4C4'};
  opacity: ${props => props.active ? '1' : '0.6'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? '0 2px 8px rgba(0, 188, 125, 0.4)' : 'none'};
  cursor: pointer;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const BannerView = ({ flashSaleId }) => {
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollRef = useRef(null);

  // Fetch banner for the active flash sale
  useEffect(() => {
    if (!flashSaleId) {
      setImageUrls([]);
      return;
    }

    const fetchBanner = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('banners')
          .select('image_urls')
          .eq('flash_sale_id', flashSaleId)
          .single();

        if (error) {
          console.error('Error fetching banner:', error);
          return;
        }

        setImageUrls(data?.image_urls || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [flashSaleId]);

  // Auto-scroll banners when multiple exist
  useEffect(() => {
    if (imageUrls.length <= 1) return;

    autoScrollRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % imageUrls.length);
    }, 3000); // Auto-scroll every 3 seconds

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [imageUrls]);

  // Handle dot click to manually change slide
  const handleDotClick = (index) => {
    setCurrentIndex(index);
    // Reset auto-scroll timer
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    // Restart auto-scroll after manual selection
    if (imageUrls.length > 1) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % imageUrls.length);
      }, 3000);
    }
  };

  // Handle banner press
  const handleBannerPress = () => {
    navigate('/FlashSale');
  };

  // Render loading state
  if (loading) {
    return (
      <BannerContainer>
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      </BannerContainer>
    );
  }

  // Render nothing if no banners
  if (imageUrls.length === 0) return null;

  return (
    <BannerContainer>
      <BannerWrapper onClick={handleBannerPress}>
        <BannerSlider currentIndex={currentIndex}>
          {imageUrls.map((imageUrl, index) => (
            <BannerImageWrapper key={`banner-${index}`}>
              <BannerImage src={imageUrl} alt={`Banner ${index + 1}`} />
            </BannerImageWrapper>
          ))}
        </BannerSlider>
      </BannerWrapper>
      
      {/* Pagination Dots */}
      {imageUrls.length > 1 && (
        <Pagination>
          {imageUrls.map((_, index) => (
            <Dot 
              key={index} 
              active={currentIndex === index}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </Pagination>
      )}
    </BannerContainer>
  );
};

export default BannerView;