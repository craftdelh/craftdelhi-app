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
import Icon from 'react-native-vector-icons/Ionicons';
import Logo1 from '../../assets/images/logo1.svg';
import { useUser } from '../../context/UserContext';
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
      `${process.env.EXPO_PUBLIC_BASE_URL}/auth/login`,
      { email: username, password }
    );

    const { id, role, status, token, message } = response.data;

    if (!status) {
      setError(message || 'Invalid username or password');
      return;
    }

    const userData = {
      token,
      role,
      id,
      isSeller: role === 2,
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
    setError('Something went wrong. Please try again.');
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
              <Text style={styles.loginTitle}>LOGIN</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.middle}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
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
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    placeholder="Enter password"
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
                      size={22}
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
                  <Image source={require('../../assets/images/error.png')} style={styles.errorIcon} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
           <TouchableOpacity
  style={[styles.button, (!isFormValid || loading) && styles.disabledButton]}
  disabled={!isFormValid || loading}
  onPress={handleLogin}
>
  <Text style={styles.buttonText}>
    {loading ? 'Logging in...' : 'Continue'}
  </Text>
</TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>

            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center', gap:5}}>
            <Text style={styles.footerText}>
            Not Account yet?
            </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/Signup')}><Text style={styles.signup}>Sign Up</Text></TouchableOpacity>
            </View>

            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center', gap:5,marginTop:10}}>
            <Text style={styles.footerText}>
            Want to Become Seller?
            </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/sellerauth/Signup')}><Text style={styles.signup}>Register Here</Text></TouchableOpacity>
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

export default Signin;

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
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
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
    margin:'auto'
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
    lineHeight:20.40
  },
  
  
});