import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import ActionSheet from "react-native-actions-sheet";
import { router, useFocusEffect } from 'expo-router';
import Delete from '../../../assets/images/delete.svg'
import RejectionReason from './RejectionReason';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageUrl } from '../../../src/utils/imageUrl';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL; 

const ProductTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const actionSheetRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  useFocusEffect(
  useCallback(() => {
    fetchProducts();
  }, [])
);


  const deleteProduct = async (productId) => {
  try {
    const userData = await AsyncStorage.getItem('user');
    const parsed = JSON.parse(userData);
    const token = parsed?.token;

    const response = await axios.delete(`${BASE_URL}/products/delete/${productId}`, {
      headers: { Authorization: `${token}` }
    });

    if (response.data.status) {
      Toast.show({ type: 'success', text1: response.data.message || 'Product deleted successfully' });
      // remove deleted product from local state
      setProducts(prev => prev.filter(item => item.id !== productId));
    } else {
      Toast.show({ type: 'error', text1: response.data.message || 'Failed to delete product' });
    }
  } catch (err) {
    // console.error(err);
    Toast.show({ type: 'error', text1: 'Server error while deleting product' });
  }
};


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user');
      const parsed = JSON.parse(userData);
      const token = parsed?.token;
      
      const response = await axios.get(`${BASE_URL}seller-store/products-view`, {
        headers: { Authorization: `${token}` }
      });
      if (response.data.data) {
        const formatted = response.data.data.map((item, index) => {
          const imageUrl = getImageUrl(item.main_image_url, 'thumbnail');
          return {
            ...item,
            srNo: index + 1,
            productId: item.product_sku || `PRD${item.id}`,
            name: item.name,
            image: imageUrl,
            price: Number(item.price) || 0,
            stock: item.stock,
            status: item.status ?? 'Active',
            description: item.description || '-',
            teamStatus: item.team_status ?? 0,
            id: item.id,
          };
        });
        setProducts(formatted);
      } else {
        Toast.show({ type: 'error', text1: 'Failed to fetch products' });
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Server error while fetching products' });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = products.filter(item => {
    const nameMatch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = categoryFilter === 'All' || item.status === categoryFilter;
    return nameMatch && categoryMatch;
  });

  const renderHeader = () => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {['SR NO', 'PRODUCT ID', 'PRODUCT NAME', 'PRODUCT IMAGE', 'PRICE', 'STOCK', 'STATUS', 'DESCRIPTION', 'TEAM STATUS', 'ACTIONS']
        .map((header, idx) => (
          <Text key={idx} style={[styles.tableCell, styles.headerText]}>{header}</Text>
        ))}
    </View>
  );

  const getStatusStyle = (status) => {
    const isActive = status == 1 || status === 'Active';
    if (isActive) return { borderColor: '#4CAF50', backgroundColor: '#E8F5E9', color: '#4CAF50' };
    return { borderColor: '#F44336', backgroundColor: '#FFEBEE', color: '#F44336' };
  };

  const getTeamStatusStyle = (adminApproval, teamStatusVal) => {
    const val = adminApproval ?? teamStatusVal;
    if (val == 1 || String(val).toLowerCase() === 'approved') return { borderColor: '#4CAF50', color: '#4CAF50', text: 'APPROVED' };
    if (val == 2 || String(val).toLowerCase() === 'rejected') return { borderColor: '#F44336', color: '#F44336', text: 'REJECTED' };
    return { borderColor: '#FFC107', color: '#FFC107', text: 'PENDING' };
  };

  const renderItem = (item, index) => {
    const statusStyle = getStatusStyle(item.status);
    const teamStyle = getTeamStatusStyle(item.admin_approval, item.teamStatus);
    
    const displayStatus = (item.status == 1 || item.status === 'Active') ? 'Active' : 'Inactive';
    const displayTeamStatus = teamStyle.text;

    return (
    <TouchableOpacity
      key={item.id}
      onPress={() => setSelectedId(item.id)}
      style={[styles.tableRow, selectedId === item.id && styles.selectedRow]}
    >
      <Text style={styles.tableCell}>{index + 1}</Text>
      <Text style={styles.tableCell}>{item.productId}</Text>
      <Text style={styles.tableCell}>{item.name}</Text>
      <View style={styles.tableCell}>
        <Image source={{ uri: item.image || 'https://via.placeholder.com/50' }}
          style={{ width: 50, height: 50, borderRadius: 8 }} />
      </View>
      <Text style={styles.tableCell}>₹{item.price?.toLocaleString('en-IN')}</Text>
      <Text style={styles.tableCell}>{item.stock}</Text>
      <View style={styles.tableCell}>
        <View style={[styles.statusBadge, { borderColor: statusStyle.borderColor, backgroundColor: statusStyle.backgroundColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
          <Text style={[styles.statusText, { color: statusStyle.color }]}>{displayStatus}</Text>
        </View>
      </View>
      <Text style={styles.tableCell} numberOfLines={1}>{item.description || '-'}</Text>
      <View style={styles.tableCell}>
        <View style={[styles.teamBadge, { borderColor: teamStyle.borderColor }]}>
          <Text style={[styles.teamText, { color: teamStyle.color }]}>{displayTeamStatus}</Text>
        </View>
        {displayTeamStatus === 'REJECTED' && (
          <TouchableOpacity 
            style={{ marginTop: 6 }} 
            onPress={() => {
              setSelectedProduct(item);
              actionSheetRef.current?.show();
            }}
          >
            <Text style={{ fontSize: 11, color: '#024A63', fontFamily: 'mmedium' }}>View Reason →</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.tableCell, { flexDirection: 'row', gap: 12 }]}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/EditProduct', params: { item: JSON.stringify(item) } })}>
          <Feather name="edit-3" size={18} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setProductToDelete(item); setDeleteModalVisible(true); }}>
          <AntDesign name="delete" size={18} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )};

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>My Products</Text>
        <Text style={styles.subtitle}>Manage your products inventory, visibility, and status.</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          placeholder="Search by product name"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginTop: 16 }}>
        <TouchableOpacity
          style={styles.selectCategoryBox}
          onPress={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
        >
          <Text style={styles.selectCategoryText}>
            {categoryFilter === 'All' ? 'Select Status' : categoryFilter}
          </Text>
          <AntDesign name="down" size={18} color="black" />
        </TouchableOpacity>

        <View style={{ alignItems: 'flex-end', marginVertical: 12 }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(sellerTab)/AddNewProduct')}
          >
            <Feather name="plus-circle" size={18} color="white" />
            <Text style={styles.addButtonText}>Add New Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal transparent visible={activeDropdown === 'category'} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContent}>
            {['All', 'Approved', 'Rejected'].map((item, index) => (
              <Pressable key={index} onPress={() => { setCategoryFilter(item); setActiveDropdown(null); }} style={styles.modalItem}>
                <Text style={{ fontSize: 14 }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={deleteModalVisible} animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Product</Text>
            <Delete width={40} height={40} />
            <Text style={{ fontFamily: 'msemibold', padding: 10 }}>{productToDelete?.name}</Text>
            <Text style={styles.confirmText}>Are you sure you want to delete this Product?</Text>
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity style={[styles.confirmButton, { backgroundColor: '#E0E0E0' }]} onPress={() => setDeleteModalVisible(false)}>
                <Text style={{ color: '#000' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                    style={[styles.confirmButton, { backgroundColor: '#024A63' }]} 
                    onPress={() => {
                      setDeleteModalVisible(false);
                      if (productToDelete?.id) {
                        deleteProduct(productToDelete.id);
                      }
                    }}
                  >
                    <Text style={{ color: '#fff' }}>Delete</Text>
                  </TouchableOpacity>

            </View>
          </View>
        </Pressable>
      </Modal>

      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ minWidth: 1200 }}>
            {renderHeader()}
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCell}><View style={[styles.skeletonBlock, { width: '40%' }]} /></View>
                <View style={styles.tableCell}><View style={styles.skeletonBlock} /></View>
                <View style={styles.tableCell}><View style={styles.skeletonBlock} /></View>
                <View style={styles.tableCell}>
                  <View style={[styles.skeletonBlock, { width: 50, height: 50, borderRadius: 8 }]} />
                </View>
                <View style={styles.tableCell}><View style={styles.skeletonBlock} /></View>
                <View style={styles.tableCell}><View style={[styles.skeletonBlock, { width: '30%' }]} /></View>
                <View style={styles.tableCell}>
                  <View style={[styles.skeletonBlock, { height: 24, borderRadius: 12, width: '80%' }]} />
                </View>
                <View style={styles.tableCell}><View style={styles.skeletonBlock} /></View>
                <View style={styles.tableCell}>
                  <View style={[styles.skeletonBlock, { height: 24, borderRadius: 12, width: '80%' }]} />
                </View>
                <View style={[styles.tableCell, { flexDirection: 'row', gap: 12 }]}>
                  <View style={[styles.skeletonBlock, { width: 24, height: 24, borderRadius: 12 }]} />
                  <View style={[styles.skeletonBlock, { width: 24, height: 24, borderRadius: 12 }]} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ minWidth: 1200 }}>
            {renderHeader()}
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => renderItem(item, index))
            ) : (
              <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'mmedium', fontSize: 16, color: '#666' }}>No products found.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <ActionSheet ref={actionSheetRef}>
        <RejectionReason product={selectedProduct} onClose={() => actionSheetRef.current?.hide()} />
      </ActionSheet>
    </View>
  );
};

export default ProductTable;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
    color: '#36234E',
    fontFamily: 'mbold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'mmedium',
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
  selectCategoryBox: {
    width: '100%',
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectCategoryText: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'Montserrat',
    fontWeight: '400',
    lineHeight: 20,
  },
  arrowIconBox: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDown: {
    width: 8,
    height: 4,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'black',
    transform: [{ rotate: '135deg' }],
  },
  addButton: {
    backgroundColor: '#024A63',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'row',
    alignItems:'center',
    gap:10
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    fontFamily:'msemibold'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    width: 220,
    elevation: 6,
  },
  modalItem: {
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
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  teamBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
  teamText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  confirmModal: {
  width: 300,
  padding: 20,
  borderRadius: 12,
  backgroundColor: '#fff',
  alignItems: 'center',
  elevation: 5,
},

confirmTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 10,
  color: '#36234E',
},

confirmText: {
  fontSize: 14,
  textAlign: 'center',
  color: '#555',
  marginBottom: 20,
},

confirmButtonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},

confirmButton: {
  flex: 1,
  paddingVertical: 12,
  marginHorizontal: 5,
  borderRadius: 6,
  alignItems: 'center',
},

  skeletonBlock: {
    width: '90%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    opacity: 0.6,
  }
});
