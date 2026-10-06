import { Animated, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import Search from '../../components/Search';
import ProductDisplay from '../../components/Productdetails/ProductDisplay';
import ProductReview from '../../components/Productdetails/ProductReview';
import ProductStore from '../../components/Productdetails/ProductStore';
import ProductDelivery from '../../components/Productdetails/ProductDelivery';
import ProductRecommended from '../../components/Productdetails/ProductRecommended';
import Chat from '../../assets/images/chatnow.svg'
import Buy from '../../assets/images/buynow.svg'
import Cart from '../../assets/images/cartnow.svg';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/CartReducer';
import ActionSheet from 'react-native-actions-sheet';
import Toast from 'react-native-toast-message';
import BuyNow from '../../components/BuyNow';
import axios from 'axios';
import Skeleton from '../../components/Skeleton';

const SIZE_ORDER = {
  icon: ["icon", "thumbnail", "full"],
  thumbnail: ["thumbnail", "full", "icon"],
  full: ["full", "thumbnail", "icon"],
};
const parseImage = (image) => {
  if (typeof image !== "string") return image;
  const value = image.trim();
  if (!value || value === "[object Object]") return null;
  if ((value.startsWith("{") && value.endsWith("}")) ||
      (value.startsWith("[") && value.endsWith("]"))) {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
};
const getImageUrl = (image, preferredSize = "thumbnail", fallback = "") => {
  const parsed = parseImage(image);
  if (typeof parsed === "string") return parsed;
  if (Array.isArray(parsed)) return getImageUrl(parsed[0], preferredSize, fallback);
  if (!parsed || typeof parsed !== "object") return fallback;
  const keys = [...(SIZE_ORDER[preferredSize] || SIZE_ORDER.thumbnail), "original", "original_url", "image_url", "url", "src", "path"];
  for (const key of keys) {
    if (parsed[key]) {
      const resolved = getImageUrl(parsed[key], preferredSize);
      if (resolved) return resolved;
    }
  }
  return fallback;
};

const resolveUrl = (url) => {
  if (!url) return '';
  if (typeof url === 'string' && !url.startsWith("http")) {
     return `https://backend.craftdelhi.com/${url.startsWith("/") ? url.slice(1) : url}`;
  }
  return url;
}

const ProductDetails = () => {
    const actionSheetRef = useRef(null);
    const params = useLocalSearchParams();
    const id = params.product_sku || params.slug || params.id;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}products/getbyslug/${id}`);
          if (res.data?.status && res.data?.data) {
            setProduct(res.data.data);
          }
        } catch (err) {
          console.error("Error fetching product:", err);
        } finally {
          setLoading(false);
        }
      };
      if (id) fetchProduct();
    }, [id]);

    const scrollY = useRef(new Animated.Value(0)).current;
    const cart = useSelector((state) => state.cart.cart);
    const cartItem = cart.find((c) => c.id === id);
    const dispatch = useDispatch();

    let mediaFiles = [];
    let item = null;

    if (product) {
      item = {
        id: product.id,
        title: product.name,
        price: product.price,
        image: resolveUrl(getImageUrl(product.main_image_url, "full")),
        orders: product.total_sales || 0,
        rating: Number(product.average_rating || 0),
        oldPrice: product.regular_price || product.price,
        description: product.description,
        quantity: 1
      };

      let galleryImages = product.gallery_images || [];
      if (typeof galleryImages === "string") {
        try { galleryImages = JSON.parse(galleryImages); } catch { galleryImages = []; }
      }

      mediaFiles = [
        ...(Array.isArray(galleryImages) ? galleryImages.map((img) => ({ type: "image", uri: resolveUrl(getImageUrl(img, "full")) })) : []),
        ...(product?.video_url ? [{ type: "video", uri: resolveUrl(product.video_url) }] : []),
      ];
      // Filter out invalid/empty urls
      mediaFiles = mediaFiles.filter(f => f.uri && f.uri.length > 5);
    }

  return (
    <View style={{backgroundColor:'#f8f9fd',flex:1}}>
          <View style={[styles.header, { backgroundColor: '#fff' }]}>
             <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
    
            <Text style={styles.headerTitle}>Product View</Text>
    
            <TouchableOpacity 
              style={styles.iconBtn}
              onPress={()=>router.push('/(tabs)/Cart')}
            >
              <Feather name="shopping-cart" size={22} color="black" />
              {cart && cart.length > 0 && (
                 <View style={styles.badge}>
                   <Text style={styles.badgeText}>{cart.length}</Text>
                 </View>
              )}
            </TouchableOpacity>
          </View>
          <Search/>

          {loading || !product ? (
            <View style={{ padding: 20 }}>
              <Skeleton width="100%" height={300} borderRadius={10} style={{ marginBottom: 20 }} />
              <Skeleton width="40%" height={20} style={{ marginBottom: 10 }} />
              <Skeleton width="80%" height={24} style={{ marginBottom: 20 }} />
              <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={14} />
            </View>
          ) : (
            <Animated.ScrollView
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              contentContainerStyle={{ padding: 16 }}
            >
                  <ProductDisplay
                      item={item}
                      product={product}
                      thumbnails={mediaFiles}
                  />
                  <ProductDelivery />
                  <ProductReview scrollY={scrollY} product={product} />
                  <ProductStore scrollY={scrollY} product={product} />
                  <ProductRecommended productSku={id} />
            </Animated.ScrollView>
          )}


          <View style={styles.floatingBar}>
            <TouchableOpacity onPress={()=>actionSheetRef.current?.show()} style={[styles.button, styles.buyButton]}>
              <Buy width={20} height={20} style={styles.iconSpacing} />
              <Text style={styles.buttonText}>Buy Now</Text>
            </TouchableOpacity>

            {cartItem ? (
              <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={[styles.button, styles.cartButton]}>
                <Ionicons name="checkmark-done-circle" size={18} color="white" style={styles.iconSpacing} />
                <Text style={styles.buttonText}>Go to Cart ({cart.length})</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => {
                  dispatch(addToCart(item));
                  Toast.show({
                    type: 'success',
                    text1: 'Added to Cart',
                    position: 'bottom',
                    visibilityTime: 2000,
                  });
                }} style={[styles.button, styles.cartButton]}>
                <Cart width={20} height={20} style={styles.iconSpacing} />
                <Text style={styles.buttonText}>Add to Cart ({cart.length})</Text>
              </TouchableOpacity>
            )}
          </View>

 <ActionSheet ref={actionSheetRef}>
      <BuyNow onClose={()=>actionSheetRef.current?.hide()} item={item}/>
    </ActionSheet>
    </View>
  )
}

export default ProductDetails

const styles = StyleSheet.create({
     header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  iconBtn: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EE6F69',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontFamily: 'mbold',
  },
    floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buyButton: {
    backgroundColor: '#FE7A15',
    marginRight: 8,
  },
  cartButton: {
    backgroundColor: '#024A63',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'mbold', 
  },
  iconSpacing: {
    marginRight: 8,
  },

});

  
