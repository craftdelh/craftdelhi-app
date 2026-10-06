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
  ImageBackground,
} from 'react-native';
import Logo1 from '../../../assets/images/logo1.svg';
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

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}auth/forgot-password`,
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
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/img1.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <Logo1 width={160} height={40} style={{ marginBottom: 16 }} />
                <Text style={styles.loginTitle}>Forgot Password</Text>
              </View>

              {/* Input Fields */}
              <View style={styles.middle}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Email Address"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Error message */}
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

              {/* Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    (!isFormValid || loading) ? styles.disabledButton : styles.activeButton,
                  ]}
                  disabled={!isFormValid || loading}
                  onPress={handleLogin}
                >
                  <Text style={[styles.buttonText, (!isFormValid || loading) && styles.disabledButtonText]}>
                    {loading ? 'Please wait...' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.terms}>By continuing, you agree to our</Text>
                <View style={styles.links}>
                  <Text style={styles.link}>Terms of Service</Text>
                  <Text style={styles.link}>Privacy Policy</Text>
                  <Text style={styles.link}>Content Policies</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ForgetPassword;

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
    maxWidth: 500,
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
    justifyContent: 'center',
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 16,
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
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: '#fff',
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
    marginTop: 10,
  },
  terms: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 10,
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
});
