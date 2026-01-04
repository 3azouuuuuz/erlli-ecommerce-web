import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { IoChevronDown, IoChevronUp, IoClose } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E0E0E0;
  gap: 12px;
  @media (max-width: 768px) {
    padding: 16px;
  }
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  transition: all 0.2s ease;
  color: #00BC7D;
  &:hover {
    opacity: 0.7;
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }
`;
const HeaderTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
  margin-left: 5px;
`;
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (max-width: 768px) {
    padding: 24px 16px;
    gap: 16px;
  }
`;
const Card = styled.div`
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  @media (max-width: 768px) {
    padding: 16px;
  }
`;
const CardHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
  gap: 16px;
`;
const TitleContainer = styled.div`
  flex: 1;
`;
const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
  line-height: 1.4;
`;
const ChevronIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00BC7D;
  transition: transform 0.3s ease;
  flex-shrink: 0;
`;
const CardContent = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F0F0F0;
  animation: slideDown 0.3s ease;
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
const CardText = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #000;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
`;

const AboutContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const items = {
    WhatIsErlli: {
      title: t('WhatIsErlli'),
      content: t('WhatIsErlliContent')
    },
    ManagePrivacy: {
      title: t('ManagePrivacy'),
      content: t('ManagePrivacyContent')
    },
    ReportContent: {
      title: t('ReportContent'),
      content: t('ReportContentContent')
    },
    SpeakToSeller: {
      title: t('SpeakToSeller'),
      content: t('SpeakToSellerContent')
    },
    SubscriptionPurpose: {
      title: t('SubscriptionPurpose'),
      content: t('SubscriptionPurposeContent')
    },
    PromoteProducts: {
      title: t('PromoteProducts'),
      content: t('PromoteProductsContent')
    },
    Shipments: {
      title: t('Shipments'),
      content: t('ShipmentsContent')
    },
    BuyOrSell: {
      title: t('BuyOrSell'),
      content: t('BuyOrSellContent')
    },
    MoreInfo: {
      title: t('MoreInfo'),
      content: t('MoreInfoContent')
    }
  };

  return (
    <PageContainer>
      <Header>
        <CloseButton onClick={() => navigate(-1)}>
          <IoClose size={28} />
        </CloseButton>
        <HeaderTitle>{t('FrequentlyAskedQuestions')}</HeaderTitle>
      </Header>
    
      <Container>
        {Object.keys(items).map(itemKey => (
          <Card key={itemKey}>
            <CardHeader onClick={() => toggleExpand(itemKey)}>
              <TitleContainer>
                <CardTitle>{items[itemKey].title}</CardTitle>
              </TitleContainer>
              <ChevronIcon>
                {expandedItems[itemKey] ? (
                  <IoChevronUp size={20} />
                ) : (
                  <IoChevronDown size={20} />
                )}
              </ChevronIcon>
            </CardHeader>
            {expandedItems[itemKey] && (
              <CardContent>
                <CardText>{items[itemKey].content}</CardText>
              </CardContent>
            )}
          </Card>
        ))}
      </Container>
    </PageContainer>
  );
};

export default AboutContent;