import { router, useLocalSearchParams } from 'expo-router';
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
  ImageBackground,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo1 from '../../../assets/images/logo1.svg';
import axios from 'axios';

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { email, isSeller, otp } = useLocalSearchParams();

  const isFormValid = newPassword.trim().length >= 6 && confirmPassword.trim().length >= 6;

  const handleContinue = async () => {
    if (newPassword.trim() === '' || confirmPassword.trim() === '') {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    if (otp) {
      try {
        const res = await axios.post(
          `${process.env.EXPO_PUBLIC_BASE_URL}auth/reset-password`,
          {
            email,
            otp,
            newPassword,
          }
        );

        if (res.data.status) {
          router.replace('/auth/Final');
        } else {
          setError(res.data.message || 'Reset failed');
        }
      } catch (err) {
        console.error('Reset password error:', err);
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(false);
    if (isSeller === 'true' || isSeller === true) {
      router.replace({
        pathname: '/auth/SellerSignup',
        params: { email, password: newPassword },
      });
    } else {
      router.replace('/auth/Final');
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
                <Text style={styles.loginTitle}>Create New Password</Text>
              </View>

              <View style={styles.middle}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
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
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
                  <View
                    style={[
                      styles.passwordWrapper,
                      error === 'Passwords do not match' && { borderColor: '#dc2626' },
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (error) setError('');
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {error ? (
                  <Animatable.View animation="shake" style={styles.errorContainer}>
                    <View style={styles.errorBox}>
                      <Image source={require('../../../assets/images/error.png')} style={styles.errorIcon} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  </Animatable.View>
                ) : null}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, (!isFormValid || loading) ? styles.disabledButton : styles.activeButton]}
                  disabled={!isFormValid || loading}
                  onPress={handleContinue}
                >
                  <Text style={[styles.buttonText, (!isFormValid || loading) && styles.disabledButtonText]}>
                    {loading ? 'Please wait...' : 'Continue'}
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

export default NewPassword;

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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 12,
    fontSize: 14,
    color: '#374151',
  },
  eyeIcon: {
    padding: 12,
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
