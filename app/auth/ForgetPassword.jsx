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

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isFormValid = isEmailValid;

  const handleLogin = () => {
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (email !== 'buyer@gmail.com') {
      setError('There is no registered user with this email!');
      return;
    }

    setError('');
    router.push({ pathname: '/auth/Otp', params: { email } });
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
              style={[styles.button, !isFormValid && styles.disabledButton]}
              disabled={!isFormValid}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Continue</Text>
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
