import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { hp, wp } from '../../helpers/common';
import Button from '../../components/Button';
import { IoCheckmarkCircle } from 'react-icons/io5';
import bubble1 from '../../assets/images/bubble1.png';
import bubble2 from '../../assets/images/bubble2.png';
import profileImg from '../../assets/images/arr.jpg';

// Global style to prevent horizontal overflow
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700&family=Nunito+Sans:wght@300;600;700&display=swap');
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
  background-color: white;
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
  z-index: 2;
`;

const HeaderText = styled.h1`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 50px;
  line-height: 54px;
  letter-spacing: -0.5px;
  color: #202020;
  text-align: center;
  word-wrap: break-word;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  position: relative;
  z-index: 2;
`;

const ProfileImgContainer = styled.div`
  width: 105px;
  height: 105px;
  border-radius: 52.5px;
  overflow: hidden;
  border: 1px solid white;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
`;

const ProfileImg = styled.img`
  width: 91px;
  height: 91px;
  border-radius: 50px;
  object-fit: cover;
`;

const Subtext = styled.p`
  font-family: 'NunitoSans', sans-serif;
  font-size: 19px;
  font-weight: 300;
  line-height: 27px;
  color: #202020;
  text-align: center;
  max-width: 80%;
  align-self: center;
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
  align-self: center;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const MessageContainer = styled.div`
  background-color: white;
  width: ${wp(40)};
  border-radius: 19px;
  padding: ${wp(3)};
  padding-top: ${hp(6)};
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: ${hp(20)};
  box-shadow: 0 2px 3.84px rgba(0, 0, 0, 0.25);
`;

const CircleContainer = styled.div`
  position: absolute;
  top: ${hp(28)};
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.16);
`;

const FailureCircleOuter = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 40px;
  background-color: #ffebef;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FailureCircleMiddle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 30px;
  background-color: #f1aeae;
  border: 2px solid #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ExclamationMark = styled.span`
  font-size: 13px;
  font-weight: bold;
  color: #ffffff;
`;

const TitleText = styled.h2`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 20px;
  color: #000;
  text-align: center;
  margin-bottom: ${hp(1)};
`;

const SubtitleText = styled.p`
  font-family: 'NunitoSans', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #000;
  text-align: center;
  margin-bottom: ${hp(2)};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  gap:10px;
  padding: 0 ${wp(5)};
`;

function EmailRecovery() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalScenario, setModalScenario] = useState('loading');
  const [modalMessage, setModalMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('EmailRecovery component mounted'); // Debug log
  }, []);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address.');
      setModalScenario('failure');
      setModalMessage('Please enter your email address.');
      setModalVisible(true);
      return;
    }
    setError('');
    setLoading(true);
    // Commented out Supabase logic as per instructions
    /*
    try {
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://auth.erlli.com/reset-password',
      });
      if (resetError) {
        throw resetError;
      }
      setModalScenario('success');
      setModalMessage(`If ${email} is registered, a password reset link has been sent. Check your inbox!`);
      setModalVisible(true);
    } catch (error) {
      setModalScenario('failure');
      setModalMessage('An error occurred. Please try again.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
    */
    // Simulate success for testing
    setTimeout(() => {
      setModalScenario('success');
      setModalMessage(`If ${email} is registered, a password reset link has been sent. Check your inbox!`);
      setModalVisible(true);
      setLoading(false);
    }, 1000);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    if (modalScenario === 'success') {
      navigate('/auth/login');
    }
  };

  const handleTryAgain = () => {
    setModalVisible(false);
    setError('');
  };

  const renderModalContent = () => {
    switch (modalScenario) {
      case 'success':
        return (
          <>
            <CircleContainer>
              <IoCheckmarkCircle size={40} color="#00BC7D" />
            </CircleContainer>
            <TitleText>Success</TitleText>
            <SubtitleText>{modalMessage}</SubtitleText>
          </>
        );
      case 'failure':
        return (
          <>
            <CircleContainer>
              <FailureCircleOuter>
                <FailureCircleMiddle>
                  <ExclamationMark>!</ExclamationMark>
                </FailureCircleMiddle>
              </FailureCircleOuter>
            </CircleContainer>
            <TitleText>Failed</TitleText>
            <SubtitleText>{modalMessage}</SubtitleText>
            <ButtonContainer>
              <Button
                title="Try Again"
                onPress={handleTryAgain}
                $hasShadow={false}
                $buttonStyle={{
                  backgroundColor: '#202020',
                  borderRadius: '11px',
                  padding: `${hp(1.5)} ${wp(5)}`,
                  margin: `0 ${wp(1)}`,
                }}
                $textStyle={{
                  fontSize: '16px',
                  fontFamily: 'NunitoSans',
                  fontWeight: '300',
                  lineHeight: '25px',
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              />
              <Button
                title="Close"
                onPress={handleCloseModal}
                $hasShadow={false}
                $buttonStyle={{
                  backgroundColor: '#E7E8EB',
                  borderRadius: '11px',
                  padding: `${hp(1.5)} ${wp(5)}`,
                  margin: `0 ${wp(1)}`,
                }}
                $textStyle={{
                  fontSize: '16px',
                  fontFamily: 'NunitoSans',
                  fontWeight: '300',
                  lineHeight: '25px',
                  color: '#000',
                  textAlign: 'center',
                }}
              />
            </ButtonContainer>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Bubble1 src={bubble1} alt="Bubble 1" />
        <Bubble2 src={bubble2} alt="Bubble 2" />
        <Header>
          <HeaderText>Email Recovery</HeaderText>
        </Header>
        <Form>
          {error && <ErrorText>{error}</ErrorText>}
          <ProfileImgContainer>
            <ProfileImg src={profileImg} alt="Profile" />
          </ProfileImgContainer>
          <Subtext>Enter your email address to recover your password.</Subtext>
          <InputContainer>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
            />
          </InputContainer>
        </Form>
        <Footer>
          <Button
            title="Submit"
            onPress={handleSubmit}
            $hasShadow={false}
            $buttonStyle={{
              width: '100%',
              maxWidth: '335px',
              height: '55px',
              borderRadius: '16px',
              padding: '12px 0',
              backgroundColor: '#00BC7D',
            }}
            $textStyle={{
              fontSize: '20px',
              fontFamily: 'NunitoSans',
              fontWeight: '300',
              lineHeight: '28px',
              color: '#FFFFFF',
            }}
            loading={loading}
            disabled={loading}
          />
        </Footer>
        {modalVisible && (
          <ModalOverlay onClick={handleCloseModal}>
            <MessageContainer onClick={(e) => e.stopPropagation()}>
              {renderModalContent()}
            </MessageContainer>
          </ModalOverlay>
        )}
      </Container>
    </>
  );
}

export default EmailRecovery;