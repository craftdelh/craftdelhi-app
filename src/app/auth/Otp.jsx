import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
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
import * as Animatable from 'react-native-animatable';
import OtpSentIcon from '../../../assets/images/i1.svg';
import { useLocalSearchParams } from 'expo-router';
import Logo1 from '../../../assets/images/logo1.svg';
import Box from '../../../assets/images/box.svg'
import axios from 'axios';
 

const Otp = () => {
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false); 
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { email, isSeller,purpose } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);


  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const handleLogin = async () => {
  if (!isOtpSent) {
    setIsOtpSent(true);
    return;
  }

  const enteredOtp = otp.join('');

  if (enteredOtp.length !== 6) {
    setError('Please enter the complete OTP');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // Prepare payload
    const payload = {
      email,
      otp: enteredOtp,
    };

    // Only include purpose if it exists
    if (purpose) {
      payload.purpose = purpose;
    }

    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_BASE_URL}auth/verify-otp`,
      payload
    );

    if (response.data.status) {
     const params = { email, isSeller };

if (purpose === 'reset') {
  params.otp = enteredOtp;
}

router.replace({
  pathname: '/auth/NewPassword',
  params,
});

    } else {
      setError(response.data.message || 'OTP verification failed');
    }
  } catch (err) {
    console.error('OTP verification error:', err);
    if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError('Something went wrong. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  const isOtpComplete = otp.every((digit) => digit !== '');


  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if there's text
    if (text && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // If backspace is pressed and the current field is empty, go back
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
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
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
              <View style={styles.header}>
                <Logo1 width={160} height={40} style={{ marginBottom: 16 }} />
                <Text style={styles.loginTitle}>
                  {isOtpSent ? 'Enter OTP' : 'One Time Passcode'}
                </Text>
              </View>

              {!isOtpSent ? (
                <View style={styles.otpMessageContainer}>
                  <OtpSentIcon width={40} height={40} style={styles.otpIcon} />
                  <Text style={styles.otpMessageText}>
                    We’ve sent a One Time Passcode to your email address
                  </Text>
                  <Text style={styles.emailText}>{email}</Text>
                </View>
              ) : (
                <View style={styles.otpMessageContainer}>
                  <Box width={40} height={40} style={styles.otpIcon} />
                  <View style={styles.otpBoxes}>
                    {otp.map((value, index) => (
                      <TextInput
                        key={index}
                        style={styles.otpBox}
                        maxLength={1}
                        keyboardType="numeric"
                        value={value}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        ref={inputRefs[index]}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                </View>
              )}

              {error ? (
                <Animatable.View animation="shake" style={styles.errorContainer}>
                  <View style={styles.errorBox}>
                    <Image source={require('../../../assets/images/error.png')} style={styles.errorIcon} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                </Animatable.View>
              ) : null}

              <View style={styles.buttonContainer}>
               <TouchableOpacity
                  style={[
                    styles.button,
                    (isOtpSent && (!isOtpComplete || loading)) ? styles.disabledButton : styles.activeButton
                  ]}
                  onPress={handleLogin}
                  disabled={isOtpSent && (!isOtpComplete || loading)}
                >
                  <Text style={[styles.buttonText, (isOtpSent && (!isOtpComplete || loading)) && styles.disabledButtonText]}>
                    {loading ? 'Verifying...' : isOtpSent ? 'Verify OTP' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Otp;

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
  otpMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  otpIcon: {
    marginBottom: 16,
  },
  otpMessageText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    fontWeight: '500',
    lineHeight: 20,
  },
  emailText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#024a63',
    lineHeight: 24,
    marginTop: 8,
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  otpBox: {
    width: 45,
    height: 50,  
    borderWidth: 1.5,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    borderColor: '#d1d5db',
    marginHorizontal: 4, 
    color: '#111827',
    backgroundColor: '#fff',
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
  buttonContainer: {
    marginBottom: 10,
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
});
