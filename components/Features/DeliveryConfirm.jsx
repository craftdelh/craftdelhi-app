import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { Entypo, Feather } from '@expo/vector-icons';

const addresses = [
  {
    id: 1,
    label: 'Mumbai Delhi, Maharashtra',
    detail: 'Bn 96, Shalimar Bagh (W)',
  },
  {
    id: 2,
    label: 'Delhi NCR, India',
    detail: 'Street 34, Rohini Sector 11',
  },
  {
    id: 3,
    label: 'Bangalore, Karnataka',
    detail: 'JP Nagar, 4th Phase',
  },
];

const DeliveryConfirm = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState(1);
  const [showAddressList, setShowAddressList] = useState(false);

  const selectedAddress = addresses.find((addr) => addr.id === selectedId);

  const getDateRange = () => {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);
  startDate.setDate(today.getDate() + 1);     
  endDate.setDate(today.getDate() + 10);      

  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedEnd = endDate.toLocaleDateString('en-US', options);   

  return`Guaranteed by ${formattedEnd}`;
};


  return (
    <View style={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Delivery Options</Text>
        <TouchableOpacity onPress={onClose}>
          <Entypo name="cross" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Deliver To */}
      <View style={styles.addressContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="map-pin" size={16} color="#000" />
          <Text style={styles.addressLabel}>  Deliver to</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddressList(!showAddressList)}>
          <Text style={styles.changeAddress}>Change Address</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.addressMain}>{selectedAddress.label}</Text>
      <Text style={styles.addressSub}>{selectedAddress.detail}</Text>

      {/* Address List */}
      {showAddressList && (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          style={{ marginTop: 15 }}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedId;
            return (
              <TouchableOpacity
                style={[styles.addressBox, isSelected && styles.selectedBox]}
                onPress={() => {
                  setSelectedId(item.id);
                  setShowAddressList(false); // optional: auto hide list
                }}
              >
                <Text style={styles.addressLabel}>{item.label}</Text>
                <Text style={styles.addressSub}>{item.detail}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={styles.divider} />

      {/* Delivery Fee */}
      <View style={{ marginTop: 20,marginBottom:50 }}>
        <Text style={{ fontFamily: 'mbold', fontSize: 16 }}>Delivery Fee</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
          <Text style={{ fontFamily: 'msemibold', fontSize: 16 }}>Standard Delivery</Text>
          <Text style={{ color: '#EE6F69', fontFamily: 'mbold' }}>Rs 150</Text>
        </View>
        <Text style={{ marginTop: 10, fontFamily: 'mbold', fontSize: 13, color: 'black' }}>
         {getDateRange()}
        </Text>
      </View>
    </View>
  );
};

export default DeliveryConfirm;

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
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontFamily: 'mbold',
    color: '#000',
  },
  changeAddress: {
    fontSize: 13,
    fontFamily: 'mbold',
    color: '#5C78FF',
    textDecorationLine: 'underline',
  },
  addressMain: {
    fontSize: 14,
    fontFamily: 'mregular',
    marginTop: 5,
    color: '#000',
  },
  addressSub: {
    fontSize: 13,
    fontFamily: 'mregular',
    color: '#555',
  },
  addressBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedBox: {
    borderColor: 'green',
    backgroundColor: '#f0fff0',
  },
});
