import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import image1 from '../../assets/images/image1.png';
import image2 from '../../assets/images/image2.png';
import image3 from '../../assets/images/image3.jpg';

const images = [image1, image2, image3];

const titles = [
  'Friendship Gift Boxes',
  'Friendship Gift Boxes',
  'Friendship Gift Boxes',
];

const subtitles = [
  'Read More',
  'Read More',
  'Read More',
];

const screenWidth = Dimensions.get('window').width;
const DOT_SIZE = 10;
const DOT_MARGIN = 6;
const DOT_SPACING = DOT_SIZE + DOT_MARGIN;

const MyCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const dotTranslateX = useRef(new Animated.Value(0)).current;

  const moveIndicator = (index) => {
    setCurrentIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });

    Animated.spring(dotTranslateX, {
      toValue: index * DOT_SPACING,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop
        width={screenWidth}
        height={220}
        autoPlay={true}
        autoPlayInterval={3000}
        autoplayDelay={1000}
        data={images}
        onSnapToItem={moveIndicator}
        renderItem={({ item, index }) => (
          <View style={styles.imageWrapper}>
            <Image source={item} style={styles.image} resizeMode="cover" />
            <View style={styles.textOverlay}>
              <Text style={styles.imageTitle}>{titles[index]}</Text>
              <Text style={styles.imageSubtitle}>{subtitles[index]}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.paginationContainer}>
        {images.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => moveIndicator(index)}>
            <View style={styles.dot} />
          </TouchableOpacity>
        ))}

        <Animated.View
          style={[
            styles.activeDot,
            { transform: [{ translateX: dotTranslateX }] },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    width: '94%',
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
 textOverlay: {
  position: 'absolute',
  top: 10,           
  left: 10,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 6,
  maxWidth: '90%', 
},


  imageTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily:'mbold'
  },
  imageSubtitle: {
    color: 'white',
    fontSize: 13,
    marginTop: 2,
    fontFamily:'mmedium'
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderColor: 'gray',
    marginHorizontal: DOT_MARGIN / 2,
    borderWidth: 1,
  },
  activeDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#EE6F69',
    position: 'absolute',
    left: 3,
  },
});

export default MyCarousel;
