import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { supabaseUrl, supabaseAnonKey } from '../../lib/constants';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import ShopHeader from '../../components/ShopHeader';
import { IoPencil, IoCheckmarkCircle, IoClose, IoChevronDown, IoCardOutline, IoLocationOutline, IoCallOutline, IoCartOutline, IoShieldCheckmarkOutline, IoLockClosedOutline, IoTrash } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #fafbfc;
  padding-top: 80px;
  padding-bottom: 140px;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
`;

const PageTitle = styled.h1`
  font-size: 42px;
  font-weight: 900;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0 0 12px 0;
  letter-spacing: -1.5px;
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  margin: 0;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 32px;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 400px;
    gap: 24px;
  }
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
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

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
  position: relative;
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: #00BC7D;
  }
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
`;

const SectionTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const SectionContent = styled.div`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  line-height: 1.8;
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const ContentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const EditButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
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

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  letter-spacing: -0.2px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border-radius: 12px;
  background: #f8f9fa;
  border: 2px solid transparent;
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  outline: none;
  transition: all 0.3s ease;
  &:focus {
    border-color: #00BC7D;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.1);
  }
  &::placeholder {
    color: #999;
  }
  &:disabled {
    background: #e8eaed;
    cursor: not-allowed;
    color: #999;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const SaveButton = styled.button`
  padding: 14px 32px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 125, 0.4);
  }
  &:disabled {
    background: #c4c7cc;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const CancelButton = styled(SaveButton)`
  background: white;
  color: #1a1a2e;
  border: 2px solid #e8eaed;
  box-shadow: none;
  &:hover {
    background: #f8f9fa;
    border-color: #00BC7D;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CartSection = styled(Section)``;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
`;

const CartTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CartTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const CountBadge = styled.span`
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 16px;
  background: #f8f9fa;
  border-radius: 16px;
  transition: all 0.3s ease;
  &:hover {
    background: #f0f2f5;
    transform: translateX(4px);
  }
  &:last-child {
    margin-bottom: 0;
  }
  @media (max-width: 768px) {
    gap: 16px;
    padding: 16px;
  }
`;

const ItemImageWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const QuantityBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 188, 125, 0.3);
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.p`
  font-size: 15px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ItemPrice = styled.p`
  font-size: 20px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const VendorGroup = styled.div`
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;
`;

const VendorTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 16px;
`;

const ShippingSelectGroup = styled.div`
  margin-bottom: 16px;
`;

const ShippingSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e8eaed;
  font-size: 14px;
  cursor: pointer;
`;

const ShippingOption = styled.option``;

const VoucherSection = styled.div`
  margin-top: 16px;
`;

const VoucherSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e8eaed;
  font-size: 14px;
  cursor: pointer;
`;

const CardElementContainer = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  background: #f8f9fa;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  &:focus-within {
    border-color: #00BC7D;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.1);
  }
`;

const CardPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #00BC7D15 0%, #00A66A15 100%);
  color: #00BC7D;
  padding: 14px 24px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  border: 2px solid #00BC7D30;
`;

const OrderSummaryCard = styled(Section)`
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
  &:last-child {
    border-bottom: none;
    padding-top: 24px;
    margin-top: 8px;
    border-top: 2px solid #e8eaed;
  }
`;

const SummaryLabel = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #5f6368;
  ${props => props.total && `
    font-size: 20px;
    font-weight: 800;
    color: #1a1a2e;
  `}
`;

const SummaryValue = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  color: #1a1a2e;
  ${props => props.total && `
    font-size: 28px;
    font-weight: 900;
    background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
  `}
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0fdf9;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid #00BC7D30;
`;

const SecurityText = styled.span`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #00BC7D;
`;

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 24px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  border-top: 2px solid #f0f2f5;
`;

const BottomContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const TotalSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const TotalLabel = styled.span`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
`;

const TotalPrice = styled.span`
  font-size: 32px;
  font-weight: 900;
  font-family: 'Raleway', sans-serif;
  background: linear-gradient(135deg, #00BC7D 0%, #00A66A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const PayButton = styled.button`
  padding: 18px 48px;
  background: ${props => props.disabled ? '#c4c7cc' : 'linear-gradient(135deg, #1a1a2e 0%, #000000 100%)'};
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.disabled ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.2)'};
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 16px 32px;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
  filter: grayscale(0.5);
`;

const EmptyTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  color: #1a1a2e;
  margin: 0 0 12px 0;
`;

const EmptyText = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #5f6368;
  margin: 0;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(8px);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const LoadingBox = styled.div`
  background: white;
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  min-width: 320px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  @media (max-width: 768px) {
    min-width: 280px;
    padding: 40px 32px;
  }
`;

const Spinner = styled.div`
  width: 56px;
  height: 56px;
  border: 5px solid #f0f2f5;
  border-top: 5px solid #00BC7D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 24px;
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 18px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 14px;
  margin-top: 8px;
`;

const SuccessMessage = styled.div`
  color: #00BC7D;
  font-size: 14px;
  margin-top: 8px;
`;

const RemoveItemButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s ease;
  &:hover {
    color: #f5576c;
  }
`;

const Payment = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { cartItems, clearCart } = useCart();
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const { formatCurrency } = useCurrency();
const [convertedCartItems, setConvertedCartItems] = useState([]);
const [total, setTotal] = useState(0);
const [displayTotal, setDisplayTotal] = useState('$0.00');
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing payment...');
  const [address, setAddress] = useState(profile?.address_line1 || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [postalCode, setPostalCode] = useState(profile?.zip_code || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [vendorGroups, setVendorGroups] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('initial');

  useEffect(() => {
    setLocalProfile(profile);
    if (profile) {
      setAddress(profile.address_line1 || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setPostalCode(profile.zip_code || '');
      setCountry(profile.country || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
  const convertCartPrices = async () => {
    if (cartItems.length === 0) return;
    
    const itemsWithConvertedPrices = await Promise.all(
      cartItems.map(async (item) => {
        const displayPrice = await formatCurrency(item.price);
        return {
          ...item,
          displayPrice
        };
      })
    );
    
    setConvertedCartItems(itemsWithConvertedPrices);
  };
  
  convertCartPrices();
}, [cartItems, formatCurrency]);

  useEffect(() => {
    const fetchStripeCustomerId = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('user_stripe_customers')
          .select('stripe_customer_id')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        if (data?.stripe_customer_id) {
          setStripeCustomerId(data.stripe_customer_id);
        }
      } catch (error) {
        console.error('Error fetching stripe customer:', error);
      }
    };
    fetchStripeCustomerId();
  }, [user]);

  useEffect(() => {
    const fetchSavedCards = async () => {
      if (!stripeCustomerId) return;
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/get-saved-cards`, {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customerId: stripeCustomerId }),
        });
        if (!response.ok) throw new Error('Failed to fetch cards');
        const { paymentMethods } = await response.json();
        setSavedCards(paymentMethods || []);
        if (paymentMethods && paymentMethods.length > 0 && !selectedCard) {
          setSelectedCard(paymentMethods[0]);
        }
      } catch (error) {
        console.error('Error fetching saved cards:', error);
      }
    };
    fetchSavedCards();
  }, [stripeCustomerId]);

  const fetchShippingOptions = useCallback(async (productId, productWeight) => {
    try {
      const isHeavyProduct = productWeight >= 25;
      let predefined = [];
      if (!isHeavyProduct) {
        const { data: globalData, error: globalError } = await supabase
          .from('shipping_options')
          .select('id, name, min_days, max_days, return_min_days, return_max_days, price, is_admin_default')
          .eq('is_admin_default', true)
          .is('product_id', null);
        if (globalError) throw globalError;
        predefined = globalData.map((option) => ({
          id: option.id.toString(),
          name: option.name,
          duration: `${option.min_days}-${option.max_days} days`,
          price: option.price === 0 ? 'FREE' : `$${Number(option.price).toFixed(2)}`,
          is_admin_default: option.is_admin_default,
          returnDuration: option.return_min_days && option.return_max_days
            ? `${option.return_min_days}-${option.return_max_days} days`
            : 'Not Available',
        }));
      }
      const { data: customData, error: customError } = await supabase
        .from('shipping_options')
        .select('id, name, min_days, max_days, return_min_days, return_max_days, price, is_admin_default')
        .eq('product_id', productId)
        .eq('is_admin_default', false);
      if (customError) throw customError;
      const customOptions = customData.map((courier) => ({
        id: courier.id.toString(),
        name: courier.name,
        duration: `${courier.min_days}-${courier.max_days} days`,
        price: courier.price === 0 ? 'FREE' : `$${Number(courier.price).toFixed(2)}`,
        is_admin_default: courier.is_admin_default,
        returnDuration: courier.return_min_days && courier.return_max_days
          ? `${courier.return_min_days}-${courier.return_max_days} days`
          : 'Not Available',
      }));
      return {
        shippingOptions: [...predefined, ...customOptions],
        restrictToCustomOptions: isHeavyProduct,
      };
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      return { shippingOptions: [], restrictToCustomOptions: false };
    }
  }, []);

  const fetchVendorData = useCallback(async () => {
    if (!cartItems.length && paymentStatus !== 'success') {
      setVendorGroups([]);
      return;
    }
    try {
      setLoading(true);
      const productIds = cartItems.map(item => item.id);
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, vendor_id, weight')
        .in('id', productIds);
      if (productError) throw productError;
      const groupedItems = cartItems.reduce((acc, item) => {
        const product = products.find(p => p.id === item.id);
        if (!product) return acc;
        const vendorId = product.vendor_id;
        if (!acc[vendorId]) {
          acc[vendorId] = { items: [], vendorId, productWeights: {} };
        }
        acc[vendorId].items.push(item);
        acc[vendorId].productWeights[item.id] = product.weight || 0;
        return acc;
      }, {});
      const vendorIds = Object.keys(groupedItems);
      const vendorGroupsData = [];
      for (const vendorId of vendorIds) {
        const { data: vendorAccount, error: vendorError } = await supabase
          .from('vendor_stripe_accounts')
          .select('stripe_account_id')
          .eq('vendor_id', vendorId)
          .single();
        if (vendorError) throw vendorError;
        if (!vendorAccount || !vendorAccount.stripe_account_id) continue;
        const { data: subscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('plan_name')
          .eq('profile_id', vendorId)
          .single();
        let plan_name = 'No Subscription Found';
        if (!subscriptionError && subscription) {
          plan_name = subscription.plan_name || 'No Subscription Found';
        }
        const shippingOptionsByProduct = {};
        let restrictToCustomOptions = false;
        for (const item of groupedItems[vendorId].items) {
          const productWeight = groupedItems[vendorId].productWeights[item.id];
          const { shippingOptions, restrictToCustomOptions: isHeavy } = await fetchShippingOptions(item.id, productWeight);
          shippingOptionsByProduct[item.id] = shippingOptions;
          if (isHeavy) restrictToCustomOptions = true;
        }
        let selectedShippingOption = groupedItems[vendorId].items[0]?.shipping_option;
        if (!selectedShippingOption && Object.keys(shippingOptionsByProduct).length > 0) {
          const productId = groupedItems[vendorId].items[0].id;
          const options = shippingOptionsByProduct[productId];
          selectedShippingOption = options.find(opt => opt.is_admin_default) || options[0] || null;
        }
        vendorGroupsData.push({
          vendorId,
          items: groupedItems[vendorId].items,
          stripeAccountId: vendorAccount.stripe_account_id,
          plan_name,
          selectedShippingOption,
          shippingOptionsByProduct,
          restrictToCustomOptions,
        });
      }
      setVendorGroups(vendorGroupsData);
    } catch (error) {
      console.error('Failed to fetch vendor information', error);
    } finally {
      setLoading(false);
    }
  }, [cartItems, paymentStatus, fetchShippingOptions]);

  useEffect(() => {
    if (paymentStatus !== 'success') {
      fetchVendorData();
    }
  }, [fetchVendorData, paymentStatus]);

const calculateTotal = useCallback(async () => {
  let total = 0;
  for (const group of vendorGroups) {
    const subtotal = group.items.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
    let shippingCost = 0;
    if (group.selectedShippingOption && group.selectedShippingOption.price) {
      shippingCost = group.selectedShippingOption.price === 'FREE' ? 0 : parseFloat(group.selectedShippingOption.price.replace(/[^0-9.]/g, '')) || 0;
    }
    let groupTotal = subtotal + shippingCost;
    if (selectedVoucher) {
      const discountPercent = parseFloat(selectedVoucher.discount) || 5;
      groupTotal *= (1 - discountPercent / 100);
    }
    total += groupTotal;
  }
  return total;
}, [vendorGroups, selectedVoucher]);




  useEffect(() => {
  const convertTotal = async () => {
    const totalValue = await calculateTotal();
    setTotal(totalValue); // Set the numeric total
    const converted = await formatCurrency(totalValue);
    setDisplayTotal(converted);
  };
  
  convertTotal();
}, [vendorGroups, selectedVoucher, formatCurrency, calculateTotal]);

  const updateShippingOption = useCallback((vendorId, option) => {
    setVendorGroups(prev =>
      prev.map(group =>
        group.vendorId === vendorId ? { ...group, selectedShippingOption: option } : group
      )
    );
  }, []);

  const handleSaveAddress = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address_line1: address,
          city,
          state,
          zip_code: postalCode,
          country,
        })
        .eq('id', profile.id);
      if (error) throw error;
      setLocalProfile(prev => ({ ...prev, address_line1: address, city, state, zip_code: postalCode, country }));
      setEditingAddress(false);
      console.log('Address updated successfully!');
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleSaveContact = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', profile.id);
      if (error) throw error;
      setLocalProfile(prev => ({ ...prev, phone }));
      setEditingContact(false);
      console.log('Contact updated successfully!');
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(voucher);
  };

  const updateStockQuantity = async (items) => {
    try {
      for (const item of items) {
        if (item.variation_id) {
          const { data: variation } = await supabase
            .from('product_variations')
            .select('stock_quantity')
            .eq('id', item.variation_id)
            .single();
          if (variation) {
            const newStockQuantity = variation.stock_quantity - (item.quantity || 1);
            if (newStockQuantity >= 0) {
              await supabase
                .from('product_variations')
                .update({ stock_quantity: newStockQuantity })
                .eq('id', item.variation_id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating stock quantities:', error);
    }
  };

  const checkFirstPurchase = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'succeeded');
      return orders.length === 0;
    } catch (error) {
      console.error('Error checking first purchase:', error);
      return false;
    }
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      console.log('Your cart is empty');
      return;
    }
    if (!selectedCard && !editingPayment) {
      console.log('Please select a payment method');
      return;
    }
    if (vendorGroups.some(group => !group.selectedShippingOption)) {
      console.log('Please select a shipping option for all vendors');
      return;
    }
    setShowLoading(true);
    setLoadingMessage(t('ProcessingPayment'));
    setLoading(true);
    try {
      let paymentMethodId;
      if (editingPayment) {
        const cardElement = elements.getElement(CardElement);
        const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
        if (pmError) throw new Error(pmError.message);
        paymentMethodId = paymentMethod.id;
      } else {
        paymentMethodId = selectedCard.id;
      }
      const orderIds = [];
      let allSucceeded = true;
      const isFirstPurchase = await checkFirstPurchase();
      for (const group of vendorGroups) {
        const { items, stripeAccountId, plan_name, selectedShippingOption, vendorId } = group;
        let rawTotal = items.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
        let shippingCost = 0;
        if (selectedShippingOption && selectedShippingOption.price) {
          shippingCost = selectedShippingOption.price === 'FREE' ? 0 : parseFloat(selectedShippingOption.price.replace(/[^0-9.]/g, '')) || 0;
        }
        if (selectedVoucher) {
          const discountPercent = parseFloat(selectedVoucher.discount) || 5;
          rawTotal *= (1 - discountPercent / 100);
        }
        const totalAmount = Math.round((rawTotal + shippingCost) * 100);
        const paymentIntentEndpoint = plan_name === 'pro' ? 'create-payment-intent-v2' : 'create-payment-intent';
        const response = await fetch(`${supabaseUrl}/functions/v1/${paymentIntentEndpoint}`, {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: stripeCustomerId,
            amount: totalAmount,
            paymentMethodId,
            vendorAccountId: stripeAccountId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.stripeError || errorData.error || 'Payment failed');
        }
        const result = await response.json();
        const shippingOptionToStore = selectedShippingOption || { id: 'unknown', name: 'Not Available', duration: 'Not Available', price: '$0.00' };
        const orderData = {
          user_id: user.id,
          customer_id: stripeCustomerId,
          payment_intent_id: result.paymentIntentId,
          amount: totalAmount / 100,
          status: result.status === 'succeeded' ? 'succeeded' : 'unpayed',
          delivery_status: result.status === 'succeeded' ? 'processing' : 'pending',
          shipping_address: {
            line1: address || 'Not Available',
            city: city || 'Not Available',
            state: state || 'Not Available',
            postal_code: postalCode || 'Not Available',
            country: country || 'Not Available',
          },
          shipping_option: shippingOptionToStore,
          vendor_id: vendorId,
          items: items.map(item => ({
            id: item.id,
            description: item.description || 'Not Available',
            price: item.price,
            quantity: item.quantity || 1,
            image_url: item.image_url,
          })),
          voucher_id: selectedVoucher ? selectedVoucher.id : null,
        };
        if (result.status === 'succeeded') {
          const { data, error } = await supabase.from('orders').insert([orderData]).select('id');
          if (error) throw error;
          orderIds.push(data[0].id);
          await updateStockQuantity(items);
          if (selectedVoucher) {
            await supabase
              .from('user_rewards')
              .update({ is_used: true, used_at: new Date().toISOString() })
              .eq('user_id', user.id)
              .eq('reward_id', selectedVoucher.id);
          }
          if (isFirstPurchase) {
            console.log('First purchase - voucher unlocked');
          }
        } else if (result.requiresAction) {
          const { error } = await stripe.confirmCardPayment(result.clientSecret, {
            payment_method: paymentMethodId,
          });
          if (error) throw new Error(error.message);
          orderData.status = 'succeeded';
          orderData.payment_intent_id = result.paymentIntentId; // Update if needed
          orderData.delivery_status = 'processing';
          const { data, error: supabaseError } = await supabase.from('orders').insert([orderData]).select('id');
          if (supabaseError) throw supabaseError;
          orderIds.push(data[0].id);
          await updateStockQuantity(items);
          // Handle voucher and first purchase as above
        } else {
          allSucceeded = false;
          const { data, error: supabaseError } = await supabase.from('orders').insert([orderData]).select('id');
          if (!supabaseError && data) orderIds.push(data[0].id);
        }
      }
      if (allSucceeded) {
        clearCart();
        setPaymentStatus('success');
       setLoadingMessage(t('AllOrdersProcessedSuccessfully'));
        setTimeout(() => {
          setShowLoading(false);
          navigate('/Orders');
        }, 2000);
      } else {
        setLoadingMessage(t('Failed'));
        setTimeout(() => setShowLoading(false), 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setLoadingMessage(t('PaymentFailedWithError', { error: error.message }));
      setTimeout(() => setShowLoading(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && paymentStatus !== 'success') {
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
        <EmptyCart>
          <EmptyIcon>🛒</EmptyIcon>
          <EmptyTitle>{t('YourCartIsEmpty')}</EmptyTitle>
          <EmptyText>{t('Add some items to get started')}</EmptyText>
        </EmptyCart>
      </Container>
    </PageContainer>
  );
}

// If payment succeeded and cart is empty, redirect immediately
if (cartItems.length === 0 && paymentStatus === 'success') {
  return null; // Don't show anything, already redirecting
}

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
        <PageHeader>
          <PageTitle>{t('SecureCheckout')}</PageTitle>
          <PageSubtitle>{t('CompletePurchaseSecurely')}</PageSubtitle>
        </PageHeader>
        <Grid>
          <LeftColumn>
            <Section>
              {!editingAddress ? (
                <>
                  <SectionHeader>
                    <SectionTitleGroup>
                      <SectionIconWrapper>
                        <IoLocationOutline size={24} />
                      </SectionIconWrapper>
                      <SectionTitle>{t('ShippingAddress')}</SectionTitle>
                    </SectionTitleGroup>
                    <EditButton onClick={() => setEditingAddress(true)}>
                      <IoPencil size={20} color="white" />
                    </EditButton>
                  </SectionHeader>
                  <SectionContent>
                    <ContentRow><strong>{address || 'No address provided'}</strong></ContentRow>
                    <ContentRow>{city && state ? `${city}, ${state} ${postalCode}` : 'No city/state provided'}</ContentRow>
                    <ContentRow>{country || 'No country provided'}</ContentRow>
                  </SectionContent>
                </>
              ) : (
                <>
                  <SectionHeader>
                    <SectionTitleGroup>
                      <SectionIconWrapper>
                        <IoLocationOutline size={24} />
                      </SectionIconWrapper>
                      <SectionTitle>Edit Shipping Address</SectionTitle>
                    </SectionTitleGroup>
                  </SectionHeader>
                  <EditForm>
                    <InputGroup>
                      <Label>{t('StreetAddress')}</Label>
                      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" />
                    </InputGroup>
                    <InputGroup>
                      <Label>{t('City')}</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
                    </InputGroup>
                    <InputGroup>
                      <Label>{t('StateProvince')}</Label>
                      <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="NY" />
                    </InputGroup>
                    <InputGroup>
                      <Label>{t('PostalCode')}</Label>
                      <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="10001" />
                    </InputGroup>
                    <InputGroup>
                      <Label>{t('Country')}</Label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
                    </InputGroup>
                    <ButtonRow>
                      <CancelButton onClick={() => setEditingAddress(false)}>{t('Cancel')}</CancelButton>
                      <SaveButton onClick={handleSaveAddress}>{t('SaveAddress')}</SaveButton>
                    </ButtonRow>
                  </EditForm>
                </>
              )}
            </Section>
            <Section>
              {!editingContact ? (
                <>
                  <SectionHeader>
                    <SectionTitleGroup>
                      <SectionIconWrapper>
                        <IoCallOutline size={24} />
                      </SectionIconWrapper>
                      <SectionTitle>{t('ContactInformation')}</SectionTitle>
                    </SectionTitleGroup>
                    <EditButton onClick={() => setEditingContact(true)}>
                      <IoPencil size={20} color="white" />
                    </EditButton>
                  </SectionHeader>
                  <SectionContent>
                    <ContentRow><strong>{profile?.email || user?.email || 'No email provided'}</strong></ContentRow>
                    <ContentRow>{phone || 'No phone provided'}</ContentRow>
                  </SectionContent>
                </>
              ) : (
                <>
                  <SectionHeader>
                    <SectionTitleGroup>
                      <SectionIconWrapper>
                        <IoCallOutline size={24} />
                      </SectionIconWrapper>
                      <SectionTitle>Edit Contact Info</SectionTitle>
                    </SectionTitleGroup>
                  </SectionHeader>
                  <EditForm>
                    <InputGroup>
                      <Label>{t('Email')}</Label>
                      <Input value={profile?.email || user?.email || ''} disabled />
                    </InputGroup>
                    <InputGroup>
                      <Label>{t('Phone')}</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
                    </InputGroup>
                    <ButtonRow>
                      <CancelButton onClick={() => setEditingContact(false)}>{t('Cancel')}</CancelButton>
                      <SaveButton onClick={handleSaveContact}>{t('SaveContact')}</SaveButton>
                    </ButtonRow>
                  </EditForm>
                </>
              )}
            </Section>
            {vendorGroups.map((group) => (
              <VendorGroup key={group.vendorId}>
                <VendorTitle>{t('Vendor')}: {group.vendorId}</VendorTitle>
                {group.items.map((item) => (
                  <CartItem key={item.id}>
                    <ItemImageWrapper>
                      <ItemImage src={item.image_url} alt={item.description} />
                      <QuantityBadge>{item.quantity || 1}</QuantityBadge>
                    </ItemImageWrapper>
                    <ItemDetails>
                      <ItemName>{item.description}</ItemName>
                      <ItemPrice>{convertedCartItems.find(ci => ci.id === item.id)?.displayPrice || `$${item.price.toFixed(2)}`}</ItemPrice>
                    </ItemDetails>
                    <RemoveItemButton onClick={() => {/* removeFromCart(item.id) */}}>
                      <IoTrash size={20} />
                    </RemoveItemButton>
                  </CartItem>
                ))}
                <ShippingSelectGroup>
                  <Label>{t('ShippingOptions')}</Label>
                  <ShippingSelect
                    value={group.selectedShippingOption?.id || ''}
                    onChange={(e) => {
                      const option = group.shippingOptionsByProduct[group.items[0].id]?.find(opt => opt.id === e.target.value);
                      updateShippingOption(group.vendorId, option);
                    }}
                  >
                    {group.shippingOptionsByProduct[group.items[0].id]?.map((opt) => (
                      <ShippingOption key={opt.id} value={opt.id}>{opt.name} - {opt.duration} - {opt.price}</ShippingOption>
                    ))}
                  </ShippingSelect>
                </ShippingSelectGroup>
              </VendorGroup>
            ))}
            <VoucherSection>
              <Label>{t('Vouchers')}</Label>
              <VoucherSelect onChange={(e) => {/* handleSelectVoucher */}}>
                <option value="">Select Voucher</option>
                {/* Assume vouchers fetched separately */}
              </VoucherSelect>
            </VoucherSection>
            <Section>
              <SectionHeader>
                <SectionTitleGroup>
                  <SectionIconWrapper>
                    <IoCardOutline size={24} />
                  </SectionIconWrapper>
                  <SectionTitle>{t('PaymentMethod')}</SectionTitle>
                </SectionTitleGroup>
                <EditButton onClick={() => setEditingPayment(!editingPayment)}>
                  <IoPencil size={20} color="white" />
                </EditButton>
              </SectionHeader>
              {!editingPayment ? (
                <>
                  {savedCards.length > 0 ? (
                    <CardPill>
                      <IoCardOutline size={20} />
                      {selectedCard?.card?.brand} •••• {selectedCard?.card?.last4}
                    </CardPill>
                  ) : (
                    <SectionContent>{t('NoSavedCards')}</SectionContent>
                  )}
                  <SecurityBadge>
                    <IoLockClosedOutline size={18} color="#00BC7D" />
                    <SecurityText>{t('SecureSSLEncryptedCheckout')}</SecurityText>
                  </SecurityBadge>
                </>
              ) : (
                <EditForm>
                  <InputGroup>
                    <Label>Card Details</Label>
                    <CardElementContainer>
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '15px',
                              color: '#1a1a2e',
                              fontFamily: "'Raleway', sans-serif",
                              '::placeholder': {
                                color: '#999',
                              },
                            },
                            invalid: {
                              color: '#e53e3e',
                            },
                          },
                        }}
                      />
                    </CardElementContainer>
                  </InputGroup>
                  <ButtonRow>
                    <CancelButton onClick={() => setEditingPayment(false)}>{t('Cancel')}</CancelButton>
                    <SaveButton onClick={() => setEditingPayment(false)}>{t('SaveCard')}</SaveButton>
                  </ButtonRow>
                </EditForm>
              )}
            </Section>
          </LeftColumn>
          <RightColumn>
            <OrderSummaryCard>
              <SectionHeader style={{ marginBottom: '20px', paddingBottom: '20px' }}>
                <SectionTitleGroup>
                  <SectionIconWrapper>
                    <IoShieldCheckmarkOutline size={24} />
                  </SectionIconWrapper>
                  <SectionTitle>{t('OrderSummary')}</SectionTitle>
                </SectionTitleGroup>
              </SectionHeader>
              <SummaryRow>
                <SummaryLabel>{t('Subtotal')}</SummaryLabel>
                <SummaryValue>${vendorGroups.reduce((sum, group) => sum + group.items.reduce((total, item) => total + item.price * (item.quantity || 1), 0), 0).toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>{t('Shipping')}</SummaryLabel>
                <SummaryValue>${vendorGroups.reduce((sum, group) => {
                  let shipping = 0;
                  if (group.selectedShippingOption?.price) {
                    shipping = group.selectedShippingOption.price === 'FREE' ? 0 : parseFloat(group.selectedShippingOption.price.replace(/[^0-9.]/g, '')) || 0;
                  }
                  return sum + shipping;
                }, 0).toFixed(2)}</SummaryValue>
              </SummaryRow>
              {selectedVoucher && (
                <SummaryRow>
                  <SummaryLabel>{t('Discount')}</SummaryLabel>
                  <SummaryValue>-${((total * (parseFloat(selectedVoucher.discount) || 5) / 100) || 0).toFixed(2)}</SummaryValue>
                </SummaryRow>
              )}
              <SummaryRow>
                <SummaryLabel total>{t('Total')}</SummaryLabel>
                <SummaryValue total>{displayTotal}</SummaryValue>
              </SummaryRow>
              <SecurityBadge>
                <IoLockClosedOutline size={18} color="#00BC7D" />
                <SecurityText>{t('SecureSSLEncryptedCheckout')}</SecurityText>
              </SecurityBadge>
            </OrderSummaryCard>
          </RightColumn>
        </Grid>
      </Container>
      <BottomBar>
        <BottomContent>
          <TotalSection>
            <TotalLabel>{t('TotalAmount')}</TotalLabel>
            <TotalPrice>{displayTotal}</TotalPrice>
          </TotalSection>
          <PayButton onClick={handlePayment} disabled={loading || !stripe || !elements || vendorGroups.some(g => !g.selectedShippingOption)}>
            <IoLockClosedOutline size={20} />
            {loading ? t('ProcessingPayment') : t('CompletePayment')}
          </PayButton>
        </BottomContent>
      </BottomBar>
      {showLoading && (
        <LoadingOverlay show={showLoading}>
          <LoadingBox>
            <Spinner />
            <LoadingText>{loadingMessage}</LoadingText>
          </LoadingBox>
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

export default Payment;