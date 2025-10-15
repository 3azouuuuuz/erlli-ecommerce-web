import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styled, { createGlobalStyle } from 'styled-components';
import { hp, wp } from '../../helpers/common';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import bubble3 from '../../assets/images/bubble3.png';
import bubble4 from '../../assets/images/bubble4.png';
import bubble5 from '../../assets/images/bubble5.png';
import bubble6 from '../../assets/images/bubble6.png';

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
  max-width: 335px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
  height: 100vh;
  justify-content: center;
  align-items: center;
  max-height: 100vh;
  pointer-events: none;
`;

const BubbleImage = styled.img`
  position: absolute;
  z-index: 1;
  width: ${wp(19)};
  height: auto;
  pointer-events: none;
`;

const Bubble3 = styled(BubbleImage)`
  top: 0;
  left: 0;
  margin-top: ${hp(-8)};
  margin-left: ${wp(-40)};
  z-index: 2;
  image-rendering: auto;
`;

const Bubble4 = styled(BubbleImage)`
  top: 0;
  left: 0;
  margin-top: ${hp(-4)};
  margin-left: ${wp(-35)};
  z-index: 0;
  image-rendering: auto;
`;

const Bubble5 = styled(BubbleImage)`
  bottom: 0;
  right: 0;
  margin-bottom: ${hp(-8)};
  margin-right: ${wp(-40)};
  z-index: 3;
  width: ${wp(11)};
  image-rendering: auto;
`;

const Bubble6 = styled(BubbleImage)`
  bottom: 0;
  right: 0;
  margin-bottom: ${hp(1)};
  margin-right: ${wp(-40)};
  z-index: 1;
  image-rendering: auto;
`;

const Form = styled.div`
  margin-top: ${hp(5)};
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 5;
  gap: 30px;
  max-width: 335px;
  width: 100%;
  pointer-events: none;
`;

const LoginText = styled.h1`
  font-family: 'Raleway-Regular';
  font-weight: 700;
  font-size: 52px;
  line-height: 61.05px;
  letter-spacing: -0.52px;
  color: #202020;
  word-wrap: break-word;
  pointer-events: none;
`;

const Subtext = styled.p`
  font-family: 'NunitoSans_7pt-Regular';
  font-size: 19px;
  font-weight: 300;
  line-height: 35px;
  color: #202020;
  pointer-events: none;
`;

const InputContainer = styled.div`
  background-color: #f8f8f8;
  border-radius: 59px;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  width: 100%;
  max-width: 335px;
  box-sizing: border-box;
  z-index: 6;
  pointer-events: auto;
`;

const Input = styled.input`
  flex: 1;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  background: none;
  border: none;
  outline: none;
  pointer-events: auto;
`;

const EyeIcon = styled.div`
  cursor: pointer;
  padding: 0 6px;
  z-index: 7;
  pointer-events: auto;
  svg {
    width: 24px;
    height: 24px;
    color: #333;
  }
`;

const Forgot = styled.div`
  text-align: right;
  z-index: 6;
  pointer-events: auto;
`;

const ForgotText = styled.a`
  font-family: 'NunitoSans_7pt-Regular';
  font-size: 16px;
  font-weight: 400;
  color: #00BC7D;
  text-decoration: none;
  cursor: pointer;
  pointer-events: auto;
  &:hover {
    text-decoration: underline;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 6;
  padding-top: 20px;
  max-width: 335px;
  width: 100%;
  pointer-events: none;
`;

const CancelText = styled.p`
  padding: 15px;
  font-family: 'NunitoSans_7pt-Regular';
  font-weight: 300;
  color: #202020;
  font-size: 15px;
  line-height: 26px;
  margin-top: 10px;
  cursor: pointer;
  z-index: 6;
  pointer-events: auto;
`;

const SignupText = styled.p`
  padding: 15px;
  font-family: 'NunitoSans_7pt-Regular';
  font-weight: 300;
  color: #00BC7D;
  font-size: 15px;
  line-height: 26px;
  margin-top: 10px;
  cursor: pointer;
  z-index: 6;
  pointer-events: auto;
  &:hover {
    text-decoration: underline;
  }
`;

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    await login(email, password);
  };

  const togglePasswordVisibility = (e) => {
    e.stopPropagation();
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    navigate('/');
  };

  const handleForgotPassword = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate('/auth/forgot-password');
  };

  const handleSignup = (e) => {
    e.stopPropagation();
    navigate('/auth/signup');
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Bubble3 src={bubble3} alt="Bubble 3" />
        <Bubble4 src={bubble4} alt="Bubble 4" />
        <Bubble5 src={bubble5} alt="Bubble 5" />
        <Bubble6 src={bubble6} alt="Bubble 6" />
        <Form>
          <LoginText>Login</LoginText>
          <Subtext>Good to see you back! 🖤</Subtext>
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
            <EyeIcon onClick={togglePasswordVisibility}>
              {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </EyeIcon>
          </InputContainer>
          <Forgot>
            <ForgotText onClick={handleForgotPassword}>
              Forgot Password?
            </ForgotText>
          </Forgot>
          <Footer>
            <Button
              title="Done"
              buttonStyle={{
                width: '335px',
                height: '61px',
                backgroundColor: '#00BC7D',
                borderRadius: '16px',
                paddingVertical: hp(1.5),
                zIndex: 10,
              }}
              hasShadow={false}
              textStyle={{
                fontSize: 22,
                fontFamily: 'NunitoSans_7pt-Regular',
                fontWeight: '300',
                lineHeight: 31,
              }}
              loading={loading}
              onPress={handleLogin}
            />
            <CancelText onClick={handleCancel}>Cancel</CancelText>
            <SignupText onClick={handleSignup}>Don't have an account? Sign up</SignupText>
          </Footer>
        </Form>
      </Container>
    </>
  );
}

export default Login;