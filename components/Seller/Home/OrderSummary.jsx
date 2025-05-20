import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import HomeCards from '../cards/HomeCards';
import OrderTables from './OrderTables';
import Sale from '../../../assets/images/sale.svg'
import Cart from '../../../assets/images/sellercart.svg'
import Time from '../../../assets/images/time.svg'
import Cancel from '../../../assets/images/cancel.svg'
import RecentOrders from './RecentOrders';

const OrderSummary = () => {
    const cardsData = [
  {
    title: "Total Number Of Sales",
    count: "87",
    change: "+8 from yesterday",
    colors: ['#FFE2E6', 'white'],
    icon: <Sale />
  },
  {
    title: "Total Number Of Orders",
    count: "2100",
    change: "+8 from yesterday",
    colors: ['#FFF4DE', 'white'],
    icon: <Cart />
  },
  {
    title: "Pending Orders",
    count: "14",
    change: "+8 from yesterday",
    colors: ['#DCFCE7', 'white'],
    icon: <Time />
  },
  {
    title: "Cancelled Orders",
    count: "32",
    change: "+8 from yesterday",
    colors: ['#F4E8FF', 'white'],
    icon: <Cancel />
  },
];
  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Sale Summary</Text>

      {/* Gradient Card */}
      <HomeCards cardsData={cardsData}/>

      {/* <OrderTables/> */}
      <RecentOrders/>
    
    </View>
  );
};

export default OrderSummary;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },
  header: {
    fontFamily: 'mbold',
    fontSize: 18,
    marginBottom: 20,
  },
 
});
