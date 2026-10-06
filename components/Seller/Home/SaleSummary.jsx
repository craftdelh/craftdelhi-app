import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const statusMap = {
  0: "PENDING",
  1: "ACCEPTED",
  2: "OUT FOR DELIVERY",
  3: "DELIVERED",
  4: "CANCELLED",
};

const statusColors = {
  PENDING: { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" }, // yellow
  ACCEPTED: { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" }, // blue
  "OUT FOR DELIVERY": { bg: "#FFEDD5", text: "#C2410C", border: "#FED7AA" }, // orange
  DELIVERED: { bg: "#D1FAE5", text: "#047857", border: "#A7F3D0" }, // green
  CANCELLED: { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" }, // red
};

const paymentMap = {
  0: "PENDING",
  1: "PAID",
  2: "REFUNDED",
  4: "FAILED",
};

const paymentColors = {
  PENDING: { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" },
  PAID: { bg: "#D1FAE5", text: "#047857", border: "#A7F3D0" },
  REFUNDED: { bg: "#F3E8FF", text: "#7E22CE", border: "#E9D5FF" },
  FAILED: { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" },
};

const SectionInfo = ({ iconName, title, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Feather name={iconName} size={16} color="#024a63" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>
      {children}
    </View>
  </View>
);

export default function SalesSummary({ data: user, onClose }) {
  if (!user) return null;

  const status = statusMap[user.order_status] || "UNKNOWN";
  const paymentStatus = paymentMap[user.payment_status] || "UNKNOWN";
  const t = user.tracking_details || {};
  const hasTracking = t.tracking_company || t.tracking_number;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
  };

  const getBadgeStyle = (colorObj) => ({
    backgroundColor: colorObj?.bg || '#F3F4F6',
    borderColor: colorObj?.border || '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  });
  
  const getBadgeText = (colorObj) => ({
    color: colorObj?.text || '#374151',
    fontSize: 10,
    fontWeight: '700',
  });

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Sale Summary #{user.order_uid}</Text>
          <Text style={styles.headerSubtitle}>PLACED ON {formatDate(user.created_at)}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x-circle" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Customer Information */}
        <SectionInfo iconName="user" title="CUSTOMER INFORMATION">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{user.buyer_name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{user.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user.phone_number || 'N/A'}</Text>
          </View>
        </SectionInfo>

        {/* Shipping Address */}
        <SectionInfo iconName="map-pin" title="SHIPPING ADDRESS">
          <Text style={styles.addressText}>{user.shipping_info || 'No shipping address provided.'}</Text>
          {user.buyer_note ? (
            <View style={styles.buyerNoteContainer}>
              <Text style={styles.buyerNoteLabel}>BUYER NOTE</Text>
              <Text style={styles.buyerNoteText}>{user.buyer_note}</Text>
            </View>
          ) : null}
        </SectionInfo>

        {/* Status & Payment */}
        <SectionInfo iconName="credit-card" title="STATUS & PAYMENT">
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Order Stage:</Text>
            <View style={getBadgeStyle(statusColors[status])}>
              <Text style={getBadgeText(statusColors[status])}>{status}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Payment Status:</Text>
            <View style={getBadgeStyle(paymentColors[paymentStatus])}>
              <Text style={getBadgeText(paymentColors[paymentStatus])}>{paymentStatus}</Text>
            </View>
          </View>
          <View style={[styles.statusRow, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8, marginTop: 4 }]}>
            <Text style={styles.statusLabel}>Payment Method:</Text>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{(user.payment_type || user.payment_method || 'N/A').toUpperCase()}</Text>
            </View>
          </View>
        </SectionInfo>

        {/* Tracking Information */}
        <SectionInfo iconName="truck" title="TRACKING INFORMATION">
          {hasTracking ? (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Courier:</Text>
                <Text style={styles.infoValue}>{t.tracking_company || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tracking #:</Text>
                <View style={styles.trackBadge}>
                  <Text style={styles.trackBadgeText}>{t.tracking_number || 'N/A'}</Text>
                </View>
              </View>
              {t.tracking_link && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Link:</Text>
                  <Text style={styles.linkText}>Track Package →</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No tracking information attached yet.</Text>
          )}
        </SectionInfo>

        {/* Products Ordered */}
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <Feather name="package" size={16} color="#024a63" />
            <Text style={styles.productsTitle}>PRODUCTS ORDERED ({user.items?.length || 0})</Text>
          </View>
          
          <View style={styles.tableContainer}>
            <View style={styles.tableHead}>
              <Text style={[styles.thText, { flex: 2 }]}>PRODUCT NAME</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>PRICE</Text>
              <Text style={[styles.thText, { width: 40, textAlign: 'center' }]}>QTY</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>TOTAL</Text>
            </View>
            
            {user.items?.length > 0 ? user.items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tdText, { flex: 2 }]} numberOfLines={2}>{item.product_name}</Text>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>₹{parseFloat(Math.abs(item.price)).toLocaleString('en-IN')}</Text>
                <Text style={[styles.tdText, { width: 40, textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'right', color: '#024a63', fontWeight: 'bold' }]}>₹{(parseFloat(Math.abs(item.price)) * item.quantity).toLocaleString('en-IN')}</Text>
              </View>
            )) : (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No items found in this order.</Text>
              </View>
            )}
          </View>

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalVal}>₹{parseFloat(Math.abs(user.total_amount || 0)).toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.totalRow, { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 12, marginBottom: 12 }]}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={[styles.totalVal, { color: '#16A34A' }]}>Free</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total Amount</Text>
                <Text style={styles.grandTotalVal}>₹{parseFloat(Math.abs(user.total_amount || 0)).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
  },
  sectionBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    width: 70,
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
  },
  addressText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  buyerNoteContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  buyerNoteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#024a63',
    marginBottom: 4,
  },
  buyerNoteText: {
    fontSize: 12,
    color: '#4B5563',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  methodBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  methodText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  trackBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trackBadgeText: {
    fontSize: 12,
    color: '#1F2937',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#024a63',
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  productsSection: {
    marginTop: 8,
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  productsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#36234e',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  thText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    alignItems: 'center',
  },
  tdText: {
    fontSize: 12,
    color: '#374151',
  },
  emptyRow: {
    padding: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  totalBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  totalVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#024a63',
  },
});
