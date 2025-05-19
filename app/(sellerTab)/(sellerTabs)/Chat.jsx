import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const Chat = () => {
    const navigation = useNavigation();
 return (
      <View style={styles.container}>
  <View style={styles.headerRow}>
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
      <Feather name="menu" size={24} color="black" />
    </TouchableOpacity>

    <Text style={styles.title}>Chat</Text>

    <View style={styles.sideIcon} />
  </View>
</View>

   
  );
};

export default Chat;

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

