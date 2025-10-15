import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoCheckmarkCircle } from 'react-icons/io5';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${props => (props.visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(8px);

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const MessageContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 48px 40px 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.4s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 768px) {
    padding: 40px 24px 32px;
    border-radius: 16px;
  }
`;

const ModalIcon = styled.div`
  width: 96px;
  height: 96px;
  margin: 0 auto 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.success ? 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')};
  color: white;
  font-size: 48px;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 40px;
    margin-bottom: 24px;
  }
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const FailureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #FFEBEB;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const FailureInner = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  background: #F1AEAE;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Raleway', sans-serif;

  @media (max-width: 768px) {
    width: 22px;
    height: 22px;
    font-size: 14px;
  }
`;

const TitleText = styled.h3`
  font-size: 28px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0 0 16px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const SubtitleText = styled.p`
  font-size: 18px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 15px;
  }
`;

const LoadingMessage = ({
  visible,
  scenario = 'loading',
  successType = 'default',
  message = '',
  duration = 1000,
  onClose,
  onTryAgain,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <ModalIcon>
            <Spinner />
          </ModalIcon>
          <TitleText>Processing...</TitleText>
          <SubtitleText>{message || 'Please wait a moment'}</SubtitleText>
        </>
      );
    }

    switch (scenario) {
      case 'success':
        return (
          <>
            <ModalIcon success>
              <IoCheckmarkCircle size={56} />
            </ModalIcon>
            <TitleText>{successType === 'payment' || successType === 'subscription' ? 'Success' : 'Added Successfully!'}</TitleText>
            <SubtitleText>{message || 'Item added to cart'}</SubtitleText>
            <ButtonContainer>
              <ModalButton
                style={{
                  background: 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)',
                  color: 'white',
                }}
                onClick={onChange}
              >
                {successType === 'payment' || successType === 'subscription' ? 'Track Order' : 'View Cart'}
              </ModalButton>
              <ModalButton
                style={{
                  background: '#f5f5f5',
                  color: '#1a1a2e',
                  border: '1px solid #e0e0e0',
                }}
                onClick={onTryAgain}
              >
                {successType === 'payment' || successType === 'subscription' ? 'Modify' : 'Continue Shopping'}
              </ModalButton>
            </ButtonContainer>
          </>
        );
      case 'failure':
        return (
          <>
            <ModalIcon>
              <FailureIcon>
                <FailureInner>!</FailureInner>
              </FailureIcon>
            </ModalIcon>
            <TitleText>{successType === 'payment' || successType === 'subscription' ? 'Transaction Failed' : 'Operation Failed'}</TitleText>
            <SubtitleText>{message || 'An error occurred. Please try again.'}</SubtitleText>
            <ButtonContainer>
              <ModalButton
                style={{
                  background: 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)',
                  color: 'white',
                }}
                onClick={onTryAgain}
              >
                Retry
              </ModalButton>
              <ModalButton
                style={{
                  background: '#f5f5f5',
                  color: '#1a1a2e',
                  border: '1px solid #e0e0e0',
                }}
                onClick={onChange}
              >
                Close
              </ModalButton>
            </ButtonContainer>
          </>
        );
      default:
        return (
          <>
            <ModalIcon>
              <Spinner />
            </ModalIcon>
            <TitleText>Processing...</TitleText>
            <SubtitleText>{message || 'Please wait a moment'}</SubtitleText>
          </>
        );
    }
  };

  return (
    <ModalOverlay visible={visible} onClick={onClose}>
      <MessageContainer onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {renderContent()}
      </MessageContainer>
    </ModalOverlay>
  );
};

export default LoadingMessage;