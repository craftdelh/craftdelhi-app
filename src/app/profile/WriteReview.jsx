import {
  StyleSheet, Text, View, Image, TextInput,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { ScrollView } from 'react-native-actions-sheet';
import React, { useState, useEffect } from 'react';
import { Ionicons, Entypo, Feather, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const WriteReview = ({ order, onClose }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const generateReviewSuggestion = (currentRating, title) => {
    if (!currentRating) return "Please select a rating first.";

    const good = [
      `Absolutely loved the ${title}! Great quality and totally worth it.`,
      `Really happy with this ${title}. Met my expectations.`,
      `Nice product. ${title} looks exactly like shown.`,
    ];

    const mid = [
      `The ${title} is decent, but could be better.`,
      `Average experience with this ${title}.`,
      `Okay product, improvement needed.`,
    ];

    const bad = [
      `Not satisfied with the ${title}. Quality was below expectations.`,
      `Had a bad experience with this ${title}.`,
      `The ${title} did not meet my expectations.`,
    ];

    if (currentRating >= 4) return good[Math.floor(Math.random() * good.length)];
    if (currentRating === 3) return mid[Math.floor(Math.random() * mid.length)];
    return bad[Math.floor(Math.random() * bad.length)];
  };

  // Auto-fill review on rating change if text is empty
  useEffect(() => {
    if (rating > 0 && !reviewText && order?.productTitle) {
      setReviewText(generateReviewSuggestion(rating, order?.productTitle));
    }
  }, [rating]);

  const handleSuggestReview = () => {
    if (rating > 0) {
      setReviewText(generateReviewSuggestion(rating, order?.productTitle || 'product'));
    } else {
      Toast.show({ type: 'info', text1: 'Rating required', text2: 'Please select a rating first.' });
    }
  };

  const handleSubmit = async () => {
    if (!rating) {
      Toast.show({ type: 'error', text1: 'Rating required', text2: 'Please select a rating first ⭐' });
      return;
    }

    const productId = order?.items?.[0]?.product_id;
    if (!productId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Product ID not found' });
      return;
    }

    try {
      setSubmittingReview(true);
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.token) {
        Toast.show({ type: 'error', text1: 'Auth Error', text2: 'Please login first' });
        return;
      }

      const payload = {
        type: "product",
        target_id: productId,
        rating: rating,
        description: reviewText || "",
      };

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}reviews/add`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.status) {
        Toast.show({ type: 'success', text1: 'Success ✅', text2: 'Review submitted successfully!' });
        setRating(0);
        setReviewText("");
        onClose?.();
      } else {
        Toast.show({ type: 'error', text1: 'Failed', text2: res.data?.message || 'Failed to submit review' });
      }
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 409) {
        Toast.show({ type: 'info', text1: 'Duplicate', text2: 'You have already reviewed this item ⭐' });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: err?.response?.data?.message || 'Something went wrong' });
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const firstItem = order?.items && order.items.length > 0 ? order.items[0] : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rate & Review Product</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Entypo name="cross" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.productBox}>
        {order?.image ? (
          <Image source={{ uri: order.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
            <Feather name="image" size={24} color="#999" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {firstItem ? firstItem.product_name : order?.productTitle}
          </Text>
          <Text style={styles.price}>{order?.price}</Text>
        </View>
      </View>

      {/* Star Rating */}
      <View style={styles.starscontainer}>
        <Text style={styles.starsTitle}>Select Stars</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <Ionicons
                name={i <= rating ? 'star' : 'star-outline'}
                size={34}
                color={i <= rating ? '#fbbf24' : '#d1d5db'}
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Review Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputHeader}>
          <Text style={styles.inputTitle}>Your Review</Text>
          <TouchableOpacity onPress={handleSuggestReview} style={styles.suggestBtn}>
            <Text style={styles.suggestBtnText}>Suggest a review ✨</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={4}
          value={reviewText}
          onChangeText={setReviewText}
          placeholder="Write your review here..."
          textAlignVertical="top"
        />
      </View>

      {/* Submit Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submittingReview}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: submittingReview ? '#94a3b8' : '#024a63' }]}
          onPress={handleSubmit}
          disabled={submittingReview}
        >
          {submittingReview ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default WriteReview;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#024a63',
  },
  closeBtn: {
    padding: 4,
  },
  productBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
  },
  productTitle: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#334155',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#000',
  },
  starscontainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starsTitle: {
    fontSize: 15,
    fontFamily: 'mbold',
    color: '#334155',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  starIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  inputTitle: {
    fontSize: 13,
    fontFamily: 'mbold',
    color: '#64748b',
  },
  suggestBtn: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  suggestBtnText: {
    fontSize: 11,
    fontFamily: 'mbold',
    color: '#0284c7',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    height: 120,
    fontSize: 14,
    fontFamily: 'Montserrat',
    backgroundColor: '#f8fafc',
    color: '#334155',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#64748b',
  },
  submitBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#fff',
  },
});
