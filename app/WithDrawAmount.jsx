import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import { AntDesign, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const bankOptions = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
];

const WithDrawAmount = () => {
  const [form, setForm] = useState({
    bank: '',
    branch: '',
    holder: '',
    account: '',
    ifsc: '',
  });

  const [isBankModalVisible, setBankModalVisible] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Payment Details</Text>
        <TouchableOpacity onPress={() => router.push('/SellerScreens/MyAccount')}>
          <Feather name="edit" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}>
        <View style={styles.formWrapper}>
          {/* Bank Selector */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Select Bank</Text>
            <TouchableOpacity
              style={styles.inputBox}
              onPress={() => setBankModalVisible(true)}
            >
              <Text style={[styles.inputText, !form.bank && { color: '#999' }]}>
                {form.bank || 'Choose Bank'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal */}
          <Modal
            visible={isBankModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setBankModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {bankOptions.map((bank, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      handleChange('bank', bank);
                      setBankModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>{bank}</Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => setBankModalVisible(false)}
                  style={styles.modalCancel}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Branch Location */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Branch Location</Text>
            <TextInput
              value={form.branch}
              onChangeText={(text) => handleChange('branch', text)}
              style={styles.inputBox}
              placeholder="Connaught Place, New Delhi"
              placeholderTextColor="#999"
            />
          </View>

          {/* Account Holder */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Acc Holder Name</Text>
            <TextInput
              value={form.holder}
              onChangeText={(text) => handleChange('holder', text)}
              style={styles.inputBox}
              placeholder="Rahul Sharma"
              placeholderTextColor="#999"
            />
          </View>

          {/* Account Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              value={form.account}
              onChangeText={(text) => handleChange('account', text)}
              style={styles.inputBox}
              keyboardType="number-pad"
              placeholder="123456789012"
              placeholderTextColor="#999"
            />
          </View>

          {/* IFSC Code */}
          <View style={[styles.inputWrapper, styles.fullWidthInput]}>
            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              value={form.ifsc}
              onChangeText={(text) => handleChange('ifsc', text)}
              style={styles.inputBox}
              placeholder="SBIN0001234"
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default WithDrawAmount;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 17,
  },
  divider: {
    height: 1,
    marginVertical: 10,
    borderColor: '#ccc',
    borderTopWidth: 1,
  },
  formWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  inputWrapper: {
    width: '48%',
    gap: 6,
  },
  fullWidthInput: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat',
  },
  inputBox: {
    height: 56,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E4F4',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  inputText: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: '#000',
  },
  button: {
    marginTop: 32,
    backgroundColor: '#024A63',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Montserrat',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Montserrat',
    color: '#000',
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
});
