import { router } from 'expo-router';
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
  Platform,
  ScrollView,
} from 'react-native';
import Logo1 from '../../assets/images/logo1.svg';
import axios from 'axios';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isFormValid = isEmailValid;

  const handleLogin = async () => {
  if (!emailRegex.test(email.trim())) {
    setError('Please enter a valid email address');
    return;
  }

  setLoading(true); // Start loading

  try {
    const response = await axios.post(
  `${process.env.EXPO_PUBLIC_BASE_URL}/auth/forgot-password`,
  {
    email: email.trim(),
    purpose: 'reset',
  }
);

    const { status, message } = response.data;

    if (status) {
      setError('');
     router.push({ pathname: '/auth/Otp', params: { email, purpose: 'reset' } });
    } else {
      setError(message || 'Something went wrong');
    }
  } catch (err) {
    console.error('Forgot Password Error:', err);
    if (err.response && err.response.data?.message) {
      setError(err.response.data.message);
    } else {
      setError('Something went wrong. Please try again later.');
    }
  } finally {
    setLoading(false); // Stop loading
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
                            <Logo1 width={180} height={180} />
              <Text style={styles.loginTitle}>Forgot Password</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.middle}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  placeholderTextColor="#aaa"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Error message */}
            {error ? (
              <View style={styles.errorContainer}>
                <View style={styles.errorBox}>
                  <Image
                    source={require('../../assets/images/error.png')}
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Button */}
          <View style={styles.buttonContainer}>
           <TouchableOpacity
                style={[
                  styles.button,
                  (!isFormValid || loading) && styles.disabledButton,
                ]}
                disabled={!isFormValid || loading}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Please wait...' : 'Continue'}
                </Text>
              </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgetPassword;

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
  middle: {
    justifyContent: 'center',
    padding: 25,
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
    alignItems: 'center',
    justifyContent: 'center',
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
