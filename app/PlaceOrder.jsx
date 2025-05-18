import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Card from '../assets/images/card.svg';
import Entypo from '@expo/vector-icons/Entypo';
import ActionSheet from 'react-native-actions-sheet';
import PaymentOPtions from '../components/PaymentOPtions';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { cleanCart } from '../redux/CartReducer';

const PlaceOrder = () => {
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplied, setIsApplied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const actionSheetRef = useRef(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
const [orderId] = useState('12231232132134444444'); 



  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'FIRST100') {
      setDiscount(100);
      setIsApplied(true);
      Toast.show({
            type: 'success',
            text1:  'Promo code applied! ₹100 off',
            position: 'bottom',
            visibilityTime: 2000,
          });
    } else {
      setDiscount(0);
      setIsApplied(false);
      Toast.show({
            type: 'error',
            text1:  'Invalid promo code',
            position: 'bottom',
            visibilityTime: 2000,
          });
      
    }
  };

  const openPaymentOptions = (method) => {
    setSelectedMethod(method);
    actionSheetRef.current?.show();
  };

  const handleConfirmPayment = (method, data) => {
    setSelectedMethod(method);
    setPaymentData(data);
    actionSheetRef.current?.hide();
  };

  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();

   const parseAmount = (value) => {
    const num = parseFloat(value?.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const totalProductAmount = cart.reduce((sum, item) => {
    return sum + parseAmount(item.price) * item.quantity;
  }, 0);

  const shippingFee = 150;
 const totalAmount = Math.max(0, totalProductAmount + shippingFee - discount);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.innerContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.title}>Payment Method</Text>
            </View>

            {/* Payment Options */}
            <View style={styles.optionsContainer}>
              <PaymentOption label="Credit / Debit Card" onPress={() => openPaymentOptions('card')} />
              <PaymentOption label="Pay tm" onPress={() => openPaymentOptions('paytm')} />
              <PaymentOption label="Amazon Pay" onPress={() => openPaymentOptions('amazon')} />
              <PaymentOption label="Cash On Delivery" onPress={() => openPaymentOptions('cod')} />
            </View>

            {/* Promo Code */}
            <View style={styles.promoContainer}>
              <TextInput
                placeholder="Enter Promo Code"
                style={styles.promoInput}
                value={promoCode}
                onChangeText={setPromoCode}
              />
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyPromo}
              >
                <Text style={styles.applyText}>{isApplied ? 'Reapply' : 'Apply'}</Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <SummaryRow label="Product Amount" value={`₹ ${totalProductAmount.toFixed(2)}`} />
              <SummaryRow label="Shipping Fee" value={`₹ ${shippingFee.toFixed(2)}`} />
              {discount > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`- ₹ ${discount.toFixed(2)}`}
                  valueStyle={{ color: 'green', fontWeight: 'bold' }}
                />
              )}

              {selectedMethod !== '' && (
                <SummaryRow label="Payment Method" value={formatPaymentMethod(selectedMethod)} />
              )}
              <View style={styles.divider} />
             <SummaryRow label="Total Amount" value={`₹ ${totalAmount.toFixed(2)}`} highlight />

              {/* Show Card Details if payment method is card and paymentData is available */}
              {selectedMethod !== '' && paymentData && (
  <>
    {selectedMethod === 'card' && (
      <CardDetails
        name={paymentData.name}
        cardNumber={paymentData.cardNumber}
        expiry={paymentData.expiry}
      />
    )}
    {selectedMethod === 'paytm' && (
      <PaytmDetails mobileNumber={paymentData.mobileNumber} />
    )}
    {selectedMethod === 'amazon' && (
      <AmazonPayDetails amazonId={paymentData.amazonId} />
    )}
    {selectedMethod === 'cod' && <CODDetails />}
  </>
)}

            </View>
          </View>
        </ScrollView>

        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity onPress={() => {
    if (!selectedMethod || !paymentData) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    setShowConfirmation(true);
  }} style={styles.payNowButton}>
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ActionSheet ref={actionSheetRef}>
        <PaymentOPtions
          selectedMethod={selectedMethod}
          onConfirm={handleConfirmPayment}
          onClose={() => actionSheetRef.current?.hide()}
        />
      </ActionSheet>
      {showConfirmation && (
  <View style={styles.overlay}>
    <View style={styles.confirmationBox}>
      <Feather name="check-circle" size={48} color="green" />
      <Text style={styles.confirmText}>Thank you for purchasing.</Text>
      <Text style={styles.priceText}>Price ₹ {totalAmount.toFixed(2)}</Text>
      <Text style={styles.orderText}>your Order Number is</Text>
      <Text style={styles.orderId}>{orderId}</Text>
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => {
          setShowConfirmation(false);
          dispatch(cleanCart());
          router.push('/(tabs)/Home'); 
        }}
      >
        <Text style={styles.continueText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

    </SafeAreaView>
  );
};

const CardDetails = ({ name, cardNumber, expiry }) => {
  // Format card number to show only last 4 digits (optional)
  const formattedCardNumber = cardNumber
    ? '**** **** **** ' + cardNumber.slice(-4)
    : '';

  return (
    <View style={styles.cardDetailsContainer}>
      <Text style={styles.cardTitle}>Card Details</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Name on Card</Text>
        <Text style={styles.cardValue}>{name || 'N/A'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Card Number</Text>
        <Text style={styles.cardValue}>{formattedCardNumber}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Expiry</Text>
        <Text style={styles.cardValue}>{expiry || 'N/A'}</Text>
      </View>
    </View>
  );
};

const PaytmDetails = ({ mobileNumber }) => (
  <View style={styles.cardDetailsContainer}>
    <Text style={styles.cardTitle}>Paytm Details</Text>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Mobile Number</Text>
      <Text style={styles.cardValue}>{mobileNumber || 'N/A'}</Text>
    </View>
  </View>
);

const AmazonPayDetails = ({ amazonId }) => (
  <View style={styles.cardDetailsContainer}>
    <Text style={styles.cardTitle}>Amazon Pay Details</Text>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Amazon ID</Text>
      <Text style={styles.cardValue}>{amazonId || 'N/A'}</Text>
    </View>
  </View>
);

const CODDetails = () => (
  <View style={styles.cardDetailsContainer}>
    <Text style={styles.cardTitle}>Cash On Delivery</Text>
    <Text style={{textAlign: 'center'}}>No additional details required.</Text>
  </View>
);


const formatPaymentMethod = (method) => {
  switch (method) {
    case 'card':
      return 'Credit / Debit Card';
    case 'paytm':
      return 'Paytm';
    case 'amazon':
      return 'Amazon Pay';
    case 'cod':
      return 'Cash On Delivery';
    default:
      return '';
  }
};

const PaymentOption = ({ label, onPress }) => (
  <TouchableOpacity style={styles.optionRow} onPress={onPress}>
    <Card />
    <Text style={styles.optionText}>{label}</Text>
    <Entypo name="chevron-right" size={24} color="black" />
  </TouchableOpacity>
);

const SummaryRow = ({ label, value, highlight, valueStyle }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text
      style={[
        styles.summaryValue,
        highlight && { color: '#E63946', fontWeight: 'bold' },
        valueStyle,
      ]}
    >
      {value}
    </Text>
  </View>
);

export default PlaceOrder;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  innerContainer: { padding: 20, flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: 'mbold', fontSize: 16, marginLeft: 20 },
  optionsContainer: { marginTop: 20, gap: 20 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: { fontFamily: 'mbold', fontSize: 16, flex: 1, marginLeft: 10 },
  promoContainer: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  applyText: { color: '#fff', fontWeight: '600' },
  summaryContainer: {
    marginTop: 40,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  summaryLabel: { color: '#333' },
  summaryValue: { color: '#333' },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payNowButton: {
    backgroundColor: '#024A63',
    padding: 20,
    borderRadius: 10,
  },
  payNowText: {
    color: 'white',
    fontFamily: 'mbold',
    textAlign: 'center',
    fontSize: 16,
  },

  // New styles for card details
  cardDetailsContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cardTitle: {
    fontFamily: 'mbold',
    fontSize: 16,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  cardLabel: {
    fontFamily: 'mregular',
    fontSize: 14,
    color: '#555',
  },
  cardValue: {
    fontFamily: 'mbold',
    fontSize: 14,
    color: '#000',
  },
  overlay: {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},
confirmationBox: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 25,
  width: '85%',
  alignItems: 'center',
},
confirmText: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 10,
  textAlign: 'center',
},
priceText: {
  fontSize: 16,
  marginTop: 5,
  fontWeight: 'bold',
},
orderText: {
  marginTop: 15,
  fontSize: 14,
  color: '#333',
},
orderId: {
  color: 'crimson',
  fontWeight: 'bold',
  fontSize: 14,
},
continueBtn: {
  backgroundColor: '#024A63',
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 8,
  marginTop: 20,
},
continueText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},

});
