import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Animated,
} from 'react-native';

const categories = [
  { name: 'Handmade Paper', image: require('../../assets/images/image1.png') },
  { name: 'Printing', image: require('../../assets/images/image2.png') },
  { name: 'Craft Kits', image: require('../../assets/images/image3.jpg') },
  { name: 'Wall Art', image: require('../../assets/images/image1.png') },
  { name: 'Stationery', image: require('../../assets/images/image2.png') },
  { name: 'Gift Wrap', image: require('../../assets/images/image3.jpg') },
  { name: 'Personalized', image: require('../../assets/images/image1.png') },
];

const OurProducts = () => {
  const [showAll, setShowAll] = useState(false);
  const scrollXRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const visibleCategories = showAll ? categories : categories.slice(0, 6);

  const handleToggleShowAll = () => {
    setShowAll(prev => !prev);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (showAll && scrollXRef.current) {
      setTimeout(() => {
        scrollXRef.current.scrollToEnd({ animated: true });
      }, 100); // Slight delay for layout to render
    }
  }, [showAll]);

  return (
    <View style={{ padding: 20 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Our Products</Text>
        <TouchableOpacity onPress={handleToggleShowAll}>
          <Text style={styles.seeAllText}>
            {showAll ? 'Show Less' : 'See All Categories'}
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
        <ScrollView
          horizontal
          ref={scrollXRef}
          showsHorizontalScrollIndicator={false}
        >
          {visibleCategories.map((item, index) => (
            <TouchableOpacity key={index} style={styles.itemBox}>
              <Image source={item.image} style={styles.imageCircle} />
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default OurProducts;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'mbold',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#2E54D9',
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
});
