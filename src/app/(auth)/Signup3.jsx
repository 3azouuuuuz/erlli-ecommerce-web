import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle, css } from 'styled-components';
import { hp, wp } from '../../helpers/common';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, CONTABO_BUCKET_NAME, CONTABO_ENDPOINT } from '../../lib/constants';
import Button from '../../components/Button';
import bubble1 from '../../assets/images/bubble1.png';
import bubble2 from '../../assets/images/bubble2.png';
import cameraIcon from '../../assets/images/camera.png';

// Global style to prevent horizontal overflow
const GlobalStyle = createGlobalStyle`
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
  min-height: 100vh;
  justify-content: center;
  align-items: center;
`;

const BubbleImage = styled.img`
  width: ${wp(19)};
  height: auto;
`;

const Bubble1 = styled(BubbleImage)`
  margin-top: ${hp(-8)};
  margin-left: ${wp(-32)};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

const Bubble2 = styled(BubbleImage)`
  margin-top: ${hp(2)};
  margin-right: ${wp(-34)};
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  image-rendering: auto;
`;

const Header = styled.div`
  margin-top: 0;
  position: relative;
  z-index: 2;
  text-align: center;
`;

const HeaderText = styled.h1`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 50px;
  line-height: 54px;
  letter-spacing: -0.5px;
  color: #202020;
  word-wrap: break-word;
`;

const CameraContainer = styled.div`
  justify-content: center;
  align-items: center;
  margin-top: ${hp(10)};
  z-index: 3;
  cursor: pointer;
  position: relative;
`;

const CameraInnerCircle = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 70px;
  background-color: white;
  justify-content: center;
  align-items: center;
  border: 3px dashed #00BC7D;
  display: flex;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 70px;
  object-fit: cover;
`;

const CameraIcon = styled.img`
  width: 34px;
  height: 27px;
  object-fit: contain;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const LoadingSpinner = styled.div`
  ${({ loading }) =>
    loading &&
    css`
      border: 4px solid #f3f3f3;
      border-top: 4px solid #00BC7D;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      margin-left: 10px;
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
  margin-top: ${hp(20)};
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
`;

function Signup3() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { email, password, phone, country, firstName, lastName, addressLine1, addressLine2, state, city, zipCode, role } =
    location.state || {};

  // Log state on render
  useEffect(() => {
    console.log('Signup3 state on render:', {
      email,
      password,
      phone,
      country,
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      state,
      city,
      zipCode,
      role,
      selectedImage,
    });
  }, [email, password, phone, country, firstName, lastName, addressLine1, addressLine2, state, city, zipCode, role, selectedImage]);

  const pickImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Please select a JPEG or PNG image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size exceeds 5MB limit');
        return;
      }

      // Store the actual file for upload
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      alert('Please select an image first.');
      return null;
    }

    try {
      const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${selectedFile.name.split('.').pop()}`;

      console.log('Uploading to Contabo S3...');

      // Read the file as an ArrayBuffer
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(selectedFile);
      });

      // Prepare the S3 upload command
      const command = new PutObjectCommand({
        Bucket: CONTABO_BUCKET_NAME,
        Key: `public/${fileName}`,
        Body: arrayBuffer,
        ContentType: selectedFile.type,
        ACL: 'public-read',
      });

      // Upload to Contabo S3
      await s3Client.send(command);

      console.log('Upload successful:', fileName);

      // Construct the public URL
      const publicUrl = `${CONTABO_ENDPOINT}/${CONTABO_BUCKET_NAME}/public/${fileName}`;

      console.log('Image uploaded successfully, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', {
        message: error.message,
        name: error.name,
        details: error,
      });

      if (error.name === 'AccessDenied') {
        alert('Storage permission error. Please contact support to enable avatar uploads.');
      } else if (error.name === 'NoSuchBucket') {
        alert('Storage bucket not configured. Please contact support.');
      } else {
        alert('Failed to upload image. Please try again or contact support.');
      }
      return null;
    }
  };

  const handleSignUp = async () => {
    console.log('Signup3 state on submit:', {
      email,
      password,
      phone,
      country,
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      state,
      city,
      zipCode,
      role,
      selectedImage,
    });

    if (!email || !password || !firstName || !lastName) {
      alert('Missing required fields. Please complete all signup steps from the beginning.');
      navigate('/auth/signup', { replace: true });
      return;
    }

    if (!selectedFile) {
      alert('Please select a profile picture.');
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileData) {
        alert('An account with this email already exists. Please use a different email or log in.');
        setLoading(false);
        return;
      }

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Email check error:', profileError);
        alert('Failed to check email availability. Please try again.');
        setLoading(false);
        return;
      }

      // Upload image to Contabo S3
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        setLoading(false);
        return;
      }

      console.log('Creating user account...');

      // Sign up user with Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: 'https://auth.erlli.com/verify-email',
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        alert(`Signup Failed: ${authError.message}`);
        setLoading(false);
        return;
      }

      const userId = user?.id;
      if (!userId) {
        alert('Failed to retrieve user ID. Please try again.');
        setLoading(false);
        return;
      }

      console.log('User created with ID:', userId);
      console.log('Inserting profile data...');

      // Insert profile data
      const { error: profileInsertError } = await supabaseAdmin.from('profiles').insert([
        {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          phone,
          address_line1: addressLine1,
          address_line2: addressLine2,
          state,
          city,
          zip_code: zipCode,
          email,
          role,
          country,
          avatar_url: imageUrl,
        },
      ]);

      if (profileInsertError) {
        console.error('Profile insert error:', profileInsertError);
        alert('Failed to create profile. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Profile created successfully');

      // Create subscription for vendors
      if (role === 'vendor') {
        console.log('Creating vendor subscription...');
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            profile_id: userId,
            plan_name: 'free',
            price: 0.00,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (subscriptionError) {
          console.error('Subscription error:', subscriptionError);
          alert('Failed to create subscription. Please try again.');
          setLoading(false);
          return;
        }
        console.log('Subscription created successfully');
      }

      console.log('Creating Stripe customer...');

      // Create Stripe customer
      const response = await fetch(`https://fhfjbtsvwdtvudpvsxyj.supabase.co/functions/v1/create-stripe-customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZmpidHN2d2R0dnVkcHZzeHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5ODQ2MjgsImV4cCI6MjA1NTU2MDYyOH0.jvx0zrUUSwCWA4jK6TOLVbIRjDMC5tzyhJhXaVHvTp8`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          email: email,
          name: `${firstName} ${lastName}`,
        }),
      });

      const responseBody = await response.json();
      console.log('Full Stripe response:', responseBody); // ADDED THIS LINE
      
      const { customerId, error: customerError } = responseBody;

      if (customerError || !response.ok) {
        console.error('Stripe customer error:', customerError || responseBody);
        alert('Failed to create payment profile. Please try again.');
        setLoading(false);
        return;
      }

      if (!customerId) {
        alert('Payment profile ID is missing. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Stripe customer created:', customerId);
      console.log('Saving Stripe customer ID...');

      const { error: stripeCustomerError } = await supabaseAdmin
        .from('user_stripe_customers')
        .insert({
          user_id: userId,
          stripe_customer_id: customerId,
        });

      if (stripeCustomerError) {
        console.error('Stripe customer insert error:', stripeCustomerError);
        alert('Failed to save payment profile. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Signup completed successfully!');
      alert('Signup Successful! Check your email to confirm your account.');
      navigate('/auth/login');
    } catch (err) {
      console.error('Unexpected error:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
      alert('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Bubble1 src={bubble1} alt="Bubble 1" />
        <Bubble2 src={bubble2} alt="Bubble 2" />
        <Header>
          <HeaderText>Final Touch, Ready?</HeaderText>
        </Header>
        <CameraContainer>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={pickImage}
            style={{ display: 'none' }}
            id="imageInput"
          />
          <label htmlFor="imageInput">
            <CameraInnerCircle>
              {selectedImage ? (
                <AvatarImage src={selectedImage} alt="Selected Avatar" />
              ) : (
                <CameraIcon src={cameraIcon} alt="Camera Icon" />
              )}
            </CameraInnerCircle>
          </label>
        </CameraContainer>
        <Footer>
          <Button
            title="Submit"
            onPress={handleSignUp}
            $buttonStyle={{
              width: '335px',
              height: '61px',
              backgroundColor: '#00BC7D',
              borderRadius: '16px',
              padding: `${hp(1.5)}px 0`,
            }}
            $textStyle={{
              fontSize: '22px',
              fontFamily: 'NunitoSans',
              fontWeight: '300',
              lineHeight: '31px',
            }}
            $hasShadow={false}
            loading={loading}
          >
            <LoadingSpinner loading={loading} />
          </Button>
          <CancelText onClick={() => navigate(-1)}>Cancel</CancelText>
        </Footer>
      </Container>
    </>
  );
}

export default Signup3;