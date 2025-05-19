import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useRef } from 'react'
import { router } from 'expo-router'
import { AntDesign, Feather } from '@expo/vector-icons'
import { useSelector } from 'react-redux'
import * as Animatable from 'react-native-animatable';
import ActionSheet from 'react-native-actions-sheet'

const reviews = [
  {
    id: '1',
    name: 'Rajesh Singh',
    date: '16 September 2024',
    initials: 'RA',
    color: '#D5F5E3',
    review: "Same as shown in picture baqi BSs Thora isy bnany mein mushkil hui thi lekin it’s very very amazing thing thank you so much delhi craft I’m satisfied ❤️❤️",
    rating: 4,
  },
  {
    id: '2',
    name: 'Mona Batra',
    date: '16 September 2024',
    initials: 'MB',
    color: '#FDEDEC',
    review: "Same as shown in picture baqi BSs Thora isy bnany mein mushkil hui thi lekin it’s very very amazing thing thank you so much delhi craft I’m satisfied ❤️❤️",
    rating: 3,
  },
  {
    id: '3',
    name: 'Jeetendra',
    date: '16 September 2024',
    initials: 'JE',
    color: '#EAF2F8',
    review: "Same as shown in picture baqi BSs Thora isy bnany mein mushkil hui thi lekin it’s very very amazing thing thank you so much delhi craft I’m satisfied ❤️❤️",
    rating: 2,
  },
  // Add more...
];

const ReviewCard = ({ item,index  }) => {
  return (
   <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 200} 
      useNativeDriver
      style={styles.card}
    >
      <View style={[styles.avatar, { backgroundColor: item.color }]}>
        <Text style={styles.avatarText}>{item.initials}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <Text style={styles.name}>{item.name}</Text>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <AntDesign
              key={i}
              name="star"
              size={16}
              color={i < item.rating ? '#27AE60' : '#BDC3C7'}
              style={{ marginRight: 2 }}
            />
          ))}
        </View>
        </View>
        <Text style={styles.date}>{item.date}</Text>
        
        <Text style={styles.review}>{item.review}</Text>
      </View>
     </Animatable.View>
  );
};

const ReviewSections = () => {
  const cart = useSelector(state => state.cart.cart);
  const cartCount = cart?.length ?? 0;
 

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={{ position: 'relative' }}>
          <Feather
            name="shopping-cart"
            size={22}
            color={cartCount > 0 ? 'green' : 'black'}
          />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <ReviewCard item={item} index={index} />}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ReviewSections;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#4E9C70',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#333',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  review: {
    fontSize: 13,
    color: '#333',
  },
});
