import { Entypo } from '@expo/vector-icons';
import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

const OrderActionSheet = ({ order, onClose }) => {
  console.log(order);
  return (
   <SafeAreaView style={{backgroundColor:'white'}}>
    <View style={{ alignItems: 'flex-end', padding: 16 }}>
  <TouchableOpacity onPress={onClose}>
    <Entypo name="cross" size={28} color="black" />
  </TouchableOpacity>
</View>


     <ScrollView contentContainerStyle={styles.container}>
      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={{height:1,borderTopWidth:1,borderColor:'#ccc',marginVertical:5}}/>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>{order.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Order Date:</Text>
          <Text style={styles.value}>{order.date}</Text>
        </View>
      </View>

      {/* Buyer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buyer Information</Text>
        <View style={{height:1,borderTopWidth:1,borderColor:'#ccc',marginVertical:5}}/>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{order.customerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>abc@example.com</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>+91 9876543210</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Shipping Address:</Text>
          <Text style={styles.value}>123, MG Road, Bengaluru, India</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Buyer Notes:</Text>
          <Text style={styles.value}>{order.customerNote}</Text>
        </View>
      </View>

      {/* Product List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products</Text>
        <View style={{height:1,borderTopWidth:1,borderColor:'#ccc',marginVertical:5}}/>
        
        <View style={styles.row}>
          <Text style={styles.label}>Product Name :</Text>
          <Text style={styles.value}>{order.productName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Qty :</Text>
          <Text style={styles.value}>{order.quantity}</Text>
        </View>
         <View style={styles.row}>
          <Text style={styles.label}>Price :</Text>
          <Text style={styles.value}>₹{order.totalAmount}</Text>
        </View>
      </View>

      {/* Order Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status</Text>
         <View style={{height:1,borderTopWidth:1,borderColor:'#ccc',marginVertical:5}}/>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: '#2196F3' }]}>{order.status}</Text>
        </View>
      </View>

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
         <View style={{height:1,borderTopWidth:1,borderColor:'#ccc',marginVertical:5}}/>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>Credit Card</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID:</Text>
          <Text style={styles.value}>TXN123456789</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={[styles.value, { fontWeight: 'bold' }]}>₹{order.totalAmount}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information :</Text>
         <View style={{height:1,borderTopWidth:1,borderColor:'#ccc',marginVertical:5}}/>
        <View style={styles.row}>
          <Text style={styles.label}>Shipping Address : </Text>
          <Text style={styles.value}>Data</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Date :</Text>
          <Text style={styles.value}>Data</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Shipping Cost :</Text>
          <Text style={styles.value}>Data</Text>
        </View>
      </View>
    </ScrollView>
   </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    fontFamily:'mbold'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: '500',
    width: 140,
    color: '#024A63',
    fontFamily:'msemibold',
    fontSize:15
  },
  value: {
    flex: 1,
    color: '#222',
    fontFamily:'msemibold',
    textAlign:'right'
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: {
    flex: 2,
    fontWeight: '500',
    color: '#333',
  },
  productQty: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
  },
  productPrice: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
    color: '#000',
  },
});

export default OrderActionSheet;
