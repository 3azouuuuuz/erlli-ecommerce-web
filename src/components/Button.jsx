import React from 'react';
import styled from 'styled-components';
import { hp } from '../helpers/common';

const ButtonContainer = styled.button`
  background-color: #00bc7d;
  padding: 12px 24px;
  border-radius: 18px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${hp(2.5)};
  color: white;
  font-family: 'NunitoSans', sans-serif;
  position: relative;
  z-index: 10; /* Above other elements */
  width: 335px; /* Match Login.jsx buttonStyle width */
  height: 61px; /* Match Login.jsx buttonStyle height */
  box-sizing: border-box;
  overflow: hidden; /* Contain clickable area */
  pointer-events: auto; /* Ensure button is clickable */
  /* background-color: rgba(255, 0, 0, 0.2); */ /* Red for debugging */
  ${({ hasShadow }) =>
    hasShadow &&
    `
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `}
  ${({ buttonStyle }) => buttonStyle}
`;

const Text = styled.span`
  color: white;
  font-size: ${hp(2.5)};
  ${({ textStyle }) => textStyle}
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00bc7d;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Button = ({
  title = '',
  onPress = () => {},
  buttonStyle,
  textStyle,
  loading = false,
  hasShadow = true,
}) => {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent click from bubbling
    e.preventDefault(); // Prevent default behavior
    console.log('Button clicked:', e.target); // Debug log
    onPress(e);
  };

  if (loading) {
    return (
      <ButtonContainer buttonStyle={buttonStyle} hasShadow={false} style={{ backgroundColor: 'white' }}>
        <Spinner />
      </ButtonContainer>
    );
  }

  return (
    <ButtonContainer buttonStyle={buttonStyle} hasShadow={hasShadow} onClick={handleClick}>
      <Text textStyle={textStyle}>{title}</Text>
    </ButtonContainer>
  );
};

export default Button;