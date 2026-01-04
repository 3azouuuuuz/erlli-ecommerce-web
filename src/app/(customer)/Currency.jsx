// REPLACE the entire file with:
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/ShopHeader';
import { useAuth } from '../../contexts/AuthContext';
import CurrencySelector from '../../components/CurrencySelector';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding-top: 80px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const Currency = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  return (
    <PageContainer>
      <ShopHeader
        isConnected={!!user}
        avatarUrl={profile?.avatar_url}
        userRole={profile?.role}
        userEmail={profile?.email || user?.email}
        onLogout={logout}
      />
      <Container>
        <CurrencySelector />
      </Container>
    </PageContainer>
  );
};

export default Currency;