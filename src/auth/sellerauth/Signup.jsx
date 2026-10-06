import { router } from 'expo-router';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import Logo1 from '../../../assets/images/logo1.svg';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const isSeller = true;



  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());

  const handleSendOtp = async () => {
  if (!isEmailValid) {
    setError('Please enter a valid email address');
    return;
  }

    setLoading(true);

  try {
    const response = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}auth/send-otp`, { email });

    if (response.data.status) {
      router.push({ pathname: '/auth/Otp', params: { email, isSeller } });
    } else {
      setError(response.data.message || 'Failed to send OTP');
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    setError('Something went wrong. Please try again.');
  }
  finally {
    setLoading(false); 
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
            {/* Header */}
            <View style={styles.header}>
              <Logo1 width={180} height={180} />
              <Text style={styles.loginTitle}>Sign Up as Delhi Craft Seller</Text>
            </View>

            {/* Email Input */}
            <View style={styles.middle}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  placeholderTextColor="#aaa"
                  value={email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <View style={styles.errorBox}>
                  <Image
                    source={require('../../../assets/images/error.png')}
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Send OTP Button */}
          <View style={styles.buttonContainer}>
           <TouchableOpacity
            style={[styles.button, (!isEmailValid || loading) && styles.disabledButton]}
            disabled={!isEmailValid || loading}
            onPress={handleSendOtp}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send OTP to your Email Address'}
            </Text>
          </TouchableOpacity>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Text style={styles.footerText}>Already a Seller?</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/Signin')}>
                <Text style={styles.signup}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                marginTop: 10,
              }}
            >
              <Text style={styles.footerText}>Sign in as User?</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/Signin')}>
                <Text style={styles.signup}>Click Here</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.terms}>By continuing, you agree to our</Text>
            <View style={styles.links}>
              <Text style={styles.link}>Terms of Service</Text>
              <Text style={styles.link}>Privacy Policy</Text>
              <Text style={styles.link}>Content Policies</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

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
    textAlign: 'center',
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
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
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
