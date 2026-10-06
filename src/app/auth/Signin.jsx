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
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo1 from '../../../assets/images/logo1.svg';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';

const Signin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(username.trim());
  const isFormValid = isEmailValid && password.trim() !== '';
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}auth/login`,
        { email: username.trim(), password }
      );

      const { id, role, status, token, message, name } = response.data;

      if (!status) {
        setError(message || 'Invalid username or password');
        return;
      }

      const userData = {
        token,
        role,
        id,
        isSeller: role === 2,
        name: name || 'User',
        email: username,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setError('');

      if (userData.isSeller) {
        router.replace('/(sellerTab)/(sellerTabs)/Home');
      } else {
        router.replace('/(tabs)/Home');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const validateForm = () => {
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return false;
    }

    if (username.trim() === '' || password.trim() === '') {
      setError('All fields are required');
      return false;
    }

    return true;
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
                <Text style={styles.loginTitle}>Login</Text>
              </View>

              {/* Input Fields */}
              <View style={styles.middle}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>USERNAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#aaa"
                    value={username}
                    autoCapitalize="none"
                    onChangeText={(text) => {
                      setUsername(text);
                      if (error) setError('');
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, { flex: 1, borderWidth: 0, marginTop: 0 }]}
                      placeholder="Enter your password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (error) setError('');
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity onPress={() => router.push('/auth/ForgetPassword')} style={styles.forgotContainer}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <View style={styles.errorBox}>
                    <Image source={require('../../../assets/images/error.png')} style={styles.errorIcon} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, (!isFormValid || loading) ? styles.disabledButton : styles.activeButton]}
                  disabled={!isFormValid || loading}
                  onPress={handleLogin}
                >
                  <Text style={[styles.buttonText, (!isFormValid || loading) && styles.disabledButtonText]}>
                    {loading ? 'Logging in...' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.signupRow}>
                  <Text style={styles.footerText}>
                    Don't have a buyer account?
                  </Text>
                  <TouchableOpacity onPress={() => router.replace('/auth/Signup')}>
                    <Text style={styles.signup}> Sign Up</Text>
                  </TouchableOpacity>
                </View>

                {/* Seller Section */}
                <View style={styles.sellerSection}>
                  <Text style={styles.sellerTitle}>SELLING ON CRAFTDELHI?</Text>
                  <View style={styles.sellerButtonsRow}>
                    {/* <TouchableOpacity
                      style={styles.sellerLoginBtn}
                      onPress={() => router.push('/auth/sellerauth/Signin')}
                    >
                      <Text style={styles.sellerLoginText}>Seller Login</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                      style={styles.sellerSignupBtn}
                      onPress={() => router.replace('/auth/sellerauth/Signup')}
                    >
                      <Text style={styles.sellerSignupText}>Become a Seller</Text>
                    </TouchableOpacity>
                  </View>
                </View>

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

export default Signin;

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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingRight: 8,
    backgroundColor: '#fff',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
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
  footer: {
    alignItems: 'center',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#4b5563',
  },
  signup: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 13,
  },
  sellerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
  },
  sellerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sellerButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  sellerLoginBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  sellerLoginText: {
    color: '#0284c7',
    fontWeight: '600',
    fontSize: 13,
  },
  sellerSignupBtn: {
    flex: 1,
    backgroundColor: '#ee6f69',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  sellerSignupText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
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
});