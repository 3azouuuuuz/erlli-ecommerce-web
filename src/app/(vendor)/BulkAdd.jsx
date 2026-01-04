import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, supabaseUrl } from '../../lib/constants';
import { useTranslation } from 'react-i18next';
import VendorHeader from '../../components/VendorHeader';
import {
  IoCloudUploadOutline,
  IoEllipsisHorizontal,
  IoImageOutline,
  IoCheckmarkCircle,
  IoClose
} from 'react-icons/io5';

// ==================== STYLED COMPONENTS ====================
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
  margin-bottom: 32px;
`;
const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  margin: 0 0 8px 0;
  color: #202020;
`;
const PageSubtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  font-family: 'Raleway', sans-serif;
  margin: 0;
  color: #666;
`;
const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;
const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #000;
  margin: 0 0 16px 0;
`;
const InstructionsBox = styled.div`
  background: #F5F5F5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;
const InstructionsText = styled.p`
  font-size: 14px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.5;
`;
const HintText = styled.p`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #FF5733;
  margin: 0;
  line-height: 1.5;
`;
const FilePickerButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #F5F5F5;
  border: 2px dashed #00BC7D;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;

  &:hover {
    background: #E6FCF5;
    border-color: #00A66A;
  }

  svg {
    font-size: 32px;
    color: #00BC7D;
  }
`;
const FilePickerText = styled.span`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
`;
const OrText = styled.p`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #666;
  text-align: center;
  margin: 16px 0;
`;
const TextArea = styled.textarea`
  width: 100%;
  background: #F5F5F5;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #000;
  min-height: 200px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;

  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }

  &::placeholder {
    color: #666;
  }
`;
const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 188, 125, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;
const ProductItem = styled.div`
  background: #F5F5F5;
  border-radius: 12px;
  padding: 20px;
`;
const ProductName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #000;
  margin: 0 0 12px 0;
`;
const ProductDetail = styled.p`
  font-size: 14px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin: 0 0 6px 0;
`;
const VariationsContainer = styled.div`
  margin-top: 16px;
`;
const VariationsTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #000;
  margin: 0 0 12px 0;
`;
const VariationsList = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #F0F0F0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #00BC7D;
    border-radius: 3px;
  }
`;
const VariationCard = styled.div`
  min-width: 150px;
  background: white;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
`;
const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
`;
const VariationImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const IconButton = styled.button`
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    font-size: 16px;
  }
`;
const ModalIconButton = styled(IconButton)`
  top: 6px;
  left: 6px;
  background-color: ${props => props.$bgColor || 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.$color || '#000'};

  &:hover {
    transform: scale(1.1);
  }
`;
const ReplaceIconButton = styled(IconButton)`
  bottom: 6px;
  right: 6px;
  background: rgba(255, 255, 255, 0.8);
  color: #000;

  &:hover {
    background: white;
  }
`;
const VariationText = styled.p`
  font-size: 12px;
  font-weight: 400;
  font-family: 'Raleway', sans-serif;
  color: #000;
  margin: 4px 0;
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
  margin-bottom: 12px;

  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 188, 125, 0.1);
  }

  &:disabled {
    background: #F5F5F5;
    cursor: not-allowed;
  }
`;
const CategoryHintBox = styled.div`
  background: #FFF3E0;
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
  text-align: center;
`;
const CategoryHintText = styled.p`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #FF5733;
  margin: 0;
`;
const HiddenFileInput = styled.input`
  display: none;
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
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;
const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0 0 24px 0;
`;
const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #333;
  margin-bottom: 10px;
`;
const ColorGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
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
const SizeButtonsContainer = styled.div`
  background: #ECFDF5;
  border-radius: 20px;
  padding: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 24px;
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
const QuantityInput = styled.input`
  width: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  font-family: 'Raleway', sans-serif;
`;
const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;
const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #00BC7D 0%, #00E89D 100%);
    color: white;
   
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
    }
  ` : `
    background: #F5F5F5;
    color: #666;
   
    &:hover {
      background: #E0E0E0;
    }
  `}
`;

// ==================== COMPONENT ====================
const BulkAdd = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [parsedProducts, setParsedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);

  const colorOptions = [
    { name: 'Black', hex: '#2A2A2A' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Blue', hex: '#0C29B9' },
    { name: 'Red', hex: '#FF3333' },
    { name: 'Yellow', hex: '#E4A719' },
    { name: 'Purple', hex: '#9D3CB9' },
    { name: 'Light Gray', hex: '#EBEBEB' },
  ];

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error) setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (category) {
        const { data, error } = await supabase
          .from('subcategories')
          .select('*')
          .eq('category_id', parseInt(category));
        if (!error) setSubcategories(data || []);
        else setSubcategories([]);
      } else {
        setSubcategories([]);
        setSubcategory('');
      }
    };
    fetchSubcategories();
  }, [category]);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setCsvText('');
    } else {
      alert('Please select a CSV file');
    }
  };

  const parseCsvData = (data) => {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = [
      'product name', 'price', 'description', 'gender', 'stock quantity',
      'variation size', 'variation color', 'variation material', 'variation stock', 'variation image url'
    ];
    const missing = requiredHeaders.filter(h => !headers.includes(h));
    if (missing.length > 0) throw new Error(`Missing columns: ${missing.join(', ')}`);

    const productsMap = new Map();
    lines.slice(1).forEach((line, idx) => {
      const values = line.split(',').map(v => v.trim());
      if (values.length < headers.length) throw new Error(`Row ${idx + 2}: incorrect columns`);

      const row = {};
      headers.forEach((h, i) => row[h] = values[i] || '');

      if (!row['product name'] || !row['variation size'] || !row['variation color']) return;

      const key = row['product name'].toLowerCase();
      if (!productsMap.has(key)) {
        productsMap.set(key, {
          'product name': row['product name'],
          price: row.price,
          description: row.description,
          gender: row.gender,
          'stock quantity': row['stock quantity'],
          variations: []
        });
      }
      productsMap.get(key).variations.push({
        size: row['variation size'],
        color: row['variation color'],
        material: row['variation material'] || 'Unknown',
        stock: row['variation stock'] || '0',
        image_url: row['variation image url'],
        uri: row['variation image url'],
        sizes: [{ size: row['variation size'], quantity: row['variation stock'] || '0' }]
      });
    });

    const products = Array.from(productsMap.values()).filter(p => p.variations.length > 0);
    if (products.length === 0) throw new Error('No valid products found');
    return products;
  };

  const handleParseInput = async () => {
    if (!file && !csvText) {
      alert('Select file or paste CSV data');
      return;
    }
    setLoading(true);
    try {
      let text = csvText;
      if (file) text = await file.text();
      const products = parseCsvData(text);
      setParsedProducts(products);
      setFile(null);
      setCsvText('');
    } catch (err) {
      alert(err.message || 'Parse failed');
    } finally {
      setLoading(false);
    }
  };

  const validateImageUrl = async (url) => {
    if (!url || url.startsWith('data:')) return true;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok && res.headers.get('content-type')?.includes('image');
    } catch {
      return false;
    }
  };

  const uploadImage = async (file, path) => {
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { contentType: file.type });
    if (error) throw error;
    return `${supabaseUrl}/storage/v1/object/public/avatars/${data.path}`;
  };

  const handleImageSelect = (event, productIndex, variationIndex) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setParsedProducts(prev => {
          const updated = [...prev];
          updated[productIndex].variations[variationIndex].uri = e.target.result;
          updated[productIndex].variations[variationIndex].image_url = e.target.result;
          updated[productIndex].variations[variationIndex].file = file;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const openColorModal = (productIndex, variationIndex) => {
    const variation = parsedProducts[productIndex].variations[variationIndex];
    setCurrentProductIndex(productIndex);
    setCurrentVariationIndex(variationIndex);
    setSelectedColor(variation.color);
    setSelectedSizes(variation.sizes || []);
    setModalVisible(true);
  };

  const handleQuantityChange = (size, qty) => {
    setSelectedSizes(prev => prev.map(s => s.size === size ? { ...s, quantity: qty } : s));
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => {
      if (prev.some(s => s.size === size)) {
        return prev.filter(s => s.size !== size);
      }
      return [...prev, { size, quantity: '1' }];
    });
  };

  const handleModalSave = () => {
    if (currentProductIndex === null || currentVariationIndex === null) return;
    setParsedProducts(prev => {
      const updated = [...prev];
      const variation = updated[currentProductIndex].variations[currentVariationIndex];
      variation.color = selectedColor;
      variation.sizes = selectedSizes;
      variation.size = selectedSizes.map(s => s.size).join(', ') || variation.size;
      variation.stock = selectedSizes.reduce((sum, s) => sum + parseInt(s.quantity || 0), 0).toString();
      return updated;
    });
    setModalVisible(false);
    setCurrentProductIndex(null);
    setCurrentVariationIndex(null);
  };

  const handleSubmit = async () => {
    if (parsedProducts.length === 0) return alert('No products');
    if (!category || !subcategory) return alert('Select category and subcategory');

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert('Authentication failed');

      for (const product of parsedProducts) {
        // Upload images if local file
        for (const variation of product.variations) {
          if (variation.file) {
            const path = `products/${user.id}/${product['product name']}-${variation.color}-${Date.now()}`;
            variation.image_url = await uploadImage(variation.file, path);
          } else if (!await validateImageUrl(variation.image_url)) {
            throw new Error(`Invalid image for ${product['product name']} - ${variation.color}`);
          }
        }

        const { data: insertedProduct, error: prodErr } = await supabase
          .from('products')
          .insert({
            name: product['product name'],
            price: parseFloat(product.price) || 0,
            description: product.description || '',
            image_url: product.variations[0].image_url,
            category_id: parseInt(category),
            subcategory_id: parseInt(subcategory),
            gender: product.gender || 'Unisex',
            stock_quantity: product.variations.reduce((sum, v) => sum + parseInt(v.stock || 0), 0),
            vendor_id: user.id,
          })
          .select()
          .single();
        if (prodErr) throw prodErr;

        for (const variation of product.variations) {
          const { error: varErr } = await supabase
            .from('product_variations')
            .insert({
              product_id: insertedProduct.id,
              size: variation.size,
              color: variation.color,
              material: variation.material,
              stock_quantity: parseInt(variation.stock),
              img: variation.image_url,
            });
          if (varErr) throw varErr;
        }
      }

      alert(`Uploaded ${parsedProducts.length} products!`);
      setParsedProducts([]);
      navigate('/vendor/inventory');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const getColorForVariation = (colorName) => {
    const opt = colorOptions.find(o => o.name.toLowerCase() === colorName.toLowerCase());
    return opt ? opt.hex : 'rgba(255, 255, 255, 0.8)';
  };

  const getColorTextColor = (colorName) => {
    return ['Light Gray', 'Yellow', 'White'].includes(colorName) ? '#000' : '#FFF';
  };

  return (
  <PageContainer>
    <VendorHeader profile={profile} />
    <Container>
      <Header>
        <PageTitle>{t('BulkAddProducts')}</PageTitle>
        <PageSubtitle>{t('AddMultipleListings')}</PageSubtitle>
      </Header>
      <FormSection>
        <SectionTitle>{t('Upload')}</SectionTitle>
        <InstructionsBox>
          <InstructionsText>{t('UploadCsvOrPasteData')}</InstructionsText>
          <HintText>{t('SingleCategorySubcategoryNote')}</HintText>
        </InstructionsBox>
        <FilePickerButton onClick={() => fileInputRef.current?.click()}>
          <IoCloudUploadOutline />
          <FilePickerText>{file ? file.name : t('SelectCsvFile')}</FilePickerText>
        </FilePickerButton>
        <HiddenFileInput ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} />
        <OrText>{t('Or')}</OrText>
        <TextArea
          placeholder={t('PasteCsvDataPlaceholder')}
          value={csvText}
          onChange={(e) => { setCsvText(e.target.value); setFile(null); }}
        />
        <Button onClick={handleParseInput} disabled={loading}>
          {loading ? <LoadingSpinner /> : t('ParseProducts')}
        </Button>
      </FormSection>
      {parsedProducts.length > 0 && (
        <>
          <FormSection>
            <SectionTitle>{t('ParsedProducts')} ({parsedProducts.length})</SectionTitle>
            <ProductList>
              {parsedProducts.map((product, pIdx) => (
                <ProductItem key={pIdx}>
                  <ProductName>{product['product name']}</ProductName>
                  <ProductDetail>{t('Price')}: ${product.price}</ProductDetail>
                  <ProductDetail>{t('Gender')}: {product.gender || t('Unisex')}</ProductDetail>
                  <ProductDetail>{t('Stock')}: {product['stock quantity']}</ProductDetail>
                  <ProductDetail>{t('Description')}: {product.description || t('NoDescription')}</ProductDetail>
                  <VariationsContainer>
                    <VariationsTitle>{t('Variations')}</VariationsTitle>
                    <VariationsList>
                      {product.variations.map((variation, vIdx) => {
                        const bg = getColorForVariation(variation.color);
                        const tc = getColorTextColor(variation.color);
                        return (
                          <VariationCard key={vIdx}>
                            <ImageWrapper>
                              <VariationImage src={variation.uri || variation.image_url || 'https://via.placeholder.com/150'} />
                              <ModalIconButton $bgColor={bg} $color={tc} onClick={() => openColorModal(pIdx, vIdx)}>
                                <IoEllipsisHorizontal />
                              </ModalIconButton>
                              <ReplaceIconButton onClick={() => {
                                imageInputRef.current.dataset.pidx = pIdx;
                                imageInputRef.current.dataset.vidx = vIdx;
                                imageInputRef.current.click();
                              }}>
                                <IoImageOutline />
                              </ReplaceIconButton>
                            </ImageWrapper>
                            <VariationText>{t('Size')}: {variation.size}</VariationText>
                            <VariationText>{t('Color')}: {variation.color}</VariationText>
                            <VariationText>{t('Stock')}: {variation.stock}</VariationText>
                          </VariationCard>
                        );
                      })}
                    </VariationsList>
                  </VariationsContainer>
                </ProductItem>
              ))}
            </ProductList>
          </FormSection>
          <HiddenFileInput
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const pIdx = parseInt(e.target.dataset.pidx);
              const vIdx = parseInt(e.target.dataset.vidx);
              if (!isNaN(pIdx) && !isNaN(vIdx)) handleImageSelect(e, pIdx, vIdx);
            }}
          />
          <CategoryHintBox>
            <CategoryHintText>{t('CategorySubcategoryReminder')}</CategoryHintText>
          </CategoryHintBox>
          <FormSection>
            <Label>{t('Category')}</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
              <option value="">{t('SelectCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
            <Label>{t('Subcategory')}</Label>
            <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} disabled={!category || loading}>
              <option value="">{t('SelectSubcategory')}</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </Select>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <LoadingSpinner /> : t('UploadProducts')}
            </Button>
          </FormSection>
        </>
      )}
      <Modal $visible={modalVisible}>
        <ModalContent>
          <ModalTitle>{t('EditVariation')}</ModalTitle>
          <Label>{t('SelectColor')}</Label>
          <ColorGrid>
            {colorOptions.map(col => {
              const selected = col.name === selectedColor;
              return (
                <ColorButton key={col.name} onClick={() => setSelectedColor(col.name)}>
                  <ColorCircle $color={col.hex} />
                  {selected && <CheckIcon />}
                </ColorButton>
              );
            })}
          </ColorGrid>
          <Label>{t('SelectSizesQuantity')}</Label>
          <SizeButtonsContainer>
            {sizeOptions.map(size => {
              const isSelected = selectedSizes.some(s => s.size === size);
              return (
                <SizeButton key={size} $selected={isSelected} onClick={() => handleSizeToggle(size)}>
                  {size}
                </SizeButton>
              );
            })}
          </SizeButtonsContainer>
          {selectedSizes.map(s => (
            <div key={s.size} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '50px' }}>{s.size}:</span>
              <QuantityInput
                type="number"
                min="0"
                value={s.quantity}
                onChange={(e) => handleQuantityChange(s.size, e.target.value)}
              />
            </div>
          ))}
          <ModalButtons>
            <ModalButton onClick={() => setModalVisible(false)}>{t('Cancel')}</ModalButton>
            <ModalButton $primary onClick={handleModalSave}>{t('SaveChanges')}</ModalButton>
          </ModalButtons>
        </ModalContent>
      </Modal>
    </Container>
  </PageContainer>
  );
};

export default BulkAdd;