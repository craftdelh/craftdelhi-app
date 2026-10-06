import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useFocusEffect } from 'expo-router';
import ActionSheet from 'react-native-actions-sheet';

const ProductDelivery = () => {
  const [savedAddress, setSavedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const actionSheetRef = React.useRef(null);

  useFocusEffect(
    useCallback(() => {
      const fetchAddress = async () => {
      try {
        setLoading(true);
        const userStr = await AsyncStorage.getItem('user');
        if (!userStr) {
          setIsLoggedIn(false);
          return;
        }
        
        const user = JSON.parse(userStr);
        if (!user.token) {
          setIsLoggedIn(false);
          return;
        }
        
        setIsLoggedIn(true);
        const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}useraddress/get`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (res.data?.status && res.data?.data?.length > 0) {
          const addresses = res.data.data;
          const savedSelectedId = await AsyncStorage.getItem('@selected_address_id');
          
          if (savedSelectedId) {
            const selectedAddr = addresses.find(a => a.id === Number(savedSelectedId));
            if (selectedAddr) {
              setSavedAddress(selectedAddr);
            } else {
              setSavedAddress(addresses[0]);
            }
          } else {
            setSavedAddress(addresses[0]);
          }
        } else {
          setSavedAddress(null);
        }
      } catch (err) {
        console.error("Error fetching address in delivery component:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, []));

  const [deliveryDate, setDeliveryDate] = useState("Calculating...");
  const [deliveryCost, setDeliveryCost] = useState("-");
  const [pincodeLoading, setPincodeLoading] = useState(false);

  React.useEffect(() => {
    const calculateDelivery = async () => {
      if (!savedAddress || !savedAddress.postal_code) {
        setDeliveryDate("Select an address for estimate");
        setDeliveryCost("-");
        return;
      }
      setPincodeLoading(true);
      try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${savedAddress.postal_code}`);
        if (response.data && response.data[0].Status === "Success") {
          const state = response.data[0].PostOffice[0].State;
          
          const today = new Date();
          let daysToAdd = 5;
          let cost = 120;
          
          if (state.toLowerCase().includes("delhi") || state.toLowerCase().includes("haryana") || state.toLowerCase().includes("uttar pradesh")) {
            daysToAdd = 2;
            cost = 50;
          }
          
          const minDate = new Date(today);
          minDate.setDate(today.getDate() + daysToAdd);
          const maxDate = new Date(today);
          maxDate.setDate(today.getDate() + daysToAdd + 2);
          
          const options = { day: 'numeric', month: 'short' };
          const minD = minDate.toLocaleDateString('en-IN', options);
          const maxD = maxDate.toLocaleDateString('en-IN', options);
          
          setDeliveryDate(`Guaranteed by ${minD.split(' ')[0]}-${maxD}`);
          setDeliveryCost(`₹${cost}`);
        } else {
          setDeliveryDate("Delivery not available to this pincode");
          setDeliveryCost("-");
        }
      } catch (err) {
        setDeliveryDate("Unable to estimate");
        setDeliveryCost("-");
      } finally {
        setPincodeLoading(false);
      }
    };
    calculateDelivery();
  }, [savedAddress]);

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.sectionTitle}>Delivery Options</Text>
      
      <View style={styles.row}>
        <Feather name="map-pin" size={18} color="black" style={styles.icon} />
        <View style={styles.textContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#024a63" style={{ alignSelf: 'flex-start' }} />
          ) : (
            <Text style={styles.mainText}>
              {savedAddress
                ? `${savedAddress.street}, ${savedAddress.city}, ${savedAddress.state}, ${savedAddress.country} - ${savedAddress.postal_code}`
                : "Enter Your Address"}
            </Text>
          )}
          <TouchableOpacity onPress={() => { 
            if (!isLoggedIn) {
              router.push('/auth/Signin'); 
            } else {
              router.push('/profile/DeliveryAddress');
            }
          }}>
            <Text style={styles.linkText}>{savedAddress ? "Change Address" : "Add Address"}</Text>
          </TouchableOpacity>
          {!isLoggedIn && !loading && (
            <Text style={styles.loginWarningText}>* Please login first</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Standard Delivery</Text>
      
      <View style={styles.row}>
        <Ionicons name="car-outline" size={20} color="black" style={styles.icon} />
        <View style={styles.textContainerRow}>
          {pincodeLoading ? (
            <ActivityIndicator size="small" color="#024a63" />
          ) : (
            <>
              <Text style={styles.mainText}>{deliveryDate}</Text>
              <Text style={styles.priceText}>{deliveryCost}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Return & Warranty</Text>
      
      <View style={styles.row}>
        <Ionicons name="return-down-back-outline" size={20} color="black" style={styles.icon} />
        <View style={styles.textContainerRow}>
          <Text style={styles.mainText}>14 Days easy Return</Text>
          <TouchableOpacity onPress={() => actionSheetRef.current?.show()}>
            <Ionicons name="information-circle-outline" size={22} color="#024a63" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.row, { marginTop: 12 }]}>
        <Ionicons name="shield-checkmark-outline" size={20} color="black" style={styles.icon} />
        <View style={styles.textContainerRow}>
          <Text style={styles.mainText}>Warranty not available</Text>
        </View>
      </View>

      <ActionSheet ref={actionSheetRef} containerStyle={styles.actionSheetContainer}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Return Policy</Text>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" style={styles.ruleIcon} />
            <Text style={styles.ruleText}>Item must be unused, unwashed, and in original condition.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="pricetag" size={20} color="#2ecc71" style={styles.ruleIcon} />
            <Text style={styles.ruleText}>All original tags and packaging must remain intact.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="calendar" size={20} color="#2ecc71" style={styles.ruleIcon} />
            <Text style={styles.ruleText}>Return request must be raised within 14 days of delivery.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="card" size={20} color="#2ecc71" style={styles.ruleIcon} />
            <Text style={styles.ruleText}>Refunds will be processed within 5-7 business days after pickup.</Text>
          </View>
          <TouchableOpacity style={styles.closeSheetBtn} onPress={() => actionSheetRef.current?.hide()}>
            <Text style={styles.closeSheetText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

    </View>
  );
};

export default ProductDelivery;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecf0ff',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    opacity: 0.6,
  },
  textContainer: {
    flex: 1,
  },
  textContainerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#2d53d8',
    fontWeight: '600',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#d9d9d9',
    marginVertical: 12,
  },
  loginWarningText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  actionSheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  sheetContent: {
    padding: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'mbold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 20,
  },
  ruleIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  ruleText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    fontFamily: 'Montserrat',
  },
  closeSheetBtn: {
    backgroundColor: '#024a63',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeSheetText: {
    color: 'white',
    fontFamily: 'mbold',
    fontSize: 16,
  },
});
