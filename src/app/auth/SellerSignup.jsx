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
  Keyboard,
  ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Logo1 from '../../../assets/images/logo1.svg';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SellerSignup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { email, password } = useLocalSearchParams();


  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    emailRegex.test(email) &&
    dob.trim() &&
    gender &&
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
    else if (!gender) setError('Gender is required');
    else setError('');
  }, [firstName, lastName, email, dob, phone, gender, touched]);






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
      `${process.env.EXPO_PUBLIC_BASE_URL}auth/register-details`,
      {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        dob,
        gender,
        password,
        role: 2,
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
    <ImageBackground 
      source={require('../../../assets/images/bg.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, backgroundColor: '#fff', margin: 15, borderRadius: 16, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginTop: 40, marginBottom: 40 }}>
              <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Image source={require('../../../assets/images/icon1.png')} style={{ width: 45, height: 45, resizeMode: 'contain' }} />
                  <View style={{ width: 3, height: 45, backgroundColor: '#024a63', borderRadius: 2, marginHorizontal: 12 }} />
                  <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text style={{ color: '#ee6f69', fontSize: 26, fontWeight: 'bold' }}>CRAFT</Text>
                    <Text style={{ color: '#024a63', fontSize: 16, fontWeight: 'bold', letterSpacing: 4 }}>DELHI</Text>
                  </View>
                </View>
                <Text style={styles.loginTitle}>Seller Sign Up</Text>
                <Text style={styles.subtext}>Step 2 of 2</Text>
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
                
                <View style={[styles.inputGroup, { paddingHorizontal: 20 }]}>
                  <Text style={styles.label}>GENDER</Text>
                  <View style={styles.genderRow}>
                    {[
                      { label: 'Male', value: '0' },
                      { label: 'Female', value: '1' },
                      { label: 'Other', value: '2' },
                    ].map((g) => (
                      <TouchableOpacity
                        key={g.value}
                        style={[styles.genderButton, gender === g.value && styles.genderButtonSelected]}
                        onPress={() => { setGender(g.value); setTouched(true); }}
                      >
                        <Text style={[styles.genderText, gender === g.value && styles.genderTextSelected]}>
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
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
    </ImageBackground>
  );
};

export default SellerSignup;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 5,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'mbold',
    textAlign: 'center',
  },
  subtext: {
    color: '#ee6f69',
    fontSize: 13,
    fontFamily: 'mmedium',
    textAlign: 'center',
    marginTop: 5,
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
    color: '#000',
    fontSize: 10,
    fontFamily: 'mbold',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  inputIconField: {
    fontSize: 14,
    color: '#333',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 0,
  },
  genderButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  genderButtonSelected: {
    borderColor: '#ee6f69',
    backgroundColor: '#fff0ef',
  },
  genderText: {
    fontSize: 14,
    color: '#333',
  },
  genderTextSelected: {
    color: '#ee6f69',
    fontWeight: '700',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#024a63',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
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
