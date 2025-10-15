import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import ProductHeader from '../../components/ProductHeader';
import ProductDetails from '../../components/ProductDetails';
import ProductOptions from '../../components/ProductOptions';
import SpecificationsSection from '../../components/SpecificationsSection';
import DeliverySection from '../../components/DeliverySection';
import RatingReviewSection from '../../components/RatingReviewSection';
import LoadingMessage from '../../components/LoadingMessage';
import TitleWithAction from '../../components/TitleWithAction';
import MostPopular from '../../components/MostPopular';
import ItemsList from '../../components/Items';
import ShopHeader from '../../components/ShopHeader';
import { IoStar, IoStorefrontOutline, IoCallOutline } from 'react-icons/io5';

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

const StoreCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: #00BC7D;
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
  }
`;

const StoreHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
  margin-bottom: 20px;
`;

const StoreAvatar = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid #00BC7D;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.2);
`;

const StoreInfo = styled.div`
  flex: 1;
`;

const StoreName = styled.div`
  font-size: 22px;
  font-family: 'Raleway', sans-serif;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 6px;
`;

const StoreStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StoreActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
`;

const StoreButton = styled.button`
  padding: 14px 20px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)' : 'white'};
  color: ${props => props.primary ? 'white' : '#1a1a2e'};
  border: 2px solid ${props => props.primary ? 'transparent' : '#e8eaed'};
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.primary ? 'rgba(0, 188, 125, 0.3)' : 'rgba(0, 0, 0, 0.08)'};
    border-color: ${props => props.primary ? 'transparent' : '#00BC7D'};
  }
`;

const StoreDescription = styled.p`
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  line-height: 1.6;
  margin: 0;
`;

const SectionDivider = styled.div`
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #e8eaed 50%, transparent 100%);
  margin: 48px 0;
`;

const RecommendationsSection = styled.div`
  margin-top: 48px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SectionLabel = styled.h3`
  font-size: 28px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 22px;
  }
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

  @media (max-width: 768px) {
    font-size: 24px;
  }
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

const ProductsView = () => {
  const [searchParams] = useSearchParams();
  const product = searchParams.get('product');
  const { profile } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist } = useCart();
  const navigate = useNavigate();

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoadingMessageVisible, setIsLoadingMessageVisible] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState('loading');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isShoes, setIsShoes] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);

  let productData = {};
  try {
    productData = product ? JSON.parse(decodeURIComponent(product)) : {};
  } catch (err) {
    console.error('Error parsing product data:', err);
  }

  useEffect(() => {
    const fetchProductDetails = async () => {
      console.log('ProductData:', productData); // Debug log
      
      if (!productData || !productData.id) {
        console.error('No product data or ID');
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data: productDetails, error: productError } = await supabase
          .from('products')
          .select('id, category_id, vendor_id, weight, condition')
          .eq('id', productData.id)
          .maybeSingle();

        if (productError) throw productError;
        if (!productDetails) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        const isProductShoes = productDetails.category_id === 2;
        setIsShoes(isProductShoes);

        const { data: variationsData, error: variationsError } = await supabase
          .from('product_variations')
          .select('*')
          .eq('product_id', productData.id)
          .limit(5);

        if (variationsError) {
          console.error('Variations error:', variationsError);
          setVariations([]);
        } else {
          const shoeSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
          const filteredVariations = isProductShoes
            ? variationsData.filter(v => shoeSizes.includes(v.size) || !v.size)
            : variationsData;

          setVariations(filteredVariations || []);
          if (filteredVariations && filteredVariations.length > 0) {
            setSelectedVariation(filteredVariations[0].id);
            const defaultSize = isProductShoes ? '8' : 'M';
            setSelectedSize(defaultSize);
          }
        }

        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, name, logo_url, vendor_id')
          .eq('vendor_id', productDetails.vendor_id)
          .maybeSingle();

        if (storeError && storeError.code !== 'PGRST116') {
          console.error('Store fetch error:', storeError);
        }

        const { count, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', productDetails.vendor_id);

        if (countError) {
          console.error('Count error:', countError);
        }

        setStoreData(
          store
            ? {
                id: store.id,
                name: store.name,
                logo_url: store.logo_url || 'https://via.placeholder.com/72',
                vendor_id: store.vendor_id,
              }
            : null
        );
        setProductsCount(count || 0);
      } catch (error) {
        console.error('Error fetching product details:', error.message);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (productData.id) {
      fetchProductDetails();
    }
  }, [productData.id]);

  useEffect(() => {
    const checkIfLikedAndTrackView = async () => {
      if (!profile?.id || !productData.id) return;

      try {
        const { data: likeData, error: likeError } = await supabase
          .from('product_likes')
          .select('id')
          .eq('product_id', productData.id)
          .eq('user_id', profile.id)
          .maybeSingle();

        if (likeError && likeError.code !== 'PGRST116') {
          console.error('Like check error:', likeError);
        }

        setIsLiked(!!likeData);

        const { data: viewData, error: viewError } = await supabase
          .from('product_views')
          .select('id')
          .eq('product_id', productData.id)
          .eq('user_id', profile.id)
          .maybeSingle();

        if (viewError && viewError.code !== 'PGRST116') {
          console.error('View check error:', viewError);
        }

        if (!viewData) {
          const { error: insertError } = await supabase
            .from('product_views')
            .insert([{ product_id: productData.id, user_id: profile.id }]);

          if (insertError) {
            console.error('View insert error:', insertError);
          } else {
            const { error: updateError } = await supabase
              .from('products')
              .update({ views_count: productData.views_count ? productData.views_count + 1 : 1 })
              .eq('id', productData.id);

            if (updateError) {
              console.error('Views count update error:', updateError);
            }
          }
        }
      } catch (error) {
        console.error('Error in checkIfLikedAndTrackView:', error.message);
      }
    };

    checkIfLikedAndTrackView();
  }, [productData.id, profile?.id]);

  const handleLikePress = async () => {
    if (!profile?.id) {
      window.alert('Please log in to like products');
      return;
    }

    const productToLike = {
      id: productData.id,
      image_url: productData.image_url,
      description: productData.description || 'No description available',
      price: productData.price,
      sale_percentage: productData.sale_percentage || null,
    };

    if (isLiked) {
      await removeFromWishlist(productData.id);
      setIsLiked(false);
    } else {
      const success = await addToWishlist(productToLike);
      if (success) setIsLiked(true);
    }
  };

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const handleViewAllReviews = () => setShowAllReviews(true);

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

  const handleAddToCart = async () => {
    if (!selectedVariation || !selectedSize || !selectedShippingOption) {
      window.alert('Please select all options');
      return;
    }

    setIsLoadingMessageVisible(true);
    setLoadingScenario('loading');
    setLoadingMessage('Adding to cart...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const variationData = variations.find(v => v.id === selectedVariation);
      const effectivePrice =
        productData.sale_percentage && productData.sale_percentage > 0
          ? productData.price * (1 - productData.sale_percentage / 100)
          : productData.price;

      const productToAdd = {
        id: productData.id,
        image_url: variationData?.img || productData.image_url,
        description: productData.description,
        price: effectivePrice,
        quantity: quantity,
        variation_id: selectedVariation,
        size: selectedSize,
        shipping_option: selectedShippingOption,
      };

      addToCart(productToAdd);

      setLoadingScenario('success');
      setLoadingMessage('Your item has been added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setLoadingScenario('failure');
      setLoadingMessage('Failed to add product to cart');
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariation || !selectedSize || !selectedShippingOption) {
      window.alert('Please select all options');
      return;
    }

    const variationData = variations.find(v => v.id === selectedVariation);
    const effectivePrice =
      productData.sale_percentage && productData.sale_percentage > 0
        ? productData.price * (1 - productData.sale_percentage / 100)
        : productData.price;

    const productToBuy = {
      id: productData.id,
      image_url: variationData?.img || productData.image_url,
      description: productData.description,
      price: effectivePrice,
      quantity: quantity,
      variation_id: selectedVariation,
      size: selectedSize,
      shipping_option: selectedShippingOption,
    };

    addToCart(productToBuy);
    navigate('/Payment');
  };

  const handleViewStore = () => {
    if (!storeData?.id) {
      window.alert('Store information not available');
      return;
    }
    navigate(`/StoreDetails?storeId=${storeData.id}&vendorId=${storeData.vendor_id}`);
  };

  const handleContactVendor = () => {
    if (!storeData?.vendor_id) {
      window.alert('Vendor information not available');
      return;
    }
    navigate(`/CustomerMessages?vendorId=${storeData.vendor_id}`);
  };

  const handleCloseLoadingMessage = () => setIsLoadingMessageVisible(false);
  const handleContinueShopping = () => setIsLoadingMessageVisible(false);
  const handleGoToCart = () => {
    setIsLoadingMessageVisible(false);
    navigate('/Cart');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
      window.alert('Failed to log out');
    }
  };

  if (loading) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>Loading product details...</LoadingText>
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ShopHeader
          isConnected={!!profile}
          avatarUrl={profile?.avatar_url || 'https://via.placeholder.com/48'}
          userRole={profile?.role || 'customer'}
          userEmail={profile?.email || 'user@example.com'}
          onLogout={handleLogout}
        />
        <ErrorContainer>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😞</div>
          <ErrorTitle>{error}</ErrorTitle>
          <ErrorMessage>We couldn't load this product. Please try again later.</ErrorMessage>
          <GoBackButton onClick={() => navigate(-1)}>Go Back</GoBackButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ShopHeader
        isConnected={!!profile}
        avatarUrl={profile?.avatar_url || 'https://via.placeholder.com/48'}
        userRole={profile?.role || 'customer'}
        userEmail={profile?.email || 'user@example.com'}
        onLogout={handleLogout}
      />

      <ContentWrapper>
        <MainGrid>
          <LeftColumn>
            <ProductHeader
              productData={productData}
              variations={variations}
              selectedVariationId={selectedVariation}
              profile={profile}
              isVendorView={false}
              isLiked={isLiked}
              onLikePress={handleLikePress}
              onSelectVariation={setSelectedVariation}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            <SpecificationsSection
              variations={variations}
              loading={loading}
              condition={productData.condition}
            />

            <RatingReviewSection
              showAllReviews={showAllReviews}
              onViewAllReviews={handleViewAllReviews}
              productId={productData.id}
            />
          </LeftColumn>

          <RightColumn>
            <ProductDetails productData={productData} />

            <ProductOptions
              variations={variations}
              loading={loading}
              showEmptyView={true}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              isShoes={isShoes}
              quantity={quantity}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />

            <DeliverySection
              productId={productData.id}
              selectedShippingOption={selectedShippingOption}
              onShippingOptionChange={setSelectedShippingOption}
            />

            {storeData && (
              <StoreCard>
                <StoreHeader>
                  <StoreAvatar
                    src={storeData.logo_url}
                    alt="Store"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/72')}
                  />
                  <StoreInfo>
                    <StoreName>@{storeData.name}</StoreName>
                    <StoreStats>
                      <StatItem>
                        <IoStar size={16} color="#FFB800" />
                        4.8
                      </StatItem>
                      <StatItem>•</StatItem>
                      <StatItem>{productsCount} Products</StatItem>
                    </StoreStats>
                  </StoreInfo>
                </StoreHeader>
                <StoreDescription>
                  Trusted seller with verified products. Fast shipping and excellent customer service.
                </StoreDescription>
                <StoreActions>
                  <StoreButton onClick={handleViewStore}>
                    <IoStorefrontOutline size={18} />
                    View Store
                  </StoreButton>
                  <StoreButton primary onClick={handleContactVendor}>
                    <IoCallOutline size={18} />
                    Contact
                  </StoreButton>
                </StoreActions>
              </StoreCard>
            )}
          </RightColumn>
        </MainGrid>

        <SectionDivider />

        <RecommendationsSection>
          <TitleWithAction
            title="Most Popular"
            showClock={false}
            onPress={() => console.log('See All Pressed!')}
          />
          <MostPopular />
        </RecommendationsSection>

        <RecommendationsSection>
          <SectionTitle>
            <SectionLabel>Just For You</SectionLabel>
            <IoStar size={20} color="#00BC7D" />
          </SectionTitle>
          <ItemsList grid={true} limit={6} onPress={handleProductPress} />
        </RecommendationsSection>
      </ContentWrapper>

      <LoadingMessage
        visible={isLoadingMessageVisible}
        scenario={loadingScenario}
        successType="default"
        message={loadingMessage}
        duration={1000}
        onClose={handleCloseLoadingMessage}
        onTryAgain={handleContinueShopping}
        onChange={handleGoToCart}
      />
    </PageContainer>
  );
};

export default ProductsView;