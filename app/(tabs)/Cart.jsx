// ... imports
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import Emptycart from '../../assets/images/emptycart.svg'
import Location from '../../assets/images/location.svg'
import Chat from '../../assets/images/chatnow.svg'
import Buy from '../../assets/images/delivery2.svg'
import { Entypo, AntDesign } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux';
import { decrementQuantity, incrementQuantity, removeFromCart } from '../../redux/CartReducer'
import * as Haptics from 'expo-haptics';


const Cart = () => {
    const cart = useSelector((state) => state.cart.cart);
  console.log('cartsss', cart);
  const dispatch = useDispatch();

   const parseAmount = (value) => {
    const num = parseFloat(value?.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const totalProductAmount = cart.reduce((sum, item) => {
    return sum + parseAmount(item.price) * item.quantity;
  }, 0);

  const shippingFee = 150;
  const totalAmount = totalProductAmount + shippingFee;


  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
            <Emptycart width={50} height={50} />
          <Text style={styles.emptyText}>Your cart is empty!</Text>
          </View>
          <View style={{width:'100%'}}>
            <TouchableOpacity onPress={()=>router.push('/(tabs)/Home')} style={{backgroundColor:'#024A63',width:'100%',padding:20,borderRadius:10}}>
              <Text style={{color:'white',fontFamily:'mbold',textAlign:'center'}}>Home Page</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={{  backgroundColor: 'white', padding: 20 }}>
          {/* Address Block */}
          <TouchableOpacity activeOpacity={0.8}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Location width={50} height={50} />
              <Text style={styles.name}>Abhinav Bhatia</Text>
            </View>
            <View style={styles.addressRow}>
              <Text style={styles.phone}>+91 7206642153</Text>
              <Entypo name="chevron-right" size={24} color="black" />
            </View>
            <Text style={styles.addressText}>
              Street: Dr Pareeks Deafness Clinic, Yashodhan Apt No 1, 4 Bungalow, Nr Signal, Andheri (west)
            </Text>
          </TouchableOpacity>

          {/* Delivery Info */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Buy width={30} height={30} />
              <Text style={styles.deliveryHeading}>Guaranteed by 10 - 13 December</Text>
            </View>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Standard Delivery Charges</Text>
              <Text style={styles.deliveryValue}>Rs {shippingFee}</Text>
            </View>
          </View>

          {/* Product List */}
          <View style={{ marginTop: 20 }}>
            {cart.map(item => (
              <View key={item.id}>
                <View style={styles.divider} />
                <View style={styles.productCard}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <View style={styles.productHeader}>
                        <Text style={styles.price}>₹{parseAmount(item.price).toFixed(2)}</Text>
                        <TouchableOpacity onPress={() => dispatch(removeFromCart(item))}>
                          <AntDesign name="delete" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.discountedPrice}>₹{parseAmount(item.oldPrice).toFixed(2)}</Text>
                        

                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          onPress={() => {
                              if (item.quantity > 1) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                dispatch(decrementQuantity(item));
                              }
                            }}
                          style={styles.circleButton}
                        >
                          <Text style={styles.quantityBtnText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.quantityText}>{item.quantity}</Text>

                        <TouchableOpacity
                          onPress={() => {
                              dispatch(incrementQuantity(item));
                               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}
                          style={styles.circleButton}
                        >
                          <Text style={styles.quantityBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.productTitle, { marginTop: 10 }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                   <Text style={[styles.productTitle, { marginTop: 10,color:'gray' }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <TouchableOpacity style={styles.chatButton}>
                    <Chat width={20} height={20} />
                    <Text style={styles.chatText}>Chat With Seller</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Total Summary */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Product Amount</Text>
                <Text style={styles.summaryValue}>₹{totalProductAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping Fee</Text>
                <Text style={styles.summaryValue}>₹{shippingFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#EE6F69' }]}>Total Amount</Text>
                <Text style={[styles.summaryValue, { color: '#EE6F69' }]}>₹{totalAmount.toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={()=>router.push('/PlaceOrder')} style={styles.placeOrderBtn}>
                <Text style={styles.placeOrderText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default Cart

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 0.2,
    borderColor: 'gray',
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: 'mbold',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: 'mbold',
    fontSize: 16,
    marginTop: 20,
    color: '#666',
  },
  name: {
    color: '#EE6F69',
    fontFamily: 'mbold',
    fontSize: 15,
  },
  phone: {
    fontFamily: 'msemibold',
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  addressText: {
    fontFamily: 'mmedium',
    marginTop: 5,
  },
  deliveryHeading: {
    fontFamily: 'mbold',
    fontSize: 15,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  deliveryLabel: {
    color: 'gray',
    fontFamily: 'mbold',
    fontSize: 15,
  },
  deliveryValue: {
    fontFamily: 'mbold',
    fontSize: 15,
    color: '#EE6F69',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  productCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  productImage: {
    width: 120,
    height: 100,
    borderRadius: 10,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: 'mbold',
    fontSize: 14,
  },
  discountedPrice: {
    textDecorationLine: 'line-through',
    color: 'gray',
    fontFamily: 'mregular',
    fontSize: 12,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  circleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth:0.5
  },
  quantityBtnText: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#333',
  },
  quantityText: {
    fontFamily: 'mbold',
    fontSize: 16,
    width: 30,
    textAlign: 'center',
  },
  productTitle: {
    fontFamily: 'mbold',
    fontSize: 13,
  },
  chatButton: {
    backgroundColor: '#FFC700',
    padding: 12,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chatText: {
    fontFamily: 'mbold',
    fontSize: 12,
  },
  summaryBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontFamily: 'mbold',
    fontSize: 14,
  },
  summaryValue: {
    fontFamily: 'mbold',
    fontSize: 14,
  },
  placeOrderBtn: {
    backgroundColor: '#024A63',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  placeOrderText: {
    color: 'white',
    fontFamily: 'mbold',
    fontSize: 16,
  },
})
