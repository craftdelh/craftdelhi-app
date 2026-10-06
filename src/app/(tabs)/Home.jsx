import React, { useState, useRef, useCallback } from 'react';
import {  ScrollView, StyleSheet, Text, View, RefreshControl, TouchableOpacity } from 'react-native';
import MyCarousel from '../../../components/home/Carousel';
import OurProducts from '../../../components/home/OurProducts';
import Justforyou from '../../../components/home/Justforyou';
import Feature from '../../../components/home/Feature';
import Search from '../../../components/Search';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';

const Home = () => {
  const cart = useSelector((state) => state.cart.cart);
  const [searchText, setSearchText] = useState('');
  const scrollViewRef = useRef(null);
  const [productsY, setProductsY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isSearching = searchText.length > 0;

  const handleExploreMore = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: productsY, animated: true });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate network wait, then bump key to force components to re-mount and fetch new data
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Craft<Text style={{color: '#EE6F69'}}>Delhi</Text></Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
             <Ionicons name="notifications-outline" size={22} color="#024A63" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => router.push('/(tabs)/Cart')}
          >
             <Ionicons name="cart-outline" size={22} color="#024A63" />
             {cart && cart.length > 0 && (
               <View style={styles.badge}>
                 <Text style={styles.badgeText}>{cart.length}</Text>
               </View>
             )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#EE6F69"]} tintColor="#EE6F69" />
        }
      >
        <Animatable.View animation="fadeInDown" duration={600} style={{ zIndex: 99, elevation: 99 }}>
          <Search searchText={searchText} setSearchText={setSearchText} />
        </Animatable.View>

        {!isSearching && (
          <Animatable.View animation="fadeIn" duration={800} key={refreshKey} style={{ zIndex: 1 }}>
            <MyCarousel />
            
            <View style={styles.introContainer}>
              <Text style={styles.introSubtitle}>INDIA'S CREATIVE MARKETPLACE</Text>
              <Text style={styles.introTitle}>Handmade products with a story</Text>
              <Text style={styles.introDescription}>
                Discover thoughtful gifts and original products directly from independent makers.
              </Text>
            </View>

            <View onLayout={(e) => setProductsY(e.nativeEvent.layout.y)}>
              <OurProducts />
            </View>
            <Justforyou />
            <Feature onExploreMore={handleExploreMore} />
            
          </Animatable.View>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  introContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#FAFAFC', 
  },
  introSubtitle: {
    fontSize: 10,
    color: '#EE6F69', 
    fontFamily: 'mbold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  introTitle: {
    fontSize: 22,
    color: '#024A63', 
    fontFamily: 'mbold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'mbold',
    color: '#024A63',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    backgroundColor: '#F5F6FA',
    padding: 8,
    borderRadius: 20,
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
  introDescription: {
    fontSize: 13,
    color: '#777',
    fontFamily: 'mmedium',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});
