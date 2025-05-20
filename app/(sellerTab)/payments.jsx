import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from 'expo-router';
import { ScrollView } from 'react-native';

const Paymnets = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
  <View style={styles.headerRow}>
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
      <Feather name="menu" size={24} color="black" />
    </TouchableOpacity>

    <Text style={styles.title}>Payments</Text>

    <View style={styles.sideIcon} />
  </View>

  <ScrollView showsVerticalScrollIndicator={false}>
           <View style={styles.wrapper}>
        <Text style={styles.header}>Payment Summary</Text>
  
        
      
      </View>
        </ScrollView>
    </View>
  )
}

export default Paymnets

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
    marginBottom:15
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',
  },
  sideIcon: {
    width: 24, 
  },
   wrapper: {
    marginTop: 20,
  },
  header: {
    fontFamily: 'mbold',
    fontSize: 18,
    marginBottom: 20,
  },
});