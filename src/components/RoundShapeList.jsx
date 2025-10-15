import React from 'react';
import styled from 'styled-components';
import { IoCheckmarkCircle } from 'react-icons/io5';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: ${props => props.selectable ? 'pointer' : 'default'};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: ${props => props.selectable ? 'translateY(-2px)' : 'none'};
  }
`;

const ProfileImgContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid white;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 8px;
  position: relative;
  transition: all 0.2s ease;
  
  ${Container}:hover & {
    box-shadow: ${props => props.selectable ? '0 6px 12px rgba(0, 0, 0, 0.15)' : '0 4px 8px rgba(0, 0, 0, 0.1)'};
  }
`;

const ProfileImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const TickContainer = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const CheckIcon = styled(IoCheckmarkCircle)`
  font-size: 24px;
  color: #00BC7D;
`;

const Text = styled.span`
  margin-top: 5px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  color: #202020;
`;

const RoundShapeList = ({ text, imageSource, selectable = false, isSelected = false, onSelect }) => {
  const handlePress = () => {
    if (selectable && onSelect) {
      onSelect();
    }
  };

  return (
    <Container selectable={selectable} onClick={handlePress}>
      <ProfileImgContainer selectable={selectable}>
        <ProfileImg src={imageSource?.uri || imageSource} alt={text || 'Subcategory'} />
        {selectable && isSelected && (
          <TickContainer>
            <CheckIcon />
          </TickContainer>
        )}
      </ProfileImgContainer>
      {text && <Text>{text}</Text>}
    </Container>
  );
};

export default RoundShapeList;