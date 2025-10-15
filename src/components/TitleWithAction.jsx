import React from 'react';
import styled from 'styled-components';
import { IoTimeOutline, IoArrowForward } from 'react-icons/io5';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 30px;
  letter-spacing: -0.21px;
  color: #202020;
`;

const FlashSaleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ClockIcon = styled(IoTimeOutline)`
  font-size: ${props => props.size || '17'}px;
  color: ${props => props.color || '#202020'};
`;

const TimeContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
`;

const TimeCell = styled.div`
  background-color: #FFEBEB;
  border-radius: 7px;
  height: 27px;
  min-width: 30px;
  padding: 0 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TimeText = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  line-height: 1;
`;

const Colon = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
`;

const SeeAllButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(3px);
  }
  
  &:active {
    transform: translateX(1px);
  }
`;

const SeeAllText = styled.span`
  font-size: 15px;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  line-height: 17px;
  font-weight: 700;
`;

const ArrowContainer = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #00BC7D;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
  
  ${SeeAllButton}:hover & {
    background-color: #00E89D;
    transform: scale(1.1);
  }
  
  ${SeeAllButton}:active & {
    transform: scale(0.95);
  }
`;

const ArrowIcon = styled(IoArrowForward)`
  font-size: 14px;
  color: #ffffff;
`;

const TitleWithAction = ({
  title,
  showClock = false,
  onPress,
  clockColor = '#202020',
  clockSize = 17,
  titleStyle,
  timer = '00:00:00:00'
}) => {
  const timerParts = timer.split(':');

  return (
    <Container>
      <Title style={titleStyle}>{title}</Title>
      {showClock ? (
        <FlashSaleContainer>
          <ClockIcon size={clockSize} color={clockColor} />
          <TimeContainer>
            <TimeCell>
              <TimeText>{timerParts[0]}</TimeText>
            </TimeCell>
            <Colon>:</Colon>
            <TimeCell>
              <TimeText>{timerParts[1]}</TimeText>
            </TimeCell>
            <Colon>:</Colon>
            <TimeCell>
              <TimeText>{timerParts[2]}</TimeText>
            </TimeCell>
            <Colon>:</Colon>
            <TimeCell>
              <TimeText>{timerParts[3]}</TimeText>
            </TimeCell>
          </TimeContainer>
        </FlashSaleContainer>
      ) : (
        <SeeAllButton onClick={onPress}>
          <SeeAllText>See All</SeeAllText>
          <ArrowContainer>
            <ArrowIcon />
          </ArrowContainer>
        </SeeAllButton>
      )}
    </Container>
  );
};

export default TitleWithAction;