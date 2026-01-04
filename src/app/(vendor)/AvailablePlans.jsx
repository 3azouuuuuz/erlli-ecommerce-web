import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, stripePublishableKey } from '../../lib/constants';
import { useTranslation } from 'react-i18next';
import { IoChevronBack } from 'react-icons/io5';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Confetti from 'react-confetti';
import kingIcon from '../../assets/images/kingicon.png';
import bgPlan from '../../assets/images/bgplan.png';

// Fix "process is not defined" in Vite
if (typeof process === 'undefined') {
  window.process = { env: {} };
}
window.process.env = {
  REACT_APP_SUPABASE_URL: 'https://fhfjbtsvwdtvudpvsxyj.supabase.co',
  REACT_APP_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZmpidHN2d2R0dnVkcHZzeHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5ODQ2MjgsImV4cCI6MjA1NTU2MDYyOH0.jvx0zrUUSwCWA4jK6TOLVbIRjDMC5tzyhJhXaVHvTp8',
};

const stripePromise = loadStripe(stripePublishableKey);

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding-top: 80px;
  padding-bottom: 60px;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 40px;
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
  svg { font-size: 20px; color: #666; }
  &:hover {
    background: #00BC7D;
    svg { color: white; }
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  margin: 0;
  color: #000;
`;

const UpgradeHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
`;

const KingIcon = styled.img`
  width: 52px;
  height: 52px;
  margin-bottom: 16px;
`;

const UpgradeText = styled.p`
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 28px;
  text-align: center;
  color: #333;
  margin: 0;
`;

const ExperienceText = styled.p`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  color: #333;
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 30px;
  letter-spacing: -0.21px;
  margin: 0 0 32px 0;
  color: #000;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  margin-bottom: 40px;
  padding-top: 50px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlanWrapper = styled.div`
  position: relative;
  cursor: pointer;
  height: 300px;
  display: flex;
  flex-direction: column;
`;

const PlanCard = styled.div`
  display: flex;
  flex: 1;
  border: ${props => props.$selected ? '2px solid #00BC7D' : '1px solid rgba(210, 210, 210, 0.2)'};
  border-radius: ${props => props.$hasBadge ? '0 0 13px 13px' : '13px'};
  overflow: hidden;
  background: ${props => props.$selected ? 'rgba(0, 188, 125, 0.05)' : 'white'};
  box-shadow: ${props => props.$selected ? '0 8px 24px rgba(0, 188, 125, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.$selected
      ? '0 12px 32px rgba(0, 188, 125, 0.2)'
      : '0 8px 20px rgba(0, 0, 0, 0.12)'};
    border-color: ${props => props.$selected ? '#00BC7D' : 'rgba(0, 188, 125, 0.3)'};
  }
`;

const RecommendedBadge = styled.div`
  position: absolute;
  top: -50px;
  left: 0;
  right: 0;
  height: 50px;
  background: ${props => props.$subscribed ? '#000' : '#00BC7D'};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 13px 13px 0 0;
  z-index: 2;
`;

const BadgeText = styled.span`
  color: white;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LeftHalf = styled.div`
  flex: 1;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
`;

const RightHalf = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const PlanBackground = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlanName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000;
  text-transform: uppercase;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
`;

const PlanPrice = styled.span`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000;
`;

const MonthText = styled.span`
  font-size: 16px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
  color: rgba(31, 31, 31, 0.5);
  margin-bottom: 5px;
`;

const DiscountText = styled.p`
  font-size: 14px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0 0 16px 0;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Checkmark = styled.span`
  font-size: 16px;
  color: #28A745;
  font-weight: bold;
`;

const FeatureText = styled.span`
  font-size: 14px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
  color: #333;
`;

const ContactText = styled.p`
  font-size: 12px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
  color: #666;
  font-style: italic;
  margin: 8px 0 0 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 0;
`;

const ChooseButton = styled.button`
  width: 100%;
  max-width: 400px;
  padding: 16px 32px;
  background: #00BC7D;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover:not(:disabled) {
    background: #00A56D;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 188, 125, 0.3);
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Payment Modal Styles
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
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000;
  margin-bottom: 24px;
  text-align: center;
`;

const ModalLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #333;
  display: block;
  margin-bottom: 12px;
`;

const CardElementContainer = styled.div`
  padding: 16px;
  border: 2px solid #E8E8E8;
  border-radius: 10px;
  margin-bottom: 24px;
  background: #FAFAFA;
  transition: all 0.3s ease;
  &:focus-within {
    border-color: #00BC7D;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #00D68F 0%, #00BC7D 100%);
    color: white;
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 188, 125, 0.3);
    }
  ` : `
    background: #E8E8E8;
    color: #333;
    &:hover {
      background: #D8D8D8;
    }
  `}
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #FFEBEE;
  color: #C62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
`;

// Payment Form Component
const PaymentForm = ({ plan, onSuccess, onCancel, stripeCustomerId, profile }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: profile?.email || '',
          name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        },
      });

      if (pmError) throw new Error(pmError.message);

      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            customerId: stripeCustomerId,
            paymentMethodId: paymentMethod.id,
            plan: plan.name,
          }),
        }
      );

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      if (result.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret);
        if (confirmError) throw new Error(confirmError.message);
      }

      await onSuccess(paymentMethod.id, result.subscriptionId);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalTitle>{t('PayFor')} {plan.displayName}</ModalTitle>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <ModalLabel>{t('CardDetails')}</ModalLabel>
      <CardElementContainer>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#333',
                fontFamily: 'Raleway, sans-serif',
                '::placeholder': { color: '#999' },
              },
            },
          }}
        />
      </CardElementContainer>
      <ModalButtons>
        <ModalButton type="button" onClick={onCancel} disabled={processing}>
          {t('Cancel')}
        </ModalButton>
        <ModalButton type="submit" $primary disabled={!stripe || processing}>
          {processing ? t('Processing') : `${t('Pay')} $${plan.price}/${t('month')}`}
        </ModalButton>
      </ModalButtons>
    </form>
  );
};

// Main Component
const AvailablePlans = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const plans = [
    {
      name: 'free',
      displayName: t('FreePlan'),
      price: 0.00,
      features: [
        t('AddUpTo10Products'),
        t('Commission12'),
        t('CommunitySupport'),
      ],
      isRecommended: false,
    },
    {
      name: 'pro',
      displayName: t('ProPlan'),
      price: 9.32,
      discountText: t('PerfectToSave10'),
      features: [
        t('AddUpTo50Products'),
        t('Commission10'),
      ],
      isRecommended: true,
    },
    {
      name: 'business',
      displayName: t('BusinessPlan'),
      price: t('Custom'),
      features: [
        t('UnlimitedProducts'),
        t('CustomCommissionRate'),
      ],
      isRecommended: false,
      isCustom: true,
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== 'vendor') {
      alert(t('AccessDeniedVendorsOnly'));
      navigate('/');
      return;
    }
    fetchSubscription();
  }, [profile, navigate, t]);

  const fetchSubscription = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', profile.id)
        .single();
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionError);
      } else {
        setSubscription(subscriptionData);
      }
      const { data: customerData, error: customerError } = await supabase
        .from('user_stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!customerError && customerData?.stripe_customer_id) {
        setStripeCustomerId(customerData.stripe_customer_id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanClick = (plan) => {
    // Prevent selecting the currently active plan
    if (subscription?.plan_name === plan.name && subscription?.status === 'active') {
      return;
    }
    setSelectedPlan(selectedPlan?.name === plan.name ? null : plan);
  };

  const handleChoosePlan = async () => {
    if (!selectedPlan) return;
    
    // Check if user already has this plan active
    if (subscription?.plan_name === selectedPlan.name && subscription?.status === 'active') {
      alert(t('AlreadySubscribedToPlan'));
      return;
    }
    
    if (selectedPlan.isCustom) {
      navigate('/contact');
      return;
    }
    if (selectedPlan.name === 'free') {
      if (window.confirm(t('DowngradeToFreeConfirm'))) {
        await activateFreePlan();
      }
      return;
    }
    if (!stripeCustomerId) {
      alert(t('NoStripeCustomerID'));
      return;
    }
    setShowPaymentModal(true);
  };

  const activateFreePlan = async () => {
    try {
      const now = new Date().toISOString();
      const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          profile_id: profile.id,
          plan_name: 'free',
          price: 0.00,
          status: 'active',
          stripe_subscription_id: null,
          start_date: now,
          end_date: endDate,
          updated_at: now,
        }, { onConflict: 'profile_id' });
      if (subscriptionError) throw subscriptionError;
      const { error: billingError } = await supabase
        .from('billing_history')
        .insert({
          profile_id: profile.id,
          plan_name: 'free',
          price: 0.00,
          status: 'active',
          created_at: now,
          subscription_start_date: now,
          subscription_end_date: endDate,
        });
      if (billingError) throw billingError;
      setSubscription({
        plan_name: 'free',
        price: 0.00,
        status: 'active',
        start_date: now,
        end_date: endDate,
      });
      await refreshProfile();
      triggerConfetti();
      setSelectedPlan(null);
      alert(t('FreePlanActivated'));
    } catch (error) {
      console.error('Error:', error);
      alert(t('FailedToActivateFreePlan'));
    }
  };

  const handlePaymentSuccess = async (paymentMethodId, subscriptionId) => {
    try {
      const now = new Date().toISOString();
      const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          profile_id: profile.id,
          plan_name: selectedPlan.name,
          price: selectedPlan.price,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          start_date: now,
          end_date: endDate,
          updated_at: now,
        }, { onConflict: 'profile_id' });
      if (subscriptionError) throw subscriptionError;
      const { error: billingError } = await supabase
        .from('billing_history')
        .insert({
          profile_id: profile.id,
          plan_name: selectedPlan.name,
          price: selectedPlan.price,
          status: 'active',
          payment_method_id: paymentMethodId,
          stripe_subscription_id: subscriptionId,
          created_at: now,
          subscription_start_date: now,
          subscription_end_date: endDate,
        });
      if (billingError) throw billingError;
      setSubscription({
        plan_name: selectedPlan.name,
        price: selectedPlan.price,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        start_date: now,
        end_date: endDate,
      });
      await refreshProfile();
      setShowPaymentModal(false);
      setSelectedPlan(null);
      triggerConfetti();
      alert(t('SubscriptionActivated'));
    } catch (error) {
      console.error('Error:', error);
      alert(t('FailedToSaveSubscription'));
      throw error;
    }
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <LoadingContainer>
            <Spinner />
          </LoadingContainer>
        </Container>
      </PageContainer>
    );
  }

  const isProSubscribed = subscription?.plan_name === 'pro' && subscription?.status === 'active';
  const isFreePlan = subscription?.plan_name === 'free' && subscription?.status === 'active';

  return (
    <PageContainer>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/vendor/subscription-settings')}>
            <IoChevronBack />
          </BackButton>
          <PageTitle>{t('Subscription')}</PageTitle>
        </Header>
        <UpgradeHeader>
          <KingIcon src={kingIcon} alt="Crown" />
          <UpgradeText>{t('ChooseYourPlanFor')}</UpgradeText>
          <ExperienceText>{t('BestExperience')}</ExperienceText>
        </UpgradeHeader>
        <SectionTitle>{t('ChooseAPlan')}</SectionTitle>
        <PlansGrid>
          {plans.map((plan) => {
            const showBadge = plan.name === 'pro' && (isProSubscribed || isFreePlan);
            const badgeText = plan.name === 'pro' && isProSubscribed ? t('Subscribed') : t('Recommended');
            const isCurrentPlan = subscription?.plan_name === plan.name && subscription?.status === 'active';
            
            return (
              <PlanWrapper
                key={plan.name}
                $hasBadge={showBadge}
                onClick={() => handlePlanClick(plan)}
                style={{ 
                  cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                  opacity: isCurrentPlan ? 0.7 : 1 
                }}
              >
                {showBadge && (
                  <RecommendedBadge $subscribed={badgeText === t('Subscribed')}>
                    <BadgeText>{badgeText}</BadgeText>
                  </RecommendedBadge>
                )}
                <PlanCard 
                  $selected={selectedPlan?.name === plan.name} 
                  $hasBadge={showBadge}
                  style={{ pointerEvents: isCurrentPlan ? 'none' : 'auto' }}
                >
                  <LeftHalf>
                    <PlanName>{plan.displayName}</PlanName>
                    <PriceContainer>
                      <PlanPrice>
                        {typeof plan.price === 'number' ? `${plan.price}` : plan.price}
                      </PlanPrice>
                      {typeof plan.price === 'number' && <MonthText>/{t('Month')}</MonthText>}
                    </PriceContainer>
                    {plan.discountText && <DiscountText>{plan.discountText}</DiscountText>}
                    <FeaturesList>
                      {plan.features.map((feature, index) => (
                        <Feature key={index}>
                          <Checkmark>✓</Checkmark>
                          <FeatureText>{feature}</FeatureText>
                        </Feature>
                      ))}
                    </FeaturesList>
                    {plan.isCustom && <ContactText>{t('ContactUsForPricing')}</ContactText>}
                  </LeftHalf>
                  <RightHalf>
                    <PlanBackground src={bgPlan} alt="Plan background" />
                  </RightHalf>
                </PlanCard>
              </PlanWrapper>
            );
          })}
        </PlansGrid>
        <ButtonContainer>
          <ChooseButton
            onClick={handleChoosePlan}
            disabled={!selectedPlan}
          >
            {selectedPlan?.isCustom ? t('ContactUs') : t('ChoosePlan')}
          </ChooseButton>
        </ButtonContainer>
      </Container>
      {showPaymentModal && selectedPlan && (
        <Elements stripe={stripePromise}>
          <ModalOverlay onClick={() => setShowPaymentModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <PaymentForm
                plan={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentModal(false)}
                stripeCustomerId={stripeCustomerId}
                profile={profile}
              />
            </ModalContent>
          </ModalOverlay>
        </Elements>
      )}
    </PageContainer>
  );
};

export default AvailablePlans;