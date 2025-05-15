import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import * as Animatable from 'react-native-animatable';

const Justforyou = () => {
  const [visibleItems, setVisibleItems] = useState([]);
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setVisibleItems(viewableItems.map((vi) => vi.item.id));
  });

  const products = [
    {
      id: '1',
      title: 'Handmade Paper Gift',
      price: '₹ 1,000.00',
      image: require('../../assets/images/image1.png'),
      orders: 1059,
      rating: 4.9,
    },
    {
      id: '2',
      title: 'Printed Journal Set',
      price: '₹ 850.00',
      image: require('../../assets/images/image2.png'),
      orders: 720,
      rating: 4.7,
    },
    {
      id: '3',
      title: 'DIY Craft Kit',
      price: '₹ 599.00',
      image: require('../../assets/images/image3.jpg'),
      orders: 430,
      rating: 4.5,
    },
    {
      id: '4',
      title: 'Decor Wall Frame',
      price: '₹ 1,299.00',
      image: require('../../assets/images/image1.png'),
      orders: 1340,
      rating: 4.8,
    },
    {
      id: '5',
      title: 'Cute Stationery Pack',
      price: '₹ 450.00',
      image: require('../../assets/images/image2.png'),
      orders: 890,
      rating: 4.6,
    },
    {
      id: '6',
      title: 'Personalized Gift Set',
      price: '₹ 1,100.00',
      image: require('../../assets/images/image3.jpg'),
      orders: 1500,
      rating: 5.0,
    },
  ];

  const renderItem = ({ item, index }) => {
    const isVisible = visibleItems.includes(item.id);

    const CardContent = (
      <TouchableOpacity activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
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

    return isVisible ? (
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        delay={index * 100} 
        style={styles.card}
        useNativeDriver
      >
        {CardContent}
      </Animatable.View>
    ) : (
      <View style={styles.card}>{CardContent}</View>
    );
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#fff' }}>
      <Text style={styles.heading}>Just For You</Text>
      <Text style={styles.subText}>
        Discover unique, handcrafted delights, Crafted with passion, sold with honor. Delhi's finest crafts, made just for you.
      </Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ marginTop: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={false}
      />
    </View>
  );
};

export default Justforyou;

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'mbold',
    color: '#000',
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#959595',
    fontFamily: 'msemibold',
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
