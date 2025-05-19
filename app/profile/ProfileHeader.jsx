import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Feather, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSelector } from 'react-redux'

const ProfileHeader = () => {
   const cart = useSelector(state => state.cart.cart);
  const cartCount = cart?.length ?? 0;
  return (
     <View style={styles.header}>
             <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
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
    paddingTop:Platform.OS==='ios'?5:0
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  
})