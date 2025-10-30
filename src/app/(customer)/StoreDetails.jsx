import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image, Alert, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Template from '../../components/Template';
import { wp, hp } from '../../helpers/common';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import FilterModal from '../../components/FilterModal';
import { LinearGradient } from 'expo-linear-gradient';

// ProductItem component with enhanced styling
const ProductItem = ({ item, onPress, currency, convertCurrency }) => {
  const realPrice = item.price;
  const hasDiscount = item.sale_percentage && item.sale_percentage > 0;
  const discountedPrice = hasDiscount ? realPrice * (1 - item.sale_percentage / 100) : null;

  const [formattedRealPrice, setFormattedRealPrice] = useState('');
  const [formattedDiscountedPrice, setFormattedDiscountedPrice] = useState('');

  useEffect(() => {
    const formatPrices = async () => {
      try {
        const realPriceFormatted = await convertCurrency(realPrice, currency);
        setFormattedRealPrice(realPriceFormatted);
        if (hasDiscount) {
          const discountedPriceFormatted = await convertCurrency(discountedPrice, currency);
          setFormattedDiscountedPrice(discountedPriceFormatted);
        }
      } catch (error) {
        console.error('Error formatting prices:', error.message);
        setFormattedRealPrice(realPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
        if (hasDiscount) {
          setFormattedDiscountedPrice(discountedPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
        }
      }
    };
    formatPrices();
  }, [realPrice, discountedPrice, currency, convertCurrency]);

  return (
    <TouchableOpacity style={styles.gridItemContainer} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.gridImageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
        {hasDiscount && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>{item.sale_percentage}% OFF</Text>
          </View>
        )}
        <View style={styles.imageOverlay} />
      </View>
      <View style={styles.productInfoContainer}>
        <Text style={styles.gridItemDescription} numberOfLines={2}>{item.description}</Text>
        {hasDiscount ? (
          <View style={styles.priceContainer}>
            <Text style={styles.gridDiscountedPrice}>{formattedDiscountedPrice}</Text>
            <View style={styles.realPriceContainer}>
              <Text style={styles.gridRealPrice}>{formattedRealPrice}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.gridDiscountPercentage}>-{item.sale_percentage}%</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.priceContainer}>
            <Text style={styles.gridItemPrice}>{formattedRealPrice}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const StoreDetails = () => {
  const { t } = useTranslation();
  const { storeId, vendorId } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { currency, convertCurrency } = useCurrency();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [analytics, setAnalytics] = useState({ totalItems: 0, soldItems: 0, likesCount: 0 });
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeSubcategories, setActiveSubcategories] = useState([]);

  const fetchStoreAndProducts = useCallback(async (reset = false) => {
    if (reset) setLoading(true);
    try {
      // Fetch store details
      if (reset) {
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, name, description, logo_url, country, city, state, address_line1, vendor_id')
          .eq('id', storeId)
          .single();
        if (storeError) throw storeError;
        setStore(storeData);
      }

      // Fetch all products
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id, name, description, price, image_url, category_id, subcategory_id, gender,
          material, stock_quantity, created_at, updated_at, likes_count, size, color,
          flash_sale_products (discount_percentage, flash_sale_id, flash_sales (start_time, end_time))
        `)
        .eq('vendor_id', vendorId);

      if (productError) throw productError;

      const currentTime = new Date().toISOString();
      const enrichedProducts = productData.map(product => {
        const activeFlashSale = product.flash_sale_products?.find(fsp => {
          const sale = fsp.flash_sales;
          return sale && sale.start_time <= currentTime && sale.end_time >= currentTime;
        });
        return {
          ...product,
          sale_percentage: activeFlashSale ? activeFlashSale.discount_percentage : null,
        };
      });

      setProducts(enrichedProducts);
      setFilteredProducts(enrichedProducts);
    } catch (error) {
      console.error('Error fetching store or products:', error.message);
      if (reset) {
        setProducts([]);
        setFilteredProducts([]);
      }
    } finally {
      if (reset) setLoading(false);
    }
  }, [storeId, vendorId]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const targetVendorId = store?.vendor_id || vendorId;
      
      // Total items
      const { count: totalItems, error: itemsError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('vendor_id', targetVendorId);
      if (itemsError) throw itemsError;

      // Sold items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('items')
        .eq('vendor_id', targetVendorId)
        .eq('status', 'succeeded');
      if (ordersError) throw ordersError;

      const soldItems = ordersData.reduce((total, order) => {
        const items = order.items || [];
        return total + items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      }, 0);

      // Store likes count
      const { count: likesCount, error: likesError } = await supabase
        .from('store_likes')
        .select('id', { count: 'exact' })
        .eq('store_id', storeId);
      if (likesError) throw likesError;

      setAnalytics({ totalItems: totalItems || 0, soldItems, likesCount: likesCount || 0 });
    } catch (error) {
      console.error('Error fetching analytics:', error.message);
      setAnalytics({ totalItems: 0, soldItems: 0, likesCount: 0 });
    }
  }, [store?.vendor_id, vendorId, storeId]);

  // Apply filters when activeSubcategories changes
  useEffect(() => {
    if (activeSubcategories.length === 0) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        activeSubcategories.includes(product.subcategory_id)
      );
      setFilteredProducts(filtered);
    }
  }, [activeSubcategories, products]);

  useEffect(() => {
    fetchStoreAndProducts(true);
  }, [fetchStoreAndProducts]);

  useEffect(() => {
    if (store?.vendor_id) {
      fetchAnalytics();
    }
  }, [store?.vendor_id, fetchAnalytics]);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (!profile?.id || !storeId) return;
      try {
        const { data: likeData, error: likeError } = await supabase
          .from('store_likes')
          .select('id')
          .eq('store_id', storeId)
          .eq('user_id', profile.id)
          .single();
        if (likeError && likeError.code !== 'PGRST116') throw likeError;
        setIsLiked(!!likeData);
      } catch (error) {
        console.error('Error checking if store is liked:', error.message);
      }
    };
    checkIfLiked();
  }, [profile?.id, storeId]);

  const handleLikePress = async () => {
    if (!profile?.id) {
      Alert.alert(t('Error'), t('Please login to like the store.'));
      return;
    }
    try {
      if (isLiked) {
        const { error: deleteError } = await supabase
          .from('store_likes')
          .delete()
          .eq('store_id', storeId)
          .eq('user_id', profile.id);
        if (deleteError) throw deleteError;
        setIsLiked(false);
        setAnalytics(prev => ({ ...prev, likesCount: Math.max(0, prev.likesCount - 1) }));
      } else {
        const { error: insertError } = await supabase
          .from('store_likes')
          .insert([{ store_id: storeId, user_id: profile.id, liked_at: new Date().toISOString() }]);
        if (insertError) throw insertError;
        setIsLiked(true);
        setAnalytics(prev => ({ ...prev, likesCount: prev.likesCount + 1 }));
      }
    } catch (error) {
      console.error('Error handling store like/unlike:', error.message);
      Alert.alert(t('Error'), t('Failed to update like status.'));
    }
  };

  const handleItemPress = (item) => {
    router.push(`/ProductsView?product=${JSON.stringify(item)}`);
  };

  const handleContactVendor = () => {
    if (!vendorId) {
      Alert.alert(t('Error'), t('NoVendorId'));
      return;
    }
    router.push({
      pathname: '/CustomerMessages',
      params: { vendorId },
    });
  };

  const handleApplyFilters = (filters) => {
    setActiveSubcategories(filters.subcategories || []);
    setIsFilterModalVisible(false);
  };

  if (loading && !store) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BC7D" />
        <Text style={styles.loadingText}>Loading store...</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <View>
      {/* Enhanced Store Header with Gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.header}
      >
        {/* Store Info Row */}
        <View style={styles.storeInfoRow}>
          <View style={styles.logoWrapper}>
            {store?.logo_url && (
              <Image source={{ uri: store.logo_url }} style={styles.storeLogo} />
            )}
            {isLiked && (
              <View style={styles.likedBadge}>
                <Icon name="heart" size={12} color="#FF0000" />
              </View>
            )}
          </View>
          <View style={styles.storeNameContainer}>
            <Text style={styles.storeName} numberOfLines={2}>{store?.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#00BC7D" />
              <Text style={styles.storeLocation} numberOfLines={1}>
                {store?.city}, {store?.state}
              </Text>
            </View>
          </View>
        </View>

        {/* Store Description */}
        {store?.description && (
          <Text style={styles.storeDescription} numberOfLines={3}>{store.description}</Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButtonLarge, styles.contactButton]} 
            onPress={handleContactVendor}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Contact</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButtonLarge, isLiked ? styles.likedButton : styles.likeButton]} 
            onPress={handleLikePress}
            activeOpacity={0.8}
          >
            <Icon name={isLiked ? "heart" : "heart-o"} size={20} color={isLiked ? "#FFFFFF" : "#FF0000"} />
            <Text style={[styles.actionButtonText, !isLiked && styles.likeButtonText]}>
              {isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Analytics with Icons */}
        <View style={styles.analyticsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cube-outline" size={24} color="#00BC7D" />
            </View>
            <Text style={styles.statValue}>{analytics.totalItems}</Text>
            <Text style={styles.statLabel}>{t('TotalItems')}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#FF9900" />
            </View>
            <Text style={styles.statValue}>{analytics.soldItems}</Text>
            <Text style={styles.statLabel}>{t('SoldItems')}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="heart" size={22} color="#FF0000" />
            </View>
            <Text style={styles.statValue}>{analytics.likesCount}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>
      </LinearGradient>
      
      {/* Products Header with Filter */}
      <View style={styles.productsHeader}>
        <View style={styles.productsHeaderLeft}>
          <Text style={styles.productsHeaderTitle}>{t('StoreItems')}</Text>
          <View style={styles.productCountBadge}>
            <Text style={styles.productCountText}>{filteredProducts.length}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setIsFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/Filter.png')}
            style={styles.filterIcon}
          />
          {activeSubcategories.length > 0 && (
            <View style={styles.filterActiveBadge}>
              <Text style={styles.filterActiveBadgeText}>{activeSubcategories.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Template bg="white">
      <View style={styles.container}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <ScrollView 
              contentContainerStyle={styles.emptyScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <ListHeader />
              <View style={styles.emptyState}>
                <Ionicons name="basket-outline" size={80} color="#CCCCCC" />
                <Text style={styles.emptyStateTitle}>No Products Found</Text>
                <Text style={styles.emptyStateText}>
                  {activeSubcategories.length > 0 
                    ? 'Try adjusting your filters' 
                    : 'This store has no products yet'}
                </Text>
                {activeSubcategories.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearFiltersButton}
                    onPress={() => setActiveSubcategories([])}
                  >
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ProductItem
                item={item}
                onPress={handleItemPress}
                currency={currency}
                convertCurrency={convertCurrency}
              />
            )}
            numColumns={2}
            contentContainerStyle={styles.gridListContent}
            ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          />
        )}
      </View>

      {/* Filter Modal */}
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        initialSubcategories={activeSubcategories}
      />
    </Template>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Raleway_600SemiBold',
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: wp(4),
    marginHorizontal: wp(3),
    marginTop: hp(1.5),
    marginBottom: hp(2),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  logoWrapper: {
    position: 'relative',
  },
  storeLogo: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    borderWidth: 3,
    borderColor: '#00BC7D',
    shadowColor: '#00BC7D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  likedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  storeNameContainer: {
    flex: 1,
    marginLeft: wp(3),
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 22,
    fontFamily: 'Raleway_700Bold',
    color: '#202020',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  storeLocation: {
    fontSize: 13,
    fontFamily: 'Raleway_600SemiBold',
    color: '#00BC7D',
    marginLeft: 4,
    maxWidth: wp(40),
  },
  storeDescription: {
    fontSize: 14,
    fontFamily: 'Raleway_400Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: hp(2),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: hp(2),
  },
  actionButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButton: {
    backgroundColor: '#00BC7D',
  },
  likeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  likedButton: {
    backgroundColor: '#FF0000',
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Raleway_700Bold',
    color: '#FFFFFF',
  },
  likeButtonText: {
    color: '#FF0000',
  },
  analyticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: hp(2),
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Raleway_700Bold',
    color: '#202020',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Raleway_600SemiBold',
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#D0D0D0',
    marginVertical: 8,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productsHeaderTitle: {
    fontSize: 20,
    fontFamily: 'Raleway_700Bold',
    color: '#000000',
    letterSpacing: -0.3,
  },
  productCountBadge: {
    backgroundColor: '#D0FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productCountText: {
    fontSize: 13,
    fontFamily: 'Raleway_700Bold',
    color: '#00BC7D',
  },
  filterButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  filterIcon: {
    width: 24,
    height: 24,
  },
  filterActiveBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterActiveBadgeText: {
    fontSize: 11,
    fontFamily: 'Raleway_700Bold',
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    flex: 1,
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
    paddingVertical: hp(8),
  },
  emptyStateTitle: {
    fontSize: 22,
    fontFamily: 'Raleway_700Bold',
    color: '#202020',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: 'Raleway_400Regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  clearFiltersButton: {
    marginTop: 24,
    backgroundColor: '#00BC7D',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#00BC7D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clearFiltersText: {
    fontSize: 15,
    fontFamily: 'Raleway_700Bold',
    color: '#FFFFFF',
  },
  gridListContent: {
    paddingHorizontal: wp(2),
    paddingBottom: hp(2),
    backgroundColor: '#FFFFFF',
  },
  gridItemContainer: {
    flex: 1,
    margin: wp(1.5),
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  gridImageContainer: {
    width: '100%',
    height: Dimensions.get('window').width / 2 - wp(5),
    position: 'relative',
    backgroundColor: '#F8F9FA',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FF3333',
    shadowColor: '#FF3333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  saleText: {
    fontSize: 11,
    fontFamily: 'Raleway_700Bold',
    color: '#FFFFFF',
  },
  productInfoContainer: {
    padding: 12,
  },
  gridItemDescription: {
    fontSize: 13,
    fontFamily: 'Raleway_600SemiBold',
    color: '#202020',
    minHeight: 38,
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    marginTop: 4,
  },
  gridItemPrice: {
    fontSize: 18,
    fontFamily: 'Raleway_700Bold',
    color: '#00BC7D',
  },
  gridDiscountedPrice: {
    fontSize: 18,
    fontFamily: 'Raleway_700Bold',
    color: '#00BC7D',
    marginBottom: 4,
  },
  realPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridRealPrice: {
    fontSize: 13,
    fontFamily: 'Raleway_600SemiBold',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FFE6E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridDiscountPercentage: {
    fontSize: 11,
    fontFamily: 'Raleway_700Bold',
    color: '#FF0000',
  },
});