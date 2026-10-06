import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { useUser } from '../../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logout from '../../../assets/images/logout.svg';

const Profile = () => {
  const { user, setUser } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  console.log(user)

  const isLoggedIn = Boolean(user && user.token);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setModalVisible(false);
    } catch (err) {
      console.error('Error removing user data:', err);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Profile</Text>
    </View>
  );

  const renderGuestBanner = () => (
    <Animatable.View animation="fadeIn" style={styles.guestBanner}>
      <View style={styles.guestIconCircle}>
        <Ionicons name="person" size={50} color="#024a63" />
      </View>
      <Text style={styles.guestTitle}>Welcome to Craft Delhi</Text>
      <Text style={styles.guestSubTitle}>Sign in to access your orders, wishlists, and personalize your experience.</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/Signin')}>
        <Text style={styles.loginBtnText}>Login or Sign Up</Text>
        <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderUserHeader = () => {
    const name = user?.name || 'Craft Delhi User';
    const email = user?.email || user?.id || 'Premium Member';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
      <Animatable.View animation="fadeIn" style={styles.userHeaderCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>
      </Animatable.View>
    );
  };

  const renderMenuItem = (label, iconName, route, index, isDanger = false) => {
    const iconBgColor = isDanger ? '#fee2e2' : '#f0f9ff';
    const iconColor = isDanger ? '#ef4444' : '#0284c7';
    
    return (
      <Animatable.View key={index} animation="fadeInUp" delay={index * 100} duration={300} useNativeDriver>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            if (route === 'logout') {
              setModalVisible(true);
            } else {
              router.push(route);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
              <Feather name={iconName} size={20} color={iconColor} />
            </View>
            <Text style={[styles.menuText, isDanger && styles.menuTextDanger]}>{label}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isLoggedIn ? (
          <>
            {renderGuestBanner()}
            <Text style={styles.groupTitle}>General</Text>
            <View style={styles.menuGroup}>
              {renderMenuItem('Terms & Conditions', 'file-text', '#', 1)}
              <View style={styles.separator} />
              {renderMenuItem('Privacy Policy', 'shield', '#', 2)}
              <View style={styles.separator} />
              {renderMenuItem('Help & Support', 'help-circle', '#', 3)}
            </View>
          </>
        ) : (
          <>
            {renderUserHeader()}
            
            <Text style={styles.groupTitle}>Account</Text>
            <View style={styles.menuGroup}>
              {renderMenuItem('Profile Setting', 'user', '/profile/ProfileSetting', 1)}
              <View style={styles.separator} />
              {renderMenuItem('Delivery Address', 'map-pin', '/profile/DeliveryAddress', 2)}
            </View>

            <Text style={styles.groupTitle}>Activity</Text>
            <View style={styles.menuGroup}>
              {renderMenuItem('My Orders', 'box', '/profile/MyOrders', 3)}
              <View style={styles.separator} />
              {renderMenuItem('My Wishlist', 'heart', '/profile/MyWishlish', 4)}
              <View style={styles.separator} />
              {renderMenuItem('Return Orders', 'refresh-ccw', '/profile/ReturnOrder', 5)}
            </View>

            <Text style={styles.groupTitle}>General</Text>
            <View style={styles.menuGroup}>
              {renderMenuItem('Terms & Conditions', 'file-text', '#', 1)}
              <View style={styles.separator} />
              {renderMenuItem('Privacy Policy', 'shield', '#', 2)}
              <View style={styles.separator} />
              {renderMenuItem('Help & Support', 'help-circle', '#', 3)}
            </View>

            <View style={[styles.menuGroup, { marginTop: 24 }]}>
              {renderMenuItem('Log Out', 'log-out', 'logout', 6, true)}
            </View>
          </>
        )}
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
              <Feather name="log-out" size={32} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalText}>Are you sure you want to log out of your account?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  guestBanner: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#024a63',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  guestIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  guestSubTitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: '#ee6f69',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ee6f69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  userHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#024a63',
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#024a63',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ee6f69',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ee6f69',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 8,
  },
  menuGroup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 64, // Aligns with the text
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  menuTextDanger: {
    color: '#ee6f69',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 32,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#ee6f69',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});