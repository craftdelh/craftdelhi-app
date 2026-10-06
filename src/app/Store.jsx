import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import storeimage from '../../assets/images/storeimage.png';
import Products from '../../components/store/Products';
import StoreReels from '../../components/store/StoreReels';
import Search from '../../components/Search';

const Store = () => {
  const { store_username } = useLocalSearchParams();
  const [active, setActive] = useState('products');
  const [store, setStore] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!store_username) return;
    const fetchStore = async () => {
      try {
        const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}seller-store/getstore/${store_username}`);
        setStore(res.data.store);
      } catch (error) {
        console.error("Store API Error:", error);
      } finally {
        setLoadingStore(false);
      }
    };
    fetchStore();
  }, [store_username]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!activeId) {
        setCategoryProducts([]);
        return;
      }
      setLoadingProducts(true);
      try {
        const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}categories/${activeId}`);
        if (res.data) {
          setCategoryProducts(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch category products:", error);
        setCategoryProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCategoryProducts();
  }, [activeId]);

  if (loadingStore) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#EE6F69" />
      </View>
    );
  }

  const storeData = store?.store_data?.[0] || {};
  const positiveRating = storeData?.positive_rating_percentage && storeData?.positive_rating_percentage !== "0.00"
    ? `${storeData.positive_rating_percentage}%`
    : "98%";
  const shipOnTime = storeData?.ship_on_time || "97%";
  const joinDate = storeData?.store_created_date
    ? new Date(storeData.store_created_date).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "";

  const resolveUrl = (url) => {
    if (!url) return null;
    if (typeof url === 'string' && !url.startsWith("http")) {
       return `https://backend.craftdelhi.com/backend/${url.startsWith("/") ? url.slice(1) : url}`;
    }
    return url;
  };

  const getStoreImage = () => {
    if (!storeData?.store_image) return storeimage;
    let imgData = storeData.store_image;
    
    if (typeof imgData === 'string') {
      try {
        if (imgData.startsWith('{') || imgData.startsWith('[')) {
          imgData = JSON.parse(imgData);
        }
      } catch (e) {}
    }

    if (Array.isArray(imgData) && imgData.length > 0) imgData = imgData[0];
    
    if (typeof imgData === 'object' && imgData !== null) {
      console.log("getStoreImage object keys:", Object.keys(imgData), "values:", Object.values(imgData));
      const url = imgData.thumbnail || imgData.icon || imgData.url || imgData.file_name || imgData.full;
      console.log("getStoreImage resolved URL:", url);
      return { uri: resolveUrl(url) };
    }
    
    return { uri: resolveUrl(imgData) };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{storeData?.store_name || "Store"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.localSearchContainer}>
        <Ionicons name="search" size={20} color="#888" style={{marginRight: 8}} />
        <TextInput
          style={styles.localSearchInput}
          placeholder="Search in store..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.storeInfo}>
          <Image source={getStoreImage()} style={styles.storeImage} />
          <View style={styles.storeText}>
            <Text style={styles.storeName}>{storeData?.store_name || "Craft Delhi Store"}</Text>
            <Text style={styles.storeDescription} numberOfLines={3}>
              {storeData?.store_description || "Welcome to our store!"}
            </Text>
          </View>
        </View>

        <View style={styles.statContainer}>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.label}>Positive Ratings</Text>
              <Text style={styles.value}>{positiveRating}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.label}>Ship On{'\n'}Time</Text>
              <Text style={styles.value}>{shipOnTime}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.label}>Joined{'\n'}Date</Text>
              <Text style={[styles.value, {fontSize: 14}]}>{joinDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[styles.switchButton, active === 'products' && styles.switchActive]}
            onPress={() => setActive('products')}
          >
            <Text style={[styles.switchText, active === 'products' && styles.switchTextActive]}>
              Products
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              const allVideos = [...(store?.media?.reels || []), ...(store?.media?.videos || [])];
              const allResolvedUrls = allVideos.map(v => 
                typeof v === 'string' && !v.startsWith('http') 
                  ? `https://backend.craftdelhi.com/backend/${v.startsWith('/') ? v.slice(1) : v}` 
                  : v
              );
              router.push({
                pathname: '/ReelsPlayer',
                params: {
                  videos: JSON.stringify(allResolvedUrls),
                  initialIndex: 0
                }
              });
            }}
          >
            <Text style={styles.switchText}>
              Reels
            </Text>
          </TouchableOpacity>
        </View>
       
        {active === 'products' && (
          <Products 
            store={store} 
            activeId={activeId} 
            setActiveId={setActiveId} 
            categoryProducts={activeId ? categoryProducts : store?.products || []} 
            loadingProducts={loadingProducts}
            searchQuery={searchQuery}
          />
        )}
      </ScrollView>

     
    </View>
  );
};

export default Store;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: 'black',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  storeImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 20,
  },
  storeText: {
    flex: 1,
    flexShrink: 1,
  },
  storeName: {
    color: '#EE6F69',
    fontFamily: 'mbold',
    fontSize: 17,
    marginBottom: 4,
  },
  storeDescription: {
    fontFamily: 'msemibold',
    fontSize: 13,
    color: '#333',
    flexWrap: 'wrap',
  },
  statContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginTop: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  label: {
    color: '#36234E',
    fontSize: 15,
    fontFamily: 'mbold',
    textAlign: 'center',
    lineHeight: 17,
  },
  value: {
    color: '#EE6F69',
    fontSize: 16,
    fontFamily: 'mbold',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#D9D9D9',
    marginHorizontal: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECF0FF',
    borderRadius: 4,
    margin: 16,
    padding: 4,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#EE6F69',
  },
  switchText: {
    fontSize: 12,
    fontFamily: 'msemibold',
    fontWeight: '400',
    color: 'black',
    lineHeight: 16,
  },
  switchTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  chatButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#FFC700',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  chatButtonText: {
    color: 'black',
    fontFamily: 'mbold',
    fontSize: 16,
  },
  localSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
  },
  localSearchInput: {
    flex: 1,
    fontFamily: 'mmedium',
    fontSize: 14,
    color: '#000',
    height: '100%',
  },
});
