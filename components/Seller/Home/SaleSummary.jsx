import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function SalesSummary({ data, onClose }) {
  const Row = ({ label, value, isStatus, statusColor }) => {
    if (!value) return null;

    return (
      <>
        <View style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          {isStatus ? (
            <View style={[styles.statusBox, { backgroundColor: statusColor || '#69D297' }]}>
              <Text style={[styles.value, { color: 'white', textAlign: 'center' }]}>{value}</Text>
            </View>
          ) : (
            <Text style={styles.value}>{value}</Text>
          )}
        </View>
        <View style={styles.divider} />
      </>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Sales Summary</Text>
        <View style={styles.divider} />

        <Row label="Order ID:" value={data?.id} />
        <Row label="Customer Name:" value={data?.customerName} />
        <Row label="Product Name:" value={data?.productName} />
        <Row label="Quantity:" value={data?.quantity?.toString()} />
        <Row label="Date:" value={data?.date} />
        <Row
          label="Status:"
          value={data?.status}
          isStatus
          statusColor={data?.status === 'Delivered' ? '#69D297' : '#FFC107'}
        />
        <Row label="Track Number:" value={data?.trackNumber} />
        <Row label="Total Amount:" value={data?.totalAmount} />

        {data?.shippingInfo && (
          <View style={styles.shippingContainer}>
            <Text style={styles.label}>Shipping Information:</Text>
            <Text style={[styles.value, { marginTop: 4 }]}>{data?.shippingInfo}</Text>
          </View>
        )}
            <View  style={{height:1,borderTopWidth:1,borderColor:'#ccc'}}/>
        {data?.buyerNote && (
          <View style={styles.shippingContainer}>
            <Text style={styles.label}>Buyer Note:</Text>
            <Text style={[styles.value, { marginTop: 4 }]}>{data?.buyerNote}</Text>
          </View>
        )}
      </ScrollView>

      {/* Close button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'space-between',
  },
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
  fontSize: 14,
  fontWeight: '600', 
  fontFamily: 'mbold', 
  color: '#024A63',     
  width: 130,
},

  value: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    textAlign: 'right',
  },
  statusBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#69D297',
    minWidth: 80,
  },
  shippingContainer: {
    marginTop: 10,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
  },
  closeButton: {
    backgroundColor: '#024A63',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
