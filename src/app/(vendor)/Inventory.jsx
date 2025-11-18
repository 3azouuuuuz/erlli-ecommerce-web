// Inventory.jsx (Vendor)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IoTrashOutline, IoPencilOutline, IoAddCircleOutline, IoEyeOutline } from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';

// Styled Components
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
  
  svg {
    font-size: 24px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
  }
  
  &:active {
    transform: translateY(0);
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
  
  &::placeholder {
    color: #999;
  }
`;

const FilterButton = styled.button`
  padding: 12px 20px;
  background: white;
  border: 2px solid #E8E8E8;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #00BC7D;
    color: #00BC7D;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: #00BC7D;
  }
`;

const ProductImageWrapper = styled.div`
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.1);
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ProductHeader = styled.div`
  margin-bottom: 8px;
`;

const ProductName = styled.h3`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #202020;
  margin: 0 0 6px 0;
  line-height: 1.3;
`;

const ProductDescription = styled.p`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F0F0F0;
`;

const ProductPrice = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #00BC7D;
  font-family: 'Raleway', sans-serif;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ViewButton = styled(ActionButton)`
  background: #E3F2FD;
  color: #1976D2;
  
  &:hover {
    background: #1976D2;
    color: white;
  }
`;

const EditButton = styled(ActionButton)`
  background: #D0FAE5;
  color: #00BC7D;
  
  &:hover {
    background: #00BC7D;
    color: white;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #FFEBEE;
  color: #D32F2F;
  
  &:hover {
    background: #D32F2F;
    color: white;
  }
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
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [profile?.id]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

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
        .select('id, name, description, price, image_url, vendor_id')
        .eq('vendor_id', profile.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const formattedProducts = vendorProducts.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        vendor_id: product.vendor_id,
      }));

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

  const handleViewProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      navigate(`/vendor/products/${productId}`, { state: { product } });
    }
  };

  const handleAddProduct = () => {
    navigate('/vendor/AddProduct');
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;

  return (
    <PageContainer>
      <VendorHeader profile={profile} />
      <Container>
        <Header>
          <PageTitle>Inventory</PageTitle>
          <AddButton onClick={handleAddProduct}>
            <IoAddCircleOutline />
            Add Product
          </AddButton>
        </Header>

        <StatsBar>
          <StatCard $color="#00BC7D">
            <StatValue>{totalProducts}</StatValue>
            <StatLabel>Total Products</StatLabel>
          </StatCard>
          <StatCard $color="#1976D2">
            <StatValue>${totalValue.toFixed(2)}</StatValue>
            <StatLabel>Total Value</StatLabel>
          </StatCard>
          <StatCard $color="#FFA940">
            <StatValue>${averagePrice.toFixed(2)}</StatValue>
            <StatLabel>Average Price</StatLabel>
          </StatCard>
        </StatsBar>

        <SearchAndFilter>
          <SearchInput
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FilterButton>Filter</FilterButton>
        </SearchAndFilter>

        {loading ? (
          <LoadingContainer>
            <Spinner />
            <LoadingText>Loading inventory...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorText>{error}</ErrorText>
        ) : filteredProducts.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>📦</EmptyStateIcon>
            <EmptyStateTitle>
              {searchQuery ? 'No products found' : 'No products yet'}
            </EmptyStateTitle>
            <EmptyStateText>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Start by adding your first product to the inventory'}
            </EmptyStateText>
            {!searchQuery && (
              <AddButton onClick={handleAddProduct}>
                <IoAddCircleOutline />
                Add Your First Product
              </AddButton>
            )}
          </EmptyState>
        ) : (
          <ProductsGrid>
            {filteredProducts.map((item) => (
              <ProductCard key={item.id} onClick={() => handleViewProduct(item.id)}>
                <ProductImageWrapper>
                  <ProductImage src={item.image_url} alt={item.name} />
                </ProductImageWrapper>
                <ProductInfo>
                  <ProductHeader>
                    <ProductName>{item.name}</ProductName>
                    <ProductDescription>{item.description}</ProductDescription>
                  </ProductHeader>
                  <ProductFooter>
                    <ProductPrice>${item.price.toFixed(2)}</ProductPrice>
                    <ActionButtons onClick={(e) => e.stopPropagation()}>
                      <ViewButton onClick={() => handleViewProduct(item.id)} title="View">
                        <IoEyeOutline size={16} />
                      </ViewButton>
                      <EditButton onClick={(e) => handleEditProduct(e, item.id)} title="Edit">
                        <IoPencilOutline size={14} />
                      </EditButton>
                      <DeleteButton onClick={(e) => handleDeleteProduct(e, item.id)} title="Delete">
                        <IoTrashOutline size={16} />
                      </DeleteButton>
                    </ActionButtons>
                  </ProductFooter>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        )}
      </Container>
    </PageContainer>
  );
};

export default Inventory;