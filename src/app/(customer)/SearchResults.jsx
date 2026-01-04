import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import ShopHeader from '../../components/ShopHeader';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';

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
  margin-bottom: 30px;
`;

const SearchQuery = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 10px 0;
  color: #202020;
`;

const ResultCount = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0;
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

const HighlightedText = styled.span`
  background-color: #D0FAE5;
  color: #202020;
  font-weight: 600;
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

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
`;

const NoResultsText = styled.p`
  font-size: 20px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 10px 0;
`;

const NoResultsSubtext = styled.p`
  font-size: 16px;
  color: #999;
  font-family: 'Raleway', sans-serif;
  margin: 0;
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { formatCurrency, currency } = useCurrency();
  const { t } = useTranslation();
  
  const [products, setProducts] = useState([]);
  const [convertedProducts, setConvertedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, name, description, price, image_url,
            flash_sale_products (discount_percentage, flash_sale_id, flash_sales (start_time, end_time))
          `)
          .or(`description.ilike.%${query}%,name.ilike.%${query}%`);

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
        console.error('Error fetching search results:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Convert product prices when currency changes
  useEffect(() => {
    const convertProductPrices = async () => {
      if (products.length === 0) return;
      
      const productsWithConvertedPrices = await Promise.all(
        products.map(async (product) => {
          const hasDiscount = product.sale_percentage && product.sale_percentage > 0;
          const discountedPrice = hasDiscount 
            ? product.price * (1 - product.sale_percentage / 100) 
            : product.price;
          
          const displayPrice = await formatCurrency(hasDiscount ? discountedPrice : product.price);
          const displayOriginalPrice = hasDiscount ? await formatCurrency(product.price) : null;
          
          return {
            ...product,
            displayPrice,
            displayOriginalPrice,
            priceCurrency: currency
          };
        })
      );
      setConvertedProducts(productsWithConvertedPrices);
    };
    
    convertProductPrices();
  }, [products, currency, formatCurrency]);

  const highlightText = (text, searchQuery) => {
    if (!searchQuery || !text) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <HighlightedText key={index}>{part}</HighlightedText>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const handleProductPress = (product) => {
    const standardizedProduct = {
      id: product.id,
      image_url: product.image_url,
      description: product.description || 'No description available',
      price: product.price,
      displayPrice: product.displayPrice,
      sale_percentage: product.sale_percentage || null,
    };
    navigate(`/ProductsView?product=${encodeURIComponent(JSON.stringify(standardizedProduct))}`);
  };

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
          <LoadingText>{t('Searching') || 'Searching'}...</LoadingText>
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
        userEmail={profile?.email || user?.email}
        onLogout={logout}
      />
      
      <Container>
        <HeaderSection>
          <SearchQuery>{t('SearchResultsFor') || 'Search results for'} "{query}"</SearchQuery>
          <ResultCount>
            {convertedProducts.length} {convertedProducts.length === 1 ? (t('product') || 'product') : (t('products') || 'products')} {t('found') || 'found'}
          </ResultCount>
        </HeaderSection>

        {convertedProducts.length === 0 ? (
          <NoResultsContainer>
            <NoResultsText>{t('NoProductsFoundFor') || 'No products found for'} "{query}"</NoResultsText>
            <NoResultsSubtext>{t('TrySearchingDifferentKeywords') || 'Try searching with different keywords'}</NoResultsSubtext>
          </NoResultsContainer>
        ) : (
          <ProductsGrid>
            {convertedProducts.map((product) => {
              const hasDiscount = product.sale_percentage && product.sale_percentage > 0;

              return (
                <ProductCard key={product.id} onClick={() => handleProductPress(product)}>
                  <ProductImage src={product.image_url} alt={product.description} />
                  <ProductInfo>
                    <ProductDescription>
                      {highlightText(product.description, query)}
                    </ProductDescription>
                    <PriceContainer>
                      <Price>{product.displayPrice}</Price>
                      {hasDiscount && product.displayOriginalPrice && (
                        <OriginalPrice>{product.displayOriginalPrice}</OriginalPrice>
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

export default SearchResults;