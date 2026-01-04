import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ProductHeader from '../../components/ProductHeader';
import ProductDetails from '../../components/ProductDetails';
import OrderStatsSection from '../../components/OrderStatsSection';
import WeeklySalesChart from '../../components/WeeklySalesChart';
import VariationsSection from '../../components/VariationsSection';
import SpecificationsSection from '../../components/SpecificationsSection';
import RatingReviewSection from '../../components/RatingReviewSection';
import VendorHeader from '../../components/VendorHeader';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  padding-top: 80px;
  background: #fafbfc;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 32px;
  margin-bottom: 48px;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 400px;
    gap: 24px;
  }
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 100px;
  align-self: flex-start;
  @media (max-width: 968px) {
    position: static;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e8eaed;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 18px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #1a1a2e;
`;

const ErrorContainer = styled.div`
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin: 24px;
`;

const ErrorTitle = styled.h1`
  font-size: 32px;
  font-family: 'Raleway', sans-serif;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 12px 0;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  margin: 0 0 32px 0;
`;

const GoBackButton = styled.button`
  padding: 16px 32px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 188, 125, 0.3);
  }
`;

const VendorProductView = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { profile } = useAuth();
  const navigate = useNavigate();
const { t } = useTranslation();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const [productData, setProductData] = useState(null);

  // Support both: URL search param OR route state
  useEffect(() => {
    const productParam = searchParams.get('product');
    const stateProduct = location.state?.product;

    if (productParam) {
      try {
        setProductData(JSON.parse(decodeURIComponent(productParam)));
      } catch (err) {
        console.error('Error parsing product data from URL:', err);
        setError('Invalid product data');
        setLoading(false);
      }
    } else if (stateProduct) {
      setProductData(stateProduct);
    } else {
      setError('No product data provided');
      setLoading(false);
    }
  }, [searchParams, location.state]);

  useEffect(() => {
    const fetchVariations = async () => {
      if (!productData?.id) return;
      
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('product_variations')
          .select('*')
          .eq('product_id', productData.id);
        if (fetchError) throw fetchError;
        setVariations(data || []);
        if (data && data.length > 0) {
          setSelectedVariationId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching variations:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productData?.id) {
      fetchVariations();
    }
  }, [productData?.id]);

  const handleViewAllReviews = () => setShowAllReviews(true);

  const handleVariationImagePress = (variationId) => {
    setSelectedVariationId(variationId);
  };

  const handleVariationChange = (variationId) => {
    setSelectedVariationId(variationId);
  };

  if (loading && !productData) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>Loading product details...</LoadingText>
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  if (error || !productData) {
    return (
      <PageContainer>
        <VendorHeader profile={profile} />
        <ErrorContainer>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😞</div>
          <ErrorTitle>{error || 'Product not found'}</ErrorTitle>
          <ErrorMessage>We couldn't load this product. Please try again later.</ErrorMessage>
          <GoBackButton onClick={() => navigate(-1)}>Go Back</GoBackButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

 return (
  <PageContainer>
    <VendorHeader profile={profile} />
    <ContentWrapper>
      <MainGrid>
        <LeftColumn>
         <ProductHeader
  productData={productData}
  variations={variations}
  selectedVariationId={selectedVariationId}
  onSelectVariation={handleVariationChange}
  profile={profile}
  isVendorView={true}
/>
          <VariationsSection
            variations={variations}
            loading={loading}
            showEmptyView={false}
            selectedVariation={null}
            onSelectVariation={() => {}}
            selectedSize={null}
            onSelectSize={() => {}}
            onVariationImagePress={handleVariationImagePress}
            selectedVariationId={selectedVariationId}
          />
          <SpecificationsSection
  variations={variations}
  loading={loading}
  condition={productData.condition}
  productId={productData.id}
/>
          <RatingReviewSection
            showAllReviews={showAllReviews}
            onViewAllReviews={handleViewAllReviews}
            productId={productData.id}
          />
        </LeftColumn>
        <RightColumn>
          <ProductDetails productData={productData} />
          <OrderStatsSection productData={productData} />
          <WeeklySalesChart productData={productData} />
        </RightColumn>
      </MainGrid>
    </ContentWrapper>
  </PageContainer>
);
};

export default VendorProductView;