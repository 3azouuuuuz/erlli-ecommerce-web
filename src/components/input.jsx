import React from 'react';
import styled from 'styled-components';
import { hp, wp } from '../helpers/common';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #F8F8F8;
  border-color: #ddd;
  border-radius: 59px;
  padding: 0 ${wp(1.6)}px;
  height: ${hp(7)}px;
  box-sizing: border-box;

  ${({ iconPosition }) => iconPosition === 'right' && `
    flex-direction: row-reverse;
  `}

  ${({ containerStyles }) => containerStyles};
`;

const InputField = styled.input`
  flex: 1;
  font-size: ${hp(2)}px;
  color: #333;
  background: none;
  border: none;
  outline: none;
  font-family: 'Arial', sans-serif;

  ${({ style }) => style};
`;

const IconContainer = styled.div`
  justify-content: center;
  align-items: center;
  margin-left: ${wp(1)}px;

  ${({ iconPosition }) => iconPosition === 'right' && `
    margin-left: 0;
    margin-right: ${wp(1)}px;
  `};
`;

const IconImage = styled.img`
  width: 19px;
  height: 16px;
  object-fit: contain;
`;

const Input = (props) => {
  const { icon, iconPosition, containerStyles, style, ...inputProps } = props;

  return (
    <Container iconPosition={iconPosition} containerStyles={containerStyles}>
      <InputField
        placeholderTextColor="#aaa"
        {...inputProps}
        style={style}
      />
      {icon && (
        <IconContainer iconPosition={iconPosition}>
          {React.isValidElement(icon) ? (
            props.icon
          ) : (
            <IconImage src={icon} alt="input icon" />
          )}
        </IconContainer>
      )}
    </Container>
  );
};

export default Input;