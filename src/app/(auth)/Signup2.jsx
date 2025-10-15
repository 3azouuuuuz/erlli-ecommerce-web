import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { hp, wp } from '../../helpers/common';
import Button from '../../components/Button';
import bubble1 from '../../assets/images/bubble1.png';
import bubble2 from '../../assets/images/bubble2.png';

// Global style to prevent scrolling
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: hidden;
    width: 100%;
    height: 100vh;
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
  max-height: 100vh;
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
  image-rendering: auto;
`;

const Header = styled.div`
  margin-top: 92px;
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

const FullNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 15px;
`;

const AddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
`;

const CancelText = styled.p`
  padding: 15px;
  font-family: 'NunitoSans', sans-serif;
  font-weight: 300;
  color: #202020;
  font-size: 15px;
  line-height: 26px;
  margin-top: 10px;
  cursor: pointer;
`;

function Signup2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, phone, country, role } = location.state || {};
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleNext = () => {
    if (!firstName || !lastName || !addressLine1 || !state || !city || !zipCode) {
      alert('Please fill all required fields.');
      return;
    }
    navigate('/auth/signup3', {
      state: {
        email,
        password,
        phone,
        country,
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        state,
        city,
        zipCode,
        role,
      },
    });
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Bubble1 src={bubble1} alt="Bubble 1" />
        <Bubble2 src={bubble2} alt="Bubble 2" />
        <Header>
          <HeaderText>Almost There!</HeaderText>
        </Header>
        <Form>
          <FullNameContainer>
            <InputContainer>
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </InputContainer>
          </FullNameContainer>
          <AddressContainer>
            <InputContainer>
              <Input
                placeholder="Address Line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <Input
                placeholder="Address Line 2 (e.g., Apartment, Suite)"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </InputContainer>
          </AddressContainer>
          <FullNameContainer>
            <InputContainer>
              <Input
                placeholder="State/Province/Region"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </InputContainer>
          </FullNameContainer>
          <InputContainer>
            <Input
              placeholder="ZIP Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </InputContainer>
        </Form>
        <Footer>
          <Button
            title="Next"
            onPress={handleNext}
            buttonStyle={{
              width: '100%',
              maxWidth: '335px',
              height: '55px',
              borderRadius: '16px',
              padding: '12px 0',
              backgroundColor: '#00BC7D',
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
          <CancelText onClick={() => navigate(-1)}>Cancel</CancelText>
        </Footer>
      </Container>
    </>
  );
}

export default Signup2;