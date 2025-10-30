import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ProfileHeader from '../../components/ProfileHeader';
import { IoCheckmarkCircle, IoStar, IoStarOutline, IoClose } from 'react-icons/io5';
import RoundShapeList from '../../components/RoundShapeList';

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
  background: white;
  border: 2px solid #00BC7D;
  color: #00BC7D;

  &:hover {
    background: #f0fdf8;
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

// Review Section Styles
const ReviewSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
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

const ReviewSectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 12px 0;
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
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ReviewItemImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 5px;
  object-fit: cover;
  margin-right: 12px;

  @media (max-width: 768px) {
    width: 100%;
    height: 120px;
    margin-right: 0;
    margin-bottom: 8px;
  }
`;

const ReviewItemDetails = styled.div`
  flex: 1;
`;

const ReviewItemDescription = styled.p`
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 4px 0;
`;

const ReviewItemDate = styled.span`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #666;
`;

const SmallReviewButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  background: white;
  border: 2px solid #00BC7D;
  color: #00BC7D;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;

  &:hover {
    background: #f0fdf8;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 8px;
    width: 100%;
  }
`;

// Review Form Styles
const ReviewForm = styled.div`
  margin-top: 12px;
  padding: 16px;
  background: #f8faff;
  border-radius: 8px;
  animation: slideDown 0.3s ease;
`;

const ReviewFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ReviewFormTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  transition: color 0.2s ease;

  &:hover {
    color: #202020;
  }
`;

const ReviewFormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
`;

const ProfileImageWrapper = styled.div`
  width: 50px;
  height: 50px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductDescription = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 4px 0;
`;

const OrderNumberText = styled.p`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0;
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;

const RatingLabel = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin-right: 8px;
`;

const StarButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const CommentInput = styled.textarea`
  background: white;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  height: 100px;
  width: 100%;
  border: 1px solid #e0e0e0;
  resize: none;
  outline: none;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border-color: #00BC7D;
  }
`;

const SubmitButton = styled.button`
  background: #00BC7D;
  border-radius: 8px;
  padding: 12px 24px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const SuccessMessage = styled.div`
  padding: 12px;
  background: #d0fae5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  animation: slideDown 0.3s ease;
`;

const SuccessText = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
  font-weight: 600;
`;

const Orders = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reviewingItemIndex, setReviewingItemIndex] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState(new Set());

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
        .in('delivery_status', ['processing', 'shipped', 'delivered'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filteredOrders = data.filter(order => 
        ['processing', 'shipped', 'delivered'].includes(order.delivery_status)
      );
      
      setOrders(filteredOrders);
      console.log('Orders fetched:', filteredOrders);
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
            <IoStar size={24} color="#FFD700" />
          ) : (
            <IoStarOutline size={24} color="#FFD700" />
          )}
        </StarButton>
      );
    }
    return stars;
  };

  const handleSubmitReview = async (item, order) => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    const username = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Anonymous';

    let productId;
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('description', item?.description)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        alert(`Failed to identify product: ${productError.message}`);
        return;
      }

      if (!product) {
        alert('Product not found');
        return;
      }

      productId = product.id;
    } catch (err) {
      console.error('Unexpected error fetching product:', err);
      alert('Unexpected error identifying product');
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
        alert(`Failed to submit review: ${error.message}`);
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
      alert('Unexpected error submitting review');
    }
  };

  const renderOrderItem = (item) => {
    const isDelivered = item.delivery_status === 'delivered';
    const isExpanded = expandedOrderId === item.id;

    const images = item.items.slice(0, 4).map(
      product => product.image_url || 'https://via.placeholder.com/50'
    );
    const itemCount = item.items.length;

    let shippingOptionName = 'Unknown';
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
      if (!createdAt) return 'Not Available';
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
                <SingleImage src={images[0]} alt="Product" />
              </ImageContainer>
            ) : itemCount === 2 ? (
              <ImageContainer>
                <TwoImagesHorizontal>
                  <HorizontalImage src={images[0]} alt="Product 1" />
                  <HorizontalImage src={images[1]} alt="Product 2" />
                </TwoImagesHorizontal>
              </ImageContainer>
            ) : itemCount === 3 ? (
              <ImageContainer>
                <ThreeImagesLayout>
                  <TopRow>
                    <TopImage src={images[0]} alt="Product 1" />
                    <TopImage src={images[1]} alt="Product 2" />
                  </TopRow>
                  <BottomImage src={images[2]} alt="Product 3" />
                </ThreeImagesLayout>
              </ImageContainer>
            ) : (
              <ImageContainer>
                <FourImagesGrid>
                  <GridImage src={images[0]} alt="Product 1" />
                  <GridImage src={images[1]} alt="Product 2" />
                  <GridImage src={images[2]} alt="Product 3" />
                  <GridImage src={images[3]} alt="Product 4" />
                </FourImagesGrid>
              </ImageContainer>
            )}
          </ImagesContainer>

          <DetailsContainer>
            <OrderHeaderRow>
              <OrderId>Order #{item.id}</OrderId>
              <ItemsCountContainer>
                <ItemsCount>{item.items.length} items</ItemsCount>
              </ItemsCountContainer>
            </OrderHeaderRow>

            <ShippingOption>{shippingOptionName} Delivery</ShippingOption>

            <StatusAndButtonRow>
              <StatusContainer>
                <StatusText $delivered={isDelivered}>
                  {item.delivery_status}
                </StatusText>
                {isDelivered && <CheckmarkIcon />}
              </StatusContainer>

              {isDelivered && (
                <ReviewButton onClick={(e) => {
                  e.stopPropagation();
                  handleReviewClick(item.id);
                }}>
                  {isExpanded ? 'Close' : 'Review'}
                </ReviewButton>
              )}
            </StatusAndButtonRow>
          </DetailsContainer>
        </OrderHeader>

        {isExpanded && isDelivered && (
          <ReviewSection>
            <ReviewSectionTitle>Select an item to review</ReviewSectionTitle>
            <ReviewItemsList>
              {item.items.map((reviewItem, index) => {
                const reviewKey = `${item.id}-${index}`;
                const isReviewed = submittedReviews.has(reviewKey);
                
                return (
                  <div key={index}>
                    <ReviewItemCard onClick={() => !isReviewed && handleReviewItemClick(index)}>
                      <ReviewItemImage 
                        src={reviewItem.image_url || 'https://via.placeholder.com/60'} 
                        alt={reviewItem.description}
                      />
                      <ReviewItemDetails>
                        <ReviewItemDescription>
                          {reviewItem.description || 'Unnamed Item'}
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
                          Write Review
                        </SmallReviewButton>
                      )}
                      {isReviewed && (
                        <SuccessText>✓ Reviewed</SuccessText>
                      )}
                    </ReviewItemCard>

                    {reviewingItemIndex === index && !isReviewed && (
                      <ReviewForm>
                        <ReviewFormHeader>
                          <ReviewFormTitle>Write Your Review</ReviewFormTitle>
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
                                {reviewItem.description || 'Unnamed Item'}
                              </ProductDescription>
                              <OrderNumberText>
                                Order #{item.order_number || item.id}
                              </OrderNumberText>
                            </ProductInfo>
                          </ProfileSection>
                          <RatingContainer>
                            <RatingLabel>Rating:</RatingLabel>
                            {renderStars()}
                          </RatingContainer>
                          <CommentInput
                            placeholder="Share your experience with this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <SubmitButton onClick={() => handleSubmitReview(reviewItem, item)}>
                            Submit Review
                          </SubmitButton>
                        </ReviewFormContent>
                        {submittedReviews.has(reviewKey) && (
                          <SuccessMessage>
                            <IoCheckmarkCircle size={20} color="#00BC7D" />
                            <SuccessText>Thank you for your review!</SuccessText>
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
      <HeaderText>To Receive</HeaderText>
      <HeaderText2>My Orders</HeaderText2>
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
            <NoItemsText>No pending orders found</NoItemsText>
          ) : (
            orders.map(renderOrderItem)
          )}
        </OrdersList>
      </Container>
    </PageContainer>
  );
};

export default Orders;