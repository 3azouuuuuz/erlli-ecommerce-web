import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

const NavigateButton = styled.button`
  background-color: #007aff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  &:hover {
    background-color: #005bb5;
  }
`;

const SignupButton = styled.button`
  background-color: #00BC7D;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background-color: #00965e;
  }
`;

function ShopIndex() {
  const navigate = useNavigate();
  return (
    <Container>
      <Title>Erlli Shop</Title>
      <NavigateButton onClick={() => navigate('/auth/login')}>
        Go to Login
      </NavigateButton>
      <SignupButton onClick={() => navigate('/auth/signup')}>
        Go to Signup
      </SignupButton>
    </Container>
  );
}

export default ShopIndex;