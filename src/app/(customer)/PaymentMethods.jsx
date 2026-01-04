import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/ShopHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { supabaseUrl, supabaseAnonKey } from '../../lib/constants';
import { IoAdd, IoLockClosed, IoLockOpen, IoTrash, IoCheckmarkCircle } from 'react-icons/io5';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';

const Card = styled.div`
  background: #ECFDF5;
  width: 290px;
  height: 165px;
  border-radius: 11px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const LogoContainer = styled.div`
  width: 56.23px;
  height: 28.13px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const CirclesContainer = styled.div`
  display: flex;
  width: 56.23px;
  position: relative;
`;
const Circle = styled.div`
  width: 28.13px;
  height: 28.13px;
  border-radius: 50%;
`;
const CircleLeft = styled(Circle)`
  background: #EB001B;
  position: relative;
  z-index: 2;
`;
const CircleRight = styled(Circle)`
  background: #F79E1B;
  margin-left: -10px;
  z-index: 1;
`;
const VisaText = styled.span`
  font-family: 'Raleway', sans-serif;
  font-size: 18px;
  font-style: italic;
  font-weight: bold;
  color: #1A1F71;
  letter-spacing: 1px;
`;
const UnknownBrandText = styled.span`
  font-family: 'Raleway', sans-serif;
  font-size: 12px;
  color: #666;
`;
const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
`;
const TrashButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }
`;
const CardNumber = styled.p`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 7.068px;
  color: #202020;
  margin: 16px 0;
`;
const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const CardHolder = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 10px;
  line-height: 13px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #202020;
`;
const ExpiryDate = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #202020;
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(236, 236, 236, 0.78);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
const ModalHeader = styled.div`
  padding: 24px;
  background: #F8FAFF;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;
const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000;
  margin: 0;
`;
const ModalContentInner = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const InputLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #000;
`;
const CardElementContainer = styled.div`
  width: 100%;
  padding: 16px;
  background: #ECFDF5;
  border-radius: 9px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  &:focus-within {
    border-color: #00BC7D;
    background: #F0FDF9;
  }
  .StripeElement {
    font-family: 'Raleway', sans-serif;
  }
`;
const ConfirmButton = styled.button`
  background: #00BC7D;
  color: white;
  border: none;
  border-radius: 9px;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
  &:hover {
    background: #00A66A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    background: #CCCCCC;
    cursor: not-allowed;
    transform: none;
  }
`;
const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding-top: 80px;
  padding-bottom: 60px;
`;
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;
const Header = styled.div`
  margin-bottom: 32px;
`;
const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #000;
  margin: 0;
`;
const SavedCardsContainer = styled.div`
  min-height: 200px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
`;
const CardsWrapper = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px 0;
  width: 100%;
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #F9F9F9;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #00BC7D;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #00A66A;
  }
`;
const NoCardsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 0;
`;
const NoCardsText = styled.p`
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0;
`;
const AddButton = styled.button`
  width: 45px;
  height: 160px;
  background: #00BC7D;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  &:hover {
    background: #00A66A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
  &:active {
    transform: translateY(0);
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;
const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #F0F0F0;
  border-top: 4px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
const OrdersSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const OrderItem = styled.div`
  background: #ECFDF5;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;
const OrderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
const OrderDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const OrderDate = styled.span`
  font-family: 'Raleway', sans-serif;
  font-size: 10px;
  color: #000;
`;
const OrderNumber = styled.span`
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  color: #202020;
`;
const OrderAmount = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.17px;
  color: #000;
  flex-shrink: 0;
`;
const NoOrdersText = styled.p`
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 32px;
`;

const PaymentCard = ({ id, cardHolder, cardNumber, expiryDate, cardBrand, isSelected = false, showTick = false, onRemove }) => {
  const { t } = useTranslation();
  const maskedCardNumber = `•••• •••• •••• ${cardNumber.slice(-4)}`;
  const renderMastercardLogo = () => (
    <CirclesContainer>
      <CircleLeft />
      <CircleRight />
    </CirclesContainer>
  );
  const renderVisaLogo = () => (
    <LogoContainer>
      <VisaText>VISA</VisaText>
    </LogoContainer>
  );
  const renderCardLogo = () => {
    switch (cardBrand?.toLowerCase()) {
      case 'visa':
        return renderVisaLogo();
      case 'mastercard':
        return renderMastercardLogo();
      default:
        return (
          <LogoContainer>
            <UnknownBrandText>{t('UnknownBrand')}</UnknownBrandText>
          </LogoContainer>
        );
    }
  };
  const handleRemove = () => {
    if (!id) {
      console.error('Payment Method ID is missing');
      alert(t('FailedToDeleteCardMissingId'));
      return;
    }
    const confirmed = window.confirm(t('ConfirmDeleteCard'));
    if (confirmed && onRemove) {
      onRemove(id);
    }
  };
  return (
    <Card>
      <TopRow>
        {renderCardLogo()}
        <IconContainer>
          {showTick && isSelected ? (
            <IoCheckmarkCircle size={24} color="#00BC7D" />
          ) : (
            <TrashButton onClick={handleRemove}>
              <IoTrash size={24} color="#D97474" />
            </TrashButton>
          )}
        </IconContainer>
      </TopRow>
      <CardNumber>{maskedCardNumber}</CardNumber>
      <BottomRow>
        <CardHolder>{cardHolder.toUpperCase()}</CardHolder>
        <ExpiryDate>{expiryDate}</ExpiryDate>
      </BottomRow>
    </Card>
  );
};

const AddCardModal = ({ visible, onClose, stripeCustomerId, onCardAdded }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    if (visible && stripeCustomerId && !clientSecret) {
      initiateSetupIntent();
    }
  }, [visible, stripeCustomerId]);

  const initiateSetupIntent = async () => {
    if (!stripeCustomerId) {
      alert(t('NoStripeCustomerFound'));
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${supabaseUrl}/functions/v1/create-setup-intent`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: stripeCustomerId }),
      });
      if (!response.ok) {
        throw new Error(`Setup Intent failed with status: ${response.status}`);
      }
      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error('Setup Intent Error:', error.message);
      alert(`${t('FailedToInitiateSetupIntent')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveCard = async () => {
    if (!stripe || !elements) {
      alert(t('StripeNotInitialized'));
      return;
    }
    if (!clientSecret) {
      alert(t('NoSetupIntentAvailable'));
      return;
    }
    if (!cardComplete) {
      alert(t('CompleteCardDetails'));
      return;
    }
    try {
      setLoading(true);
      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );
      if (confirmError) {
        throw new Error(`${t('SetupIntentConfirmationFailed')}: ${confirmError.message}`);
      }
      if (setupIntent.status === 'succeeded' || setupIntent.status === 'processing') {
        alert(t('CardSavedSuccessfully'));
        onCardAdded();
        setClientSecret(null);
        setCardComplete(false);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(`${t('SetupIntentFailed')}: ${setupIntent.status}`);
      }
    } catch (error) {
      console.error('Card Save Error:', error.message);
      alert(`${t('FailedToSaveCard')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{t('AddCard')}</ModalTitle>
        </ModalHeader>
        <ModalContentInner>
          <InputContainer>
            <InputLabel>{t('CardDetails')}</InputLabel>
            <CardElementContainer>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#202020',
                      fontFamily: 'Raleway, sans-serif',
                      '::placeholder': {
                        color: '#999',
                      },
                    },
                    invalid: {
                      color: '#D97474',
                    },
                  },
                }}
                onChange={(e) => {
                  setCardComplete(e.complete);
                }}
              />
            </CardElementContainer>
          </InputContainer>
          <ConfirmButton
            onClick={saveCard}
            disabled={loading || !cardComplete || !clientSecret}
          >
            {loading ? t('Processing') : t('Confirm')}
          </ConfirmButton>
        </ModalContentInner>
      </ModalContent>
    </ModalOverlay>
  );
};

const PaymentMethods = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  const [isAddCardModalVisible, setIsAddCardModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchStripeCustomerId = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_stripe_customers')
          .select('stripe_customer_id')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        if (data?.stripe_customer_id) {
          setStripeCustomerId(data.stripe_customer_id);
        } else {
          alert(t('StripeCustomerIdNotFound'));
        }
      } catch (error) {
        alert(`${t('Error')}: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStripeCustomerId();
  }, [user, t]);

  const fetchSavedCards = async () => {
    if (!stripeCustomerId) return;
    try {
      setLoading(true);
      const response = await fetch(`${supabaseUrl}/functions/v1/get-saved-cards`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: stripeCustomerId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const { paymentMethods } = await response.json();
      setSavedCards(paymentMethods || []);
    } catch (error) {
      alert(`${t('FailedToFetchSavedCards')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      alert(`${t('Error')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stripeCustomerId) {
      fetchSavedCards();
      fetchOrders();
    }
  }, [stripeCustomerId]);

  const handleRemoveCard = async (id) => {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-payment-method`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId: id }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const { success, error } = await response.json();
      if (!success || error) {
        throw new Error(error || 'Unknown error');
      }
      alert(t('CardDeletedSuccessfully'));
      setSavedCards(savedCards.filter(card => card.id !== id));
    } catch (error) {
      console.error('Error deleting payment method:', error.message);
      alert(`${t('FailedToDeleteCard')}: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <PageContainer>
      <ShopHeader
        isConnected={!!user}
        avatarUrl={profile?.avatar_url}
        userRole={profile?.role}
        userEmail={profile?.email || user?.email}
        onLogout={logout}
      />
      <Container>
        <Header>
          <Title>{t('PaymentMethods')}</Title>
        </Header>
        <SavedCardsContainer>
          {loading && !savedCards.length ? (
            <LoadingContainer>
              <Spinner />
            </LoadingContainer>
          ) : savedCards.length > 0 ? (
            <CardsWrapper>
              {savedCards.map((card) => (
                <PaymentCard
                  key={card.id}
                  id={card.id}
                  cardHolder={card.billing_details?.name || t('Unknown')}
                  cardNumber={card.card.last4}
                  expiryDate={`${card.card.exp_month}/${card.card.exp_year.toString().slice(-2)}`}
                  cardBrand={card.card.brand}
                  showTick={false}
                  onRemove={handleRemoveCard}
                />
              ))}
              <AddButton onClick={() => setIsAddCardModalVisible(true)}>
                <IoAdd size={24} color="#FFFFFF" />
              </AddButton>
            </CardsWrapper>
          ) : (
            <NoCardsContainer>
              <NoCardsText>{t('NoSavedCards')}</NoCardsText>
              <AddButton onClick={() => setIsAddCardModalVisible(true)}>
                <IoAdd size={24} color="#FFFFFF" />
              </AddButton>
            </NoCardsContainer>
          )}
        </SavedCardsContainer>
        <OrdersSection>
          {loading && !orders.length ? (
            <LoadingContainer>
              <Spinner />
            </LoadingContainer>
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const isSuccess = order.status === 'succeeded';
              return (
                <OrderItem key={order.id}>
                  <OrderIcon>
                    {isSuccess ? (
                      <IoLockClosed size={25} color="#00BC7D" />
                    ) : (
                      <IoLockOpen size={25} color="#FF0000" />
                    )}
                  </OrderIcon>
                  <OrderDetails>
                    <OrderDate>{formatDate(order.created_at)}</OrderDate>
                     <OrderNumber>{t('Order')} #{order.id}</OrderNumber>
                  </OrderDetails>
                  <OrderAmount>-${order.amount.toFixed(2)}</OrderAmount>
                </OrderItem>
              );
            })
          ) : (
            <NoOrdersText>{t('NoOrdersFound')}</NoOrdersText>
          )}
        </OrdersSection>
        <AddCardModal
          visible={isAddCardModalVisible}
          onClose={() => setIsAddCardModalVisible(false)}
          stripeCustomerId={stripeCustomerId}
          onCardAdded={fetchSavedCards}
        />
      </Container>
    </PageContainer>
  );
};

export default PaymentMethods;