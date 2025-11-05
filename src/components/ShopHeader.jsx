import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { IoArrowForward, IoClose, IoTrash, IoPersonOutline, IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import iconx from '../assets/images/iconx.png';

// === Simple Public Image Component ===
const ProfileImage = ({ src, alt, size = 48, ...props }) => {
  const imageSrc = src || null;
 
  if (!imageSrc) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00BC7D 0%, #00E89D 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IoPersonOutline style={{ fontSize: 20, color: 'white' }} />
      </div>
    );
  }
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
      }}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
      {...props}
    />
  );
};

// === Styled Components ===
const ShopHeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const HeaderBubble = styled.img`
  position: absolute;
  top: 0px;
  right: -10px;
  width: 80px;
  height: auto;
  z-index: 998;
  opacity: 0.7;
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  @media (max-width: 768px) {
    width: 60px;
    right: 10px;
  }
`;

const HeaderBubbleSecondary = styled.img`
  position: absolute;
  top: -5px;
  right: 5px;
  width: 60px;
  height: auto;
  z-index: 999;
  opacity: 0.6;
  pointer-events: none;
  transform: rotate(5deg);
  
  @media (max-width: 768px) {
    width: 45px;
    right: 0;
  }
`;

const ShopHeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  max-width: 100%;
  margin: 0;
  gap: 12px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const TitleIcon = styled.img`
  width: 100px;
  height: 40px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileSection = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const ProfileImgContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid ${({ isOpen }) => (isOpen ? '#00E89D' : '#00BC7D')};
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  box-shadow: ${({ isOpen }) =>
    isOpen
      ? '0 6px 20px rgba(0, 188, 125, 0.3)'
      : '0 4px 12px rgba(0, 188, 125, 0.15)'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    padding: 2px;
    background: linear-gradient(135deg, #00BC7D, #00E89D);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(0, 188, 125, 0.25);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  padding: 10px 20px;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.2);
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const SearchBarContainer = styled.div`
  flex: 1;
  position: relative;
  max-width: 600px;
`;

const SearchBar = styled.div`
  display: flex;
  flex-direction: row;
  background: ${({ isFilled, isOpen }) => (isFilled || isOpen ? '#E6FAF3' : '#F8F8F8')};
  border-radius: 24px;
  height: 48px;
  padding-right: 12px;
  border: 2px solid ${({ isFilled, isOpen }) => (isFilled || isOpen ? '#00BC7D' : 'transparent')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ isFilled, isOpen }) =>
    (isFilled || isOpen)
      ? '0 4px 16px rgba(0, 188, 125, 0.12)'
      : '0 2px 8px rgba(0, 0, 0, 0.04)'};
  cursor: pointer;
  
  &:hover {
    background: ${({ isFilled, isOpen }) => (isFilled || isOpen ? '#D0FAE5' : '#F3F3F3')};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const SearchContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 4px;
`;

const SearchTermsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  flex: 1;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SearchTerm = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  border-radius: 18px;
  padding: 6px 12px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.2);
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const SearchTermText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  font-family: 'Raleway', sans-serif;
`;

const RemoveTermButton = styled.button`
  margin-left: 6px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const RemoveIcon = styled(IoClose)`
  color: #ffffff;
  font-size: 14px;
`;

const InputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const ArrowIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.3);
  transition: all 0.3s ease;
  transform: translateY(5px);
  
  &:hover {
    transform: translateY(2px) scale(1.1) rotate(5deg);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.4);
  }
  
  &:active {
    transform: translateY(2px) scale(0.95);
  }
`;

const InputContainer = styled.div`
  flex: 1;
  background-color: transparent;
  height: 100%;
  display: flex;
  align-items: center;
`;

const InputField = styled.input`
  flex: 1;
  font-size: 14px;
  color: #333;
  background: none;
  border: none;
  outline: none;
  font-family: 'Raleway', sans-serif;
  padding: 0 12px;
  height: 100%;
  width: 100%;
  
  &::placeholder {
    color: #999;
    font-weight: 400;
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 16px;
  z-index: 1001;
  max-height: 400px;
  overflow-y: auto;
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

const SearchHistoryContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Label = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  line-height: 23px;
  font-size: 16px;
  letter-spacing: -0.18px;
  color: #202020;
`;

const ClearHistoryButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffebeb;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const HistoryRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const HistoryItem = styled.button`
  padding: 8px 14px;
  background-color: #F8F8F8;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #E6FAF3;
    border-color: #00BC7D;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 188, 125, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const HistoryText = styled.span`
  font-size: 14px;
  color: #202020;
  font-family: 'Raleway', sans-serif;
`;

const NoHistoryText = styled.span`
  font-size: 14px;
  color: #999;
  font-family: 'Raleway', sans-serif;
  font-style: italic;
`;

const SuggestionsContainer = styled.div`
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
`;

const SuggestionItem = styled.button`
  width: 100%;
  padding: 8px 14px;
  background-color: #F8F8F8;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background-color: #E6FAF3;
    border-color: #00BC7D;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 188, 125, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SuggestionText = styled.span`
  font-size: 14px;
  color: #202020;
  font-family: 'Raleway', sans-serif;
`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 1002;
  min-width: 220px;
  animation: slideDown 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: white;
    transform: rotate(45deg);
    box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
  }
  
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

const ProfileDropdownHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
`;

const ProfileName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin-bottom: 4px;
`;

const ProfileEmail = styled.div`
  font-size: 13px;
  color: #666;
  font-family: 'Raleway', sans-serif;
`;

const ProfileRole = styled.div`
  font-size: 12px;
  color: #00BC7D;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 4px;
`;

const DropdownMenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  color: #202020;
  text-align: left;
  
  &:hover {
    background: #f8f8f8;
    transform: translateX(4px);
  }
  
  &:active {
    transform: translateX(2px);
  }
  
  &.logout {
    color: #D97474;
    
    &:hover {
      background: #ffebeb;
    }
  }
`;

const MenuIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: inherit;
`;

// === Input Component ===
const Input = ({ placeholder, value, onChange, onFocus, onKeyPress }) => {
  return (
    <InputContainer>
      <InputField
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={onFocus}
        onKeyPress={onKeyPress}
      />
    </InputContainer>
  );
};

// === Main ShopHeader Component ===
const ShopHeader = ({ 
  itemName, 
  isConnected = false, 
  avatarUrl, 
  userRole, 
  userEmail, 
  onLogout, 
  isFlashSale = false 
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { theme } = useTheme();
  
  const [searchText, setSearchText] = useState('');
  const [searchTerms, setSearchTerms] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  const dropdownRef = useRef(null);
  const searchBarRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
 
  const fullName = profile?.first_name || profile?.last_name
    ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
    : 'User Name';
  const actualAvatarUrl = profile?.avatar_url || avatarUrl;

  // Add item name to search terms
  useEffect(() => {
    if (itemName && !searchTerms.includes(itemName)) {
      setSearchTerms((prevTerms) => [...prevTerms, itemName]);
    }
  }, [itemName]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isProfileDropdownOpen]);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchText.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('name')
          .ilike('name', `%${searchText}%`)
          .limit(5);

        if (error) throw error;
        setSuggestions(data.map(item => item.name));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchText]);

  const clearSearchText = () => setSearchText('');
  
  const removeSearchTerm = (term) =>
    setSearchTerms((prevTerms) => prevTerms.filter((t) => t !== term));

  const handleSearchClick = () => {
    setIsDropdownOpen(true);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const saveSearchHistory = (query) => {
    const updatedHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(updatedHistory);
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      setSearchTerms((prevTerms) => [...prevTerms, searchText]);
      saveSearchHistory(searchText);
      navigate(`/searchResults?query=${encodeURIComponent(searchText)}`);
      setSearchText('');
      setIsDropdownOpen(false);
    }
  };

  const handleHistoryClick = (item) => {
    setSearchText(item);
    saveSearchHistory(item);
    navigate(`/searchResults?query=${encodeURIComponent(item)}`);
    setIsDropdownOpen(false);
  };

  const handleSuggestionClick = (item) => {
    setSearchText(item);
    saveSearchHistory(item);
    navigate(`/searchResults?query=${encodeURIComponent(item)}`);
    setIsDropdownOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleNavigateToProfile = () => {
    if (isConnected) {
      const targetRoute = userRole === 'vendor' ? '/vendor/profile' : '/profile';
      navigate(targetRoute);
      setIsProfileDropdownOpen(false);
    }
  };

  const handleSettings = () => {
    navigate('/settings');
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <ShopHeaderContainer>
      {isFlashSale && theme?.bubble4 && <HeaderBubble src={theme.bubble4} alt="" />}
      {isFlashSale && theme?.bubble3 && <HeaderBubbleSecondary src={theme.bubble3} alt="" />}
      
      <ShopHeaderContent>
        <TitleIcon src={iconx} alt="Erlli Logo" onClick={() => navigate('/')} />
        
        <SearchBarContainer ref={searchBarRef}>
          <SearchBar
            isFilled={searchTerms.length > 0}
            isOpen={isDropdownOpen}
            onClick={handleSearchClick}
          >
            <SearchContent>
              <SearchTermsContainer>
                {searchTerms.map((term, index) => (
                  <SearchTerm key={index}>
                    <SearchTermText>{term}</SearchTermText>
                    <RemoveTermButton
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchTerm(term);
                      }}
                    >
                      <RemoveIcon />
                    </RemoveTermButton>
                  </SearchTerm>
                ))}
                <InputWrapper>
                  <Input
                    placeholder="Search products..."
                    value={searchText}
                    onChange={setSearchText}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyPress={handleKeyPress}
                  />
                </InputWrapper>
              </SearchTermsContainer>
            </SearchContent>
            <ArrowIconContainer onClick={(e) => {
              e.stopPropagation();
              if (searchText) {
                handleSearch();
              }
            }}>
              <IoArrowForward style={{ fontSize: '18px', color: '#ffffff' }} />
            </ArrowIconContainer>
          </SearchBar>

          {isDropdownOpen && (
            <DropdownContainer ref={dropdownRef}>
              <SearchHistoryContainer>
                <Label>Search History</Label>
                <ClearHistoryButton onClick={clearHistory} aria-label="Clear Search History">
                  <IoTrash style={{ fontSize: '18px', color: '#D97474' }} />
                </ClearHistoryButton>
              </SearchHistoryContainer>
              <HistoryRow>
                {searchHistory.length === 0 ? (
                  <NoHistoryText>No search history</NoHistoryText>
                ) : (
                  searchHistory.map((item, index) => (
                    <HistoryItem
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      aria-label={`Search for ${item}`}
                    >
                      <HistoryText>{item}</HistoryText>
                    </HistoryItem>
                  ))
                )}
              </HistoryRow>

              {searchText.trim() && (
                <SuggestionsContainer>
                  <Label>Suggestions</Label>
                  <HistoryRow>
                    {suggestions.length === 0 ? (
                      <NoHistoryText>No matching products</NoHistoryText>
                    ) : (
                      suggestions.map((item, index) => (
                        <SuggestionItem
                          key={index}
                          onClick={() => handleSuggestionClick(item)}
                          aria-label={`Search for ${item}`}
                        >
                          <SuggestionText>{item}</SuggestionText>
                        </SuggestionItem>
                      ))
                    )}
                  </HistoryRow>
                </SuggestionsContainer>
              )}
            </DropdownContainer>
          )}
        </SearchBarContainer>

        {isConnected ? (
          <ProfileSection ref={profileButtonRef}>
            <ProfileImgContainer onClick={handleProfileClick} isOpen={isProfileDropdownOpen}>
              <ProfileImage
                src={actualAvatarUrl}
                alt="Profile Avatar"
                size={48}
              />
            </ProfileImgContainer>
            
            {isProfileDropdownOpen && (
              <ProfileDropdown ref={profileDropdownRef}>
                <ProfileDropdownHeader>
                  <ProfileName>{fullName}</ProfileName>
                  <ProfileEmail>{userEmail || 'user@example.com'}</ProfileEmail>
                  <ProfileRole>{userRole || 'customer'}</ProfileRole>
                </ProfileDropdownHeader>
                
                <DropdownMenuItem onClick={handleNavigateToProfile}>
                  <MenuIcon>
                    <IoPersonOutline />
                  </MenuIcon>
                  View Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleSettings}>
                  <MenuIcon>
                    <IoSettingsOutline />
                  </MenuIcon>
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuItem className="logout" onClick={handleLogout}>
                  <MenuIcon>
                    <IoLogOutOutline />
                  </MenuIcon>
                  Logout
                </DropdownMenuItem>
              </ProfileDropdown>
            )}
          </ProfileSection>
        ) : (
          <ConnectButton onClick={() => navigate('/auth/login')}>
            Connect
          </ConnectButton>
        )}
      </ShopHeaderContent>
    </ShopHeaderContainer>
  );
};

export default ShopHeader;