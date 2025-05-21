import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STATUS_OPTIONS = [
  'Processing',
  'Shipping',
  'Delivered',
  'Cancelled',
  'Returned',
];

const ProductStatusMana = () => {
  const [selectedStatus, setSelectedStatus] = useState('Processing');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const selectStatus = (status) => {
    setSelectedStatus(status);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Status Management :</Text>
      <View style={styles.divider} />

      <Text style={styles.label}>Order Status</Text>
      <TouchableOpacity
        onPress={() => setDropdownVisible(true)}
        style={styles.dropdown}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownText}>{selectedStatus}</Text>
        <Ionicons name="chevron-down" size={16} color="black" />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal transparent visible={dropdownVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setDropdownVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContainer}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.option}
                onPress={() => selectStatus(status)}
              >
                <Text style={styles.optionText}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ProductStatusMana;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  dropdown: {
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: 'black',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    padding: 30,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
  },
  option: {
    padding: 14,
    borderBottomColor: '#E0E4F4',
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Montserrat',
  },
});
