// Erlli Web/src/components/Checkbox.jsx
import React from 'react';
import styled from 'styled-components';
import { hp } from '../helpers/common';

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: ${({ $containerBg }) => $containerBg || 'transparent'};
  border-radius: 59px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 0;
  border: none;
  position: relative;
  &:hover {
    background-color: ${({ $containerBg }) => $containerBg || 'transparent'};
  }
  &:active {
    transform: scale(0.98);
  }
`;

const CheckboxLabel = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.1px;
  color: ${({ $textColor }) => $textColor || '#333333'};
  margin: 0;
  padding-left: 20px;
  flex: 1;
  text-align: left;
`;

const CheckboxBox = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${({ $checked, $checkboxBg }) => ($checked ? $checkboxBg : '#e0e0e0')};
  border-radius: 50%;
  background-color: ${({ $checked, $checkboxBg }) => ($checked ? $checkboxBg : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
`;

const Tick = styled.span`
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  display: ${({ $checked }) => ($checked ? 'block' : 'none')};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Checkbox = ({
  label,
  onChange,
  checked,
  containerBg = 'transparent',
  checkboxBg = '#00bc7d',
  textColor = '#333333',
  ...rest
}) => {
  return (
    <CheckboxContainer
      $containerBg={containerBg}
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      {...rest}
    >
      <CheckboxLabel $textColor={textColor}>{label}</CheckboxLabel>
      <CheckboxBox $checked={checked} $checkboxBg={checkboxBg}>
        <Tick $checked={checked}>✓</Tick>
      </CheckboxBox>
    </CheckboxContainer>
  );
};

export default Checkbox;