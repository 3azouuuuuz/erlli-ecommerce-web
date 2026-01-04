import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, CONTABO_BUCKET_NAME, CONTABO_ENDPOINT } from '../../lib/constants';
import { IoCopyOutline } from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';
const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const CancelButton = styled.button`
  flex: 1;
  height: 40px;
  border-radius: 9px;
  border: 1px solid #00BC7D;
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #00BC7D;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Container = styled.div`
  padding: 80px 16px 20px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding-top: 100px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  line-height: 36px;
  letter-spacing: -0.26px;
  color: #202020;
  margin: 0;
`;

const ProgressBarContainer = styled.div`
  border-radius: 12px;
  padding: 20px 16px;
  margin-bottom: 10px;
  position: relative;
`;

const ProgressTrack = styled.div`
  height: 24px;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  top: 25px;
  position: relative;
`;

const ProgressBackgroundShadow = styled.div`
  position: absolute;
  right: 17px;
  height: 14px;
  width: 95%;
  background-color: #D0FAE5;
  border-radius: 6px;
  top: 70%;
  transform: translateY(-6px);
  z-index: 0;
`;

const ProgressBackground = styled.div`
  position: absolute;
  height: 10px;
  width: 100%;
  border-radius: 4px;
  top: 50%;
  border: 2px solid white;
  transform: translateY(-4px);
  z-index: 2;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
`;

const ProgressFill = styled.div`
  position: absolute;
  height: 8px;
  background-color: #00BC7D;
  border-radius: 4px;
  border: 2px solid white;
  top: 50%;
  left: 2px;
  transform: translateY(-4px);
  z-index: 2;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const CircleShadow = styled.div`
  position: absolute;
  background-color: #D0FAE5;
  border-radius: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 70%;
  z-index: 0;
  transform: translateY(-19px);
`;

const CircleContainer = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 18px;
  width: 26px;
  height: 26px;
  border: 2px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  transform: translateY(-12px);
  z-index: 1;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
`;

const CircleWrapper = styled.div`
  position: absolute;
  width: 26px;
  height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  transform: translateY(-12px);
  z-index: 3;
`;

const Circle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 12px;
  background-color: ${props => (props.$active ? '#00BC7D' : '#E0E0E0')};
  z-index: 3;
  transition: background-color 0.3s ease;
`;

const CloudContainer = styled.div`
  position: absolute;
  top: -20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 4;
  padding-top: 29px;

  ${props =>
    props.$position === 'start' &&
    `
    left: -21px;
    transform: translateX(5px);
  `}

  ${props =>
    props.$position === 'middle' &&
    `
    left: 51%;
    transform: translateX(-25px);
  `}

  ${props =>
    props.$position === 'end' &&
    `
    right: -17px;
    transform: translateX(-5px);
  `}
`;

const CloudBubble = styled.div`
  background-color: #10B981;
  border-radius: 15px;
  padding: 4px 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CloudText = styled.span`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #FFFFFF;
  text-align: center;
`;

const CloudTail = styled.div`
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #10B981;
  margin-top: -1px;
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const ArrivalContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArrivalLabel = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
  letter-spacing: -0.36px;
  color: #202020;
  margin-bottom: 4px;
`;

const DeliveryDate = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 14px;
  letter-spacing: -0.28px;
  color: #64748B;
  margin-left: 2px;
`;

const OrderNumber = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: -0.32px;
  text-align: right;
  color: #202020;
  margin-top: 8px;
`;

const Separator = styled.div`
  height: 1px;
  background-color: #E0E0E0;
  margin: 12px 0;
`;

const TrackingContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TrackingLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  background-color: #ECFDF5;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  margin-right: 12px;
`;

const CourierIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const TrackingDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CourierName = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.16px;
  color: #18181B;
`;

const TrackingRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const TrackingLabel = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: -0.16px;
  color: #18181B;
  margin-bottom: 8px;
`;

const TrackingNumberWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TrackingNumber = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: -0.16px;
  color: #64748B;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 12px 0 24px;
  align-items: center;
  padding: 8px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 5px;
  object-fit: cover;
  margin-right: 12px;
  @media (max-width: 768px) {
    width: 100%;
    height: 150px;
    margin-right: 0;
    margin-bottom: 12px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #202020;
  margin: 0 0 4px 0;
`;

const ItemPrice = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666666;
  margin: 0;
`;

const ItemSeparator = styled.div`
  height: 1px;
  background-color: #E0E0E0;
  margin: 12px 0 12px 92px;
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const SummaryContainer = styled.div`
  margin-top: 32px;
  background-color: #FFFFFF;
`;

const SummaryTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1C1129;
  line-height: 18px;
  letter-spacing: -0.2px;
  margin: 0 0 16px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SummaryLabel = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  color: #64748B;
  padding: 2px 0;
`;

const SummaryValue = styled.span`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #1C1129;
`;

const SummarySeparator = styled.div`
  height: 1px;
  background-color: #E0E0E0;
  margin: 12px 0;
`;

const SummaryLabelTotal = styled(SummaryLabel)`
  font-weight: 700;
  color: #090314;
`;

const SummaryValueTotal = styled(SummaryValue)`
  font-weight: 700;
  color: #090314;
`;

const ShippingContainer = styled.div`
  margin-top: 32px;
  background-color: #FFFFFF;
  padding: 8px 0;
`;

const ShippingTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1C1129;
  line-height: 18px;
  letter-spacing: -0.2px;
  margin: 0 0 12px 0;
`;

const ShippingAddress = styled.p`
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.02px;
  color: #1C1129;
  margin: 0 0 12px 0;
`;

const ReceiverInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const ReceiverName = styled.span`
  font-size: 12px;
  color: #000000;
  line-height: 16px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
`;

const ReceiverLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: -0.14px;
  font-family: 'Raleway', sans-serif;
  color: #202020;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 32px;
  margin-bottom: 20px;
  gap: 16px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RefundedButton = styled.button`
  flex: 1;
  height: 40px;
  border-radius: 9px;
  border: 1px solid #00BC7D;
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    background-color: #00BC7D;
    color: white;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CompletedButton = styled.button`
  flex: 1;
  height: 40px;
  border-radius: 9px;
  background-color: #00BC7D;
  border: none;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    background-color: #00A66E;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RefundedContainer = styled.div`
  margin: 20px 0;
  text-align: center;
`;

const RefundedText = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #D97474;
  margin: 0 0 8px 0;
`;

const RefundedReason = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666666;
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #D97474;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  text-align: center;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => (props.$visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1C1129;
  margin: 0 0 16px 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  background: #ECFDF5;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  resize: vertical;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #00BC7D;
  }

  &::placeholder {
    color: #999;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
`;

const ModalButton = styled.button`
  flex: 1;
  height: 40px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  ${props =>
    props.$variant === 'cancel'
      ? `
    border: 1px solid #00BC7D;
    background-color: transparent;
    color: #00BC7D;
    &:hover {
      background-color: #00BC7D;
      color: white;
    }
  `
      : `
    background-color: #00BC7D;
    border: none;
    color: #FFFFFF;
    &:hover {
      background-color: #00A66E;
    }
  `}
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Tracking Input Section — Hidden by default, shown only after clicking "Mark as Completed"
const TrackingInputSection = styled.div`
  margin: 40px 0;
  padding: 24px;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E0E0E0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #1C1129;
  margin: 0 0 20px 0;
  text-align: center;
`;

const InputWrapper = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: #202020;
  margin-bottom: 8px;
`;

const TextInput = styled.input`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
  font-family: 'Raleway', sans-serif;
  font-size: 16px;
  color: #333;
  background: #ECFDF5;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #00BC7D;
  }
`;

const ImageUploadArea = styled.div`
  margin: 20px 0;
`;

const UploadBox = styled.label`
  display: block;
  width: 140px;
  height: 140px;
  border: 2px dashed #00BC7D;
  border-radius: 14px;
  background: #F8FFFD;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0 auto;

  &:hover {
    background: #ECFDF5;
    border-color: #00A66E;
  }
`;

const UploadedPreview = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 14px;
  overflow: hidden;
  margin: 0 auto;
  border: 3px solid #00BC7D;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
`;

const Hint = styled.p`
  font-size: 13px;
  color: #666;
  text-align: center;
  margin-top: 12px;
  font-family: 'Raleway', sans-serif;
`;

const OrderDetails = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
const { formatCurrency } = useCurrency();
  const [order, setOrder] = useState(null);
  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Tracking input states
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [packageImage, setPackageImage] = useState(null);
  const [uploading, setUploading] = useState(false);
const [convertedSubtotal, setConvertedSubtotal] = useState('$0.00');
const [convertedShipping, setConvertedShipping] = useState('$0.00');
const [convertedTotal, setConvertedTotal] = useState('$0.00');
const [convertedItemPrices, setConvertedItemPrices] = useState({});
  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    }
  }, [location.state]);


  useEffect(() => {
  const convertPrices = async () => {
    if (!order) return;

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    let shippingOption;
    try {
      shippingOption = typeof order.shipping_option === 'string'
        ? JSON.parse(order.shipping_option)
        : order.shipping_option;
    } catch (e) {
      shippingOption = null;
    }
    
    const shippingCosts = shippingOption?.price ? parseFloat(shippingOption.price.replace('$', '')) || 0 : 0;
    const total = subtotal + shippingCosts;

    // Convert all prices
    const convertedSub = await formatCurrency(subtotal);
    const convertedShip = await formatCurrency(shippingCosts);
    const convertedTot = await formatCurrency(total);

    setConvertedSubtotal(convertedSub);
    setConvertedShipping(convertedShip);
    setConvertedTotal(convertedTot);

    // Convert individual item prices
    const itemPrices = {};
    for (const item of order.items) {
      const converted = await formatCurrency(item.price);
      itemPrices[item.id] = converted;
    }
    setConvertedItemPrices(itemPrices);
  };

  convertPrices();
}, [order, formatCurrency]);
  const handleCopyTrackingNumber = () => {
    const trackingNumberToCopy = order?.tracking_number || 'N/A';
if (trackingNumberToCopy !== 'N/A') {  // ✅ Correct
  navigator.clipboard.writeText(trackingNumberToCopy);
      alert('Tracking number copied!');
    } else {
      alert('No tracking number available');
    }
  };

  const handleMarkAsRefunded = () => {
    if (!order?.payment_intent_id) {
      alert('No payment intent ID found');
      return;
    }
    setIsRefundModalVisible(true);
  };

  const handleRefundSubmit = async () => {
    if (!refundReason.trim()) {
      alert('Please enter a refund reason');
      return;
    }
    setLoading(true);
    try {
      // Your refund logic here
      alert('Refund processed');
      setIsRefundModalVisible(false);
      setRefundReason('');
    } catch (err) {
      alert('Refund failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTracking = () => {
    if (order?.delivery_status !== 'processing') {
      alert('Order is not in processing status');
      return;
    }
    setShowTrackingInput(true);
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB');
        return;
      }
      setPackageImage(file);
    }
  };

  const removeImage = () => setPackageImage(null);

 const handleTrackingSubmit = async () => {
  if (!trackingNumber.trim()) {
    alert('Please enter tracking number');
    return;
  }
  if (!packageImage) {
    alert('Please upload package image');
    return;
  }

  setUploading(true);
  try {
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(packageImage);
    });

    const fileName = `package_${order.id}_${Date.now()}.jpg`;
    
    const command = new PutObjectCommand({
      Bucket: CONTABO_BUCKET_NAME,
      Key: `public/${fileName}`,
      Body: arrayBuffer,
      ContentType: packageImage.type,
      ACL: 'public-read',
    });

    await s3Client.send(command);
    
    const imageUrl = `${CONTABO_ENDPOINT}/${CONTABO_BUCKET_NAME}/public/${fileName}`;

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        delivery_status: 'shipped',
        tracking_number: trackingNumber.trim(),
        package_image_url: imageUrl,
      })
      .eq('id', order.id);

    if (updateError) throw updateError;

    alert('Order marked as shipped!');
    
    // Update local state
    setOrder(prev => ({
      ...prev,
      delivery_status: 'shipped',
      tracking_number: trackingNumber.trim(),
      package_image_url: imageUrl,
    }));

    // Reset form
    setShowTrackingInput(false);
    setTrackingNumber('');
    setPackageImage(null);
    
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to update tracking: ' + err.message);
  } finally {
    setUploading(false);
  }
};

  if (!order) {
    return (
      <PageContainer>
        <VendorHeader profile={profile} />
        <Container>
          <ErrorContainer>
            <ErrorText>Failed to load order details</ErrorText>
          </ErrorContainer>
        </Container>
      </PageContainer>
    );
  }

  const createdDate = new Date(order.created_at);
  const deliveryDate = new Date(createdDate);
  deliveryDate.setDate(createdDate.getDate() + 7);
  const formattedDeliveryDate = deliveryDate.toISOString().split('T')[0];

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let shippingOption;
  try {
    shippingOption = typeof order.shipping_option === 'string'
      ? JSON.parse(order.shipping_option)
      : order.shipping_option;
  } catch (e) {
    shippingOption = null;
  }

  const courierName = shippingOption?.name || 'InPost';
  const shippingCosts = shippingOption?.price ? parseFloat(shippingOption.price.replace('$', '')) || 0 : 0;
  const trackingNumberVal = shippingOption?.tracking_number || order.tracking_number || 'N/A';
  const total = subtotal + shippingCosts;

  const userAddress = order.profiles || order.shipping_address || {};
  const addressParts = [
    userAddress.line1 || userAddress.address_line1,
    userAddress.line2 || userAddress.address_line2,
    userAddress.city,
    userAddress.state,
    userAddress.postal_code || userAddress.zip_code,
    userAddress.country,
  ].filter(Boolean);

  const formattedAddress = addressParts.length > 0
    ? addressParts.join(', ')
    : 'No shipping address available';

  const receiverName = userAddress.first_name && userAddress.last_name
    ? `${userAddress.first_name} ${userAddress.last_name}`
    : 'N/A';

  const isRefunded = order.status === 'cancelled' && order.delivery_status === 'failed';

  const statusToProgress = {
    processing: 25,
    shipped: 50,
    delivered: 99,
    failed: 0,
  };

  const progress = statusToProgress[order.delivery_status] || 0;
  const isProcessingActive = progress >= 0 && order.delivery_status !== 'failed';
  const isShippedActive = progress >= 33 && order.delivery_status !== 'failed';
  const isDeliveredActive = progress >= 66 && order.delivery_status !== 'failed';
  const isProcessing = order.delivery_status === 'processing';

  return (
  <PageContainer>
    <VendorHeader profile={profile} />
    <Container>
      <Header>
        <HeaderTitle>{t('OrderDetails')}</HeaderTitle>
      </Header>

      {/* Progress Bar */}
      <ProgressBarContainer>
        {isProcessingActive && (
          <CloudContainer $position="start">
            <CloudBubble>
              <CloudText>{t('Processing')}</CloudText>
            </CloudBubble>
            <CloudTail />
          </CloudContainer>
        )}
        {isShippedActive && (
          <CloudContainer $position="middle">
            <CloudBubble>
              <CloudText>{t('Shipped')}</CloudText>
            </CloudBubble>
            <CloudTail />
          </CloudContainer>
        )}
        {isDeliveredActive && (
          <CloudContainer $position="end">
            <CloudBubble>
              <CloudText>{t('Delivered')}</CloudText>
            </CloudBubble>
            <CloudTail />
          </CloudContainer>
        )}

        <ProgressBackgroundShadow />
        <CircleShadow style={{ left: 0, transform: 'translate(9px, -19px)' }} />
        <CircleShadow style={{ left: '50%', transform: 'translate(-2.5px, -20px)' }} />
        <CircleShadow style={{ right: 0, transform: 'translate(-9.5px, -19px)' }} />

        <ProgressTrack>
          <ProgressBackground />
          <ProgressFill $progress={progress} />
          <CircleContainer style={{ left: 0 }} />
          <CircleContainer style={{ left: '50%', transform: 'translate(-12px, -12px) translateX(17px)' }} />
          <CircleContainer style={{ right: 0 }} />
          <CircleWrapper style={{ left: 0 }}>
            <Circle $active={isProcessingActive} />
          </CircleWrapper>
          <CircleWrapper style={{ left: '50%', transform: 'translate(-12px, -12px) translateX(17px)' }}>
            <Circle $active={isShippedActive} />
          </CircleWrapper>
          <CircleWrapper style={{ right: 0 }}>
            <Circle $active={isDeliveredActive} />
          </CircleWrapper>
        </ProgressTrack>
      </ProgressBarContainer>

      <OrderInfo>
        <ArrivalContainer>
          <ArrivalLabel>{t('ArrivalTime')}</ArrivalLabel>
          <DeliveryDate>{formattedDeliveryDate}</DeliveryDate>
        </ArrivalContainer>
        <OrderNumber>{t('Order')} #{order.id}</OrderNumber>
      </OrderInfo>
      <Separator />

      {/* Tracking Info (if shipped) */}
      {order.delivery_status === 'shipped' && (
        <>
          <TrackingContainer>
            <TrackingLeft>
              <IconContainer>
                <CourierIcon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300BC7D'%3E%3Cpath d='M18 18.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m1.5-9l1.96 2.5L17 12V9m-11 9.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2v-5l-3-4z'/%3E%3C/svg%3E" alt={t('Courier')} />
              </IconContainer>
              <TrackingDetails>
                <CourierName>{courierName}</CourierName>
              </TrackingDetails>
            </TrackingLeft>
            <TrackingRight>
              <TrackingLabel>{t('TrackingNumber')}</TrackingLabel>
              <TrackingNumberWrapper>
                <TrackingNumber>{trackingNumberVal}</TrackingNumber>
                <CopyButton onClick={handleCopyTrackingNumber}>
                  <IoCopyOutline size={16} color="#00BC7D" />
                </CopyButton>
              </TrackingNumberWrapper>
            </TrackingRight>
          </TrackingContainer>
          <Separator />
        </>
      )}

      {/* Items */}
      {order.items.map((item, index) => (
        <div key={index}>
          <ItemContainer>
            <ItemImage
              src={item.image_url || 'https://via.placeholder.com/80'}
              alt={item.description || t('Product')}
            />
            <ItemDetails>
              <ItemName>{item.description || t('ProductName')}</ItemName>
              <ItemPrice>
                {t('Price')}: {convertedItemPrices[item.id] || `$${item.price.toFixed(2)}`} • {t('Qty')}: {item.quantity}
              </ItemPrice>
            </ItemDetails>
          </ItemContainer>
          {index < order.items.length - 1 && <ItemSeparator />}
        </div>
      ))}

      <SummaryContainer>
        <SummaryTitle>{t('OrderSummary')}</SummaryTitle>
        <SummaryRow>
          <SummaryLabel>{t('Subtotal')}</SummaryLabel>
          <SummaryValue>{convertedSubtotal}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>{t('CourierName')}</SummaryLabel>
          <SummaryValue>{courierName}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>{t('TrackingNumber')}</SummaryLabel>
          <SummaryValue>{trackingNumberVal}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>{t('ShippingCosts')}</SummaryLabel>
          <SummaryValue>{convertedShipping}</SummaryValue>
        </SummaryRow>

        <SummarySeparator />
        <SummaryRow>
          <SummaryLabelTotal>{t('Total')}</SummaryLabelTotal>
          <SummaryValueTotal>{convertedTotal}</SummaryValueTotal>
        </SummaryRow>
      </SummaryContainer>

      <ShippingContainer>
        <ShippingTitle>{t('ShippingAddress')}</ShippingTitle>
        <ShippingAddress>{formattedAddress}</ShippingAddress>
        <ReceiverInfo>
          <ArrivalContainer>
            <ReceiverName>{t('Receiver')}</ReceiverName>
            <ReceiverLabel>{receiverName}</ReceiverLabel>
          </ArrivalContainer>
        </ReceiverInfo>
      </ShippingContainer>

      {/* TRACKING INPUT FORM */}
      {showTrackingInput && (
        <TrackingInputSection>
          <SectionTitle>{t('MarkOrderAsShipped')}</SectionTitle>
          <InputWrapper>
            <Label>{t('TrackingNumber')} *</Label>
            <TextInput
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t('EnterTrackingNumber')}
            />
          </InputWrapper>

          <ImageUploadArea>
            <Label>{t('PackagePhotoRequired')}</Label>
            {packageImage ? (
              <UploadedPreview>
                <img
                  src={URL.createObjectURL(packageImage)}
                  alt={t('Package')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <RemoveBtn onClick={removeImage}>×</RemoveBtn>
              </UploadedPreview>
            ) : (
              <UploadBox htmlFor="package-image">
                <IoCopyOutline size={32} color="#00BC7D" style={{ transform: 'rotate(45deg)', marginBottom: 8 }} />
                <span style={{ fontSize: 14, color: '#666' }}>{t('ClickToUploadPhoto')}</span>
                <input
                  id="package-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  style={{ display: 'none' }}
                />
              </UploadBox>
            )}
            <Hint>{t('PackagePhotoHint')}</Hint>
          </ImageUploadArea>

          <ButtonContainer>
            <CancelButton onClick={() => setShowTrackingInput(false)} disabled={uploading}>
              {t('Cancel')}
            </CancelButton>
            <CompletedButton onClick={handleTrackingSubmit} disabled={uploading || !trackingNumber || !packageImage}>
              {uploading ? t('Submitting') : t('ConfirmShipment')}
            </CompletedButton>
          </ButtonContainer>
        </TrackingInputSection>
      )}

      {!isRefunded && !showTrackingInput && order.delivery_status === 'processing' && (
        <ButtonContainer>
          <RefundedButton onClick={handleMarkAsRefunded} disabled={loading}>
            {t('MarkAsRefunded')}
          </RefundedButton>
          <CompletedButton onClick={handleStartTracking} disabled={loading}>
            {t('MarkAsCompleted')}
          </CompletedButton>
        </ButtonContainer>
      )}

      {isRefunded && (
        <RefundedContainer>
          <RefundedText>{t('OrderRefundedAndCancelled')}</RefundedText>
          {order.refund_reason && (
            <RefundedReason>{t('Reason')}: {order.refund_reason}</RefundedReason>
          )}
        </RefundedContainer>
      )}
    </Container>

    {/* Refund Modal */}
    <Modal $visible={isRefundModalVisible}>
      <ModalContent>
        <ModalTitle>{t('EnterRefundReason')}</ModalTitle>
        <TextArea
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          placeholder={t('RefundReasonPlaceholder')}
        />
        <ModalButtons>
          <ModalButton $variant="cancel" onClick={() => setIsRefundModalVisible(false)}>
            {t('Cancel')}
          </ModalButton>
          <ModalButton onClick={handleRefundSubmit} disabled={loading}>
            {t('Submit')}
          </ModalButton>
        </ModalButtons>
      </ModalContent>
    </Modal>
  </PageContainer>
);
};

export default OrderDetails;