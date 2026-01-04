import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoChevronForward } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;
const Container = styled.div`
  padding: 80px 0 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;
const ContentWrapper = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 60px;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 25px;
    padding: 0 16px;
  }
`;
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;
const Header = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 40px;
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;
const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  margin: 0;
  color: #000;
`;
const SectionTitle = styled.h2`
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 30px;
  letter-spacing: -0.21px;
  margin: 0 0 20px 0;
  color: #000;
  padding-bottom: 12px;
  border-bottom: 2px solid #00BC7D;
`;
const SettingsBox = styled.button`
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
  border-radius: 8px;
  &:hover {
    background: rgba(0, 188, 125, 0.05);
    border-color: rgba(0, 188, 125, 0.2);
    transform: translateX(4px);
  }
  &:active {
    background: rgba(0, 188, 125, 0.08);
  }
`;
const SettingsLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Nunito Sans', sans-serif;
  line-height: 21px;
  color: ${props => props.danger ? '#D97474' : '#000000'};
`;
const RightContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const CountryText = styled.span`
  font-size: 14px;
  font-weight: 500;
  font-family: 'Nunito Sans', sans-serif;
  color: #666;
`;
const ArrowIcon = styled(IoChevronForward)`
  font-size: 20px;
  color: #666;
`;
const DeleteButton = styled.button`
  background: transparent;
  border: none;
  padding: 20px 12px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  text-align: left;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(217, 116, 116, 0.05);
    transform: translateX(4px);
  }
`;
const DeleteText = styled.span`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Nunito Sans', sans-serif;
  line-height: 21px;
  color: #D97474;
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
const ModalContainer = styled.div`
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 19px;
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000;
  text-align: center;
  line-height: 20px;
  margin: 0 0 8px 0;
`;
const ModalSubtitle = styled.p`
  font-size: 13px;
  font-weight: 600;
  font-family: 'Nunito Sans', sans-serif;
  color: #000000;
  text-align: center;
  margin: 0 0 16px 0;
`;
const ModalInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  background: #F9F9F9;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 16px;
  font-family: 'Nunito Sans', sans-serif;
  margin-bottom: 16px;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    border-color: #00BC7D;
    background: white;
  }
  &::placeholder {
    color: #666;
  }
`;
const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 12px;
`;
const ModalButton = styled.button`
  padding: 12px 24px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  font-family: 'Nunito Sans', sans-serif;
  line-height: 25px;
  text-align: center;
  transition: all 0.2s ease;
  flex: 1;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
const CancelButton = styled(ModalButton)`
  background: #E7E8EB;
  color: #000;
  &:hover {
    background: #D8D9DC;
  }
`;
const DeleteModalButton = styled(ModalButton)`
  background: #D97474;
  color: #FFFFFF;
  &:hover {
    background: #C96565;
  }
  &:disabled {
    background: #F0F0F0;
    color: #999;
    &:hover {
      background: #F0F0F0;
      transform: none;
      box-shadow: none;
    }
  }
`;
const Spacer = styled.div`
  height: 30px;
`;

const Settings = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { t } = useTranslation();
  const [country, setCountry] = useState(profile?.country || t('ChooseYourCountry'));
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  useEffect(() => {
    const fetchCountry = async () => {
      if (profile?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('country')
          .eq('id', profile.id)
          .single();
        if (data && !error) {
          setCountry(data.country || t('ChooseYourCountry'));
        } else if (error) {
          console.error('Error fetching country:', error.message);
        }
      }
    };
    fetchCountry();
  }, [profile?.id, t]);

  const handleSignOut = async () => {
    try {
      await logout();
      console.log('User signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
      alert(t('FailedToSignOut'));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      alert(t('TypeDeleteToConfirm'));
      return;
    }
    try {
      await supabase.from('pins').delete().eq('user_id', profile.id);
      await supabase.from('profiles').delete().eq('id', profile.id);
      await supabase.auth.admin.deleteUser(profile.id);
      await logout();
      console.log('Account deleted successfully');
      navigate('/welcome');
      alert(t('AccountDeletedSuccessfully'));
    } catch (error) {
      console.error('Error deleting account:', error.message);
      alert(t('FailedToDeleteAccount'));
    } finally {
      setIsDeleteModalVisible(false);
      setDeleteInput('');
    }
  };

  return (
    <PageContainer>
      <Container>
        <Header>
          <PageTitle>{t('Settings')}</PageTitle>
        </Header>
        <ContentWrapper>
          <Section>
            <SectionTitle>{t('Personal')}</SectionTitle>
            <SettingsBox onClick={() => navigate('/ProfileSettings')}>
              <SettingsLabel>{t('Profile')}</SettingsLabel>
              <ArrowIcon />
            </SettingsBox>
            <SettingsBox onClick={() => navigate('/SecuritySettings')}>
              <SettingsLabel>{t('Security')}</SettingsLabel>
              <ArrowIcon />
            </SettingsBox>
            <SettingsBox onClick={() => navigate('/AdressSettings')}>
              <SettingsLabel>{t('ShippingAddress')}</SettingsLabel>
              <ArrowIcon />
            </SettingsBox>
            <SettingsBox onClick={() => navigate('/PaymentMethods')}>
              <SettingsLabel>{t('PaymentMethods')}</SettingsLabel>
              <ArrowIcon />
            </SettingsBox>
          </Section>
          <Section>
            <SectionTitle>{t('Shop')}</SectionTitle>
            <SettingsBox onClick={() => navigate('/Country')}>
              <SettingsLabel>{t('Country')}</SettingsLabel>
              <RightContent>
                <CountryText>{country}</CountryText>
                <ArrowIcon />
              </RightContent>
            </SettingsBox>
            <SettingsBox onClick={() => navigate('/Currency')}>
              <SettingsLabel>{t('Currency')}</SettingsLabel>
              <ArrowIcon />
            </SettingsBox>
          </Section>
          <Section>
            <SectionTitle>{t('Account')}</SectionTitle>
            <SettingsBox onClick={() => navigate('/Lang')}>
              <SettingsLabel>{t('Language')}</SettingsLabel>
              <ArrowIcon />
            </SettingsBox>
            <SettingsBox onClick={() => navigate('/About')}>
              <SettingsLabel>{t('About')}</SettingsLabel>
              <ArrowIcon />
            </SettingsBox>
            <SettingsBox onClick={handleSignOut}>
              <SettingsLabel danger>{t('SignOut')}</SettingsLabel>
              <ArrowIcon />
            </SettingsBox>
            <DeleteButton onClick={() => setIsDeleteModalVisible(true)}>
              <DeleteText>{t('DeleteMyAccount')}</DeleteText>
            </DeleteButton>
          </Section>
        </ContentWrapper>
        <Spacer />
      </Container>
      {isDeleteModalVisible && (
        <ModalOverlay onClick={() => setIsDeleteModalVisible(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{t('DeleteConfirmation')}</ModalTitle>
            <ModalSubtitle>{t('TypeDeleteToConfirm')}</ModalSubtitle>
            <ModalInput
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={t('TypeDELETE')}
            />
            <ModalButtonContainer>
              <CancelButton onClick={() => setIsDeleteModalVisible(false)}>
                {t('Cancel')}
              </CancelButton>
              <DeleteModalButton
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE'}
              >
                {t('Delete')}
              </DeleteModalButton>
            </ModalButtonContainer>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Settings;