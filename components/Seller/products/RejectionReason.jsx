import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

const RejectionReason = ({ product, onClose }) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Rejection Reason</Text>
      <View style={styles.divider} />

      {/* Top Message */}
      <View style={styles.center}>
        <Text style={styles.topText}>
          <Text style={styles.blueText}>This product is violating Craft Delhi{"\n"}</Text>
          <Text style={styles.redText}>term & conditions !</Text>
        </Text>
        <Text style={styles.subText}>
          Please see violation details and edit the product based on our suggestions.
        </Text>
      </View>

      {/* Product Image & ID Block */}
      <View style={styles.row}>
        {/* Image Block */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>PRODUCT IMAGE</Text>
          </View>
          <View style={styles.cardBody}>
            <Image source={{ uri: product.image }} style={styles.image} />
          </View>
        </View>

        {/* Product ID Block */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>PRODUCT ID</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardBodyText}>{product.id}</Text>
          </View>
        </View>
      </View>

      {/* Product Name */}
      <View style={styles.infoCardFull}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>PRODUCT NAME</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardBodyText}>{product.name}</Text>
        </View>
      </View>

      {/* Violation Details */}
      <View style={styles.infoCardFull}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>VIOLATION DETAILS</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardBodyText}>
            Images uploaded do not meet the quality standards or show incorrect product angles.
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Edit Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default RejectionReason

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D9',
    borderWidth: 1,
    shadowColor: '#fff',
    shadowOpacity: 0.25,
    shadowRadius: 30,
  },
  title: {
    fontFamily: 'mbold',
    fontSize: 16,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginBottom: 15,
  },
  center: {
    alignItems: 'center',
    marginBottom: 20,
  },
  topText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'mbold',
  },
  blueText: {
    color: '#024A63',
  },
  redText: {
    color: '#EE6F69',
  },
  subText: {
    fontFamily: 'msemibold',
    fontSize: 14,
    color: '#024A63',
    textAlign: 'center',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  infoCard: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  infoCardFull: {
    marginBottom: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#36234E',
    padding: 12,
  },
  cardHeaderText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'mbold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  cardBody: {
    backgroundColor: '#FCFCFC',
    padding: 12,
  },
  cardBodyText: {
    fontSize: 10,
    fontFamily: 'mregular',
    color: '#000',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#BBBBBB',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#151618',
    fontSize: 14,
    fontFamily: 'msemibold',
  },
  editButton: {
    backgroundColor: '#024A63',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  editText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'msemibold',
  },
})
