import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import ActionSheet from 'react-native-actions-sheet';
import { ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

const filterOptions = [
  { key: "priceRange", name: "Price Range", options: ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹5000", "Above ₹5000"] },
  { key: "rating", name: "Rating", options: ["4★ & above", "3★ & above", "2★ & above"] },
  { key: "availability", name: "Availability", options: ["In Stock", "Out of Stock"] },
];

const sortOptions = ["Latest", "Price: Low to High", "Price: High to Low", "Popularity"];

const ProductCategories = () => {
  const { category, name, realId, isGift } = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  console.log()
  
  const actionSheetRef = React.useRef(null);
  const sortSheetRef = React.useRef(null);

  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [],
    rating: [],
    availability: [],
  });
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [sortBy, setSortBy] = useState("Latest");

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

  useEffect(() => {
    fetchProducts();
    fetchSubcategories();
  }, [category]);

  const fetchSubcategories = async () => {
    if (isGift === 'true') return;
    const targetId = realId || category;
    if (!targetId) return;
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}categories/subcategories/${targetId}`
      );
      if (res.data?.status) {
        setSubcategories(res.data.data || []);
      } else {
        setSubcategories([]);
      }
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setSubcategories([]);
    }
  };

  const fetchProducts = async () => {
    if (!category) return;
    try {
      setLoading(true);
      const url = isGift === 'true' 
        ? `${process.env.EXPO_PUBLIC_BASE_URL}gift-categories/getproductbygiftslug/${category}`
        : `${process.env.EXPO_PUBLIC_BASE_URL}categories/${category}`;
        
      const res = await axios.get(url);
      if (res.data?.status || res.data?.success || res.data?.data) {
        setProducts(res.data.data || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching category products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    // If image is an array (e.g., gallery_images), pick the first object's thumbnail if available
    if (Array.isArray(image) && image.length > 0) {
      const first = image[0];
      return first.thumbnail || first.icon || first.full || null;
    }
    // For object with possible fields
    if (typeof image === 'object') {
      const url = image.thumbnail || image.url || image.original || image.full || '';
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return `https://backend.craftdelhi.com${url}`;
      return `https://backend.craftdelhi.com/${url}`;
    }
    // For plain string URL
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      if (image.startsWith('/')) return `https://backend.craftdelhi.com${image}`;
      return `https://backend.craftdelhi.com/${image}`;
    }
    return null;
  };

  const formatPrice = (price) => {
    if (!price) return "0.00";
    return parseFloat(price).toFixed(2);
  };

  const filteredProducts = products.filter((product) => {
    let matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
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

    return matchesSearch && matchesPrice && matchesRating && matchesAvailability;
  }).sort((a, b) => {
    if (sortBy === "Price: Low to High") return Number(a.price) - Number(b.price);
    if (sortBy === "Price: High to Low") return Number(b.price) - Number(a.price);
    if (sortBy === "Popularity") return Number(b.total_order || 0) - Number(a.total_order || 0);
    return 0;
  });

  const renderProduct = ({ item, index }) => {
    const imagePath = getImageUrl(item.main_image_url || item.gallery_images);

    return (
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        delay={index * 100}
        style={styles.card}
        useNativeDriver
      >
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/ProductDetails', params: item })}
          activeOpacity={0.8}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: imagePath }} style={styles.image} />
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>₹ {formatPrice(item.price)}</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.ordersText}>{item.total_order || 0} Orders</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#69D297" />
                <Text style={styles.ratingNumber}>
                  {Number(item.average_rating || 0).toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || 'Category'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products in this category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subcategories Strip */}
      {subcategories.length > 0 && (
        <View style={styles.subcategoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subcategoriesList}>
            {subcategories.map((sub) => (
              <TouchableOpacity 
                key={sub.id} 
                style={styles.subcategoryPill}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilters({ priceRange: [], rating: [], availability: [] });
                  router.push({ pathname: '/ProductCategories', params: { category: sub.id, name: sub.name, realId: sub.id } });
                }}
              >
                <Text style={styles.subcategoryText}>{sub.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Filters Strip (Static for now) */}
      <View style={styles.filterStrip}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => actionSheetRef.current?.show()}>
          <Feather name="filter" size={16} color="#64748b" />
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => sortSheetRef.current?.show()}>
          <Text style={styles.filterText}>Sort by: {sortBy}</Text>
          <Ionicons name="chevron-down" size={16} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.gridContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <View key={i} style={[styles.card, { paddingBottom: 10, marginHorizontal: 6, marginBottom: 12 }]} />
          ))}
        </View>
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="box" size={60} color="#e2e8f0" />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySub}>Try searching for something else in this category.</Text>
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
        </ScrollView>
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => actionSheetRef.current?.hide()}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* Sort ActionSheet */}
      <ActionSheet ref={sortSheetRef} gestureEnabled={true} containerStyle={styles.sheetContainer}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Sort By</Text>
          <TouchableOpacity onPress={() => sortSheetRef.current?.hide()}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.sheetBody}>
          {sortOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.sortOptionRow}
              onPress={() => {
                setSortBy(option);
                sortSheetRef.current?.hide();
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionSelected]}>{option}</Text>
              {sortBy === option && <Ionicons name="checkmark" size={20} color="#024a63" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ActionSheet>
    </View>
  );
};

export default ProductCategories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#0f172a',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'msemibold',
    color: '#334155',
  },
  filterStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'msemibold',
    color: '#475569',
  },
  subcategoriesContainer: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  subcategoriesList: {
    paddingRight: 20,
  },
  subcategoryPill: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subcategoryText: {
    fontSize: 13,
    fontFamily: 'mmedium',
    color: '#334155',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ECF0FF',
    borderWidth: 1,
    width: '48%', // two columns
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  priceText: {
    color: '#024a63',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    padding: 12,
  },
  productTitle: {
    fontSize: 12,
    fontFamily: 'mbold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ordersText: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'msemibold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'mbold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'msemibold',
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  sheetContainer: {
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#0f172a',
  },
  sheetBody: {
    maxHeight: 400,
  },
  filterGroup: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  filterGroupName: {
    fontSize: 16,
    fontFamily: 'msemibold',
    color: '#334155',
  },
  filterOptionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#024a63',
    borderColor: '#024a63',
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'mmedium',
    color: '#475569',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  applyButton: {
    backgroundColor: '#024a63',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'mbold',
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sortOptionText: {
    fontSize: 16,
    fontFamily: 'mmedium',
    color: '#475569',
  },
  sortOptionSelected: {
    color: '#024a63',
    fontFamily: 'mbold',
  },
});
