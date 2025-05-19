import { Animated,  StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useRef } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import Search from '../components/Search';
import ProductDisplay from '../components/Productdetails/ProductDisplay';
import ProductRules from '../components/Productdetails/ProductRules';
import ProductReview from '../components/Productdetails/ProductReview';
import ProductStore from '../components/Productdetails/ProductStore';
import Chat from '../assets/images/chatnow.svg'
import Buy from '../assets/images/buynow.svg'
import Cart from '../assets/images/cartnow.svg';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartReducer';
import ActionSheet from 'react-native-actions-sheet';
import Toast from 'react-native-toast-message';
import BuyNow from '../components/BuyNow';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProductDetails = () => {
    const actionSheetRef = useRef(null);
    const { id,title, price, image, orders, rating,oldPrice,description } = useLocalSearchParams();
    const item = {
  id, 
  title,
  price,
  image,
  orders,
  rating,
  oldPrice,
  description,
  quantity: 1
};
      const scrollY = useRef(new Animated.Value(0)).current;
  const cart = useSelector((state) => state.cart.cart);
    const cartItem = cart.find((c) => c.id === id);
    const dispatch = useDispatch();
    // console.log('cart',cart)

  return (
    <View style={{backgroundColor:'white',flex:1}}>
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
                id={id}
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


          <View style={styles.floatingBar}>
  <TouchableOpacity style={[styles.button, styles.chatButton]}>
    <Chat width={20} height={20} style={styles.iconSpacing} />
    <Text style={[styles.buttonText, { color: 'black' }]}>Chat Now</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={()=>actionSheetRef.current?.show()} style={[styles.button, styles.buyButton]}>
    <Buy width={20} height={20} style={styles.iconSpacing} />
    <Text style={styles.buttonText}>Buy Now</Text>
  </TouchableOpacity>

  {cartItem ? (
  <View style={[styles.button, styles.cartButton,{paddingHorizontal:5}]}>
    <Ionicons name="checkmark-done-circle" size={15} color="white" style={styles.iconSpacing} />
    <Text style={styles.buttonText}>Added to Cart</Text>
  </View>
) : (
  <TouchableOpacity onPress={() => {dispatch(addToCart(item));  Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      position: 'bottom',
      visibilityTime: 2000,
    }); }} style={[styles.button, styles.cartButton]}>
    <Cart width={20} height={20} style={styles.iconSpacing} />
    <Text style={styles.buttonText}>Add to Cart</Text>
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
    floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
   
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
      paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
 button: {
  flex: 1,
  marginHorizontal: 4,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  backgroundColor: '#024A63',
},
chatButton: {
  backgroundColor: '#FFC700',
},
buyButton: {
  backgroundColor: '#024A63',
},
cartButton: {
  backgroundColor: '#024A63',
},
buttonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600', // replace fontFamily if custom font causes issue on Android
},
iconSpacing: {
  marginRight: 8,
},

});

  
