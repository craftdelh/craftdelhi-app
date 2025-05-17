import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const PaymentOPtions = ({ selectedMethod, onConfirm, onClose }) => {

  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
const [amazonPayEmail, setAmazonPayEmail] = useState('');



  const [paytmNumber, setPaytmNumber] = useState('');
  const formatExpiry = (text) => {
  let formatted = text.replace(/[^0-9]/g, '');
  if (formatted.length >= 3) {
    formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`;
  }
  setExpiry(formatted);
};


  const renderCreditCardForm = () => (
    <>
      <Text style={styles.label}>Card Number</Text>
      <TextInput
            style={styles.input}
            placeholder="Enter card number"
            keyboardType="number-pad"
            maxLength={16}
            value={cardNumber}
            onChangeText={setCardNumber}
            />

      <Text style={styles.label}>Name on Card</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name on card"
        value={nameOnCard}
        onChangeText={setNameOnCard}
      />
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Expiry (MM/YY)</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            keyboardType="number-pad"
            maxLength={5}
            value={expiry}
            onChangeText={formatExpiry}
            />

        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="CVV"
            keyboardType="number-pad"
            secureTextEntry={true}
            maxLength={3}
            value={cvv}
            onChangeText={setCvv}
            />

        </View>
      </View>
    </>
  );

  const renderPaytmForm = () => (
    <>
      <Text style={styles.label}>Paytm Number</Text>
     <TextInput
        style={styles.input}
        placeholder="Enter Paytm number"
        keyboardType="phone-pad"
        maxLength={10}
        value={paytmNumber}
        onChangeText={(text) => setPaytmNumber(text.replace(/[^0-9]/g, ''))}
        />

    </>
  );

 const renderAmazonPayForm = () => (
  <>
    <Text style={styles.label}>AMAZON ID </Text>
    <TextInput
      style={styles.input}
      placeholder="Enter your Amazon id"
      keyboardType="email-address"
      autoCapitalize="none"
      value={amazonPayEmail}
      onChangeText={setAmazonPayEmail}
    />
  </>
);



  const renderForm = () => {
    switch (selectedMethod) {
      case 'card':
        return renderCreditCardForm();
      case 'paytm':
        return renderPaytmForm();
      case 'amazon':
        return renderAmazonPayForm();
      case 'cod':
        return <Text style={styles.codText}>You will pay on delivery.</Text>;
      default:
        return <Text>Select a payment method</Text>;
    }
  };

  const handleConfirm = () => {
  let paymentData = {};

  if (selectedMethod === 'card') {
    paymentData = {
      cardNumber,
      name: nameOnCard,  
      expiry,
      cvv,
    };
  } else if (selectedMethod === 'paytm') {
    paymentData = {
      mobileNumber: paytmNumber, 
    };
  } else if (selectedMethod === 'amazon') {
  paymentData = {
    amazonId: amazonPayEmail,
  };
}


  onConfirm(selectedMethod, paymentData);
  onClose();
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method: {selectedMethod.toUpperCase()}</Text>
      {renderForm()}
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm Payment</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
        <Text style={[styles.buttonText, { color: 'black' }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentOPtions;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  label: {
  fontFamily: 'mbold',
  marginTop: 10,
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing:1,
},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    height:50
  },
  row: { flexDirection: 'row' },
  button: {
    backgroundColor: '#024A63',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  cancelButton: {
    backgroundColor: '#eee',
    marginTop: 10,
  },
  codText: { fontSize: 16, marginTop: 20 },
});
