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
} from 'react-native';
import OtpSentIcon from '../../assets/images/i1.svg';
import { useLocalSearchParams } from 'expo-router';
import Logo1 from '../../assets/images/logo1.svg';
import Box from '../../assets/images/box.svg'
const Otp = () => {
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false); 
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { email } = useLocalSearchParams();


  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const handleLogin = () => {
    if (!isOtpSent) {
      setIsOtpSent(true); 
    } else {
      if (otp.join('') === '300820') {
        setError(''); 
      router.replace('/auth/NewPassword')
      } else {
        setError('Incorrect OTP'); 
      }
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');


 const handleOtpChange = (text, index) => {
  const newOtp = [...otp];
  newOtp[index] = text;
  setOtp(newOtp);

  if (text && index < 5) {
    inputRefs[index + 1].current.focus();
  } 

  else if (!text && index > 0) {
    inputRefs[index - 1].current.focus();
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
                      ref={inputRefs[index]} 
                    />
                  ))}
                </View>
              </View>
            )}

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
  style={[
    styles.button,
    isOtpSent && !isOtpComplete && { backgroundColor: '#ccc' } 
  ]}
  onPress={handleLogin}
  disabled={isOtpSent && !isOtpComplete} 
>
  <Text style={styles.buttonText}>
    {isOtpSent ? 'Verify OTP' : 'Continue'}
  </Text>
</TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Otp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'mbold',
    marginTop: 10,
  },
  otpMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    margin: 20,
    backgroundColor: '#F8F9FD',
  },
  otpIcon: {
    marginBottom: 20,
  },
  otpMessageText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  emailText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'msemibold',
    color: '#024A63',
    lineHeight: 24,
    marginTop: 20,
  },
  otpInputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',  // Make it stretch across the screen
    marginTop: 20,
  },
  otpBox: {
    width: 50,
    height: 55,  
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    borderColor: '#ccc',
    marginHorizontal: 5, 
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
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
