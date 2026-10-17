import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';



const AnimatedNumber = ({ value, duration = 1000, style, animate }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animate) {
      Animated.timing(animatedValue, {
        toValue: value,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(0);
      setDisplayValue(0);
    }

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value));
    });

    return () => animatedValue.removeListener(listener);
  }, [animate, value]);

  return <Text style={style}>{displayValue}%</Text>;
};

const ProductStore = ({ scrollY, product }) => {
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const [layout, setLayout] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.token) {
          setIsLoggedIn(true);
        }
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (layout && value + 300 >= layout.y) {
        setAnimateNumbers(true);
        scrollY.removeListener(listenerId);
      }
    });

    return () => scrollY.removeListener(listenerId);
  }, [layout]);

  const handleChatPress = async () => {
    let token = null;
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        token = u?.token;
      }
    } catch (e) {}

    if (!token && !isLoggedIn) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please login to chat with seller',
      });
      router.push('/auth/Signin');
      return;
    }

    const sellerId =
      product?.storeId ||
      product?.seller_id ||
      product?.store_id ||
      product?.userId ||
      product?.store?.id ||
      product?.store?.seller_id;

    if (!sellerId) {
      Toast.show({
        type: 'info',
        text1: 'Seller not found',
        text2: 'Unable to start chat with this seller.',
      });
      return;
    }

    router.push({
      pathname: '/Chatscreen',
      params: {
        sellerId: String(sellerId),
        productId: String(product?.id || ''),
        productName: product?.name || product?.title || '',
        productPrice: String(product?.price || 0),
        storeName: product?.store_name || product?.store?.store_name || 'Seller',
      },
    });
  };



  return (
    <View style={styles.container} onLayout={(e) => setLayout(e.nativeEvent.layout)}>
      <View style={styles.soldByCard}>
        <Text style={styles.sectionTitle}>Sold By</Text>
        
        <View style={styles.storeHeader}>
          <Text style={styles.storeTitle}>{product?.store_name || "Craft Delhi Store"}</Text>
          <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#2d53d8" />
            <Text style={styles.chatText}>{isLoggedIn ? "Chat with seller" : "Login to chat"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Positive Seller Ratings</Text>
            <AnimatedNumber value={80} style={styles.statValue} animate={animateNumbers} />
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Ship On Time</Text>
            <AnimatedNumber value={98} style={styles.statValue} animate={animateNumbers} />
          </View>
        </View>

        <View style={styles.horizontalDivider} />

        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/Store', params: { store_username: product?.store_username } })} 
          style={styles.goStoreBtn}
        >
          <Text style={styles.goStoreText}>Go to Store</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductStore;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, // Padding is managed by parent or child
    backgroundColor: '#fff',
    marginBottom: Platform.OS === 'ios' ? 70 : 100,
  },
  soldByCard: {
    backgroundColor: '#f8f9fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatText: {
    fontSize: 12,
    color: '#2d53d8',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#d9d9d9',
    marginHorizontal: 16,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#d9d9d9',
    marginVertical: 12,
  },
  goStoreBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  goStoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d53d8',
  },

});
