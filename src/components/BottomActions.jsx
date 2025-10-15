import React from 'react';
import styled from 'styled-components';
import { IoCartOutline, IoFlashOutline, IoHeart, IoHeartOutline } from 'react-icons/io5';

const BottomContainer = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 20px 32px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border-top: 1px solid rgba(0, 188, 125, 0.1);

  @media (max-width: 768px) {
    position: fixed;
    padding: 16px 24px;
  }
`;

const ActionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  flex: 1;
  max-width: 200px;
  padding: 18px 24px;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    font-size: 14px;
    max-width: none;
  }
`;

const LikeButton = styled.button`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1);
    background: white;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const BottomActions = ({ onAddToCart, onBuyNow, isLiked, onLikePress, productData }) => {
  return (
    <BottomContainer>
      <ActionContainer>
        <LikeButton onClick={onLikePress} aria-label={isLiked ? 'Unlike product' : 'Like product'}>
          {isLiked ? (
            <IoHeart size={24} color="#f5576c" />
          ) : (
            <IoHeartOutline size={24} color="#1a1a2e" />
          )}
        </LikeButton>
        <ActionButton
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: 'white',
          }}
          onClick={onAddToCart}
          aria-label="Add to cart"
        >
          <IoCartOutline size={20} />
          Add to Cart
        </ActionButton>
        <ActionButton
          style={{
            background: 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)',
            color: 'white',
          }}
          onClick={onBuyNow}
          aria-label="Buy now"
        >
          <IoFlashOutline size={20} />
          Buy Now
        </ActionButton>
      </ActionContainer>
    </BottomContainer>
  );
};

export default BottomActions;