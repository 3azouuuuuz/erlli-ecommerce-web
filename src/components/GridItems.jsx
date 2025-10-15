import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  padding: 0 8px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const CategoryCard = styled.div`
  width: 100%;
  height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    height: 220px;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  width: 100%;
  height: 70%;
  padding: 8px;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
`;

const Label = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin-top: 8px;
`;

const CategoryName = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: #000;
  font-family: 'Raleway', sans-serif;
  letter-spacing: -0.17px;
  line-height: 21px;
`;

const Badge = styled.div`
  background-color: #F3F3F3;
  min-width: 38px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 6px;
`;

const BadgeText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #4CAF50;
  font-family: 'Raleway', sans-serif;
  line-height: 21px;
  letter-spacing: -0.5px;
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
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const GridItem = ({ item, onClick }) => {
  const subcategoryImages = item.subcategories.slice(0, 4);
  
  return (
    <CategoryCard onClick={onClick}>
      <ImageGrid>
        {subcategoryImages.map((sub, index) => (
          <ImageContainer key={index}>
            <CategoryImage src={sub.image_url} alt={sub.name} />
          </ImageContainer>
        ))}
      </ImageGrid>
      <Label>
        <CategoryName>{item.name}</CategoryName>
        <Badge>
          <BadgeText>{item.productCount}</BadgeText>
        </Badge>
      </Label>
    </CategoryCard>
  );
};

const GridItems = ({ limit }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            subcategories (id, name, image_url),
            products:products(count)
          `)
          .order('id', { ascending: true });

        if (error) throw error;

        setCategories(data.map(category => ({
          ...category,
          originalName: category.name,
          productCount: category.products?.[0]?.count || 0,
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/ItemsCategory?itemName=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
      </LoadingContainer>
    );
  }

  const displayCategories = limit ? categories.slice(0, limit) : categories;

  return (
    <GridContainer>
      {displayCategories.map((item) => (
        <GridItem 
          key={item.id} 
          item={item} 
          onClick={() => handleCategoryClick(item.originalName)}
        />
      ))}
    </GridContainer>
  );
};

export default GridItems;