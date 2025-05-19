import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import HomeCards from '../cards/HomeCards';
import OrderTables from './OrderTables';

const OrderSummary = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Sale Summary</Text>

      {/* Gradient Card */}
      <HomeCards/>

      <OrderTables/>
    
    </View>
  );
};

export default OrderSummary;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 50,
  },
  header: {
    fontFamily: 'mbold',
    fontSize: 18,
    marginBottom: 20,
  },
 
});
