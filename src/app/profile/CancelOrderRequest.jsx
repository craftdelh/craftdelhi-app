import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native-actions-sheet';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const REASONS = [
  "Ordered by mistake",
  "Better price found",
  "Late delivery",
  "Need to modify",
  "Other reason"
];

const CancelOrderRequest = ({ order, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

  const handleSubmit = async () => {
    if (!reason) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a cancellation reason',
      });
      return;
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.token) {
        Toast.show({ type: 'error', text1: 'Auth Error', text2: 'Please login again' });
        setLoading(false);
        return;
      }

      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}order/cancelorderbyuser/${order.internalId || order.id}`,
        {
          cancel_reason: extra ? `${reason} - ${extra}` : reason,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Order cancelled successfully',
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res.data.message || 'Failed to cancel order',
        });
      }
    } catch (err) {
      console.error("Cancel Order Error:", err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to cancel order. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cancel Order</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.orderIdText}>#{order.id}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Order Details Snippet */}
        <View style={styles.orderCard}>
          <Text style={styles.sectionTitle}>ORDER DETAIL</Text>
          <View style={styles.orderCardContent}>
            {order.image ? (
              <Image source={{ uri: order.image }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="image-outline" size={24} color="#999" />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {firstItem ? firstItem.product_name : order.productTitle}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>{order.price}</Text>
                <Text style={styles.productQty}>Qty: {order.qty}</Text>
              </View>
              <Text style={styles.statusText}>Status: <Text style={{color: '#3b82f6'}}>{order.status}</Text></Text>
            </View>
          </View>
        </View>

        {/* Reasons */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Why do you want to cancel?</Text>
          <View style={styles.reasonsGrid}>
            {REASONS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.reasonOption, reason === item && styles.reasonOptionSelected]}
                onPress={() => setReason(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.radioCircle, reason === item && styles.radioCircleSelected]}>
                  {reason === item && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.reasonText, reason === item && styles.reasonTextSelected]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>ADDITIONAL NOTES (OPTIONAL)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Is there anything we can help with before you cancel?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={extra}
            onChangeText={setExtra}
            textAlignVertical="top"
          />
        </View>

        {/* Warning */}
        <View style={styles.warningContainer}>
          <View style={styles.warningIconWrapper}>
            <MaterialIcons name="error-outline" size={20} color="#b45309" />
          </View>
          <View style={styles.warningTextWrapper}>
            <Text style={styles.warningTitle}>Heads up!</Text>
            <Text style={styles.warningDesc}>
              Once cancelled, this action cannot be undone. Refund (if applicable) will be processed as per policy.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.changedMindBtn} onPress={onClose} disabled={loading}>
          <Text style={styles.changedMindText}>I changed my mind</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="cancel" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Request Cancellation</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CancelOrderRequest;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f7fa',
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'mbold',
    color: '#024a63',
  },
  closeBtn: {
    padding: 4,
  },
  orderIdText: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: '#666',
    paddingHorizontal: 20,
    marginTop: 2,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'mbold',
    color: '#888',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  orderCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    resizeMode: 'cover',
  },
  productInfo: {
    marginLeft: 14,
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#222',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#000',
  },
  productQty: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: '#555',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#777',
    marginTop: 6,
  },
  reasonsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  reasonsTitle: {
    fontSize: 15,
    fontFamily: 'mbold',
    color: '#333',
    marginBottom: 16,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fafafa',
  },
  reasonOptionSelected: {
    borderColor: '#024a63',
    backgroundColor: '#f0f7f9',
  },
  radioCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#024a63',
  },
  radioInner: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#024a63',
  },
  reasonText: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: '#555',
    flex: 1,
  },
  reasonTextSelected: {
    fontFamily: 'mbold',
    color: '#024a63',
  },
  notesContainer: {
    marginVertical: 10,
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'mbold',
    color: '#888',
    marginBottom: 8,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Montserrat',
    color: '#333',
    minHeight: 100,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningIconWrapper: {
    marginRight: 12,
  },
  warningTextWrapper: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontFamily: 'mbold',
    color: '#b45309',
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: '#b45309',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  changedMindBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  changedMindText: {
    fontSize: 13,
    fontFamily: 'mbold',
    color: '#555',
  },
  submitBtn: {
    flex: 1.2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#024a63',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: 13,
    fontFamily: 'mbold',
    color: '#fff',
  },
});
