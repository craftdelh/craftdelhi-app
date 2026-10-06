import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import HomeCards from '../cards/HomeCards';
import Sale from '../../../assets/images/sale.svg'
import Cart from '../../../assets/images/sellercart.svg'
import Time from '../../../assets/images/time.svg'
import Cancel from '../../../assets/images/cancel.svg'
import RecentOrders from './RecentOrders';

const OrderSummary = () => {
  const { user } = useUser();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSaleSummary = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}seller-store/getsalesummary`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (res.data?.status) {
        setSummary(res.data.store);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
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
      title: "Total Number Of Sales",
      count: summary?.total_sales || "0",
      change: "Updated now",
      colors: ['#FFE2E6', 'white'],
      icon: <Sale />
    },
    {
      title: "Total Number Of Orders",
      count: summary?.total_orders || "0",
      change: "Updated now",
      colors: ['#FFF4DE', 'white'],
      icon: <Cart />
    },
    {
      title: "Pending Orders",
      count: summary?.total_pending_orders || "0",
      change: "Updated now",
      colors: ['#DCFCE7', 'white'],
      icon: <Time />
    },
    {
      title: "Cancelled Orders",
      count: summary?.total_cancelled_orders || "0",
      change: "Updated now",
      colors: ['#F4E8FF', 'white'],
      icon: <Cancel />
    },
  ];

  if (loading) {
    return <ActivityIndicator size="large" color="#0B3C5D" style={{ marginTop: 20 }} />;
  }

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
