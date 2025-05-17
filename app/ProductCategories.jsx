import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Search from '../components/Search';
import { products } from '../data';
import { router } from 'expo-router';
import ActionSheet from 'react-native-actions-sheet';
import Filter from '../components/Filter';

const categories = [
  { name: 'Handmade Paper', image: require('../assets/images/image1.png') },
  { name: 'Printing', image: require('../assets/images/image2.png') },
  { name: 'Craft Kits', image: require('../assets/images/image3.jpg') },
  { name: 'Wall Art', image: require('../assets/images/image1.png') },
  { name: 'Stationery', image: require('../assets/images/image2.png') },
  { name: 'Gift Wrap', image: require('../assets/images/image3.jpg') },
  { name: 'Personalized', image: require('../assets/images/image1.png') },
];

const ProductCategories = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollRef = useRef();
  const { category: initialCategory } = route.params || {};
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const actionSheetRef = useRef(null);

    // for filters
    const [selectedRating, setSelectedRating] = useState(null);
const [selectedAvailability, setSelectedAvailability] = useState(null);
const [selectedSort, setSelectedSort] = useState(null);
const [selectedPrice, setSelectedPrice] = useState(null);
const [toggles, setToggles] = useState([]);
const [filtersApplied, setFiltersApplied] = useState(false);



  useEffect(() => {
    const index = categories.findIndex((item) => item.name === selectedCategory);
    if (index !== -1 && scrollRef.current) {
      scrollRef.current.scrollTo({
        x: index * 140,
        animated: true,
      });
    }
  }, [selectedCategory]);
  // Filter products by selectedCategory
const filteredProducts = products
 .filter((product) => {
  const getPrice = (price) => Number(price.replace(/[^\d]/g, ''));

  const numericPrice = getPrice(product.price);

  if (selectedCategory && product.category !== selectedCategory) return false;
  if (selectedRating && product.rating < selectedRating) return false;
  if (selectedAvailability === 'In Stock' && !product.inStock) return false;
  if (selectedAvailability === 'Out of Stock' && product.inStock) return false;

  if (selectedPrice) {
    if (selectedPrice === 'Under Rs 100' && numericPrice >= 100) return false;
    if (selectedPrice === 'Rs 100 - 300' && (numericPrice < 100 || numericPrice > 300)) return false;
    if (selectedPrice === 'Rs 300 - 500' && (numericPrice < 300 || numericPrice > 500)) return false;
    if (selectedPrice === 'Above Rs 500' && numericPrice <= 500) return false;
  }

  return true;
})

 .sort((a, b) => {
  const getPrice = (price) => Number(price.replace(/[^\d]/g, ''));

  if (selectedSort === 'Price: Low to High') return getPrice(a.price) - getPrice(b.price);
  if (selectedSort === 'Price: High to Low') return getPrice(b.price) - getPrice(a.price);
  if (selectedSort === 'Rating') return b.rating - a.rating;
  if (selectedSort === 'Newest') return new Date(b.dateAdded) - new Date(a.dateAdded);
  return 0;
});





  const handlefilters=()=>{
    actionSheetRef.current?.show();
  }


  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/ProductDetails', params: item })}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>
        ({item.orders}) Orders |{' '}
        <Text style={styles.rating}>{item.rating} Ratings</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{fontSize:16,fontFamily:'mbold'}}>All Category</Text>
        <View style={{ width: 24 }} />
      </View>

      <Search />

      {/* Content */}
      <View style={{ padding: 20 }}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <Text style={{ fontFamily: 'mbold', fontSize: 16 }}>All Categories</Text>
        <TouchableOpacity onPress={handlefilters}>
            <Ionicons name="filter-sharp" size={24} color="black" />
        </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef}>
            {categories.map((item, index) => {
              const isSelected = item.name === selectedCategory;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedCategory(item.name)}
                  style={[
                    styles.itemBox,
                    isSelected && { backgroundColor: '#024A63', borderColor: '#024A63' },
                  ]}
                >
                  <Image source={item.image} style={styles.imageCircle} />
                  <Text style={[styles.itemText, isSelected && { color: 'white' }]}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
      
        <FlatList
                data={filteredProducts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ marginTop: 20, gap: 12 ,padding:20}}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={false}
                />

                  <ActionSheet ref={actionSheetRef}>
    <Filter
  selectedRating={selectedRating}
  setSelectedRating={setSelectedRating}
  selectedAvailability={selectedAvailability}
  setSelectedAvailability={setSelectedAvailability}
  selectedSort={selectedSort}
  setSelectedSort={setSelectedSort}
  selectedPrice={selectedPrice}
  setSelectedPrice={setSelectedPrice}
  toggles={toggles}
  setToggles={setToggles}
  onApply={() => {actionSheetRef.current?.hide();setFiltersApplied((prev) => !prev);}}
  onReset={() => {
    setSelectedRating(null);
    setSelectedAvailability(null);
    setSelectedSort(null);
    setSelectedPrice(null);
    setToggles([]);
  }}
/>

    </ActionSheet>
    </SafeAreaView>
  );
};

export default ProductCategories;

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'mbold',
    color: '#000',
  },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E8E8E8',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  imageCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ddd',
  },
  itemText: {
    fontSize: 14,
    fontFamily: 'msemibold',
    color: '#024A63',
    flexShrink: 1,
    maxWidth: 150,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ECF0FF',
    borderWidth: 1,
    width: '48%',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    left: 6,
    backgroundColor: '#69D297',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat',
    fontWeight: '700',
  },
  title: {
    padding: 8,
    paddingBottom: 0,
    fontSize: 12,
    color: '#024A63',
    fontFamily: 'mmedium',
  },
  subtitle: {
    padding: 8,
    paddingTop: 2,
    fontSize: 10,
    color: '#959595',
    fontFamily: 'msemibold',
    fontWeight: '600',
  },
  rating: {
    color: '#69D297',
    fontFamily:'mbold'
  },
});

