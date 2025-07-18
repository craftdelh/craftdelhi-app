import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';



const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

const MyAccount = () => {
  const [editMode, setEditMode] = useState(false)

  const [bank, setBank] = useState('')
  const [branch, setBranch] = useState('')
  const [holder, setHolder] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')

  const [bankModalVisible, setBankModalVisible] = useState(false)
  const [branchModalVisible, setBranchModalVisible] = useState(false)

  const bankOptions = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank']
  const branchOptions = ['Connaught Place, New Delhi', 'Karol Bagh, New Delhi', 'Chandni Chowk, New Delhi']

  useEffect(() => {
  const fetchDetails = async () => {
    try {
      const userData = await AsyncStorage.getItem('user')
      const parsed = JSON.parse(userData)
      const token = parsed?.token

      const { data } = await axiosInstance.get('/profile/getbankdetails', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (data.status) {
        const d = data.bankDetails
        setBank(d.bank_name || '')
        setBranch(d.branch_location || '')
        setHolder(d.account_holder_name || '')
        setAccountNumber(d.account_number || '')
        setIfsc(d.ifsc_code || '')
      } else {
        Toast.show({ type: 'info', text1: data.message })
      }
    } catch (err) {
      console.error(err)
      Toast.show({ type: 'error', text1: 'Failed to load details' })
    }
  }

  fetchDetails()
}, [])



 const handleSave = async () => {
  try {
    const userData = await AsyncStorage.getItem('user')
    const parsed = JSON.parse(userData)
    const token = parsed?.token

    const payload = {
      bank_name: bank,
      branch_location: branch,
      account_holder_name: holder,
      account_number: accountNumber,
      ifsc_code: ifsc,
    }

    const { data } = await axiosInstance.put('/profile/editbankdetails', payload, {
      headers: {
        Authorization: `${token}`,
      },
    })

    if (data.status) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setEditMode(false)
      Toast.show({
        type: 'success',
        text1: 'Bank details updated successfully',
        position: 'bottom',
      })
    } else {
      Toast.show({
        type: 'error',
        text1: data.message || 'Update failed',
        position: 'bottom',
      })
    }
  } catch (err) {
    console.error(err)
    Toast.show({
      type: 'error',
      text1: 'Internal server error',
      position: 'bottom',
    })
  }
}



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.sideIcon}>
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>My Account Details</Text>
            <View style={styles.sideIcon} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.divider} />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Bank</Text>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => editMode && setBankModalVisible(true)}
                activeOpacity={editMode ? 0.7 : 1}
              >
                <Text style={[styles.inputText, { color: editMode ? 'black' : '#999' }]}>{bank}</Text>
                <View style={styles.dropdownIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Branch Location</Text>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => editMode && setBranchModalVisible(true)}
                activeOpacity={editMode ? 0.7 : 1}
              >
                <Text style={[styles.inputText, { color: editMode ? 'black' : '#999' }]}>{branch}</Text>
                <View style={styles.dropdownIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Holder Name</Text>
              <View style={styles.inputBox}>
                <TextInput
                  editable={editMode}
                  value={holder}
                  onChangeText={setHolder}
                  style={styles.inputText}
                  placeholder="Holder Name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  editable={editMode}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  style={styles.inputText}
                  placeholder="Account Number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={16}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>IFSC Code</Text>
              <View style={styles.inputBox}>
                <TextInput
                  editable={editMode}
                  value={ifsc}
                  onChangeText={setIfsc}
                  style={styles.inputText}
                  placeholder="IFSC Code"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  maxLength={11}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#024A63' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                editMode ? handleSave() : setEditMode(true)
              }}
            >
              <Text style={styles.buttonText}>{editMode ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Bank Modal */}
          <Modal visible={bankModalVisible} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setBankModalVisible(false)}>
              <View style={styles.modalContent}>
                {bankOptions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.bankOption}
                    onPress={() => {
                      setBank(item)
                      setBankModalVisible(false)
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Branch Modal */}
          <Modal visible={branchModalVisible} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setBranchModalVisible(false)}>
              <View style={styles.modalContent}>
                {branchOptions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.bankOption}
                    onPress={() => {
                      setBranch(item)
                      setBranchModalVisible(false)
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          <Toast />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default MyAccount


const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',
  },
  sideIcon: {
    width: 24,
  },
  divider: {
    height: 1,
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginVertical: 20,
  },
  sectionTitle: {
    fontFamily: 'mbold',
    fontSize: 17,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: 'black',
    fontSize: 10,
    fontFamily: 'mbold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputBox: {
    height: 56,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    flex: 1,
    fontSize: 12,
    color: 'black',
    fontFamily: 'regular',
  },
  dropdownIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'black',
    marginLeft: 8,
  },
  button: {
    height: 48,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'mbold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    padding: 10,
  },
  bankOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
})
