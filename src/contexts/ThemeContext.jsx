import React, { createContext, useContext, useState } from 'react';
// Import bubble images
import bubble67 from '../assets/images/bubble67.png';
import bubble68 from '../assets/images/bubble68.png';
import bubble67_blue from '../assets/images/bubble67_blue.png';
import bubble68_blue from '../assets/images/bubble68_blue.png';
import bubble67_brown from '../assets/images/bubble67_brown.png';
import bubble68_brown from '../assets/images/bubble68_brown.png';
import bubble67_orange from '../assets/images/bubble67_orange.png';
import bubble68_orange from '../assets/images/bubble68_orange.png';
import bubble67_red from '../assets/images/bubble67_red.png';
import bubble68_red from '../assets/images/bubble68_red.png';
const themes = {
  green: {
    // ✅ BUBBLES
    bubble4: bubble67,
    bubble3: bubble68,
   
    // ✅ TITLE WITH ACTION COLORS
    titleColor: '#202020',
    timeCellColor: '#FFEBEB',
    timeTextColor: '#202020',
    colonColor: '#202020',
    seeAllTextColor: '#202020',
    arrowColor: '#00BC7D',
    arrowHoverColor: '#00E89D',
    clockIconColor: '#202020',
   
    // ✅ DISCOUNT BUTTON
    selectedDiscountCell: {
      backgroundColor: '#fff',
      borderColor: '#00BC7D',
      borderWidth: '3px',
      padding: '10px',
    },
    checkIconColor: '#00BC7D',
  },
  blue: {
    // ✅ BUBBLES
    bubble4: bubble67_blue,
    bubble3: bubble68_blue,
   
    // ✅ TITLE WITH ACTION COLORS
    titleColor: '#202020',
    timeCellColor: '#E6F0FF',
    timeTextColor: '#202020',
    colonColor: '#202020',
    seeAllTextColor: '#202020',
    arrowColor: '#615FFF',
    arrowHoverColor: '#7A74FF',
    clockIconColor: '#615FFF',
   
    // ✅ DISCOUNT BUTTON
    selectedDiscountCell: {
      backgroundColor: '#fff',
      borderColor: '#615FFF',
      borderWidth: '3px',
      padding: '10px',
    },
    checkIconColor: '#615FFF',
  },
  brown: {
    // ✅ BUBBLES
    bubble4: bubble67_brown,
    bubble3: bubble68_brown,
   
    // ✅ TITLE WITH ACTION COLORS
    titleColor: '#202020',
    timeCellColor: '#FFF5E6',
    timeTextColor: '#202020',
    colonColor: '#202020',
    seeAllTextColor: '#202020',
    arrowColor: '#BC784B',
    arrowHoverColor: '#D89A6A',
    clockIconColor: '#BC784B',
   
    // ✅ DISCOUNT BUTTON
    selectedDiscountCell: {
      backgroundColor: '#fff',
      borderColor: '#BC784B',
      borderWidth: '3px',
      padding: '10px',
    },
    checkIconColor: '#BC784B',
  },
  orange: {
    // ✅ BUBBLES
    bubble4: bubble67_orange,
    bubble3: bubble68_orange,
   
    // ✅ TITLE WITH ACTION COLORS
    titleColor: '#202020',
    timeCellColor: '#FFF4E6',
    timeTextColor: '#202020',
    colonColor: '#202020',
    seeAllTextColor: '#202020',
    arrowColor: '#FF8904',
    arrowHoverColor: '#FFAB3D',
    clockIconColor: '#FF8904',
   
    // ✅ DISCOUNT BUTTON
    selectedDiscountCell: {
      backgroundColor: '#fff',
      borderColor: '#FF8904',
      borderWidth: '3px',
      padding: '10px',
    },
    checkIconColor: '#FF8904',
  },
  red: {
    // ✅ BUBBLES
    bubble4: bubble67_red,
    bubble3: bubble68_red,
   
    // ✅ TITLE WITH ACTION COLORS
    titleColor: '#202020',
    timeCellColor: '#FFE6E6',
    timeTextColor: '#202020',
    colonColor: '#202020',
    seeAllTextColor: '#202020',
    arrowColor: '#BC4B4D',
    arrowHoverColor: '#D96567',
    clockIconColor: '#BC4B4D',
   
    // ✅ DISCOUNT BUTTON
    selectedDiscountCell: {
      backgroundColor: '#fff',
      borderColor: '#BC4B4D',
      borderWidth: '3px',
      padding: '10px',
    },
    checkIconColor: '#BC4B4D',
  },
};
const baseStyles = {
  bubble4: {
    position: 'absolute',
    zIndex: 1,
    right: '-5px',
    top: 0,
  },
  bubble3: {
    position: 'absolute',
    right: '-5px',
    top: '-10px',
    zIndex: 2,
  },
  checkIcon: {
    position: 'absolute',
    right: '15px',
    top: '-10px',
    borderRadius: '10px',
    padding: '2px',
  },
};
const ThemeContext = createContext();
export const ThemeProvider = ({ children, initialTheme = 'green' }) => {
  const [themeName, setThemeName] = useState(initialTheme);
  const currentTheme = {
    ...themes[themeName],
    styles: {
      bubble4: { ...baseStyles.bubble4 },
      bubble3: { ...baseStyles.bubble3 },
      selectedDiscountCell: { ...themes[themeName].selectedDiscountCell },
      checkIcon: { ...baseStyles.checkIcon },
    },
  };
  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme: setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Safe default to prevent errors outside provider
    console.warn('useTheme called outside ThemeProvider - using default empty theme');
    return { theme: {}, setTheme: () => {} };
  }
  return context;
};