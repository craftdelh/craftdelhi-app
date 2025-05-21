import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';

const PaymentInfo = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.sectionTitle}>Payment Information :</Text>
      <View style={styles.divider} />

      {/* Payment Method */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Payment Method</Text>
        <TextInput
          style={styles.inputBox}
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          placeholder="UPI / Cash / Card"
          placeholderTextColor="#E0E4F4"
        />
      </View>

      {/* Payment Status */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Payment Status</Text>
        <TextInput
          style={styles.inputBox}
          value={paymentStatus}
          onChangeText={setPaymentStatus}
          placeholder="Paid / Unpaid"
          placeholderTextColor="#E0E4F4"
        />
      </View>
    </ScrollView>
  );
};

export default PaymentInfo;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginTop:20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputBox: {
    height: 56,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E4F4',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Montserrat',
    color: 'black',
  },
});
