import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Chat = () => {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
      <View style={{borderBottomWidth:0.2,borderColor:'gray',paddingBottom:10}}>
              <Text style={{fontFamily:'mbold',textAlign:'center',fontSize:16}}>Chat</Text>
             </View>
    </SafeAreaView>
  )
}

export default Chat

const styles = StyleSheet.create({})