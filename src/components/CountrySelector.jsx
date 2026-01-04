import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ShopHeader from './ShopHeader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { IoCheckmarkCircle } from 'react-icons/io5';
import countries from '../assets/countries';
import { useTranslation } from 'react-i18next';
// Group countries by first letter
const groupedCountries = countries
  .sort((a, b) => a.name.localeCompare(b.name))
  .reduce((acc, country) => {
    const firstLetter = country.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(country);
    return acc;
  }, {});

const sections = Object.keys(groupedCountries).map(letter => ({
  title: letter,
  data: groupedCountries[letter],
}));

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
  margin-bottom: 24px;
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

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #000;
  display: block;
  margin-bottom: 8px;
`;

const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px;
  padding-right: 48px;
  border-radius: 9px;
  background: #ECFDF5;
  border: 1px solid transparent;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  outline: none;
  transition: all 0.2s ease;
  color: ${props => props.hasValue ? '#333' : '#999'};

  &:focus {
    border-color: #00BC7D;
    background: #F0FDF9;
  }

  &::placeholder {
    color: ${props => props.isSelected ? '#333' : '#999'};
    font-weight: ${props => props.isSelected ? '500' : '400'};
  }
`;

const CheckmarkIcon = styled(IoCheckmarkCircle)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #00BC7D;
  font-size: 20px;
`;

const CountryListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  padding-right: 8px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #F9F9F9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #00BC7D;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #00A66A;
  }
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeader = styled.div`
  width: 52px;
  height: 27px;
  background: #F9F9F9;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const SectionTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #000;
`;

const CountryItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: none;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    background: #F8F8F8;
    padding-left: 20px;
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

const CountryText = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #000;
`;

const CountrySelector = () => {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(profile?.country || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile?.country) {
      setSelectedCountry(profile.country);
    }
  }, [profile]);

  // Filter sections based on search query
  const filteredSections = searchQuery
    ? sections
        .map(section => ({
          ...section,
          data: section.data.filter(country =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(section => section.data.length > 0)
    : sections;

  const handleCountrySelect = async (country) => {
    if (isUpdating) return;

    setSelectedCountry(country.name);
    setSearchQuery('');
    setIsUpdating(true);

    if (!profile?.id) {
      alert('Profile not available');
      setIsUpdating(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ country: country.name })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      alert('Country updated successfully');
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update country. Please try again.');
    } finally {
      setIsUpdating(false);
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
      </Header>
      <Label>{t('Country')}</Label>
      <SearchInputContainer>
        <SearchInput
          type="text"
          placeholder={selectedCountry || t('ChooseYourCountry')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          hasValue={searchQuery.length > 0}
          isSelected={!!selectedCountry && selectedCountry !== t('ChooseYourCountry')}
        />
        {selectedCountry && selectedCountry !== t('ChooseYourCountry') && !searchQuery && (
          <CheckmarkIcon />
        )}
      </SearchInputContainer>
      <CountryListContainer>
        {filteredSections.map((section) => (
          <SectionContainer key={section.title}>
            <SectionHeader>
              <SectionTitle>{section.title}</SectionTitle>
            </SectionHeader>
            {section.data.map((country) => (
              <CountryItem
                key={country.name}
                onClick={() => handleCountrySelect(country)}
                disabled={isUpdating}
              >
                <FlagImage
                  src={`https://flagcdn.com/w40/${country.isoCode.toLowerCase()}.png`}
                  alt={country.name}
                />
                <CountryText>{country.name}</CountryText>
              </CountryItem>
            ))}
          </SectionContainer>
        ))}
      </CountryListContainer>
    </Container>
  </PageContainer>
);
};

export default CountrySelector;