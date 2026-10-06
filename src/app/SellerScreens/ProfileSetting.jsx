import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useUser } from '../../../context/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getImageUrl } from '../../utils/imageUrl';

const ProfileSetting = () => {
  const { user } = useUser();
  const navigation = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [profileImage, setProfileImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    dob: '',
    officeAddress: '',
    homeAddress: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [backupValues, setBackupValues] = useState({});

  const fetchProfile = useCallback(async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}profile/getdetails`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      if (res.data.status) {
        const data = res.data.profile;
        const initialData = {
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          phone: data.phone_number || '',
          city: data.city || '',
          dob: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          officeAddress: data.office_address || '',
          homeAddress: data.home_address || '',
        };
        setFormData(initialData);
        setBackupValues(initialData);
        
        // Handle profile image
        if (data.profile_image) {
          // You can create a helper or just construct the URL if needed
          // Assuming it's already a full URL or relative path
          setProfileImage(data.profile_image);
          setOriginalImage(data.profile_image);
        }
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch profile details.' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch profile details.' });
    } finally {
      setFetchLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.token) fetchProfile();
  }, [fetchProfile]);

  const handleChange = (name, value) => {
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: cleaned }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setProfileImage(asset.uri);
      
      // Upload immediately like the web app does when cropping is done
      await uploadProfileImage({
        uri: asset.uri,
        name: asset.fileName || `profile_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      const formDataImg = new FormData();
      formDataImg.append('profile_image', file);
      
      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}profile/edit`, 
        formDataImg, 
        { headers: { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'multipart/form-data' } }
      );
      
      if (res.data.status) {
        Toast.show({ type: 'success', text1: 'Profile image updated!' });
        setOriginalImage(file.uri);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.data.message || 'Upload failed.' });
        setProfileImage(originalImage);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Upload error' });
      setProfileImage(originalImage);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("first_name", formData.firstName || "");
      form.append("last_name", formData.lastName || "");
      form.append("phone_number", formData.phone || "");
      form.append("city", formData.city || "");
      form.append("date_of_birth", formData.dob || "");
      form.append("office_address", formData.officeAddress || "");
      form.append("home_address", formData.homeAddress || "");

      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}profile/edit`,
        form,
        { headers: { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (res.data.status) {
        Toast.show({ type: 'success', text1: 'Profile updated successfully!' });
        setIsEditing(false);
        setBackupValues({ ...formData });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.data.message || 'Failed to update profile' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error updating profile' });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({ ...backupValues });
    setIsEditing(false);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('dob', formattedDate);
    }
  };

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B3C5D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.sideIcon}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile Setting</Text>
        <View style={styles.sideIcon} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.divider} />

            {/* Profile Image & Name Section */}
            <View style={styles.profileHeader}>
              <View style={styles.imageContainer}>
                <Image 
                  source={profileImage ? { uri: (typeof profileImage === 'string' && profileImage.startsWith('file://')) ? profileImage : getImageUrl(profileImage, 'thumbnail') } : require('../../../assets/images/sample.png')} 
                  style={styles.profilePic} 
                />
                <TouchableOpacity style={styles.editImageBtn} onPress={handleImagePick}>
                  <Feather name="edit-2" size={12} color="#555" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{formData.firstName} {formData.lastName}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FIRST NAME</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.firstName}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LAST NAME</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.lastName}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                editable={isEditing}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CITY</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.city}
                onChangeText={(text) => handleChange('city', text)}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DATE OF BIRTH</Text>
              <TouchableOpacity
                style={[styles.input, !isEditing && styles.inputDisabled, { justifyContent: 'center' }]}
                onPress={() => isEditing && setShowDatePicker(true)}
                disabled={!isEditing}
              >
                <Text style={[styles.inputText, !isEditing && { color: '#888' }]}>
                  {formData.dob || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={formData.dob ? new Date(formData.dob) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}

            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Office & Home Address</Text>
            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>OFFICE ADDRESS</Text>
                <Text style={styles.charCount}>{formData.officeAddress.length}/300</Text>
              </View>
              <TextInput
                style={[styles.textArea, !isEditing && styles.inputDisabled]}
                value={formData.officeAddress}
                onChangeText={(text) => handleChange('officeAddress', text)}
                editable={isEditing}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={300}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>HOME ADDRESS</Text>
                <Text style={styles.charCount}>{formData.homeAddress.length}/300</Text>
              </View>
              <TextInput
                style={[styles.textArea, !isEditing && styles.inputDisabled]}
                value={formData.homeAddress}
                onChangeText={(text) => handleChange('homeAddress', text)}
                editable={isEditing}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={300}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {!isEditing ? (
                <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditing(true)}>
                  <Text style={styles.primaryButtonText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel} disabled={loading}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.primaryButton, loading && styles.disabledButton]} 
                    onPress={handleSave} 
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProfileSetting;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  sideIcon: {
    width: 30,
    alignItems: 'flex-start',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    marginRight: 20,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    resizeMode: 'cover',
  },
  editImageBtn: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#777',
    fontFamily: 'mmedium',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 14,
  },
  inputText: {
    fontSize: 14,
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#888',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 14,
    minHeight: 80,
  },
  charCount: {
    fontSize: 11,
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#024a63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'mbold',
  },
  secondaryButton: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'mbold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
