import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';

const BuyerInfo = () => {
  const [buyerName, setBuyerName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.sectionTitle}>Buyer Information :</Text>
      <View style={styles.divider} />

      {/* Buyer Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Buyer Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter buyer name"
          placeholderTextColor="#E0E4F4"
          value={buyerName}
          onChangeText={setBuyerName}
        />
      </View>

      {/* Email Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          placeholderTextColor="#E0E4F4"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Contact Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact number"
          placeholderTextColor="#E0E4F4"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
        />
      </View>

      {/* Buyer Notes */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Buyer Notes</Text>
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder="Write any special instructions here..."
            placeholderTextColor="#E0E4F4"
            multiline
            maxLength={300}
            value={buyerNotes}
            onChangeText={setBuyerNotes}
          />
          <Text style={styles.charCounter}>{`${buyerNotes.length}/300`}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default BuyerInfo;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E4F4',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: 'black',
  },
  notesContainer: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 4,
    padding: 12,
    backgroundColor: 'white',
  },
  notesInput: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: 'black',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCounter: {
    textAlign: 'right',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    color: 'black',
    marginTop: 8,
    letterSpacing: 2,
  },
});
