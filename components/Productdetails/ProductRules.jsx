import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native';
import Delivery from '../../assets/images/delivery1.svg';
import Rating from '../../assets/images/rating.svg';
import Return from '../../assets/images/return.svg';
import { Entypo } from '@expo/vector-icons';

const ProductRules = () => {
  const guaranteedDate = new Date();
  guaranteedDate.setDate(guaranteedDate.getDate() + 10);
  const options = { day: 'numeric', month: 'short' };
  const guaranteedDateStr = guaranteedDate.toLocaleDateString('en-US', options);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);


  const onPressRule = (rule) => {
    console.log(`${rule} pressed`);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.ruleRow} onPress={() => onPressRule('Return Policy')}>
        <Return width={25} height={25} />
        <Text style={styles.ruleText}>14 days Easy return policy</Text>
        <Entypo name="chevron-right" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.ruleRow} onPress={() => onPressRule('Guarantee')}>
        <Delivery width={25} height={25} />
        
        <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.ruleText}>Guaranteed by {guaranteedDateStr}</Text>
            <Text style={styles.deliveryCharges}>
            Standard Delivery Charges{'   '} <Text style={styles.deliveryPrice}>₹150</Text>
            </Text>
        </View>

        <Entypo name="chevron-right" size={24} color="black" />
        </TouchableOpacity>


      <TouchableOpacity style={styles.ruleRow} onPress={() => onPressRule('Ratings & Reviews')}>
        <Rating width={25} height={25} />
        <Text style={styles.ruleText}>Ratings & Reviews</Text>
        <Entypo name="chevron-right" size={24} color="black" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ProductRules;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  ruleText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: 'black',
    fontFamily: 'mbold',
  },
  deliveryCharges: {
  fontSize: 14,
  color: 'gray',
  fontFamily: 'msemibold', 
  marginTop: 4,
},

deliveryPrice: {
  color: '#EE6F69',
  fontFamily: 'mbold', 
},

});
