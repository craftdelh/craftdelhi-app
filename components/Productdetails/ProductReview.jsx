import { StyleSheet, Text, View, FlatList, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: screenHeight } = Dimensions.get('window');

const ReviewCard = ({ name, date, message, rating, isVisible, index }) => {
  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const content = (
    <View style={styles.reviewBox}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>{rating}</Text>
            <Ionicons name="star" size={10} color="#fff" />
          </View>
        </View>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );

  return isVisible ? (
    <Animatable.View animation="fadeInUp" duration={500} delay={index * 150} useNativeDriver>
      {content}
    </Animatable.View>
  ) : (
    <View>{content}</View>
  );
};

const ProductReview = ({ scrollY, product }) => {
  const [isInView, setIsInView] = useState(false);
  const viewRef = useRef(null);
  const [viewPositionY, setViewPositionY] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;
      try {
        setLoading(true);
        const userStr = await AsyncStorage.getItem('user');
        let headers = {};
        if (userStr) {
          const user = JSON.parse(userStr);
          headers = { Authorization: `Bearer ${user.token}` };
        }
        
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}reviews/getbyproductid/${product.id}?type=product`,
          { headers }
        );
        if (res.data?.status) {
          setReviews(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [product?.id]);

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      if (viewPositionY && value + screenHeight > viewPositionY + 100) {
        setIsInView(true);
      }
    });
    return () => {
      scrollY.removeListener(listener);
    };
  }, [viewPositionY]);

  const ratingCount = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (map[r.rating] !== undefined) map[r.rating]++;
    });
    return map;
  }, [reviews]);

  const filteredReviews = selectedFilter === 'All'
    ? reviews
    : reviews.filter((r) => r.rating === Number(selectedFilter));

  const avgRating = product?.rating || (reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0.0');
  const totalReviews = product?.total_review || reviews.length;

  return (
    <View style={styles.container} ref={viewRef} onLayout={(e) => setViewPositionY(e.nativeEvent.layout.y)}>
      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        <Text style={styles.subtitle}>Verified buyers share their experience</Text>
        
        <View style={styles.ratingSummary}>
          <Text style={styles.bigRating}>{avgRating}</Text>
          <View style={styles.starsColumn}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name={parseFloat(avgRating) >= star ? "star" : (parseFloat(avgRating) >= star - 0.5 ? "star-half" : "star-outline")} 
                  size={16} 
                  color={parseFloat(avgRating) > 0 ? "#22c55e" : "#d1d5db"} 
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
            <Text style={styles.basedOnText}>Based on {totalReviews} reviews</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {['All', '5', '4', '3', '2', '1'].map((filter) => {
            const isActive = selectedFilter === filter;
            const count = filter === 'All' ? reviews.length : ratingCount[filter];
            return (
              <TouchableOpacity 
                key={filter}
                style={isActive ? styles.filterChipActive : styles.filterChip}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={isActive ? styles.filterTextActive : styles.filterText}>
                  {filter === 'All' ? 'All' : `${filter}★`} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#024a63" style={{ marginVertical: 30 }} />
        ) : filteredReviews.length > 0 ? (
          <FlatList
            data={filteredReviews}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => {
              const name = `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'User';
              const dateStr = item.created_at 
                ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '';
                
              return (
                <ReviewCard 
                  name={name}
                  date={dateStr}
                  message={item.description}
                  rating={item.rating}
                  index={index} 
                  isVisible={isInView} 
                />
              );
            }}
          />
        ) : (
          <View style={styles.noReviews}>
            <Text style={styles.noReviewsText}>No reviews found.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProductReview;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    marginBottom: 24,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecf0ff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 20,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  bigRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 16,
  },
  starsColumn: {
    justifyContent: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  basedOnText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: '#024a63',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterTextActive: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noReviewsText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  reviewBox: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fd',
    borderRadius: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#024a63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  date: {
    color: '#6b7280',
    fontSize: 11,
    marginBottom: 6,
  },
  message: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 20,
  },
});
