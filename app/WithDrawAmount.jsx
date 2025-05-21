import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { AntDesign, Feather } from '@expo/vector-icons'
import { router } from 'expo-router'

const WithDrawAmount = () => {
  return (
    <View style={{padding:20, flex:1,backgroundColor:'white'}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <TouchableOpacity onPress={()=>router.back()}>
            <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{fontFamily:'mbold',fontSize:17}}>Confirm Payment Details</Text>
        <TouchableOpacity onPress={()=>router.push('/SellerScreens/MyAccount')}>
            <Feather name="edit" size={22} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default WithDrawAmount

const styles = StyleSheet.create({})