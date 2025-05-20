import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);

  const handleContinue = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email) || email.toLowerCase() !== 'rajesh@gmail.com') {
      setShowError(true);
    } else {
      setShowError(false);
      router.push({
  pathname: '/SellerScreens/OtpScreen',
  params: { email: email }
});
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.sideIcon}>
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.sideIcon} />
          </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    
          <Text style={styles.pageHeading}>Password Change Request</Text>
          <View style={styles.divider} />

          {/* Error Message */}
          <Text style={styles.errorHeading}>Please enter your Email Address !</Text>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (showError) setShowError(false);
              }}
              style={[styles.input, showError && styles.errorInput]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {showError && (
              <Text style={styles.errorText}>
                Please enter a valid email address. Your email is not matched.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, { opacity: email ? 1 : 0.4 }]}
            onPress={handleContinue}
            disabled={!email}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 20,
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
  errorHeading: {
    fontSize: 16,
    fontFamily: 'mbold',
    color: '#EE6F69',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: 'mbold',
    color: '#000',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    fontFamily: 'mbold',
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: '#FF0000',
  },
  errorText: {
    marginTop: 6,
    color: '#FF0000',
    fontSize: 12,
    fontFamily: 'mbold',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#024A63',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#D1D1D1',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#fff',
  },
});
