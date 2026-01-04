import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, CONTABO_BUCKET_NAME, CONTABO_ENDPOINT, CONTABO_TENANT_ID } from '../../lib/constants';
import { 
  IoAddCircleOutline, 
  IoCloseCircle, 
  IoRemove, 
  IoAdd, 
  IoTrashOutline,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
  IoDuplicateOutline
} from 'react-icons/io5';
import VendorHeader from '../../components/VendorHeader';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FA;
`;

const Container = styled.div`
  padding: 80px 16px 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  margin: 0;
  color: #202020;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  margin: 0;
  color: #666;
`;

const BulkAddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #E8E8E8;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  cursor: pointer;
  transition: all 0.3s ease;
  
  svg {
    font-size: 20px;
  }
  
  &:hover {
    border-color: #00BC7D;
    background: #D0FAE5;
  }
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #333;
  margin: 0 0 16px 0;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #333;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  background: #ECFDF5;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  box-sizing: border-box;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
  
  &:disabled {
    background: #F5F5F5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: #ECFDF5;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  background: #ECFDF5;
  border-radius: 10px;
  padding: 0 12px;
  gap: 12px;
`;

const PriceButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #00BC7D;
    color: white;
  }
  
  svg {
    font-size: 20px;
  }
`;

const PriceInput = styled(Input)`
  background: transparent;
  text-align: center;
  flex: 1;
  
  &:focus {
    box-shadow: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const OptionButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid ${props => props.$selected ? '#00BC7D' : '#ECFDF5'};
  background: ${props => props.$selected ? '#00BC7D' : '#ECFDF5'};
  color: ${props => props.$selected ? 'white' : '#666'};
  font-size: 14px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #00BC7D;
    ${props => !props.$selected && 'background: #D0FAE5;'}
  }
`;

const DimensionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const Select = styled.select`
  width: 100%;
  background: #ECFDF5;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
  
  &:disabled {
    background: #F5F5F5;
    cursor: not-allowed;
  }
`;

const ImagePickerSection = styled.div`
  margin-bottom: 20px;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`;

const ImageBox = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 10px;
  background: #E0E0E0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ImagePreview = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AddImageBox = styled(ImageBox)`
  background: #ECFDF5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #00BC7D;
  
  &:hover {
    background: #D0FAE5;
  }
`;

const AddImageContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const AddImageIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  svg {
    font-size: 20px;
    color: #666;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: #FF3333;
    color: white;
  }
  
  svg {
    font-size: 20px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const CourierFormContainer = styled.div`
  border-bottom: 1px solid #E4E4E7;
  padding-bottom: 20px;
  margin-bottom: 20px;
  position: relative;
`;

const RemoveCourierButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
  background: #FFEBEE;
  color: #D32F2F;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  transition: all 0.2s ease;
  
  &:hover {
    background: #D32F2F;
    color: white;
  }
  
  svg {
    font-size: 16px;
  }
`;

const ArrivalDaysContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DashText = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
`;

const HintText = styled.p`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 5px 0 0 0;
`;

const ShippingCostContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #00BC7D;
`;

const CheckboxLabel = styled.span`
  font-size: 13px;
  font-family: 'Raleway', sans-serif;
  color: #333;
`;

const AddCourierButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ECFDF5;
    border-color: #00BC7D;
  }
  
  svg {
    font-size: 20px;
    color: #B5B5B5;
  }
  
  span {
    font-size: 14px;
    font-weight: 600;
    font-family: 'Raleway', sans-serif;
    color: #B5B5B5;
  }
`;

const ImageCarouselSection = styled.div`
  margin-bottom: 24px;
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  margin-bottom: 16px;
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: ${props => props.$active ? 'block' : 'none'};
`;

const CarouselButton = styled.button`
  position: absolute;
  top: 50%;
  ${props => props.$direction === 'left' ? 'left: 16px;' : 'right: 16px;'}
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 24px;
    color: #333;
  }
`;

const PaginationDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const Dot = styled.div`
  width: ${props => props.$active ? '20px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background: ${props => props.$active ? '#00BC7D' : '#E0E0E0'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.$active ? '#00BC7D' : '#B0B0B0'};
  }
`;

const ColorSelectionContainer = styled.div`
  margin-bottom: 24px;
`;

const ColorGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ColorButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ColorCircle = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  border: ${props => props.$color === '#FFFFFF' ? '1px solid #E0E0E0' : 'none'};
`;

const CheckIcon = styled(IoCheckmarkCircle)`
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 20px;
  color: #00BC7D;
  background: white;
  border-radius: 50%;
`;

const SizeSelectionContainer = styled.div`
  margin-bottom: 24px;
`;

const SizeTypeButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: flex-end;
`;

const SizeTypeButton = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: ${props => props.$selected ? '2px solid #00BC7D' : '2px solid transparent'};
  background: ${props => props.$bgColor || '#D0FAE5'};
  color: #202020;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const SizeButtonsContainer = styled.div`
  background: #ECFDF5;
  border-radius: 20px;
  padding: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const SizeButton = styled.button`
  min-width: 44px;
  height: 44px;
  padding: 0 12px;
  border-radius: 50%;
  border: ${props => props.$selected ? '2px solid #00BC7D' : 'none'};
  background: ${props => props.$selected ? 'white' : 'transparent'};
  color: ${props => props.$selected ? '#00BC7D' : '#B0B0B0'};
  font-size: 13px;
  font-weight: 800;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    color: #00BC7D;
  }
`;

const QuantitySection = styled.div`
  margin-bottom: 24px;
`;

const QuantityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const QuantityItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
`;

const QuantityLabel = styled.span`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  color: #333;
`;

const QuantityInput = styled.input`
  width: 80px;
  background: #ECFDF5;
  border: none;
  border-radius: 10px;
  padding: 8px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  text-align: center;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 188, 125, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #FFEBEE;
  color: #D32F2F;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  text-align: center;
`;

const MessageBox = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const MessageTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 12px 0;
`;

const MessageText = styled.p`
  font-size: 16px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0 0 24px 0;
`;

const ActionButton = styled.button`
  padding: 12px 32px;
  background: #00BC7D;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #00A86B;
  }
`;

const SizeInfoText = styled.p`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #333;
  text-align: center;
  padding: 20px;
  background: #ECFDF5;
  border-radius: 10px;
  margin: 0;
`;

const AddProduct = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Prerequisite checks
  const [hasStore, setHasStore] = useState(null);
  const [hasStripeAccount, setHasStripeAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [gender, setGender] = useState('Unisex');
  const [condition, setCondition] = useState('New');
  const [discount, setDiscount] = useState('None');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [weight, setWeight] = useState('');
  
  // Category state
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  // Image state
  const [imageData, setImageData] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Shipping state
  const [couriers, setCouriers] = useState([{
    id: Date.now().toString(),
    name: '',
    minDays: '',
    maxDays: '',
    returnMinDays: '',
    returnMaxDays: '',
    price: '',
    isFreeShipping: false,
  }]);
  
  // Flash sale
  const [flashSaleId, setFlashSaleId] = useState(null);
  
  // Color and size options
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#008000' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Pink', hex: '#FFC1CC' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Teal', hex: '#008080' },
    { name: 'Magenta', hex: '#FF00FF' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Olive', hex: '#808000' },
    { name: 'Turquoise', hex: '#40E0D0' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Silver', hex: '#C0C0C0' },
  ];
  
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const shoeSizes = ['5', '6', '7', '8', '9', '10'];
  
  const fileInputRef = useRef(null);
  const isFreePlan = profile?.subscription?.plan_name === 'free';
  
  // Check prerequisites
  useEffect(() => {
    const checkStoreAndStripe = async () => {
      if (!profile?.id) {
        setHasStore(false);
        setHasStripeAccount(false);
        return;
      }

      try {
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('vendor_id', profile.id)
          .single();

        if (storeError && storeError.code !== 'PGRST116') {
          console.error('Error checking store:', storeError);
          setHasStore(false);
          setHasStripeAccount(false);
          return;
        }

        setHasStore(!!storeData);

        const { data: stripeData, error: stripeError } = await supabase
          .from('vendor_stripe_accounts')
          .select('stripe_account_id')
          .eq('vendor_id', profile.id)
          .maybeSingle();

        if (stripeError) {
          console.error('Error checking Stripe account:', stripeError);
          setHasStripeAccount(false);
          return;
        }

        const isValidAccount =
          stripeData?.stripe_account_id &&
          stripeData.stripe_account_id.startsWith('acct_');
        setHasStripeAccount(isValidAccount);
      } catch (error) {
        console.error('Unexpected error:', error);
        setHasStore(false);
        setHasStripeAccount(false);
      }
    };

    checkStoreAndStripe();
  }, [profile]);
  
  // Fetch categories and flash sale
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error) setCategories(data);
    };

    const fetchActiveFlashSale = async () => {
      const { data, error } = await supabase
        .from('flash_sales')
        .select('id')
        .lte('start_time', 'now()')
        .gte('end_time', 'now()')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setFlashSaleId(data.id);
      }
    };

    fetchCategories();
    fetchActiveFlashSale();
  }, []);
  
  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (category) {
        const { data, error } = await supabase
          .from('subcategories')
          .select('*')
          .eq('category_id', parseInt(category));
        
        if (!error) {
          setSubcategories(data || []);
        } else {
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
        setSubcategory('');
      }
    };

    fetchSubcategories();
  }, [category]);
  
  // Image handling
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Please select a JPEG or PNG image.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit');
      return;
    }
    
    if (imageData.length >= 4) {
      alert('Maximum 4 images allowed');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: `image_${Date.now()}`,
        file: file,
        uri: e.target.result,
        color: null,
        sizes: [],
        sizeType: 'Clothing',
      };
      setImageData([...imageData, newImage]);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveImage = (index) => {
    const newImageData = imageData.filter((_, i) => i !== index);
    setImageData(newImageData);
    if (currentImageIndex >= newImageData.length && newImageData.length > 0) {
      setCurrentImageIndex(newImageData.length - 1);
    }
  };
  
  // Price handlers
  const incrementPrice = () => {
    setProductPrice(prev => prev + 1);
  };
  
  const decrementPrice = () => {
    setProductPrice(prev => Math.max(0, prev - 1));
  };
  
  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setProductPrice(value ? parseInt(value) : 0);
  };
  
  // Courier handlers
  const handleCourierChange = (index, field, value) => {
    const updated = [...couriers];
    if (field === 'isFreeShipping') {
      updated[index] = {
        ...updated[index],
        isFreeShipping: value,
        price: value ? '0.00' : updated[index].price || '',
      };
    } else {
      const numericValue = field !== 'name' ? value.replace(/[^0-9.]/g, '') : value;
      updated[index] = {
        ...updated[index],
        [field]: numericValue,
      };
    }
    setCouriers(updated);
  };
  
  const handleAddCourier = () => {
    setCouriers([...couriers, {
      id: Date.now().toString(),
      name: '',
      minDays: '',
      maxDays: '',
      returnMinDays: '',
      returnMaxDays: '',
      price: '',
      isFreeShipping: false,
    }]);
  };
  
  const handleRemoveCourier = (index) => {
    if (couriers.length === 1) {
      alert('At least one courier is required');
      return;
    }
    
    const courierName = couriers[index].name || 'New Courier';
    if (window.confirm(`Are you sure you want to remove "${courierName}"?`)) {
      setCouriers(couriers.filter((_, i) => i !== index));
    }
  };
  
  // Color/Size handlers for current image
  const handleColorSelect = (colorName) => {
    if (imageData.length === 0) return;
    
    const updated = [...imageData];
    updated[currentImageIndex].color = colorName;
    setImageData(updated);
  };
  
  const handleSizeTypeChange = (type) => {
    if (imageData.length === 0) return;
    
    const updated = [...imageData];
    updated[currentImageIndex].sizeType = type;
    
    if (type === 'None') {
      updated[currentImageIndex].sizes = [{ size: 'Standard', quantity: 1 }];
    } else {
      updated[currentImageIndex].sizes = [];
    }
    
    setImageData(updated);
  };
  
  const handleSizeToggle = (size) => {
    if (imageData.length === 0) return;
    
    const updated = [...imageData];
    const currentSizes = updated[currentImageIndex].sizes || [];
    
    const isSelected = currentSizes.some(s => s.size === size);
    
    if (isSelected) {
      updated[currentImageIndex].sizes = currentSizes.filter(s => s.size !== size);
    } else {
      updated[currentImageIndex].sizes = [...currentSizes, { size, quantity: 1 }];
    }
    
    setImageData(updated);
  };
  
  const handleQuantityChange = (size, value) => {
    if (imageData.length === 0) return;
    
    const numericValue = value.replace(/[^0-9]/g, '');
    const quantity = numericValue === '' ? '' : Math.max(1, parseInt(numericValue));
    
    const updated = [...imageData];
    updated[currentImageIndex].sizes = updated[currentImageIndex].sizes.map(s =>
      s.size === size ? { ...s, quantity } : s
    );
    
    setImageData(updated);
  };
  
  // Image navigation
  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  
  const goToNextImage = () => {
    if (currentImageIndex < imageData.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  
  // Upload image to S3
  const uploadImageToS3 = async (file, path) => {
    try {
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });

      const fileName = `${path.split('/').pop()}-${Date.now()}.jpg`;

      const command = new PutObjectCommand({
        Bucket: CONTABO_BUCKET_NAME,
        Key: `public/${fileName}`,
        Body: arrayBuffer,
        ContentType: file.type,
        ACL: 'public-read',
      });

      await s3Client.send(command);

      const publicUrl = `${CONTABO_ENDPOINT}/${CONTABO_TENANT_ID}:${CONTABO_BUCKET_NAME}/public/${fileName}`;
      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };
  
  // Validation
  const validateForm = () => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return false;
    }
    
    if (!productPrice || productPrice <= 0) {
      alert('Please enter a valid price');
      return false;
    }
    
    if (!category) {
      alert('Please select a category');
      return false;
    }
    
    if (!subcategory) {
      alert('Please select a subcategory');
      return false;
    }
    
    if (!condition) {
      alert('Please select a condition');
      return false;
    }
    
    if (!length || !width || !weight) {
      alert('Please fill in all dimension fields (length, width, weight)');
      return false;
    }
    
    const lengthNum = parseFloat(length);
    const widthNum = parseFloat(width);
    const weightNum = parseFloat(weight);
    
    if (lengthNum <= 0 || widthNum <= 0 || weightNum <= 0) {
      alert('Dimensions must be greater than 0');
      return false;
    }
    
    const hasCustomCarrier = couriers.some(c => c.name?.trim());
    if (!hasCustomCarrier && (lengthNum > 41 || widthNum > 38 || weightNum > 25)) {
      alert('Dimensions exceed limits. Please add a custom shipping option.');
      return false;
    }
    
    if (imageData.length === 0) {
      alert('Please add at least one image');
      return false;
    }
    
    // Validate all images have color and sizes
    for (let i = 0; i < imageData.length; i++) {
      const img = imageData[i];
      
      if (!img.color) {
        alert(`Please select a color for image ${i + 1}`);
        return false;
      }
      
      if (img.sizeType !== 'None' && (!img.sizes || img.sizes.length === 0)) {
        alert(`Please select at least one size for image ${i + 1}`);
        return false;
      }
      
      if (img.sizes) {
        for (const size of img.sizes) {
          if (!size.quantity || size.quantity <= 0) {
            alert(`Please enter a valid quantity for size ${size.size} in image ${i + 1}`);
            return false;
          }
        }
      }
    }
    
    // Validate couriers
    const validCouriers = couriers.filter(c => c.name?.trim());
    for (const courier of validCouriers) {
      const minDays = parseInt(courier.minDays);
      const maxDays = parseInt(courier.maxDays);
      
      if (isNaN(minDays) || isNaN(maxDays)) {
        alert(`Please enter valid delivery days for courier "${courier.name}"`);
        return false;
      }
      
      if (minDays > maxDays) {
        alert(`Min days cannot be greater than max days for courier "${courier.name}"`);
        return false;
      }
      
      if (courier.returnMinDays && courier.returnMaxDays) {
        const returnMin = parseInt(courier.returnMinDays);
        const returnMax = parseInt(courier.returnMaxDays);
        
        if (returnMin > returnMax) {
          alert(`Return min days cannot be greater than return max days for courier "${courier.name}"`);
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Check product limit for free plan
      if (isFreePlan) {
        const { data: productCount, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('vendor_id', profile.id);
        
        if (countError) throw countError;
        
        if (productCount.length >= 10) {
          alert('You have reached the free plan limit of 10 products. Please upgrade to add more.');
          setLoading(false);
          return;
        }
      }
      
      // Upload primary image
      const primaryImageUrl = await uploadImageToS3(
        imageData[0].file,
        `products/${profile.id}/${productName}`
      );
      
      // Calculate total stock
      const totalStock = imageData.reduce((sum, img) => 
        sum + (img.sizes?.reduce((qty, s) => qty + (parseInt(s.quantity) || 0), 0) || 0), 0
      );
      
      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: productName,
          description: description || null,
          price: parseFloat(productPrice),
          image_url: primaryImageUrl,
          category_id: parseInt(category),
          subcategory_id: parseInt(subcategory),
          gender: gender || null,
          material: material || null,
          condition,
          stock_quantity: totalStock,
          vendor_id: profile.id,
          length: parseFloat(length),
          width: parseFloat(width),
          weight: parseFloat(weight),
          color: imageData.map(img => img.color).filter(Boolean),
          size: imageData.flatMap(img => img.sizes?.map(s => s.size) || []).filter(Boolean),
        })
        .select()
        .single();
      
      if (productError) throw productError;
      
      // Add to flash sale if discount applied
      if (discount !== 'None' && flashSaleId) {
        const { error: flashSaleError } = await supabase
          .from('flash_sale_products')
          .insert({
            flash_sale_id: flashSaleId,
            product_id: product.id,
            discount_percentage: parseInt(discount),
          });
        
        if (flashSaleError) console.error('Flash sale error:', flashSaleError);
      }
      
      // Insert shipping options
      const validCouriers = couriers.filter(c => c.name?.trim());
      
      if (validCouriers.length > 0) {
        for (const courier of validCouriers) {
          await supabase.from('shipping_options').insert({
            name: courier.name,
            min_days: parseInt(courier.minDays),
            max_days: parseInt(courier.maxDays),
            return_min_days: courier.returnMinDays ? parseInt(courier.returnMinDays) : null,
            return_max_days: courier.returnMaxDays ? parseInt(courier.returnMaxDays) : null,
            price: parseFloat(courier.price),
            vendor_id: profile.id,
            product_id: product.id,
            is_admin_default: false,
          });
        }
      } else {
        // Add default InPost if no custom couriers
        const { data: existingDefault } = await supabase
          .from('shipping_options')
          .select('name')
          .is('product_id', null)
          .is('vendor_id', null)
          .eq('name', 'InPost')
          .eq('is_admin_default', true);
        
        if (!existingDefault?.length) {
          await supabase.from('shipping_options').insert({
            name: 'InPost',
            min_days: 5,
            max_days: 7,
            price: 3.00,
            vendor_id: null,
            product_id: null,
            is_admin_default: true,
            return_min_days: 3,
            return_max_days: 10,
          });
        }
      }
      
      // Insert product variations
      for (const img of imageData) {
        const variationImageUrl = await uploadImageToS3(
          img.file,
          `products/${profile.id}/${productName}-${img.color}`
        );
        
        const sizesToInsert = img.sizes || [];
        
        for (const size of sizesToInsert) {
          await supabase.from('product_variations').insert({
            product_id: product.id,
            size: size.size,
            color: img.color,
            material: material || null,
            stock_quantity: parseInt(size.quantity) || 1,
            img: variationImageUrl,
          });
        }
      }
      
      alert('Product added successfully!');
      navigate('/vendor/inventory');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to add product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Get current size options based on size type
  const getCurrentSizeOptions = () => {
    if (imageData.length === 0) return [];
    const currentImage = imageData[currentImageIndex];
    if (!currentImage) return [];
    
    if (currentImage.sizeType === 'Shoes') return shoeSizes;
    if (currentImage.sizeType === 'None') return [];
    return clothingSizes;
  };
  
  const currentSizeOptions = getCurrentSizeOptions();
  const currentImage = imageData[currentImageIndex];
  
  // Loading state
  if (hasStore === null || hasStripeAccount === null) {
    return (
      <PageContainer>
        <VendorHeader profile={profile} />
        <Container>
          <MessageBox>
            <MessageTitle>Loading...</MessageTitle>
          </MessageBox>
        </Container>
      </PageContainer>
    );
  }
  
  // No store message
  if (!hasStore) {
    return (
      <PageContainer>
        <VendorHeader profile={profile} />
        <Container>
          <MessageBox>
            <MessageTitle>No Store Found</MessageTitle>
            <MessageText>
              You need to create a store before adding products.
            </MessageText>
            <ActionButton onClick={() => navigate('/vendor/CreateStore')}>
              Create Your Store
            </ActionButton>
          </MessageBox>
        </Container>
      </PageContainer>
    );
  }
  
  // No Stripe account message
  if (!hasStripeAccount) {
    return (
      <PageContainer>
        <VendorHeader profile={profile} />
        <Container>
          <MessageBox>
            <MessageTitle>No Stripe Account Linked</MessageTitle>
            <MessageText>
              You need to link your Stripe account before adding products.
            </MessageText>
            <ActionButton onClick={() => navigate('/vendor/payout-settings')}>
              Link Stripe Account
            </ActionButton>
          </MessageBox>
        </Container>
      </PageContainer>
    );
  }
  
  return (
  <PageContainer>
    <VendorHeader profile={profile} />
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>{t('PostYourProduct')}</PageTitle>
          <PageSubtitle>{t('AddAtLeastOneListing')}</PageSubtitle>
        </HeaderLeft>
        {!isFreePlan && (
          <BulkAddButton onClick={() => navigate('/vendor/bulk-add')}>
            <IoDuplicateOutline />
            {t('BulkAdd')}
          </BulkAddButton>
        )}
      </Header>

      {/* Image Upload Section */}
      <FormSection>
        <SectionTitle>{t('Photos')}</SectionTitle>
        <PageSubtitle style={{ marginBottom: '16px' }}>{t('AddPhotosUpTo4')}</PageSubtitle>
        
        <ImagePickerSection>
          <ImageGrid>
            {imageData.map((img, index) => (
              <ImageBox key={img.id}>
                <ImagePreview src={img.uri} alt={`Product ${index + 1}`} />
                <RemoveImageButton onClick={() => handleRemoveImage(index)}>
                  <IoCloseCircle />
                </RemoveImageButton>
              </ImageBox>
            ))}
            
            {imageData.length < 4 && (
              <AddImageBox onClick={() => fileInputRef.current?.click()}>
                <AddImageContent>
                  <AddImageIcon>
                    <IoAddCircleOutline />
                  </AddImageIcon>
                </AddImageContent>
              </AddImageBox>
            )}
            
            {Array.from({ length: Math.max(0, 3 - imageData.length) }).map((_, i) => (
              <ImageBox key={`placeholder-${i}`} style={{ opacity: 0.3 }} />
            ))}
          </ImageGrid>
        </ImagePickerSection>
        
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleImageSelect}
        />
      </FormSection>

      {/* Product Details Section */}
      <FormSection>
        <SectionTitle>{t('ProductDetails')}</SectionTitle>
        
        <InputGroup>
          <Label>{t('ProductName')} *</Label>
          <Input
            type="text"
            placeholder={t('EnterProductName')}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </InputGroup>
        
        <InputGroup>
          <Label>{t('DiscountOptional')}</Label>
          <ButtonGroup>
            {['None', '10', '20', '30', '40', '50'].map(opt => (
              <OptionButton
                key={opt}
                $selected={discount === opt}
                onClick={() => setDiscount(opt)}
              >
                {opt === 'None' ? t('None') : `${opt}%`}
              </OptionButton>
            ))}
          </ButtonGroup>
        </InputGroup>
        
        <InputGroup>
          <Label>{t('ProductPrice')} *</Label>
          <PriceContainer>
            <PriceButton onClick={decrementPrice}>
              <IoRemove />
            </PriceButton>
            <PriceInput
              type="text"
              value={`${productPrice}`}
              onChange={handlePriceChange}
              placeholder={t('PricePlaceholder')}
            />
            <PriceButton onClick={incrementPrice}>
              <IoAdd />
            </PriceButton>
          </PriceContainer>
        </InputGroup>
        
        <InputGroup>
          <Label>{t('Description')}</Label>
          <TextArea
            placeholder={t('DescriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </InputGroup>
        
        <InputGroup>
          <Label>{t('ProductDimensions')} *</Label>
          <DimensionsContainer>
            <Input
              type="number"
              placeholder={t('LengthCmPlaceholder')}
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
            <Input
              type="number"
              placeholder={t('WidthCmPlaceholder')}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
            <Input
              type="number"
              placeholder={t('WeightKgPlaceholder')}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </DimensionsContainer>
        </InputGroup>
        
        <InputGroup>
          <Label>{t('Material')}</Label>
          <Input
            type="text"
            placeholder={t('MaterialPlaceholder')}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
        </InputGroup>
        
        <InputGroup>
          <Label>{t('Gender')}</Label>
          <ButtonGroup>
            {['Male', 'Female', 'Unisex'].map(opt => (
              <OptionButton
                key={opt}
                $selected={gender === opt}
                onClick={() => setGender(opt)}
              >
                {t(opt)}
              </OptionButton>
            ))}
          </ButtonGroup>
        </InputGroup>
        
        <InputGroup>
          <Label>{t('Condition')} *</Label>
          <ButtonGroup>
            {['New', 'AsNew', 'Used', 'Refurbished'].map(opt => (
              <OptionButton
                key={opt}
                $selected={condition === opt}
                onClick={() => setCondition(opt)}
              >
                {t(opt)}
              </OptionButton>
            ))}
          </ButtonGroup>
        </InputGroup>
      </FormSection>

      {/* Category Section */}
      <FormSection>
        <SectionTitle>{t('Category')}</SectionTitle>
        
        <InputGroup>
          <Label>{t('Category')} *</Label>
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory('');
            }}
          >
            <option value="">{t('SelectCategory')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
        </InputGroup>
        
        {category && (
          <InputGroup>
            <Label>{t('Subcategory')} *</Label>
            <Select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={subcategories.length === 0}
            >
              <option value="">{t('SelectSubcategory')}</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </Select>
          </InputGroup>
        )}
      </FormSection>

      {/* Shipping Section */}
      <FormSection>
        <SectionTitle>{t('ShippingDetails')}</SectionTitle>
        {couriers.every(c => !c.name) && couriers.length === 1 && (
          <PageSubtitle style={{ marginBottom: '16px' }}>
            {t('DefaultShippingOptions')}
          </PageSubtitle>
        )}
        
        {couriers.map((courier, index) => (
          <CourierFormContainer key={courier.id}>
            {index > 0 && (
              <RemoveCourierButton onClick={() => handleRemoveCourier(index)}>
                <IoTrashOutline />
                {t('Remove')}
              </RemoveCourierButton>
            )}
            
            <InputGroup>
              <Label>{t('CourierName')}</Label>
              <Input
                type="text"
                placeholder={t('CourierNamePlaceholder')}
                value={courier.name}
                onChange={(e) => handleCourierChange(index, 'name', e.target.value)}
              />
            </InputGroup>
            
            <InputGroup>
              <Label>{t('EstimatedArrivalTimes')}</Label>
              <ArrivalDaysContainer>
                <Input
                  type="number"
                  placeholder={t('MinDaysPlaceholder')}
                  value={courier.minDays}
                  onChange={(e) => handleCourierChange(index, 'minDays', e.target.value)}
                />
                <DashText>-</DashText>
                <Input
                  type="number"
                  placeholder={t('MaxDaysPlaceholder')}
                  value={courier.maxDays}
                  onChange={(e) => handleCourierChange(index, 'maxDays', e.target.value)}
                />
              </ArrivalDaysContainer>
              <HintText>{t('ArrivalDaysHint')}</HintText>
            </InputGroup>
            
            <InputGroup>
              <Label>{t('EstimatedReturnTimes')} ({t('Optional')})</Label>
              <ArrivalDaysContainer>
                <Input
                  type="number"
                  placeholder={t('ReturnMinDaysPlaceholder')}
                  value={courier.returnMinDays}
                  onChange={(e) => handleCourierChange(index, 'returnMinDays', e.target.value)}
                />
                <DashText>-</DashText>
                <Input
                  type="number"
                  placeholder={t('ReturnMaxDaysPlaceholder')}
                  value={courier.returnMaxDays}
                  onChange={(e) => handleCourierChange(index, 'returnMaxDays', e.target.value)}
                />
              </ArrivalDaysContainer>
              <HintText>{t('ReturnDaysHint')}</HintText>
            </InputGroup>
            
            <InputGroup>
              <Label>{t('ShippingCosts')}</Label>
              <ShippingCostContainer>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={courier.price}
                  onChange={(e) => handleCourierChange(index, 'price', e.target.value)}
                  disabled={courier.isFreeShipping}
                  style={{ flex: 1 }}
                />
                <CheckboxContainer>
                  <CheckboxInput
                    type="checkbox"
                    checked={courier.isFreeShipping}
                    onChange={(e) => handleCourierChange(index, 'isFreeShipping', e.target.checked)}
                  />
                  <CheckboxLabel>{t('FreeShipping')}</CheckboxLabel>
                </CheckboxContainer>
              </ShippingCostContainer>
            </InputGroup>
          </CourierFormContainer>
        ))}
        
        <AddCourierButton onClick={handleAddCourier}>
          <IoAddCircleOutline />
          <span>{t('AddCustomShippingOption')}</span>
        </AddCourierButton>
      </FormSection>

      {/* Color & Size Selection Section */}
      {imageData.length > 0 && (
        <FormSection>
          <SectionTitle>{t('ColorSizeSelection')}</SectionTitle>
          <PageSubtitle style={{ marginBottom: '16px' }}>
            {t('AssignColorsAndSizes', { current: currentImageIndex + 1, total: imageData.length })}
          </PageSubtitle>

          {/* Image Carousel */}
          <ImageCarouselSection>
            <CarouselContainer>
              {imageData.map((img, index) => (
                <CarouselImage
                  key={img.id}
                  src={img.uri}
                  alt={`Product ${index + 1}`}
                  $active={index === currentImageIndex}
                />
              ))}
              
              <CarouselButton
                $direction="left"
                onClick={goToPreviousImage}
                disabled={currentImageIndex === 0}
              >
                <IoChevronBack />
              </CarouselButton>
              
              <CarouselButton
                $direction="right"
                onClick={goToNextImage}
                disabled={currentImageIndex === imageData.length - 1}
              >
                <IoChevronForward />
              </CarouselButton>
            </CarouselContainer>
            
            <PaginationDots>
              {imageData.map((_, index) => (
                <Dot
                  key={index}
                  $active={index === currentImageIndex}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </PaginationDots>
          </ImageCarouselSection>

          {/* Color Selection */}
          <ColorSelectionContainer>
            <Label>{t('Colors')}</Label>
            <ColorGrid>
              {colorOptions.map(color => (
                <ColorButton
                  key={color.name}
                  onClick={() => handleColorSelect(color.name)}
                >
                  <ColorCircle $color={color.hex} />
                  {currentImage?.color === color.name && <CheckIcon />}
                </ColorButton>
              ))}
            </ColorGrid>
          </ColorSelectionContainer>

          {/* Size Selection */}
          <SizeSelectionContainer>
            <Label>{t('Sizes')}</Label>
            
            <SizeTypeButtons>
              <SizeTypeButton
                $selected={currentImage?.sizeType === 'Clothing'}
                $bgColor="#D0FAE5"
                onClick={() => handleSizeTypeChange('Clothing')}
              >
                {t('Clothing')}
              </SizeTypeButton>
              <SizeTypeButton
                $selected={currentImage?.sizeType === 'Shoes'}
                $bgColor="#FFD1DC"
                onClick={() => handleSizeTypeChange('Shoes')}
              >
                {t('Shoes')}
              </SizeTypeButton>
              <SizeTypeButton
                $selected={currentImage?.sizeType === 'None'}
                $bgColor="#E0E0E0"
                onClick={() => handleSizeTypeChange('None')}
              >
                {t('None')}
              </SizeTypeButton>
            </SizeTypeButtons>
            
            {currentImage?.sizeType !== 'None' && currentSizeOptions.length > 0 && (
              <SizeButtonsContainer>
                {currentSizeOptions.map(size => {
                  const isSelected = currentImage?.sizes?.some(s => s.size === size);
                  return (
                    <SizeButton
                      key={size}
                      $selected={isSelected}
                      onClick={() => handleSizeToggle(size)}
                    >
                      {size}
                    </SizeButton>
                  );
                })}
              </SizeButtonsContainer>
            )}
            
            {currentImage?.sizeType === 'None' && (
              <SizeInfoText>
                {t('SizeStandard')}
              </SizeInfoText>
            )}
          </SizeSelectionContainer>

          {/* Quantity Section */}
          {currentImage?.sizeType !== 'None' && currentImage?.sizes?.length > 0 && (
            <QuantitySection>
              <Label>{t('Quantities')}</Label>
              <QuantityList>
                {currentImage.sizes.map(sizeItem => (
                  <QuantityItem key={sizeItem.size}>
                    <QuantityLabel>{sizeItem.size}</QuantityLabel>
                    <QuantityInput
                      type="number"
                      min="1"
                      value={sizeItem.quantity}
                      onChange={(e) => handleQuantityChange(sizeItem.size, e.target.value)}
                      placeholder={t('QuantityPlaceholder')}
                    />
                  </QuantityItem>
                ))}
              </QuantityList>
            </QuantitySection>
          )}
        </FormSection>
      )}

      {/* Submit Button */}
      <SubmitButton onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <>
            <LoadingSpinner />
            {t('Uploading')}
          </>
        ) : (
          t('Submit')
        )}
      </SubmitButton>
    </Container>
  </PageContainer>
  );
};

export default AddProduct;