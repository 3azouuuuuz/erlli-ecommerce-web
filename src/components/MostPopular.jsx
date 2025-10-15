import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { IoHeart } from 'react-icons/io5';
import { supabase } from '../lib/supabase';

const Container = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 0 10px 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ItemCard = styled.div`
  min-width: 160px;
  width: 160px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  width: 140px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
`;

const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Label = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  width: 90%;
`;

const LikesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const LikesText = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #000000;
  font-family: 'Raleway', sans-serif;
  letter-spacing: -0.15px;
  line-height: 19px;
`;

const HeartIcon = styled(IoHeart)`
  font-size: 14px;
  color: #00BC7D;
  position: relative;
  top: -1px;
`;

const NewText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #4CAF50;
  font-family: 'Raleway', sans-serif;
  line-height: 17px;
  letter-spacing: -0.13px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  width: 100%;
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

const NoItemsText = styled.div`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 40px 10px;
  width: 100%;
`;

const MostPopularItem = ({ item, onClick }) => {
  return (
    <ItemCard onClick={onClick}>
      <ImageContainer>
        <ItemImage src={item.image_url} alt={item.name || item.description} />
      </ImageContainer>
      <Label>
        <LikesContainer>
          <LikesText>{item.likes_count || 0}</LikesText>
          <HeartIcon />
        </LikesContainer>
        <NewText>New</NewText>
      </Label>
    </ItemCard>
  );
};

const MostPopular = () => {
  const navigate = useNavigate();
  const [popularItems, setPopularItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMostPopularItems = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, image_url, likes_count, description, price, views_count, name,
            category_id, subcategory_id, gender, material, stock_quantity, vendor_id,
            flash_sale_products (discount_percentage, flash_sale_id, flash_sales (start_time, end_time))
          `)
          .order('likes_count', { ascending: false })
          .limit(5);

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

        console.log('Fetched Most Popular Items:', enrichedProducts);
        setPopularItems(enrichedProducts);
      } catch (error) {
        console.error('Error fetching most popular items:', error.message);
        setPopularItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostPopularItems();
  }, []);

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

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
      </LoadingContainer>
    );
  }

  if (popularItems.length === 0) {
    return <NoItemsText>No popular items found</NoItemsText>;
  }

  return (
    <Container>
      {popularItems.map((item) => (
        <MostPopularItem 
          key={item.id} 
          item={item} 
          onClick={() => handleItemPress(item)}
        />
      ))}
    </Container>
  );
};

export default MostPopular;