import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ShopHeader from '../../components/ShopHeader';
import { useTranslation } from 'react-i18next';
import {
  IoLocationSharp,
  IoChatbubbleEllipsesOutline,
  IoHeartOutline,
  IoHeart,
  IoCubeOutline,
  IoCheckmarkCircleOutline,
  IoBasketOutline,
  IoClose,
  IoChevronDown,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import FilterIcon from '../../assets/images/Filter.png'; // Ensure this path is correct

/* ──────────────────────────────────────
   Existing Styled Components (unchanged)
   ────────────────────────────────────── */
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #FAFAFA 0%, #FFFFFF 100%);
  padding-top: 80px;
  padding-bottom: 60px;
`;
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  gap: 16px;
`;
const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #E0E0E0;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
const LoadingText = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  font-weight: 600;
`;
const StoreHeader = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid #E8E8E8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;
const StoreInfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid #F5F5F5;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const LogoWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;
const StoreLogo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid #00BC7D;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.2);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;
const LikedBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #FF0000;
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.3);
  svg { color: #FF0000; }
`;
const StoreInfoContent = styled.div`
  flex: 1;
  min-width: 0;
`;
const StoreName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) { 
    font-size: 24px; 
  }
`;
const LocationRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F8F9FA;
  padding: 6px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  
  svg { 
    color: #00BC7D; 
    font-size: 16px;
  }
`;

const LocationText = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #00BC7D;
`;
const StoreDescription = styled.p`
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  line-height: 1.6;
  margin: 0 0 24px 0;
  max-width: 600px;
`;

const StoreMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const MetricCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #F8F9FA;
  border-radius: 12px;
  border: 1px solid #E8E8E8;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${p => p.$bgColor || '#D0FAE5'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 20px;
    color: ${p => p.$iconColor || '#00BC7D'};
  }
`;

const MetricContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetricValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  line-height: 1;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  
  @media (max-width: 768px) { 
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    font-size: 20px;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;
const ContactButton = styled(ActionButton)`
  background: #00BC7D;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.2);
  
  &:hover {
    background: #00A66A;
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
`;
const LikeButton = styled(ActionButton)`
  background: ${p => p.isLiked ? '#FF0000' : 'white'};
  color: ${p => p.isLiked ? 'white' : '#FF0000'};
  border: 2px solid ${p => p.isLiked ? '#FF0000' : '#E8E8E8'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    background: ${p => p.isLiked ? '#CC0000' : '#FFF5F5'};
    border-color: #FF0000;
    box-shadow: 0 4px 12px rgba(255, 0, 0, 0.2);
  }
`;
const AnalyticsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 24px;
  background: #F8F9FA;
  border-radius: 16px;
  border: 2px solid #E8E8E8;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;
const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  &:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); }
`;
const StatIconContainer = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: ${p => p.bgColor || '#F0F0F0'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  svg { font-size: 28px; color: ${p => p.iconColor || '#666'}; }
`;
const StatValue = styled.p`
  font-size: 28px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
`;
const StatLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
const ProductsSection = styled.div`
  margin-top: 32px;
`;
const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 24px;
  border-bottom: 2px solid #F0F0F0;
`;
const ProductsHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const ProductsTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000;
  margin: 0;
  letter-spacing: -0.3px;
`;
const ProductCountBadge = styled.div`
  background: linear-gradient(135deg, #D0FAE5 0%, #B8F5D8 100%);
  color: #00BC7D;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  border: 2px solid #B8F5D8;
`;
const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #F5F5F5;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  &:hover { transform: translateY(-6px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); border-color: #00BC7D; }
`;
const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #F8F9FA;
  overflow: hidden;
`;
const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));
  pointer-events: none;
`;
const SaleBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #FF3333 0%, #CC0000 100%);
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  box-shadow: 0 2px 8px rgba(255, 51, 51, 0.5);
  border: 2px solid white;
`;
const ProductInfo = styled.div`
  padding: 16px;
`;
const ProductName = styled.h3`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 12px 0;
  min-height: 40px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const DiscountedPrice = styled.p`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
`;
const OriginalPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const OriginalPrice = styled.p`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #999;
  text-decoration: line-through;
  margin: 0;
`;
const DiscountBadge = styled.span`
  background: #FFE6E6;
  color: #FF0000;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
`;
const RegularPrice = styled.p`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
`;
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  svg { font-size: 80px; color: #CCCCCC; margin-bottom: 24px; }
`;
const EmptyStateTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 12px 0;
`;
const EmptyStateText = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #999;
  margin: 0 0 24px 0;
  max-width: 400px;
`;
const ClearFiltersButton = styled.button`
  padding: 14px 32px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 188, 125, 0.3);
  &:hover {
    background: linear-gradient(135deg, #00A66A 0%, #008F5A 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 188, 125, 0.4);
  }
`;

/* ──────────────────────────────────────
   NEW FILTER STYLES (from ItemsCategory)
   ────────────────────────────────────── */
const FilterButtonStyled = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.3);
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 188, 125, 0.4); }
  &:active { transform: translateY(0); }
`;
const FilterIconImg = styled.img`
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
`;
const ChevronIcon = styled(IoChevronDown)`
  font-size: 20px;
  transition: transform 0.3s ease;
  transform: rotate(${p => (p.$isOpen ? '180deg' : '0deg')});
`;
const FiltersDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 20px;
  z-index: 1000;
  width: 380px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  display: ${p => (p.$show ? 'block' : 'none')};
  animation: slideDown 0.3s ease;
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 30px;
    width: 12px;
    height: 12px;
    background: white;
    transform: rotate(45deg);
    box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
  }
  @media (max-width: 480px) {
    width: calc(100vw - 24px);
    right: -12px;
  }
`;
const FilterSection = styled.div`
  margin-bottom: 20px;
  &:last-of-type { margin-bottom: 0; }
`;
const FilterTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 10px 0;
  color: #202020;
`;
const GenderOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
const GenderButton = styled.button`
  background: ${p => (p.$selected ? '#D0FAE5' : '#F9F9F9')};
  border: 2px solid ${p => (p.$selected ? '#00BC7D' : 'transparent')};
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: ${p => (p.$selected ? '#00BC7D' : '#000000')};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #D0FAE5; border-color: #00BC7D; }
`;
const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
`;
const SizeButton = styled.button`
  background: ${p => (p.$selected ? '#FFF' : '#ECFDF5')};
  border: 2px solid ${p => (p.$selected ? '#00BC7D' : 'transparent')};
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: ${p => (p.$selected ? '#00BC7D' : '#B0B0B0')};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${p => (p.$selected ? '0 2px 6px rgba(0, 188, 125, 0.2)' : 'none')};
  &:hover { background: #FFF; border-color: #00BC7D; color: #00BC7D; }
`;
const PriceInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;
const PriceInput = styled.input`
  padding: 8px;
  border: 2px solid #ECFDF5;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  outline: none;
  &:focus { border-color: #00BC7D; }
`;
const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;
const ColorButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  &:hover { transform: scale(1.1); }
`;
const ColorCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${p => p.$color};
  border: ${p => (p.$color === '#FFFFFF' ? '1px solid #E0E0E0' : 'none')};
`;
const CheckIcon = styled(IoCheckmarkCircle)`
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 18px;
  color: #00BC7D;
  background: white;
  border-radius: 50%;
`;
const FilterActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;
const ResetButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #FF3333;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #E02020; transform: translateY(-2px); }
  &:active { transform: translateY(0); }
`;
const ApplyButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #00BC7D;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #00A86B; transform: translateY(-2px); }
  &:active { transform: translateY(0); }
`;
const FilterActiveBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.4);
`;

/* ──────────────────────────────────────
   Component
   ────────────────────────────────────── */
const StoreDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [analytics, setAnalytics] = useState({ totalItems: 0, soldItems: 0, likesCount: 0 });

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [activeSubcategories, setActiveSubcategories] = useState([]);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const shoeSizes = ['6', '7', '8', '9', '10', '11', '12'];
  const genderOptions = ['All', 'Female', 'Male'];
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#008000' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Pink', hex: '#FFC1CC' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Gray', hex: '#808080' },
  ];

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = e => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setShowFilters(false);
      }
    };
    if (showFilters) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  // Fetch store & products
  const fetchStoreAndProducts = useCallback(async () => {
  setLoading(true);
  console.log('🏪 fetchStoreAndProducts called with vendorId:', vendorId);
  
  try {
    if (!vendorId) {
      console.error('❌ No vendorId provided');
      throw new Error('No vendorId provided');
    }

    // Fetch store by vendorId
    console.log('🔍 Fetching store for vendorId:', vendorId);
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id, name, description, logo_url, country, city, state, address_line1, vendor_id')
      .eq('vendor_id', vendorId)
      .single();
    
    console.log('✅ Store data fetched:', storeData);
    console.log('⚠️ Store error:', storeError);
    
    if (storeError) throw storeError;
    setStore(storeData);

    // Fetch products using vendorId
    console.log('🔍 Fetching products for vendorId:', vendorId);
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        id, name, description, price, image_url, category_id, subcategory_id, gender,
        material, stock_quantity, created_at, updated_at, likes_count, size, color,
        flash_sale_products (discount_percentage, flash_sale_id, flash_sales (start_time, end_time))
      `)
      .eq('vendor_id', vendorId);
    
    console.log('✅ Products fetched:', productData);
    console.log('⚠️ Product error:', productError);
    
    if (productError) throw productError;

    const currentTime = new Date().toISOString();
    const enriched = productData.map(p => {
      const active = p.flash_sale_products?.find(fsp => {
        const s = fsp.flash_sales;
        return s && s.start_time <= currentTime && s.end_time >= currentTime;
      });
      return { ...p, sale_percentage: active ? active.discount_percentage : null };
    });

    console.log('📦 Enriched products:', enriched.length, 'products');
    setProducts(enriched);
    setFilteredProducts(enriched);
  } catch (err) {
    console.error('❌ Error in fetchStoreAndProducts:', err);
    setProducts([]);
    setFilteredProducts([]);
  } finally {
    console.log('✅ Fetch complete, loading set to false');
    setLoading(false);
  }
}, [vendorId]);

  // Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const targetVendorId = store?.vendor_id || vendorId;
      const targetStoreId = store?.id;
      
      if (!targetVendorId || !targetStoreId) return;

      const { count: totalItems } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('vendor_id', targetVendorId);
      
      const { data: ordersData } = await supabase
        .from('orders')
        .select('items')
        .eq('vendor_id', targetVendorId)
        .eq('status', 'succeeded');
      
      const soldItems = ordersData?.reduce((t, o) => t + (o.items || []).reduce((s, i) => s + (i.quantity || 0), 0), 0) || 0;
      
      const { count: likesCount } = await supabase
        .from('store_likes')
        .select('id', { count: 'exact' })
        .eq('store_id', targetStoreId);
      
      setAnalytics({ totalItems: totalItems || 0, soldItems, likesCount: likesCount || 0 });
    } catch (err) {
      console.error(err);
      setAnalytics({ totalItems: 0, soldItems: 0, likesCount: 0 });
    }
  }, [store?.vendor_id, store?.id, vendorId]);

  useEffect(() => { fetchStoreAndProducts(); }, [fetchStoreAndProducts]);
  useEffect(() => { if (store?.id) fetchAnalytics(); }, [store?.id, fetchAnalytics]);

  // Like status
  useEffect(() => {
    const checkIfLiked = async () => {
      const targetStoreId = store?.id;
      if (!profile?.id || !targetStoreId) return;
      
      const { data, error } = await supabase
        .from('store_likes')
        .select('id')
        .eq('store_id', targetStoreId)
        .eq('user_id', profile.id)
        .single();
      
      if (error && error.code !== 'PGRST116') console.error(error);
      setIsLiked(!!data);
    };
    checkIfLiked();
  }, [profile?.id, store?.id]);

  const handleLikePress = async () => {
    if (!profile?.id) { 
      alert('Please login to like the store.'); 
      return; 
    }
    
    const targetStoreId = store?.id;
    if (!targetStoreId) return;
    
    try {
      if (isLiked) {
        await supabase
          .from('store_likes')
          .delete()
          .eq('store_id', targetStoreId)
          .eq('user_id', profile.id);
        
        setIsLiked(false);
        setAnalytics(p => ({ ...p, likesCount: Math.max(0, p.likesCount - 1) }));
      } else {
        await supabase
          .from('store_likes')
          .insert([{ 
            store_id: targetStoreId, 
            user_id: profile.id, 
            liked_at: new Date().toISOString() 
          }]);
        
        setIsLiked(true);
        setAnalytics(p => ({ ...p, likesCount: p.likesCount + 1 }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update like status.');
    }
  };

  const handleContactVendor = () => {
  const targetVendorId = store?.vendor_id || vendorId;
  if (!targetVendorId) {
    alert('Vendor information not available');
    return;
  }
  navigate(`/customer/CustomerMessages?vendorId=${targetVendorId}`);
};
  const handleItemPress = (product) => {
  const standardizedProduct = {
    id: product.id,
    image_url: product.image_url,
    description: product.description || 'No description available',
    price: product.price,
    sale_percentage: product.sale_percentage || null,
  };
  navigate(`/ProductsView?product=${encodeURIComponent(JSON.stringify(standardizedProduct))}`);
};

  // Filter logic
  useEffect(() => {
    let filtered = [...products];

    if (activeSubcategories.length > 0) {
      filtered = filtered.filter(p => activeSubcategories.includes(p.subcategory_id));
    }
    if (selectedGender !== 'All') {
      filtered = filtered.filter(p => p.gender?.toLowerCase() === selectedGender.toLowerCase());
    }
    if (selectedSize) {
      filtered = filtered.filter(p => p.size?.includes(selectedSize));
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => p.color && selectedColors.some(c => p.color.includes(c)));
    }
    if (minPrice) filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));

    setFilteredProducts(filtered);
  }, [products, activeSubcategories, selectedGender, selectedSize, selectedColors, minPrice, maxPrice]);

  const handleSubcategoryToggle = id => {
    setActiveSubcategories(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const handleColorSelect = name => {
    setSelectedColors(p => p.includes(name) ? p.filter(c => c !== name) : [...p, name]);
  };

  const handleReset = () => {
    setSelectedGender('All');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColors([]);
    setActiveSubcategories([]);
  };

  const handleApply = () => setShowFilters(false);

  const totalActiveFilters = 
    (selectedGender !== 'All' ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    selectedColors.length +
    activeSubcategories.length;

  if (loading) {
    return (
      <PageContainer>
        <ShopHeader 
          isConnected={!!user} 
          avatarUrl={profile?.avatar_url} 
          userRole={profile?.role} 
          userEmail={profile?.email || user?.email} 
          onLogout={logout} 
        />
        <LoadingContainer>
          <Spinner />
          <LoadingText>{t('LoadingStore')}</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
  <PageContainer>
    <ShopHeader isConnected={!!user} avatarUrl={profile?.avatar_url} userRole={profile?.role} userEmail={profile?.email || user?.email} onLogout={logout} />
    <Container>
      {/* Store Header */}
      <StoreHeader>
  <StoreInfoRow>
    <LogoWrapper>
      {store?.logo_url && <StoreLogo src={store.logo_url} alt={store.name} />}
      {isLiked && <LikedBadge><IoHeart size={18} /></LikedBadge>}
    </LogoWrapper>
    <StoreInfoContent>
      <StoreName>{store?.name}</StoreName>
      <LocationRow>
        <IoLocationSharp size={18} />
        <LocationText>{store?.city}, {store?.state}, {store?.country}</LocationText>
      </LocationRow>
      {store?.description && <StoreDescription>{store.description}</StoreDescription>}
    </StoreInfoContent>
  </StoreInfoRow><StoreMetrics>
    <MetricCard>
      <MetricIcon $bgColor="#F0FDF9" $iconColor="#00BC7D">
        <IoCubeOutline />
      </MetricIcon>
      <MetricContent>
        <MetricValue>{analytics.totalItems}</MetricValue>
        <MetricLabel>{t('Products')}</MetricLabel>
      </MetricContent>
    </MetricCard>
    
    <MetricCard>
      <MetricIcon $bgColor="#FFF7ED" $iconColor="#FF9900">
        <IoCheckmarkCircleOutline />
      </MetricIcon>
      <MetricContent>
        <MetricValue>{analytics.soldItems}</MetricValue>
        <MetricLabel>{t('ItemsSold')}</MetricLabel>
      </MetricContent>
    </MetricCard>
    
    <MetricCard>
      <MetricIcon $bgColor="#FFF5F5" $iconColor="#FF0000">
        <IoHeart />
      </MetricIcon>
      <MetricContent>
        <MetricValue>{analytics.likesCount}</MetricValue>
        <MetricLabel>{t('StoreLikes')}</MetricLabel>
      </MetricContent>
    </MetricCard>
  </StoreMetrics>
  
  <ActionButtonsContainer>
    <ContactButton onClick={handleContactVendor}>
      <IoChatbubbleEllipsesOutline size={20} />
      {t('ContactStore')}
    </ContactButton>
    <LikeButton isLiked={isLiked} onClick={handleLikePress}>
      {isLiked ? <IoHeart size={20} /> : <IoHeartOutline size={20} />}
      {isLiked ? t('Liked') : t('LikeStore')}
    </LikeButton>
  </ActionButtonsContainer>
</StoreHeader>
      {/* Products */}
      <ProductsSection>
        <ProductsHeader>
          <ProductsHeaderLeft>
            <ProductsTitle>{t('StoreProducts')}</ProductsTitle>
            <ProductCountBadge>{filteredProducts.length}</ProductCountBadge>
          </ProductsHeaderLeft>
          <div style={{ position: 'relative' }}>
            <FilterButtonStyled ref={buttonRef} onClick={() => setShowFilters(!showFilters)}>
              <FilterIconImg src={FilterIcon} alt="Filter" />
              {t('Filters')}
              <ChevronIcon $isOpen={showFilters} />
              {totalActiveFilters > 0 && <FilterActiveBadge>{totalActiveFilters}</FilterActiveBadge>}
            </FilterButtonStyled>
            <FiltersDropdown ref={dropdownRef} $show={showFilters}>
              <FilterSection>
                <FilterTitle>{t('Gender')}</FilterTitle>
                <GenderOptions>
                  {genderOptions.map(g => (
                    <GenderButton key={g} $selected={selectedGender === g} onClick={() => setSelectedGender(g)}>{t(g)}</GenderButton>
                  ))}
                </GenderOptions>
              </FilterSection>
              <FilterSection>
                <FilterTitle>{t('Size')}</FilterTitle>
                <SizeGrid>
                  {(store?.name?.toLowerCase().includes('shoe') ? shoeSizes : clothingSizes).map(s => (
                    <SizeButton key={s} $selected={selectedSize === s} onClick={() => setSelectedSize(selectedSize === s ? '' : s)}>{s}</SizeButton>
                  ))}
                </SizeGrid>
              </FilterSection>
              <FilterSection>
                <FilterTitle>{t('PriceRange')}</FilterTitle>
                <PriceInputs>
                  <PriceInput type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  <PriceInput type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </PriceInputs>
              </FilterSection>
              <FilterSection>
                <FilterTitle>{t('Colors')}</FilterTitle>
                <ColorGrid>
                  {colorOptions.map(c => (
                    <ColorButton key={c.name} onClick={() => handleColorSelect(c.name)}>
                      <ColorCircle $color={c.hex} />
                      {selectedColors.includes(c.name) && <CheckIcon />}
                    </ColorButton>
                  ))}
                </ColorGrid>
              </FilterSection>
              {products.length > 0 && (
                <FilterSection>
                  <FilterTitle>{t('Subcategory')}</FilterTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
                   {[...new Set(products.map(p => p.subcategory_id))].map(id => {
  const key = `Subcategory_${id}`;
  return (
    <SizeButton
      key={id}
      $selected={activeSubcategories.includes(id)}
      onClick={() => handleSubcategoryToggle(id)}
      style={{ fontSize: '12px' }}
    >
      {t(key) || `ID ${id}`}
    </SizeButton>
  );
})}
                  </div>
                </FilterSection>
              )}
              <FilterActions>
                <ResetButton onClick={handleReset}>{t('Reset')}</ResetButton>
                <ApplyButton onClick={handleApply}>{t('Apply')}</ApplyButton>
              </FilterActions>
            </FiltersDropdown>
          </div>
        </ProductsHeader>
        {filteredProducts.length === 0 ? (
          <EmptyState>
            <IoBasketOutline />
            <EmptyStateTitle>{t('NoProductsFound')}</EmptyStateTitle>
            <EmptyStateText>
              {totalActiveFilters > 0 ? t('TryAdjustingFilters') : t('NoProductsAvailable')}
            </EmptyStateText>
            {totalActiveFilters > 0 && <ClearFiltersButton onClick={handleReset}>{t('ClearAllFilters')}</ClearFiltersButton>}
          </EmptyState>
        ) : (
          <ProductsGrid>
            {filteredProducts.map(product => {
              const hasDiscount = product.sale_percentage && product.sale_percentage > 0;
              const discounted = hasDiscount ? product.price * (1 - product.sale_percentage / 100) : null;
              return (
                <ProductCard key={product.id} onClick={() => handleItemPress(product)}>
                  <ProductImageWrapper>
                    <ProductImage src={product.image_url} alt={product.description} />
                    <ImageOverlay />
                    {hasDiscount && <SaleBadge>{product.sale_percentage}% { t('OFF') }</SaleBadge>}
                  </ProductImageWrapper>
                  <ProductInfo>
                    <ProductName>{product.description}</ProductName>
                    <PriceContainer>
                      {hasDiscount ? (
                        <>
                          <DiscountedPrice>${discounted.toFixed(2)}</DiscountedPrice>
                          <OriginalPriceRow>
                            <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
                            <DiscountBadge>-{product.sale_percentage}%</DiscountBadge>
                          </OriginalPriceRow>
                        </>
                      ) : (
                        <RegularPrice>${product.price.toFixed(2)}</RegularPrice>
                      )}
                    </PriceContainer>
                  </ProductInfo>
                </ProductCard>
              );
            })}
          </ProductsGrid>
        )}
      </ProductsSection>
    </Container>
  </PageContainer>
);
};

export default StoreDetails;