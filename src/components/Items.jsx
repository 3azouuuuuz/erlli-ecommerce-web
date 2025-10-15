import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';

const Container = styled.div`
  width: 100%;
`;

const ListContainer = styled.div`
  display: ${props => props.$grid ? 'grid' : 'flex'};
  ${props => props.$grid ? `
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  ` : `
    overflow-x: auto;
    gap: 16px;
    padding: 0 8px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  `}
  
  @media (max-width: 768px) {
    ${props => props.$grid && `
      grid-template-columns: repeat(2, 1fr);
    `}
  }
`;

const ItemContainer = styled.div`
  ${props => props.$grid ? `
    width: 100%;
  ` : `
    min-width: 180px;
    width: 180px;
  `}
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
  position: relative;
  ${props => props.$grid ? `
    width: 100%;
    padding-bottom: 100%;
  ` : `
    width: 180px;
    height: 180px;
  `}
  border-radius: 12px;
  overflow: hidden;
  border: 5px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ItemImage = styled.img`
  ${props => props.$grid ? `
    position: absolute;
    top: 0;
    left: 0;
  ` : ''}
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
`;

const SaleBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #FF3333;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 12px;
  min-width: 60px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
`;

const SaleText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #FFFFFF;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  line-height: 18px;
`;

const ItemDescription = styled.div`
  margin-top: ${props => props.grid ? '8px' : '10px'};
  font-size: 13px;
  font-weight: 400;
  color: #000000;
  font-family: 'Raleway', sans-serif;
  min-height: 40px;
  line-height: 1.5;
`;

const HighlightedText = styled.span`
  background-color: #D0FAE5;
  color: #202020;
`;

const PriceContainer = styled.div`
  margin-bottom: 8px;
`;

const ItemPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
  margin-top: ${props => props.grid ? '-8px' : '0'};
  margin-bottom: ${props => props.grid ? '4px' : '0'};
`;

const DiscountedPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #202020;
  font-family: 'Raleway', sans-serif;
`;

const RealPriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2px;
  gap: 6px;
`;

const RealPrice = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #F1AEAE;
  font-family: 'Raleway', sans-serif;
  text-decoration: line-through;
`;

const DiscountPercentage = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #FF0000;
  font-family: 'Raleway', sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D0FAE5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NoResultsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const NoResultsText = styled.div`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
`;

const Item = ({ item, grid, badge, onPress, searchQuery = '' }) => {
  const highlightText = (text, query) => {
    if (!query || !text || !query.trim()) {
      return text;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <HighlightedText key={index}>{part}</HighlightedText>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const realPrice = item.price;
  const hasDiscount = item.sale_percentage && item.sale_percentage > 0;
  const discountedPrice = hasDiscount ? realPrice * (1 - item.sale_percentage / 100) : null;

  const formatPrice = (price) => {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <ItemContainer grid={grid} onClick={() => onPress && onPress(item)}>
      <ImageContainer grid={grid}>
        <ItemImage src={item.image_url} alt={item.description} grid={grid} />
        {badge && hasDiscount && (
          <SaleBadge>
            <SaleText>{item.sale_percentage}% OFF</SaleText>
          </SaleBadge>
        )}
      </ImageContainer>
      <ItemDescription grid={grid}>
        {highlightText(item.description, searchQuery)}
      </ItemDescription>
      {hasDiscount ? (
        <PriceContainer>
          <DiscountedPrice>{formatPrice(discountedPrice)}</DiscountedPrice>
          <RealPriceContainer>
            <RealPrice>{formatPrice(realPrice)}</RealPrice>
            <DiscountPercentage>-{item.sale_percentage}%</DiscountPercentage>
          </RealPriceContainer>
        </PriceContainer>
      ) : (
        <ItemPrice grid={grid}>{formatPrice(realPrice)}</ItemPrice>
      )}
    </ItemContainer>
  );
};

const ItemsList = ({ 
  grid = false, 
  badge = false, 
  limit, 
  category, 
  subcategories, 
  searchQuery = '', 
  onPress, 
  filters = {}, 
  items = null 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items) {
      setProducts(items);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);

      let query = supabase
        .from('products')
        .select(`
          id, name, description, price, image_url, category_id, subcategory_id, gender,
          material, stock_quantity, created_at, updated_at, likes_count, size, color,
          flash_sale_products (discount_percentage, flash_sale_id, flash_sales (start_time, end_time))
        `);

      if (category) {
        const { data: categoryData } = await supabase.from('categories').select('id').eq('name', category).single();
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (subcategories && subcategories.length > 0) {
        const { data: subcategoryData } = await supabase.from('subcategories').select('id').in('name', subcategories);
        if (subcategoryData) {
          query = query.in('subcategory_id', subcategoryData.map(sub => sub.id));
        }
      }

      if (filters && Object.keys(filters).length > 0) {
        if (filters.size) {
          query = query.contains('size', [filters.size]);
        }
        if (filters.colors && filters.colors.length > 0) {
          query = query.contains('color', filters.colors);
        }
        if (filters.priceRange && filters.priceRange.length === 2) {
          const [minPrice, maxPrice] = filters.priceRange;
          query = query.gte('price', minPrice).lte('price', maxPrice);
        }
        if (filters.sort) {
          query = query.order('price', { ascending: filters.sort === 'Low to High' });
        }
      }

      if (searchQuery && searchQuery.trim().length > 0) {
        query = query.or(`description.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
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
        setProducts(limit ? enrichedProducts.slice(0, limit) : enrichedProducts);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [category, subcategories, searchQuery, limit, JSON.stringify(filters), items]);

  return (
    <Container>
      {loading ? (
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      ) : products.length === 0 ? (
        <NoResultsContainer>
          <NoResultsText>No Products Found</NoResultsText>
        </NoResultsContainer>
      ) : (
        <ListContainer grid={grid}>
          {products.map((item) => (
            <Item 
              key={item.id} 
              item={item} 
              grid={grid} 
              badge={badge} 
              searchQuery={searchQuery} 
              onPress={onPress} 
            />
          ))}
        </ListContainer>
      )}
    </Container>
  );
};

export default ItemsList;