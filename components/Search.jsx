import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import Searchs from '../assets/images/search.svg'

const Search = () => {
     const [searchText, setSearchText] = useState('');
    
      const handleSearch = (text) => {
        setSearchText(text);
        console.log('Searching for:', text);
      };
  return (
    <View style={styles.searchContainer}>
            <Searchs width={24} height={24} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
  )
}

export default Search

const styles = StyleSheet.create({
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
})