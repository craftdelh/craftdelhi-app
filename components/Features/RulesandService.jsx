import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Entypo } from '@expo/vector-icons';
import Card from '../../assets/images/cardicon.svg';

const RulesandService = ({ onClose }) => {
  return (
    <View style={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Service</Text>
        <TouchableOpacity onPress={onClose}>
          <Entypo name="cross" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Card and paragraph */}
      <View style={styles.infoRow}>
        <Card width={50} height={50} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoText}>
            Change of mind is not applicable as a Return for this product due to one or more the following reasons.
          </Text>
        </View>
      </View>

      {/* Reasons */}
      <View style={styles.reasonsWrapper}>
        {Array.from({ length: 5 }, (_, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text style={styles.reasonTitle}>Reason No {index + 1}</Text>
            <Text style={styles.reasonText}>
              Reason no {index + 1}: Lorem ipsum color lorem ipsum color lorem ipsum color
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RulesandService;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'mbold',
    fontSize: 18,
  },
  divider: {
    width: '100%',
    borderColor: '#ECF0FF',
    borderWidth: 1,
    marginTop: 10,
  },
  infoRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    fontFamily: 'mbold',
    fontSize: 14,
    color: 'black',
    lineHeight: 20,
  },
  reasonsWrapper: {
    marginTop: 20,
    marginBottom:100
  },
  reasonTitle: {
    fontFamily: 'mbold',
    fontSize: 14,
    color: 'black',
  },
  reasonText: {
    fontFamily: 'mregular',
    fontSize: 13,
    color: '#3A3A3A',
    lineHeight: 18,
    marginTop: 2,
  },
});
