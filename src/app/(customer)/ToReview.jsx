import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ProfileHeader from '../../components/ProfileHeader';
import { useTranslation } from 'react-i18next';
import { IoCheckmarkCircle, IoStar, IoStarOutline, IoClose, IoSparkles } from 'react-icons/io5';
import RoundShapeList from '../../components/RoundShapeList';

const INPOST_API_TOKEN = 'YOUR_NEW_TOKEN';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const Container = styled.div`
  padding: 80px 16px 20px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding-top: 100px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const HeaderText = styled.h1`
  font-size: 21px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  line-height: 30px;
  margin: 0;
`;

const HeaderText2 = styled.h2`
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  line-height: 18px;
  margin: 0;
`;

const OrdersList = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderItem = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #00BC7D;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ImagesContainer = styled.div`
  width: 100px;
  height: 100px;
  margin-right: 12px;
  @media (max-width: 768px) {
    width: 100%;
    height: 150px;
    margin-right: 0;
    margin-bottom: 12px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 9px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const SingleImage = styled.img`
  width: 92px;
  height: 92px;
  border-radius: 5px;
  object-fit: cover;
`;

const TwoImagesHorizontal = styled.div`
  display: flex;
  flex-direction: row;
  width: 92px;
  height: 92px;
  gap: 1px;
`;

const HorizontalImage = styled.img`
  width: 48%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
`;

const ThreeImagesLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 92px;
  height: 92px;
  gap: 1px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  height: 48%;
  width: 100%;
  gap: 1px;
`;

const TopImage = styled.img`
  width: 48%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
`;

const BottomImage = styled.img`
  width: 100%;
  height: 48%;
  border-radius: 5px;
  object-fit: cover;
`;

const FourImagesGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 92px;
  height: 92px;
  gap: 1px;
`;

const GridImage = styled.img`
  width: calc(50% - 0.5px);
  height: calc(50% - 0.5px);
  border-radius: 5px;
  object-fit: cover;
`;

const DetailsContainer = styled.div`
  flex: 1;
  margin-left: 8px;
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const OrderHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
`;

const OrderId = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: -0.14px;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin-right: 8px;
`;

const ItemsCountContainer = styled.div`
  width: 61px;
  height: 22px;
  background-color: #F9F9F9;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ItemsCount = styled.span`
  font-size: 13px;
  font-weight: 500;
  line-height: 17px;
  letter-spacing: -0.13px;
  font-family: 'Raleway', sans-serif;
  color: #000000;
`;

const ShippingOption = styled.p`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 4px 0;
`;

const StatusAndButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

const StatusText = styled.span`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: -0.18px;
  font-family: 'Raleway', sans-serif;
  color: ${props => props.$delivered ? '#000' : '#202020'};
`;

const CheckmarkIcon = styled(IoCheckmarkCircle)`
  font-size: 20px;
  color: #00BC7D;
`;

const ActionButton = styled.button`
  width: 100px;
  height: 30px;
  border-radius: 9px;
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.16px;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #00BC7D;
  color: #FFFFFF;
  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const ReviewButton = styled(ActionButton)`
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  box-shadow: 0 2px 8px rgba(0, 188, 125, 0.3);
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.4);
  }
`;

const NoItemsText = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
  text-align: center;
  padding: 20px 0;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: white;
`;

const Loader = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #D0FAE5;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Enhanced Review Section Styles
const ReviewSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #F0FDF9 0%, #E6FCF5 100%);
  border-radius: 12px;
  border: 2px solid #D0FAE5;
  animation: slideDown 0.3s ease;
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ReviewSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const SparkleIcon = styled(IoSparkles)`
  font-size: 24px;
  color: #00BC7D;
`;

const ReviewSectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
`;

const ReviewItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReviewItemCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  &:hover {
    border-color: #00BC7D;
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.15);
    transform: translateY(-2px);
  }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ReviewItemImage = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 16px;
  border: 2px solid #E6FCF5;
  @media (max-width: 768px) {
    width: 100%;
    height: 140px;
    margin-right: 0;
    margin-bottom: 12px;
  }
`;

const ReviewItemDetails = styled.div`
  flex: 1;
`;

const ReviewItemDescription = styled.p`
  font-size: 15px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 6px 0;
`;

const ReviewItemDate = styled.span`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #666;
`;

const SmallReviewButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 12px;
  box-shadow: 0 2px 6px rgba(0, 188, 125, 0.3);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.4);
  }
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 12px;
    width: 100%;
  }
`;

const ReviewedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #D0FAE5;
  border-radius: 20px;
  margin-left: 12px;
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 12px;
  }
`;

const ReviewedText = styled.span`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
`;

const ReviewForm = styled.div`
  margin-top: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid #00BC7D;
  animation: slideDown 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 188, 125, 0.1);
`;

const ReviewFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #F0FDF9;
`;

const ReviewFormTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  transition: all 0.2s ease;
  border-radius: 50%;
  &:hover {
    color: #FF0000;
    background: #FFE6E6;
  }
`;

const ReviewFormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #F9F9F9;
  border-radius: 8px;
`;

const ProfileImageWrapper = styled.div`
  width: 50px;
  height: 50px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductDescription = styled.p`
  font-size: 15px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 4px 0;
`;

const OrderNumberText = styled.p`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  padding: 12px;
  background: #FFF9E6;
  border-radius: 8px;
  border: 2px solid #FFE6A0;
`;

const RatingLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin-right: 8px;
`;

const StarButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
  border-radius: 50%;
  &:hover {
    transform: scale(1.2);
    background: rgba(255, 215, 0, 0.1);
  }
  &:active {
    transform: scale(1);
  }
`;

const CommentInput = styled.textarea`
  background: white;
  border-radius: 8px;
  padding: 16px;
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  height: 120px;
  width: 100%;
  border: 2px solid #E6FCF5;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  &::placeholder {
    color: #999;
  }
  &:focus {
    border-color: #00BC7D;
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  border-radius: 10px;
  padding: 14px 28px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
`;

const SuccessMessage = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, #D0FAE5 0%, #B8F5D8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  animation: slideDown 0.3s ease;
  border: 2px solid #00BC7D;
`;

const SuccessText = styled.p`
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
  font-weight: 700;
`;

const ToReview = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reviewingItemIndex, setReviewingItemIndex] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState(new Set());

  const fetchTrackingStatus = async (trackingNumber) => {
    try {
      const response = await fetch(
        `https://stage-api-shipx-it.easypack24.net/v1/tracking/${trackingNumber}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${INPOST_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (response.ok)
        return { status: data.status, tracking_details: data.tracking_details };
      console.error('Tracking Error:', data);
      return null;
    } catch (error) {
      console.error('Network Error:', error);
      return null;
    }
  };

  const fetchOrders = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .eq('delivery_status', 'delivered')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch existing reviews to mark already reviewed items
      const orderIds = data.map(o => o.id);
      let existingReviews = [];
      if (orderIds.length > 0) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('order_id, product_id')
          .in('order_id', orderIds);
        existingReviews = reviewsData || [];
      }

      // Mark items with existing reviews
      const updatedOrders = await Promise.all(
        data.map(async (order) => {
          order.items.forEach((item) => {
            item.has_review = existingReviews.some(
              r => r.order_id === order.id && r.product_id === item.id
            );
          });

          if (order.tracking_number && order.delivery_status === 'shipped') {
            const trackingData = await fetchTrackingStatus(order.tracking_number);
            if (trackingData) {
              const newStatus = trackingData.status === 'delivered' ? 'delivered' : 'shipped';
              if (order.delivery_status !== newStatus) {
                await supabase
                  .from('orders')
                  .update({ delivery_status: newStatus })
                  .eq('id', order.id);
                order.delivery_status = newStatus;
              }
            }
          }
          return order;
        })
      );

      // Pre-populate submittedReviews with existing reviews
      const initialReviewed = new Set();
      updatedOrders.forEach((order) => {
        order.items.forEach((item, idx) => {
          if (item.has_review) {
            initialReviewed.add(`${order.id}-${idx}`);
          }
        });
      });
      setSubmittedReviews(initialReviewed);

      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile?.id) return;
    let pollInterval = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && profile?.id) {
        console.log('Page is visible, starting polling...');
        fetchOrders();
        pollInterval = setInterval(() => {
          console.log('Polling for order updates...');
          fetchOrders();
        }, 30000);
      } else {
        console.log('Page is hidden, stopping polling...');
        if (pollInterval) clearInterval(pollInterval);
      }
    };
    fetchOrders();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (document.visibilityState === 'visible') {
      pollInterval = setInterval(() => {
        console.log('Polling for order updates...');
        fetchOrders();
      }, 30000);
    }
    return () => {
      console.log('Clearing polling interval and visibility listener');
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profile?.id]);

  const handleReviewClick = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setReviewingItemIndex(null);
      setRating(0);
      setComment('');
    } else {
      setExpandedOrderId(orderId);
      setReviewingItemIndex(null);
    }
  };

  const handleReviewItemClick = (index) => {
    setReviewingItemIndex(index);
    setRating(0);
    setComment('');
  };

  const handleCloseReviewForm = () => {
    setReviewingItemIndex(null);
    setRating(0);
    setComment('');
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarButton key={i} onClick={() => setRating(i)}>
          {i <= rating ? (
            <IoStar size={28} color="#FFD700" />
          ) : (
            <IoStarOutline size={28} color="#FFD700" />
          )}
        </StarButton>
      );
    }
    return stars;
  };

  const handleSubmitReview = async (item, order) => {
    if (rating === 0) {
      alert(t('PleaseSelectRating'));
      return;
    }
    if (!comment.trim()) {
      alert(t('PleaseEnterComment'));
      return;
    }
    const username = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : t('Anonymous');
    const productId = item?.id;
    if (!productId) {
      alert(t('ProductIdNotFound'));
      console.error('Item data:', item);
      return;
    }
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single();
      if (productError || !product) {
        console.error('Error verifying product:', productError);
        alert(t('ProductNotFoundInDatabase'));
        return;
      }
    } catch (err) {
      console.error('Error verifying product:', err);
      alert(t('ErrorVerifyingProduct'));
      return;
    }
    const reviewData = {
      username,
      rating,
      comment,
      order_id: order?.id,
      product_id: productId,
      profile_image: profile?.avatar_url || null,
    };
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([reviewData]);
      if (error) {
        console.error('Error saving review:', error);
        alert(`${t('FailedToSubmitReview')}: ${error.message}`);
        return;
      }
      console.log('Submitted Review:', reviewData);
      setSubmittedReviews(prev => new Set([...prev, `${order.id}-${reviewingItemIndex}`]));

      setTimeout(() => {
        setReviewingItemIndex(null);
        setRating(0);
        setComment('');
      }, 2000);
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(t('UnexpectedErrorSubmittingReview'));
    }
  };

  const renderOrderItem = (item) => {
    const isDelivered = item.delivery_status === 'delivered';
    const isExpanded = expandedOrderId === item.id;
    const images = item.items.slice(0, 4).map(
      product => product.image_url || 'https://via.placeholder.com/50'
    );
    const itemCount = item.items.length;
    let shippingOptionName = t('Unknown');
    let shippingOption = item.shipping_option;
    if (typeof shippingOption === 'string') {
      try {
        shippingOption = JSON.parse(shippingOption);
      } catch (error) {
        console.warn(
          `Failed to parse shipping_option for order ${item.id}:`,
          shippingOption,
          error
        );
        shippingOption = null;
      }
    }
    if (
      shippingOption &&
      typeof shippingOption === 'object' &&
      shippingOption.name
    ) {
      shippingOptionName = shippingOption.name;
    }
    const formattedDate = (createdAt) => {
      if (!createdAt) return t('NotAvailable');
      return new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }).replace(' ', ', ');
    };
    return (
      <OrderItem key={item.id}>
        <OrderHeader
          onClick={() =>
            navigate(
              `/CustomerOrderDetails?order=${encodeURIComponent(JSON.stringify(item))}`
            )
          }
        >
          <ImagesContainer>
            {itemCount === 1 ? (
              <ImageContainer>
                <SingleImage src={images[0]} alt={t('Product')} />
              </ImageContainer>
            ) : itemCount === 2 ? (
              <ImageContainer>
                <TwoImagesHorizontal>
                  <HorizontalImage src={images[0]} alt={t('Product') + ' 1'} />
                  <HorizontalImage src={images[1]} alt={t('Product') + ' 2'} />
                </TwoImagesHorizontal>
              </ImageContainer>
            ) : itemCount === 3 ? (
              <ImageContainer>
                <ThreeImagesLayout>
                  <TopRow>
                    <TopImage src={images[0]} alt={t('Product') + ' 1'} />
                    <TopImage src={images[1]} alt={t('Product') + ' 2'} />
                  </TopRow>
                  <BottomImage src={images[2]} alt={t('Product') + ' 3'} />
                </ThreeImagesLayout>
              </ImageContainer>
            ) : (
              <ImageContainer>
                <FourImagesGrid>
                  <GridImage src={images[0]} alt={t('Product') + ' 1'} />
                  <GridImage src={images[1]} alt={t('Product') + ' 2'} />
                  <GridImage src={images[2]} alt={t('Product') + ' 3'} />
                  <GridImage src={images[3]} alt={t('Product') + ' 4'} />
                </FourImagesGrid>
              </ImageContainer>
            )}
          </ImagesContainer>
          <DetailsContainer>
            <OrderHeaderRow>
              <OrderId>{t('Order')} #{item.id}</OrderId>
              <ItemsCountContainer>
                <ItemsCount>{item.items.length} {t('items')}</ItemsCount>
              </ItemsCountContainer>
            </OrderHeaderRow>
            <ShippingOption>{shippingOptionName} {t('Delivery')}</ShippingOption>
            <StatusAndButtonRow>
              <StatusContainer>
                <StatusText $delivered={isDelivered}>
                  {t('Delivered')}
                </StatusText>
                {isDelivered && <CheckmarkIcon />}
              </StatusContainer>
              {isDelivered && (
                <ReviewButton onClick={(e) => {
                  e.stopPropagation();
                  handleReviewClick(item.id);
                }}>
                  {isExpanded ? t('Close') : t('Review')}
                </ReviewButton>
              )}
            </StatusAndButtonRow>
          </DetailsContainer>
        </OrderHeader>
        {isExpanded && isDelivered && (
          <ReviewSection>
            <ReviewSectionHeader>
              <SparkleIcon />
              <ReviewSectionTitle>{t('SelectItemToReview')}</ReviewSectionTitle>
            </ReviewSectionHeader>
            <ReviewItemsList>
              {item.items.map((reviewItem, index) => {
                const reviewKey = `${item.id}-${index}`;
                const isReviewed = submittedReviews.has(reviewKey) || reviewItem.has_review;

                return (
                  <div key={index}>
                    <ReviewItemCard onClick={() => !isReviewed && handleReviewItemClick(index)}>
                      <ReviewItemImage
                        src={reviewItem.image_url || 'https://via.placeholder.com/60'}
                        alt={reviewItem.description}
                      />
                      <ReviewItemDetails>
                        <ReviewItemDescription>
                          {reviewItem.description || t('UnnamedItem')}
                        </ReviewItemDescription>
                        <ReviewItemDate>
                          {formattedDate(item.created_at)}
                        </ReviewItemDate>
                      </ReviewItemDetails>
                      {!isReviewed && (
                        <SmallReviewButton onClick={(e) => {
                          e.stopPropagation();
                          handleReviewItemClick(index);
                        }}>
                          {t('YourComment')}
                        </SmallReviewButton>
                      )}
                      {isReviewed && (
                        <ReviewedBadge>
                          <IoCheckmarkCircle size={18} color="#00BC7D" />
                          <ReviewedText>{t('Reviewed')}</ReviewedText>
                        </ReviewedBadge>
                      )}
                    </ReviewItemCard>
                    {reviewingItemIndex === index && !isReviewed && (
                      <ReviewForm>
                        <ReviewFormHeader>
                          <ReviewFormTitle>
                            <IoSparkles size={20} />
                            {t('WriteYourReview')}
                          </ReviewFormTitle>
                          <CloseButton onClick={handleCloseReviewForm}>
                            <IoClose size={24} />
                          </CloseButton>
                        </ReviewFormHeader>
                        <ReviewFormContent>
                          <ProfileSection>
                            <ProfileImageWrapper>
                              <RoundShapeList
                                imageSource={profile?.avatar_url || 'https://via.placeholder.com/50'}
                                selectable={false}
                              />
                            </ProfileImageWrapper>
                            <ProductInfo>
                              <ProductDescription>
                                {reviewItem.description || t('UnnamedItem')}
                              </ProductDescription>
                              <OrderNumberText>
                                {t('Order')} #{item.order_number || item.id}
                              </OrderNumberText>
                            </ProductInfo>
                          </ProfileSection>
                          <RatingContainer>
                            <RatingLabel>{t('Rating')}:</RatingLabel>
                            {renderStars()}
                          </RatingContainer>
                          <CommentInput
                            placeholder={t('ShareYourExperience')}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <SubmitButton onClick={() => handleSubmitReview(reviewItem, item)}>
                            {t('SubmitReview')}
                          </SubmitButton>
                        </ReviewFormContent>
                        {submittedReviews.has(reviewKey) && (
                          <SuccessMessage>
                            <IoCheckmarkCircle size={24} color="#00BC7D" />
                            <SuccessText>{t('ThankYouForReview')}</SuccessText>
                          </SuccessMessage>
                        )}
                      </ReviewForm>
                    )}
                  </div>
                );
              })}
            </ReviewItemsList>
          </ReviewSection>
        )}
      </OrderItem>
    );
  };

  const headerContent = (
    <HeaderContent>
      <HeaderText>{t('ToReview')}</HeaderText>
      <HeaderText2>{t('MyOrders')}</HeaderText2>
    </HeaderContent>
  );

  if (loading) {
    return (
      <LoaderContainer>
        <Loader />
      </LoaderContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileHeader profile={profile} customContent={headerContent} />
      <Container>
        <OrdersList>
          {orders.length === 0 ? (
            <NoItemsText>{t('NoOrdersFound')}</NoItemsText>
          ) : (
            orders.map(renderOrderItem)
          )}
        </OrdersList>
      </Container>
    </PageContainer>
  );
};

export default ToReview;