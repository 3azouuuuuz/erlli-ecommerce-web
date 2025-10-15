import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { hp, wp } from '../../helpers/common';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import bubble67 from '../../assets/images/bubble67.png';
import bubble68 from '../../assets/images/bubble68.png';
import profileImg from '../../assets/images/arr.jpg';

// Filter out non-DOM props (using transient props to avoid warnings)
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700&family=Nunito+Sans:wght@300&display=swap');
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 20px 15px;
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

const Bubble67 = styled(BubbleImage)`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 0;
`;

const Bubble68 = styled(BubbleImage)`
  position: absolute;
  top: 0;
  right: 0;
  margin-top: ${hp(-5)};
  margin-right: ${wp(-34)};
  z-index: 1;
`;

const Header = styled.div`
  margin-top: 80px;
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
`;

const HeaderText = styled.h1`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 42px;
  line-height: 48px;
  color: #202020;
  text-align: center;
  transform: rotate(-1deg);
  margin: 0;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  position: relative;
  z-index: 2;
  align-items: center;
`;

const ProfileImgContainer = styled.div`
  width: ${wp(10)};
  height: ${wp(10)};
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
`;

const ProfileImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Subtext = styled.p`
  font-family: 'NunitoSans', sans-serif;
  font-size: 16px;
  font-weight: 300;
  line-height: 24px;
  color: #202020;
  text-align: center;
  max-width: 80%;
  margin: 0 0 20px 0;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 335px;
  padding: 0 12px;
  border-radius: 59px;
  height: 50px;
  margin-bottom: 20px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  z-index: 2;
`;

const CancelText = styled.p`
  font-family: 'NunitoSans', sans-serif;
  font-weight: 300;
  color: #202020;
  font-size: 14px;
  line-height: 24px;
  margin-top: 12px;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #00bc7d;
  }
`;

function ForgotPassword() {
  const navigate = useNavigate();
  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsEmailChecked(!isEmailChecked);
  };

  const handleSubmit = () => {
    if (isEmailChecked) {
      navigate('/auth/email-recovery'); // Updated to match route in App.jsx
    } else {
      alert('Please select Email to recover your password.');
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Bubble67 src={bubble67} alt="Bubble 67" />
        <Bubble68 src={bubble68} alt="Bubble 68" />
        <Header>
          <HeaderText>Password Recovery</HeaderText>
        </Header>
        <Form>
          <ProfileImgContainer>
            <ProfileImg src={profileImg} alt="Profile" />
          </ProfileImgContainer>
          <Subtext>How would you like to restore your password?</Subtext>
          <CheckboxContainer>
            <Checkbox
              label="Email"
              checked={isEmailChecked}
              onChange={handleCheckboxChange}
              containerBg="#FFEBEB"
              checkboxBg="#F8CECE"
              textColor="#000000"
            />
          </CheckboxContainer>
          <Footer>
            <Button
              title="Done"
              onPress={handleSubmit}
              $hasShadow={true}
              $buttonStyle={{
                width: '100%',
                maxWidth: '335px',
                height: '55px',
                borderRadius: '16px',
                backgroundColor: '#00bc7d',
              }}
              $textStyle={{
                fontSize: '20px',
                fontFamily: 'NunitoSans',
                fontWeight: '300',
                lineHeight: '28px',
                color: '#fff',
              }}
            />
            <CancelText onClick={() => navigate(-1)}>Cancel</CancelText>
          </Footer>
        </Form>
      </Container>
    </>
  );
}

export default ForgotPassword;