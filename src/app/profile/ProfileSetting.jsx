import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather, FiUser, FiPhone, FiMail, FiCalendar } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { router, useFocusEffect } from 'expo-router';
import ProfileHeader from './ProfileHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const mapGenderFromApi = (g) => {
  if (g === 0 || g === "0") return "Male";
  if (g === 1 || g === "1") return "Female";
  return "Other";
};

const mapGenderToApi = (g) => {
  if (g === "Male") return 0;
  if (g === "Female") return 1;
  return 2;
};

const ProfileSetting = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile View Data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    gender: '',
    dob: '',
    profileImage: null,
  });

  // Form State
  const [profileImage, setProfileImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [gender, setGender] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.token) return;

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}profile/getUserdetails`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const parseImage = (image) => {
        if (typeof image !== "string") return image;
        const value = image.trim();
        if (!value || value === "[object Object]") return null;
        if ((value.startsWith("{") && value.endsWith("}")) ||
            (value.startsWith("[") && value.endsWith("]"))) {
          try { return JSON.parse(value); } catch { return value; }
        }
        return value;
      };

      const extractImageUrl = (image) => {
        const parsed = parseImage(image);
        if (typeof parsed === "string") return parsed;
        if (Array.isArray(parsed)) return extractImageUrl(parsed[0]);
        if (!parsed || typeof parsed !== "object") return null;
        return extractImageUrl(parsed.thumbnail || parsed.full || parsed.icon || parsed.url || parsed.src || parsed.original_url || parsed.image_url);
      };

      const sanitizeUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `https://craftdelhi.com${url}`;
        return `https://craftdelhi.com/${url}`;
      };

      const p = res?.data?.profile;
      if (p) {
        let imageUrl = sanitizeUrl(extractImageUrl(p.profile_image));

        const dateObj = p.date_of_birth ? new Date(p.date_of_birth) : null;

        const data = {
          firstName: p.first_name || '',
          lastName: p.last_name || '',
          email: p.email || '',
          contact: p.phone_number || '',
          gender: mapGenderFromApi(p.gender),
          dob: p.date_of_birth ? p.date_of_birth.split('T')[0] : '',
          profileImage: imageUrl,
        };

        setProfileData(data);

        // Prep form state
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setContact(data.contact);
        setGender(data.gender);
        setBirthday(dateObj);
        setProfileImage(data.profileImage);
        setImageChanged(false);
      }
    } catch (e) {
      console.log('Fetch Profile Error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access gallery is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setImageChanged(true);
    }
  };

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const isFormValid = firstName && lastName && isValidEmail(email) && contact && contact.length === 10 && gender;

  const formatDate = (date) => {
    if (!date) return 'Select Date';
    return `${date.getDate()}-${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
  };

  const handleSave = async () => {
    if (!isFormValid) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all fields correctly' });
      return;
    }

    try {
      setSaving(true);
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.token) return;

      const fd = new FormData();
      fd.append("first_name", firstName.trim());
      fd.append("last_name", lastName.trim());
      fd.append("email", email.trim());
      fd.append("phone_number", contact.trim());
      fd.append("gender", mapGenderToApi(gender));
      
      if (birthday) {
        // format to YYYY-MM-DD
        const yyyy = birthday.getFullYear();
        const mm = String(birthday.getMonth() + 1).padStart(2, '0');
        const dd = String(birthday.getDate()).padStart(2, '0');
        fd.append("date_of_birth", `${yyyy}-${mm}-${dd}`);
      }

      if (imageChanged && profileImage) {
        const filename = profileImage.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        fd.append("profile_image", { uri: profileImage, name: filename, type });
      }

      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}profile/edituserprofile`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated successfully' });
      await fetchProfile();
      setIsEditing(false);

    } catch (err) {
      console.log('Update Error:', err);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const renderInitialsAvatar = (name) => {
    const initials = name.trim().split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2) || 'CD';
    return (
      <View style={styles.initialsAvatar}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    );
  };

  const renderViewMode = () => (
    <ScrollView contentContainerStyle={styles.viewContent} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="user" size={20} color="#fff" />
          <Text style={styles.bannerText}>Profile</Text>
        </View>
        <TouchableOpacity style={styles.editBadgeBtn} onPress={() => setIsEditing(true)}>
          <Text style={styles.editBadgeText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Card */}
      <View style={styles.avatarCard}>
        {profileData.profileImage ? (
          <Image source={{ uri: profileData.profileImage }} style={styles.viewAvatar} />
        ) : (
          renderInitialsAvatar(`${profileData.firstName} ${profileData.lastName}`)
        )}
        <View style={styles.avatarInfo}>
          <Text style={styles.avatarName}>{profileData.firstName} {profileData.lastName}</Text>
          <Text style={styles.avatarEmail}>{profileData.email}</Text>
        </View>
      </View>

      {/* Details List */}
      <View style={styles.detailsList}>
        {[
          { label: "Full Name", value: `${profileData.firstName} ${profileData.lastName}`, icon: "user" },
          { label: "Mobile Number", value: profileData.contact, icon: "phone" },
          { label: "Email Address", value: profileData.email, icon: "mail" },
          { label: "Gender", value: profileData.gender, icon: "user" },
          { label: "Date Of Birth", value: profileData.dob || 'Not set', icon: "calendar" },
        ].map((item, index) => (
          <Animatable.View 
            animation="fadeInUp" 
            delay={index * 50} 
            key={index} 
            style={styles.detailCard}
          >
            <View style={styles.detailIconWrapper}>
              <Feather name={item.icon} size={20} color="#024a63" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          </Animatable.View>
        ))}
      </View>
    </ScrollView>
  );

  const renderEditMode = () => (
    <ScrollView contentContainerStyle={styles.editContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.editModeTitle}>Edit Profile Information</Text>
      <View style={styles.divider} />

      {/* Profile Image Editor */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.editAvatarImage} />
          ) : (
            renderInitialsAvatar(`${firstName} ${lastName}`)
          )}
          <View style={styles.uploadIconContainer}>
            <Feather name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>FIRST NAME</Text>
          <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>LAST NAME</Text>
          <TextInput style={styles.input} placeholder="Last name" value={lastName} onChangeText={setLastName} />
        </View>
      </View>

      <View style={styles.inputWrapperFull}>
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
          <Text style={styles.errorText}>Invalid email address</Text>
        )}
      </View>

      <View style={styles.inputWrapperFull}>
        <Text style={styles.label}>CONTACT NUMBER</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter 10-digit number"
          keyboardType="phone-pad"
          value={contact}
          maxLength={10}
          onChangeText={(text) => setContact(text.replace(/[^0-9]/g, ''))}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>BIRTHDAY</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, styles.dropdown]}>
            <Text>{formatDate(birthday)}</Text>
            <Feather name="calendar" size={16} color="#555" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthday || new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setBirthday(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>GENDER</Text>
          <TouchableOpacity style={[styles.input, styles.dropdown]} onPress={() => setGenderDropdownVisible(!genderDropdownVisible)}>
            <Text style={styles.dropdownText}>{gender || 'Select Gender'}</Text>
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
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)} disabled={saving}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: isFormValid ? '#024a63' : '#999' }]}
          disabled={!isFormValid || saving}
          onPress={handleSave}
        >
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <ProfileHeader />
        
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#024a63" />
          </View>
        ) : (
          isEditing ? renderEditMode() : renderViewMode()
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProfileSetting;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  /* VIEW MODE STYLES */
  viewContent: { padding: 16, paddingBottom: 60 },
  topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#024a63',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#024a63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  bannerText: { fontSize: 18, color: '#fff', fontFamily: 'mbold' },
  editBadgeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'mbold' },
  
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewAvatar: { width: 70, height: 70, borderRadius: 35, resizeMode: 'cover' },
  initialsAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#024a63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: { fontSize: 24, color: '#fff', fontFamily: 'mbold' },
  avatarInfo: { marginLeft: 16, flex: 1 },
  avatarName: { fontSize: 18, fontFamily: 'mbold', color: '#111' },
  avatarEmail: { fontSize: 13, color: '#666', marginTop: 4, fontFamily: 'Montserrat' },
  
  detailsList: { marginTop: 16, gap: 10 },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  detailIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f7f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 11, color: '#888', fontFamily: 'mbold', marginBottom: 2 },
  detailValue: { fontSize: 14, color: '#111', fontFamily: 'mbold' },

  /* EDIT MODE STYLES */
  editContent: { padding: 20, paddingBottom: 60, backgroundColor: '#fff', margin: 16, borderRadius: 16 },
  editModeTitle: { fontSize: 18, fontFamily: 'mbold', color: '#111', marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#eaeaea', marginBottom: 20 },
  
  profileImageContainer: { alignSelf: 'center', marginBottom: 24, position: 'relative' },
  editAvatarImage: { width: 90, height: 90, borderRadius: 45 },
  uploadIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#024a63',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  inputWrapper: { flex: 1 },
  inputWrapperFull: { marginBottom: 16 },
  label: { fontSize: 11, color: '#555', marginBottom: 6, fontFamily: 'mbold', letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 50,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  errorText: { color: '#ef4444', fontSize: 11, marginTop: 4, fontFamily: 'Montserrat' },
  
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownText: { color: '#333' },
  dropdownList: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4,
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 5,
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#555', fontFamily: 'mbold' },
  saveBtn: {
    flex: 1.5,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontFamily: 'mbold' },
});
