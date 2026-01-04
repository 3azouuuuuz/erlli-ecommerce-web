import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';
import { IoStar, IoStarOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const RatingReviewContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
  }
`;

const SectionTitle = styled.h3`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #1a1a2e;
  margin: 0 0 28px 0;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 24px;
  }
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const RatingSummary = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 28px;
  border-radius: 16px;
  border: 1px solid #e8eaed;
`;

const OverallRating = styled.div`
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
`;

const RatingScore = styled.div`
  font-size: 56px;
  font-weight: 900;
  color: #00BC7D;
  font-family: 'Raleway', sans-serif;
  margin-bottom: 12px;
  letter-spacing: -2px;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const RatingStars = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 12px;
`;

const Star = styled(IoStar)`
  color: #FFB800;
  width: 24px;
  height: 24px;
`;

const TotalReviews = styled.div`
  font-size: 15px;
  color: #5f6368;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
`;

const RatingDistribution = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DistributionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StarLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  min-width: 16px;
  font-family: 'Raleway', sans-serif;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #00BC7D 0%, #00A66A 100%);
  border-radius: 4px;
  transition: width 0.4s ease;
`;

const CountLabel = styled.span`
  font-size: 13px;
  color: #5f6368;
  min-width: 24px;
  text-align: right;
  font-weight: 600;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReviewCard = styled.div`
  padding: 20px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e8eaed;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: #00BC7D;
  }

  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`;

const ReviewAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  font-size: 18px;
  font-family: 'Raleway', sans-serif;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

const ReviewContent = styled.div`
  flex: 1;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const ReviewerName = styled.span`
  font-weight: 700;
  color: #1a1a2e;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  letter-spacing: -0.2px;
`;

const ReviewStars = styled.div`
  display: flex;
  gap: 2px;
`;

const ReviewText = styled.p`
  font-size: 15px;
  color: #5f6368;
  line-height: 1.6;
  margin: 0;
  font-family: 'Raleway', sans-serif;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 18px 24px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  letter-spacing: 0.3px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 188, 125, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    font-size: 15px;
    padding: 16px 20px;
  }
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f0f2f5;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 40px auto;
  display: block;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin: 32px auto;
  }
`;

const NoReviewsText = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  text-align: center;
  margin: 40px 0;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 15px;
    margin: 32px 0;
  }
`;

const RatingReviewSection = ({ showAllReviews, onViewAllReviews, productId }) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  const limit = showAllReviews ? 10 : 3;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        setReviews(data || []);

        if (data && data.length > 0) {
          const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating((totalRating / data.length).toFixed(1));

          const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          data.forEach(review => counts[review.rating]++);
          setRatingCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, limit]);

  const renderStars = (rating) => {
    return Array(5)
      .fill()
      .map((_, i) =>
        i < rating ? <Star key={i} /> : <IoStarOutline key={i} size={24} color="#e0e0e0" />
      );
  };

  const renderDistributionBar = (stars, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <DistributionRow key={stars}>
        <StarLabel>{stars}</StarLabel>
        <IoStar size={16} color="#FFB800" />
        <ProgressBar>
          <ProgressFill style={{ width: `${percentage}%` }} />
        </ProgressBar>
        <CountLabel>{count}</CountLabel>
      </DistributionRow>
    );
  };

  if (loading) {
    return (
      <RatingReviewContainer>
        <SectionTitle>{t('RatingAndReviews')}</SectionTitle>
        <LoadingSpinner />
      </RatingReviewContainer>
    );
  }

  const totalReviews = reviews.length;

  return (
    <RatingReviewContainer>
      <SectionTitle>{t('RatingAndReviews')}</SectionTitle>
      {totalReviews > 0 ? (
        <ReviewsGrid>
          <RatingSummary>
            <OverallRating>
              <RatingScore>{averageRating}</RatingScore>
              <RatingStars>{renderStars(Math.round(averageRating))}</RatingStars>
              <TotalReviews>{totalReviews} {t('Reviews')}</TotalReviews>
            </OverallRating>
            <RatingDistribution>
              {Object.entries(ratingCounts)
                .reverse()
                .map(([stars, count]) => renderDistributionBar(stars, count, totalReviews))}
            </RatingDistribution>
          </RatingSummary>

          <ReviewsList>
            {reviews.map((review) => (
              <ReviewCard key={review.id}>
                <ReviewAvatar>{review.user_name?.charAt(0).toUpperCase() || 'A'}</ReviewAvatar>
                <ReviewContent>
                  <ReviewHeader>
                    <ReviewerName>{review.user_name || t('Anonymous')}</ReviewerName>
                    <ReviewStars>{renderStars(review.rating)}</ReviewStars>
                  </ReviewHeader>
                  <ReviewText>{review.comment || t('NoCommentProvided')}</ReviewText>
                </ReviewContent>
              </ReviewCard>
            ))}
          </ReviewsList>
        </ReviewsGrid>
      ) : (
        <NoReviewsText>{t('NoReviewsYet')}</NoReviewsText>
      )}
      {!showAllReviews && totalReviews > limit && (
        <ViewAllButton onClick={onViewAllReviews}>
          {t('ViewAllReviews', { count: totalReviews })}
        </ViewAllButton>
      )}
    </RatingReviewContainer>
  );
};

export default RatingReviewSection;