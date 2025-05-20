import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const OtpScreen = () => {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = text;
      setOtp(updatedOtp);

      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === '123456') {
      router.replace('/SellerScreens/NewPassword');
    } else {
      Toast.show({
  type: 'error',
  text1: 'Invalid OTP',
  text2: 'Please try again.',
});
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.sideIcon}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.sideIcon} />
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageHeading}>Password sent</Text>
          <View style={styles.divider} />
          <Text style={styles.subHeading}>
            Enter the 6 digit code sent to
          </Text>
          <Text style={styles.emailText}>{email}</Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
              />
            ))}
          </View>
        </ScrollView>

        {/* Bottom Fixed Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.continueButton, !isOtpComplete && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!isOtpComplete}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',
  },
  sideIcon: {
    width: 24,
  },
  pageHeading: {
    fontFamily: 'mbold',
    fontSize: 17,
    color: '#000',
  },
  divider: {
    height: 1,
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginVertical: 20,
  },
  subHeading: {
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'mmedium',
    color: '#024A63',
  },
  emailText: {
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'mmedium',
    color: '#024A63',
    marginBottom: 24,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'mbold',
    color: '#000',
  },
  bottomButtons: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  continueButton: {
    backgroundColor: '#024A63',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#D1D1D1',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelText: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#000000',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});
