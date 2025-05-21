import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Dropdown = ({ label, value, onPress }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity style={styles.dropdown} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.dropdownText}>{value}</Text>
      <Icon name="arrow-drop-down" size={24} color="black" />
    </TouchableOpacity>
  </View>
);

const ShippingInfo = () => {
  const [packageWeight, setPackageWeight] = useState('2');
  const [unit, setUnit] = useState('kg');
  const [warranty, setWarranty] = useState('Standard');
  const [shippingAddress, setShippingAddress] = useState('');
  const maxAddressLength = 300;

  // Date Pickers
  const [deliveryFrom, setDeliveryFrom] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);

  const [deliveryTo, setDeliveryTo] = useState(null);
  const [showToPicker, setShowToPicker] = useState(false);

  // Dropdown states for unit and warranty modal
  const [showUnitOptions, setShowUnitOptions] = useState(false);
  const [showWarrantyOptions, setShowWarrantyOptions] = useState(false);

  const units = ['g', 'kg'];
  const warranties = ['Standard', 'Extended', 'Premium'];

  const formatDate = (date) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString();
  };

  const onChangeFrom = (event, selectedDate) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (selectedDate) setDeliveryFrom(selectedDate);
  };

  const onChangeTo = (event, selectedDate) => {
    setShowToPicker(Platform.OS === 'ios');
    if (selectedDate) setDeliveryTo(selectedDate);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Shipping Information :</Text>
      <View style={styles.divider} />

      {/* Package Weight */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Package Weight</Text>
        <TextInput
          style={styles.inputBox}
          value={packageWeight}
          onChangeText={(text) => {
            // Allow only numeric input
            if (/^\d*\.?\d*$/.test(text)) setPackageWeight(text);
          }}
          placeholder="Enter weight"
          placeholderTextColor="#E0E4F4"
          keyboardType="numeric"
        />
      </View>

      {/* Unit Dropdown */}
      <Dropdown
        label="Select gram / kg"
        value={unit}
        onPress={() => setShowUnitOptions(!showUnitOptions)}
      />
      {showUnitOptions &&
        units.map((u) => (
          <TouchableOpacity
            key={u}
            style={styles.option}
            onPress={() => {
              setUnit(u);
              setShowUnitOptions(false);
            }}
          >
            <Text style={styles.optionText}>{u}</Text>
          </TouchableOpacity>
        ))}

      {/* Warranty Dropdown */}
      <Dropdown
        label="Warranty Type"
        value={warranty}
        onPress={() => setShowWarrantyOptions(!showWarrantyOptions)}
      />
      {showWarrantyOptions &&
        warranties.map((w) => (
          <TouchableOpacity
            key={w}
            style={styles.option}
            onPress={() => {
              setWarranty(w);
              setShowWarrantyOptions(false);
            }}
          >
            <Text style={styles.optionText}>{w}</Text>
          </TouchableOpacity>
        ))}

      {/* Shipping Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Shipping Address</Text>
        <View style={styles.addressBox}>
          <TextInput
            style={styles.addressText}
            multiline
            value={shippingAddress}
            onChangeText={(text) =>
              text.length <= maxAddressLength && setShippingAddress(text)
            }
            placeholder="Enter shipping address"
            placeholderTextColor="#E0E4F4"
          />
          <Text style={styles.charCount}>
            {shippingAddress.length}/{maxAddressLength}
          </Text>
        </View>
      </View>

      {/* Estimated Delivery Date From */}
      <Dropdown
        label="Estimated delivery date From"
        value={formatDate(deliveryFrom)}
        onPress={() => setShowFromPicker(true)}
      />
      {showFromPicker && (
        <DateTimePicker
          value={deliveryFrom || new Date()}
          mode="date"
          display="default"
          onChange={onChangeFrom}
          minimumDate={new Date()}
        />
      )}

      {/* Estimated Delivery Date To */}
      <Dropdown
        label="Estimated delivery date To"
        value={formatDate(deliveryTo)}
        onPress={() => setShowToPicker(true)}
      />
      {showToPicker && (
        <DateTimePicker
          value={deliveryTo || new Date()}
          mode="date"
          display="default"
          onChange={onChangeTo}
          minimumDate={deliveryFrom || new Date()}
        />
      )}
    </ScrollView>
  );
};

export default ShippingInfo;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingBottom: 50,
  },
  sectionTitle: {
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
  inputGroup: {
    marginBottom: 20,
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
  inputBox: {
    height: 56,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E4F4',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Montserrat',
    color: 'black',
  },
  dropdown: {
    height: 56,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E4F4',
    borderRadius: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Montserrat',
    color: 'black',
  },
  option: {
    backgroundColor: 'white',
    borderColor: '#E0E4F4',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Montserrat',
  },
  addressBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'flex-start',
  },
  addressText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Montserrat',
    color: '#000000',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: '#E0E4F4',
    textAlign: 'right',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
