import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from 'expo-router';
import AddNewContainer from '../../components/Seller/products/AddNewContainer';

const AddNewProduct = () => {
  const navigation = useNavigation();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.sideIcon}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Add Products</Text>

        <View style={styles.sideIcon} />
      </View>

       <Text style={styles.header}>Product Information</Text>
      <AddNewContainer />
    </KeyboardAvoidingView>
  );
}

export default AddNewProduct

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
    marginBottom: 15
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    textAlign: 'center',
  },
  sideIcon: {
    width: 24,
  },
  header: {
    fontFamily: 'mbold',
    fontSize: 18,
    marginBottom: 20,
    marginTop:20
  },
});
