import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import VendorHeader from '../../components/VendorHeader';
import { useAuth } from '../../contexts/AuthContext';
import { setLanguage } from '../../../utils/i18n';
const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FA;
`;

const Container = styled.div`
  padding: 80px 16px 40px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  margin: 0 0 8px 0;
  color: #202020;
`;

const Subtitle = styled.p`
  font-size: 13px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  line-height: 20px;
  color: #666;
  margin: 24px 0 0 0;
`;

const LanguageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const LanguageOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$selected ? '#D0FAE5' : '#F9F9F9'};
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateX(4px);
    border-color: ${props => props.$selected ? '#00BC7D' : '#E0E0E0'};
  }
`;

const LanguageName = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  font-weight: 500;
`;

const Checkbox = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.$checked ? '#00C4B4' : '#fff'};
  background: ${props => props.$checked ? '#00C4B4' : '#F8CECE'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &::after {
    content: '✓';
    color: white;
    font-size: 14px;
    font-weight: bold;
    opacity: ${props => props.$checked ? 1 : 0};
  }
`;

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
];

const Lang = () => {
  const { profile } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = async (languageCode) => {
    try {
      await setLanguage(languageCode);
      setSelectedLanguage(languageCode);
      
      // Update document direction for RTL languages
      document.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
      
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  useEffect(() => {
    // Apply RTL if Arabic is selected
    document.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [selectedLanguage]);

  return (
    <PageContainer>
      <VendorHeader profile={profile} />
      <Container>
        <Header>
          <PageTitle>{t('Settings') || 'Settings'}</PageTitle>
          <Subtitle>{t('languagePreferences') || 'Language Preferences'}</Subtitle>
        </Header>

        <LanguageList>
          {languages.map((lang) => (
            <LanguageOption
              key={lang.code}
              $selected={selectedLanguage === lang.code}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <LanguageName>{lang.name}</LanguageName>
              <Checkbox $checked={selectedLanguage === lang.code} />
            </LanguageOption>
          ))}
        </LanguageList>
      </Container>
    </PageContainer>
  );
};

export default Lang;