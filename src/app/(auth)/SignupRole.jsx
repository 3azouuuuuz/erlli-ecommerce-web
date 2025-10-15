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

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  transform: translateY(-25px);
  z-index: 3;
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
  margin-top: 100px;
  position: relative;
  z-index: 3;
`;

const HeaderText = styled.h1`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 50px;
  line-height: 54px;
  letter-spacing: -0.5px;
  color: #202020;
  word-wrap: break-word;
  z-index: 3;
`;

const RoleWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const RoleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
  margin-top: ${hp(9)}px;
  z-index: 3;
`;

const RoleCard = styled.div`
  width: 100%;
  max-width: 280px;
  height: 348px;
  background-color: #fff;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  border: 1px solid #E0E0E0;
  padding: ${hp(2)}px 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 3;
  transition: background-color 0.3s, border-color 0.3s;
  &:hover {
    background-color: #4CAF50;
    border-color: #4CAF50;
  }
`;

const RoleText = styled.p`
  font-family: 'NunitoSans', sans-serif;
  font-size: 20px;
  color: #202020;
  text-align: center;
  margin-top: ${hp(1)}px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 3;
  padding-bottom: 10px;
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
  z-index: 3;
`;

// Exact Ionicons SVG for person-outline
const PersonOutlineSVG = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 512 512">
    <path d="M344,144c-3.92,52.87-44,96-88,96s-84.15-43.12-88-96c-4-55,35-96,88-96S348,90,344,144Z" style={{fill:"none", stroke:color, strokeLinecap:"round", strokeLinejoin:"round", strokeWidth:"32px"}}/>
    <path d="M256,304c-87,0-175.3,48-191.64,138.6C62.39,453.52,68.57,464,80,464H432c11.44,0,17.62-10.48,15.65-21.4C431.3,352,343,304,256,304Z" style={{fill:"none", stroke:color, strokeMiterlimit:"10", strokeWidth:"32px"}}/>
  </svg>
);

// Exact Ionicons SVG for storefront-outline
const StorefrontOutlineSVG = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 512 512">
    <line fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" x1="448" y1="448" x2="448" y2="240"/>
    <line fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" x1="64" y1="240" x2="64" y2="448"/>
    <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M382.47,48H129.53C107.74,48,88.06,60,79.6,78.46L36.3,173c-14.58,31.81,9.63,67.85,47.19,69q1,0,2,0c31.4,0,56.85-25.18,56.85-52.23,0,27,25.46,52.23,56.86,52.23S256,218.62,256,189.77c0,27,25.45,52.23,56.85,52.23s56.86-23.38,56.86-52.23c0,28.85,25.45,52.23,56.85,52.23q1,0,1.95,0c37.56-1.17,61.77-37.21,47.19-69L432.4,78.46C423.94,60,404.26,48,382.47,48Z"/>
    <line fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" x1="32" y1="464" x2="480" y2="464"/>
    <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M136,288h80a24,24,0,0,1,24,24v88a0,0,0,0,1,0,0H112a0,0,0,0,1,0,0V312A24,24,0,0,1,136,288Z"/>
    <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M288,464V312a24,24,0,0,1,24-24h64a24,24,0,0,1,24,24V464"/>
  </svg>
);

function SignupRole() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, phone, country } = location.state || {};
  const [role, setRole] = useState('customer');

  const handleNext = () => {
    navigate('/auth/signup2', {
      state: {
        email,
        password,
        phone,
        country,
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
        <ContentWrapper>
          <Header>
            <HeaderText>Choose Your Role</HeaderText>
          </Header>
          <RoleWrapper>
            <RoleContainer>
              <RoleCard
                onClick={() => setRole('customer')}
                style={{ backgroundColor: role === 'customer' ? '#00BC7D' : '#fff', borderColor: role === 'customer' ? '#00BC7D' : '#E0E0E0' }}
              >
                <PersonOutlineSVG color={role === 'customer' ? '#FFFFFF' : '#202020'} />
                <RoleText style={{ color: role === 'customer' ? '#FFFFFF' : '#202020' }}>
                  Customer
                </RoleText>
              </RoleCard>
              <RoleCard
                onClick={() => setRole('vendor')}
                style={{ backgroundColor: role === 'vendor' ? '#00BC7D' : '#fff', borderColor: role === 'vendor' ? '#00BC7D' : '#E0E0E0' }}
              >
                <StorefrontOutlineSVG color={role === 'vendor' ? '#FFFFFF' : '#202020'} />
                <RoleText style={{ color: role === 'vendor' ? '#FFFFFF' : '#202020' }}>
                  Vendor
                </RoleText>
              </RoleCard>
            </RoleContainer>
          </RoleWrapper>
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
        </ContentWrapper>
      </Container>
    </>
  );
}

export default SignupRole;