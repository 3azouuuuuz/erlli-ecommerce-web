import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ShopHeader from '../../components/ShopHeader';
import { IoChevronDown, IoCamera, IoPencil, IoClose } from 'react-icons/io5';
import countries from '../../assets/countries';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, CONTABO_BUCKET_NAME, CONTABO_ENDPOINT } from '../../lib/constants';

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
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #000;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  line-height: 20px;
  letter-spacing: -0.21px;
  color: #666;
  margin: 16px 0 0 0;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0;
  position: relative;
`;

const AvatarCircle = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: white;
  border: 3px dashed #00BC7D;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00A66A;
    transform: scale(1.02);
  }

  ${props => props.uploading && `
    pointer-events: none;
    opacity: 0.6;
  `}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const CameraIcon = styled(IoCamera)`
  font-size: 34px;
  color: #00BC7D;
`;

const EditButton = styled.button`
  position: absolute;
  top: 8px;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #00BC7D;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.3);

  &:hover {
    background: #00A66A;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const UploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border-radius: 59px;
  background: #F8F8F8;
  border: 1px solid transparent;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #00BC7D;
    background: white;
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const PhoneInputContainer = styled.div`
  background: #F8F8F8;
  border-radius: 59px;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #00BC7D;
    background: white;
  }
`;

const CountrySelector = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
  border-right: 1px solid #ECFDF5;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const FlagImage = styled.img`
  width: 24px;
  height: 18px;
  object-fit: cover;
  border-radius: 2px;
`;

const PhoneCode = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  min-width: 50px;
`;

const PhoneInput = styled(Input)`
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0 0 0 12px;

  &:focus {
    background: transparent;
    border: none;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  border-radius: 59px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ECFDF5;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

const ModalList = styled.div`
  overflow-y: auto;
  padding: 8px 0;
`;

const CountryItem = styled.button`
  width: 100%;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: none;
  border-bottom: 1px solid #ECFDF5;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: #F8F8F8;
  }

  &:active {
    background: #ECFDF5;
  }
`;

const CountryText = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #333;
`;

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();

  const [selectedImage, setSelectedImage] = useState(profile?.avatar_url || null);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(
    profile?.phone && profile?.country
      ? profile.phone.replace(
          countries.find((c) => c.name === profile.country)?.phoneCode || '',
          ''
        )
      : ''
  );
  const [selectedCountry, setSelectedCountry] = useState(profile?.country || '');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (profile) {
      setSelectedImage(profile.avatar_url || null);
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setSelectedCountry(profile.country || '');
      if (profile.phone && profile.country) {
        const country = countries.find((c) => c.name === profile.country);
        setPhone(profile.phone.replace(country?.phoneCode || '', ''));
      }
    }
  }, [profile]);

  const uploadImageToContabo = async (file) => {
    if (!file) {
      alert('Please select an image first.');
      return null;
    }

    try {
      setUploading(true);

      // Validate file type and size
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Please select a JPEG or PNG image.');
        return null;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size exceeds 5MB limit');
        return null;
      }

      const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;

      console.log('Uploading to Contabo S3...');

      // Read file as ArrayBuffer
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });

      // Upload to Contabo S3 (same path as Signup3)
      const command = new PutObjectCommand({
        Bucket: CONTABO_BUCKET_NAME,
        Key: `public/${fileName}`,
        Body: arrayBuffer,
        ContentType: file.type,
        ACL: 'public-read',
      });

      await s3Client.send(command);

      console.log('Upload successful:', fileName);

      // Construct public URL (same format as Signup3)
      const publicUrl = `${CONTABO_ENDPOINT}/${CONTABO_BUCKET_NAME}/public/${fileName}`;

      console.log('Image uploaded successfully, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);

      if (error.name === 'AccessDenied') {
        alert('Storage permission error. Please contact support to enable avatar uploads.');
      } else if (error.name === 'NoSuchBucket') {
        alert('Storage bucket not configured. Please contact support.');
      } else {
        alert('Failed to upload image. Please try again or contact support.');
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profile?.id) {
      alert('Profile ID is missing. Cannot save changes.');
      return;
    }

    const country = countries.find((c) => c.name === selectedCountry);
    if (!country) {
      alert('Please select a valid country.');
      return;
    }

    const fullPhone = phone ? `${country.phoneCode}${phone.replace(/\D/g, '')}` : profile?.phone || '';

    try {
      let avatarUrl = profile?.avatar_url || null;

      // Upload new image if selected and it's a local file (base64 or blob)
      if (selectedImage && !selectedImage.startsWith('http')) {
        const file = fileInputRef.current?.files?.[0];
        if (file) {
          avatarUrl = await uploadImageToContabo(file);
          if (!avatarUrl) {
            // Upload failed, stop the save process
            return;
          }
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: fullPhone,
          country: selectedCountry,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      alert('Your profile has been updated successfully!');
      navigate('/Settings');
    } catch (error) {
      console.error('Error in handleSaveProfile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    // If it's already a full URL or data URI, return as-is
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // Otherwise, it might be a relative path - construct full URL
    return `${CONTABO_ENDPOINT}/${CONTABO_BUCKET_NAME}/${url}`;
  };

  const selectedCountryData = countries.find((c) => c.name === selectedCountry);

  return (
    <PageContainer>
      <ShopHeader
        isConnected={!!user}
        avatarUrl={profile?.avatar_url}
        userRole={profile?.role}
        userEmail={profile?.email || user?.email}
        onLogout={logout}
      />
      <Container>
        <Header>
          <Title>Settings</Title>
          <Subtitle>Your Profile</Subtitle>
        </Header>

        <AvatarContainer>
          <AvatarCircle onClick={handleImageClick} uploading={uploading}>
            {selectedImage ? (
              <AvatarImage src={getImageUrl(selectedImage)} alt="Avatar" />
            ) : (
              <CameraIcon />
            )}
            {uploading && (
              <UploadOverlay>
                <Spinner />
              </UploadOverlay>
            )}
          </AvatarCircle>
          <EditButton onClick={handleImageClick} disabled={uploading}>
            <IoPencil size={18} color="white" />
          </EditButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
          />
        </AvatarContainer>

        <Form onSubmit={handleSaveProfile}>
          <InputRow>
            <InputGroup>
              <Label>First Name</Label>
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={uploading}
              />
            </InputGroup>
            <InputGroup>
              <Label>Last Name</Label>
              <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={uploading}
              />
            </InputGroup>
          </InputRow>

          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={uploading}
            />
          </InputGroup>

          <InputGroup>
            <Label>Phone Number</Label>
            <PhoneInputContainer>
              <CountrySelector
                type="button"
                onClick={() => setCountryModalVisible(true)}
                disabled={uploading}
              >
                {selectedCountryData ? (
                  <>
                    <FlagImage
                      src={`https://flagcdn.com/w40/${selectedCountryData.isoCode.toLowerCase()}.png`}
                      alt={selectedCountryData.name}
                    />
                    <PhoneCode>{selectedCountryData.phoneCode}</PhoneCode>
                  </>
                ) : (
                  <PhoneCode>+</PhoneCode>
                )}
                <IoChevronDown size={20} color="#333" />
              </CountrySelector>
              <PhoneInput
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={uploading}
              />
            </PhoneInputContainer>
          </InputGroup>

          <SaveButton type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save Changes'}
          </SaveButton>
        </Form>
      </Container>

      {countryModalVisible && (
        <ModalOverlay onClick={() => setCountryModalVisible(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Select Country</ModalTitle>
              <CloseButton onClick={() => setCountryModalVisible(false)}>
                <IoClose size={28} color="#333" />
              </CloseButton>
            </ModalHeader>
            <ModalList>
              {countries.map((item) => (
                <CountryItem
                  key={item.name}
                  onClick={() => {
                    setSelectedCountry(item.name);
                    setCountryModalVisible(false);
                  }}
                >
                  <FlagImage
                    src={`https://flagcdn.com/w40/${item.isoCode.toLowerCase()}.png`}
                    alt={item.name}
                  />
                  <CountryText>{`${item.name} (${item.phoneCode})`}</CountryText>
                </CountryItem>
              ))}
            </ModalList>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default ProfileSettings;