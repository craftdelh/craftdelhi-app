import { StyleSheet, Text, View, FlatList, Dimensions } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';

const { height: screenHeight } = Dimensions.get('window');

const ReviewCard = ({ name, date, message, isVisible, index }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const content = (
    <View style={styles.reviewBox}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.reviewContent}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );

  return isVisible ? (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 150}
      useNativeDriver
    >
      {content}
    </Animatable.View>
  ) : (
    <View>{content}</View>
  );
};

const ProductReview = ({ scrollY }) => {
  const [isInView, setIsInView] = useState(false);
  const viewRef = useRef(null);
  const [viewPositionY, setViewPositionY] = useState(0);

  const reviews = [
    {
      name: 'Rajesh Singh',
      date: '16 September 2024',
      message:
        "Same as shown in picture baqi BSs Thora isy bnany mein mushkil hui thi lkin it’s very very amazing thing thank you so much delhi craft I’m satisfied ❤️❤️",
    },
    {
      name: 'Rajesh Singh',
      date: '16 September 2024',
      message:
        "Same as shown in picture baqi BSs Thora isy bnany mein mushkil hui thi lkin it’s very very amazing thing thank you so much delhi craft I’m satisfied ❤️❤️",
    },
    {
      name: 'Rajesh Singh',
      date: '16 September 2024',
      message:
        "Same as shown in picture baqi BSs Thora isy bnany mein mushkil hui thi lkin it’s very very amazing thing thank you so much delhi craft I’m satisfied ❤️❤️",
    },
  ];

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      if (
        viewPositionY &&
        value + screenHeight > viewPositionY + 100 // triggers slightly before it's fully in view
      ) {
        setIsInView(true);
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [viewPositionY]);

  return (
    <View
      ref={viewRef}
      onLayout={(e) => setViewPositionY(e.nativeEvent.layout.y)}
      style={{ padding: 20 ,paddingTop:-10}}
    >
      <FlatList
        data={reviews}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <ReviewCard
            {...item}
            index={index}
            isVisible={isInView}
          />
        )}
      />
    </View>
  );
};

export default ProductReview;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  reviewBox: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7BAF88',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewContent: {
    flex: 1,
  },
  name: {
    color: '#36324F',
    fontSize: 15,
    fontWeight: 'bold',
  },
  date: {
    color: '#A4A4A4',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'msemibold',
  },
  message: {
    color: '#000',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'msemibold',
  },
});
