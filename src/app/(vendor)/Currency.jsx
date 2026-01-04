import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import ProfileHeader from '../../components/ProfileHeader';
import CurrencySelector from '../../components/CurrencySelector';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const Container = styled.div`
  padding: 80px 16px 40px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding-top: 100px;
  }
`;

const Currency = () => {
  const { profile } = useAuth();

  return (
    <PageContainer>
      <ProfileHeader profile={profile} />
      <Container>
        <CurrencySelector />
      </Container>
    </PageContainer>
  );
};

export default Currency;
