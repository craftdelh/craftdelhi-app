import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

const MyCarousel = ({ initialCategories = [] }) => {
  const seededCategories = initialCategories.filter((item) => item.status === 1).slice(0, 5);
  const [categories, setCategories] = useState(seededCategories);
  const [loading, setLoading] = useState(!seededCategories.length);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollTimerRef = useRef(null);

  useEffect(() => {
    if (!seededCategories.length) {
      fetchCategories();
    }
  }, [seededCategories.length]);

  // Auto-play logic
  useEffect(() => {
    if (categories.length > 1) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [categories, currentIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    scrollTimerRef.current = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= categories.length) {
        nextIndex = 0; // Loop back to the start
      }
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 3000); // 3 seconds interval
  };

  const stopAutoPlay = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}gift-categories/get`);
      if (response.data.success) {
        const activeData = response.data.data
          .filter((item) => item.status === 1)
          .slice(0, 5);
        setCategories(activeData);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { height: 180, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#EE6F69" />
      </View>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.imageWrapper}
      activeOpacity={0.9}
      onPress={() => {
        router.push({
          pathname: '/ProductCategories',
          params: { category: item.slug || item.id, name: item.title || item.name, isGift: 'true' }
        });
      }}
    >
      <View style={styles.cardInner}>
        <Image 
          source={{ uri: item.gift_image?.full || item.gift_image?.thumbnail || (typeof item.gift_image === 'string' ? item.gift_image : '') }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={styles.textOverlay}>
          <Animatable.Text 
            animation={currentIndex === index ? 'fadeInUp' : undefined} 
            duration={500}
            style={styles.imageTitle}
          >
            {item.title || item.name}
          </Animatable.Text>
          <Animatable.Text 
            animation={currentIndex === index ? 'fadeInUp' : undefined} 
            duration={500}
            delay={100}
            style={styles.imageSubtitle} 
            numberOfLines={2}
          >
            {item.description}
          </Animatable.Text>
          <Animatable.Text 
            animation={currentIndex === index ? 'fadeInUp' : undefined} 
            duration={500}
            delay={200}
            style={styles.linkText}
          >
            View Products
          </Animatable.Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        scrollEventThrottle={16}
        bounces={false}
      />

      {categories.length > 1 && (
        <View style={styles.paginationContainer}>
          {categories.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                currentIndex === index && styles.activeDot
              ]} 
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    width: screenWidth,
    height: 180,
    paddingHorizontal: 15,
  },
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 15,           
    left: 15,
    paddingRight: 15,
    maxWidth: '90%',
  },
  imageTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily:'mbold',
    marginBottom: 2,
  },
  imageSubtitle: {
    color: 'white',
    fontSize: 12,
    fontFamily:'mmedium',
    marginBottom: 6,
    opacity: 0.9,
  },
  linkText: {
    color: '#ffcc00',
    fontSize: 13,
    fontFamily: 'mbold',
    textDecorationLine: 'underline',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#EE6F69',
    width: 20,
  },
});

export default MyCarousel;
