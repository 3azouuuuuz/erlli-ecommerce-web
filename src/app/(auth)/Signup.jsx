import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { hp, wp } from '../../helpers/common';
import Button from '../../components/Button';
import countries from '../../assets/countries';
import bubble1 from '../../assets/images/bubble1.png';
import bubble2 from '../../assets/images/bubble2.png';

// Global style to prevent horizontal overflow
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    width: 100%;
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
`;

const BubbleImage = styled.img`
  width: ${wp(19)};
  height: auto;
`;

const Bubble1 = styled(BubbleImage)`
  margin-top: ${hp(-8)};
  margin-left: ${wp(-35)};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

const Bubble2 = styled(BubbleImage)`
  margin-top: ${hp(-60)};
  margin-right: ${wp(-34)};
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  image-rendering: auto; /* Optimize rendering to reduce blurriness */
`;

const Header = styled.div`
  margin-top: 100px;
  position: relative;
  z-index: 2;
`;

const HeaderText = styled.h1`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 50px;
  line-height: 54px;
  letter-spacing: -0.5px;
  color: #202020;
  word-wrap: break-word;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  position: relative;
  z-index: 2;
`;

const InputContainer = styled.div`
  background-color: #f8f8f8;
  border-radius: 59px;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  width: 100%;
  box-sizing: border-box;
`;

const Input = styled.input`
  flex: 1;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  background: none;
  border: none;
  outline: none;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0 6px;
  cursor: pointer;
`;

const PhoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const PhoneInputContainer = styled.div`
  background-color: #f8f8f8;
  border-radius: 59px;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  width: 100%;
  box-sizing: border-box;
`;

const CountrySelector = styled.div`
  display: flex;
  align-items: center;
  padding-right: 6px;
  border-right: 1px solid #ecfdf5;
`;

const CountrySelect = styled.select`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  background: none;
  border: none;
  outline: none;
  min-width: 80px;
  max-width: 100%;
`;

const PhoneInput = styled.input`
  flex: 1;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  background: none;
  border: none;
  outline: none;
  padding-left: 8px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
`;

const ErrorText = styled.p`
  color: red;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  margin-bottom: 10px;
`;

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!email || !password || !phone || !selectedCountry) {
      setError('Please fill all required fields.');
      return;
    }
    if (phone.replace(/\D/g, '').length <= 3) {
      setError('Please enter a valid phone number.');
      return;
    }
    const country = countries.find((c) => c.name === selectedCountry);
    const userData = {
      email,
      password,
      phone: `${country.phoneCode}${phone.replace(/\D/g, '')}`,
      country: selectedCountry,
    };
    navigate('/auth/signup-role', { state: userData });
  };

  const getFlagEmoji = (isoCode) => {
    const codePoints = isoCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Bubble1 src={bubble1} alt="Bubble 1" />
        <Bubble2 src={bubble2} alt="Bubble 2" />
        <Header>
          <HeaderText>Create Account</HeaderText>
        </Header>
        <Form>
          {error && <ErrorText>{error}</ErrorText>}
          <InputContainer>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
            />
          </InputContainer>
          <InputContainer>
            <Input
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoCapitalize="none"
            />
            <IconButton
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#333"
                strokeWidth="2"
              >
                {isPasswordVisible ? (
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                ) : (
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                )}
              </svg>
            </IconButton>
          </InputContainer>
          <PhoneContainer>
            <PhoneInputContainer>
              <CountrySelector>
                <CountrySelect
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.name}>
                      {`${getFlagEmoji(country.isoCode)} ${country.name} (${country.phoneCode})`}
                    </option>
                  ))}
                </CountrySelect>
              </CountrySelector>
              <PhoneInput
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </PhoneInputContainer>
          </PhoneContainer>
        </Form>
        <Footer>
          <Button
            title="Done"
            onPress={handleNext}
            buttonStyle={{
              width: '100%',
              maxWidth: '335px',
              height: '55px',
              borderRadius: '16px',
              padding: '12px 0',
              backgroundColor: '#00bc7d',
            }}
            textStyle={{
              fontSize: '20px',
              fontFamily: 'NunitoSans',
              fontWeight: '300',
              lineHeight: '28px',
              color: '#fff',
            }}
            hasShadow={false}
          />
          <Button
            title="Cancel"
            onPress={() => navigate('/')}
            buttonStyle={{
              backgroundColor: 'transparent',
              padding: '12px',
            }}
            textStyle={{
              fontFamily: 'NunitoSans',
              fontWeight: '300',
              color: '#202020',
              fontSize: '14px',
              lineHeight: '24px',
            }}
            hasShadow={false}
          />
        </Footer>
      </Container>
    </>
  );
}

export default Signup;