import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons, Feather } from '@expo/vector-icons'; // Make sure expo/vector-icons is installed
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const menuItems = [
  'Profile Setting',
  'Delivery Address',
  'My Orders',
  'My Whishlist',
  'Return Orders',
  'Logout',
];

const Profile = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity >
          
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity onPress={()=>router.push('/(tabs)/Cart')}>
          <Feather name="shopping-cart" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map((item, index) => (
          <Animatable.View
            key={index}
            animation="fadeInUp"
            delay={index * 200}
            duration={300}
            useNativeDriver
          >
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>{item}</Text>
              <Feather name="chevron-right" size={20} color="#000" />
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontFamily: 'msemibold',
  },
});