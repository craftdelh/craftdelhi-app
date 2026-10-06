import { router } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ImageBackground,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Logo1 from '../../../assets/images/logo1.svg';
import Box from '../../../assets/images/check.svg'

const Final = () => {
  const onPress = () => {
    router.replace('/auth/Signin');
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
            <Animatable.View animation="zoomIn" duration={800} style={styles.card}>
              <View style={styles.header}>
                <Logo1 width={160} height={40} style={{ marginBottom: 16 }} />
                <Text style={styles.loginTitle}>Congratulations!</Text>
              </View>

              <View style={styles.otpMessageContainer}>
                <Box width={48} height={48} style={styles.otpIcon} />
                <Text style={styles.otpMessageText}>
                  Your password has been successfully reset.
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onPress}>
                  <Text style={styles.buttonText}>Continue to Login</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Final;

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
    marginBottom: 30,
    paddingVertical: 20,
  },
  otpIcon: {
    marginBottom: 16,
  },
  otpMessageText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#024a63',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
