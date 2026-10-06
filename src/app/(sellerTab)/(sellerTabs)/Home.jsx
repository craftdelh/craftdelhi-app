import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import OrderSummary from '../../../../components/Seller/Home/OrderSummary';

const Home = () => {
  const navigation = useNavigation();

  return (
      <View style={styles.container}>
  <View style={styles.headerRow}>
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
      <Feather name="menu" size={24} color="black" />
    </TouchableOpacity>

    <Text style={styles.title}>Dashboard</Text>

    <View style={styles.sideIcon} />
  </View>

  <ScrollView showsVerticalScrollIndicator={false}>
    <OrderSummary/>
  </ScrollView>
</View>

   
  );
};

export default Home;

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
    marginBottom:15
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',
  },
  sideIcon: {
    width: 24, 
  },
});

