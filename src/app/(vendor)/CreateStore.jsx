import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, CONTABO_BUCKET_NAME, CONTABO_ENDPOINT } from '../../lib/constants';
import { IoPencilOutline, IoCloseCircle, IoSearchOutline } from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';
import cameraIcon from '../../assets/images/camera.png';
import countries from '../../assets/countries';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FA;
`;

const Container = styled.div`
  padding: 80px 16px 40px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 8px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  margin: 0;
  color: #202020;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  line-height: 20px;
  letter-spacing: -0.21px;
  margin: 0 0 32px 0;
  color: #666;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
`;

const LogoCircle = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 3px dashed #00BC7D;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #00A86B;
    transform: scale(1.02);
  }
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const CameraIcon = styled.img`
  width: 34px;
  height: 27px;
`;

const EditButton = styled.button`
  position: absolute;
  top: 8px;
  right: calc(50% - 85px);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #00BC7D;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #00A86B;
    transform: scale(1.1);
  }
  
  svg {
    color: white;
    font-size: 18px;
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
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #333;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  background: #ECFDF5;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  box-sizing: border-box;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: #ECFDF5;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const AddressRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E8E8E8;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  margin: 0;
  color: #202020;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  svg {
    font-size: 24px;
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInput = styled(Input)`
  padding-right: 40px;
`;

const SearchIcon = styled(IoSearchOutline)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: #999;
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  
  svg {
    font-size: 20px;
    color: #999;
  }
  
  &:hover svg {
    color: #666;
  }
`;

const CountryList = styled.div`
  display: block;
  width: 100%;
`;

const CountrySection = styled.div`
  display: block;
  width: 100%;
  margin-bottom: 8px;
`;

const SectionHeader = styled.div`
  display: inline-block;
  background: #F9F9F9;
  border-radius: 8px;
  padding: 4px 12px;
  margin-bottom: 12px;
  margin-top: 16px;
  
  &:first-child {
    margin-top: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  margin: 0;
  color: #000;
`;

const CountryItem = styled.button`
  background: none;
  border: none;
  padding: 12px 0;
  text-align: left;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #000;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #00BC7D;
    padding-left: 8px;
  }
`;

const CreateStore = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Group countries by first letter
  const groupedCountries = countries
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((acc, country) => {
      const firstLetter = country.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(country);
      return acc;
    }, {});
  
  const sections = Object.keys(groupedCountries).map(letter => ({
    title: letter,
    data: groupedCountries[letter],
  }));
  
  // Filter countries based on search
  const filteredSections = searchQuery
    ? sections
        .map(section => ({
          ...section,
          data: section.data.filter(country =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(section => section.data.length > 0)
    : sections;
  
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Please select a JPEG or PNG image.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit');
      return;
    }
    
    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogo(e.target.result);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const uploadImageToContabo = async (file) => {
    try {
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });

      const fileName = `store_logos/${profile.id}/${Date.now()}.jpg`;

      const command = new PutObjectCommand({
        Bucket: CONTABO_BUCKET_NAME,
        Key: fileName,
        Body: arrayBuffer,
        ContentType: file.type,
        ACL: 'public-read',
      });

      await s3Client.send(command);

      const publicUrl = `${CONTABO_ENDPOINT}/${CONTABO_BUCKET_NAME}/${fileName}`;
      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };
  
  const handleCountrySelect = (countryName) => {
    setCountry(countryName);
    setModalVisible(false);
    setSearchQuery('');
  };
  
  const handleCreateStore = async () => {
    if (!storeName.trim()) {
      alert('Store name is required.');
      return;
    }
    
    if (!profile?.id) {
      alert('User profile is missing.');
      return;
    }
    
    setUploading(true);
    
    try {
      let logoUrl = null;
      
      // Upload logo if selected
      if (logoFile) {
        logoUrl = await uploadImageToContabo(logoFile);
      }
      
      const { error } = await supabase
        .from('stores')
        .insert([{
          vendor_id: profile.id,
          name: storeName,
          description: description || null,
          vat_number: vatNumber || null,
          country: country || null,
          city: city || null,
          state: state || null,
          zip_code: zipCode || null,
          address_line1: addressLine1 || null,
          logo_url: logoUrl || null,
        }]);
      
      if (error) {
        console.error('Error creating store:', error.message);
        alert('Failed to create store: ' + error.message);
        return;
      }
      
      alert('Your store has been created successfully!');
      navigate('/vendor/AddProduct');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <PageContainer>
      <VendorHeader profile={profile} />
      <Container>
        <Header>
          <PageTitle>Create Store</PageTitle>
          <PageSubtitle>Set up your store</PageSubtitle>
        </Header>
        
        <FormSection>
          <LogoContainer>
            <LogoCircle onClick={() => fileInputRef.current?.click()}>
              {logo ? (
                <LogoImage src={logo} alt="Store Logo" />
              ) : (
                <CameraIcon src={cameraIcon} alt="Upload" />
              )}
              {uploading && (
                <UploadOverlay>
                  <LoadingSpinner />
                </UploadOverlay>
              )}
            </LogoCircle>
            
            <EditButton onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <IoPencilOutline />
            </EditButton>
            
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageSelect}
            />
          </LogoContainer>
          
          <InputGroup>
            <Label>Store Name *</Label>
            <Input
              type="text"
              placeholder="Enter your store name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Description (Optional)</Label>
            <TextArea
              placeholder="Describe your store..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </InputGroup>
          
          <InputGroup>
            <Label>VAT Number (Optional)</Label>
            <Input
              type="text"
              placeholder="Enter VAT number"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
            />
          </InputGroup>
          
          <Label>Location</Label>
          
          <AddressRow>
            <InputGroup>
              <Input
                type="text"
                placeholder="Country (Optional)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onClick={() => setModalVisible(true)}
                readOnly
                style={{ cursor: 'pointer' }}
              />
            </InputGroup>
            
            <InputGroup>
              <Input
                type="text"
                placeholder="City (Optional)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </InputGroup>
          </AddressRow>
          
          <AddressRow>
            <InputGroup>
              <Input
                type="text"
                placeholder="State (Optional)"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </InputGroup>
            
            <InputGroup>
              <Input
                type="text"
                placeholder="Zip Code (Optional)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </InputGroup>
          </AddressRow>
          
          <InputGroup>
            <Input
              type="text"
              placeholder="Street Address (Optional)"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
            />
          </InputGroup>
        </FormSection>
        
        <SubmitButton onClick={handleCreateStore} disabled={uploading}>
          {uploading ? 'Creating Store...' : 'Create Store'}
        </SubmitButton>
      </Container>
      
      {/* Country Selection Modal */}
      {modalVisible && (
        <ModalOverlay onClick={() => setModalVisible(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Select Country</ModalTitle>
              <CloseButton onClick={() => setModalVisible(false)}>
                <IoCloseCircle />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <SearchContainer>
                <SearchInput
                  type="text"
                  placeholder="Search Country"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery ? (
                  <ClearSearchButton onClick={() => setSearchQuery('')}>
                    <IoCloseCircle />
                  </ClearSearchButton>
                ) : (
                  <SearchIcon />
                )}
              </SearchContainer>
              
              <CountryList>
                {filteredSections.map((section) => (
                  <div key={section.title}>
                    <SectionHeader>
                      <SectionTitle>{section.title}</SectionTitle>
                    </SectionHeader>
                    {section.data.map((country) => (
                      <CountryItem
                        key={country.name}
                        onClick={() => handleCountrySelect(country.name)}
                      >
                        {country.name}
                      </CountryItem>
                    ))}
                  </div>
                ))}
              </CountryList>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default CreateStore;