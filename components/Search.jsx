import { StyleSheet, TextInput, View, TouchableOpacity, Platform, Text, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';

const Search = ({ initialQuery = '', disableSuggestions = false }) => {
  const [searchText, setSearchText] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
console.log(suggestions)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchText || searchText.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        setLoading(true);
        const query = searchText.trim().replace(/-/g, " ");
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}searchall?search=${encodeURIComponent(query)}`
        );
        if (response.data?.status) {
          setSuggestions(response.data.data.slice(0, 6)); // Show top 6 suggestions
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Suggestion fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleSearchSubmit = () => {
    if (searchText && searchText.trim().length > 0) {
      router.push({ pathname: '/search', params: { query: searchText.trim() } });
      setSuggestions([]); // hide suggestions
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSuggestions([]);
  };

  const getImageUrl = (product) => {
    if (!product) return 'https://via.placeholder.com/150';
    if (product.image) return product.image;
    
    let imgData = product.main_image_url || product.gallery_images;
    if (!imgData) return 'https://via.placeholder.com/150';

    if (typeof imgData === 'string') {
      try {
        imgData = JSON.parse(imgData);
      } catch (e) {
        // If it's not JSON, it might just be a direct URL string
        return imgData;
      }
    }
    
    // If it's an array
    if (Array.isArray(imgData) && imgData.length > 0) {
      imgData = imgData[0];
    }
    
    if (typeof imgData === 'object' && imgData !== null) {
      return imgData.icon || imgData.thumbnail || imgData.url || imgData.file_name || imgData.full || 'https://via.placeholder.com/150';
    }
    
    return typeof imgData === 'string' ? imgData : 'https://via.placeholder.com/150';
  };

  const resolveUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (typeof url === 'string' && !url.startsWith("http")) {
       return `https://backend.craftdelhi.com/${url.startsWith("/") ? url.slice(1) : url}`;
    }
    return url;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={22} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search for amazing gifts..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          selectionColor="#EE6F69"
        />
        {loading ? (
           <ActivityIndicator size="small" color="#024a63" style={{ marginRight: 10 }} />
        ) : searchText && searchText.length > 0 ? (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </TouchableOpacity>
        ) : null}
      </View>

      {!disableSuggestions && searchText.trim().length >= 2 && suggestions.length > 0 && (
        <View style={styles.suggestionsWrapper}>
          {suggestions.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.suggestionItem} 
              onPress={() => {
                clearSearch();
                router.push({ pathname: '/ProductDetails', params: item });
              }}
            >
              <Image source={{ uri: resolveUrl(getImageUrl(item)) }} style={styles.thumbnail} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.suggestionPrice}>₹ {item.price}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ddd" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.viewAllBtn} onPress={handleSearchSubmit}>
             <Text style={styles.viewAllText}>View all results</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
    elevation: 9999,
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 52,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  clearButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'mmedium',
  },
  suggestionsWrapper: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 999, // Ensure it floats above other android elements
      },
    }),
    overflow: 'hidden',
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    zIndex: 9999, // Extremely high zIndex
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  thumbnail: {
    width: 45,
    height: 45,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#F5F5F5',
  },
  suggestionTitle: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'mbold',
    marginBottom: 2,
  },
  suggestionPrice: {
    fontSize: 13,
    color: '#EE6F69',
    fontFamily: 'mmedium',
  },
  viewAllBtn: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  },
  viewAllText: {
    color: '#024a63',
    fontFamily: 'mbold',
    fontSize: 14
  }
});
