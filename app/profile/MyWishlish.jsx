import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Feather, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import ProfileHeader from './ProfileHeader'

const MyWishlish = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
     <ProfileHeader/>
      </SafeAreaView>
  )
}

export default MyWishlish

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
 
})