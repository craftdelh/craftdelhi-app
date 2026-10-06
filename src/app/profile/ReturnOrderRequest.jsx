import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';

const ReturnOrderRequest = ({ order, onClose }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      console.log('Return Reason:', reason);
      onClose();
    }
  };

  if (!order) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reason of Return</Text>
        <TouchableOpacity onPress={onClose}>
          <AntDesign name="close" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Mini Product Card */}
      <View style={styles.productCard}>
        <Image source={{ uri: order.image }} style={styles.image} />
        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.productTitle}>
            {order.productTitle}
          </Text>
          <Text style={styles.price}>{order.price}</Text>
        </View>
      </View>

      {/* Textarea */}
      <TextInput
        placeholder="Enter your reason for return..."
        style={styles.textArea}
        multiline
        numberOfLines={5}
        value={reason}
        onChangeText={setReason}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Request</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReturnOrderRequest;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius:50,
    borderTopRightRadius:50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2E004F',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FAFAFA',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 20,
    minHeight: 200,
  },
  button: {
    backgroundColor: '#024A63',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
