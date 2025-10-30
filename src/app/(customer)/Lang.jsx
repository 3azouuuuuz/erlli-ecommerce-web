import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/ShopHeader';
import { useAuth } from '../../contexts/AuthContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding-top: 80px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin-bottom: 24px;
`;

const Lang = () => {
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
        <Title>Choose Language</Title>
        <p>Language selection page coming soon...</p>
      </Container>
    </PageContainer>
  );
};

export default Lang;