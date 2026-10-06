import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import React, { useState, useEffect, useCallback } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useNavigation, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getImageUrl } from '../../../utils/imageUrl';
import { useUser } from '../../../../context/UserContext';
import Logout from '../../../../assets/images/logout.svg';
import { LinearGradient } from 'expo-linear-gradient';

const Setting = () => {
  const menuItems = [
    { label: 'Profile Setting', route: '/SellerScreens/ProfileSetting', icon: 'user', type: 'feather' },
    { label: 'My Account', route: '/SellerScreens/MyAccount', icon: 'wallet-outline', type: 'ionicon' },
    { label: 'Shop Setting', route: '/SellerScreens/ShopSetting', icon: 'settings', type: 'feather' },
    { label: 'Logout', route: '/logout', icon: 'log-out', type: 'feather', color: '#FF3B30' },
  ];

  const navigation = useNavigation();
  const { setUser, user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (user?.token) {
        axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}profile/getdetails`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }).then(res => {
          if (res.data.status && res.data.profile?.profile_image) {
            setProfileImage(res.data.profile.profile_image);
          }
        }).catch(err => console.error("Error fetching profile in settings:", err));
      }
    }, [user])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/auth/Signin');
    } catch (err) {
      console.error('Error removing user data:', err);
    }
  };

  const renderIcon = (item) => {
    if (item.type === 'ionicon') {
      return <Ionicons name={item.icon} size={22} color={item.color || '#4A4A4A'} />;
    }
    return <Feather name={item.icon} size={22} color={item.color || '#4A4A4A'} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
          <Feather name="menu" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.sideIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info Section */}
        <Animatable.View animation="fadeInDown" duration={600} style={styles.profileSection}>
          <LinearGradient
            colors={['#f8f9fa', '#e9ecef']}
            style={styles.profileCard}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={profileImage ? { uri: (typeof profileImage === 'string' && profileImage.startsWith('file://')) ? profileImage : getImageUrl(profileImage, 'thumbnail') } : { uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
                style={styles.avatar} 
              />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.userName}>{user?.name || 'Seller Name'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'seller@store.com'}</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Verified Seller</Text>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const isLogout = item.label === 'Logout';
            return (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={index * 150}
                duration={400}
                useNativeDriver
              >
                <TouchableOpacity
                  style={[styles.menuItem, isLogout && styles.logoutMenuItem]}
                  onPress={() => (isLogout ? setModalVisible(true) : router.push(item.route))}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.iconWrapper, isLogout && { backgroundColor: '#FFEBEA' }]}>
                      {renderIcon(item)}
                    </View>
                    <Text style={[styles.menuText, isLogout && { color: '#FF3B30' }]}>
                      {item.label}
                    </Text>
                  </View>
                  {!isLogout && (
                    <Feather name="chevron-right" size={20} color="#C4C4C4" />
                  )}
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <View style={styles.modalIconContainer}>
              <Logout width={48} height={48} />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalText}>
              Are you sure you want to log out from your seller account?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  sideIcon: {
    width: 24,
  },
  content: {
    paddingBottom: 40,
  },
  profileSection: {
    paddingVertical: 10,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  profileDetails: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'mbold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContainer: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  logoutMenuItem: {
    marginTop: 10,
    borderColor: '#FFEBEA',
    backgroundColor: '#FFFAFA',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'mbold',
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
