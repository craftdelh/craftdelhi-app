import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from 'expo-router';
import { ScrollView } from 'react-native';
import HomeCards from '../../components/Seller/cards/HomeCards';
import Revenue from '../../assets/images/revenue.svg'
import Cash from '../../assets/images/cash.svg'
import Amount from '../../assets/images/amount.svg'
import Balance from '../../assets/images/balance.svg'
import PaymnetTable from '../../components/Seller/payment/PaymnetTable';

const payments = () => {
  const navigation = useNavigation();
  const cardsData = [
        {
          title: "Total Revenue",
          count: "Rs 4200.00",
          change: "No Order Today",
          colors: ['#FFE2E6', 'white'],
          icon: <Revenue />
        },
        {
          title: "Pending Payment",
          count: "Rs 200.00",
          change: "+8 from yesterday",
          colors: ['#FFF4DE', 'white'],
          icon: <Cash />
        },
        {
          title: "Refund Amount",
          count: "Rs 2000.00",
          change: "+8 from yesterday",
          colors: ['#DCFCE7', 'white'],
          icon: <Amount />
        },
        {
          title: "Total Amount Of Balance",
          count: "Rs 2000.00",
          change: "+8 from yesterday",
          colors: ['#F4E8FF', 'white'],
          icon: <Balance />,
          button:true
        },
      ];
  return (
    <View style={styles.container}>
  <View style={styles.headerRow}>
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
      <Feather name="menu" size={24} color="black" />
    </TouchableOpacity>

    <Text style={styles.title}>Payments</Text>

    <View style={styles.sideIcon} />
  </View>

  <ScrollView showsVerticalScrollIndicator={false}>
           <View style={styles.wrapper}>
        <Text style={styles.header}>Payment Summary</Text>
  
   <HomeCards cardsData={cardsData}/>
    <PaymnetTable/>
      </View>
        </ScrollView>
    </View>
  )
}

export default payments

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
   wrapper: {
    marginTop: 20,
  },
  header: {
    fontFamily: 'mbold',
    fontSize: 18,
    marginBottom: 20,
  },
});