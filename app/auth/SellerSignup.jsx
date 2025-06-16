import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Logo1 from '../../assets/images/logo1.svg';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SellerSignup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { email, password } = useLocalSearchParams();


  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    emailRegex.test(email) &&
    dob.trim() &&
    phone.trim().length === 10;

  useEffect(() => {
    if (!touched) return;

    if (!firstName.trim()) setError('First name is required');
    else if (!lastName.trim()) setError('Last name is required');
    else if (!email.trim()) setError('Email is required');
    else if (!emailRegex.test(email)) setError('Invalid email address');
    else if (!dob.trim()) setError('Date of birth is required');
    else if (!phone.trim()) setError('Phone number is required');
    else if (phone.trim().length !== 10) setError('Phone number must be 10 digits');
    else setError('');
  }, [firstName, lastName, email, dob, phone, touched]);






const handleSignup = async () => {
  setTouched(true);
  if (!isFormValid) {
    Toast.show({
      type: 'error',
      text1: 'Form Error',
      text2: error || 'Please fill all required fields correctly.',
    });
    return;
  }

  try {
    const response = await axios.post(
      'https://backend.craftdelhi.com/backend/api/auth/register-details',
      {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        dob,
        password,
        role: 3,
      }
    );

    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: response.data?.message || 'User registered successfully!',
    });

    setTimeout(() => {
      router.replace('/auth/Signin');
    }, 2000);
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || 'Something went wrong. Please try again.';

    Toast.show({
      type: 'error',
      text1: 'Registration Failed',
      text2: errorMessage,
    });
  }
};





  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setDob(formattedDate);
    setTouched(true);
    hideDatePicker();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                 <Logo1 width={180} height={180} />
                <Text style={styles.loginTitle}>Seller Sign Up</Text>
              </View>

              <View style={styles.middle}>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>FIRST NAME</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Placeholder"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        setTouched(true);
                      }}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>LAST NAME</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Placeholder"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        setTouched(true);
                      }}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { paddingHorizontal: 20 }]}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <TextInput
                        style={[styles.input, { backgroundColor: '#f2f2f2', color: '#999' }]}
                        value={email}
                        editable={false}
                        selectTextOnFocus={false}
                        />

                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>DATE OF BIRTH</Text>
                    <TouchableOpacity onPress={showDatePicker}>
                      <View style={styles.inputWithIcon}>
                        <Text style={styles.inputIconField}>{dob || 'Select date'}</Text>
                        <Icon name="calendar-outline" size={20} color="#888" />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>PHONE NUMBER</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Placeholder"
                      value={phone}
                      maxLength={10}
                      onChangeText={(text) => {
                        setPhone(text);
                        setTouched(true);
                      }}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              {touched && error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, !isFormValid && styles.disabledButton]}
                  disabled={!isFormValid}
                  onPress={handleSignup}
                >
                  <Text style={[styles.buttonText, !isFormValid && { color: '#999' }]}>Continue</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.terms}>By continuing, you agree to our</Text>
                <View style={styles.links}>
                  <Text style={styles.link}>Terms of Service</Text>
                  <Text style={styles.link}>Privacy Policy</Text>
                  <Text style={styles.link}>Content Policies</Text>
                </View>
              </View>
          </ScrollView>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SellerSignup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 5,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'mbold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    alignSelf: 'stretch',
    color: 'black',
    fontSize: 12,
    fontFamily: 'mbold',
    fontWeight: '700',
    textTransform: 'uppercase',
    lineHeight: 16,
    letterSpacing: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    height: 56,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: 'white',
    marginTop: 5,
    fontSize: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  inputIconField: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#003D4D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E2E6EA',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'mmedium',
  },
  signup: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 12,
    fontFamily: 'mbold',
  },
  terms: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    fontFamily: 'mbold',
  },
  links: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  link: {
    fontSize: 12,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
