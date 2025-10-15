import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import ShopHeader from '../../components/ShopHeader';
import RoundShapeList from '../../components/RoundShapeList';
import { supabase } from '../../lib/supabase';
import { IoCheckmarkCircle, IoChevronDown } from 'react-icons/io5';
import FilterIcon from '../../assets/images/Filter.png';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const Container = styled.div`
  padding: 80px 12px 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  margin: 0;
  color: #202020;
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
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FilterIconImg = styled.img`
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
`;

const ChevronIcon = styled(IoChevronDown)`
  font-size: 20px;
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
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

const SubcategoriesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const SubcategoryRow = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 5px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const ProductCard = styled.div`
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 240px;
  object-fit: cover;
  
  @media (max-width: 768px) {
    height: 180px;
  }
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ProductDescription = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 40px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Price = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #00BC7D;
  font-family: 'Raleway', sans-serif;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #999;
  font-family: 'Raleway', sans-serif;
  text-decoration: line-through;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  
  &:last-of-type {
    margin-bottom: 0;
  }
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
  background: ${props => props.$selected ? '#D0FAE5' : '#F9F9F9'};
  border: 2px solid ${props => props.$selected ? '#00BC7D' : 'transparent'};
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$selected ? '#00BC7D' : '#000000'};
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
  gap: 6px;
`;

const SizeButton = styled.button`
  background: ${props => props.$selected ? '#FFF' : '#ECFDF5'};
  border: 2px solid ${props => props.$selected ? '#00BC7D' : 'transparent'};
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$selected ? '#00BC7D' : '#B0B0B0'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$selected ? '0 2px 6px rgba(0, 188, 125, 0.2)' : 'none'};
  
  &:hover {
    background: #FFF;
    border-color: #00BC7D;
    color: #00BC7D;
  }
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
  
  &:focus {
    border-color: #00BC7D;
  }
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
  
  &:hover {
    transform: scale(1.1);
  }
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
  
  &:hover {
    background: #E02020;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
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
  
  &:hover {
    background: #00A86B;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 20px;
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: #666;
  font-family: 'Raleway', sans-serif;
`;

const NoProductsText = styled.p`
  font-size: 18px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 60px 20px;
`;

const ItemsCategory = () => {
  const [searchParams] = useSearchParams();
  const itemName = searchParams.get('itemName');
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);

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

  const isShoeCategory = itemName?.toLowerCase().includes('shoe');
  const sizes = isShoeCategory ? shoeSizes : clothingSizes;

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  useEffect(() => {
    const fetchCategoryAndSubcategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            subcategories (id, name, image_url)
          `)
          .eq('name', itemName)
          .single();

        if (error) throw error;

        if (data) {
          setCategory({
            ...data,
            originalName: data.name,
          });
          setSubcategories(data.subcategories || []);
        }
      } catch (error) {
        console.error('Error fetching category and subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (itemName) {
      fetchCategoryAndSubcategories();
    }
  }, [itemName]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;

      try {
        let query = supabase
          .from('products')
          .select(`
            id, name, description, price, image_url, category_id, subcategory_id,
            flash_sale_products (discount_percentage, flash_sale_id, flash_sales (start_time, end_time))
          `)
          .eq('category_id', category.id);

        if (selectedSubcategories.length > 0) {
          const { data: subcategoryData } = await supabase
            .from('subcategories')
            .select('id')
            .in('name', selectedSubcategories);
          
          if (subcategoryData) {
            query = query.in('subcategory_id', subcategoryData.map(sub => sub.id));
          }
        }

        if (selectedSize) {
          query = query.contains('size', [selectedSize]);
        }

        if (selectedColors.length > 0) {
          query = query.contains('color', selectedColors);
        }

        if (minPrice && maxPrice) {
          query = query.gte('price', parseFloat(minPrice)).lte('price', parseFloat(maxPrice));
        }

        const { data, error } = await query;

        if (error) throw error;

        const currentTime = new Date().toISOString();
        const enrichedProducts = data.map(product => {
          const activeFlashSale = product.flash_sale_products?.find(fsp => {
            const sale = fsp.flash_sales;
            return sale && sale.start_time <= currentTime && sale.end_time >= currentTime;
          });
          return {
            ...product,
            sale_percentage: activeFlashSale ? activeFlashSale.discount_percentage : null,
          };
        });

        setProducts(enrichedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [category, selectedSubcategories, selectedSize, selectedColors, minPrice, maxPrice]);

  const firstLine = subcategories.slice(0, 5);
  const secondLine = subcategories.slice(5);

  const handleRoundShapeListPress = (subcategoryName) => {
    setSelectedSubcategories((prev) => {
      if (prev.includes(subcategoryName)) {
        return prev.filter((name) => name !== subcategoryName);
      } else {
        return [...prev, subcategoryName];
      }
    });
  };

  const handleColorSelect = (colorName) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorName)) {
        return prev.filter((c) => c !== colorName);
      } else {
        return [...prev, colorName];
      }
    });
  };

  const handleReset = () => {
    setSelectedGender('All');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColors([]);
    setSelectedSubcategories([]);
  };

  const handleApply = () => {
    setShowFilters(false);
  };

  const handleProductPress = (product) => {
    const standardizedProduct = {
      id: product.id,
      image_url: product.image_url,
      description: product.description || 'No description available',
      price: product.price,
      sale_percentage: product.sale_percentage || null,
    };
    navigate(`/ProductsView?product=${encodeURIComponent(JSON.stringify(standardizedProduct))}`);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  if (loading) {
    return (
      <PageContainer>
        <ShopHeader
          isConnected={!!user}
          avatarUrl={profile?.avatar_url}
          userRole={profile?.role}
          userName={profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : profile?.first_name || profile?.email?.split('@')[0] || 'User'}
          userEmail={profile?.email || user?.email}
          onLogout={logout}
        />
        <LoadingContainer>
          <LoadingText>Loading...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!category) {
    return (
      <PageContainer>
        <ShopHeader
          isConnected={!!user}
          avatarUrl={profile?.avatar_url}
          userRole={profile?.role}
          userName={profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : profile?.first_name || profile?.email?.split('@')[0] || 'User'}
          userEmail={profile?.email || user?.email}
          onLogout={logout}
        />
        <LoadingContainer>
          <LoadingText>Category not found</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ShopHeader
        isConnected={!!user}
        avatarUrl={profile?.avatar_url}
        userRole={profile?.role}
        userName={profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : profile?.first_name || profile?.email?.split('@')[0] || 'User'}
        userEmail={profile?.email || user?.email}
        onLogout={logout}
        itemName={category.name}
      />
      
      <Container>
        <HeaderSection>
          <PageTitle>{category.name}</PageTitle>
          <FilterButtonContainer>
            <FilterButton ref={buttonRef} onClick={() => setShowFilters(!showFilters)}>
              <FilterIconImg src={FilterIcon} alt="Filter" />
              Filters
              <ChevronIcon $isOpen={showFilters} />
            </FilterButton>
            
            <FiltersDropdown ref={dropdownRef} $show={showFilters}>
              <FilterSection>
                <FilterTitle>Gender</FilterTitle>
                <GenderOptions>
                  {genderOptions.map((gender) => (
                    <GenderButton
                      key={gender}
                      $selected={selectedGender === gender}
                      onClick={() => setSelectedGender(gender)}
                    >
                      {gender}
                    </GenderButton>
                  ))}
                </GenderOptions>
              </FilterSection>

              <FilterSection>
                <FilterTitle>Size</FilterTitle>
                <SizeGrid>
                  {sizes.map((size) => (
                    <SizeButton
                      key={size}
                      $selected={selectedSize === size}
                      onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    >
                      {size}
                    </SizeButton>
                  ))}
                </SizeGrid>
              </FilterSection>

              <FilterSection>
                <FilterTitle>Price Range</FilterTitle>
                <PriceInputs>
                  <PriceInput
                    type="number"
                    placeholder="Min $"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <PriceInput
                    type="number"
                    placeholder="Max $"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </PriceInputs>
              </FilterSection>

              <FilterSection>
                <FilterTitle>Colors</FilterTitle>
                <ColorGrid>
                  {colorOptions.map((color) => (
                    <ColorButton key={color.name} onClick={() => handleColorSelect(color.name)}>
                      <ColorCircle $color={color.hex} />
                      {selectedColors.includes(color.name) && <CheckIcon />}
                    </ColorButton>
                  ))}
                </ColorGrid>
              </FilterSection>

              <FilterActions>
                <ResetButton onClick={handleReset}>Reset</ResetButton>
                <ApplyButton onClick={handleApply}>Apply</ApplyButton>
              </FilterActions>
            </FiltersDropdown>
          </FilterButtonContainer>
        </HeaderSection>

        {subcategories.length > 0 && (
          <SubcategoriesSection>
            {firstLine.length > 0 && (
              <SubcategoryRow>
                {firstLine.map((item) => (
                  <RoundShapeList
                    key={item.id}
                    text={item.name}
                    imageSource={item.image_url}
                    selectable={true}
                    isSelected={selectedSubcategories.includes(item.name)}
                    onSelect={() => handleRoundShapeListPress(item.name)}
                  />
                ))}
              </SubcategoryRow>
            )}
            {secondLine.length > 0 && (
              <SubcategoryRow>
                {secondLine.map((item) => (
                  <RoundShapeList
                    key={item.id}
                    text={item.name}
                    imageSource={item.image_url}
                    selectable={true}
                    isSelected={selectedSubcategories.includes(item.name)}
                    onSelect={() => handleRoundShapeListPress(item.name)}
                  />
                ))}
              </SubcategoryRow>
            )}
          </SubcategoriesSection>
        )}

        {products.length === 0 ? (
          <NoProductsText>No products found</NoProductsText>
        ) : (
          <ProductsGrid>
            {products.map((product) => {
              const hasDiscount = product.sale_percentage && product.sale_percentage > 0;
              const discountedPrice = hasDiscount 
                ? product.price * (1 - product.sale_percentage / 100) 
                : null;

              return (
                <ProductCard key={product.id} onClick={() => handleProductPress(product)}>
                  <ProductImage src={product.image_url} alt={product.description} />
                  <ProductInfo>
                    <ProductDescription>{product.description}</ProductDescription>
                    <PriceContainer>
                      <Price>{formatPrice(hasDiscount ? discountedPrice : product.price)}</Price>
                      {hasDiscount && (
                        <OriginalPrice>{formatPrice(product.price)}</OriginalPrice>
                      )}
                    </PriceContainer>
                  </ProductInfo>
                </ProductCard>
              );
            })}
          </ProductsGrid>
        )}
      </Container>
    </PageContainer>
  );
};

export default ItemsCategory;