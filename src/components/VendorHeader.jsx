// VendorHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoSettingsOutline, IoChatbubblesOutline, IoLogOutOutline, IoPersonOutline } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';

// Styled Components
const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  padding: 12px 20px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileImageContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VendorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const VendorName = styled.h2`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const VendorRole = styled.span`
  font-size: 12px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #D0FAE5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  svg {
    color: #00BC7D;
    font-size: 20px;
  }
  
  &:hover {
    background: #00BC7D;
    transform: scale(1.05);
    
    svg {
      color: white;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 200px;
  z-index: 1001;
  display: ${props => props.$show ? 'block' : 'none'};
  animation: slideDown 0.2s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 15px;
    width: 12px;
    height: 12px;
    background: white;
    transform: rotate(45deg);
    box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #202020;
  transition: all 0.2s ease;
  
  svg {
    font-size: 18px;
    color: #666;
  }
  
  &:hover {
    background: #F5F5F5;
    
    svg {
      color: #00BC7D;
    }
  }
  
  &.logout {
    color: #D97474;
    
    svg {
      color: #D97474;
    }
    
    &:hover {
      background: #FFF5F5;
    }
  }
`;

const VendorHeader = ({ profile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleMessagesClick = () => {
    navigate('/vendor/messages');
  };

  const handleSettingsClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfileClick = () => {
    navigate('/vendor/profile');
    setShowDropdown(false);
  };

  const handleAccountSettingsClick = () => {
    navigate('/vendor/settings');
    setShowDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <HeaderContainer>
      <HeaderContent>
        <LeftSection>
          <ProfileImageContainer onClick={handleProfileClick}>
            <ProfileImage 
              src={profile?.avatar_url || 'https://via.placeholder.com/50'} 
              alt="Profile"
            />
          </ProfileImageContainer>
          <VendorInfo>
            <VendorName>{profile?.first_name || 'Vendor'}</VendorName>
            <VendorRole>Vendor Dashboard</VendorRole>
          </VendorInfo>
        </LeftSection>

        <RightSection>
          <IconButton onClick={handleMessagesClick} title="Messages">
            <IoChatbubblesOutline />
          </IconButton>
          
          <DropdownContainer className="dropdown-container">
            <IconButton onClick={handleSettingsClick} title="Settings">
              <IoSettingsOutline />
            </IconButton>
            
            <DropdownMenu $show={showDropdown}>
              <DropdownItem onClick={handleProfileClick}>
                <IoPersonOutline />
                My Profile
              </DropdownItem>
              <DropdownItem onClick={handleAccountSettingsClick}>
                <IoSettingsOutline />
                Account Settings
              </DropdownItem>
              <DropdownItem className="logout" onClick={handleLogout}>
                <IoLogOutOutline />
                Logout
              </DropdownItem>
            </DropdownMenu>
          </DropdownContainer>
        </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default VendorHeader;