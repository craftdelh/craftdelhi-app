import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Image
} from 'react-native';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { ProductData } from '../../../sellerdata';
import ActionSheet from "react-native-actions-sheet";
import RejectionReason from './RejectionReason';
import Delete from '../../../assets/images/delete.svg'
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';



const ProductTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
   const actionSheetRef = useRef(null);
   const editSheetRef=useRef(null);
   const [selectedProduct, setSelectedProduct] = useState(null);
   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
const [productToDelete, setProductToDelete] = useState(null);




  const filteredData = ProductData.filter(item => {
  const nameMatch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
  const orderMatch = orderStatusFilter === 'All' || item.status === orderStatusFilter;
  const categoryMatch = categoryFilter === 'All' || item.teamStatus === categoryFilter;
  return nameMatch && orderMatch && categoryMatch;
});






  const renderHeader = () => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {[
        'SR. No', 'Product Id', 'Product Name', 'Product Image', 'Price', 'Stock',
        'Status', 'Description', 'Team Status', 'Actions'
      ].map((header, idx) => (
        <Text key={idx} style={[styles.tableCell, styles.headerText]}>
          {header}
        </Text>
      ))}
    </View>
  );

 const renderItem = (item, index) => (
  <TouchableOpacity
    key={item.id}
    onPress={() => setSelectedId(item.id)}
    style={[styles.tableRow, selectedId === item.id && styles.selectedRow]}
  >
    <Text style={styles.tableCell}>{index + 1}</Text> 
    <Text style={styles.tableCell}>{item.id}</Text> 
    <Text style={styles.tableCell}>{item.name}</Text> 
    <Text style={styles.tableCell}>
      <Image source={{ uri: item.image }} style={{ width: 50, height: 50 ,borderRadius:25}} />
    </Text> 
    <Text style={styles.tableCell}>₹{item.price?.toFixed(2)}</Text> 
    <Text style={styles.tableCell}>{item.stock}</Text> 
    <Text style={[styles.tableCell, getStatusStyle(item.status)]}>
      {item.status}
    </Text>
    <Text style={styles.tableCell} numberOfLines={1}>{item.description || '-'}</Text> 

                <View style={styles.tableCell}>
            <Text style={getStatusStyle(item.teamStatus)}>
                {item.teamStatus || '-'}
            </Text>
            {item.teamStatus === 'Rejected' && (
                <TouchableOpacity onPress={() => {
                    setSelectedProduct(item);
                    actionSheetRef.current?.show();
                }}>
                <Text style={{ color: '#007BFF', fontSize: 12, marginTop: 4 }}>See Details</Text>
                </TouchableOpacity>
            )}
            </View>


    <View style={[styles.tableCell, { flexDirection: 'row', gap: 12 }]}>
       <TouchableOpacity onPress={() => {
  router.push({
    pathname: '/EditProduct',
    params: { item: JSON.stringify(item) }  
  });
}}>

            <Feather name="edit-3" size={18} color="#36234E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
            setProductToDelete(item);
            setDeleteModalVisible(true);
            }}>
            <AntDesign name="delete" size={18} color="#FF4C4C" />
        </TouchableOpacity>
        </View>

  </TouchableOpacity>
);


  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return { color: 'green', fontWeight: '600' };
      case 'Inactive':
        return { color: '#EE6F69', fontWeight: '600' };
      case 'Approved':
        return { color: '#FFA500', fontWeight: '600' };
        case 'Rejected':
        return { color: 'red', fontWeight: '600' };
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Products</Text>

      {/* Search Filter */}
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

      
      <View style={{ marginTop: 16 }}>
        <TouchableOpacity
          style={styles.selectCategoryBox}
          onPress={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
        >
          <Text style={styles.selectCategoryText}>
            {categoryFilter === 'All' ? 'Select Category' : categoryFilter}
          </Text>
          
            <AntDesign name="down" size={18} color="black" />
          
        </TouchableOpacity>

        
        <View style={{ alignItems: 'flex-end', marginVertical: 12 }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(sellerTab)/AddNewProduct')}
          >
            <AntDesign name="pluscircleo" size={18} color="white" />
            <Text style={styles.addButtonText}>Add New Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      
      <Modal transparent visible={activeDropdown === 'category'} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContent}>
            {['All','Approved', 'Rejected'].map((item, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setCategoryFilter(item);
                  setActiveDropdown(null);
                }}
                style={styles.modalItem}
              >
                <Text style={{ fontSize: 14 }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      <Modal
  transparent
  visible={deleteModalVisible}
  animationType="fade"
  onRequestClose={() => setDeleteModalVisible(false)}
>
  <Pressable
    style={styles.modalOverlay}
    onPress={() => setDeleteModalVisible(false)}
  >
    <View style={styles.confirmModal}>
      <Text style={styles.confirmTitle}>Delete Product</Text>
      <Delete width={40} height ={40} />
      <Text style={{fontFamily:'msemibold',padding:10}}>{productToDelete?.name}</Text>
      <Text style={styles.confirmText}>Are you sure do you want to delete this Product?</Text>
      

      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: '#E0E0E0' }]}
          onPress={() => setDeleteModalVisible(false)}
        >
          <Text style={{ color: '#000' }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: '#024A63' }]}
          onPress={() => {
            console.log('Deleting product:', productToDelete);
            setDeleteModalVisible(false);
            Toast.show({
                type:'success',
                text1: 'Product deleted successfully',
            })
           
          }}
        >
          <Text style={{ color: '#fff' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Pressable>
</Modal>


      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ minWidth: 1200 }}>
          {renderHeader()}
          {filteredData.map((item, index) => renderItem(item, index))}

        </View>
      </ScrollView>

        <ActionSheet ref={actionSheetRef}>
      <RejectionReason
    product={selectedProduct}
    onClose={() => actionSheetRef.current?.hide()}
  />
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

});
