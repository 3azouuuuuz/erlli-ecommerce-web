import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, supabaseUrl } from '../../lib/constants';
import { IoCardOutline } from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';

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

const ContentSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
`;

const ConnectedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: linear-gradient(135deg, #F8F8FF 0%, #E8E8FF 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  border: 2px solid #635BFF;
`;

const StripeIcon = styled(IoCardOutline)`
  font-size: 48px;
  color: #635BFF;
  margin-bottom: 8px;
`;

const ConnectedText = styled.h2`
  font-size: 22px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #635BFF;
  margin: 0;
`;

const StatusText = styled.h2`
  font-size: 20px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #333;
  margin: 0;
`;

const InfoText = styled.p`
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
`;

const ActionButton = styled.button`
  padding: 16px 48px;
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
  margin-top: 16px;
  
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 20px;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #E8E8E8;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const ProcessingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const ProcessingCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 400px;
  text-align: center;
`;

const ProcessingTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 12px 0;
`;

const ProcessingText = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
  line-height: 1.6;
`;

const PayoutSettings = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processedCodes, setProcessedCodes] = useState(new Set());
  const messageTimeout = useRef(null);
  const stripeWindowRef = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      if (!profile?.id) {
        console.error('No profile ID found:', profile);
        alert('Profile not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Initializing with profile ID:', profile.id);

      try {
        // Use the authenticated supabase client from AuthContext
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', profile.id)
          .maybeSingle();

        console.log('Profile fetch result:', { profileData, profileError });

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          alert(`Failed to verify vendor status: ${profileError.message}`);
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.error('No profile found for ID:', profile.id);
          alert('Profile not found in database. Please contact support.');
          setLoading(false);
          return;
        }

        if (profileData.role !== 'vendor') {
          setIsVendor(false);
          setLoading(false);
          return;
        }

        setIsVendor(true);

        const { data, error } = await supabase
          .from('vendor_stripe_accounts')
          .select('stripe_account_id')
          .eq('vendor_id', profile.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching Stripe account:', error.message);
          alert('Failed to load Stripe account information');
          setLoading(false);
          return;
        }

        if (data?.stripe_account_id?.startsWith('acct_')) {
          setStripeAccountId(data.stripe_account_id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred');
        setLoading(false);
      }
    };

    initialize();
  }, [profile?.id]);

  // Listen for messages from popup window
  useEffect(() => {
    const handleMessage = async (event) => {
      // Security: Only accept messages from trusted domains
      if (!event.origin.includes('stripe.com') && 
          !event.origin.includes('erlli.com') && 
          !event.origin.includes('supabase')) {
        return;
      }

      console.log('Received message:', event.data);

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data.error) {
          alert(data.errorDescription || 'Failed to link Stripe account');
          setProcessing(false);
          if (stripeWindowRef.current) {
            stripeWindowRef.current.close();
          }
          return;
        }

        const { code, state } = data;
        if (!code || !state) {
          console.log('Invalid message format:', data);
          return;
        }

        if (processedCodes.has(code)) {
          console.log('Code already processed:', code);
          return;
        }

        // Debounce processing
        if (messageTimeout.current) {
          clearTimeout(messageTimeout.current);
        }

        messageTimeout.current = setTimeout(async () => {
          setProcessedCodes((prev) => new Set(prev).add(code));
          setProcessing(true);

          try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
              alert('Session expired. Please log in again.');
              setProcessing(false);
              if (stripeWindowRef.current) {
                stripeWindowRef.current.close();
              }
              return;
            }

            const response = await fetch(
              `${supabaseUrl}/functions/v1/complete-oauth`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ code, state, vendorId: profile.id }),
              }
            );

            const result = await response.json();
            console.log('complete-oauth Response:', result);

            if (result.error || !result.stripeAccountId) {
              alert(result.error || 'Failed to link Stripe account');
              setProcessing(false);
              if (stripeWindowRef.current) {
                stripeWindowRef.current.close();
              }
              return;
            }

            setStripeAccountId(result.stripeAccountId);
            
            // Close the popup window
            if (stripeWindowRef.current) {
              stripeWindowRef.current.close();
            }
            
            setProcessing(false);
            alert('Stripe account linked successfully!');
            
            // Navigate to AddProduct
            navigate('/vendor/AddProduct');
          } catch (error) {
            console.error('Error processing Stripe OAuth:', error);
            alert('Failed to process Stripe connection');
            setProcessing(false);
            if (stripeWindowRef.current) {
              stripeWindowRef.current.close();
            }
          }
        }, 500);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current);
      }
    };
  }, [profile?.id, processedCodes, navigate]);

  const handleLinkStripeAccount = async () => {
    if (!isVendor) {
      alert('You must be a vendor to link a Stripe account');
      return;
    }

    try {
      setLoading(true);
      
      // Get current session to include auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in again');
        setLoading(false);
        return;
      }

      console.log('Calling Edge Function with vendorId:', profile.id);
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-oauth-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ vendorId: profile.id }),
        }
      );

      const text = await response.text();
      console.log('generate-oauth-url response status:', response.status);
      console.log('generate-oauth-url response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        alert('Invalid server response');
        setLoading(false);
        return;
      }

      if (data.error || !data.url) {
        console.error('Error generating OAuth URL:', data);
        alert(data.error || 'Failed to start Stripe onboarding');
        setLoading(false);
        return;
      }

      // Open Stripe Connect in a new popup window
      const width = 800;
      const height = 900;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const stripeWindow = window.open(
        data.url,
        'stripe-connect',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!stripeWindow) {
        alert('Pop-up blocked! Please allow pop-ups for this site and try again.');
        setLoading(false);
        return;
      }

      stripeWindowRef.current = stripeWindow;
      setLoading(false);
      setProcessing(true);

      // Check if window is closed
      const checkClosed = setInterval(() => {
        if (stripeWindow.closed) {
          clearInterval(checkClosed);
          setProcessing(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Error initiating OAuth:', error);
      alert(`Failed to start onboarding: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <VendorHeader profile={profile} />
        <Container>
          <LoadingContainer>
            <Spinner />
            <LoadingText>Loading payout settings...</LoadingText>
          </LoadingContainer>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <VendorHeader profile={profile} />
      <Container>
        <Header>
          <PageTitle>Payout Settings</PageTitle>
          <PageSubtitle>Manage your Stripe Connect account</PageSubtitle>
        </Header>

        <ContentSection>
          {isVendor ? (
            stripeAccountId ? (
              <ConnectedContainer>
                <StripeIcon />
                <ConnectedText>Connected with Stripe</ConnectedText>
                <InfoText>
                  Your payout account is connected and ready to receive payments.
                  Payouts will be processed according to your Stripe settings.
                </InfoText>
              </ConnectedContainer>
            ) : (
              <>
                <StatusText>No Stripe Account Linked</StatusText>
                <InfoText>
                  Connect your Stripe account to receive payouts from sales.
                  You'll be redirected to Stripe to complete the onboarding process.
                </InfoText>
                <ActionButton onClick={handleLinkStripeAccount} disabled={loading || processing}>
                  {loading || processing ? 'Loading...' : 'Link Stripe Account'}
                </ActionButton>
              </>
            )
          ) : (
            <>
              <StatusText>Not a Vendor</StatusText>
              <InfoText>
                You need to be a vendor to manage payout settings.
                Switch to a vendor account to continue.
              </InfoText>
              <ActionButton onClick={() => navigate('/become-vendor')} disabled={loading}>
                Become a Vendor
              </ActionButton>
            </>
          )}
        </ContentSection>
      </Container>

      {/* Processing Overlay */}
      {processing && (
        <ProcessingOverlay>
          <ProcessingCard>
            <Spinner style={{ margin: '0 auto 20px' }} />
            <ProcessingTitle>Processing Stripe Connection</ProcessingTitle>
            <ProcessingText>
              Please complete the Stripe onboarding in the popup window.
              Do not close this page.
            </ProcessingText>
          </ProcessingCard>
        </ProcessingOverlay>
      )}
    </PageContainer>
  );
};

export default PayoutSettings;