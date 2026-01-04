import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';
import { IoStar, IoStorefrontOutline, IoCallOutline, IoClose, IoLogIn, IoPersonAdd } from 'react-icons/io5';
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
// Add these after your existing styled components (around line 200)

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  position: relative;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e8eaed;
    transform: rotate(90deg);
  }
`;

const ModalIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D0FAE5 0%, #B8F5D8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  
  svg {
    font-size: 40px;
    color: #00BC7D;
  }
`;

const ModalTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  text-align: center;
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ModalMessage = styled.p`
  font-size: 16px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  text-align: center;
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const ModalButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AuthButton = styled.button`
  padding: 16px 24px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  
  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, #00BC7D 0%, #00A66A 100%)' 
    : 'white'};
  color: ${props => props.$primary ? 'white' : '#1a1a2e'};
  border: ${props => props.$primary ? 'none' : '2px solid #e8eaed'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$primary 
      ? '0 8px 24px rgba(0, 188, 125, 0.4)' 
      : '0 8px 24px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.$primary ? 'transparent' : '#00BC7D'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 20px;
  }
`;

const CancelButton = styled.button`
  padding: 12px;
  background: transparent;
  border: none;
  color: #5f6368;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #1a1a2e;
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
  const { productId } = useParams();
  const product = searchParams.get('product');
  const { profile } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, toggleCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
const [showAuthModal, setShowAuthModal] = useState(false);
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
  const [productDetails, setProductDetails] = useState(null);
  const [productData, setProductData] = useState({});

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    if (product && !productId) {
      try {
        const parsed = JSON.parse(decodeURIComponent(product));
        setProductData(parsed);
        if (parsed.id) {
          window.history.replaceState(null, '', `/customer/product/${parsed.id}`);
        }
      } catch (err) {
        console.error('Error parsing product data:', err);
      }
    }
  }, [product, productId]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      let idToUse = productId || productData?.id;

      if (!idToUse && product) {
        try {
          const parsed = JSON.parse(decodeURIComponent(product));
          idToUse = parsed.id;
          setProductData(parsed);
        } catch (err) {
          console.error('Error parsing product query param:', err);
        }
      }

      if (!idToUse) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (productId && !productData.id) {
          const { data: fullProduct, error: fullProductError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

          if (fullProductError) throw fullProductError;
          if (!fullProduct) {
            setError('Product not found');
            setLoading(false);
            return;
          }
          setProductData(fullProduct);
        }

        const { data: fetchedDetails, error: productError } = await supabase
          .from('products')
          .select('id, category_id, vendor_id, weight, condition')
          .eq('id', idToUse)
          .maybeSingle();

        if (productError) throw productError;
        if (!fetchedDetails) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        setProductDetails(fetchedDetails);
        setIsShoes(fetchedDetails.category_id === 2);

        const { data: variationsData, error: variationsError } = await supabase
          .from('product_variations')
          .select('*')
          .eq('product_id', idToUse)
          .limit(5);

        if (variationsError) {
          setVariations([]);
        } else {
          const shoeSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
          const filteredVariations = isShoes
            ? variationsData.filter(v => shoeSizes.includes(v.size) || !v.size)
            : variationsData;

          setVariations(filteredVariations || []);

          if (filteredVariations?.length > 0) {
            setSelectedVariation(filteredVariations[0].id);
            const defaultSize = isShoes ? '8' : 'M';
            setSelectedSize(defaultSize);
          }
        }

        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, name, logo_url, vendor_id')
          .eq('vendor_id', fetchedDetails.vendor_id)
          .maybeSingle();

        const { count, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', fetchedDetails.vendor_id);

        setStoreData(store ? {
          id: store.id,
          name: store.name,
          logo_url: store.logo_url || 'https://via.placeholder.com/72',
          vendor_id: store.vendor_id,
        } : null);
        setProductsCount(count || 0);
      } catch (error) {
        console.error('Error fetching product details:', error.message);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId || productData?.id || product) {
      fetchProductDetails();
    }
  }, [productId, productData?.id, product, isShoes]);

  useEffect(() => {
    const checkIfLikedAndTrackView = async () => {
      const idToUse = productId || productData?.id;
      if (!profile?.id || !idToUse) return;

      try {
        const { data: likeData } = await supabase
          .from('product_likes')
          .select('id')
          .eq('product_id', idToUse)
          .eq('user_id', profile.id)
          .maybeSingle();

        setIsLiked(!!likeData);

        const { data: viewData } = await supabase
          .from('product_views')
          .select('id')
          .eq('product_id', idToUse)
          .eq('user_id', profile.id)
          .maybeSingle();

        if (!viewData) {
          await supabase.from('product_views').insert([{ product_id: idToUse, user_id: profile.id }]);

          const currentViewCount = productData.views_count || 0;
          await supabase
            .from('products')
            .update({ views_count: currentViewCount + 1 })
            .eq('id', idToUse);
        }
      } catch (error) {
        console.error('Error in checkIfLikedAndTrackView:', error.message);
      }
    };

    checkIfLikedAndTrackView();
  }, [productData.id, productId, profile?.id]);

  const handleLikePress = async () => {
    if (!profile?.id) {
      window.alert('Please log in to like products');
      return;
    }
    const idToUse = productId || productData?.id;
    const productToLike = {
      id: idToUse,
      image_url: productData.image_url,
      description: productData.description || 'No description available',
      price: productData.price,
      sale_percentage: productData.sale_percentage || null,
    };

    if (isLiked) {
      await removeFromWishlist(idToUse);
      setIsLiked(false);
    } else {
      const success = await addToWishlist(productToLike);
      if (success) setIsLiked(true);
    }
  };

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

 const handleAddToCart = async () => {
  // Check authentication first
  if (!profile?.id) {
    setShowAuthModal(true);
    return;
  }

  const missing = [];
  if (!selectedVariation) missing.push('Variation');
  if (!selectedSize) missing.push('Size');
  if (!selectedShippingOption) missing.push('Shipping Option');
  
  if (missing.length > 0) {
    window.alert(`Please select: ${missing.join(', ')}`);
    return;
  }
  
  setIsLoadingMessageVisible(true);
  setLoadingScenario('loading');
  setLoadingMessage(t('AddingToCart'));
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const variationData = variations.find(v => v.id === selectedVariation);
    const effectivePrice = productData.sale_percentage && productData.sale_percentage > 0
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
    setLoadingMessage(t('ProductAddedToCartSuccessfully'));
  } catch (error) {
    setLoadingScenario('failure');
    setLoadingMessage(t('FailedToAddProductToCart'));
  }
};

  const handleBuyNow = () => {
  // Check authentication first
  if (!profile?.id) {
    setShowAuthModal(true);
    return;
  }

  if (!selectedVariation || !selectedSize || !selectedShippingOption) {
    const missing = [];
    if (!selectedVariation) missing.push('Variation');
    if (!selectedSize) missing.push('Size');
    if (!selectedShippingOption) missing.push('Shipping Option');
    window.alert(`Please select: ${missing.join(', ')}`);
    return;
  }
  
  const variationData = variations.find(v => v.id === selectedVariation);
  const effectivePrice = productData.sale_percentage && productData.sale_percentage > 0
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
  console.log('View Store clicked, storeData:', storeData);
  
  if (!storeData?.vendor_id) {
    window.alert('Store information not available');
    return;
  }
  
  console.log('Navigating to vendor_id:', storeData.vendor_id);
  navigate(`/store/${storeData.vendor_id}`);
};

  const handleContactVendor = () => {
    if (!productDetails?.vendor_id) {
      window.alert('Vendor information not available');
      return;
    }
    navigate(`/customer/CustomerMessages?vendorId=${productDetails.vendor_id}`);
  };

  const handleProductPress = (product) => {
    navigate(`/customer/product/${product.id}`);
  };

  const handleCloseLoadingMessage = () => setIsLoadingMessageVisible(false);
  const handleContinueShopping = () => setIsLoadingMessageVisible(false);
  const handleGoToCart = () => {
    setIsLoadingMessageVisible(false);
    toggleCart();
  };

  if (loading) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>{t('Loading')}</LoadingText>
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
          <ErrorMessage>{t('CouldNotLoadProduct')}</ErrorMessage>
          <GoBackButton onClick={() => navigate(-1)}>{t('GoBack')}</GoBackButton>
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
              onViewAllReviews={() => setShowAllReviews(true)}
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
                <StoreDescription>{t('TrustedSellerDescription')}</StoreDescription>
                <StoreActions>
                  <StoreButton onClick={handleViewStore}>
                    <IoStorefrontOutline size={18} />
                    {t('ViewStore')}
                  </StoreButton>
                  <StoreButton primary onClick={handleContactVendor}>
                    <IoCallOutline size={18} />
                    {t('ContactSeller')}
                  </StoreButton>
                </StoreActions>
              </StoreCard>
            )}
          </RightColumn>
        </MainGrid>
        <SectionDivider />
        <RecommendationsSection>
          <TitleWithAction
            title={t('MostPopular')}
            showClock={false}
            onPress={() => console.log('See All Pressed!')}
          />
          <MostPopular />
        </RecommendationsSection>
        <RecommendationsSection>
          <SectionTitle>
            <SectionLabel>{t('JustForYou')}</SectionLabel>
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

      {showAuthModal && (
        <ModalOverlay onClick={() => setShowAuthModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowAuthModal(false)}>
              <IoClose size={20} />
            </CloseButton>
            
            <ModalIcon>
              <IoLogIn />
            </ModalIcon>
            
            <ModalTitle>Authentication Required</ModalTitle>
            <ModalMessage>Please log in or create an account to continue</ModalMessage>
            
            <ModalButtonsContainer>
              <AuthButton $primary onClick={() => {
                setShowAuthModal(false);
                navigate('/auth/login');
              }}>
                <IoLogIn />
                Login
              </AuthButton>
              
              <AuthButton onClick={() => {
                setShowAuthModal(false);
                navigate('/auth/signup');
              }}>
                <IoPersonAdd />
                Create Account
              </AuthButton>
              
              <CancelButton onClick={() => setShowAuthModal(false)}>
                Cancel
              </CancelButton>
            </ModalButtonsContainer>
          </ModalContent>
        </ModalOverlay>
      )}

    </PageContainer>
  );
  
};

export default ProductsView;