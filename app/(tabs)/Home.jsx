import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import MyCarousel from '../../components/home/Carousel';
import OurProducts from '../../components/home/OurProducts';
import Justforyou from '../../components/home/Justforyou';
import Feature from '../../components/home/Feature';
import Search from '../../components/Search';

const Home = () => {
 

  return (
    <SafeAreaView style={styles.container}>
     <ScrollView>
    <Search/>
     
      <MyCarousel/>
      <OurProducts/>
      <Justforyou/>
      <Feature/>


      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  
});
