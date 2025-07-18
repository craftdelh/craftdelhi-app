import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../../context/UserContext';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'
import Toast from 'react-native-toast-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const user = useUser();

  const [isEditing, setIsEditing] = useState(false);

  // Initially profile image URL
  const [profileImage, setProfileImage] = useState(
    'https://media.istockphoto.com/id/1289220545/photo/beautiful-woman-smiling-with-crossed-arms.jpg?s=612x612&w=0&k=20&c=qmOTkGstKj1qN0zPVWj-n28oRA6_BHQN8uVLIXg0TF8='
  );

  const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [city, setCity] = useState('');
const [dob, setDob] = useState(new Date(1998, 0, 1));
const [homeAddress, setHomeAddress] = useState('');
const [officeAddress, setOfficeAddress] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Temporary values while editing
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempCity, setTempCity] = useState(city);
  const [tempDob, setTempDob] = useState(dob);
  const [tempOfficeAddress, setTempOfficeAddress] = useState(officeAddress);
  const [tempHomeAddress, setTempHomeAddress] = useState(homeAddress);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDob;
    setShowDatePicker(false);
    setTempDob(currentDate);
  };

  const handleEdit = () => {
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setTempPhone(phone);
    setTempCity(city);
    setTempDob(dob);
    setTempOfficeAddress(officeAddress);
    setTempHomeAddress(homeAddress);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  try {
    const userData = await AsyncStorage.getItem('user');
    const parsed = JSON.parse(userData);
    const token = parsed?.token;

    const formData = new FormData();
    formData.append('phone_number', tempPhone);
    formData.append('date_of_birth', tempDob.toISOString().split('T')[0]); // 'YYYY-MM-DD'
    formData.append('city', tempCity);
    formData.append('home_address', tempHomeAddress);
    formData.append('office_address', tempOfficeAddress);

    if (profileImage && profileImage.startsWith('file://')) {
      formData.append('profile_image', {
        uri: profileImage,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
    }

    const response = await axios.put(
      'https://backend.craftdelhi.com/backend/api/profile/edit',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${token}`,
        },
      }
    );

    if (response.data.status) {
      const updated = response.data.updatedProfile;
      setPhone(updated.phone_number);
      setCity(updated.city);
      setDob(new Date(updated.date_of_birth));
      setHomeAddress(updated.home_address);
      setOfficeAddress(updated.office_address);
      if (updated.profile_image) setProfileImage(updated.profile_image);
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully',
        position: 'bottom',
      });
    } else {
      Toast.show({ type: 'error', text1: response.data.message });
    }
  } catch (error) {
    console.log('Profile update error:', error);
    Toast.show({ type: 'error', text1: 'Failed to update profile' });
  }
};


  // Pick image from gallery and update state
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access gallery is required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // For latest expo-image-picker, result.assets is an array
      setProfileImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
  const fetchProfile = async () => {
    try {
     const userData = await AsyncStorage.getItem('user');
      const parsed = JSON.parse(userData);
      const token = parsed?.token;
      const res = await axios.get(
        'https://backend.craftdelhi.com/backend/api/profile/getdetails',
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

     if (res.data.status) {
  const p = res.data.profile;

  setFirstName(p.first_name || '');
  setLastName(p.last_name || '');
  setEmail(p.email || '');
  setPhone(p.phone_number || '');
  setCity(p.city || '');
  setDob(new Date(p.date_of_birth));
  setHomeAddress(p.home_address || '');
  setOfficeAddress(p.office_address || '');
  setProfileImage(p.profile_image || '');
}
 else {
        Toast.show({ type: 'error', text1: res.data.message });
      }
    } catch (err) {
      console.log('Profile fetch error:', err);
      Toast.show({ type: 'error', text1: 'Failed to load profile' });
    }
  };

  fetchProfile();
}, []);

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.sideIcon}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>

        <View style={styles.sideIcon} />
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.headerText}>Basic Information :</Text>
            {/* <TouchableOpacity onPress={()=>router.push('/SellerScreens/ChangePassword')}>
              <Text style={styles.changePassword}>Change Password</Text>
            </TouchableOpacity> */}
          </View>
          <View style={styles.divider} />
        </View>

        {/* User Info */}
        <View style={styles.row}>
          <View style={styles.profileImageWrapper}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
           {
            isEditing &&
             <TouchableOpacity style={styles.editIconWrapper} onPress={pickImage}>
              <MaterialIcons name="edit" size={22} color="#fff" />
            </TouchableOpacity>
           }
          </View>

          <View style={styles.userDetails}>
           <Text style={styles.name}>{firstName + ' ' + lastName || "NO Name"}</Text>
          
            <Text style={styles.email}>{email || 'your.email@example.com'}</Text>
          </View>
        </View>

        {/* Input Fields */}
        <InputField label="Phone Number" value={isEditing ? tempPhone : phone} onChangeText={setTempPhone} editable={isEditing} />
        <InputField label="City"  value={isEditing?tempCity:city} onChangeText={setTempCity} editable={isEditing} />

        {/* DOB */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity onPress={() => isEditing && setShowDatePicker(true)} style={styles.inputContainer}>
            <Text style={styles.placeholder}>  {(isEditing ? tempDob : dob).toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={tempDob}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>Office & Home Address :</Text>
          <View style={styles.divider} />
        </View>

        <TextAreaField
          label="Office Address"
          value={isEditing ? tempOfficeAddress : officeAddress}
          onChangeText={setTempOfficeAddress}
          editable={isEditing}
        />
        <TextAreaField
          label="Home Address"
         value={isEditing ? tempHomeAddress : homeAddress}
          onChangeText={setTempHomeAddress}
          editable={isEditing}
        />

        <View style={styles.bottomButtons}>
          {isEditing ? (
            <>
              <TouchableOpacity style={[styles.button, styles.save, styles.fullWidth]} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel} style={[styles.button, styles.cancel, styles.fullWidth]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleEdit} style={[styles.button, styles.edit, styles.fullWidth]}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const InputField = ({ label, value, onChangeText, editable }) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.inputContainer}
      value={value}
      onChangeText={(text) => {
        if (label === 'Phone Number') {
          const filtered = text.replace(/[^0-9]/g, '').slice(0, 10);
          onChangeText(filtered);
        } else {
          onChangeText(text);
        }
      }}
      editable={editable}
      placeholder="124567890"
      placeholderTextColor="#E0E4F4"
      keyboardType={label === 'Phone Number' ? 'number-pad' : 'default'}
    />
  </View>
);

const TextAreaField = ({ label, value, onChangeText, editable }) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.textArea, { minHeight: 120 }]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      multiline
      numberOfLines={6}
      placeholder="Tower A, InfoTech Park"
      placeholderTextColor="#E0E4F4"
    />
    <Text style={styles.charCounter}>{value.length}/300</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, gap: 14 },
  section: { gap: 12, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 20 },
  headerText: { fontSize: 16, fontWeight: '700', fontFamily: 'Montserrat', color: 'black' },
  changePassword: { fontSize: 14, fontWeight: '500', fontFamily: 'mbold', color: '#2E54D9' },
  divider: { height: 2, backgroundColor: '#D9D9D9', width: '100%' },
  profileImage: { width: 100, height: 100, borderRadius: 9999 },
  userDetails: { flex: 1, gap: 8 },
  name: { fontSize: 16, fontWeight: '700', fontFamily: 'Montserrat', color: 'black' },
  email: { fontSize: 14, fontWeight: '500', fontFamily: 'Montserrat', color: '#36234E' },
  formGroup: { marginBottom: 16 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  inputContainer: {
    height: 56,
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: '#E0E4F4',
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  placeholder: { color: '#000', fontSize: 12, fontFamily: 'Montserrat' },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    textAlignVertical: 'top',
  },
  charCounter: {
    textAlign: 'right',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: '#E0E4F4',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  bottomButtons: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E0E4F4',
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  fullWidth: {
    width: '100%',
  },
  edit: { backgroundColor: '#024A63' },
  save: { backgroundColor: '#024A63' },
  cancel: { backgroundColor: '#BBBBBB' },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
   headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal:20,
    paddingTop:20
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',
  },
  sideIcon: {
    width: 24,
  },profileImageWrapper: {
  position: 'relative',
  width: 100,
  height: 100,
},
editIconWrapper: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '#024A63',
  borderRadius: 20,
  padding: 5,
  borderWidth: 2,
  borderColor: 'white',
},

});
