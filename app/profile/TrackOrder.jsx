import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const TrackOrder = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.centerBlock}>
        <Image source={{ uri: order.image }} style={{ width: 100, height: 100, borderRadius: 10 }} />
        <Text style={styles.productTitle}>{order.productTitle}</Text>
      </View>

      <View style={styles.centerBlock}>
        <Ionicons name="calendar-outline" size={50} color="#024A63" />
        <Text style={styles.etaText}>Estimated Delivery</Text>
        <Text style={styles.date}>25 June 2025</Text>
      </View>

      {/* Status Info */}
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Order ID:</Text>
        <Text style={styles.infoValue}>#{order.id}</Text>

        <Text style={styles.infoLabel}>Price:</Text>
        <Text style={styles.infoValue}>{order.price}</Text>

        <Text style={styles.infoLabel}>Status:</Text>
        <Text style={styles.infoValue}>{order.status}</Text>
      </View>

      <Image source={require('../../assets/images/delivery.gif')}  style={{width:'100%',height:100,marginTop:10}} />

      {/* Track Order Button */}
      <TouchableOpacity style={styles.trackBtn}>
        <Text style={styles.trackText}>Track Order</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TrackOrder;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft:20
  },
  centerBlock: {
    alignItems: 'center',
    marginTop: 30,
  },
  etaText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#024A63',
    marginTop: 4,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  infoBlock: {
    marginTop: 30,
    paddingHorizontal: 30,
  },
  infoLabel: {
    color: '#999',
    fontSize: 14,
    marginTop: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  trackBtn: {
    marginTop: 40,
    alignSelf: 'center',
    backgroundColor: '#024A63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  trackText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
