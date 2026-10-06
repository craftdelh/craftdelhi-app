import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Emptycart from '../../../assets/images/emptycart.svg'
import { Feather, Ionicons } from '@expo/vector-icons';
import ProfileHeader from './ProfileHeader';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist } from '../../../redux/WishListReducer';
import { router } from 'expo-router';

const MyWishlist = () => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.wishlist);

  return (
    <View style={styles.container}>
      <ProfileHeader />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>My Wishlist</Text>
        <Text style={styles.subTitle}>
          {wishlist.length === 0 ? "No items saved yet" : `${wishlist.length} items saved for later`}
        </Text>
        <View style={styles.divider} />

        {wishlist.length === 0 ? (
          <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={80} color="#024a63" />
            </View>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Save items that you like in your wishlist. Review them anytime and easily move them to the cart.
            </Text>
            
            <TouchableOpacity 
              style={styles.shopNowBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/Home')}
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </Animatable.View>
        ) : (
          <View style={styles.listContainer}>
            {wishlist.map((item, index) => (
              <Animatable.View
                key={item.id}
                animation="fadeInUp"
                duration={500}
                delay={index * 100}
                useNativeDriver
              >
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  style={styles.card}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image || 'https://placehold.co/100x100' }} style={styles.image} />
                    <TouchableOpacity 
                      style={styles.removeIconBtn} 
                      onPress={() => dispatch(removeFromWishlist(item))}
                    >
                      <Feather name="trash-2" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                    
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>₹{item.price}</Text>
                      <Text style={[styles.stockStatus, { color: item.status === 'Available' ? '#2ecc71' : '#e74c3c' }]}>
                        {item.status || 'Available'}
                      </Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.addToCartBtn}
                      activeOpacity={0.8}
                      onPress={() => {
                        /* Add to cart logic */
                        dispatch(removeFromWishlist(item)); // optionally remove after adding
                      }}
                    >
                      <Ionicons name="cart-outline" size={16} color="white" />
                      <Text style={styles.addToCartText}>Move to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MyWishlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'mbold',
    color: '#1A1A1A',
  },
  subTitle: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Montserrat',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E4F4',
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F5FBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'mbold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  shopNowBtn: {
    backgroundColor: '#024a63',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    shadowColor: '#024a63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shopNowText: {
    color: 'white',
    fontFamily: 'mbold',
    fontSize: 16,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    gap: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E4F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeIconBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  title: {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'mbold',
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'Montserrat',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontFamily: 'mbold',
    color: '#024a63',
  },
  stockStatus: {
    fontSize: 11,
    fontFamily: 'mbold',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addToCartText: {
    color: 'white',
    fontFamily: 'msemibold',
    fontSize: 12,
  },
});
