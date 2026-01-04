import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';
import ShopHeader from '../../components/ShopHeader';
import TitleWithAction from '../../components/TitleWithAction';
import { supabase } from '../../lib/supabase';

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
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  margin: 0;
  color: #202020;
`;

const CategorySection = styled.div`
  margin-bottom: 40px;
`;

const ProductsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding: 10px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductCard = styled.div`
  min-width: 180px;
  width: 180px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  border: 5px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
`;

const ProductDescription = styled.div`
  margin-top: 10px;
  font-size: 13px;
  font-weight: 400;
  color: #000000;
  font-family: 'Raleway', sans-serif;
  min-height: 40px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin-top: 4px;
`;

const NoCategoriesText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 20px 0;
`;

const NoProductsText = styled.p`
  font-size: 14px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 20px 0;
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

const CategoriesList = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      setLoading(true);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .order('id', { ascending: true });

        if (categoriesError) throw categoriesError;
        if (!categoriesData || categoriesData.length === 0) {
          setCategoriesWithProducts([]);
          setLoading(false);
          return;
        }

        const categoriesWithProductsData = await Promise.all(
          categoriesData.map(async (category) => {
            const { data: productsData, error: productsError } = await supabase
              .from('products')
              .select(`
                id, name, description, price, image_url,
                flash_sale_products (discount_percentage, flash_sale_id, flash_sales (start_time, end_time))
              `)
              .eq('category_id', category.id)
              .order('created_at', { ascending: false })
              .limit(10);

            if (productsError) {
              console.error(`Error fetching products for ${category.id}:`, productsError);
              return { 
                ...category,
                name: t(`Category_${category.id}`) || category.name,
                originalName: category.name,
                products: [] 
              };
            }

            const currentTime = new Date().toISOString();
            const enrichedProducts = (productsData || []).map(product => {
              const activeFlashSale = product.flash_sale_products?.find(fsp => {
                const sale = fsp.flash_sales;
                return sale && sale.start_time <= currentTime && sale.end_time >= currentTime;
              });
              return {
                ...product,
                sale_percentage: activeFlashSale ? activeFlashSale.discount_percentage : null,
              };
            });

            // Convert prices using formatCurrency
            const productsWithConverted = await Promise.all(
              enrichedProducts.map(async (p) => {
                const displayPrice = await formatCurrency(p.price);
                const hasDiscount = p.sale_percentage && p.sale_percentage > 0;
                const discountedPrice = hasDiscount ? p.price * (1 - p.sale_percentage / 100) : null;
                const displayDiscountedPrice = hasDiscount ? await formatCurrency(discountedPrice) : null;

                return {
                  ...p,
                  displayPrice,
                  displayDiscountedPrice,
                };
              })
            );

            return {
              ...category,
              name: t(`Category_${category.id}`) || category.name,
              originalName: category.name,
              products: productsWithConverted,
            };
          })
        );

        setCategoriesWithProducts(categoriesWithProductsData);
      } catch (error) {
        console.error('Error in fetchCategoriesAndProducts:', error);
        setCategoriesWithProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, [formatCurrency, t]);

  const handleProductPress = (product) => {
    const standardizedProduct = {
      id: product.id,
      image_url: product.image_url || '',
      description: product.description || 'No description available',
      price: product.price || 0,
      displayPrice: product.displayPrice,
      sale_percentage: product.sale_percentage || null,
    };
    navigate(`/ProductsView?product=${encodeURIComponent(JSON.stringify(standardizedProduct))}`);
  };

  const handleSeeAll = (category) => {
    navigate(`/ItemsCategory?itemName=${encodeURIComponent(category.originalName)}`);
  };

  const getUserName = () => {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
    if (profile?.first_name) return profile.first_name;
    if (profile?.email) return profile.email.split('@')[0];
    if (user?.email) return user.email.split('@')[0];
    return t('UserName') || 'User';
  };

  if (loading) {
    return (
      <PageContainer>
        <ShopHeader
          isConnected={!!user}
          avatarUrl={profile?.avatar_url}
          userRole={profile?.role}
          userName={getUserName()}
          userEmail={profile?.email || user?.email || ''}
          onLogout={logout}
        />
        <LoadingContainer>
          <LoadingText>{t('LoadingCategories') || 'Loading categories'}...</LoadingText>
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
        userName={getUserName()}
        userEmail={profile?.email || user?.email || ''}
        onLogout={logout}
      />
      <Container>
        <HeaderSection>
          <PageTitle>{t('AllCategories') || 'All Categories'}</PageTitle>
        </HeaderSection>

        {categoriesWithProducts.length === 0 ? (
          <NoCategoriesText>{t('NoCategoriesAvailable') || 'No categories available'}</NoCategoriesText>
        ) : (
          categoriesWithProducts.map((category) => (
            <CategorySection key={category.id}>
              <TitleWithAction
                title={category.name}
                showClock={false}
                onPress={() => handleSeeAll(category)}
              />
              {category.products && category.products.length > 0 ? (
                <ProductsContainer>
                  {category.products.map((product) => {
                    const hasDiscount = product.sale_percentage && product.sale_percentage > 0;
                    return (
                      <ProductCard key={product.id} onClick={() => handleProductPress(product)}>
                        <ImageContainer>
                          <ProductImage src={product.image_url} alt={product.description} />
                        </ImageContainer>
                        <ProductDescription>{product.description}</ProductDescription>
                        <ProductPrice>
                          {hasDiscount ? product.displayDiscountedPrice : product.displayPrice}
                        </ProductPrice>
                      </ProductCard>
                    );
                  })}
                </ProductsContainer>
              ) : (
                <NoProductsText>{t('NoProductsAvailableInCategory') || 'No products available in this category'}</NoProductsText>
              )}
            </CategorySection>
          ))
        )}
      </Container>
    </PageContainer>
  );
};

export default CategoriesList;