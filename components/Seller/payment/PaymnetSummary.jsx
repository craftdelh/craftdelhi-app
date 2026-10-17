import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Entypo } from '@expo/vector-icons';

const mapPaymentStatus = (status) => {
  if (typeof status === 'string') {
    const s = status.toLowerCase();
    if (s === 'paid' || s === '1') return 'Paid';
    if (s === 'refunded' || s === '2') return 'Refunded';
    if (s === 'failed' || s === '4') return 'Failed';
    if (s === 'unpaid') return 'Unpaid';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  switch (status) {
    case 1: return 'Paid';
    case 2: return 'Refunded';
    case 4: return 'Failed';
    default: return 'Pending';
  }
};

const mapOrderStatus = (status) => {
  if (typeof status === 'string') {
    const s = status.toLowerCase();
    if (s === 'accepted' || s === '1') return 'Accepted';
    if (s === 'out for delivery' || s === '2') return 'Out for Delivery';
    if (s === 'delivered' || s === '3') return 'Delivered';
    if (s === 'cancelled' || s === '4') return 'Cancelled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  switch (status) {
    case 1: return 'Accepted';
    case 2: return 'Out for Delivery';
    case 3: return 'Delivered';
    case 4: return 'Cancelled';
    default: return 'Pending';
  }
};

const paymentStatusColors = {
  Paid: { bg: '#E8F5E9', text: '#2E7D32' },
  Pending: { bg: '#FFF3E0', text: '#EF6C00' },
  Refunded: { bg: '#E0F2FE', text: '#0096FF' },
  Failed: { bg: '#FFEBEE', text: '#C62828' },
  Unpaid: { bg: '#FFEBEE', text: '#C62828' },
};

const orderStatusColors = {
  Pending: { bg: '#FFF3E0', text: '#EF6C00' },
  Accepted: { bg: '#E0F2FE', text: '#0096FF' },
  'Out for Delivery': { bg: '#F3E8FF', text: '#7E22CE' },
  Delivered: { bg: '#E8F5E9', text: '#2E7D32' },
  Cancelled: { bg: '#FFEBEE', text: '#C62828' },
};

const PaymentSummary = ({ data, user, onClose }) => {
  const item = data || user || {};

  const paymentId = item.payment_uid || item.paymentId || item.id || 'N/A';
  const orderId = item.order_uid || item.orderId || 'N/A';
  const orderDate = (item.created_at || item.paymentDate || '')?.split('T')[0] || 'N/A';
  const totalAmount = item.total_amount ?? item.amount ?? 0;

  const paymentStatus = mapPaymentStatus(item.payment_status ?? item.paymentStatus);
  const pColors = paymentStatusColors[paymentStatus] || { bg: '#F0F0F0', text: '#444' };

  const orderStatus = mapOrderStatus(item.order_status ?? item.status);
  const oColors = orderStatusColors[orderStatus] || { bg: '#F0F0F0', text: '#444' };

  const buyerName = item.buyer_info?.name || item.customerName || 'N/A';
  const buyerEmail = item.buyer_info?.email || item.email || 'N/A';
  const buyerPhone = item.buyer_info?.phone_number || item.phone || 'N/A';
  const buyerNote = item.buyer_note || item.buyerNotes || 'No Note';

  const paymentMethod = (item.payment_method || item.paymentMethod || 'N/A').toString().toUpperCase();

  // Format shipping address
  let shippingAddressStr = 'Not Provided';
  if (item.shipping_address) {
    if (typeof item.shipping_address === 'object') {
      const parts = [
        item.shipping_address.street,
        item.shipping_address.city,
        item.shipping_address.state,
        item.shipping_address.country,
      ].filter(Boolean);
      if (parts.length > 0) {
        shippingAddressStr = parts.join(', ') + (item.shipping_address.postal_code ? ` - ${item.shipping_address.postal_code}` : '');
      }
    } else if (typeof item.shipping_address === 'string' && item.shipping_address.trim().length > 0) {
      shippingAddressStr = item.shipping_address;
    }
  } else if (item.shippingInfo) {
    shippingAddressStr = item.shippingInfo;
  }

  // Ordered items
  const items = Array.isArray(item.items) ? item.items : [];

  return (
    <View style={styles.sheetWrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment View</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Entypo name="cross" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Payment ID:</Text>
            <Text style={styles.value}>{paymentId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>{orderId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Date:</Text>
            <Text style={styles.value}>{orderDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={[styles.value, { fontWeight: '700', color: '#024A63' }]}>
              ₹{Number(totalAmount).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Status:</Text>
            <View style={[styles.badge, { backgroundColor: oColors.bg }]}>
              <Text style={[styles.badgeText, { color: oColors.text }]}>{orderStatus}</Text>
            </View>
          </View>
        </View>

        {/* Buyer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buyer Information</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{buyerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{buyerEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{buyerPhone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Buyer Note:</Text>
            <Text style={styles.value}>{buyerNote}</Text>
          </View>
        </View>

        {/* Product(s) Ordered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product(s) Ordered</Text>
          <View style={styles.divider} />
          {items.length > 0 ? (
            items.map((prod, idx) => (
              <View key={idx} style={styles.productCard}>
                <View style={styles.row}>
                  <Text style={styles.label}>Product:</Text>
                  <Text style={[styles.value, { fontWeight: '600' }]}>
                    {prod.product_name || prod.name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.inlineStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Qty</Text>
                    <Text style={styles.statVal}>{prod.quantity ?? 1}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Price</Text>
                    <Text style={styles.statVal}>₹{prod.price ?? 0}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>SKU</Text>
                    <Text style={styles.statVal} numberOfLines={1}>{prod.product_sku || prod.sku || 'N/A'}</Text>
                  </View>
                </View>
                {idx < items.length - 1 && <View style={styles.lightDivider} />}
              </View>
            ))
          ) : item.productName ? (
            <View style={styles.productCard}>
              <View style={styles.row}>
                <Text style={styles.label}>Product:</Text>
                <Text style={[styles.value, { fontWeight: '600' }]}>{item.productName}</Text>
              </View>
              <View style={styles.inlineStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Qty</Text>
                  <Text style={styles.statVal}>{item.quantity ?? 1}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Price</Text>
                  <Text style={styles.statVal}>₹{totalAmount}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>SKU</Text>
                  <Text style={styles.statVal}>{item.sku || 'N/A'}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={{ color: '#888', fontStyle: 'italic', fontSize: 13 }}>
              No product items detailed for this payment.
            </Text>
          )}
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Method:</Text>
            <Text style={styles.value}>{paymentMethod}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <View style={[styles.badge, { backgroundColor: pColors.bg }]}>
              <Text style={[styles.badgeText, { color: pColors.text }]}>{paymentStatus}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{shippingAddressStr}</Text>
          </View>
        </View>

        {/* Close Button */}
        <View style={styles.closeBtnRow}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PaymentSummary;

const styles = StyleSheet.create({
  sheetWrapper: {
    backgroundColor: 'white',
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    fontFamily: 'mbold',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 16,
  },
  section: {
    backgroundColor: '#FAFAFA',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#024A63',
    fontFamily: 'mbold',
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  lightDivider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  label: {
    width: 110,
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  value: {
    flex: 1,
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  productCard: {
    paddingVertical: 4,
  },
  inlineStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    paddingLeft: 4,
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 60,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 12,
    color: '#024A63',
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtnRow: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  closeBtn: {
    backgroundColor: '#024A63',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  closeBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
