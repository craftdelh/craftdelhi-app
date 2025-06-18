import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo1 from '../../assets/images/logo1.svg';
import axios from 'axios';

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { email, isSeller,otp } = useLocalSearchParams();

  const isFormValid =
    newPassword.trim().length >= 6 && confirmPassword.trim().length >= 6;

const handleContinue = async () => {
  if (newPassword.trim() === '' || confirmPassword.trim() === '') {
    setError('All fields are required');
    return;
  }

  if (newPassword.length < 6) {
    setError('Password must be at least 6 characters');
    return;
  }

  if (newPassword !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setError('');

  // ✅ If OTP is present, call reset-password API
  if (otp) {
    try {
      const res = await axios.post('https://backend.craftdelhi.com/backend/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      if (res.data.status) {
        // Navigate to Final screen after successful reset
        router.replace('/auth/Final');
      } else {
        setError(res.data.message || 'Reset failed');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Something went wrong. Please try again later.');
    }
    return;
  }

  // 🚫 If no OTP, continue normal flow
  if (isSeller === 'true' || isSeller === true) {
    router.replace({
      pathname: '/auth/SellerSignup',
      params: { email, password: newPassword },
    });
  } else {
    router.replace('/auth/Final');
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <Logo1 width={180} height={180} />
              <Text style={styles.loginTitle}>Create New Password</Text>
            </View>

            <View style={styles.middle}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    placeholder="Enter new password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (error) setError('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View
  style={[
    styles.passwordWrapper,
    error === 'Passwords do not match' && { borderColor: 'red' },
  ]}
>
  <TextInput
    style={[
      styles.input,
      { flex: 1, borderWidth: 0 },
    ]}
    placeholder="Re-enter password"
    placeholderTextColor="#aaa"
    secureTextEntry={!showConfirmPassword}
    value={confirmPassword}
    onChangeText={(text) => {
      setConfirmPassword(text);
      if (error) setError('');
    }}
  />
  <TouchableOpacity
    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
    style={styles.eyeIcon}
  >
    <Icon
      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
      size={22}
      color="#888"
    />
  </TouchableOpacity>
</View>

              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <View style={styles.errorBox}>
                    <Image source={require('../../assets/images/error.png')} style={styles.errorIcon} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, !isFormValid && styles.disabledButton]}
              disabled={!isFormValid}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  middle: {
    justifyContent: 'center',
    padding: 25,
    marginTop: 20,
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    paddingRight: 12,
    marginTop: 5,
    backgroundColor: 'white',
  },
  eyeIcon: {
    padding: 10,
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
    alignItems: 'flex-start',
    marginTop: 5,
    backgroundColor:'#F8F9FD',
    borderRadius:10
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  errorIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  errorText: {
    color: '#d10000',
    fontSize: 14,
    fontFamily: 'mmedium',
    lineHeight: 20.4,
  },
});
