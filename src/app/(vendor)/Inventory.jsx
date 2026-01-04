import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoTrashOutline, IoPencilOutline, IoAddCircleOutline, IoEyeOutline, IoCheckmarkCircle, IoChevronDown, IoFilterOutline } from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';
const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FA;
`;

const Container = styled.div`
  padding: 80px 16px 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  margin: 0;
  color: #202020;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  svg { font-size: 24px; }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid ${props => props.$color || '#00BC7D'};
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SearchAndFilter = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #E8E8E8;
  border-radius: 12px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  outline: none;
  transition: all 0.3s ease;
  &:focus {
    border-color: #00BC7D;
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
`;

const FilterButtonContainer = styled.div`
  position: relative;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.3);
  svg { font-size: 18px; }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.4);
  }
`;

const ChevronIcon = styled(IoChevronDown)`
  font-size: 18px;
  transition: transform 0.3s ease;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
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
  display: ${props => props.$show ? 'block' : 'none'};
  animation: slideDown 0.3s ease;
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
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
    width: calc(100vw - 32px);
    right: 0;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  &:last-of-type { margin-bottom: 0; }
`;

const FilterTitle = styled.h4`
  font-size: 14px;
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
  background: ${props => props.$selected ? '#D0FAE5' : '#F9F9F9'};
  border: 2px solid ${props => props.$selected ? '#00BC7D' : 'transparent'};
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$selected ? '#00BC7D' : '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #D0FAE5;
    border-color: #00BC7D;
  }
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const SizeButton = styled.button`
  background: ${props => props.$selected ? '#FFF' : '#ECFDF5'};
  border: 2px solid ${props => props.$selected ? '#00BC7D' : 'transparent'};
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$selected ? '#00BC7D' : '#B0B0B0'};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #FFF;
    border-color: #00BC7D;
    color: #00BC7D;
  }
`;

const PriceInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const PriceInput = styled.input`
  padding: 10px 12px;
  border: 2px solid #ECFDF5;
  border-radius: 8px;
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  outline: none;
  &:focus { border-color: #00BC7D; }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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
  background-color: ${props => props.$color};
  border: ${props => props.$color === '#FFFFFF' ? '1px solid #E0E0E0' : 'none'};
`;

const CheckIcon = styled(IoCheckmarkCircle)`
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 16px;
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
  padding: 12px;
  background: #FFEBEE;
  color: #D32F2F;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #D32F2F; color: white; }
`;

const ApplyButton = styled.button`
  flex: 1;
  padding: 12px;
  background: #00BC7D;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #00A86B; }
`;

const ActiveFiltersBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const ActiveFilterTag = styled.span`
  background: #D0FAE5;
  color: #00BC7D;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #00BC7D; color: white; }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ProductCardWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ProductCard = styled.div`
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover { transform: translateY(-4px); }
  &:active { transform: translateY(-2px); }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 5px solid ${props => props.$isSelected ? '#00BC7D' : 'white'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s ease;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const ProductDescription = styled.div`
  margin-top: 8px;
  font-size: 13px;
  font-weight: 400;
  color: #000000;
  font-family: 'Raleway', sans-serif;
  min-height: 40px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin-top: -8px;
  margin-bottom: 4px;
`;

const FloatingActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
`;

const FloatingIconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #00BC7D;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  background: white;
  color: #00BC7D;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible ? 'scale(1) translateX(0)' : 'scale(0.5) translateX(20px)'};
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transition-delay: ${props => props.$delay || '0s'};
  &:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
    background: #00BC7D;
    color: white;
  }
  &:active { transform: scale(0.95); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 20px;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #E8E8E8;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 8px 0;
`;

const EmptyStateText = styled.p`
  font-size: 14px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 24px 0;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #D32F2F;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 40px 20px;
  background: #FFEBEE;
  border-radius: 12px;
  margin: 0;
`;

const Inventory = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { currency, formatCurrency } = useCurrency(); 
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [convertedTotalValue, setConvertedTotalValue] = useState('$0.00');
  const [convertedAveragePrice, setConvertedAveragePrice] = useState('$0.00');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);

  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const genderOptions = ['All', 'Female', 'Male', 'Unisex'];
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
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Navy', hex: '#000080' },
  ];

  // Calculate these first
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;
  const hasActiveFilters = selectedGender !== 'All' || selectedSize || minPrice || maxPrice || selectedColors.length > 0;

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };
    if (showFilters) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  useEffect(() => {
    fetchProducts();
  }, [profile?.id]);

  // Refetch and reconvert products when currency changes
  useEffect(() => {
    if (products.length > 0) {
      reconvertProducts();
    }
  }, [currency]);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGender !== 'All') {
      filtered = filtered.filter(p => p.gender === selectedGender);
    }

    if (selectedSize) {
      filtered = filtered.filter(p => p.size?.includes(selectedSize));
    }

    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => 
        selectedColors.some(c => p.color?.includes(c))
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, selectedGender, selectedSize, minPrice, maxPrice, selectedColors]);

  // Convert stats when currency or values change
  useEffect(() => {
    const convertStats = async () => {
      if (totalProducts === 0) return;

      const convertedTotal = await formatCurrency(totalValue);
      const convertedAvg = await formatCurrency(averagePrice);
      
      setConvertedTotalValue(convertedTotal);
      setConvertedAveragePrice(convertedAvg);
    };

    convertStats();
  }, [currency, totalValue, averagePrice, totalProducts]);

  // Close selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectedProductId && !e.target.closest('[data-product-card]')) {
        setSelectedProductId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedProductId]);

  const fetchProducts = async () => {
    if (!profile?.id) { 
      setLoading(false); 
      return; 
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: vendorProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, vendor_id, gender, size, color')
        .eq('vendor_id', profile.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Format products and convert prices immediately
      const formattedProducts = await Promise.all(
        vendorProducts.map(async (product) => {
          const displayPrice = await formatCurrency(product.price);
          return {
            id: product.id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            vendor_id: product.vendor_id,
            gender: product.gender,
            size: product.size,
            color: product.color,
            displayPrice: displayPrice,
            priceCurrency: currency
          };
        })
      );

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const reconvertProducts = async () => {
    if (products.length === 0) return;

    const reconverted = await Promise.all(
      products.map(async (product) => ({
        ...product,
        displayPrice: await formatCurrency(product.price),
        priceCurrency: currency
      }))
    );

    setProducts(reconverted);
  };

  const handleProductClick = (e, productId) => {
    e.stopPropagation();
    setSelectedProductId(selectedProductId === productId ? null : productId);
  };

  const handleDeleteProduct = async (e, productId) => {
    e.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (!window.confirm(`Are you sure you want to delete "${product?.name}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', parseInt(productId))
        .eq('vendor_id', profile.id);
      
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== productId));
      setSelectedProductId(null);
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleEditProduct = (e, productId) => {
    e.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (product) {
      navigate(`/vendor/products/edit/${productId}`, { state: { product } });
    }
  };

  const handleViewProduct = (e, productId) => {
    e.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (product) {
      navigate(`/vendor/products/${productId}`, { state: { product } });
    }
  };

  const handleAddProduct = () => {
    navigate('/vendor/AddProduct');
  };

  const handleColorSelect = (colorName) => {
    setSelectedColors(prev => 
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  const handleReset = () => {
    setSelectedGender('All');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColors([]);
    setSearchQuery('');
  };

  const handleApply = () => {
    setShowFilters(false);
  };

  const formatPrice = (price, displayPrice) => {
    return displayPrice || price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
  <PageContainer>
    <VendorHeader profile={profile} />
    <Container>
      <Header>
        <PageTitle>{t('Inventory')}</PageTitle>
        <AddButton onClick={handleAddProduct}>
          <IoAddCircleOutline />
          {t('AddProduct')}
        </AddButton>
      </Header>
      <StatsBar>
        <StatCard $color="#00BC7D">
          <StatValue>{totalProducts}</StatValue>
          <StatLabel>{t('TotalProducts')}</StatLabel>
        </StatCard>
        <StatCard $color="#1976D2">
          <StatValue>{convertedTotalValue}</StatValue>
          <StatLabel>{t('Total')}</StatLabel>
        </StatCard>
        <StatCard $color="#FFA940">
          <StatValue>{convertedAveragePrice}</StatValue>
          <StatLabel>{t('AveragePrice')}</StatLabel>
        </StatCard>
      </StatsBar>
      <SearchAndFilter>
        <SearchInput
          type="text"
          placeholder={t('SearchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterButtonContainer>
          <FilterButton ref={buttonRef} onClick={() => setShowFilters(!showFilters)}>
            <IoFilterOutline />
            {t('Filter')}
            <ChevronIcon $isOpen={showFilters} />
          </FilterButton>
          <FiltersDropdown ref={dropdownRef} $show={showFilters}>
            <FilterSection>
              <FilterTitle>{t('Gender')}</FilterTitle>
              <GenderOptions>
                {genderOptions.map(gender => (
                  <GenderButton key={gender} $selected={selectedGender === gender} onClick={() => setSelectedGender(gender)}>
                    {gender}
                  </GenderButton>
                ))}
              </GenderOptions>
            </FilterSection>
            <FilterSection>
              <FilterTitle>{t('Size')}</FilterTitle>
              <SizeGrid>
                {clothingSizes.map(size => (
                  <SizeButton key={size} $selected={selectedSize === size} onClick={() => setSelectedSize(selectedSize === size ? '' : size)}>
                    {size}
                  </SizeButton>
                ))}
              </SizeGrid>
            </FilterSection>
            <FilterSection>
              <FilterTitle>{t('PriceRange')}</FilterTitle>
              <PriceInputs>
                <PriceInput type="number" placeholder={t('MinPrice')} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <PriceInput type="number" placeholder={t('MaxPrice')} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </PriceInputs>
            </FilterSection>
            <FilterSection>
              <FilterTitle>{t('Colors')}</FilterTitle>
              <ColorGrid>
                {colorOptions.map(color => (
                  <ColorButton key={color.name} onClick={() => handleColorSelect(color.name)}>
                    <ColorCircle $color={color.hex} />
                    {selectedColors.includes(color.name) && <CheckIcon />}
                  </ColorButton>
                ))}
              </ColorGrid>
            </FilterSection>
            <FilterActions>
              <ResetButton onClick={handleReset}>{t('Reset')}</ResetButton>
              <ApplyButton onClick={handleApply}>{t('Apply')}</ApplyButton>
            </FilterActions>
          </FiltersDropdown>
        </FilterButtonContainer>
      </SearchAndFilter>
      {hasActiveFilters && (
        <ActiveFiltersBar>
          {selectedGender !== 'All' && (
            <ActiveFilterTag onClick={() => setSelectedGender('All')}>
              {selectedGender} ✕
            </ActiveFilterTag>
          )}
          {selectedSize && (
            <ActiveFilterTag onClick={() => setSelectedSize('')}>
              {t('Size')}: {selectedSize} ✕
            </ActiveFilterTag>
          )}
          {(minPrice || maxPrice) && (
            <ActiveFilterTag onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
              ${minPrice || '0'} - ${maxPrice || '∞'} ✕
            </ActiveFilterTag>
          )}
          {selectedColors.map(color => (
            <ActiveFilterTag key={color} onClick={() => handleColorSelect(color)}>
              {color} ✕
            </ActiveFilterTag>
          ))}
        </ActiveFiltersBar>
      )}
      {loading ? (
        <LoadingContainer>
          <Spinner />
          <LoadingText>{t('LoadingInventory')}</LoadingText>
        </LoadingContainer>
      ) : error ? (
        <ErrorText>{error}</ErrorText>
      ) : filteredProducts.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>📦</EmptyStateIcon>
          <EmptyStateTitle>
            {searchQuery || hasActiveFilters ? t('NoProductsFound') : t('NoProductsYet')}
          </EmptyStateTitle>
          <EmptyStateText>
            {searchQuery || hasActiveFilters ? t('TryAdjustingSearchOrFilters') : t('StartByAddingYourFirstProduct')}
          </EmptyStateText>
          {!searchQuery && !hasActiveFilters && (
            <AddButton onClick={handleAddProduct}>
              <IoAddCircleOutline />
              {t('AddYourFirstProduct')}
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <ProductsGrid>
          {filteredProducts.map((item) => (
            <ProductCardWrapper key={item.id} data-product-card>
              <ProductCard onClick={(e) => handleProductClick(e, item.id)}>
                <ImageContainer $isSelected={selectedProductId === item.id}>
                  <ProductImage src={item.image_url} alt={item.description} />
                </ImageContainer>
                <ProductDescription>{item.description}</ProductDescription>
                <ProductPrice>{formatPrice(item.price, item.displayPrice)}</ProductPrice>
              </ProductCard>
              <FloatingActions $isVisible={selectedProductId === item.id}>
                <FloatingIconButton
                  type="button"
                  onClick={(e) => handleViewProduct(e, item.id)}
                  title={t('ViewDetails')}
                  $isVisible={selectedProductId === item.id}
                  $delay="0s"
                >
                  <IoEyeOutline size={18} />
                </FloatingIconButton>
                <FloatingIconButton
                  type="button"
                  onClick={(e) => handleEditProduct(e, item.id)}
                  title={t('EditProduct')}
                  $isVisible={selectedProductId === item.id}
                  $delay="0.05s"
                >
                  <IoPencilOutline size={16} />
                </FloatingIconButton>
                <FloatingIconButton
                  type="button"
                  onClick={(e) => handleDeleteProduct(e, item.id)}
                  title={t('DeleteProduct')}
                  $isVisible={selectedProductId === item.id}
                  $delay="0.1s"
                >
                  <IoTrashOutline size={16} />
                </FloatingIconButton>
              </FloatingActions>
            </ProductCardWrapper>
          ))}
        </ProductsGrid>
      )}
    </Container>
  </PageContainer>
);
};

export default Inventory;