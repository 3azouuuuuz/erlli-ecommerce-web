import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/ShopHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { IoLockClosed, IoCheckmarkCircle, IoTime, IoGift } from 'react-icons/io5';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #FAFAFA 0%, #FFFFFF 100%);
  padding-top: 80px;
  padding-bottom: 60px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #000;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TabButton = styled.button`
  padding: 14px 36px;
  border-radius: 14px;
  border: 2px solid ${props => props.$active ? '#00BC7D' : '#E8E8E8'};
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? 'linear-gradient(135deg, #D0FAE5 0%, #B8F5D8 100%)' : 'white'};
  color: ${props => props.$active ? '#00BC7D' : '#666'};
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(0, 188, 125, 0.2)' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: #00BC7D;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const NoItemsText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 60px 20px;
`;

const VoucherContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const VoucherCard = styled.div`
  position: relative;
  display: flex;
  background: ${props => props.$expiringSoon 
    ? 'linear-gradient(135deg, #FFF5F5 0%, #FFE8E8 100%)' 
    : props.$isLocked 
    ? 'linear-gradient(135deg, #F5F5F5 0%, #ECECEC 100%)'
    : 'linear-gradient(135deg, #FFFFFF 0%, #F9F9F9 100%)'};
  border: 2px solid ${props => props.$expiringSoon ? '#FFD4D4' : props.$isLocked ? '#CCCCCC' : '#00BC7D'};
  border-radius: 16px;
  padding: 28px;
  min-height: 160px;
  box-shadow: 0 4px 16px ${props => props.$expiringSoon 
    ? 'rgba(255, 77, 79, 0.1)' 
    : props.$isLocked
    ? 'rgba(0, 0, 0, 0.05)'
    : 'rgba(0, 188, 125, 0.1)'};
  transition: all 0.3s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$expiringSoon 
      ? 'linear-gradient(90deg, #FF4D4F 0%, #FF7875 100%)' 
      : props.$isLocked
      ? 'linear-gradient(90deg, #999 0%, #CCC 100%)'
      : 'linear-gradient(90deg, #00BC7D 0%, #00E89D 100%)'};
  }

  &:hover {
    box-shadow: 0 8px 24px ${props => props.$expiringSoon 
      ? 'rgba(255, 77, 79, 0.15)' 
      : props.$isLocked
      ? 'rgba(0, 0, 0, 0.08)'
      : 'rgba(0, 188, 125, 0.15)'};
    transform: ${props => props.$isLocked ? 'none' : 'translateY(-2px)'};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const LeftCircle = styled.div`
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FAFAFA;
  z-index: 1;
`;

const LeftCircleBorder = styled.div`
  position: absolute;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 24px;
  border: 2px solid ${props => props.$expiringSoon ? '#FFD4D4' : props.$isLocked ? '#CCCCCC' : '#00BC7D'};
  border-left: none;
  border-radius: 0 10px 10px 0;
  background: white;
  z-index: 2;
`;

const RightCircle = styled.div`
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FAFAFA;
  z-index: 1;
`;

const RightCircleBorder = styled.div`
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 24px;
  border: 2px solid ${props => props.$expiringSoon ? '#FFD4D4' : props.$isLocked ? '#CCCCCC' : '#00BC7D'};
  border-right: none;
  border-radius: 10px 0 0 10px;
  background: white;
  z-index: 2;
`;

const DashedLine = styled.div`
  position: absolute;
  left: 20px;
  right: 20px;
  top: 50%;
  height: 1px;
  display: flex;
  justify-content: space-between;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 1px;
    background-image: linear-gradient(to right, ${props => props.$expiringSoon ? '#FFD4D4' : props.$isLocked ? '#CCCCCC' : '#00BC7D'} 60%, transparent 60%);
    background-size: 8px 1px;
    background-repeat: repeat-x;
  }
`;

const VoucherLeft = styled.div`
  flex: 1;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VoucherHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VoucherIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$expiringSoon 
    ? '#FFE8E8' 
    : props.$isLocked 
    ? '#E8E8E8'
    : '#D0FAE5'};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 24px;
    color: ${props => props.$expiringSoon ? '#FF4D4F' : props.$isLocked ? '#999' : '#00BC7D'};
  }
`;

const VoucherLabel = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$expiringSoon ? '#D32F2F' : props.$isLocked ? '#999' : '#00BC7D'};
  font-family: 'Raleway', sans-serif;
`;

const VoucherTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$isLocked ? '#999' : '#202020'};
  margin: 0;
`;

const VoucherDiscount = styled.p`
  font-size: 15px;
  color: ${props => props.$isLocked ? '#BBB' : '#666'};
  font-family: 'Raleway', sans-serif;
  margin: 0;
  font-weight: 500;
`;

const LockMessage = styled.p`
  font-size: 13px;
  color: #999;
  font-family: 'Raleway', sans-serif;
  margin: 8px 0 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: italic;

  svg {
    font-size: 14px;
  }
`;

const VoucherRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;
  min-width: 180px;

  @media (max-width: 768px) {
    align-items: flex-start;
    width: 100%;
  }
`;

const DaysLeftBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$expiringSoon ? '#FF4D4F' : '#00BC7D'};
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  svg {
    font-size: 14px;
  }
`;

const ValidityContainer = styled.div`
  background: ${props => props.$expiringSoon ? '#FFE8E8' : '#F0FDF9'};
  border: 2px solid ${props => props.$expiringSoon ? '#FFD4D4' : '#D0FAE5'};
  border-radius: 8px;
  padding: 8px 14px;
  margin: 8px 0;
`;

const ValidityText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$expiringSoon ? '#D32F2F' : '#00BC7D'};
  font-family: 'Raleway', sans-serif;
`;

const CollectButton = styled.button`
  background: ${props => props.disabled 
    ? '#CCCCCC' 
    : props.$isUsed 
    ? '#666'
    : 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(0, 188, 125, 0.3)'};

  &:hover {
    background: ${props => props.disabled 
      ? '#CCCCCC' 
      : props.$isUsed
      ? '#666'
      : 'linear-gradient(135deg, #00A66A 0%, #008F5A 100%)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 16px rgba(0, 188, 125, 0.4)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }

  svg {
    font-size: 18px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 32px;
  padding-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
`;

const ProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F9F9F9 100%);
  border-radius: 16px;
  border: 2px solid #E8E8E8;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #00BC7D;
  }
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D0FAE5 0%, #B8F5D8 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 188, 125, 0.2);
`;

const VoucherImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #00BC7D;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const VoucherIcon = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

const ProgressTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 12px 0;
`;

const ProgressDescription = styled.p`
  font-size: 13px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  line-height: 1.6;
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #E0E0E0;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Vouchers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  
  const [selectedButton, setSelectedButton] = useState('Milestones');
  const [progressVouchers, setProgressVouchers] = useState([]);
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [hasFirstPurchase, setHasFirstPurchase] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkFirstPurchase = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, user_id, status')
        .eq('user_id', userId)
        .eq('status', 'succeeded')
        .limit(1);
      
      if (error) {
        console.error('Error checking first purchase:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error in checkFirstPurchase:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const purchaseStatus = await checkFirstPurchase(profile.id);
      setHasFirstPurchase(purchaseStatus);

      const { data: progressRewardsData, error: progressRewardsError } = await supabase
        .from('rewards')
        .select('*');

      if (progressRewardsError) {
        console.error('Error fetching progress rewards:', progressRewardsError.message);
        setLoading(false);
        return;
      }

      const { data: activeRewardsData, error: activeRewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', 1);

      if (activeRewardsError) {
        console.error('Error fetching active rewards:', activeRewardsError.message);
        setLoading(false);
        return;
      }

      const { data: userRewardsData, error: userRewardsError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', profile.id);

      if (userRewardsError) {
        console.error('Error fetching user rewards:', userRewardsError.message);
        setLoading(false);
        return;
      }

      setUserRewards(userRewardsData || []);

      const mergedProgressVouchers = progressRewardsData
        .filter(reward => reward.id === 1)
        .map(reward => ({
          id: reward.id,
          title: reward.title,
          description: reward.description,
          discount: reward.discount,
          validity: reward.validity,
          isCollected: false,
          isUsed: false,
        }));

      const mergedActiveVouchers = activeRewardsData.map(reward => {
        const userReward = userRewardsData?.find(ur => ur.reward_id === reward.id);
        return {
          id: reward.id,
          title: reward.title,
          description: reward.description,
          discount: reward.discount,
          validity: userReward?.validity || reward.validity,
          isCollected: userReward?.is_collected || false,
          isUsed: userReward?.is_used || false,
        };
      });

      setProgressVouchers(mergedProgressVouchers);
      setActiveVouchers(mergedActiveVouchers);
      setLoading(false);
    };

    fetchVouchers();
  }, [profile]);

  const handleCollectPress = async (voucherId) => {
    const voucher = activeVouchers.find(v => v.id === voucherId);
    
    if (!voucher || voucher.isCollected) {
      return;
    }

    const currentPurchaseStatus = await checkFirstPurchase(profile.id);
    
    if (!currentPurchaseStatus) {
      alert(t('FirstPurchaseRequired'));
      return;
    }
    
    setHasFirstPurchase(true);

    const collectionDate = new Date();
    const validityDate = new Date(collectionDate);
    validityDate.setDate(collectionDate.getDate() + 7);

    const upsertData = {
      user_id: profile.id,
      reward_id: voucherId,
      is_collected: true,
      collected_at: collectionDate.toISOString(),
      validity: validityDate.toISOString().split('T')[0],
    };

    const { error } = await supabase
      .from('user_rewards')
      .upsert(upsertData, { onConflict: ['user_id', 'reward_id'] });

    if (error) {
      console.error('Error collecting voucher:', error);
      alert(t('FailedToCollectVoucher'));
      return;
    }

    const newUserReward = {
      user_id: profile.id,
      reward_id: voucherId,
      is_collected: true,
      is_used: false,
      collected_at: collectionDate.toISOString(),
      validity: validityDate.toISOString().split('T')[0],
    };

    setActiveVouchers(activeVouchers.map(v =>
      v.id === voucherId ? { ...v, isCollected: true, validity: validityDate.toISOString().split('T')[0] } : v
    ));
    setUserRewards([...userRewards, newUserReward]);
    setSelectedButton('Active Rewards');
    
    alert(t('VoucherCollectedSuccessfully'));
  };

  const getExpiryInfo = (validity) => {
    const currentDate = new Date();
    const expiryDate = new Date(validity);
    const timeDiff = expiryDate - currentDate;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const expiringSoon = daysDiff >= 0 && daysDiff <= 3;
    return { expiringSoon, daysLeft: daysDiff };
  };

  const formatValidityDate = (validity) => {
    const date = new Date(validity);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderActiveReward = (voucher) => {
    const { expiringSoon, daysLeft } = getExpiryInfo(voucher.validity);
    const isExpired = voucher.isCollected && daysLeft < 0;
    const isLocked = !hasFirstPurchase && !voucher.isCollected;

    return (
      <VoucherContainer key={voucher.id}>
        <LeftCircle />
        <LeftCircleBorder $expiringSoon={expiringSoon} $isLocked={isLocked} />
        <RightCircle />
        <RightCircleBorder $expiringSoon={expiringSoon} $isLocked={isLocked} />
        <DashedLine $expiringSoon={expiringSoon} $isLocked={isLocked} />
        <VoucherCard $expiringSoon={expiringSoon} $isLocked={isLocked}>
          <VoucherLeft>
            <VoucherHeader>
              <VoucherIconWrapper $expiringSoon={expiringSoon} $isLocked={isLocked}>
                {isLocked ? <IoLockClosed /> : <IoGift />}
              </VoucherIconWrapper>
              <VoucherLabel $expiringSoon={expiringSoon} $isLocked={isLocked}>
                {isLocked ? t('LockedVoucher') : t('VoucherLabel')}
              </VoucherLabel>
            </VoucherHeader>
            <VoucherTitle $isLocked={isLocked}>{voucher.title}</VoucherTitle>
            <VoucherDiscount $isLocked={isLocked}>{voucher.discount}</VoucherDiscount>
            {isLocked && (
              <LockMessage>
                <IoLockClosed />
                {t('CompleteFirstPurchaseToUnlock')}
              </LockMessage>
            )}
          </VoucherLeft>
          <VoucherRight>
            {expiringSoon && !isExpired && voucher.isCollected && (
              <DaysLeftBadge $expiringSoon={expiringSoon}>
                <IoTime />
                {daysLeft} {daysLeft === 1 ? t('Day') : t('Days')} {t('DaysLeft')}
              </DaysLeftBadge>
            )}
            {!isLocked && voucher.isCollected && (
              <ValidityContainer $expiringSoon={expiringSoon}>
                <ValidityText $expiringSoon={expiringSoon}>
                  {t('ValidUntil')}: {formatValidityDate(voucher.validity)}
                </ValidityText>
              </ValidityContainer>
            )}
            <CollectButton
              onClick={() => !voucher.isCollected && !isLocked && handleCollectPress(voucher.id)}
              disabled={voucher.isCollected || isExpired || isLocked}
              $isUsed={voucher.isUsed}
            >
              {isLocked ? (
                <>
                  <IoLockClosed />
                  {t('Locked')}
                </>
              ) : voucher.isCollected ? (
                voucher.isUsed ? (
                  <>
                    <IoCheckmarkCircle />
                    {t('UsedVoucher')}
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle />
                    {t('Collected')}
                  </>
                )
              ) : (
                <>
                  <IoGift />
                  {t('CollectNow')}
                </>
              )}
            </CollectButton>
          </VoucherRight>
        </VoucherCard>
      </VoucherContainer>
    );
  };

  const renderProgressItem = (item) => {
    return (
      <ProgressItem key={item.id}>
        <IconContainer>
          <VoucherImage>
            <VoucherIcon 
              src={`/images/v${item.id}.png`}
              alt={item.title}
              onError={(e) => e.target.src = '/images/v1.png'}
            />
          </VoucherImage>
        </IconContainer>
        <ProgressTitle>{item.title}</ProgressTitle>
        <ProgressDescription>{item.description}</ProgressDescription>
      </ProgressItem>
    );
  };

  if (loading) {
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
          <LoadingContainer>
            <Spinner />
          </LoadingContainer>
        </Container>
      </PageContainer>
    );
  }

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
          <Title>{t('Vouchers')}</Title>
          <Subtitle>{t('CollectAndUseRewards')}</Subtitle>
        </Header>

        <ButtonContainer>
          <TabButton
            $active={selectedButton === 'Active Rewards'}
            onClick={() => setSelectedButton('Active Rewards')}
          >
            {t('ActiveRewards')}
          </TabButton>
          <TabButton
            $active={selectedButton === 'Milestones'}
            onClick={() => setSelectedButton('Milestones')}
          >
            {t('Milestones')}
          </TabButton>
        </ButtonContainer>

        <Content>
          {selectedButton === 'Active Rewards' ? (
            activeVouchers.length > 0 ? (
              activeVouchers.map(voucher => renderActiveReward(voucher))
            ) : (
              <NoItemsText>{t('NoActiveRewardsAvailable')}</NoItemsText>
            )
          ) : (
            progressVouchers.length > 0 ? (
              <ProgressGrid>
                {progressVouchers.map(item => renderProgressItem(item))}
              </ProgressGrid>
            ) : (
              <NoItemsText>{t('NoMilestonesAvailable')}</NoItemsText>
            )
          )}
        </Content>
      </Container>
    </PageContainer>
  );
};

export default Vouchers;