import { Entypo } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'

const PaymentSummary = ({data,onClose}) => {
  return (

   <>
    <View style={{padding:20,marginTop:20}}>
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>Payment View</Text>
        <TouchableOpacity onPress={onClose}>
          <Entypo name="cross" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
    <ScrollView contentContainerStyle={styles.container}>

      {/* Order Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary Section :</Text>
        <View style={styles.subSection}>
          <View style={styles.inlineFlex}>
            <View style={styles.flex1Row}>
              <Text style={styles.label}>Payment ID :</Text>
              <Text style={styles.value}>01</Text>
            </View>
            <View style={styles.flex1Row}>
              <Text style={styles.label}>Order ID :</Text>
              <Text style={styles.value}>02</Text>
            </View>
          </View>
          <View style={styles.lightDivider} />
        </View>
      </View>

      {/* Buyer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buyer Information :</Text>
        <View style={styles.subSection}>
          <Text style={styles.label}>Buyer Name :</Text>
          <Text style={styles.value}>Rajesh</Text>
        </View>
        <View style={styles.lightDivider} />
        <View style={[styles.subSection, {height: 60}]}>
          <Text style={styles.label}>Email Address :</Text>
          <Text style={styles.value}>Rajesh42200@gmail.com</Text>
          <View style={styles.lightDivider} />
        </View>
        <View style={styles.subSection}>
          <Text style={styles.label}>Contact Number :</Text>
          <Text style={styles.value}>+ 91 3332 3232333</Text>
        </View>
        <View style={styles.lightDivider} />
        <View style={[styles.subSection, {gap: 20}]}>
          <Text style={[styles.label, {width: 165}]}>Buyer Notes :</Text>
          <Text style={styles.value}>Please gift wrap the item and add a 'Happy Birthday' note</Text>
        </View>
        <View style={styles.lightDivider} />
      </View>

      {/* Product(s) Ordered */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product(s) Ordered :</Text>
        <View style={styles.subSection}>
          <View style={styles.flex1Row}>
            <Text style={[styles.label, {width: 165}]}>Product Name :</Text>
            <Text style={styles.value}>Data</Text>
          </View>
          <View style={styles.lightDivider} />
        </View>

        <View style={styles.flex1Row}>
          <Text style={styles.label}>Quantity :</Text>
          <Text style={styles.value}>01</Text>
        </View>
        <View style={styles.flex1Row}>
          <Text style={styles.label}>Price :</Text>
          <Text style={styles.value}>Rs 2000</Text>
        </View>
        <View style={styles.flex1Row}>
          <Text style={styles.label}>SKU #</Text>
          <Text style={styles.value}>43</Text>
        </View>
        <View style={styles.lightDivider} />
      </View>

      {/* Order Status Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status Management :</Text>
        <View style={styles.subSection}>
          <View style={styles.flex1Row}>
            <Text style={[styles.label, {color: '#024A63'}]}>Order Status :</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.value}>Delivered</Text>
            </View>
          </View>
          <View style={styles.lightDivider} />
        </View>
      </View>

      {/* Payment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information :</Text>
        <View style={styles.subSection}>
          <View style={styles.flex1Row}>
            <Text style={[styles.label, {width: 165}]}>Payment Method :</Text>
            <Text style={styles.value}>UPI</Text>
          </View>
          <View style={styles.lightDivider} />
        </View>

        <View style={styles.subSection}>
          <View style={styles.flex1Row}>
            <Text style={[styles.label, {width: 165}]}>Payment Status :</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.value}>Paid</Text>
            </View>
          </View>
          <View style={styles.lightDivider} />
        </View>
      </View>

      {/* Shipping Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information :</Text>
        <View style={styles.subSection}>
          <View style={styles.flex1Row}>
            <Text style={[styles.label, {width: 165}]}>Payment Method :</Text>
            <Text style={styles.value}>UPI</Text>
          </View>
          <View style={styles.lightDivider} />
        </View>

        <View style={styles.subSection}>
          <View style={styles.flex1Row}>
            <Text style={[styles.label, {width: 165}]}>Payment Status :</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.value}>Paid</Text>
            </View>
          </View>
          <View style={styles.lightDivider} />
        </View>
      </View>

      {/* Close Button */}
      <View style={styles.closeButtonContainer}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
   </>
  )
}

export default PaymentSummary

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    shadowColor: 'rgba(255, 255, 255, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    gap: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  titleText: {
    flex: 1,
    color: 'black',
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: '700',
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  divider: {
    height: 0,
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    marginVertical: 10,
  },
  section: {
    gap: 10,
    flexDirection: 'column',
  },
  sectionTitle: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: '700',
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  subSection: {
    gap: 10,
    flexDirection: 'column',
  },
  inlineFlex: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  flex1Row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  label: {
    width: 100,
    color: '#024A63',
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: '700',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  value: {
    flex: 1,
    color: 'black',
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: '500',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  lightDivider: {
    height: 0,
    borderTopWidth: 1,
    borderTopColor: '#ECF0FF',
    marginVertical: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#69D297',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderRadius: 4,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  closeButton: {
    width: 120,
    paddingVertical: 16,
    backgroundColor: '#024A63',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
})
