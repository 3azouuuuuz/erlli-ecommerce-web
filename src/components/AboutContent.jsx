import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { IoChevronDown, IoChevronUp, IoClose } from 'react-icons/io5';

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
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const items = {
    WhatIsErlli: {
      title: 'What is Erlli?',
      content: 'Erlli is a comprehensive e-commerce platform designed to connect buyers and sellers in a seamless marketplace. We provide tools for product listings, secure transactions, and customer engagement to help businesses grow and customers find what they need.'
    },
    ManagePrivacy: {
      title: 'How do I manage my privacy settings?',
      content: 'You can manage your privacy settings by going to Settings > Privacy. Here you can control who can see your profile information, purchase history, and contact details. We take your privacy seriously and provide granular controls over your data.'
    },
    ReportContent: {
      title: 'How do I report inappropriate content?',
      content: 'If you encounter inappropriate content, you can report it by clicking the "Report" button on the product or user profile. Our team reviews all reports within 24 hours and takes appropriate action to maintain a safe marketplace.'
    },
    SpeakToSeller: {
      title: 'How can I speak to a seller?',
      content: 'You can contact sellers directly through the messaging feature available on each product page. Click the "Contact Seller" button to start a conversation. All messages are stored in your inbox for easy reference.'
    },
    SubscriptionPurpose: {
      title: 'What is the purpose of subscriptions?',
      content: 'Subscriptions provide sellers with enhanced features including priority listings, advanced analytics, promotional tools, and lower transaction fees. Choose the plan that best fits your business needs to maximize your reach and sales.'
    },
    PromoteProducts: {
      title: 'How do I promote my products?',
      content: 'Promote your products by upgrading to a premium subscription, which gives you access to featured listings, social media integration, and promotional campaigns. You can also use our built-in marketing tools to reach more customers.'
    },
    Shipments: {
      title: 'How do shipments work?',
      content: 'Sellers are responsible for shipping products to buyers. You can integrate with major shipping carriers, print labels directly from the platform, and provide tracking information. Buyers receive automatic updates on their shipment status.'
    },
    BuyOrSell: {
      title: 'Can I both buy and sell on Erlli?',
      content: 'Yes! Your account allows you to both purchase products and sell your own items. Simply switch between buyer and seller modes in your dashboard. All transactions and communications are managed in one convenient location.'
    },
    MoreInfo: {
      title: 'Where can I find more information?',
      content: 'For more detailed information, visit our Help Center, check out our comprehensive documentation, or contact our support team directly. We\'re here to help you succeed on the Erlli platform.'
    }
  };

  return (
    <PageContainer>
      <Header>
        <CloseButton onClick={() => navigate(-1)}>
          <IoClose size={28} />
        </CloseButton>
        <HeaderTitle>Frequently Asked Questions</HeaderTitle>
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