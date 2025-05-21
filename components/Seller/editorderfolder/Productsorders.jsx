import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
} from 'react-native';

const ProductsOrders = () => {
  const [productName, setProductName] = useState('');
const [quantity, setQuantity] = useState('');
const [price, setPrice] = useState('');
const [sku, setSku] = useState('');


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.sectionTitle}>Product(s) Ordered :</Text>
      <View style={styles.divider} />

      {/* Product Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.inputBox}
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
          placeholderTextColor="#E0E4F4"
        />
      </View>

      {/* Quantity */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.inputBox}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Enter quantity"
          placeholderTextColor="#E0E4F4"
          keyboardType="numeric"
        />
      </View>

      {/* Price */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.inputBox}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          placeholderTextColor="#E0E4F4"
        />
      </View>

      {/* SKU */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sku #</Text>
        <TextInput
          style={styles.inputBox}
          value={sku}
          onChangeText={setSku}
          placeholder="Enter SKU"
          placeholderTextColor="#E0E4F4"
        />
      </View>
    </ScrollView>
  );
};

export default ProductsOrders;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
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
