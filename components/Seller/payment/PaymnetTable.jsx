import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import ActionSheet from 'react-native-actions-sheet';
import PaymnetSummary from './PaymnetSummary';

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

const getStatusStyle = (status) => {
  switch (status) {
    case 'Paid':
      return { textColor: '#2E7D32', bgColor: '#E8F5E9' };
    case 'Refunded':
      return { textColor: '#0096FF', bgColor: '#E0F2FE' };
    case 'Failed':
    case 'Unpaid':
      return { textColor: '#C62828', bgColor: '#FFEBEE' };
    case 'Pending':
    default:
      return { textColor: '#EF6C00', bgColor: '#FFF3E0' };
  }
};

const PaymnetTable = ({ data = [], loading = false, onOpenWithdraw }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const actionSheetRef = useRef(null);

  // Normalize rows from backend data
  const rows = useMemo(() => {
    return (data || []).map((order) => {
      const id = (order?.payment_uid ?? order?.paymentId ?? order?.id ?? '').toString();
      const orderId = (order?.order_uid ?? order?.orderId ?? '').toString();
      const customerName = (order?.buyer_info?.name ?? order?.customerName ?? 'N/A').toString();
      const status = mapPaymentStatus(order?.payment_status ?? order?.paymentStatus);
      const date = (order?.created_at ?? order?.paymentDate ?? '').toString().split('T')[0] || '';
      const method = (order?.payment_method ?? order?.paymentMethod ?? 'N/A').toString().toUpperCase();
      const amount = order?.total_amount ?? order?.amount ?? 0;
      return {
        id,
        orderId,
        customerName,
        status,
        date,
        method,
        amount,
        raw: order,
      };
    });
  }, [data]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((item) => {
      const matchesStatus =
        paymentStatusFilter === 'All' || item.status === paymentStatusFilter;
      const hay = `${item.customerName} ${item.orderId} ${item.id}`.toLowerCase();
      const matchesSearch = !q || hay.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [rows, searchQuery, paymentStatusFilter]);

  const renderHeader = () => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {[
        'PAYMENT ID',
        'ORDER ID',
        'CUSTOMER NAME',
        'PAYMENT STATUS',
        'PAYMENT DATE',
        'PAYMENT METHOD',
        'AMOUNT',
        'ACTIONS',
      ].map((header, idx) => (
        <Text key={idx} style={[styles.tableCell, styles.headerText]}>
          {header}
        </Text>
      ))}
    </View>
  );

  const renderItem = (item) => {
    const { textColor, bgColor } = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => setSelectedId(item.id)}
        style={[styles.tableRow, selectedId === item.id && styles.selectedRow]}
        activeOpacity={0.8}
      >
        <Text style={styles.tableCell} numberOfLines={1}>{item.id || '-'}</Text>
        <Text style={styles.tableCell} numberOfLines={1}>{item.orderId || '-'}</Text>
        <Text style={styles.tableCell} numberOfLines={1}>{item.customerName}</Text>

        <View style={styles.tableCell}>
          <View style={[styles.statusPill, { backgroundColor: bgColor }]}>
            <Text style={{ color: textColor, fontWeight: '700', fontSize: 12 }}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.tableCell}>{item.date || '-'}</Text>
        <Text style={styles.tableCell}>{item.method}</Text>
        <Text style={[styles.tableCell, { fontWeight: '600' }]}>
          ₹{Number(item.amount).toLocaleString('en-IN')}
        </Text>

        <View style={[styles.tableCell, { flexDirection: 'row', alignItems: 'center' }]}>
          <TouchableOpacity
            onPress={() => {
              setSelectedOrder(item.raw);
              actionSheetRef.current?.show();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.actionBtn}
          >
            <Feather name="eye" size={18} color="#024A63" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Title & Withdraw Button */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Payment History</Text>
        {onOpenWithdraw && (
          <TouchableOpacity
            onPress={onOpenWithdraw}
            style={styles.withdrawButton}
            activeOpacity={0.8}
          >
            <Text style={styles.withdrawButtonText}>Withdraw Amount</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search & Filter */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search by customer, order or payment ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#999"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setActiveDropdown(activeDropdown === 'payment' ? null : 'payment')}
          >
            <Text style={{ color: '#000', fontWeight: '600', fontSize: 13 }}>
              {paymentStatusFilter === 'All' ? 'All Status' : paymentStatusFilter}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Filter Modal */}
      <Modal transparent visible={activeDropdown === 'payment'} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setActiveDropdown(null)}
          activeOpacity={1}
        >
          <View style={styles.dropdown}>
            {['All', 'Paid', 'Pending', 'Refunded', 'Failed'].map((status, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.dropdownItem,
                  paymentStatusFilter === status && { backgroundColor: '#F0F9FF' },
                ]}
                onPress={() => {
                  setPaymentStatusFilter(status);
                  setActiveDropdown(null);
                }}
              >
                <Text
                  style={{
                    fontWeight: paymentStatusFilter === status ? '700' : '500',
                    color: paymentStatusFilter === status ? '#024A63' : '#333',
                  }}
                >
                  {status === 'All' ? 'All Status' : status}
                </Text>
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Loading state or Table */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#024A63" />
          <Text style={styles.loadingText}>Loading payment history...</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ minWidth: 1100 }}>
            {renderHeader()}
            {filteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No payments found.</Text>
              </View>
            ) : (
              filteredData.map((item) => renderItem(item))
            )}
          </View>
        </ScrollView>
      )}

      {/* Detail ActionSheet */}
      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <PaymnetSummary data={selectedOrder} onClose={() => actionSheetRef.current?.hide()} />
      </ActionSheet>
    </View>
  );
};

export default PaymnetTable;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    color: '#36234E',
    fontFamily: 'mbold',
  },
  withdrawButton: {
    backgroundColor: '#024A63',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  withdrawButtonText: {
    color: 'white',
    fontFamily: 'msemibold',
    fontSize: 13,
  },
  filterSection: {
    gap: 10,
    marginBottom: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dropdown: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 6,
    width: 220,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedRow: {
    backgroundColor: '#F3F0FF',
  },
  headerRow: {
    backgroundColor: '#36234E',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableCell: {
    width: 140,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#EDF5F8',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 1100,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
