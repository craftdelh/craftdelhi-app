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
import { dummyOrders } from '../../../sellerdata';
import ActionSheet from "react-native-actions-sheet";
import SaleSummary from './SaleSummary';

// Add 'All' in statuses for showing all data
const statuses = ['All Payment Status', 'Delivered', 'Cancelled', 'Processing'];


const RecentOrders = () => {
  const [statusFilter, setStatusFilter] = useState('All Payment Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const actionSheetRef = useRef(null);

  const filteredData = dummyOrders.filter(item => {
  const statusMatch = statusFilter === 'All Payment Status' || item.status === statusFilter;
  const searchMatch =
    item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchQuery.toLowerCase());
  return statusMatch && searchMatch;
});
const [selectedOrder, setSelectedOrder] = useState(null);

const handleSaleSummary = (item) => {
  setSelectedOrder(item);
  actionSheetRef.current?.show();
};


  const renderHeader = () => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {[
        'Order ID', 'Customer Name', 'Product Name', 'Qty', 'Date',
        'Status', 'Track #', 'Amount', 'Note', 'Shipping Info', 'Actions'
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
      <Text style={styles.tableCell}>{item.customerName}</Text>
      <Text style={styles.tableCell}>{item.productName}</Text>
      <Text style={styles.tableCell}>{item.quantity}</Text>
      <Text style={styles.tableCell}>{item.date}</Text>
      <Text style={[styles.tableCell, getStatusStyle(item.status)]}>
        {item.status}
      </Text>
      <Text style={styles.tableCell}>{item.trackNumber}</Text>
      <Text style={styles.tableCell}>{item.totalAmount || '-'}</Text>
      <Text style={styles.tableCell}>{item.buyerNote || '-'}</Text>
      <Text style={styles.tableCell}>{item.shippingInfo || '-'}</Text>
      <TouchableOpacity onPress={()=>handleSaleSummary(item)} style={styles.actionCell}>
        <Feather name="eye" size={18} color="#36234E" />
      </TouchableOpacity>
    </TouchableOpacity>
  );


  // Optional: color coding status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return { color: 'green', fontWeight: '600' };
      case 'Cancelled':
        return { color: 'red', fontWeight: '600' };
      case 'Processing':
        return { color: '#FFA500', fontWeight: '600' }; // orange
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Orders</Text>

      {/* Filter Row */}
      <View style={styles.topRow}>
        <View style={styles.halfWidth}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(true)}
          >
            <Text style={{ color: statusFilter ? '#000' : '#888', fontWeight: '600' }}>
              {statusFilter}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#888" />
          </TouchableOpacity>

          <Modal
            transparent
            visible={dropdownVisible}
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setDropdownVisible(false)}
              activeOpacity={1}
            >
              <View style={styles.dropdown}>
                {statuses.map((status, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setStatusFilter(status);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={{ fontWeight: status === statusFilter ? '700' : '400' }}>
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={[styles.searchBox, styles.halfWidth]}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
                placeholder="Search by customer or product"
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

      </View>

      {/* Table */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ minWidth: 1200 }}>
          {renderHeader()}
          {/* Replace FlatList with map */}
          {filteredData.map(item => renderItem(item))}
        </View>
      </ScrollView>

      
   <ActionSheet ref={actionSheetRef}>
       <SaleSummary data={selectedOrder} onClose={() => actionSheetRef.current?.hide()} />
    </ActionSheet>
    </View>
  );
};

export default RecentOrders;

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
    fontFamily:'mbold'
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  dropdownButton: {
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
    borderTopLeftRadius:10,
    borderTopRightRadius:10
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
