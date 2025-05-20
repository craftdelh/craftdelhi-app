import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Check from '../../assets/images/check.svg'

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);


  const isFormValid = password !== '' && confirmPassword !== '';

  const handleContinue = () => {
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Password changed successfully',
    });
    setShowModal(true);
  };

 return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: 'white' }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
  >
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
    >
      <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
        <View>
         

          <Text style={styles.pageHeading}>New Password</Text>
          <View style={styles.divider} />

          {/* New Password */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>NEW PASSWORD</Text>
            <View style={styles.inputBox}>
              <TextInput
                placeholder="Enter new password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.textInput}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={styles.inputBox}>
              <TextInput
                placeholder="Confirm password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.textInput}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Feather
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.disabledButton]}
          disabled={!isFormValid}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

    {showModal && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
    
      <View style={styles.iconContainer}>
        <Check />
      </View>

     
      <Text style={styles.modalTitle}>Congratulations!</Text>

      
      <View style={styles.modalDivider} />

     
      <Text style={styles.modalMessage}>
        Your password has been reset. Thanks.
      </Text>

      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => router.replace('/(sellerTab)/(sellerTabs)/Setting')}
      >
        <Text style={styles.modalButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

  </KeyboardAvoidingView>
);

};

export default NewPassword;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding:20
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
  fieldWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Montserrat',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#000',
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputBox: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat',
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#024A63',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontFamily: 'mbold',
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
  zIndex: 999,
},
modalBox: {
  width: '100%',
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  alignItems: 'center',
},
iconContainer: {
  width: 40,
  height: 40,
  marginBottom: 16,
  position: 'relative',
},
iconCircle: {
  width: 33,
  height: 33,
  borderRadius: 16.5,
  borderWidth: 3.33,
  borderColor: '#69D297',
  opacity: 0.4,
  position: 'absolute',
  top: 3.33,
  left: 3.33,
},
iconTick: {
  width: 15,
  height: 10,
  borderLeftWidth: 3.33,
  borderBottomWidth: 3.33,
  borderColor: '#69D297',
  transform: [{ rotate: '-45deg' }],
  position: 'absolute',
  left: 12.5,
  top: 15,
},
modalTitle: {
  fontSize: 24,
  fontWeight: '700',
  fontFamily: 'Montserrat',
  textAlign: 'center',
  marginBottom: 12,
  color: '#000',
},
modalDivider: {
  width: '100%',
  height: 1,
  backgroundColor: '#D9D9D9',
  marginVertical: 12,
},
modalMessage: {
  fontSize: 14,
  fontWeight: '500',
  fontFamily: 'Montserrat',
  textAlign: 'center',
  color: '#1D1D1D',
  lineHeight: 20,
  marginBottom: 20,
},
modalButton: {
  backgroundColor: '#024A63',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 6,
},
modalButtonText: {
  color: 'white',
  fontFamily: 'mbold',
  fontSize: 16,
},

});
