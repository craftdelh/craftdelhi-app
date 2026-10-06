import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useUser } from '../../../context/UserContext';

const indianBanks = [
  "State Bank of India", "Punjab National Bank", "HDFC Bank", "ICICI Bank",
  "Axis Bank", "Kotak Mahindra Bank", "Bank of Baroda", "Union Bank of India",
  "Canara Bank", "Indian Bank", "IDFC First Bank", "IndusInd Bank", "Yes Bank",
  "Federal Bank", "UCO Bank", "Central Bank of India", "Punjab & Sind Bank",
  "Bank of India", "South Indian Bank", "RBL Bank", "Karur Vysya Bank",
  "Tamilnad Mercantile Bank", "City Union Bank", "IDBI Bank", "Dhanlaxmi Bank",
  "Bandhan Bank", "Jana Small Finance Bank", "AU Small Finance Bank",
  "Fincare Small Finance Bank", "Equitas Small Finance Bank", "Suryoday Small Finance Bank"
];

const MyAccount = () => {
  const { user } = useUser();
  const navigation = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const [formValues, setFormValues] = useState({
    bank: '',
    branch: '',
    holder: '',
    accountNumber: '',
    ifsc: '',
  });
  const [backupValues, setBackupValues] = useState({});

  const fetchDetails = useCallback(async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}profile/getbankdetails`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      if (res.data?.status) {
        const details = res.data.bankDetails;
        const initialData = {
          bank: details.bank_name || '',
          branch: details.branch_location || '',
          holder: details.account_holder_name || '',
          accountNumber: details.account_number || '',
          ifsc: details.ifsc_code || '',
        };
        setFormValues(initialData);
        setBackupValues(initialData);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.data?.message || 'Failed to fetch bank details.' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch bank details.' });
    } finally {
      setFetchLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.token) fetchDetails();
  }, [fetchDetails]);

  const handleChange = (name, value) => {
    if (name === "holder") {
      const cleaned = value.replace(/[^A-Za-z ]/g, "");
      setFormValues(prev => ({ ...prev, holder: cleaned }));
      return;
    }
    if (name === "accountNumber") {
      const cleaned = value.replace(/\D/g, "");
      setFormValues(prev => ({ ...prev, accountNumber: cleaned }));
      return;
    }
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formValues.bank) return Toast.show({ type: 'error', text1: 'Bank is required' });
    if (!formValues.holder) return Toast.show({ type: 'error', text1: 'Account Holder Name is required' });
    if (!formValues.accountNumber) return Toast.show({ type: 'error', text1: 'Account Number is required' });
    if (!formValues.ifsc) return Toast.show({ type: 'error', text1: 'IFSC Code is required' });

    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}profile/editbankdetails`,
        {
          bank_name: formValues.bank,
          branch_location: formValues.branch,
          account_holder_name: formValues.holder,
          account_number: formValues.accountNumber,
          ifsc_code: formValues.ifsc,
        },
        { headers: { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'application/json' } }
      );

      if (res.data?.status) {
        Toast.show({ type: 'success', text1: 'Bank details updated successfully.' });
        setIsEditing(false);
        setBackupValues({ ...formValues });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.data?.message || 'Failed to update.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormValues({ ...backupValues });
    setIsEditing(false);
  };

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B3C5D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.sideIcon}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Account</Text>
        <View style={styles.sideIcon} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Bank Account Details</Text>
            <Text style={styles.subtitle}>Manage your bank details for receiving payouts</Text>
            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SELECT BANK <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.input, !isEditing && styles.inputDisabled, { justifyContent: 'center' }]}
                disabled={!isEditing}
                onPress={() => setShowBankPicker(true)}
              >
                <Text style={[styles.inputText, !isEditing && { color: '#888' }]}>
                  {formValues.bank || 'Select your bank'}
                </Text>
                <Feather name="chevron-down" size={18} color="#888" style={{ position: 'absolute', right: 15 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>BRANCH LOCATION</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formValues.branch}
                onChangeText={(text) => handleChange('branch', text)}
                editable={isEditing}
                placeholder="Enter branch location"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ACCOUNT HOLDER NAME <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formValues.holder}
                onChangeText={(text) => handleChange('holder', text)}
                editable={isEditing}
                placeholder="Enter account holder name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ACCOUNT NUMBER <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formValues.accountNumber}
                onChangeText={(text) => handleChange('accountNumber', text)}
                editable={isEditing}
                keyboardType="numeric"
                placeholder="Enter account number"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IFSC CODE <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formValues.ifsc}
                onChangeText={(text) => handleChange('ifsc', text)}
                editable={isEditing}
                autoCapitalize="characters"
                placeholder="Enter IFSC code"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.buttonRow}>
              {!isEditing ? (
                <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditing(true)}>
                  <Text style={styles.primaryButtonText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel} disabled={loading}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.primaryButton, loading && styles.disabledButton]} 
                    onPress={handleSave} 
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bank Picker Modal */}
      <Modal visible={showBankPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={indianBanks}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    handleChange('bank', item);
                    setShowBankPicker(false);
                  }}
                >
                  <Text style={[styles.modalItemText, formValues.bank === item && { color: '#024a63', fontFamily: 'mbold' }]}>
                    {item}
                  </Text>
                  {formValues.bank === item && <Feather name="check" size={20} color="#024a63" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyAccount;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  sideIcon: {
    width: 30,
    alignItems: 'flex-start',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'mmedium',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 1,
  },
  required: {
    color: 'red',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 14,
  },
  inputText: {
    fontSize: 14,
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#024a63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'mbold',
  },
  secondaryButton: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'mbold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalItemText: {
    fontSize: 15,
    color: '#333',
  },
});
