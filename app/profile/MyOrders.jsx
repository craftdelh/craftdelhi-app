import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import ProfileHeader from './ProfileHeader';
import { AntDesign } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ActionSheet from "react-native-actions-sheet";
import TrackOrder from './TrackOrder';
import Book from '../../assets/images/book.svg'
import ReturnOrderRequest from './ReturnOrderRequest';
import WriteReview from './WriteReview';
const orders = [
  {
    id: '1',
    status: 'Processing',
    date: '12 Sep - 2024',
    price: '₹ 1,000.00',
    qty: 1,
    productTitle: 'Acrylic Gift Boxes - Clear Dustproof Protection Showcase.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-0rShayjD0P71gcyLdrtoi57iWSWkFnfUew&s',
  },
  {
    id: '2',
    status: 'Delivered',
    date: '12 Sep - 2024',
    price: '₹ 1,000.00',
    qty: 1,
    productTitle: 'Acrylic Gift Boxes - Clear Dustproof Protection Showcase.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-0rShayjD0P71gcyLdrtoi57iWSWkFnfUew&s',
  },
  {
    id: '3',
    status: 'Cancelled',
    date: '12 Sep - 2024',
    price: '₹ 1,000.00',
    qty: 1,
    productTitle: 'Acrylic Gift Boxes - Clear Dustproof Protection Showcase.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-0rShayjD0P71gcyLdrtoi57iWSWkFnfUew&s',
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Processing':
      return '#B38B00';
    case 'Delivered':
      return '#28B463';
    case 'Cancelled':
      return '#E74C3C';
    default:
      return '#999';
  }
};

const MyOrders = () => {
  const [visibleOrders, setVisibleOrders] = useState([]);
  const trackSheetRef = useRef(null);
const returnSheetRef = useRef(null);
const reviewSheetRef = useRef(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);


  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= orders.length) {
        clearInterval(interval);
        return;
      }
      setVisibleOrders((prev) => [...prev, orders[i]]);
      i++;
    }, 100);

    return () => clearInterval(interval);
  }, []);

   const openTrackOrderSheet = (order) => {
    setSelectedOrder(order);
   setTimeout(() => {
    trackSheetRef.current?.show();
  }, 100);
  };

  const retrunRequest=(order)=>{
    setSelectedReturn(order);
   setTimeout(() => {
    returnSheetRef.current?.show();
  }, 100);
  }
  const reviewRequest=(order)=>{
    setSelectedReview(order);
   setTimeout(() => {
    reviewSheetRef.current?.show();
  }, 100);
  }

  const renderOrder = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.orderCard}>
      <View style={styles.topRow}>
        {/* Image */}
        <Image source={{ uri: item.image }} style={styles.productImage} />

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
          <Text style={styles.price}>Price {item.price}</Text>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.qty}>Qty: {item.qty < 10 ? `0${item.qty}` : item.qty}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          {item.status === 'Delivered' && (
            <>
              <TouchableOpacity onPress={()=>reviewRequest(item)}>
                <Text style={styles.reviewBtn}>Write Review</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => retrunRequest(item)} style={{ marginTop: 6 }}>
                <Text style={styles.returnBtn}>Return Request</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'Processing' && (
           <TouchableOpacity onPress={() => openTrackOrderSheet(item)}>

              <Text style={styles.trackBtn}>Track Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Title below card */}
      <Text style={styles.title}>{item.productTitle}</Text>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}
      >
        <Text style={{ color: '#1E90FF', fontWeight: 'bold' }}>See Order</Text>
        <AntDesign name="arrowright" size={20} color="#1E90FF" />
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader />
      <FlatList
        data={visibleOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        ListHeaderComponent={() => (
         <>
          
          <View style={styles.header}>
            
            <Text style={styles.sectionTitle}>My Orders</Text>
            <View style={styles.divider} />
          </View>
         </>
        )}
        ListEmptyComponent={() => (
    <View style={styles.emptyContainer}>
       <Book width={50} height={50} />
      <Text style={styles.emptyText}>Your history is empty</Text>
    </View>
  )}
  contentContainerStyle={visibleOrders.length === 0 ? styles.emptyContent : styles.content}
      />

      <ActionSheet ref={trackSheetRef}>
  <TrackOrder order={selectedOrder} onClose={() => trackSheetRef.current?.hide()} />
</ActionSheet>

<ActionSheet ref={returnSheetRef}>
  <ReturnOrderRequest order={selectedReturn} onClose={() => returnSheetRef.current?.hide()} />
</ActionSheet>

<ActionSheet ref={reviewSheetRef}>
  <WriteReview order={selectedReview} onClose={() => reviewSheetRef.current?.hide()} />
</ActionSheet>

    </SafeAreaView>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    padding:20,
   
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E004F',
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  orderCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
     marginLeft:20,
    marginRight:20
    
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  infoSection: {
    flex: 1,
    marginLeft: 12,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginVertical: 2,
  },
  qty: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  actionSection: {
    width: 100,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    right: 20,
    gap: 10,
  },
  reviewBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E67E22',
  },
  returnBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E90FF',
  },
  trackBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E90FF',
  },
  title: {
    marginTop: 10,
    fontSize: 13,
    color: '#222',
    fontWeight: '500',
  },
  emptyText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#888',
  marginTop:10
},emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 100,
},
});
