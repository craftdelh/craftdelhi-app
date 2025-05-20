import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../../context/UserContext';
import Logout from '../../../assets/images/logout.svg'

const Setting = () => {
  const menuItems = [
  { label: 'Profile Setting', route: '/SellerScreens/ProfileSetting' },
  { label: 'My Account', route: '/SellerScreens/MyAccount' },
  { label: 'Shop Setting', route: '/SellerScreens/ShopSetting' },
  { label: 'Logout', route: '/logout' }, 
];

  const navigation = useNavigation();
const { setUser,user } = useUser();
const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null)
      router.replace('/auth/Signin');
    } catch (err) {
      console.error('Error removing user data:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Setting</Text>

        <View style={styles.sideIcon} />
      </View>

       <ScrollView contentContainerStyle={styles.content}>
              {menuItems.map((item, index) => {
                if (item.label === 'Logout') {
                  return (
                    <Animatable.View
                      key={index}
                      animation="fadeInUp"
                      delay={index * 200}
                      duration={300}
                      useNativeDriver
                    >
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={styles.menuText}>{item.label}</Text>
                        <Feather name="chevron-right" size={20} color="#000" />
                      </TouchableOpacity>
                    </Animatable.View>
                  );
                } else {
                  return (
                    <Animatable.View
                      key={index}
                      animation="fadeInUp"
                      delay={index * 200}
                      duration={300}
                      useNativeDriver
                    >
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push(item.route)}
                      >
                        <Text style={styles.menuText}>{item.label}</Text>
                        <Feather name="chevron-right" size={20} color="#000" />
                      </TouchableOpacity>
                    </Animatable.View>
                  );
                }
              })}
            </ScrollView>

               <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <View style={styles.iconContainer}>
                          <Logout width={40} height={40} />
                        </View>
                        <Text style={styles.modalText}>
                          Are you sure do you want to{'\n'}Logout ?
                        </Text>
                        <View style={styles.modalButtons}>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutButtonText}>Logout</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
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
    marginBottom:20
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',
  },
  sideIcon: {
    width: 24,
  },
  content: {
   marginTop:20
  },
   menuItem: {
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#F5F5F5',
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  menuText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 315,
    height: 190,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginBottom: 5,
  },
  modalText: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',marginBottom:10
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#0B3C5D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
