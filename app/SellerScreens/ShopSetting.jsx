import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics'

const ShopSetting = () => {
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState(
    'https://media.istockphoto.com/id/912819604/vector/storefront-flat-design-e-commerce-icon.jpg?s=612x612&w=0&k=20&c=_x_QQJKHw_B9Z2HcbA2d1FH1U1JVaErOAp2ywgmmoTI='
  );
  const [formData, setFormData] = useState({
    storeName: '',
    username: '',
    link: '',
    description: '',
    createdDate: '',
    businessNumber: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImage = async () => {
    if (!editMode) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'businessNumber') {
      const filteredValue = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [field]: filteredValue });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const saveChanges = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setEditMode(false);
     Toast.show({
          type: 'success',
          text1: 'Information Saved Successfully',
          position: 'bottom',
        })
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateStr = selectedDate.toLocaleDateString();
      setFormData({ ...formData, createdDate: dateStr });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // adjust as needed
    >
      <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.sideIcon}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Shop Setting</Text>
          <View style={styles.sideIcon} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>General Information</Text>
          <View style={styles.divider} />

          {/* Centered Image */}
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
              {editMode && (
                <View style={styles.overlayIcon}>
                  <AntDesign name="camera" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Field
            label="Store Name"
            value={formData.storeName}
            editable={editMode}
            onChangeText={(text) => handleChange('storeName', text)}
            placeholder="Enter Store Name"
          />
          <Field
            label="Store Username"
            value={formData.username}
            editable={editMode}
            onChangeText={(text) => handleChange('username', text)}
            placeholder="Enter Store Username"
          />
          <Field
            label="Store Link"
            value={formData.link}
            editable={editMode}
            onChangeText={(text) => handleChange('link', text)}
            placeholder="Enter Store Link"
          />

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description About Store</Text>
            <TextInput
              style={[styles.descriptionBox, { color: editMode ? 'black' : '#999' }]}
              multiline
              numberOfLines={4}
              editable={editMode}
              value={formData.description}
              placeholder="Write something about your store"
              onChangeText={(text) => handleChange('description', text)}
              maxLength={300}
            />
            <Text style={styles.charCounter}>{formData.description.length}/300</Text>
          </View>

          {/* Two Column */}
          <View style={styles.row}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => editMode && setShowDatePicker(true)}
              activeOpacity={editMode ? 0.6 : 1}
            >
              <Field
                label="Store Created Date"
                value={formData.createdDate}
                editable={false}
                placeholder="Select Date"
                rightIcon={<Feather name="calendar" size={18} color={editMode ? '#000' : '#888'} />}
              />
            </TouchableOpacity>

            <Field
              label="Business Number"
              value={formData.businessNumber}
              editable={editMode}
              onChangeText={(text) => handleChange('businessNumber', text)}
              placeholder="Enter Business Number"
              half
              maxLength={10} 
              keyboardType="number-pad" 
            />
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={formData.createdDate ? new Date(formData.createdDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Buttons */}
        <View style={{ marginTop: 10 }}>
          {!editMode ? (
            <TouchableOpacity style={styles.fullWidthButton} onPress={() =>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setEditMode(true)}}>
              <Text style={styles.fullWidthButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const Field = ({
  label,
  value,
  editable = false,
  onChangeText,
  half,
  rightIcon,
  placeholder,
  maxLength,
  keyboardType,
}) => (
  <View style={[styles.inputGroup, half && { flex: 1 }]}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputBox}>
      <TextInput
        style={{ flex: 1, fontFamily: 'Montserrat', color: editable ? 'black' : '#999' }}
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        maxLength={maxLength}
        keyboardType={keyboardType}
      />
      {rightIcon}
    </View>
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sectionTitle: {
    fontFamily: 'mbold',
    fontSize: 17,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  overlayIcon: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontFamily: 'mbold',
    textTransform: 'uppercase',
    color: 'black',
    marginBottom: 8,
  },
  inputBox: {
    height: 56,
    borderColor: '#E0E4F4',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionBox: {
    height: 100,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    fontFamily: 'Montserrat',
  },
  charCounter: {
    fontSize: 10,
    color: '#E0E4F4',
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
  },
  cancelText: {
    color: 'gray',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 4,
    backgroundColor: '#024A63',
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
  },
  fullWidthButton: {
    backgroundColor: '#024A63',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  fullWidthButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ShopSetting;
