import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useUser } from '../../../context/UserContext';
import * as Clipboard from 'expo-clipboard';

const ShopSetting = () => {
  const { user } = useUser();
  const navigation = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [profileImage, setProfileImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    storeId: user?.id?.toString() || '',
    store_name: '',
    store_username: '',
    store_link: '',
    description: '',
    business_number: '',
  });

  const fetchStoreDetails = useCallback(async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}seller-store/getdetails`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      if (res.data.status && res.data.store) {
        const store = res.data.store;
        setFormData(prev => ({
          ...prev,
          store_name: store.store_name || '',
          store_username: store.store_username || '',
          store_link: store.store_username ? `https://craftdelhi.com/Store/${store.store_username}` : '',
          description: store.description || '',
          business_number: store.business_number || '',
        }));
        setProfileImage(store.store_image?.full || null);
        setOriginalImage(store.store_image?.full || null);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.data.message || 'Failed to load store details.' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch store details.' });
    } finally {
      setFetchLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.token) {
      fetchStoreDetails();
    }
  }, [fetchStoreDetails]);

  const handleChange = (name, value) => {
    if (name === 'business_number') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, business_number: cleaned }));
      return;
    }
    if (name === 'description' && value.length > 300) return;
    
    if (name === 'store_username') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        store_link: value ? `https://craftdelhi.com/Store/${value}` : '',
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagePick = async () => {
    if (!isEditing) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setProfileImage(asset.uri);
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const handleCopyLink = async () => {
    if (!formData.store_link) {
      Toast.show({ type: 'error', text1: 'Store link not available' });
      return;
    }
    await Clipboard.setStringAsync(formData.store_link);
    Toast.show({ type: 'success', text1: 'Store link copied!' });
  };

  const handleSave = async () => {
    if (!formData.store_name.trim()) return Toast.show({ type: 'error', text1: 'Store Name is required.' });
    if (!formData.store_username.trim()) return Toast.show({ type: 'error', text1: 'Store Username is required.' });
    if (formData.business_number.length !== 10) return Toast.show({ type: 'error', text1: 'Business Number must be 10 digits.' });
    
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      
      if (selectedFile) {
        data.append('store_image', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.type,
        });
      }

      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}seller-store/edit`,
        data,
        { headers: { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (res.data.status) {
        Toast.show({ type: 'success', text1: 'Store updated successfully.' });
        setIsEditing(false);
        fetchStoreDetails();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.data.message || 'Failed to update store.' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error updating store.' });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setProfileImage(originalImage);
    fetchStoreDetails();
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
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.sideIcon}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Shop Setting</Text>
        <View style={styles.sideIcon} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>General Information</Text>
            <View style={styles.divider} />

            {/* Profile Image */}
            <View style={styles.imageSection}>
              <TouchableOpacity onPress={handleImagePick} disabled={!isEditing}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={profileImage ? { uri: profileImage } : require('../../../assets/images/storeimage.png')} 
                    style={styles.profilePic} 
                  />
                  {isEditing && (
                    <View style={styles.editImageOverlay}>
                      <Feather name="camera" size={20} color="#fff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.imageHint}>Shop Logo</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>STORE NAME</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.store_name}
                onChangeText={(text) => handleChange('store_name', text)}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>STORE ID</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.storeId}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>STORE USERNAME <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWithIcon, !isEditing && styles.inputDisabled]}>
                <Feather name="globe" size={18} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputField, !isEditing && { color: '#888' }]}
                  value={formData.store_username}
                  onChangeText={(text) => handleChange('store_username', text)}
                  editable={isEditing}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>STORE LINK</Text>
              <View style={[styles.inputWithIcon, styles.inputDisabled]}>
                <TextInput
                  style={[styles.inputField, { color: '#888' }]}
                  value={formData.store_link}
                  editable={false}
                />
                <TouchableOpacity onPress={handleCopyLink} style={styles.copyButton}>
                  <Feather name="copy" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>Link will be automatically generated</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>BUSINESS NUMBER</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.business_number}
                onChangeText={(text) => handleChange('business_number', text)}
                editable={isEditing}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>DESCRIPTION ABOUT STORE</Text>
                <Text style={styles.charCount}>{formData.description.length}/300</Text>
              </View>
              <TextInput
                style={[styles.textArea, !isEditing && styles.inputDisabled]}
                value={formData.description}
                onChangeText={(text) => handleChange('description', text)}
                editable={isEditing}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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

export default ShopSetting;

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
  imageSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
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
  required: {
    color: 'red',
    fontSize: 14,
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
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#888',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  copyButton: {
    paddingLeft: 10,
  },
  hintText: {
    fontSize: 11,
    color: '#888',
    marginTop: 6,
    fontStyle: 'italic',
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
    minHeight: 100,
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
