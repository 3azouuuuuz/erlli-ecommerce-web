import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { IoArrowForward, IoTrash } from 'react-icons/io5';

const ModalContainer = styled.div`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  flex: 1;
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const ModalContent = styled.div`
  flex: 1;
  padding: 50px 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const MainContent = styled.div`
  flex: 1;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalHeaderText = styled.h3`
  font-size: 28px;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #202020;
`;

const SearchBarModalContainer = styled.div`
  flex: 1;
  margin: 0 16px;
`;

const SearchBarModal = styled.div`
  height: 40px;
  width: 100%;
  background-color: #F3F3F3;
  border-radius: 9px;
  ${({ isFilled }) => isFilled && `
    background-color: #D0FAE5;
  `}
`;

const InputField = styled.input`
  flex: 1;
  font-size: 16px;
  color: #333;
  background: none;
  border: none;
  outline: none;
  font-family: 'Raleway', sans-serif;
  padding: 0 10px;
  height: 100%;
`;

const ClearButton = styled.button`
  padding: 5px;
  margin-right: 5px;
  background: none;
  border: none;
  cursor: pointer;
`;

const ClearText = styled.span`
  font-size: 16px;
  color: #00BC7D;
  font-weight: bold;
`;

const SearchHistoryContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
`;

const Label = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  line-height: 23px;
  font-size: 18px;
  letter-spacing: -0.18px;
`;

const HistoryRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const HistoryItem = styled.button`
  padding: 10px;
  background-color: #F4F4F4;
  border-radius: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  border: none;
  cursor: pointer;
`;

const HistoryText = styled.span`
  font-size: 16px;
  color: #202020;
`;

const NoHistoryText = styled.span`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
`;

const SwipeHint = styled.div`
  align-items: center;
  padding-bottom: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  animation: swipeHint 600ms ease-in-out 2;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 5px;
  background-color: #D0FAE5;
  border-radius: 2.5px;
  margin-bottom: 5px;
`;

const HintText = styled.span`
  font-size: 14px;
  color: #888;
  font-family: 'Raleway', sans-serif;
`;

const SearchModal = ({
  isVisible,
  onClose,
  searchText,
  setSearchText,
  clearSearchText,
}) => {
  const navigate = useNavigate();
  const [searchHistory, setSearchHistory] = useState(['query1', 'query2']); // Dummy data

  useEffect(() => {
    if (isVisible) {
      // Simulate loadSearchHistory with dummy data
      setSearchHistory(['query1', 'query2']);
    }
  }, [isVisible]);

  const saveSearchHistory = (query) => {
    const updatedHistory = [query, ...searchHistory];
    setSearchHistory(updatedHistory);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      saveSearchHistory(searchText);
      navigate(`/searchResults?query=${encodeURIComponent(searchText)}`);
      onClose();
    }
  };

  return (
    <ModalContainer isVisible={isVisible}>
      <ModalContent>
        <MainContent>
          <ModalHeader>
            <ModalHeaderText>Search</ModalHeaderText>
            <SearchBarModalContainer>
              <SearchBarModal isFilled={searchText}>
                <InputField
                  placeholder="SearchPlaceholder"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  autoFocus={true}
                />
                {searchText ? (
                  <ClearButton onClick={clearSearchText} aria-label="ClearSearch">
                    <ClearText>✕</ClearText>
                  </ClearButton>
                ) : null}
                <ClearButton onClick={handleSearch} aria-label="PerformSearch">
                  <IoArrowForward style={{ fontSize: '20px', color: '#00BC7D' }} />
                </ClearButton>
              </SearchBarModal>
            </SearchBarModalContainer>
          </ModalHeader>
          <SearchHistoryContainer>
            <Label>SearchHistory</Label>
            <ClearButton onClick={clearHistory} aria-label="ClearSearchHistory">
              <IoTrash style={{ fontSize: '20px', color: '#D97474' }} />
            </ClearButton>
          </SearchHistoryContainer>
          <HistoryRow>
            {searchHistory.length === 0 ? (
              <NoHistoryText>NoSearchHistory</NoHistoryText>
            ) : (
              searchHistory.map((item, index) => (
                <HistoryItem
                  key={index.toString()}
                  onClick={() => {
                    setSearchText(item);
                    handleSearch();
                  }}
                  aria-label={`SearchFor ${item}`}
                >
                  <HistoryText>{item}</HistoryText>
                </HistoryItem>
              ))
            )}
          </HistoryRow>
        </MainContent>
        <SwipeHint>
          <HandleBar />
          <HintText>SwipeUpToClose</HintText>
        </SwipeHint>
      </ModalContent>
    </ModalContainer>
  );
};

const styles = `
@keyframes swipeHint {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
`;

export default SearchModal;