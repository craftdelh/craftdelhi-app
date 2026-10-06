import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import HomeCards from '../../../../components/Seller/cards/HomeCards';
import OrderTables from '../../../../components/Seller/Home/OrderTables';
import Sale from '../../../../assets/images/sale.svg'
import Bag from '../../../../assets/images/bag.svg'
import Shield from '../../../../assets/images/shield.svg'
import Cancel from '../../../../assets/images/cancel.svg'

const Orders = () => {
    const navigation = useNavigation();
     const cardsData = [
      {
        title: "Total Number Of Orders",
        count: "87",
        change: "+8 from yesterday",
        colors: ['#FFE2E6', 'white'],
        icon: <Sale />
      },
      {
        title: "Total Delivered Orders",
        count: "12",
        change: "+8 from yesterday",
        colors: ['#FFF4DE', 'white'],
        icon: <Bag />
      },
      {
        title: "Total Shipped Orders",
        count: "14",
        change: "+8 from yesterday",
        colors: ['#DCFCE7', 'white'],
        icon: <Shield />
      },
      {
        title: "Total Cancelled Orders",
        count: "32",
        change: "+8 from yesterday",
        colors: ['#F4E8FF', 'white'],
        icon: <Cancel />
      },
    ];
  return (
        <View style={styles.container}>
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
        <Feather name="menu" size={24} color="black" />
      </TouchableOpacity>
  
      <Text style={styles.title}>Orders</Text>
  
      <View style={styles.sideIcon} />
    </View>

      <ScrollView showsVerticalScrollIndicator={false}>
         <View style={styles.wrapper}>
      <Text style={styles.header}>Order Summary</Text>

      {/* Gradient Card */}
      <HomeCards cardsData={cardsData}/>

      <OrderTables/>
    
    </View>
      </ScrollView>
    
  </View>
  
     
    );
  };
  
  export default Orders;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
      padding: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom:10
    },
    title: {
      fontFamily: 'mbold',
      fontSize: 16,
      textAlign: 'center',
    },
    sideIcon: {
      width: 24, 
    },
    wrapper: {
    marginTop: 50,
  },
  header: {
    fontFamily: 'mbold',
    fontSize: 18,
    marginBottom: 20,
  },
  });
  
  