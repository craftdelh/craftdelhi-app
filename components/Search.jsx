import { StyleSheet, TextInput, View, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import Searchs from '../assets/images/search.svg';
import { products } from '../data';
import { router } from 'expo-router';

const Search = ({ searchText, setSearchText }) => {
  const handleSearch = (text) => {
    setSearchText(text);
  };

  const filteredSuggestions = products.filter((item) =>
  item.title.includes((searchText || '').toLowerCase())
);



  return (
    <View>
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
      

      {(searchText && searchText.length > 0) && (
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.suggestionItem} onPress={() => router.push({ pathname: '/ProductDetails', params: item })}>
              <Image source={{ uri: item.image }} style={styles.thumbnail} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionTitle}>{item.title}</Text>
                <Text style={styles.suggestionPrice}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E4F4',
    margin: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  suggestionPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
