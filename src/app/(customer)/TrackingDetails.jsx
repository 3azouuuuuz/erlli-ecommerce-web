import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import ProfileHeader from '../../components/ProfileHeader';
import { useTranslation } from 'react-i18next';
import { IoCopyOutline, IoCheckmarkCircle, IoArrowBack } from 'react-icons/io5';
import CryptoJS from 'crypto-js';
import { supabase } from '../../lib/supabase';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const Container = styled.div`
  padding: 80px 16px 20px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding-top: 100px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ECFDF5;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #D0FAE5;
    transform: scale(1.05);
  }
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #202020;
  margin: 0;
`;

const ProgressBarContainer = styled.div`
  border-radius: 12px;
  padding: 20px 16px;
  margin-bottom: 20px;
  position: relative;
`;

const ProgressTrack = styled.div`
  height: 24px;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  top: 25px;
  position: relative;
`;

const ProgressBackgroundShadow = styled.div`
  position: absolute;
  right: 17px;
  height: 14px;
  width: 95%;
  background-color: #D0FAE5;
  border-radius: 6px;
  top: 70%;
  transform: translateY(-6px);
  z-index: 0;
`;

const ProgressBackground = styled.div`
  position: absolute;
  height: 10px;
  width: 100%;
  border-radius: 4px;
  top: 50%;
  border: 2px solid white;
  transform: translateY(-4px);
  z-index: 2;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
`;

const ProgressFill = styled.div`
  position: absolute;
  height: 8px;
  background-color: #00BC7D;
  border-radius: 4px;
  border: 2px solid white;
  top: 50%;
  left: 2px;
  transform: translateY(-4px);
  z-index: 2;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const CircleShadow = styled.div`
  position: absolute;
  background-color: #D0FAE5;
  border-radius: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 70%;
  z-index: 0;
  transform: translateY(-19px);
`;

const CircleContainer = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 18px;
  width: 26px;
  height: 26px;
  border: 2px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  transform: translateY(-12px);
  z-index: 1;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
`;

const CircleWrapper = styled.div`
  position: absolute;
  width: 26px;
  height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  transform: translateY(-12px);
  z-index: 3;
`;

const Circle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 12px;
  background-color: ${props => props.$active ? '#00BC7D' : '#E0E0E0'};
  z-index: 3;
  transition: background-color 0.3s ease;
`;

const CloudContainer = styled.div`
  position: absolute;
  top: -20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 4;
  padding-top: 29px;

  ${props => props.$position === 'start' && `
    left: -21px;
    transform: translateX(5px);
  `}

  ${props => props.$position === 'middle' && `
    left: 51%;
    transform: translateX(-25px);
  `}

  ${props => props.$position === 'end' && `
    right: -17px;
    transform: translateX(-5px);
  `}
`;

const CloudBubble = styled.div`
  background-color: #10B981;
  border-radius: 15px;
  padding: 4px 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CloudText = styled.span`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #FFFFFF;
  text-align: center;
`;

const CloudTail = styled.div`
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #10B981;
  margin-top: -1px;
`;

const InfoContainer = styled.div`
  background-color: #F9F9F9;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TrackingLabel = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: -0.14px;
  color: #202020;
`;

const TrackingValue = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 0;
  color: #202020;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

const TrackingItem = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid #E0E0E0;
  &:last-child {
    border-bottom: none;
  }
`;

const TrackingItemHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const StatusRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const StatusText = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 17px;
  line-height: 21px;
  letter-spacing: -0.17px;
  color: #202020;
`;

const DateBadge = styled.div`
  background-color: #F9F9F9;
  padding: 4px 8px;
  border-radius: 4px;
`;

const DateText = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  font-size: 13px;
  line-height: 17px;
  letter-spacing: -0.13px;
  color: #000000;
`;

const DescriptionText = styled.p`
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0;
  color: #000000;
  margin: 0;
  padding-left: 3px;
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  gap: 16px;
`;

const Loader = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #D0FAE5;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const ToastMessage = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #10B981;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease;
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

// Status Definitions with translation support
const getStatusDefinitions = (t) => ({
  'STAT_0': { 
    title: t('TrackingAvailable'), 
    description: t('TrackingAvailableDescription') 
  },
  'STAT_97': { 
    title: t('LabelCreated'), 
    description: t('LabelCreatedDescription') 
  },
  'STAT_98': { 
    title: t('InvalidTrackingNumber'), 
    description: t('InvalidTrackingNumberDescription') 
  },
  'STAT_99': { 
    title: t('AuthenticationError'), 
    description: t('AuthenticationErrorDescription') 
  },
});

// Fetch Mondial Relay Tracking
const fetchMondialRelayTracking = async (trackingNumber, t) => {
  try {
    const { data, error } = await supabase.functions.invoke('mondial-relay-tracking', {
      body: { trackingNumber }
    });

    if (error) throw error;

    const stat = data.stat;
    const statusKey = `STAT_${stat}`;
    const STATUS_DEFINITIONS = getStatusDefinitions(t);
    const statusInfo = STATUS_DEFINITIONS[statusKey] || { 
      title: t('UnknownStatus'), 
      description: `${t('StatusCode')}: ${stat}` 
    };

    let progress = 0;
    if (stat === '0') progress = 50;
    else if (stat === '97') progress = 25;

    return {
      success: stat === '0',
      stat,
      progress,
      statusInfo,
      trackingDetails: [],
    };
  } catch (error) {
    console.error('Mondial Relay tracking error:', error);
    return {
      success: false,
      stat: 'ERROR',
      progress: 0,
      statusInfo: { 
        title: t('NetworkError'), 
        description: t('NetworkErrorDescription') 
      },
      trackingDetails: [],
    };
  }
};

const TrackingDetails = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  
  const trackingNumber = searchParams.get('trackingNumber');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchTracking = async () => {
      if (!trackingNumber) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await fetchMondialRelayTracking(trackingNumber, t);
      setTrackingData(result);
      setLoading(false);
    };

    fetchTracking();
  }, [trackingNumber, t]);

  const handleCopy = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (datetime) => {
    const date = new Date(datetime);
    const monthNames = [
      t('January'), t('February'), t('March'), t('April'), t('May'), t('June'),
      t('July'), t('August'), t('September'), t('October'), t('November'), t('December')
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}, ${day} ${hours}:${minutes}`;
  };

  const progress = trackingData?.progress || 0;
  const isProcessingActive = progress >= 0;
  const isShippedActive = progress >= 33;
  const isDeliveredActive = progress >= 66;

  const headerContent = (
    <Header>
      <HeaderLeft>
        <BackButton onClick={handleBack} aria-label={t('GoBack')}>
          <IoArrowBack size={20} color="#00BC7D" />
        </BackButton>
        <HeaderTitle>{t('TrackingDetails')}</HeaderTitle>
      </HeaderLeft>
    </Header>
  );

  if (loading) {
    return (
      <PageContainer>
        <ProfileHeader profile={profile} customContent={headerContent} />
        <Container>
          <LoaderContainer>
            <Loader />
            <LoadingText>{t('LoadingTrackingDetails')}</LoadingText>
          </LoaderContainer>
        </Container>
      </PageContainer>
    );
  }

  if (!trackingNumber) {
    return (
      <PageContainer>
        <ProfileHeader profile={profile} customContent={headerContent} />
        <Container>
          <EmptyState>
            <EmptyText>{t('NoTrackingNumberProvided')}</EmptyText>
          </EmptyState>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileHeader profile={profile} customContent={headerContent} />
      <Container>
        <ProgressBarContainer>
          {isProcessingActive && (
            <CloudContainer $position="start">
              <CloudBubble>
                <CloudText>{t('Processing')}</CloudText>
              </CloudBubble>
              <CloudTail />
            </CloudContainer>
          )}
          {isShippedActive && (
            <CloudContainer $position="middle">
              <CloudBubble>
                <CloudText>{t('Shipped')}</CloudText>
              </CloudBubble>
              <CloudTail />
            </CloudContainer>
          )}
          {isDeliveredActive && (
            <CloudContainer $position="end">
              <CloudBubble>
                <CloudText>{t('Delivered')}</CloudText>
              </CloudBubble>
              <CloudTail />
            </CloudContainer>
          )}

          <ProgressBackgroundShadow />

          <CircleShadow style={{ left: 0, transform: 'translate(9px, -19px)' }} />
          <CircleShadow style={{ left: '50%', transform: 'translate(-2.5px, -20px)' }} />
          <CircleShadow style={{ right: 0, transform: 'translate(-9.5px, -19px)' }} />

          <ProgressTrack>
            <ProgressBackground />
            <ProgressFill $progress={progress} />

            <CircleContainer style={{ left: 0 }} />
            <CircleContainer style={{ left: '50%', transform: 'translate(-12px, -12px) translateX(17px)' }} />
            <CircleContainer style={{ right: 0 }} />

            <CircleWrapper style={{ left: 0 }}>
              <Circle $active={isProcessingActive} />
            </CircleWrapper>
            <CircleWrapper style={{ left: '50%', transform: 'translate(-12px, -12px) translateX(17px)' }}>
              <Circle $active={isShippedActive} />
            </CircleWrapper>
            <CircleWrapper style={{ right: 0 }}>
              <Circle $active={isDeliveredActive} />
            </CircleWrapper>
          </ProgressTrack>
        </ProgressBarContainer>

        <InfoContainer>
          <InfoRow>
            <TrackingLabel>{t('TrackingNumber')}</TrackingLabel>
            <CopyButton onClick={handleCopy}>
              <IoCopyOutline size={16} color="#00BC7D" />
            </CopyButton>
          </InfoRow>
          <TrackingValue>{trackingNumber}</TrackingValue>
        </InfoContainer>

        {trackingData && (
          <TrackingItem>
            <TrackingItemHeader>
              <StatusRow>
                <StatusText>{trackingData.statusInfo.title}</StatusText>
                {trackingData.success && (
                  <IoCheckmarkCircle size={20} color="#00BC7D" />
                )}
              </StatusRow>
              <DateBadge>
                <DateText>{formatDate(new Date())}</DateText>
              </DateBadge>
            </TrackingItemHeader>
            <DescriptionText>{trackingData.statusInfo.description}</DescriptionText>
          </TrackingItem>
        )}

        {trackingData?.trackingDetails?.length === 0 && trackingData.stat === '97' && (
          <EmptyState>
            <EmptyText>{t('AwaitingCarrierPickup')}</EmptyText>
          </EmptyState>
        )}

        {showToast && (
          <ToastMessage>
            <IoCheckmarkCircle size={20} color="white" />
            <span>{t('TrackingNumberCopied')}</span>
          </ToastMessage>
        )}
      </Container>
    </PageContainer>
  );
};

export default TrackingDetails;