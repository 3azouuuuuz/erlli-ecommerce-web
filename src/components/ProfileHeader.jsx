import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import v from '../assets/images/v.png';
import b from '../assets/images/b.png';
import s from '../assets/images/s.png';

const ProfileHeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const ProfileHeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 12px;
`;

const ProfileAndButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ProfileImgContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ffffff;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 188, 125, 0.25);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ProfileImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ActivityButton = styled.button`
  background: #00BC7D;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  padding: 10px 20px;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #00A66A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 188, 125, 0.2);
  }
`;

const GreenButtons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #D0FAE5;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #B8F5DC;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const IconImage = styled.img`
  width: 20px;
  height: 16px;
  object-fit: contain;
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProfileHeader = ({ profile, customContent }) => {
  const navigate = useNavigate();
  const icons = [v, b, s];

  const handleIconPress = (index) => {
    if (index === 0) {
      navigate('/Vouchers');
    } else if (index === 1) {
      navigate('/SupportChat');
    } else if (index === 2) {
      navigate('/Settings');
    }
  };

  if (!profile) {
    return (
      <ProfileHeaderContainer>
        <ProfileHeaderContent>
          <Loader>
            <Spinner />
          </Loader>
        </ProfileHeaderContent>
      </ProfileHeaderContainer>
    );
  }

  return (
    <ProfileHeaderContainer>
      <ProfileHeaderContent>
        <ProfileAndButtonContainer>
          <ProfileImgContainer>
            <ProfileImg
              src={profile?.avatar_url || require('../assets/images/arr.jpg')}
              alt="Profile Avatar"
            />
          </ProfileImgContainer>
          <ButtonContainer>
            {customContent ? (
              customContent
            ) : (
              <ActivityButton onClick={() => console.log('My Activity Pressed!')}>
                My Activity
              </ActivityButton>
            )}
          </ButtonContainer>
        </ProfileAndButtonContainer>
        <GreenButtons>
          {icons.map((icon, index) => (
            <IconContainer key={index} onClick={() => handleIconPress(index)}>
              <IconImage src={icon} alt={`Icon ${index}`} />
            </IconContainer>
          ))}
        </GreenButtons>
      </ProfileHeaderContent>
    </ProfileHeaderContainer>
  );
};

export default ProfileHeader;