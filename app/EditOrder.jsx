import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';  // <-- import router
import Buyerinfo from '../components/Seller/editorderfolder/Buyerinfo';
import Productsorders from '../components/Seller/editorderfolder/Productsorders';
import ProductStatusMana from '../components/Seller/editorderfolder/ProductStatusMana';
import PaymentInfo from '../components/Seller/editorderfolder/PaymentInfo';
import ShippingInfo from '../components/Seller/editorderfolder/ShippingInfo';

const EditOrder = () => {
  const router = useRouter();  // <-- initialize router

  const [orderId, setOrderId] = useState('');
  const [orderTime, setOrderTime] = useState('');
  const [orderDate, setOrderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || orderDate;
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setOrderDate(currentDate);
    }
  };

  const formatDate = (date) => {
    return date.toDateString();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.backButton} />
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text style={styles.sectionTitle}>Order Summary Section :</Text>
        <View style={styles.divider} />

        {/* Order ID Field */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Order ID</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={orderId}
              onChangeText={setOrderId}
              style={styles.inputText}
              placeholder="Enter Order ID"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Order Date Field with Icon */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Order Date</Text>
          <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.inputText}>{formatDate(orderDate)}</Text>
            <Entypo name="calendar" size={16} color="#000" style={{ opacity: 0.6, marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={orderDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Order Time Field */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Order Time</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={orderTime}
              onChangeText={setOrderTime}
              style={styles.inputText}
              placeholder="Enter Order Time"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Other Components */}
        <Buyerinfo />
        <Productsorders />
        <ProductStatusMana />
        <PaymentInfo />
        <ShippingInfo />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.button, styles.cancelButton]}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // Add save logic here
              console.log('Save pressed');
            }}
            style={[styles.button, styles.saveButton]}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditOrder;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding:20
  },
  backButton: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'mbold',
  },
  sectionTitle: {
    fontFamily: 'mbold',
    fontSize: 18,
    marginTop: 10,
  },
  divider: {
    height: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    borderTopWidth: 1,
  },
  fieldBlock: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontFamily: 'mbold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'black',
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E4F4',
    borderRadius: 4,
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'msregular',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#024A63',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'mbold',
  },
});
