import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  
  Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons, Feather } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useState } from 'react';
import Logout from '../../assets/images/logout.svg'
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

const menuItems = [
  { label: 'Profile Setting', route: '/profile/ProfileSetting' },
  { label: 'Delivery Address', route: '/profile/DeliveryAddress' },
  { label: 'My Orders', route: '/profile/MyOrders' },
  { label: 'My Whishlist', route: '/profile/MyWishlish' },
  { label: 'Return Orders', route: '/profile/ReturnOrder' },
  { label: 'Logout', route: '/logout' }, 
];

const Profile = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(false);
    router.push('/(tabs)/Home'); 
  };
    const cart = useSelector(state => state.cart.cart);
  const cartCount = cart?.length ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity >
          
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={{ position: 'relative' }}>
  <Feather
    name="shopping-cart"
    size={22}
    color={cartCount > 0 ? 'green' : 'black'}
  />
  {cartCount > 0 && (
    <View
      style={{
        position: 'absolute',
        top: -6,
        right: -10,
        backgroundColor: '#4E9C70',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 1,
        minWidth: 18,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
        {cartCount}
      </Text>
    </View>
  )}
</TouchableOpacity>

      </View>

      {/* Body */}
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

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:Platform.OS==='ios'?10:0
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 30,
  },
  content: {
    padding: 20,
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