import React, { useState } from 'react';
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

export default function ProfileScreen() {
  const user = useUser();

  const [isEditing, setIsEditing] = useState(false);

  // Initially profile image URL
  const [profileImage, setProfileImage] = useState(
    'https://media.istockphoto.com/id/1289220545/photo/beautiful-woman-smiling-with-crossed-arms.jpg?s=612x612&w=0&k=20&c=qmOTkGstKj1qN0zPVWj-n28oRA6_BHQN8uVLIXg0TF8='
  );

  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState(new Date(1998, 0, 1));
  const [officeAddress, setOfficeAddress] = useState('');
  const [homeAddress, setHomeAddress] = useState('');

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

  const handleSave = () => {
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setPhone(tempPhone);
    setCity(tempCity);
    setDob(tempDob);
    setOfficeAddress(tempOfficeAddress);
    setHomeAddress(tempHomeAddress);
    setIsEditing(false);
     Toast.show({
              type: 'success',
              text1: 'Information Saved Successfully',
              position: 'bottom',
            })
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
            <TouchableOpacity onPress={()=>router.push('/SellerScreens/ChangePassword')}>
              <Text style={styles.changePassword}>Change Password</Text>
            </TouchableOpacity>
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
            <Text style={styles.name}>{user?.user?.name || 'Your Name'}</Text>
            <Text style={styles.name}>aa***************</Text>
            <Text style={styles.email}>{user?.user?.email || 'your.email@example.com'}</Text>
          </View>
        </View>

        {/* Input Fields */}
        <InputField label="Phone Number" value={tempPhone} onChangeText={setTempPhone} editable={isEditing} />
        <InputField label="City" value={tempCity} onChangeText={setTempCity} editable={isEditing} />

        {/* DOB */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity onPress={() => isEditing && setShowDatePicker(true)} style={styles.inputContainer}>
            <Text style={styles.placeholder}>{tempDob.toDateString()}</Text>
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
          value={tempOfficeAddress}
          onChangeText={setTempOfficeAddress}
          editable={isEditing}
        />
        <TextAreaField
          label="Home Address"
          value={tempHomeAddress}
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
