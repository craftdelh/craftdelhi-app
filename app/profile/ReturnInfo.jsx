import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';

const statusMessages = {
  Pending: 'Your return request is pending. We will update you soon.',
  Approved: 'Your item has been picked up. Refund will be processed shortly.',
  Rejected: 'Your return request was rejected. Contact support for help.',
};

const ReturnInfo = ({ order, onClose }) => {
  if (!order) return null;

  // Optional: Replace this with a real dynamic date from order object
  const pickupDate = order.pickupDate || '18 May 2025';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Return Details</Text>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.card}>
        <Image source={{ uri: order.image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.productTitle}>{order.productTitle}</Text>
          <Text style={styles.price}>{order.price}</Text>
        </View>
      </View>

      {/* Status Label */}
      <Text
        style={[
          styles.statusLabel,
          {
            color:
              order.status === 'Approved'
                ? '#28B463'
                : order.status === 'Rejected'
                ? '#E74C3C'
                : '#F1C40F',
          },
        ]}
      >
        Status: {order.status}
      </Text>

      {/* Message */}
      <Text style={styles.message}>
        {statusMessages[order.status] || 'Tracking your return status...'}
      </Text>

      {/* Pickup Info (Conditional) */}
      {order.status === 'Pending' && (
        <View style={styles.pickupContainer}>
          <Ionicons name="calendar-outline" size={18} color="#F1C40F" />
          <Text style={styles.pickupText}>
            Pickup scheduled for {pickupDate}
          </Text>
        </View>
      )}

      {order.status === 'Approved' && (
        <View style={styles.pickupContainer}>
          <Ionicons name="checkmark-done-outline" size={18} color="#28B463" />
          <Text style={styles.pickupText}>
            Picked up on {pickupDate}
          </Text>
        </View>
      )}

      {order.status === 'Rejected' && (
        <View style={styles.pickupContainer}>
          <Ionicons name="mail-outline" size={18} color="#E74C3C" />
          <Text style={styles.pickupText}>
            Need help? Email us at{' '}
            <Text style={{ fontWeight: 'bold' }}>support@example.com</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

export default ReturnInfo;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    margin: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E004F',
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  details: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  price: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: 'gray',
    lineHeight: 20,
    fontFamily: 'mbold',
  },
  pickupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  pickupText: {
    fontSize: 13,
    color: '#444',
    fontFamily:'mmedium'
  },
});
