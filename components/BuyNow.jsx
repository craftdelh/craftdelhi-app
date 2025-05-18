import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useState } from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import { AntDesign } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, decrementQuantity, incrementQuantity, removeFromCart } from '../redux/CartReducer';
import { router } from 'expo-router';

const BuyNow = ({ onClose, item }) => {
      const { id, title, price, image, orders, rating, oldPrice, description } = item;
  const [quantity, setQuantity] = useState(1); 

  const dispatch = useDispatch();
  const increaseQty = () => setQuantity((prev) => prev + 1);
  const decreaseQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Entypo name="cross" size={24} color="black" />
      </TouchableOpacity>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Image source={{ uri: image }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productTitle}>{title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.oldPrice}>{oldPrice}</Text>
          </View>
        </View>
      </View>

      {/* Quantity */}
      <View style={styles.quantityRow}>
        <Text style={styles.quantityLabel}>Quantity</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQty}>
            <AntDesign name="minus" size={18} color="#024A63" />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={increaseQty}>
            <AntDesign name="plus" size={18} color="#024A63" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <View style={{ marginTop: 20,marginBottom:150 }}>
        <Text style={styles.descriptionLabel}>Product Description</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>

      {/* Buy Now Button */}
      <TouchableOpacity  onPress={() => {dispatch(addToCart({ ...item, quantity })); onClose(); router.push('/(tabs)/Cart')}} style={styles.buyNowBtn}>
        <Text style={styles.buyNowText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BuyNow;

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontFamily: 'mbold',
    color: '#333',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  price: {
    fontSize: 16,
    fontFamily: 'mbold',
    color: '#024A63',
  },
  oldPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
  },
  quantityLabel: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#000',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyBtn: {
    borderWidth: 2,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 99,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '600',
    width: 24,
    textAlign: 'center',
  },
  descriptionLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#36234E',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: 'gray',
    lineHeight: 20,
    fontFamily:'msemibold'
  },
  buyNowBtn: {
    backgroundColor: '#024A63',
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
