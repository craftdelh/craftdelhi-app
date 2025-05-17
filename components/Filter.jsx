import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const Filter = ({
  selectedRating,
  setSelectedRating,
  selectedAvailability,
  setSelectedAvailability,
  selectedSort,
  setSelectedSort,
  selectedPrice,
  setSelectedPrice,
  toggles,
  setToggles,
  onApply,
  onReset,
}) => {
  const ratings = [4, 3, 2, 1];
  const availabilityOptions = ['In Stock', 'Out of Stock'];
  const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Rating', 'Newest'];
  const priceRanges = ['Under Rs 100', 'Rs 100 - 300', 'Rs 300 - 500', 'Above Rs 500'];
  const shippingOptions = ['Free Shipping', 'Discounted Items'];

  return (
    <ScrollView style={styles.container}>
      {/* Sort By */}
      <Text style={styles.heading}>Sort By</Text>
      <View style={styles.optionsRow}>
        {sortOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionBox,
              selectedSort === option && styles.selectedOption,
            ]}
            onPress={() => setSelectedSort(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedSort === option && styles.selectedText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ratings */}
      <Text style={styles.heading}>Ratings</Text>
      <View style={styles.optionsRow}>
        {ratings.map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.optionBox,
              selectedRating === r && styles.selectedOption,
            ]}
            onPress={() => setSelectedRating(r)}
          >
            <Text
              style={[
                styles.optionText,
                selectedRating === r && styles.selectedText,
              ]}
            >
              {r}★ & above
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Availability */}
      <Text style={styles.heading}>Availability</Text>
      <View style={styles.optionsRow}>
        {availabilityOptions.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionBox,
              selectedAvailability === opt && styles.selectedOption,
            ]}
            onPress={() => setSelectedAvailability(opt)}
          >
            <Text
              style={[
                styles.optionText,
                selectedAvailability === opt && styles.selectedText,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Price Range */}
      <Text style={styles.heading}>Price Range</Text>
      <View style={styles.optionsRow}>
        {priceRanges.map((range, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionBox,
              selectedPrice === range && styles.selectedOption,
            ]}
            onPress={() => setSelectedPrice(range)}
          >
            <Text
              style={[
                styles.optionText,
                selectedPrice === range && styles.selectedText,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Extra Filters */}
      <Text style={styles.heading}>More Filters</Text>
      <View style={styles.optionsRow}>
        {shippingOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionBox,
              toggles.includes(option) && styles.selectedOption,
            ]}
            onPress={() => {
              setToggles((prev) =>
                prev.includes(option)
                  ? prev.filter((o) => o !== option)
                  : [...prev, option]
              );
            }}
          >
            <Text
              style={[
                styles.optionText,
                toggles.includes(option) && styles.selectedText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetText}>Reset Filters</Text>
      </TouchableOpacity>

      {/* Apply Button */}
      <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
        <Text style={styles.applyText}>Apply Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Filter;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 16,
    fontFamily: 'mbold',
    marginBottom: 10,
    color: '#024A63',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  optionBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedOption: {
    backgroundColor: '#024A63',
    borderColor: '#024A63',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'msemibold',
  },
  selectedText: {
    color: 'white',
  },
  resetBtn: {
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#024A63',
    alignItems: 'center',
  },
  resetText: {
    color: '#024A63',
    fontFamily: 'mbold',
    fontSize: 15,
  },
  applyBtn: {
    backgroundColor: '#024A63',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  applyText: {
    color: 'white',
    fontFamily: 'mbold',
    fontSize: 16,
  },
});
