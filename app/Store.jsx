import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather } from '@expo/vector-icons';
import storeimage from '../assets/images/storeimage.png';
import Products from '../components/store/Products';
import Search from '../components/Search';
import Chatnow from '../assets/images/chatnow.svg'

const Store = () => {
  const [active, setActive] = useState('products');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Name</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')}>
          <Feather name="shopping-cart" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <Search/>

      <ScrollView>
        {/* Store Info */}
        <View style={styles.storeInfo}>
          <Image source={storeimage} style={styles.storeImage} />
          <View style={styles.storeText}>
            <Text style={styles.storeName}>Craft Delhi Store</Text>
            <Text style={styles.storeDescription}>
              Description Here: We are selling handmade paper gifts and crafts.
              Thanks!
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statContainer}>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.label}>Positive Seller Ratings</Text>
              <Text style={styles.value}>80%</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statBox}>
              <Text style={styles.label}>Ship On{'\n'}Time</Text>
              <Text style={styles.value}>100%</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statBox}>
              <Text style={styles.label}>Response{'\n'}Time</Text>
              <Text style={styles.value}>10 mints</Text>
            </View>
          </View>
        </View>

        {/* Segmented Switch */}
        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[
              styles.switchButton,
              active === 'products' && styles.switchActive,
            ]}
            onPress={() => setActive('products')}
          >
            <Text
              style={[
                styles.switchText,
                active === 'products' && styles.switchTextActive,
              ]}
            >
              Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchButton,
              active === 'reels' && styles.switchActive,
            ]}
            onPress={() => {router.push('/Reels');}}
          >
            <Text
              style={[
                styles.switchText,
                active === 'reels' && styles.switchTextActive,
              ]}
            >
              Reels
            </Text>
          </TouchableOpacity>
        </View>

       
        {active === 'products' &&
          <Products/>
        }

      </ScrollView>
      <View style={styles.bottomBar}>
  <TouchableOpacity style={styles.chatButton}>
    <Chatnow width={25} height={25} />
    <Text style={styles.chatButtonText}>Chat Now</Text>
  </TouchableOpacity>
</View>

    </SafeAreaView>
  );
};

export default Store;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: 'black',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  storeImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 20,
  },
  storeText: {
    flex: 1,
    flexShrink: 1,
  },
  storeName: {
    color: '#EE6F69',
    fontFamily: 'mbold',
    fontSize: 17,
    marginBottom: 4,
  },
  storeDescription: {
    fontFamily: 'msemibold',
    fontSize: 13,
    color: '#333',
    flexWrap: 'wrap',
  },
  statContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginTop: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  label: {
    color: '#36234E',
    fontSize: 15,
    fontFamily: 'mbold',
    textAlign: 'center',
    lineHeight: 17,
  },
  value: {
    color: '#EE6F69',
    fontSize: 16,
    fontFamily: 'mbold',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#D9D9D9',
    marginHorizontal: 5,
  },

  // Segmented Switch
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECF0FF',
    borderRadius: 4,
    margin: 16,
    padding: 4,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#EE6F69',
  },
  switchText: {
    fontSize: 12,
    fontFamily: 'msemibold',
    fontWeight: '400',
    color: 'black',
    lineHeight: 16,
  },
  switchTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  bottomBar: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'white',
  paddingVertical: 25,
  alignItems: 'center',
  justifyContent: 'center',
},

chatButton: {
  paddingVertical: 10,
  paddingHorizontal: 24,
  backgroundColor: '#FFC700',
  borderRadius: 10,
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'center',
  gap:5
},

chatButtonText: {
  color: 'black',
  fontFamily: 'mbold',
  fontSize: 16,
}

});
