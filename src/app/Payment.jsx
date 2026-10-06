import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator, KeyboardAvoidingView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { router, useFocusEffect } from 'expo-router';
import { cleanCart } from '../../redux/CartReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import Toast from 'react-native-toast-message';

const Payment = () => {
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBill, setShowBill] = useState(true);
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  // WebView state for Razorpay
  const [showGateway, setShowGateway] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState('');

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
          console.error("Error fetching address in Payment:", err);
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

  const subTotal = cart.reduce((sum, item) => sum + parseAmount(item.price) * item.quantity, 0);
  const deliveryCharge = 0; // Set to 0 to match screenshot "FREE"
  const grandTotal = subTotal + (cart.length > 0 ? deliveryCharge : 0);
  const discountAmount = (grandTotal * discount) / 100;
  const finalAmount = grandTotal - discountAmount;

  const expectedDelivery = (() => {
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() + 3);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  })();

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'GRAB10') {
      setDiscount(10);
      setErrorMessage('');
    } else if (code === 'GRAB20') {
      setDiscount(20);
      setErrorMessage('');
    } else {
      setDiscount(0);
      setErrorMessage('Invalid Promo Code');
    }
  };

  const verifyRazorpayPayment = async (data, token) => {
    setLoading(true);
    setShowGateway(false);
    try {
      const regularOrderDetails = {
        total_amount: finalAmount,
        shipping_address_id: selectedAddress.id,
        items: cart.map((item) => ({
          seller_id: item.seller_id || item.storeId || item.sellerId,
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: parseAmount(item.price),
        })),
      };

      const verifyPayload = {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
        orderDetails: regularOrderDetails,
      };

      const verifyRes = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}order/razorpay/verify`,
        verifyPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (verifyRes.data.status) {
        Toast.show({ type: 'success', text1: 'Order Successful', text2: 'Your payment was verified and the order is placed!' });
        dispatch(cleanCart());
        setTimeout(() => {
          router.push('/profile/MyOrders');
        }, 1000);
      } else {
        Toast.show({ type: 'error', text1: 'Verification Failed', text2: verifyRes.data.message || 'Could not verify payment.' });
      }
    } catch (error) {
      console.error("Razorpay Verify Error:", error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to verify payment with server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      Toast.show({ type: 'error', text1: 'Empty Cart', text2: 'Please add items to your cart first.' });
      return;
    }
    if (!selectedAddress) {
      Toast.show({ type: 'error', text1: 'Address Required', text2: 'Please select a delivery address.' });
      return;
    }
    
    setLoading(true);

    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.token) {
        Toast.show({ type: 'error', text1: 'Login Required', text2: 'Please login to place an order.' });
        setLoading(false);
        return;
      }
      const token = user.token;

      // 1. Create Order via Backend API
      const createOrderRes = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}order/razorpay/create`,
        {
          amount: Number(finalAmount.toFixed(2)),
          currency: "INR",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!createOrderRes.data.status) {
        Toast.show({ type: 'error', text1: 'Payment Error', text2: 'Failed to initiate payment.' });
        setLoading(false);
        return;
      }

      const orderData = createOrderRes.data.data;
      const checkoutKey = orderData?.key_id || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
      const razorpayOrderId = orderData?.order_id || orderData?.id;

      if (!checkoutKey || !razorpayOrderId) {
        Toast.show({ type: 'error', text1: 'Payment Error', text2: 'Payment could not be started due to missing keys.' });
        setLoading(false);
        return;
      }

      // 2. Prepare HTML for WebView
      const razorpayOptions = {
        key: checkoutKey,
        amount: orderData.amount || Math.round(finalAmount * 100),
        currency: orderData.currency || "INR",
        name: "Craft Delhi",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          email: user.email || undefined,
          contact: user.phone || undefined
        },
        theme: {
          color: "#024a63"
        }
      };

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="background-color: #f9f9f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <h2 style="font-family: sans-serif; color: #333;">Loading Secure Payment...</h2>
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <script>
              var options = ${JSON.stringify(razorpayOptions)};
              options.handler = function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', data: response }));
              };
              options.modal = {
                ondismiss: function(){
                  window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'dismissed' }));
                }
              };
              setTimeout(function(){
                try {
                  var rzp1 = new Razorpay(options);
                  rzp1.on('payment.failed', function (response){
                     window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'failed', data: response.error }));
                  });
                  rzp1.open();
                } catch (e) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'failed', data: { description: e.message } }));
                }
              }, 500);
            </script>
          </body>
        </html>
      `;

      setPaymentHtml(htmlContent);
      setShowGateway(true);
      setLoading(false);

    } catch (error) {
      console.error("Checkout Error:", error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong during checkout.' });
      setLoading(false);
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const res = JSON.parse(event.nativeEvent.data);
      if (res.status === 'success') {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user.token) {
          verifyRazorpayPayment(res.data, user.token);
        }
      } else if (res.status === 'dismissed') {
        setShowGateway(false);
        Toast.show({ type: 'error', text1: 'Payment Cancelled', text2: 'You closed the payment gateway.' });
      } else if (res.status === 'failed') {
        console.error("Razorpay WebView Error Payload:", JSON.stringify(res.data, null, 2));
        setShowGateway(false);
        Toast.show({ type: 'error', text1: 'Payment Failed', text2: res.data?.description || res.data?.message || 'Something went wrong.' });
      }
    } catch (err) {
      console.error("WebView Message Parsing Error:", err);
      setShowGateway(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.safeArea} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Top Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Secure Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Expected Delivery */}
        <View style={[styles.card, styles.rowCenter, { paddingVertical: 12 }]}>
          <Ionicons name="car-outline" size={20} color="#024a63" />
          <Text style={styles.deliveryText}>
            Expected Delivery: <Text style={styles.deliveryDate}>{expectedDelivery}</Text>
          </Text>
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <View style={styles.addressHeaderRow}>
            <View style={styles.rowCenterTitle}>
              <View style={styles.iconBox}>
                <Ionicons name="location" size={20} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
          </View>

          <View style={styles.addressRowContent}>
            <Ionicons name="navigate-outline" size={18} color="#555" style={{ marginTop: 2, marginRight: 8 }} />
            {loadingAddress ? (
               <ActivityIndicator size="small" color="#024a63" style={{ flex: 1, alignItems: 'flex-start' }} />
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
              <Text style={styles.changeAddressBtn}>{selectedAddress ? 'Change Address' : 'Add Address'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.securePaymentBox}>
            <View style={styles.secureIconBox}>
              <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.secureTitle}>Secure Payment</Text>
              <Text style={styles.secureSubtitle}>Your transaction is encrypted and secure with Razorpay</Text>
            </View>
          </View>
        </View>

        {/* Info Cards Row */}
        <View style={styles.infoRow}>
          <View style={[styles.card, styles.infoCard]}>
            <View style={styles.infoIconBoxBlue}>
              <Ionicons name="car" size={18} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.infoSubtitle}>Fast Delivery</Text>
              <Text style={styles.infoTitle}>3-5 Business Days</Text>
            </View>
          </View>
          <View style={{ width: 10 }} />
          <View style={[styles.card, styles.infoCard]}>
            <View style={styles.infoIconBoxPurple}>
              <Ionicons name="sparkles" size={18} color="#a855f7" />
            </View>
            <View>
              <Text style={styles.infoSubtitle}>Premium Quality</Text>
              <Text style={styles.infoTitle}>Crafted with Care</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <View style={styles.summaryHeaderRow}>
            <Text style={[styles.sectionTitle, { marginTop: 4 }]}>🧾 Order Summary</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>Summary</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBill(!showBill)} style={styles.viewBillRow}>
                <Text style={styles.viewBillText}>{showBill ? 'Hide Bill' : 'View Bill'}</Text>
                <Ionicons name={showBill ? "chevron-up" : "chevron-down"} size={16} color="#555" />
              </TouchableOpacity>
            </View>
          </View>

          {showBill && (
            <View style={styles.billContainer}>
              {cart.map((item, index) => (
                <View key={index} style={styles.billItemRow}>
                  <Text style={styles.billItemName} numberOfLines={1}>{item.title || item.name}</Text>
                  <Text style={styles.billItemQty}>x{item.quantity}</Text>
                  <Text style={styles.billItemPrice}>₹{(parseAmount(item.price) * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.billItemRow}>
                <Text style={styles.billItemName}>Delivery Charges</Text>
                <Text style={[styles.billItemPrice, { color: '#16a34a' }]}>FREE</Text>
              </View>
              <View style={styles.billDivider} />
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{cart.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charges</Text>
            <Text style={[styles.summaryValue, { color: '#16a34a' }]}>FREE</Text>
          </View>

          {/* Promo Code */}
          <View style={styles.promoContainer}>
            <Text style={styles.promoTitle}>Have a Promo Code?</Text>
            <View style={styles.promoInputColumn}>
              <TextInput 
                style={styles.promoInputFull}
                placeholder="Enter promo e.g., GRAB10"
                placeholderTextColor="#9ca3af"
                value={promoCode}
                onChangeText={setPromoCode}
              />
              <TouchableOpacity style={styles.promoBtnFull} onPress={handleApplyPromo}>
                <Text style={styles.promoBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            {discount > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text>🎉 </Text>
                <Text style={styles.successText}>{discount}% discount applied!</Text>
              </View>
            ) : null}
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountValue}>- ₹{discountAmount.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.payableRow}>
            <Text style={styles.payableLabel}>Payable Amount</Text>
            <Text style={styles.payableValue}>₹{finalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.payButton, loading && styles.payButtonDisabled]} 
            onPress={handleConfirmOrder}
            disabled={loading}
          >
            <Text style={styles.payButtonText}>
              {loading ? "Processing..." : `Pay ₹${finalAmount.toFixed(2)} & Place Order`}
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>🔒 Secure payments • Estimated delivery included</Text>
        </View>

      </ScrollView>

      {/* Razorpay WebView Modal */}
      <Modal visible={showGateway} animationType="slide" onRequestClose={() => setShowGateway(false)}>
        <View style={{ flex: 1, backgroundColor: '#f9f9f9', paddingTop: Platform.OS === 'android' ? 25 : 45 }}>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }}>
            <TouchableOpacity onPress={() => setShowGateway(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'mbold', fontSize: 16, marginLeft: 16, color: '#333' }}>Secure Payment</Text>
          </View>
          {paymentHtml ? (
            <WebView 
              source={{ html: paymentHtml, baseUrl: 'https://craftdelhi.com' }} 
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
              style={{ flex: 1 }}
            />
          ) : null}
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  navTitle: {
    fontFamily: 'mbold',
    fontSize: 18,
    color: '#333',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fafafa', // Light grey for the page body to make white cards pop
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
    })
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontFamily: 'msemibold',
    fontSize: 13,
    color: '#024a63',
    marginLeft: 10,
  },
  deliveryDate: {
    color: '#000',
    fontFamily: 'mbold',
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenterTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#024a63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#024a63',
  },
  addressRowContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  addressText: {
    flex: 1,
    fontFamily: 'mmedium',
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  changeAddressBtn: {
    color: '#2563eb',
    fontFamily: 'mbold',
    fontSize: 12,
    marginLeft: 10,
  },
  securePaymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  secureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  secureTitle: {
    fontFamily: 'mbold',
    fontSize: 13,
    color: '#1f2937',
  },
  secureSubtitle: {
    fontFamily: 'mmedium',
    fontSize: 11,
    color: '#6b7280',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    padding: 12,
  },
  infoIconBoxBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoIconBoxPurple: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoSubtitle: {
    fontFamily: 'mmedium',
    fontSize: 10,
    color: '#9ca3af',
  },
  infoTitle: {
    fontFamily: 'mbold',
    fontSize: 12,
    color: '#333',
  },
  summaryBadge: {
    backgroundColor: '#024a63',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  summaryBadgeText: {
    color: '#fff',
    fontFamily: 'mbold',
    fontSize: 10,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  viewBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  viewBillText: {
    fontFamily: 'msemibold',
    fontSize: 12,
    color: '#555',
    marginRight: 2,
  },
  billContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  billItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billItemName: {
    flex: 2,
    fontFamily: 'mmedium',
    fontSize: 13,
    color: '#4b5563',
  },
  billItemQty: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'mmedium',
    fontSize: 12,
    color: '#9ca3af',
  },
  billItemPrice: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'mbold',
    fontSize: 13,
    color: '#111827',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'mmedium',
    fontSize: 14,
    color: '#4b5563',
  },
  summaryValue: {
    fontFamily: 'mbold',
    fontSize: 14,
    color: '#111827',
  },
  promoContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginVertical: 15,
  },
  promoTitle: {
    fontFamily: 'mbold',
    fontSize: 13,
    color: '#024a63',
    marginBottom: 8,
  },
  promoInputColumn: {
    flexDirection: 'column',
    gap: 12,
  },
  promoInputFull: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'mmedium',
    fontSize: 13,
    color: '#111827',
  },
  promoBtnFull: {
    backgroundColor: '#024a63',
    width: '100%',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  promoBtnText: {
    color: '#fff',
    fontFamily: 'mbold',
    fontSize: 13,
  },
  errorText: {
    color: '#ef4444',
    fontFamily: 'mmedium',
    fontSize: 11,
    marginTop: 6,
  },
  successText: {
    color: '#16a34a',
    fontFamily: 'mbold',
    fontSize: 11,
    marginTop: 6,
  },
  discountLabel: {
    fontFamily: 'mbold',
    fontSize: 14,
    color: '#15803d',
  },
  discountValue: {
    fontFamily: 'mbold',
    fontSize: 14,
    color: '#15803d',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  payableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  payableLabel: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#024a63',
  },
  payableValue: {
    fontFamily: 'mbold',
    fontSize: 22,
    color: '#ee6f69',
  },
  payButton: {
    backgroundColor: '#024a63',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  payButtonText: {
    color: '#fff',
    fontFamily: 'mbold',
    fontSize: 16,
  },
  footerNote: {
    textAlign: 'center',
    fontFamily: 'mmedium',
    fontSize: 10,
    color: '#6b7280',
  }
});
