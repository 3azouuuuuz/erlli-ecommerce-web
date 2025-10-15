import React from 'react';
import styled from 'styled-components';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';

const SpecificationsContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
`;

const SectionTitle = styled.h3`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
`;

const SpecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const SpecCard = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid #e8eaed;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: #00BC7D;
  }

  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`;

const SpecIconBox = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    font-size: 22px;
  }
`;

const SpecContent = styled.div`
  flex: 1;
`;

const SpecLabel = styled.div`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
`;

const SpecValue = styled.div`
  font-size: 17px;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.3;
  letter-spacing: -0.2px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f0f2f5;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 40px auto;
  display: block;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin: 32px auto;
  }
`;

const NoSpecsText = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  text-align: center;
  margin: 32px 0;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 15px;
    margin: 24px 0;
  }
`;

const SpecificationsSection = ({ variations, loading, condition }) => {
  return (
    <SpecificationsContainer>
      <SectionHeader>
        <IconWrapper>
          <IoShieldCheckmarkOutline size={24} />
        </IconWrapper>
        <SectionTitle>Specifications</SectionTitle>
      </SectionHeader>

      {loading ? (
        <LoadingSpinner />
      ) : variations.length > 0 ? (
        <SpecGrid>
          {variations[0].material && (
            <SpecCard>
              <SpecIconBox>📦</SpecIconBox>
              <SpecContent>
                <SpecLabel>Material</SpecLabel>
                <SpecValue>{variations[0].material}</SpecValue>
              </SpecContent>
            </SpecCard>
          )}
          <SpecCard>
            <SpecIconBox>✨</SpecIconBox>
            <SpecContent>
              <SpecLabel>Condition</SpecLabel>
              <SpecValue>{condition ? condition.replace(' ', '') : 'New'}</SpecValue>
            </SpecContent>
          </SpecCard>
          <SpecCard>
            <SpecIconBox>🌍</SpecIconBox>
            <SpecContent>
              <SpecLabel>Shipping</SpecLabel>
              <SpecValue>Worldwide</SpecValue>
            </SpecContent>
          </SpecCard>
          <SpecCard>
            <SpecIconBox>🔄</SpecIconBox>
            <SpecContent>
              <SpecLabel>Returns</SpecLabel>
              <SpecValue>30 Days</SpecValue>
            </SpecContent>
          </SpecCard>
        </SpecGrid>
      ) : (
        <NoSpecsText>No specifications available</NoSpecsText>
      )}
    </SpecificationsContainer>
  );
};

export default SpecificationsSection;