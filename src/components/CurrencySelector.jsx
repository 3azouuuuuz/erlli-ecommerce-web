import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext.jsx';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;
const Header = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #202020;
  margin: 0 0 32px 0;
`;
const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
`;
const Box = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.$selected ? '#D0FAE5' : '#F9F9F9'};
  padding: 16px;
  border-radius: 8px;
  flex: 1;
  transition: all 0.3s ease;
  cursor: pointer;
  &:hover {
    background-color: ${props => props.$selected ? '#D0FAE5' : '#ECFDF5'};
  }
`;
const LabelText = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #000000;
  font-weight: 500;
`;
const Checkbox = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.$checked ? '#00C4B4' : '#fff'};
  background-color: ${props => props.$checked ? '#00C4B4' : '#F8CECE'};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  &:hover {
    transform: scale(1.1);
  }
`;
const Checkmark = styled.span`
  color: #FFFFFF;
  font-size: 16px;
  font-weight: bold;
`;

const CurrencySelector = ({ containerStyle, titleStyle }) => {
  const navigate = useNavigate();
  const { currency, changeCurrency } = useCurrency();
  const { t } = useTranslation();

  const currencyOptions = [
    { code: 'usd', label: t('USD') },
    { code: 'eur', label: t('EUR') },
    { code: 'gbp', label: t('GBP') },
    { code: 'chf', label: t('CHF') },
    { code: 'jpy', label: t('JPY') },
  ];

  const handleCurrencyChange = async (newCurrency) => {
    try {
      await changeCurrency(newCurrency);
      navigate('/vendor');
    } catch (error) {
      console.error('Failed to change currency:', error.message);
    }
  };

  return (
    <Container style={containerStyle}>
      <Header style={titleStyle}>{t('CurrencyPreferences')}</Header>
      <CheckboxGroup>
        {currencyOptions.map(({ code, label }) => (
          <CheckboxRow key={code}>
            <Box
              $selected={currency === code}
              onClick={() => handleCurrencyChange(code)}
            >
              <LabelText>{label}</LabelText>
              <Checkbox
                $checked={currency === code}
                type="button"
              >
                {currency === code && <Checkmark>✓</Checkmark>}
              </Checkbox>
            </Box>
          </CheckboxRow>
        ))}
      </CheckboxGroup>
    </Container>
  );
};

export default CurrencySelector;