import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation, useLocalSearchParams, router } from 'expo-router';
import AddNewContainer from '../../components/Seller/products/AddNewContainer';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProduct() {
  const navigation = useNavigation();
  const { item } = useLocalSearchParams();
  const editData = item ? JSON.parse(item) : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.sideIcon}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Product</Text>
          <View style={styles.sideIcon} />
        </View>

        <AddNewContainer editData={editData} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  title: { fontFamily: 'mbold', fontSize: 16, textAlign: 'center' },
  sideIcon: { width: 24 }
});
