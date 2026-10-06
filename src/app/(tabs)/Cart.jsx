import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Platform, ActivityIndicator } from 'react-native'
import React, { useState, useCallback } from 'react'
import Emptycart from '../../../assets/images/emptycart.svg'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux';
import { decrementQuantity, incrementQuantity, removeFromCart } from '../../../redux/CartReducer'
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { SafeAreaView } from 'react-native-safe-area-context'

const Cart = () => {
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchSelectedAddress = async () => {
        setLoadingAddress(true);
        try {
          const userStr = await AsyncStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            const token = user.token;
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_BASE_URL}useraddress/get`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.status) {
              const fetchedAddresses = res.data.data || [];
              const savedSelectedId = await AsyncStorage.getItem('@selected_address_id');
              let addr = null;
              if (savedSelectedId) {
                addr = fetchedAddresses.find(a => String(a.id) === String(savedSelectedId));
              }
              if (!addr && fetchedAddresses.length > 0) {
                addr = fetchedAddresses[0];
              }
              setSelectedAddress(addr);
            }
          }
        } catch (err) {
          console.error("Error fetching address in Cart:", err);
        } finally {
          setLoadingAddress(false);
        }
      };
      fetchSelectedAddress();
    }, [])
  );

  const parseAmount = (value) => {
    const num = parseFloat(String(value)?.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const totalProductAmount = cart.reduce((sum, item) => {
    return sum + parseAmount(item.price) * item.quantity;
  }, 0);

  const shippingFee = 200; // Updated to match ₹200 from web screenshot
  const totalAmount = totalProductAmount + (cart.length > 0 ? shippingFee : 0);

  return (
    <View style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerSubtitle}>Ready to bring these handcrafted joys home?</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={60} color="#024A63" />
            </View>
            <Text style={styles.emptyText}>Your cart is empty!</Text>
            <Text style={styles.emptySubText}>Looks like you haven't added anything yet.</Text>
          </View>
          <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/Home')} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          {/* Top Banner */}
          <View style={styles.topBanner}>
            <View>
              <Text style={styles.bannerTitle}>Your Shopping Cart</Text>
              <Text style={styles.bannerSubtitle}>Review items before checkout</Text>
            </View>
            <View style={styles.itemBadge}>
              <Text style={styles.itemBadgeText}>{cart.length} item(s)</Text>
            </View>
          </View>

          {/* Products List */}
          {cart.map((item, index) => (
            <View key={item.id || index} style={styles.card}>
              <View style={styles.productRow}>
                <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productTitle} numberOfLines={2}>{item.title || item.name}</Text>
                    <Text style={styles.productPrice}>₹{parseAmount(item.price).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {item.description || 'A beautiful handcrafted item perfect for gifting.'}
                  </Text>
                  
                  <View style={styles.productActions}>
                    <View style={styles.quantityPill}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => {
                          if (item.quantity > 1) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            dispatch(decrementQuantity(item));
                          }
                        }}
                      >
                        <Ionicons name="remove" size={16} color="#333" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          dispatch(incrementQuantity(item));
                        }}
                      >
                        <Ionicons name="add" size={16} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.removeBtn}
                      onPress={() => dispatch(removeFromCart(item))}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EE6F69" />
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Delivery Options Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Delivery Options</Text>
            <View style={styles.deliveryInfoRow}>
              <Ionicons name="paper-plane-outline" size={24} color="#333" style={{ marginTop: 2 }} />
              {loadingAddress ? (
                 <ActivityIndicator size="small" color="#024A63" style={{ flex: 1, alignItems: 'flex-start' }} />
              ) : selectedAddress ? (
                <Text style={styles.addressText}>
                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country} - {selectedAddress.postal_code}
                </Text>
              ) : (
                <Text style={[styles.addressText, { color: '#e74c3c' }]}>
                  No delivery address selected. Please add one.
                </Text>
              )}
              
              <TouchableOpacity onPress={() => router.push('/profile/DeliveryAddress')}>
                <Text style={styles.changeAddressText}>{selectedAddress ? 'Change Address' : 'Add Address'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Method Card */}
          <View style={styles.card}>
            <View style={styles.deliveryMethodHeader}>
              <Text style={styles.cardSectionTitle}>Delivery Method</Text>
              <View style={styles.badgeStandard}>
                <Text style={styles.badgeStandardText}>Standard</Text>
              </View>
            </View>
            <View style={styles.deliveryMethodRow}>
              <View style={styles.truckIconBox}>
                 <Ionicons name="bus" size={20} color="#EE6F69" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.expectedDeliveryTitle}>Expected Delivery</Text>
                <Text style={styles.expectedDeliveryDate}>9 - 10 October</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.deliveryPriceText}>₹{shippingFee}</Text>
                <Text style={styles.deliveryTaxText}>incl. taxes</Text>
              </View>
            </View>
          </View>

          {/* Order Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Selected</Text>
              <Text style={styles.summaryValue}>{cart.length}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{totalProductAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValueFree}>₹{shippingFee}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalPayableLabel}>Total Payable</Text>
              <Text style={styles.totalPayableValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
            <Text style={styles.taxInfoText}>Taxes included. Invoice available at checkout.</Text>

            <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/Payment')}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}
    </View>
  )
}

export default Cart

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: 'mbold',
    fontSize: 22,
    color: '#024A63',
  },
  headerSubtitle: {
    fontFamily: 'mmedium',
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  emptyCartContainer: {
    flex: 1,
    backgroundColor: '#f8f9fd',
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e3eff3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: 'mbold',
    fontSize: 20,
    color: '#333',
  },
  emptySubText: {
    fontFamily: 'mmedium',
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#024A63',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontFamily: 'mbold',
    fontSize: 16,
  },
  scrollView: {
    backgroundColor: '#f8f9fd',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },
  topBanner: {
    backgroundColor: '#024A63',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontFamily: 'mbold',
    fontSize: 18,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#aed2e0',
    fontFamily: 'mmedium',
    fontSize: 12,
  },
  itemBadge: {
    backgroundColor: '#267b9c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  itemBadgeText: {
    color: '#fff',
    fontFamily: 'mbold',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  productRow: {
    flexDirection: 'row',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productDetails: {
    flex: 1,
    marginLeft: 15,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTitle: {
    fontFamily: 'mbold',
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  productPrice: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#EE6F69',
  },
  productDescription: {
    fontFamily: 'mregular',
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    lineHeight: 16,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyText: {
    fontFamily: 'mbold',
    fontSize: 14,
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#EE6F69',
    fontFamily: 'msemibold',
    fontSize: 13,
    marginLeft: 4,
  },
  cardSectionTitle: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    fontFamily: 'mmedium',
    fontSize: 13,
    color: '#555',
    marginHorizontal: 10,
    lineHeight: 18,
  },
  changeAddressText: {
    color: '#0066cc',
    fontFamily: 'mbold',
    fontSize: 13,
    marginTop: 2,
  },
  deliveryMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  badgeStandard: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeStandardText: {
    color: '#1e8e3e',
    fontFamily: 'mbold',
    fontSize: 11,
  },
  deliveryMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef1f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expectedDeliveryTitle: {
    fontFamily: 'msemibold',
    fontSize: 13,
    color: '#333',
  },
  expectedDeliveryDate: {
    fontFamily: 'mmedium',
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deliveryPriceText: {
    fontFamily: 'mbold',
    fontSize: 15,
    color: '#333',
  },
  deliveryTaxText: {
    fontFamily: 'mregular',
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'mmedium',
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontFamily: 'msemibold',
    fontSize: 14,
    color: '#333',
  },
  summaryValueFree: {
    fontFamily: 'msemibold',
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  totalPayableLabel: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#EE6F69',
  },
  totalPayableValue: {
    fontFamily: 'mbold',
    fontSize: 18,
    color: '#EE6F69',
  },
  taxInfoText: {
    fontFamily: 'mregular',
    fontSize: 11,
    color: '#888',
    marginBottom: 20,
  },
  checkoutButton: {
    backgroundColor: '#024A63',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontFamily: 'mbold',
    fontSize: 16,
  }
});
