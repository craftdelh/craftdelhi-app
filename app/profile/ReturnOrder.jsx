import {  ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ProfileHeader from './ProfileHeader';
import ActionSheet from 'react-native-actions-sheet';
import ReturnInfo from './ReturnInfo';
import { SafeAreaView } from 'react-native-safe-area-context';

const returnOrders = [
  {
    id: '1',
    status: 'Pending',
    date: '01 May - 2025',
    price: '₹ 1,299.00',
    productTitle: 'Wireless Earbuds - Noise Cancelling, 24H Playback',
    image:
      'https://m.media-amazon.com/images/I/61cWhbsrKjL._AC_UF1000,1000_QL80_.jpg',
  },
  {
    id: '2',
    status: 'Approved',
    date: '03 May - 2025',
    price: '₹ 799.00',
    productTitle: 'Fitness Smartwatch - Heart Rate Monitor, GPS',
    image:
      'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: '3',
    status: 'Rejected',
    date: '05 May - 2025',
    price: '₹ 2,499.00',
    productTitle: 'Laptop Sleeve - Waterproof, 13 Inch',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXqWZWQe6qLmtsYFOQ-lXuwa2DCjbxEOrQhg&s',
  },
  {
    id: '4',
    status: 'Pending',
    date: '06 May - 2025',
    price: '₹ 499.00',
    productTitle: 'USB-C Hub Adapter - 6-in-1 for MacBook',
    image:
      'https://s.alicdn.com/@sc04/kf/Hf257fe83776f452e9ad3e225faa8fdfa6.jpg_720x720q50.jpg',
  },
  {
    id: '5',
    status: 'Approved',
    date: '08 May - 2025',
    price: '₹ 3,199.00',
    productTitle: 'Bluetooth Speaker - Waterproof & Portable',
    image:
      'https://images.unsplash.com/photo-1588436706487-9d55d73a39e3?auto=format&fit=crop&w=800&q=60',
  },
];


const ReturnOrder = () => {
  const AnimateSheetRef = useRef(null);
  const [selectInfo,setSelectedInfo]=useState()


  const handleInfo=(info)=>{
    setSelectedInfo(info)
    AnimateSheetRef.current?.show()

  }
  return (
    <View style={styles.container}>
      <ProfileHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Return Orders</Text>
        <View style={styles.divider} />

        {returnOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="box" size={60} color="#bbb" />
            <Text style={styles.emptyText}>You have no return orders</Text>
          </View>
        ) : (
          returnOrders.map((item, index) => (
            <View key={item.id}>
              <Animatable.View
                animation="slideInUp"
                duration={600}
                delay={index * 150}
                useNativeDriver
              >
                <View style={styles.card}>
                  <Image source={{ uri: item.image }} style={styles.image} />
                  <View style={styles.infoContainer}>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{`Price ${item.price}`}</Text>
                      <TouchableOpacity onPress={()=>handleInfo(item)}>
                        <Feather name="info" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.date}>{item.date}</Text>
                    <Text
                      style={[
                        styles.stockStatus,
                        {
                          color: item.status === 'Approved'
                        ? '#28B463'
                        : item.status === 'Pending'
                        ? '#F1C40F'
                        : '#E74C3C',
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.title}>{item.productTitle}</Text>
                <TouchableOpacity style={styles.askButton}>
    <Text style={styles.askText}>Want to buy again?</Text>
  </TouchableOpacity>
                <View style={styles.divider} />
              </Animatable.View>
            </View>
          ))
        )}
      </ScrollView>

      <ActionSheet ref={AnimateSheetRef}>
  <ReturnInfo order={selectInfo} onClose={() => AnimateSheetRef.current?.hide()} />
</ActionSheet>
    </View>
  );
};

export default ReturnOrder;

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
    fontFamily: 'msemibold',
  },
  stockStatus: {
    fontWeight: '600',
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'mbold',
  },
  title: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
    marginTop: 12,
  },
  askButton: {
  marginTop: 8,
  alignSelf: 'flex-start',
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 20,
},
askText: {
  fontSize: 13,
  fontWeight: '600',
  color:'#024A63',
  fontFamily:'mbold',
  textDecorationLine:'underline'
},

});
