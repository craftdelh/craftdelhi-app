import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProfileHeader from './ProfileHeader';

const indianCities = [
  "Agra",
  "Ahmedabad",
  "Ambala",
  "Amritsar",
  "Bangalore",
  "Bhopal",
  "Bhubaneswar",
  "Chandigarh",
  "Chennai",
  "Coimbatore",
  "Delhi",
  "Faridabad",
  "Ghaziabad",
  "Gurgaon",
  "Guwahati",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Jalandhar",
  "Jodhpur",
  "Kanpur",
  "Kochi",
  "Kolkata",
  "Lucknow",
  "Ludhiana",
  "Madurai",
  "Mangalore",
  "Meerut",
  "Nagpur",
  "Nashik",
  "Patna",
  "Pune",
  "Raipur",
  "Rajkot",
  "Ranchi",
  "Surat",
  "Thane",
  "Vadodara",
  "Varanasi",
  "Vijayawada",
  "Visakhapatnam",
];

const DeliveryAddress = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('Delhi'); // default city
  const [address, setAddress] = useState('');
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    phoneNumber.trim().length === 10 &&
    address.trim();

  const selectCity = (selectedCity) => {
    setCity(selectedCity);
    setCityModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <ProfileHeader />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.divider} />

          <View style={{ marginTop: 20 }}>
            {/* Name Fields */}
            <View style={styles.row}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>FIRST NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter first name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>LAST NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter last name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Phone and City */}
            <View style={styles.row}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>PHONE NUMBER</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit number"
                  keyboardType="numeric"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(text) =>
                    setPhoneNumber(text.replace(/[^0-9]/g, ''))
                  }
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>CITY</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdown]}
                  onPress={() => setCityModalVisible(true)}
                >
                  <Text style={styles.dropdownText}>{city}</Text>
                  <Feather name="chevron-down" size={16} color="#555" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Home Address */}
            <View style={styles.inputWrapperFull}>
              <Text style={styles.label}>HOME ADDRESS</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your complete address"
                multiline
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isFormValid ? '#004C5F' : '#999' },
            ]}
            disabled={!isFormValid}
            onPress={() => {
              router.back();
            }}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* City Selection Modal */}
        <Modal
          visible={cityModalVisible}
           animationType="slide" 
          transparent={true}
          onRequestClose={() => setCityModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select City</Text>
              <FlatList
                data={indianCities}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => selectCity(item)}
                  >
                    <Text style={styles.cityText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setCityModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DeliveryAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'mbold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
  },
  inputWrapperFull: {
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
    fontWeight: '600',
    fontFamily: 'mbold',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    height: 60,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#000',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#004C5F',
    fontWeight: 'bold',
  },
});
