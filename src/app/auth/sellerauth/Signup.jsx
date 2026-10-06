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
  ScrollView,
  Platform,
  ImageBackground
} from 'react-native';
import { useUser } from '../../../../context/UserContext';
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
    <ImageBackground 
      source={require('../../../../assets/images/bg.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            
            {/* Promo Section */}
            <View style={styles.promoSection}>
              <Text style={styles.promoTitle}>Become A Craft Delhi Seller Today!</Text>
              <Text style={styles.promoSub}>
                Create a craft seller account now and reach millions of customers!
              </Text>
              <Image 
                source={require('../../../../assets/images/f1.png')} 
                style={styles.promoImage} 
                resizeMode="contain"
              />
            </View>

            <View style={{ flex: 1, backgroundColor: '#fff', margin: 15, borderRadius: 16, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
              {/* Header */}
              <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Image source={require('../../../../assets/images/icon1.png')} style={{ width: 45, height: 45, resizeMode: 'contain' }} />
                  <View style={{ width: 3, height: 45, backgroundColor: '#024a63', borderRadius: 2, marginHorizontal: 12 }} />
                  <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text style={{ color: '#ee6f69', fontSize: 26, fontWeight: 'bold' }}>CRAFT</Text>
                    <Text style={{ color: '#024a63', fontSize: 16, fontWeight: 'bold', letterSpacing: 4 }}>DELHI</Text>
                  </View>
                </View>
                <Text style={styles.loginTitle}>Sign Up As Delhi Craft Seller</Text>
                <Text style={styles.subtext}>Sign Up in 2 Steps</Text>
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
                    source={require('../../../../assets/images/error.png')}
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
            <Text style={[styles.buttonText, (!isEmailValid || loading) && { color: '#000' }]}>
              {loading ? 'Sending...' : 'Send OTP to your Email'}
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
  promoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  promoTitle: {
    fontSize: 26,
    fontFamily: 'mbold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  promoSub: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'mmedium',
    marginBottom: 15,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  promoImage: {
    width: 220,
    height: 220,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
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
  middle: {
    justifyContent: 'center',
    padding: 25,
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
