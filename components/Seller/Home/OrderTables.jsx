import React, { useState } from 'react';
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
import { Orderinfo } from '../../../sellerdata'; 


const OrderTables = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); 

  const filteredData = Orderinfo.filter(item => {
    const nameMatch = item.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const orderMatch = orderStatusFilter === 'All' || item.status === orderStatusFilter;
    const paymentMatch = paymentStatusFilter === 'All' || item.paymentStatus === paymentStatusFilter;
    return nameMatch && orderMatch && paymentMatch;
  });

  const renderHeader = () => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {[
        'Order ID', 'Order Date','Customer Name', 'Product Name', 'Order Status', 'Quantity',
        'Payment Status', 'Total Amount', 'Customer Description','Actions'
      ].map((header, idx) => (
        <Text key={idx} style={[styles.tableCell, styles.headerText]}>
          {header}
        </Text>
      ))}
    </View>
  );

  const renderItem = (item) => (
  <TouchableOpacity
    key={item.id}
    onPress={() => setSelectedId(item.id)}
    style={[
      styles.tableRow,
      selectedId === item.id && styles.selectedRow,
      
    ]}
  >
    <Text style={styles.tableCell}>{item.id}</Text>
    <Text style={styles.tableCell}>{item.date}</Text>
    <Text style={styles.tableCell}>{item.customerName}</Text>
    <Text style={styles.tableCell}>{item.productName}</Text>
    <Text style={[styles.tableCell, getStatusStyle(item.status)]}>
      {item.status}
    </Text>
    <Text style={styles.tableCell}>{item.quantity}</Text>
    <Text style={styles.tableCell}>{item.paymentStatus}</Text>
    <Text style={styles.tableCell}>
      {typeof item.totalAmount === 'number' ? item.totalAmount.toFixed(2) : '-'}
    </Text>
    <Text style={styles.tableCell}>{item.customerNote || '-'}</Text>

    <View style={[styles.tableCell, { flexDirection: 'row', gap: 10 }]}>
      <TouchableOpacity onPress={() => console.log('View pressed')}>
        <Feather name="eye" size={18} color="#36234E" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Edit pressed')}>
        <Feather name="edit-3" size={18} color="#36234E" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);


  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return { color: 'green', fontWeight: '600' };
      case 'Cancelled':
        return { color: 'red', fontWeight: '600' };
      case 'Pending':
        return { color: '#FFA500', fontWeight: '600' };
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Orders</Text>

      {/* Filters */}
      <View style={{ gap: 10, marginBottom: 20 }}>
        {/* Search */}
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

        {/* Dropdowns */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Order Status Dropdown */}
         {/* Order Status Dropdown */}
<TouchableOpacity
  style={styles.dropdownButton}
  onPress={() => setActiveDropdown(activeDropdown === 'order' ? null : 'order')}
>
  <Text style={{ color: '#000', fontWeight: '600' }}>
    {orderStatusFilter === 'All' ? 'Order Status' : orderStatusFilter}
  </Text>
  <Ionicons name="chevron-down" size={16} color="#888" />
</TouchableOpacity>

{/* Payment Status Dropdown */}
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

      {/* Dropdown Modal */}
      <Modal transparent visible={!!activeDropdown} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setActiveDropdown(null)}
          activeOpacity={1}
        >
          <View style={styles.dropdown}>
            {(activeDropdown === 'order'
              ? ['All', 'Delivered', 'Pending', 'Cancelled', 'Returned']
              : ['All', 'Paid', 'Unpaid', 'Refunded']
            ).map((status, idx) => (
              <Pressable
                key={idx}
                style={styles.dropdownItem}
                onPress={() => {
                  if (activeDropdown === 'order') {
                    setOrderStatusFilter(status);
                  } else {
                    setPaymentStatusFilter(status);
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ minWidth: 1200 }}>
          {renderHeader()}
          {filteredData.map(item => renderItem(item))}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderTables;

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
  },
  tableCell: {
    width: 110,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#333',
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  actionCell: {
    width: 50,
    alignItems: 'center',
  },
});
