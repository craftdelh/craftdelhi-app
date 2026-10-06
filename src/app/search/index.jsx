import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import ActionSheet from 'react-native-actions-sheet';
import Search from '../../../components/Search';

const noimage = 'https://via.placeholder.com/150';

const SIZE_ORDER = {
  icon: ["icon", "thumbnail", "full"],
  thumbnail: ["thumbnail", "full", "icon"],
  full: ["full", "thumbnail", "icon"],
};

const parseImage = (image) => {
  if (typeof image !== "string") return image;
  const value = image.trim();
  if (!value || value === "[object Object]") return null;
  if ((value.startsWith("{") && value.endsWith("}")) ||
      (value.startsWith("[") && value.endsWith("]"))) {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
};

const getImageUrl = (image, preferredSize = "thumbnail", fallback = "") => {
  const parsed = parseImage(image);
  if (typeof parsed === "string") return parsed;
  if (Array.isArray(parsed)) return getImageUrl(parsed[0], preferredSize, fallback);
  if (!parsed || typeof parsed !== "object") return fallback;
  const keys = [...(SIZE_ORDER[preferredSize] || SIZE_ORDER.thumbnail), "original", "original_url", "image_url", "url", "src", "path"];
  for (const key of keys) {
    if (parsed[key]) {
      const resolved = getImageUrl(parsed[key], preferredSize);
      if (resolved) return resolved;
    }
  }
  return fallback;
};

const resolveUrl = (url) => {
  if (!url) return noimage;
  if (typeof url === 'string' && !url.startsWith("http")) {
     return `https://backend.craftdelhi.com/${url.startsWith("/") ? url.slice(1) : url}`;
  }
  return url;
}

const getProductImage = (product) => {
  if (!product) return noimage;
  if (product.image) return resolveUrl(product.image);
  
  let imgData = product.main_image_url || product.gallery_images;
  if (!imgData) return noimage;

  if (typeof imgData === 'string') {
    try {
      imgData = JSON.parse(imgData);
    } catch (e) {
      return resolveUrl(imgData);
    }
  }
  
  if (Array.isArray(imgData) && imgData.length > 0) {
    imgData = imgData[0];
  }
  
  if (typeof imgData === 'object' && imgData !== null) {
    const url = imgData.thumbnail || imgData.full || imgData.icon || imgData.url || imgData.file_name;
    return resolveUrl(url || noimage);
  }
  
  return resolveUrl(typeof imgData === 'string' ? imgData : noimage);
};

const formatPrice = (price) => {
  if (!price) return "0.00";
  return parseFloat(price).toFixed(2);
};

const StarRating = ({ rating }) => {
  const value = Number(rating || 0);
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={value >= star ? "star" : value >= star - 0.5 ? "star-half" : "star-outline"}
          size={12}
          color={value >= star - 0.5 ? "#22c55e" : "#ccc"}
        />
      ))}
    </View>
  );
};

const filterOptions = [
  { key: "priceRange", name: "Price Range", options: ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹5000", "Above ₹5000"] },
  { key: "rating", name: "Rating", options: ["4★ & above", "3★ & above", "2★ & above"] },
  { key: "availability", name: "Availability", options: ["In Stock", "Out of Stock"] },
];

const SearchResultsScreen = () => {
  const { query } = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const actionSheetRef = useRef(null);

  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [],
    rating: [],
    availability: [],
  });
  const [expandedFilter, setExpandedFilter] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (!query) {
          setProducts([]);
          return;
        }

        const safeQuery = query.replace(/-/g, " ");
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}searchall?search=${encodeURIComponent(safeQuery)}`
        );

        if (response.data?.status) {
          setProducts(response.data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Search API error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  const handleFilterChange = (filterKey, option) => {
    setSelectedFilters((prev) => {
      const alreadySelected = prev[filterKey]?.includes(option);
      return {
        ...prev,
        [filterKey]: alreadySelected
          ? prev[filterKey].filter((item) => item !== option)
          : [...prev[filterKey], option],
      };
    });
  };

  const filteredProducts = products.filter((product) => {
    let matchesPrice = true;
    if (selectedFilters.priceRange?.length) {
      matchesPrice = selectedFilters.priceRange.some(range => {
        const price = Number(product.price);
        if (range === "Under ₹500") return price < 500;
        if (range === "₹500 - ₹1000") return price >= 500 && price <= 1000;
        if (range === "₹1000 - ₹5000") return price >= 1000 && price <= 5000;
        if (range === "Above ₹5000") return price > 5000;
        return true;
      });
    }

    let matchesRating = true;
    if (selectedFilters.rating?.length) {
      matchesRating = selectedFilters.rating.some(ratingOption => {
        const rating = Number(product.average_rating || 0);
        if (ratingOption === "4★ & above") return rating >= 4;
        if (ratingOption === "3★ & above") return rating >= 3;
        if (ratingOption === "2★ & above") return rating >= 2;
        return true;
      });
    }

    let matchesAvailability = true;
    if (selectedFilters.availability?.length) {
      matchesAvailability = selectedFilters.availability.some(option => {
        if (option === "In Stock") return product.stock > 0;
        if (option === "Out of Stock") return product.stock === 0;
        return true;
      });
    }

    return matchesPrice && matchesRating && matchesAvailability;
  });

  const renderProduct = ({ item }) => {
    const slug = item.product_sku || item.slug || item.id;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/ProductDetails', params: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: getProductImage(item) }} style={styles.image} />
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>₹ {formatPrice(item.price)}</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
          </View>
          <StarRating rating={item.average_rating} />
          <View style={styles.metaRow}>
            <Text style={styles.priceText}>₹ {formatPrice(item.price)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')}>
          <Feather name="shopping-cart" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <View style={{ zIndex: 99, elevation: 99 }}>
        <Search initialQuery={query || ''} disableSuggestions={true} />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          Showing results for "{query?.replace(/-/g, " ")}"
        </Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => actionSheetRef.current?.show()}
        >
          <Ionicons name="filter" size={16} color="#024a63" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#024a63" />
          <Text style={styles.loadingText}>Searching products...</Text>
        </View>
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          renderItem={renderProduct}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No products found.</Text>
          <Text style={styles.emptySubtext}>Try changing your filters or search term.</Text>
        </View>
      )}

      {/* Filter ActionSheet */}
      <ActionSheet ref={actionSheetRef} gestureEnabled={true} containerStyle={styles.sheetContainer}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filters</Text>
          <TouchableOpacity onPress={() => actionSheetRef.current?.hide()}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.sheetBody}>
          {filterOptions.map((filter, index) => (
            <View key={index} style={styles.filterGroup}>
              <TouchableOpacity 
                style={styles.filterGroupHeader}
                onPress={() => setExpandedFilter(expandedFilter === filter.key ? null : filter.key)}
              >
                <Text style={styles.filterGroupName}>{filter.name}</Text>
                <Ionicons 
                  name={expandedFilter === filter.key ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {expandedFilter === filter.key && (
                <View style={styles.filterOptionsContainer}>
                  {filter.options.map((option, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.checkboxRow}
                      onPress={() => handleFilterChange(filter.key, option)}
                    >
                      <View style={[
                        styles.checkbox, 
                        selectedFilters[filter.key]?.includes(option) && styles.checkboxSelected
                      ]}>
                        {selectedFilters[filter.key]?.includes(option) && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => actionSheetRef.current?.hide()}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </ActionSheet>
    </View>
  );
};

export default SearchResultsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    padding: 5,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonText: {
    color: '#024a63',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#69d297',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    padding: 10,
  },
  titleRow: {
    height: 36,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#024a63',
  },
  ratingRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ee6f69',
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sheetBody: {
    padding: 20,
    maxHeight: 500,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  filterGroupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filterOptionsContainer: {
    marginTop: 10,
    paddingLeft: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#024a63',
    borderColor: '#024a63',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#555',
  },
  applyButton: {
    backgroundColor: '#024a63',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
