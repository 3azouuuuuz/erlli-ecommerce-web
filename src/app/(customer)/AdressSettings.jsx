import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/ShopHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import countries from '../../assets/countries';
import { IoChevronDown, IoClose } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding-top: 80px;
  padding-bottom: 60px;
`;
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;
const Header = styled.div`
  margin-bottom: 32px;
`;
const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #000;
  margin: 0 0 8px 0;
`;
const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #333;
`;
const Input = styled.input`
  width: 100%;
  padding: 16px;
  border-radius: 59px;
  background: #F8F8F8;
  border: 1px solid transparent;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    border-color: #00BC7D;
    background: white;
  }
  &::placeholder {
    color: #999;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
const CountrySelector = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 59px;
  background: #F8F8F8;
  border: 1px solid transparent;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  &:hover {
    border-color: #00BC7D;
    background: white;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
const CountryText = styled.span`
  color: ${props => props.selected ? '#00BC7D' : '#999'};
  font-weight: ${props => props.selected ? '600' : '400'};
`;
const SaveButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  border-radius: 59px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ECFDF5;
`;
const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #333;
  margin: 0;
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.7;
  }
`;
const ModalList = styled.div`
  overflow-y: auto;
  padding: 8px 0;
`;
const CountryItem = styled.button`
  width: 100%;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: none;
  border-bottom: 1px solid #ECFDF5;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  &:hover {
    background: #F8F8F8;
  }
  &:active {
    background: #ECFDF5;
  }
`;
const FlagImage = styled.img`
  width: 24px;
  height: 18px;
  object-fit: cover;
  border-radius: 2px;
`;
const CountryItemText = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #333;
`;

const AddressSettings = () => {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState(profile?.country || '');
  const [streetAddress, setStreetAddress] = useState(profile?.address_line1 || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [postalCode, setPostalCode] = useState(profile?.zip_code || '');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setSelectedCountry(profile.country || '');
      setStreetAddress(profile.address_line1 || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setPostalCode(profile.zip_code || '');
    }
  }, [profile]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!profile?.id) {
      alert(t('ProfileIdMissing'));
      return;
    }
    if (!selectedCountry) {
      alert(t('PleaseSelectCountry'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          country: selectedCountry,
          address_line1: streetAddress,
          city,
          state,
          zip_code: postalCode,
        })
        .eq('id', profile.id);
      if (error) {
        throw error;
      }
      await refreshProfile();
      alert(t('AddressUpdatedSuccessfully'));
      navigate('/Settings');
    } catch (error) {
      console.error('Error saving address:', error);
      alert(t('FailedToSaveAddress'));
    } finally {
      setLoading(false);
    }
  };

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
        <Header>
          <Title>{t('Settings')}</Title>
          <Subtitle>{t('ShippingAddress')}</Subtitle>
        </Header>
        <Form onSubmit={handleSaveAddress}>
          <InputGroup>
            <Label>{t('Country')}</Label>
            <CountrySelector
              type="button"
              onClick={() => setCountryModalVisible(true)}
              disabled={loading}
            >
              <CountryText selected={!!selectedCountry}>
                {selectedCountry || t('ChooseYourCountry')}
              </CountryText>
              <IoChevronDown size={20} color="#333" />
            </CountrySelector>
          </InputGroup>
          <InputGroup>
            <Label>{t('StreetAddress')}</Label>
            <Input
              type="text"
              placeholder={t('Required')}
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              disabled={loading}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>{t('City')}</Label>
            <Input
              type="text"
              placeholder={t('Required')}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>{t('StateProvince')}</Label>
            <Input
              type="text"
              placeholder={t('Required')}
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={loading}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>{t('PostalCode')}</Label>
            <Input
              type="text"
              placeholder={t('Required')}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              disabled={loading}
              required
            />
          </InputGroup>
          <SaveButton type="submit" disabled={loading}>
            {loading ? t('Saving') : t('SaveChanges')}
          </SaveButton>
        </Form>
      </Container>
      {countryModalVisible && (
        <ModalOverlay onClick={() => setCountryModalVisible(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{t('SelectCountry')}</ModalTitle>
              <CloseButton onClick={() => setCountryModalVisible(false)}>
                <IoClose size={28} color="#333" />
              </CloseButton>
            </ModalHeader>
            <ModalList>
              {countries.map((item) => (
                <CountryItem
                  key={item.name}
                  onClick={() => {
                    setSelectedCountry(item.name);
                    setCountryModalVisible(false);
                  }}
                >
                  <FlagImage
                    src={`https://flagcdn.com/w40/${item.isoCode.toLowerCase()}.png`}
                    alt={item.name}
                  />
                  <CountryItemText>{item.name}</CountryItemText>
                </CountryItem>
              ))}
            </ModalList>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default AddressSettings;