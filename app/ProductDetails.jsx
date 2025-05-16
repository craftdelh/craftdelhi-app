import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useRef } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import Search from '../components/Search';
import ProductDisplay from '../components/Productdetails/ProductDisplay';
import ProductRules from '../components/Productdetails/ProductRules';
import ProductReview from '../components/Productdetails/ProductReview';
import ProductStore from '../components/Productdetails/ProductStore';

const ProductDetails = () => {
    const { title, price, image, orders, rating,oldPrice,description } = useLocalSearchParams();
      const scrollY = useRef(new Animated.Value(0)).current;
    
  return (
    <SafeAreaView style={{backgroundColor:'white',flex:1}}>
         <View style={styles.header}>
             <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
    
            <Text style={styles.headerTitle}>Product View</Text>
    
            <TouchableOpacity onPress={()=>router.push('/(tabs)/Cart')}>
              <Feather name="shopping-cart" size={22} color="black" />
            </TouchableOpacity>
          </View>
          <Search/>
          <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
            {/* for image and price info */}
                <ProductDisplay
                    title={title}
                    price={price}
                    image={image}
                    orders={orders}
                    rating={rating}
                    oldPrice={oldPrice}
                    description={description}
                    thumbnails={[
    { type: 'image', uri: 'https://kudosgiftwrap.co.uk/cdn/shop/products/KLB14265_Copper_XL_Deep_cd1e79dc-98a3-423b-835a-95a727d6d6dd.jpg?v=1612255244' },
    { type: 'image', uri: 'https://www.woodgeekstore.com/cdn/shop/files/glass-tea-white-ash-aam-tray-set-oval-engraved3_5000x.jpg?v=1725355005' },
    { type: "video", "uri": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    { type: 'image', uri: 'https://www.jiomart.com/images/product/original/rvtiqvllql/kalra-magic-cartoon-theme-small-pocket-diary-with-pen-cute-doraemon-stationery-set-for-students-kids-and-children-perfect-birthday-return-gift-pack-2-multi-design-any-2-will-dispatch-unicon-product-images-orvtiqvllql-p609645880-0-202408022014.jpg?im=Resize=(1000,1000)' },
  ]}
                    />
                    <ProductRules/>
                    <ProductReview scrollY={scrollY} />
                    <ProductStore scrollY={scrollY}/>
          </Animated.ScrollView>
    </SafeAreaView>
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
  
})