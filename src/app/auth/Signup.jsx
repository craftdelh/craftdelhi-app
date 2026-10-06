import { router } from 'expo-router';
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
  ImageBackground,
  Modal,
  FlatList,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Logo1 from '../../../assets/images/logo1.svg';
import axios from 'axios';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const GENDER_MAP = { 'Male': 0, 'Female': 1, 'Other': 2 };

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    emailRegex.test(email) &&
    gender &&
    dob.trim() &&
    phone.trim().length === 10;

  useEffect(() => {
    if (!touched) return;

    if (!firstName.trim()) setError('First name is required');
    else if (!lastName.trim()) setError('Last name is required');
    else if (!email.trim()) setError('Email is required');
    else if (!emailRegex.test(email)) setError('Invalid email address');
    else if (!gender) setError('Gender is required');
    else if (!dob.trim()) setError('Date of birth is required');
    else if (!phone.trim()) setError('Phone number is required');
    else if (phone.trim().length !== 10) setError('Phone number must be 10 digits');
    else setError('');
  }, [firstName, lastName, email, gender, dob, phone, touched]);

  const handleSignup = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setError('');

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        dob: dob,
        gender: GENDER_MAP[gender],
        role: 3, // 3 typically means normal buyer
      };

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}auth/register-details`,
        payload
      );

      if (res.data.status) {
        const otpRes = await axios.post(
          `${process.env.EXPO_PUBLIC_BASE_URL}auth/send-otp`,
          { email: email.trim() }
        );

        if (otpRes.data.status) {
          router.push({ pathname: '/auth/Otp', params: { email: email.trim() } });
        } else {
          setError(otpRes.data.message || 'Failed to send OTP. Try again.');
        }
      } else {
        setError(res.data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDob = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setDob(formattedDate);
    setTouched(true);
    setDatePickerVisibility(false);
  };

  const renderGenderModal = () => (
    <Modal visible={isGenderModalVisible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setGenderModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Gender</Text>
          {GENDER_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.modalItem}
              onPress={() => {
                setGender(item);
                setTouched(true);
                setGenderModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <ImageBackground
      source={require('../../../assets/images/img1.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
                <View style={styles.header}>
                  <Logo1 width={160} height={40} style={{ marginBottom: 16 }} />
                  <Text style={styles.loginTitle}>Sign Up</Text>
                </View>

                <View style={styles.middle}>
                  {/* ROW 1: First Name & Last Name */}
                  <View style={styles.row}>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.label}>FIRST NAME</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter First Name"
                        placeholderTextColor="#aaa"
                        value={firstName}
                        onChangeText={(text) => {
                          setFirstName(text);
                          setTouched(true);
                        }}
                      />
                    </View>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.label}>LAST NAME</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Last Name"
                        placeholderTextColor="#aaa"
                        value={lastName}
                        onChangeText={(text) => {
                          setLastName(text);
                          setTouched(true);
                        }}
                      />
                    </View>
                  </View>

                  {/* ROW 2: Email & Gender */}
                  <View style={styles.row}>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.label}>EMAIL ADDRESS</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Email Address"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          setTouched(true);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.label}>GENDER</Text>
                      <TouchableOpacity onPress={() => setGenderModalVisible(true)} style={styles.inputWithIcon}>
                        <Text style={[styles.inputIconField, !gender && { color: '#aaa' }]}>
                          {gender || 'Select Gender'}
                        </Text>
                        <Icon name="chevron-down-outline" size={20} color="#888" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ROW 3: DOB & Phone */}
                  <View style={styles.row}>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.label}>DATE OF BIRTH</Text>
                      <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.inputWithIcon}>
                        <Text style={[styles.inputIconField, !dob && { color: '#aaa' }]}>
                          {dob ? dob.split('-').reverse().join('-') : 'dd-mm-yyyy'}
                        </Text>
                        <Icon name="calendar-outline" size={20} color="#888" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.label}>PHONE NUMBER</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Phone Number"
                        placeholderTextColor="#aaa"
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
                  <Animatable.View animation="shake" style={styles.errorContainer}>
                    <View style={styles.errorBox}>
                      <Image source={require('../../../assets/images/error.png')} style={styles.errorIcon} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  </Animatable.View>
                ) : null}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, (!isFormValid || loading) ? styles.disabledButton : styles.activeButton]}
                    disabled={!isFormValid || loading}
                    onPress={handleSignup}
                  >
                    <Text style={[styles.buttonText, (!isFormValid || loading) && styles.disabledButtonText]}>
                      {loading ? 'Please wait...' : 'continue'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>Already Have An Account ?</Text>
                    <TouchableOpacity onPress={() => router.replace('/auth/Signin')}>
                      <Text style={styles.signupText}> Login</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.terms}>By continuing, you agree to our</Text>
                  <View style={styles.links}>
                    <Text style={styles.link}>Terms of Service</Text>
                    <Text style={styles.link}>Privacy Policy</Text>
                    <Text style={styles.link}>Content Policies</Text>
                  </View>
                </View>

              </Animatable.View>
            </ScrollView>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDob}
              onCancel={() => setDatePickerVisibility(false)}
            />
            {renderGenderModal()}

          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Signup;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  middle: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  inputGroupHalf: {
    flex: 1,
  },
  label: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#374151',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  inputIconField: {
    fontSize: 14,
    color: '#374151',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#024a63',
  },
  disabledButton: {
    backgroundColor: '#e5e7eb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  errorIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#4b5563',
  },
  signupText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 12,
  },
  terms: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 12,
  },
  links: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  link: {
    fontSize: 11,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
});
