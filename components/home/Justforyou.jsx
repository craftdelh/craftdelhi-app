import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '../Skeleton';

const brandedPlaceholder = "https://craftdelhi.com/craftdelhi-placeholder.svg";

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
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const getImageUrl = (image, preferredSize = "thumbnail", fallback = "") => {
  const parsed = parseImage(image);
  if (typeof parsed === "string") return parsed;
  if (Array.isArray(parsed)) {
    return getImageUrl(parsed[0], preferredSize, fallback);
  }
  if (!parsed || typeof parsed !== "object") return fallback;

  const keys = [
    ...(SIZE_ORDER[preferredSize] || SIZE_ORDER.thumbnail),
    "original",
    "original_url",
    "image_url",
    "url",
    "src",
    "path",
  ];
  for (const key of keys) {
    if (parsed[key]) {
      const resolved = getImageUrl(parsed[key], preferredSize);
      if (resolved) return resolved;
    }
  }
  return fallback;
};

const Justforyou = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState([]);
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setVisibleItems(viewableItems.map((vi) => vi.item.id));
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}products/get`);
      let productsData = response.data.data || [];
      // Sort by created_at descending (newest first)
      productsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      // Take first 8
      productsData = productsData.slice(0, 8);
      
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0.00";
    return parseFloat(price).toFixed(2);
  };

  const StarRating = ({ rating }) => {
    const value = Number(rating || 0);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          if (value >= star) {
            return <Ionicons key={star} name="star" size={10} color="#69D297" />;
          } else if (value >= star - 0.5) {
            return <Ionicons key={star} name="star-half" size={10} color="#69D297" />;
          } else {
            return <Ionicons key={star} name="star-outline" size={10} color="#ccc" />;
          }
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const isVisible = visibleItems.includes(item.id);
    let imagePath = getImageUrl(item.main_image_url || item.gallery_images, "thumbnail", brandedPlaceholder);
    if (imagePath && !imagePath.startsWith("http")) {
       imagePath = `https://backend.craftdelhi.com/${imagePath.startsWith("/") ? imagePath.slice(1) : imagePath}`;
    }

    const CardContent = (
      <TouchableOpacity onPress={() => router.push({ pathname: '/ProductDetails', params: item })} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imagePath }} style={styles.image} />
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>₹ {formatPrice(item.price)}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.ordersText}>{(item.total_order || 0)} Orders</Text>
            <View style={styles.ratingContainer}>
              <StarRating rating={item.average_rating} />
              <Text style={styles.ratingNumber}>{Number(item.average_rating || 0).toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );

    return isVisible ? (
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        delay={index * 100} 
        style={styles.card}
        useNativeDriver
      >
        {CardContent}
      </Animatable.View>
    ) : (
      <View style={styles.card}>{CardContent}</View>
    );
  };

  if (loading) {
    return (
      <View style={{ padding: 20, backgroundColor: '#fff' }}>
        <Skeleton width={160} height={28} borderRadius={6} style={{ alignSelf: 'center', marginBottom: 8 }} />
        <Skeleton width={260} height={16} borderRadius={4} style={{ alignSelf: 'center', marginBottom: 24 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.card, { paddingBottom: 10 }]}>
              <Skeleton width="100%" height={140} borderRadius={0} />
              <View style={{ padding: 10 }}>
                <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
                <Skeleton width="70%" height={14} style={{ marginBottom: 16 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Skeleton width="30%" height={12} />
                  <Skeleton width="40%" height={12} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ padding: 20, backgroundColor: '#fff' }}>
      <Text style={styles.heading}>Just For You</Text>
      <Text style={styles.subText}>
        Discover unique, handcrafted delights — crafted with passion, sold with honor.
      </Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ marginTop: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={false}
      />
    </View>
  );
};

export default Justforyou;

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'mbold',
    color: '#000',
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#959595',
    fontFamily: 'msemibold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ECF0FF',
    borderWidth: 1,
    width: '48%',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    height: 140,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#024a63',
    fontSize: 11,
    fontFamily: 'mbold',
    fontWeight: '700',
  },
  cardContent: {
    padding: 10,
    paddingBottom: 12,
  },
  title: {
    fontSize: 12,
    color: '#024A63',
    fontFamily: 'msemibold',
    height: 36, // Keep fixed height for 2 lines
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  ordersText: {
    fontSize: 10,
    color: '#959595',
    fontFamily: 'mmedium',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 10,
    color: '#69D297',
    fontFamily: 'mbold',
    marginLeft: 4,
  },
});
