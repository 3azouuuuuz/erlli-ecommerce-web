import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/ShopHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
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
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  color: #202020;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TabButton = styled.button`
  padding: 12px 32px;
  border-radius: 18px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? '#D0FAE5' : '#F9F9F9'};
  color: ${props => props.active ? '#00BC7D' : '#000'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  padding: 40px 0;
`;

const VoucherContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const VoucherCard = styled.div`
  position: relative;
  display: flex;
  background: ${props => props.expiringSoon ? '#FFEBEB' : 'white'};
  border: 1px solid ${props => props.expiringSoon ? '#F2B8B8' : '#00BC7D'};
  border-radius: 10px;
  padding: 24px;
  min-height: 140px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
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
  background: #F9F9F9;
  z-index: 1;
`;

const LeftCircleBorder = styled.div`
  position: absolute;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 24px;
  border: 1px solid ${props => props.expiringSoon ? '#F2B8B8' : '#00BC7D'};
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
  background: #F9F9F9;
  z-index: 1;
`;

const RightCircleBorder = styled.div`
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 24px;
  border: 1px solid ${props => props.expiringSoon ? '#F2B8B8' : '#00BC7D'};
  border-right: none;
  border-radius: 10px 0 0 10px;
  background: white;
  z-index: 2;
`;

const DashedLine = styled.div`
  position: absolute;
  left: 20px;   /* offset from left circle */
  right: 20px;  /* offset from right circle */
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
    background-image: linear-gradient(to right, ${props => props.expiringSoon ? '#F2B8B8' : '#00BC7D'} 60%, transparent 60%);
    background-size: 8px 1px;
    background-repeat: repeat-x;
  }
`;


const VoucherLeft = styled.div`
  flex: 1;
  padding-right: 24px;
`;

const VoucherLabel = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.expiringSoon ? '#D97474' : '#00BC7D'};
  font-family: 'Raleway', sans-serif;
  display: block;
  margin-bottom: 8px;
`;

const VoucherTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 8px 0;
`;

const VoucherDiscount = styled.p`
  font-size: 14px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const VoucherRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const DaysLeftText = styled.span`
  font-size: 11px;
  color: #D97474;
  font-family: 'Raleway', sans-serif;
  position: absolute;
  top: -30px;
  right: 0;
`;

const ValidityContainer = styled.div`
  background: ${props => props.expiringSoon ? '#F2B8B8' : '#F9F9F9'};
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 8px;
`;

const ValidityText = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #000;
  font-family: 'Raleway', sans-serif;
`;

const CollectButton = styled.button`
  background: ${props => props.disabled ? '#CCCCCC' : '#00BC7D'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  position: absolute;
  bottom: 0;
  right: 0;

  &:hover {
    background: ${props => props.disabled ? '#CCCCCC' : '#00A66A'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
`;

const IconContainer = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.16);
`;

const VoucherImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #00BC7D;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
`;

const VoucherIcon = styled.img`
  width: 23px;
  height: 23px;
  object-fit: contain;
`;

const ProgressTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 8px 0;
`;

const ProgressDescription = styled.p`
  font-size: 11px;
  color: #000;
  font-family: 'Raleway', sans-serif;
  line-height: 1.6;
  margin: 0;
`;

const Vouchers = () => {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();
  
  const [selectedButton, setSelectedButton] = useState('Milestones');
  const [progressVouchers, setProgressVouchers] = useState([]);
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [userRewards, setUserRewards] = useState([]);

  useEffect(() => {
    const fetchVouchers = async () => {
      if (!profile) {
        console.log('No profile available');
        return;
      }

      const { data: progressRewardsData, error: progressRewardsError } = await supabase
        .from('rewards')
        .select('*');

      if (progressRewardsError) {
        console.error('Error fetching progress rewards:', progressRewardsError.message);
        return;
      }

      const { data: activeRewardsData, error: activeRewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', 1);

      if (activeRewardsError) {
        console.error('Error fetching active rewards:', activeRewardsError.message);
        return;
      }

      const { data: userRewardsData, error: userRewardsError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', profile.id);

      if (userRewardsError) {
        console.error('Error fetching user rewards:', userRewardsError.message);
        return;
      }

      setUserRewards(userRewardsData || []);

      // Filter to only include "First Purchase" reward (id 1)
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
    };

    fetchVouchers();
  }, [profile]);

  const handleCollectPress = async (voucherId) => {
    const voucher = activeVouchers.find(v => v.id === voucherId);
    if (!voucher || voucher.isCollected) {
      return;
    }

    const collectionDate = new Date();
    const validityDate = new Date(collectionDate);
    validityDate.setDate(collectionDate.getDate() + 7);

    const { error } = await supabase
      .from('user_rewards')
      .upsert({
        user_id: profile.id,
        reward_id: voucherId,
        is_collected: true,
        collected_at: collectionDate.toISOString(),
        validity: validityDate.toISOString().split('T')[0],
      }, { onConflict: ['user_id', 'reward_id'] });

    if (error) {
      console.error('Error collecting voucher:', error.message);
      alert('Failed to collect voucher. Please try again.');
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
    alert('Voucher collected successfully!');
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
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}.${day}.${year}`;
  };

  const renderActiveReward = (voucher) => {
    const { expiringSoon, daysLeft } = getExpiryInfo(voucher.validity);
    const isExpired = daysLeft < 0;

    return (
      <VoucherContainer key={voucher.id}>
        <LeftCircle />
        <LeftCircleBorder expiringSoon={expiringSoon} />
        <RightCircle />
        <RightCircleBorder expiringSoon={expiringSoon} />
        <DashedLine expiringSoon={expiringSoon} />
        <VoucherCard expiringSoon={expiringSoon}>
          <VoucherLeft>
            <VoucherLabel expiringSoon={expiringSoon}>Voucher</VoucherLabel>
            <VoucherTitle>{voucher.title}</VoucherTitle>
            <VoucherDiscount>{voucher.discount}</VoucherDiscount>
          </VoucherLeft>
          <VoucherRight>
            {expiringSoon && !isExpired && (
              <DaysLeftText>{daysLeft} Days Left</DaysLeftText>
            )}
            <ValidityContainer expiringSoon={expiringSoon}>
              <ValidityText>Valid until {formatValidityDate(voucher.validity)}</ValidityText>
            </ValidityContainer>
            <CollectButton
              onClick={() => !voucher.isCollected && handleCollectPress(voucher.id)}
              disabled={voucher.isCollected || isExpired}
            >
              {voucher.isCollected
                ? (voucher.isUsed ? 'Used' : 'Use')
                : 'Collect'}
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
          <Title>Vouchers</Title>
        </Header>

        <ButtonContainer>
          <TabButton
            active={selectedButton === 'Active Rewards'}
            onClick={() => setSelectedButton('Active Rewards')}
          >
            Active Rewards
          </TabButton>
          <TabButton
            active={selectedButton === 'Milestones'}
            onClick={() => setSelectedButton('Milestones')}
          >
            Milestones
          </TabButton>
        </ButtonContainer>

        <Content>
          {selectedButton === 'Active Rewards' ? (
            activeVouchers.length > 0 ? (
              activeVouchers.map(voucher => renderActiveReward(voucher))
            ) : (
              <NoItemsText>No active rewards available</NoItemsText>
            )
          ) : (
            progressVouchers.length > 0 ? (
              <ProgressGrid>
                {progressVouchers.map(item => renderProgressItem(item))}
              </ProgressGrid>
            ) : (
              <NoItemsText>No vouchers available</NoItemsText>
            )
          )}
        </Content>
      </Container>
    </PageContainer>
  );
};

export default Vouchers;