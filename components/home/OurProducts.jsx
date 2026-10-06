import { router, useNavigation } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Animated,
  ActivityIndicator
} from 'react-native';
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

const OurProducts = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const scrollXRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const visibleCategories = showAll ? categories : categories.slice(0, 6);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}categories/get`);
      if (response.data && response.data.status) {
        const formatted = response.data.data.map(item => {
          let imagePath = getImageUrl(item.category_image, "thumbnail");
          if (imagePath && typeof imagePath === 'string' && !imagePath.startsWith("http")) {
             imagePath = `https://backend.craftdelhi.com/${imagePath.startsWith("/") ? imagePath.slice(1) : imagePath}`;
          }
          return {
            id: item.slug || item.id,
            realId: item.id,
            name: item.name,
            image: imagePath || brandedPlaceholder
          };
        });
        setCategories(formatted);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShowAll = () => {
    setShowAll(prev => !prev);
  };

  const handleCategoryPress = (categoryId, categoryName, realId) => {
    router.push({ pathname: '/ProductCategories', params: { category: categoryId, name: categoryName, realId } });
  };

  useEffect(() => {
    if (!loading && categories.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    if (showAll && scrollXRef.current) {
      setTimeout(() => {
        scrollXRef.current.scrollToEnd({ animated: true });
      }, 100); 
    }
  }, [showAll, loading, categories.length]);

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <View style={styles.headerRow}>
          <Skeleton width={120} height={24} borderRadius={4} />
          <Skeleton width={100} height={16} borderRadius={4} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 20, overflow: 'hidden' }}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.itemBox, { paddingVertical: 10 }]}>
              <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 10 }} />
              <Skeleton width={80} height={16} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (categories.length === 0) return null;

  return (
    <View style={{ padding: 20 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Our Products</Text>
        <TouchableOpacity onPress={handleToggleShowAll} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.seeAllText}>
            {showAll ? 'Show Less' : 'See All Categories'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#2E54D9" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
        <ScrollView
          horizontal
          ref={scrollXRef}
          showsHorizontalScrollIndicator={false}
        >
          {visibleCategories.map((item, index) => (
            <TouchableOpacity key={item.id} onPress={() => handleCategoryPress(item.id, item.name, item.realId)} style={styles.itemBox}>
              <Image source={{ uri: item.image }} style={styles.imageCircle} />
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default OurProducts;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'mbold',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#2E54D9',
  },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E8E8E8',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  imageCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ddd',
  },
  itemText: {
    fontSize: 14,
    fontFamily: 'msemibold',
    color: '#024A63',
    flexShrink: 1,
    maxWidth: 150,
  },
});
