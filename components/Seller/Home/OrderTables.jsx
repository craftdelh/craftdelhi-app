import React, { useRef, useState, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import ActionSheet from "react-native-actions-sheet";
import OrderActionSheet from './OrderActionSheet';
import { router } from 'expo-router';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

const statusMap = {
  0: "Pending",
  1: "Accepted",
  2: "Out for Delivery",
  3: "Delivered",
  4: "Cancelled",
};

const OrderTables = () => {
  const { user } = useUser();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const actionSheetRef = useRef(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}order/recentorders`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      if (res.data?.status && res.data?.data) {
        setOrdersData(res.data.data);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredData = ordersData.filter(item => {
    const itemStatus = statusMap[item.order_status] || "Unknown";
    const nameMatch = item.buyer_name ? item.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const orderMatch = orderStatusFilter === 'All' || itemStatus === orderStatusFilter;
    
    // Assume payment status is available or default to "Paid" for testing if not
    const paymentStat = String(item.payment_status || "Paid");
    const paymentMatch = paymentStatusFilter === 'All' || paymentStat === paymentStatusFilter;
    
    return (nameMatch || searchQuery === '') && orderMatch && paymentMatch;
  });

  const renderHeader = () => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {[
        'Order ID', 'Order Date','Customer Name', 'Product Name', 'Order Status', 'Quantity',
        'Payment Status', 'Total Amount', 'Customer Note','Actions'
      ].map((header, idx) => (
        <Text key={idx} style={[styles.tableCell, styles.headerText]}>
          {header}
        </Text>
      ))}
    </View>
  );

  const renderItem = (item) => {
    const itemStatus = statusMap[item.order_status] || "Unknown";
    const paymentStat = String(item.payment_status || "Paid");
    return (
      <TouchableOpacity
        key={item.order_uid}
        onPress={() => setSelectedId(item.order_uid)}
        style={[
          styles.tableRow,
          selectedId === item.order_uid && styles.selectedRow,
        ]}
      >
        <Text style={styles.tableCell}>{item.order_uid}</Text>
        <Text style={styles.tableCell}>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : "-"}</Text>
        <Text style={styles.tableCell}>{item.buyer_name || "-"}</Text>
        <Text style={styles.tableCell}>{item.items?.[0]?.product_name || "-"}</Text>
        <Text style={[styles.tableCell, getStatusStyle(itemStatus)]}>
          {itemStatus}
        </Text>
        <Text style={styles.tableCell}>{item.items?.[0]?.quantity || "-"}</Text>
        <Text style={styles.tableCell}>
          <Text style={{color: paymentStat.toUpperCase() === 'PAID' ? 'green' : 'red', backgroundColor: paymentStat.toUpperCase() === 'PAID' ? '#E8F5E9' : '#FFEBEE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', fontWeight: 'bold', fontSize: 12}}>
            {paymentStat.toUpperCase()}
          </Text>
        </Text>
        <Text style={styles.tableCell}>
          {item.total_amount ? `₹${parseFloat(Math.abs(item.total_amount)).toLocaleString('en-IN')}` : '-'}
        </Text>
        <Text style={styles.tableCell}>{item.order_notes || item.note || '-'}</Text>

        <View style={[styles.tableCell, { flexDirection: 'row', gap: 15 }]}>
          <TouchableOpacity onPress={() => {
            setSelectedOrder(item); 
            actionSheetRef.current?.show(); 
          }}>
            <Feather name="eye" size={18} color="#36234E" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            router.push({
              pathname: '/EditOrder',
              params: { item: JSON.stringify(item) }  
            });
          }}>
            <Feather name="edit-3" size={18} color="#36234E" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return { color: 'green', fontWeight: '600' };
      case 'Cancelled':
        return { color: 'red', fontWeight: '600' };
      case 'Pending':
        return { color: '#eab308', fontWeight: '600' };
      case 'Accepted':
        return { color: '#3b82f6', fontWeight: '600' };
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
          {filteredData.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#888', fontFamily: 'mregular' }}>
                No order found
              </Text>
            </View>
          ) : (
            filteredData.map(item => renderItem(item))
          )}
        </View>
      </ScrollView>

       <ActionSheet ref={actionSheetRef}>
      <OrderActionSheet order={selectedOrder} onClose={()=>actionSheetRef.current?.hide()}/>
    </ActionSheet>
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
    borderTopLeftRadius:10,
    borderTopRightRadius:10
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
  actionCell: {
    width: 50,
    alignItems: 'center',
  },
});
