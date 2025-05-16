import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';
import ProfileHeader from './ProfileHeader';

const ProfileSetting = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);

  
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access gallery is required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true, 
      aspect: [1, 1],       
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = firstName && lastName && isValidEmail(email) && contact && gender;

  const formatDate = (date) => {
    if (!date) return 'Select Date';
    return `${date.getDate()}-${date.toLocaleString('default', {
      month: 'short'
    })}-${date.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <ProfileHeader />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Animatable.Text animation="fadeInDown" style={styles.sectionTitle}>
            Profile Information
          </Animatable.Text>
          <Animatable.View animation="fadeInDown" delay={100} style={styles.divider} />

          {/* Profile Image */}
          <Animatable.View animation="fadeInDown" delay={200} style={styles.profileImageContainer}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.placeholder]}>
                  <Feather name="camera" size={28} color="#999" />
                </View>
              )}
              <View style={styles.uploadIconContainer}>
                <Feather name="upload" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </Animatable.View>

          {/* First and Last Name */}
          <Animatable.View animation="fadeInUp" delay={300} style={styles.row}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>FIRST NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>LAST NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </Animatable.View>

          {/* Email Address */}
          <Animatable.View animation="fadeInUp" delay={400} style={styles.inputWrapperFull}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {email.length > 0 && !isValidEmail(email) && (
              <Text style={{ color: 'red', marginTop: 4 }}>Invalid email address</Text>
            )}
          </Animatable.View>

          {/* Contact Number */}
          <Animatable.View animation="fadeInUp" delay={500} style={styles.inputWrapperFullC}>
            <Text style={styles.label}>CONTACT NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact number"
              keyboardType="phone-pad"
              value={contact}
              maxLength={10}
              onChangeText={(text) => setContact(text.replace(/[^0-9]/g, ''))}
            />
          </Animatable.View>

          {/* Birthday and Gender */}
          <Animatable.View animation="fadeInUp" delay={600} style={styles.row}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>BIRTHDAY</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.input, {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }]}
              >
                <Text>{formatDate(birthday)}</Text>
                <Feather name="calendar" size={18} color="#555" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthday || new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date(Date.now() - 86400000)}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setBirthday(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>GENDER</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdown]}
                onPress={() => setGenderDropdownVisible(!genderDropdownVisible)}
              >
                <Text style={styles.dropdownText}>
                  {gender || 'Select Gender'}
                </Text>
                <Feather name="chevron-down" size={16} color="#555" />
              </TouchableOpacity>

              {genderDropdownVisible && (
                <View style={styles.dropdownList}>
                  {['Male', 'Female', 'Other'].map((option) => (
                    <Pressable
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGender(option);
                        setGenderDropdownVisible(false);
                      }}
                    >
                      <Text>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </Animatable.View>

          {/* Save Button */}
          <Animatable.View animation="zoomIn" delay={700}>
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: isFormValid ? '#004C5F' : '#999'
              }]}
              disabled={!isFormValid}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'mbold'
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
    marginTop: 20
  },
  inputWrapper: {
    flex: 1
  },
  inputWrapperFull: {
    marginTop: 5
  },
  inputWrapperFullC: {
    marginTop: 20
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
    fontWeight: '600',
    fontFamily: 'mbold',
    letterSpacing: 1
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    height: 60
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropdownText: {
    color: '#333'
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  button: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#004C5F',
  },
  placeholder: {
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#004C5F',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
