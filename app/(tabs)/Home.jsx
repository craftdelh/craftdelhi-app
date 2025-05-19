import React, { useState } from 'react';
import {  ScrollView, StyleSheet, Text, View } from 'react-native';
import MyCarousel from '../../components/home/Carousel';
import OurProducts from '../../components/home/OurProducts';
import Justforyou from '../../components/home/Justforyou';
import Feature from '../../components/home/Feature';
import Search from '../../components/Search';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
  const [searchText, setSearchText] = useState('');

  const isSearching = searchText.length > 0;

  return (
    <View style={styles.container}>
      <View style={{ borderBottomWidth: 0.2, borderColor: 'gray', paddingBottom: 10 }}>
        <Text style={{ fontFamily: 'mbold', textAlign: 'center', fontSize: 16 }}>Home</Text>
      </View>
      <ScrollView>
        <Search searchText={searchText} setSearchText={setSearchText} />

        {!isSearching && (
          <>
            <MyCarousel />
            <OurProducts />
            <Justforyou />
            <Feature />
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
