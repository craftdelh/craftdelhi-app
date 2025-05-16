import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Feather, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const ProfileHeader = () => {
  return (
     <View style={styles.header}>
             <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
    
            <Text style={styles.headerTitle}>My Profile</Text>
    
            <TouchableOpacity onPress={()=>router.push('/(tabs)/Cart')}>
              <Feather name="shopping-cart" size={22} color="black" />
            </TouchableOpacity>
          </View>
  )
}

export default ProfileHeader

const styles = StyleSheet.create({
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
  },
  
})