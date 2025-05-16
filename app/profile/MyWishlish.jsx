import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

import { Feather } from '@expo/vector-icons';
import ProfileHeader from './ProfileHeader';

const orders = [
  {
    id: '1',
    status: 'Out Of Stock',
    date: '12 Sep - 2024',
    price: '₹ 1,000.00',
    productTitle: 'Acrylic Gift Boxes -  Clear Dustproof Protection ShowcaseClear Dustproof Protection Showcase..Clear Dustproof Protection Showcase.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-0rShayjD0P71gcyLdrtoi57iWSWkFnfUew&s',
  },
  {
    id: '2',
    status: 'Out Of Stock',
    date: '12 Sep - 2024',
    price: '₹ 1,000.00',
    productTitle: 'Acrylic Gift Boxes - Clear Dustproof Protection Showcase.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-0rShayjD0P71gcyLdrtoi57iWSWkFnfUew&s',
  },
  {
    id: '3',
    status: 'Available',
    date: '12 Sep - 2024',
    price: '₹ 1,000.00',
    productTitle: 'Acrylic Gift Boxes - Clear Dustproof Protection Showcase.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-0rShayjD0P71gcyLdrtoi57iWSWkFnfUew&s',
  },
];

const MyWishlist = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>My Wishlist</Text>
        <View style={styles.divider} />

       {orders.map((item, index) => (
  <TouchableOpacity key={item.id} onPress={() => console.log('Card pressed', item.id)}>
    <Animatable.View
      animation="slideInUp"
      duration={600}
      delay={index * 150} // Delay for staggered effect
      useNativeDriver
    >
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.infoContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{`Price ${item.price}`}</Text>
            <TouchableOpacity onPress={() => console.log('Delete pressed', item.id)}>
              <Feather name="trash-2" size={18} color="red" />
            </TouchableOpacity>
          </View>
          <Text style={styles.date}>{item.date}</Text>
          <Text
            style={[
              styles.stockStatus,
              {
                color: item.status === 'Available' ? '#28B463' : '#E74C3C',
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>{item.productTitle}</Text>
      <View style={styles.divider} />
    </Animatable.View>
  </TouchableOpacity>
))}


      </ScrollView>
    </SafeAreaView>
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
  },
});
