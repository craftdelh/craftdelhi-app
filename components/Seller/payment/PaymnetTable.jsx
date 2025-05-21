import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { dummyPaymentData } from '../../../sellerdata'; 
import { router } from 'expo-router';
import ActionSheet from 'react-native-actions-sheet';
import PaymnetSummary from './PaymnetSummary';

const PaymnetTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const actionSheetRef = useRef(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tableData, setTableData] = useState(dummyPaymentData);

  const filteredData = tableData.filter(item => {
    const nameMatch = item.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const orderMatch = orderStatusFilter === 'All' || item.status === orderStatusFilter;
    const paymentMatch = paymentStatusFilter === 'All' || item.paymentStatus === paymentStatusFilter;
    return nameMatch && orderMatch && paymentMatch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return { textColor: '#2E7D32', bgColor: '#E8F5E9' };
      case 'Refunded':
        return { textColor: '#C62828', bgColor: '#FFEBEE' };
      case 'Unpaid':
        return { textColor: '#EF6C00', bgColor: '#FFF3E0' };
      default:
        return { textColor: '#444', bgColor: '#F0F0F0' };
    }
  };

  const updatePaymentStatus = (id, newStatus) => {
    setTableData(prev =>
      prev.map(item =>
        item.paymentId === id ? { ...item, paymentStatus: newStatus } : item
      )
    );
  };

  const renderHeader = () => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {[
        'PAYMENT ID', 'ORDER ID','CUSTOMER NAME', 'PAYMNET STATUS', 'PAYMNET DATE', 'PAYMENT METHOD',
        'AMOUNT','ACTIONS'
      ].map((header, idx) => (
        <Text key={idx} style={[styles.tableCell, styles.headerText]}>
          {header}
        </Text>
      ))}
    </View>
  );

  const renderItem = (item) => {
    const { textColor, bgColor } = getStatusStyle(item.paymentStatus);

    return (
      <TouchableOpacity
        key={item.paymentId}
        onPress={() => setSelectedId(item.paymentId)}
        style={[
          styles.tableRow,
          selectedId === item.paymentId && styles.selectedRow,
        ]}
      >
        <Text style={styles.tableCell}>{item.paymentId}</Text>
        <Text style={styles.tableCell}>{item.orderId}</Text>
        <Text style={styles.tableCell}>{item.customerName}</Text>

          <View style={styles.tableCell}> 
            <TouchableOpacity
          style={[styles.statusPill, { backgroundColor: bgColor }]}
          onPress={() => {
            setSelectedOrder(item);
            setActiveDropdown(`status-${item.paymentId}`);
          }}
        >
          <Text style={{ color: textColor, fontWeight: '600', marginRight: 5 }}>
            {item.paymentStatus}
          </Text>
          <Ionicons name="chevron-down" size={14} color={textColor} />
        </TouchableOpacity>
        </View>
       

        <Text style={styles.tableCell}>{item.paymentDate}</Text>
        <Text style={styles.tableCell}>{item.paymentMethod}</Text>
        <Text style={styles.tableCell}>
          {typeof item.amount === 'number' ? `₹${item.amount.toFixed(2)}` : '-'}
        </Text>

        <View style={[styles.tableCell, { flexDirection: 'row', gap: 10 }]}>
          <TouchableOpacity onPress={() => {
            setSelectedOrder(item);
            actionSheetRef.current?.show();
          }}>
            <Feather name="eye" size={18} color="#36234E" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text style={styles.title}>Payment History</Text>
        <TouchableOpacity onPress={()=>router.push('/WithDrawAmount')} style={{backgroundColor:'#024A63',padding:10,borderRadius:10,marginBottom: 20,}}>
          <Text style={{color:'white',fontFamily:'msemibold'}}>Withdraw Amount</Text>
        </TouchableOpacity>
      </View>

      
      <View style={{ gap: 10, marginBottom: 20 }}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search by customer name"
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
            <Text style={{ color: '#000', fontWeight: '600' }}>
              {paymentStatusFilter === 'All' ? 'Payment Status' : paymentStatusFilter}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      
      <Modal transparent visible={activeDropdown === 'payment'} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setActiveDropdown(null)}
          activeOpacity={1}
        >
          <View style={styles.dropdown}>
            {['All', 'Paid', 'Unpaid', 'Refunded'].map((status, idx) => (
              <Pressable
                key={idx}
                style={styles.dropdownItem}
                onPress={() => {
                  setPaymentStatusFilter(status);
                  setActiveDropdown(null);
                }}
              >
                <Text style={{ fontWeight: '500' }}>{status}</Text>
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Status Change Modal */}
      <Modal transparent visible={!!activeDropdown?.startsWith('status-')} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setActiveDropdown(null)}
          activeOpacity={1}
        >
          <View style={styles.dropdown}>
            {['Paid', 'Unpaid', 'Refunded'].map((status, idx) => (
              <Pressable
                key={idx}
                style={styles.dropdownItem}
                onPress={() => {
                  if (selectedOrder) {
                    updatePaymentStatus(selectedOrder.paymentId, status);
                  }
                  setActiveDropdown(null);
                }}
              >
                <Text style={{ fontWeight: '500' }}>{status}</Text>
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ minWidth: 1200 }}>
          {renderHeader()}
          {filteredData.map(item => renderItem(item))}
        </View>
      </ScrollView>

      <ActionSheet ref={actionSheetRef}>
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
  title: {
    fontSize: 18,
    marginBottom: 20,
    color: '#36234E',
    fontFamily: 'mbold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dropdown: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 6,
    width: 220,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedRow: {
    backgroundColor: '#EDE7F6',
  },
  headerRow: {
    backgroundColor: '#36234E',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tableCell: {
    width: 150,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#333',
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
});
