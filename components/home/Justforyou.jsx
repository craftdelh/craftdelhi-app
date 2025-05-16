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
import { router } from 'expo-router';

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
    oldPrice: '₹ 1,200.00',
    image: 'https://www.papertree.co.uk/wp-content/uploads/2022/03/luxury-mothers-day-card-1100x1100.jpg',
    orders: 1059,
    rating: 4.9,
    description: 'A luxurious handmade paper greeting card perfect for special occasions like Mother’s Day or birthdays.'
  },
  {
    id: '2',
    title: 'Printed Journal Set',
    price: '₹ 850.00',
    oldPrice: '₹ 999.00',
    image: 'https://okhai.org/cdn/shop/files/EKA6-ELEPHANTMOTIF_1.png?v=1727331507',
    orders: 720,
    rating: 4.7,
    description: 'Beautifully printed journal set with traditional motifs—ideal for daily journaling, gifting, or personal use.'
  },
  {
    id: '3',
    title: 'DIY Craft Kit',
    price: '₹ 599.00',
    oldPrice: '₹ 749.00',
    image: 'https://d35l77wxi0xou3.cloudfront.net/opencart/image/productFromFeb2020/POTLI%20DIY%20Craft%20Kit%20(%204%20Year%20-%2012%20Year)%20Block%20Print%20Your%20T-Shirt%20(Elephant)1599206113-600x600.jpg',
    orders: 430,
    rating: 4.5,
    description: 'Fun and creative DIY kit for kids to block print their own T-shirt. Encourages creativity and hands-on learning.'
  },
  {
    id: '4',
    title: 'Decor Wall Frame',
    price: '₹ 1,299.00',
    oldPrice: '₹ 1,499.00',
    image: 'https://tangyoak.com/cdn/shop/products/4a_3d4aeecf-6ca2-4054-936d-5e2eb35ca7eb.jpg?v=1656494136',
    orders: 1340,
    rating: 4.8,
    description: 'Elegant and modern wall frame to enhance your room decor. Great for living rooms, offices, and galleries.'
  },
  {
    id: '5',
    title: 'Cute Stationery Pack',
    price: '₹ 450.00',
    oldPrice: '₹ 600.00',
    image: 'https://m.media-amazon.com/images/I/61DmMdPe-VL._AC_UF1000,1000_QL80_.jpg',
    orders: 890,
    rating: 4.6,
    description: 'Adorable stationery set with pens, sticky notes, and more—perfect for students, office workers, or gift lovers.'
  },
  {
    id: '6',
    title: 'Personalized Gift Set',
    price: '₹ 1,100.00',
    oldPrice: '₹ 1,299.00',
    image: 'https://shoppingsmart.in/cdn/shop/files/PersonalizedGiftSetHamperforWomen_3c11bc31-ac11-4ef9-a3ee-16963df166d6.jpg?v=1708356449&width=1946',
    orders: 1500,
    rating: 5.0,
    description: 'Stylish personalized gift hamper featuring curated items—ideal for birthdays, anniversaries, or festive gifting.'
  },
];



  const renderItem = ({ item, index }) => {
    const isVisible = visibleItems.includes(item.id);

    const CardContent = (
      <TouchableOpacity onPress={() => router.push({ pathname: '/ProductDetails', params: item })} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image source={{uri:item.image}} style={styles.image} />
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
