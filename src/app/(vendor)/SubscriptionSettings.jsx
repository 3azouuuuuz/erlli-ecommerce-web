import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { IoChevronBack, IoChevronDown, IoChevronUp } from 'react-icons/io5';

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

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  margin: 0;
  color: #000;
`;

const SectionTitle = styled.h2`
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 30px;
  letter-spacing: -0.21px;
  margin: 0 0 20px 0;
  color: #000;
`;

const SettingsBox = styled.button`
  background: ${props => props.$active ? 'rgba(0, 188, 125, 0.05)' : 'transparent'};
  border: none;
  border-bottom: ${props => props.$active ? '2px solid #00BC7D' : '1px solid rgba(0, 0, 0, 0.1)'};
  padding: 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
  border-radius: 8px;

  &:hover {
    background: rgba(0, 188, 125, 0.05);
    border-color: rgba(0, 188, 125, 0.2);
    transform: translateX(4px);
  }

  &:active {
    background: rgba(0, 188, 125, 0.08);
  }
`;

const SettingsLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Nunito Sans', sans-serif;
  line-height: 21px;
  color: #000000;
`;

const SubText = styled.span`
  font-size: 14px;
  font-weight: 400;
  font-family: 'Nunito Sans', sans-serif;
  color: #666;
  display: block;
  margin-top: 4px;
`;

const ArrowIcon = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #00BC7D;
`;

const HistoryDropdown = styled.div`
  padding: 24px;
  background: #FFFFFF;
  border-radius: 13px;
  margin-top: 8px;
  border: 1px solid rgba(210, 210, 210, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const NoHistoryText = styled.p`
  font-size: 14px;
  font-weight: 400;
  font-family: 'Nunito Sans', sans-serif;
  color: #666;
  text-align: center;
  padding: 16px 0;
  margin: 0;
`;

const HistoryItem = styled.div`
  background: #F9F9F9;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(210, 210, 210, 0.2);

  &:last-child {
    margin-bottom: 0;
  }
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const HistoryPlanName = styled.span`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000;
  text-transform: uppercase;
`;

const HistoryPrice = styled.span`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Nunito Sans', sans-serif;
  color: #00BC7D;
`;

const HistoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HistoryDetail = styled.span`
  font-size: 13px;
  font-weight: 400;
  font-family: 'Nunito Sans', sans-serif;
  color: #666;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  padding: 20px 12px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  text-align: left;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(217, 116, 116, 0.05);
    transform: translateX(4px);
  }
`;

const DeleteText = styled.span`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Nunito Sans', sans-serif;
  line-height: 21px;
  color: #D97474;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 188, 125, 0.3);
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SubscriptionSettings = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (!profile || profile.role !== 'vendor') {
      navigate('/');
      return;
    }
    fetchSubscriptionData();
  }, [profile, navigate]);

  const fetchSubscriptionData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      // Fetch current subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      } else {
        setSubscription(subData);
      }

      // Fetch billing history
      const { data: historyData, error: historyError } = await supabase
        .from('billing_history')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching billing history:', historyError);
      } else {
        setBillingHistory(historyData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPlanName = (planName) => {
    if (!planName) return t('Free');
    const capitalizedPlan = planName.charAt(0).toUpperCase() + planName.slice(1);
    return t(capitalizedPlan) || capitalizedPlan;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(t('locale') || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewPlans = () => {
    navigate('/vendor/available-plans');
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm(t('CancelSubscriptionConfirm'))) {
      return;
    }

    try {
      setLoading(true);
      
      const now = new Date().toISOString();
      const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert(
          {
            profile_id: profile.id,
            plan_name: 'free',
            price: 0.00,
            status: 'active',
            stripe_subscription_id: null,
            start_date: now,
            end_date: endDate,
            updated_at: now,
          },
          { onConflict: 'profile_id' }
        );

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

      alert(t('DowngradedToFree'));
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert(t('CancelSubscriptionError'));
    } finally {
      setLoading(false);
    }
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

  return (
    <PageContainer>
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/vendor/settings')}>
            <IoChevronBack />
          </BackButton>
          <PageTitle>{t('SubscriptionSettings')}</PageTitle>
        </Header>

        <SectionTitle>{t('CurrentPlan')}</SectionTitle>
        <SettingsBox as="div">
          <div>
            <SettingsLabel>{formatPlanName(subscription?.plan_name || 'free')}</SettingsLabel>
            <SubText>${subscription?.price || 0.00}/{t('Month')}</SubText>
          </div>
        </SettingsBox>

        <SettingsBox onClick={handleViewPlans}>
          <SettingsLabel>{t('ViewOtherPlans')}</SettingsLabel>
        </SettingsBox>

        <SettingsBox 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          $active={isHistoryOpen}
        >
          <SettingsLabel>{t('BillingHistory')}</SettingsLabel>
          <ArrowIcon>{isHistoryOpen ? <IoChevronUp /> : <IoChevronDown />}</ArrowIcon>
        </SettingsBox>

        {isHistoryOpen && (
          <HistoryDropdown>
            {billingHistory.length === 0 ? (
              <NoHistoryText>{t('NoBillingHistory')}</NoHistoryText>
            ) : (
              billingHistory.map((record) => (
                <HistoryItem key={record.id}>
                  <HistoryHeader>
                    <HistoryPlanName>{formatPlanName(record.plan_name)}</HistoryPlanName>
                    <HistoryPrice>${record.price}/{t('Month')}</HistoryPrice>
                  </HistoryHeader>
                  <HistoryDetails>
                    <HistoryDetail>
                      {t('Status')}: {t(record.status.charAt(0).toUpperCase() + record.status.slice(1))}
                    </HistoryDetail>
                    <HistoryDetail>
                      {t('Changed')}: {formatDate(record.created_at)}
                    </HistoryDetail>
                    <HistoryDetail>
                      {t('Period')}: {formatDate(record.subscription_start_date)} - {formatDate(record.subscription_end_date)}
                    </HistoryDetail>
                  </HistoryDetails>
                </HistoryItem>
              ))
            )}
          </HistoryDropdown>
        )}

        {subscription?.plan_name !== 'free' && (
          <DeleteButton onClick={handleCancelSubscription}>
            <DeleteText>{t('CancelSubscription')}</DeleteText>
          </DeleteButton>
        )}
      </Container>
    </PageContainer>
  );
};

export default SubscriptionSettings;