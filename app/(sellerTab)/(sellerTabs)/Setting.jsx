import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../../context/UserContext';

const Setting = () => {
  const navigation = useNavigation();
const { setUser,user } = useUser();
console.log(user)
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

      <TouchableOpacity
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        onPress={handleLogout}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
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
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',
  },
  sideIcon: {
    width: 24,
  },
});
