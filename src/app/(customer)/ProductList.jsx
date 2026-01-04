import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import ShopHeader from '../../components/ShopHeader';
import ItemsList from '../../components/Items';
import FilterIcon from '../../assets/images/Filter.png';
import { supabase } from '../../lib/supabase';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;
const Container = styled.div`
  padding: 80px 12px 20px;
  max-width: 1200px;
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
const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
`;
const FilterHeaderText = styled.h2`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0;
`;
const OkButton = styled.button`
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
  &:active {
    transform: translateY(0);
  }
`;
const CategoryItem = styled.div`
  background: white;
  border-radius: 7px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 10px;
  padding: 10px;
`;
const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;
const ImageTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const CategoryImage = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
`;
const CategoryText = styled.span`
  font-size: 17px;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  color: #000000;
`;
const ArrowIcon = styled.div`
  font-size: 20px;
  color: ${props => props.$isExpanded ? '#00BC7D' : '#000000'};
`;
const SubcategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 7px;
  margin-top: 10px;
`;
const SubcategoryButton = styled.button`
  background: ${props => props.$selected ? '#D0FAE5' : '#FFFFFF'};
  border: 2px solid ${props => props.$selected ? '#00BC7D' : '#FFEBEB'};
  padding: 10px;
  border-radius: 9px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$selected ? '#00BC7D' : '#000000'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  &:hover {
    background: #D0FAE5;
    border-color: #00BC7D;
    color: #00BC7D;
  }
`;
const NoCategoriesText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 20px;
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
const LoadMoreButton = styled.button`
  display: block;
  margin: 20px auto;
  padding: 12px 24px;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: white;
  border: none;
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
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ProductList = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const section = searchParams.get('section');
  const discount = searchParams.get('discount');
  const subcategoryId = searchParams.get('subcategoryId');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubcategories, setActiveSubcategories] = useState([]);
  const [clothingCategories, setClothingCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const ITEMS_PER_PAGE = 6;
  const LOAD_MORE_ITEMS = 4;

  useEffect(() => {
    if (subcategoryId) {
      setActiveSubcategories([parseInt(subcategoryId)]);
    }
  }, [subcategoryId]);

  useEffect(() => {
    const fetchClothingCategories = async () => {
      if (!showFilters) return;
      setLoadingCategories(true);
      try {
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select(`
            id, name,
            subcategories (id, name, image_url)
          `);
        if (error) throw error;
        const formattedCategories = categoriesData.map(category => ({
          ...category,
          subcategories: Array.isArray(category.subcategories) ? category.subcategories : [],
        }));
        setClothingCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setClothingCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchClothingCategories();
  }, [showFilters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  const fetchProducts = useCallback(async (pageNum, reset = false) => {
    if (!hasMore && !reset) return;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      let query;
      if (section === 'flash-sale') {
        const { data: flashSaleData, error: flashSaleError } = await supabase
          .from('flash_sales')
          .select('id')
          .lte('start_time', 'now()')
          .gte('end_time', 'now()')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (flashSaleError || !flashSaleData) throw new Error('No active flash sale');
        query = supabase
          .from('flash_sale_products')
          .select(`
            product_id,
            discount_percentage,
            products!inner (
              id, name, description, price, image_url, category_id, subcategory_id, gender,
              material, stock_quantity, created_at, updated_at, likes_count, size, color
            )
          `)
          .eq('flash_sale_id', flashSaleData.id);
        if (discount && discount !== 'All') {
          const discountValue = parseInt(discount.replace('%', ''));
          query = query.eq('discount_percentage', discountValue);
        }
      } else {
        query = supabase
          .from('products')
          .select(`
            id, name, description, price, image_url, category_id, subcategory_id, gender,
            material, stock_quantity, created_at, updated_at, likes_count, size, color
          `);
        if (section === 'most-popular') query = query.order('likes_count', { ascending: false });
        else if (section === 'new-items') query = query.order('created_at', { ascending: false });
        if (activeSubcategories.length > 0) query = query.in('subcategory_id', activeSubcategories);
      }
      const start = (pageNum - 1) * (reset ? ITEMS_PER_PAGE : LOAD_MORE_ITEMS);
      const end = start + (reset ? ITEMS_PER_PAGE - 1 : LOAD_MORE_ITEMS - 1);
      query = query.range(start, end);
      const { data, error } = await query;
      if (error) {
        console.error(error);
        setProducts([]);
      } else {
        const formattedData = section === 'flash-sale'
          ? data.map(item => ({ ...item.products, sale_percentage: item.discount_percentage }))
          : data;
        if (reset) setProducts(formattedData);
        else setProducts(prev => [...prev, ...formattedData]);
        setHasMore(data.length === (reset ? ITEMS_PER_PAGE : LOAD_MORE_ITEMS));
      }
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  }, [section, discount, activeSubcategories, hasMore]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [section, discount, activeSubcategories, fetchProducts]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const handleItemPress = (item) => {
    const standardizedProduct = {
      id: item.id,
      image_url: item.image_url,
      description: item.description || 'No description available',
      price: item.price,
      sale_percentage: item.sale_percentage || null,
    };
    navigate(`/ProductsView?product=${encodeURIComponent(JSON.stringify(standardizedProduct))}`);
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchProducts(1, true);
    setShowFilters(false);
  };

  const handleSubcategoryToggle = (subcategoryId) => {
    setActiveSubcategories(prev => prev.includes(subcategoryId)
      ? prev.filter(id => id !== subcategoryId)
      : [...prev, subcategoryId]
    );
  };

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getTitle = () => {
    if (section === 'most-popular') return t('MostPopular');
    if (section === 'new-items') return t('NewItems');
    if (section === 'flash-sale') return `${t('FlashSale')} - ${discount || t('All')} ${t('Discount')}`;
    return t('Products');
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
          <LoadingText>{t('Loading')}</LoadingText>
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
      />
      <Container>
        <HeaderSection>
          <PageTitle>{getTitle()}</PageTitle>
          <FilterButtonContainer>
            <FilterButton ref={buttonRef} onClick={() => setShowFilters(!showFilters)}>
              <FilterIconImg src={FilterIcon} alt="Filter" />
              {t('Filters')}
              <ChevronIcon $isOpen={showFilters} />
            </FilterButton>
            <FiltersDropdown ref={dropdownRef} $show={showFilters}>
              <FilterHeader>
                <FilterHeaderText>{t('AllCategories')}</FilterHeaderText>
                <OkButton onClick={handleApplyFilters}>{t('Ok')}</OkButton>
              </FilterHeader>
              {loadingCategories ? (
                <LoadingContainer>
                  <LoadingText>{t('LoadingCategories')}</LoadingText>
                </LoadingContainer>
              ) : clothingCategories.length === 0 ? (
                <NoCategoriesText>{t('NoCategoriesAvailable')}</NoCategoriesText>
              ) : (
                clothingCategories.map((category) => (
                  <CategoryItem key={category.id}>
                    <CategoryHeader onClick={() => handleCategoryToggle(category.id)}>
                      <ImageTextContainer>
                        <CategoryImage
                          src={category.subcategories?.[0]?.image_url || 'https://via.placeholder.com/44'}
                          alt={category.name}
                        />
                        <CategoryText>{category.name}</CategoryText>
                      </ImageTextContainer>
                      <ArrowIcon $isExpanded={expandedCategory === category.id}>
                        {expandedCategory === category.id ? <IoChevronUp /> : <IoChevronDown />}
                      </ArrowIcon>
                    </CategoryHeader>
                    {expandedCategory === category.id && (
                      <SubcategoryGrid>
                        {category.subcategories.length > 0 ? (
                          category.subcategories.map((subcategory) => (
                            <SubcategoryButton
                              key={subcategory.id}
                              $selected={activeSubcategories.includes(subcategory.id)}
                              onClick={() => handleSubcategoryToggle(subcategory.id)}
                            >
                              {subcategory.name}
                            </SubcategoryButton>
                          ))
                        ) : (
                          <NoCategoriesText>{t('NoSubcategoriesAvailable')}</NoCategoriesText>
                        )}
                      </SubcategoryGrid>
                    )}
                  </CategoryItem>
                ))
              )}
            </FiltersDropdown>
          </FilterButtonContainer>
        </HeaderSection>
        {products.length === 0 ? (
          <NoProductsText>{t('NoProductsFound')}</NoProductsText>
        ) : (
          <>
            <ItemsList
              items={products}
              grid={true}
              badge={section === 'flash-sale'}
              limit={ITEMS_PER_PAGE}
              onPress={handleItemPress}
            />
            {hasMore && (
              <LoadMoreButton onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? t('Loading') : t('LoadMore')}
              </LoadMoreButton>
            )}
          </>
        )}
      </Container>
    </PageContainer>
  );
};

export default ProductList;