import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Search from '../../assets/images/search.svg'
import MyCarousel from '../../components/home/Carousel';
import OurProducts from '../../components/home/OurProducts';
import Justforyou from '../../components/home/Justforyou';
import Feature from '../../components/home/Feature';

const Home = () => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (text) => {
    setSearchText(text);
    console.log('Searching for:', text);
  };

  return (
    <SafeAreaView style={styles.container}>
     <ScrollView>
       <View style={styles.searchContainer}>
        <Search width={24} height={24} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
     
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    borderWidth:1,
    borderColor:'#E0E4F4',
    margin:20
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
