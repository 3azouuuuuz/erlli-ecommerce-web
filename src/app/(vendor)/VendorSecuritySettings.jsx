import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoChevronBack } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding-top: 80px;
  padding-bottom: 60px;
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    font-size: 20px;
    color: #666;
  }

  &:hover {
    background: #00BC7D;
    
    svg {
      color: white;
    }
  }
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #000;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SettingsBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #000;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  background: #F9F9F9;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #00BC7D;
    background: white;
  }

  &::placeholder {
    color: #666;
  }

  &:disabled {
    background: #F0F0F0;
    color: #666;
    cursor: not-allowed;
  }
`;

const UpdateButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

const HelperText = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: -8px 0 0 0;
`;

const VendorSecuritySettings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();
  const [confirmCurrentPassword, setConfirmCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password display
  const currentPasswordLength = user?.user_metadata?.password_length || 8;
  const currentPasswordDisplay = '•'.repeat(currentPasswordLength);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('No user logged in');
      return;
    }

    if (!confirmCurrentPassword) {
      alert('Please enter your current password');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }

    setIsUpdating(true);

    try {
      // Verify current password
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: confirmCurrentPassword,
      });

      if (loginError) {
        alert('Current password is incorrect');
        setIsUpdating(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (updateError) {
        alert(updateError.message);
        setIsUpdating(false);
        return;
      }

      alert('Password updated successfully!');
      setConfirmCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      navigate('/vendor/settings');
    } catch (error) {
      console.error('Error updating password:', error.message);
      alert('Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
  <PageContainer>
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/vendor/settings')}>
          <IoChevronBack />
        </BackButton>
        <HeaderText>
          <Title>{t('SecuritySettings')}</Title>
          <Subtitle>{t('UpdatePassword')}</Subtitle>
        </HeaderText>
      </Header>
      <Form onSubmit={handlePasswordUpdate}>
        <SettingsBox>
          <Label>{t('CurrentPassword')}</Label>
          <Input
            type="password"
            value={currentPasswordDisplay}
            disabled
          />
          <HelperText>{t('CurrentPasswordHidden')}</HelperText>
        </SettingsBox>
        <SettingsBox>
          <Label>{t('ConfirmCurrentPassword')}</Label>
          <Input
            type="password"
            value={confirmCurrentPassword}
            onChange={(e) => setConfirmCurrentPassword(e.target.value)}
            placeholder={t('EnterCurrentPassword')}
            required
            disabled={isUpdating}
          />
        </SettingsBox>
        <SettingsBox>
          <Label>{t('NewPassword')}</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('EnterNewPassword')}
            required
            minLength={6}
            disabled={isUpdating}
          />
        </SettingsBox>
        <SettingsBox>
          <Label>{t('ConfirmNewPassword')}</Label>
          <Input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder={t('ReEnterNewPassword')}
            required
            minLength={6}
            disabled={isUpdating}
          />
        </SettingsBox>
        <UpdateButton type="submit" disabled={isUpdating}>
          {isUpdating ? t('Updating') : t('UpdatePassword')}
        </UpdateButton>
      </Form>
    </Container>
  </PageContainer>
);
};

export default VendorSecuritySettings;