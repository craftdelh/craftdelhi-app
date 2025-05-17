import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MyCarousel from '../../components/home/Carousel';
import OurProducts from '../../components/home/OurProducts';
import Justforyou from '../../components/home/Justforyou';
import Feature from '../../components/home/Feature';
import Search from '../../components/Search';

const Home = () => {
 

  return (
    <SafeAreaView style={styles.container}>
     <View style={{borderBottomWidth:0.2,borderColor:'gray',paddingBottom:10}}>
      <Text style={{fontFamily:'mbold',textAlign:'center',fontSize:16}}>Home</Text>
     </View>
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
  },
  
});
