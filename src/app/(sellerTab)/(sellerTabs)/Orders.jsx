import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import HomeCards from '../../../../components/Seller/cards/HomeCards';
import OrderTables from '../../../../components/Seller/Home/OrderTables';
import Sale from '../../../../assets/images/sale.svg'
import Bag from '../../../../assets/images/bag.svg'
import Shield from '../../../../assets/images/shield.svg'
import Cancel from '../../../../assets/images/cancel.svg'
import axios from 'axios';
import { useUser } from '../../../../context/UserContext';

const Orders = () => {
    const navigation = useNavigation();
    const { user } = useUser();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSaleSummary = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}seller-store/getsalesummary`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
        if (res.data?.status) {
          setSummary(res.data.store);
        }
      } catch (error) {
        console.error("Summary Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (user?.token) {
        fetchSaleSummary();
      } else {
        setLoading(false);
      }
    }, [user]);

     const cardsData = [
      {
        title: "Total Number Of Orders",
        count: summary?.total_orders || "0",
        change: "Today Orders",
        colors: ['#FFE2E6', 'white'],
        icon: <Sale />
      },
      {
        title: "Total Delivered Orders",
        count: summary?.total_delivered_orders || "0",
        change: "+8 from yesterday",
        colors: ['#FFF4DE', 'white'],
        icon: <Bag />
      },
      {
        title: "Total Shipped Orders",
        count: summary?.total_shipped_orders || "0",
        change: "+8 from yesterday",
        colors: ['#DCFCE7', 'white'],
        icon: <Shield />
      },
      {
        title: "Total Cancelled Orders",
        count: summary?.total_cancelled_orders || "0",
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
      {loading ? (
        <ActivityIndicator size="small" color="#0B3C5D" />
      ) : (
        <HomeCards cardsData={cardsData}/>
      )}

      {/* We use OrderTables because it has the full columns (Payment Status, Note) and Actions */}
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
  