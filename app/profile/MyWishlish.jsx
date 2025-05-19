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
import Emptycart from '../../assets/images/emptycart.svg'

import { Feather } from '@expo/vector-icons';
import ProfileHeader from './ProfileHeader';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist } from '../../redux/WishListReducer';
import { SafeAreaView } from 'react-native-safe-area-context';



const MyWishlist = () => {
    const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  // console.log('wiwiwi',wishlist);
  return (
    <View style={styles.container}>
      <ProfileHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>My Wishlist</Text>
        <View style={styles.divider} />

    {wishlist.length === 0 ? (
  <View style={{ alignItems: 'center', marginTop: 40 }}>
   <Emptycart width={50} height={50} />
    <Text style={{ fontSize: 16, fontFamily: 'msemibold', color: '#888',marginTop:20 }}>
      Your wishlist is empty.
    </Text>
  </View>
) : (
  wishlist.map((item, index) => (
    <TouchableOpacity key={item.id} onPress={() => console.log('Card pressed', item.id)}>
      <Animatable.View
        animation="slideInUp"
        duration={600}
        delay={index * 150}
        useNativeDriver
      >
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{`Price ${item.price}`}</Text>
              <TouchableOpacity onPress={() => dispatch(removeFromWishlist(item))}>
                <Feather name="trash-2" size={18} color="red" />
              </TouchableOpacity>
            </View>
            <Text style={styles.date}>12 Sep - 2024</Text>
            <Text
              style={[
                styles.stockStatus,
                {
                  color: item.status === 'Available' ? '#28B463' : '#E74C3C',
                },
              ]}
            >
              Available
            </Text>
          </View>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.divider} />
      </Animatable.View>
    </TouchableOpacity>
  ))
)}



      </ScrollView>
    </View>
  );
};

export default MyWishlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'mbold',
    marginBottom: 5,
    color: '#2E004F',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 10,
    gap: 12,
    backgroundColor: '#fff',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontFamily:'msemibold'
  },
  stockStatus: {
    fontWeight: '600',
    fontSize: 13,
    marginTop: 2,
    fontFamily:'mbold'
  },
  title: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
    fontFamily:'mbold'
  },
  description:{
     fontSize: 14,
    color: 'gray',
    fontWeight: '600',
  }
});
