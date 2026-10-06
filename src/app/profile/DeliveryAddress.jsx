import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProfileHeader from './ProfileHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// A simple custom Toast Component
const CustomToast = ({ visible, message, type }) => {
  if (!visible) return null;
  return (
    <View style={[styles.toastContainer, type === 'error' ? styles.toastError : styles.toastSuccess]}>
      <Ionicons name={type === 'error' ? "alert-circle" : "checkmark-circle"} size={20} color="white" />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

const DeliveryAddress = () => {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Custom Alert / Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const init = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setToken(user.token);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}useraddress/get`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) {
        const fetchedAddresses = res.data.data || [];
        setAddresses(fetchedAddresses);
        
        const savedSelectedId = await AsyncStorage.getItem('@selected_address_id');
        if (savedSelectedId) {
          setSelectedAddressId(Number(savedSelectedId));
        } else if (fetchedAddresses.length > 0) {
          const firstId = fetchedAddresses[0].id;
          setSelectedAddressId(firstId);
          await AsyncStorage.setItem('@selected_address_id', String(firstId));
        }
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSelectAddress = async (id) => {
    setSelectedAddressId(id);
    await AsyncStorage.setItem('@selected_address_id', String(id));
  };

  const isFormValid =
    street.trim() &&
    city.trim() &&
    state.trim() &&
    country.trim() &&
    postalCode.trim();

  const handleSave = async () => {
    if (!token) {
      showToast("Please login first", 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { street, city, state, country, postal_code: postalCode };
      
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}useraddress/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) {
        const newAddr = res.data.data;
        setAddresses((prev) => [...prev, newAddr]);
        setStreet('');
        setCity('');
        setState('');
        setPostalCode('');
        showToast("Address added successfully!", 'success');
        
        // Auto select newly added if it's the first one
        if (addresses.length === 0) {
          handleSelectAddress(newAddr.id);
        }
      } else {
        showToast(res.data.message || "Failed to save address", 'error');
      }
    } catch (err) {
      console.error("Save address error:", err);
      showToast("Something went wrong while saving address", 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!addressToDelete || !token) return;
    setDeleteModalVisible(false);
    const id = addressToDelete;
    try {
      const res = await axios.delete(
        `${process.env.EXPO_PUBLIC_BASE_URL}useraddress/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        if (selectedAddressId === id) {
          setSelectedAddressId(null);
          await AsyncStorage.removeItem('@selected_address_id');
        }
        showToast("Address deleted successfully", 'success');
      } else {
        showToast(res.data.message || "Failed to delete address", 'error');
      }
    } catch (err) {
      console.error("Delete address error:", err);
      showToast("Something went wrong while deleting address", 'error');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <ProfileHeader />
        
        <CustomToast visible={toast.visible} message={toast.message} type={toast.type} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>Select Delivery Address</Text>
            <Text style={styles.subTitle}>Choose where you want your order delivered</Text>
          </View>

          {loadingAddresses ? (
            <ActivityIndicator size="large" color="#024a63" style={{ marginVertical: 30 }} />
          ) : addresses.length > 0 ? (
            <View style={styles.addressList}>
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <TouchableOpacity 
                    key={addr.id} 
                    style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                    onPress={() => handleSelectAddress(addr.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.radioContainer}>
                        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.addressLabel, isSelected && styles.addressLabelSelected]}>
                          Address {addresses.indexOf(addr) + 1}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.deleteIconBox} 
                        onPress={() => { setAddressToDelete(addr.id); setDeleteModalVisible(true); }}
                      >
                        <Feather name="trash-2" size={18} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.addressStreet}>{addr.street}</Text>
                      <Text style={styles.addressCity}>{addr.city}, {addr.state}</Text>
                      <Text style={styles.addressCountry}>{addr.country} - {addr.postal_code}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No saved addresses found.</Text>
            </View>
          )}

          <View style={styles.divider} />
          
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>Add New Address</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapperFull}>
              <Text style={styles.label}>STREET ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="House No, Building, Street"
                placeholderTextColor="#999"
                value={street}
                onChangeText={setStreet}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>CITY</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. New Delhi"
                  placeholderTextColor="#999"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>STATE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Delhi"
                  placeholderTextColor="#999"
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>COUNTRY</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. India"
                  placeholderTextColor="#999"
                  value={country}
                  onChangeText={setCountry}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>POSTAL CODE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 110001"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={postalCode}
                  onChangeText={setPostalCode}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
            disabled={!isFormValid || saving}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="white" style={{marginRight:8}} />
                <Text style={styles.saveButtonText}>Add Address</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconBox}>
              <Ionicons name="trash-outline" size={32} color="#e74c3c" />
            </View>
            <Text style={styles.modalTitle}>Delete Address</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this address? This action cannot be undone.</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default DeliveryAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Montserrat',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E4F4',
    marginVertical: 24,
  },
  addressList: {
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  addressCardSelected: {
    borderColor: '#024a63',
    backgroundColor: '#F5FBFE',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#024a63',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#024a63',
  },
  addressLabel: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#333',
  },
  addressLabelSelected: {
    color: '#024a63',
  },
  deleteIconBox: {
    padding: 6,
    backgroundColor: '#FEF0F0',
    borderRadius: 8,
  },
  cardBody: {
    paddingLeft: 30,
  },
  addressStreet: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  addressCity: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
    fontFamily: 'Montserrat',
  },
  addressCountry: {
    fontSize: 13,
    color: '#777',
    fontFamily: 'Montserrat',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    fontFamily: 'Montserrat',
  },
  formContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E4F4',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
  },
  inputWrapperFull: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    color: '#555',
    marginBottom: 8,
    fontFamily: 'mbold',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    height: 52,
    fontFamily: 'Montserrat',
    color: '#111',
  },
  saveButton: {
    backgroundColor: '#024a63',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#024a63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#A0B2B9',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'mbold',
    fontSize: 16,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  toastSuccess: {
    backgroundColor: '#2ecc71',
  },
  toastError: {
    backgroundColor: '#e74c3c',
  },
  toastText: {
    color: 'white',
    fontFamily: 'mbold',
    fontSize: 14,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Montserrat',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#4B5563',
    fontFamily: 'mbold',
    fontSize: 14,
  },
  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  modalDeleteText: {
    color: 'white',
    fontFamily: 'mbold',
    fontSize: 14,
  },
});
