import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { hp, wp } from './helpers/common'; // Adjusted path assuming helpers is in src/helpers
import icon2 from './assets/images/icon2.png'; // Adjusted path assuming icon2 is in src/assets/images

// Global style to prevent scrolling
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: hidden;
    width: 100%;
    height: 100vh;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 15px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
  height: 100vh;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div`
  position: relative;
  width: 250px;
  height: 250px;
  z-index: 2;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border: 4px solid #00BC7D;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 1.5s infinite ease-out;
  }
  
  &::after {
    animation-delay: 0.75s;
  }
  
  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
    }
  }
`;

const SpinnerImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 240px; /* 5x the original 48px */
  height: auto;
  z-index: 3;
`;

function Loading() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Just set loading to false after delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);
  
  return (
    <>
      <GlobalStyle />
      <Container>
        <Spinner>
          <SpinnerImage src={icon2} alt="Loading Icon" />
        </Spinner>
      </Container>
    </>
  );
}

export default Loading;