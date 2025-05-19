import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

const HomeCards = () => {
  return (
    <View>
       <LinearGradient
             colors={['#FFE2E6', 'white']}
             style={[styles.card,{marginTop:-5}]}
           >
             <View style={styles.iconContainer}>
               <View style={styles.outerCircle} />
               <View style={styles.innerCircle} />
             </View>
     
             <View style={styles.textSection}>
               <Text style={styles.title}>Total Number Of Sales</Text>
               <Text style={styles.count}>87</Text>
               <Text style={styles.change}>+8 from yesterday</Text>
             </View>
           </LinearGradient>

             <LinearGradient
             colors={['#FFF4DE', 'white']}
             style={styles.card}
           >
             <View style={styles.iconContainer}>
               <View style={styles.outerCircle} />
               <View style={styles.innerCircle} />
             </View>
     
             <View style={styles.textSection}>
               <Text style={styles.title}>Total Number Of Orders</Text>
               <Text style={styles.count}>2100</Text>
               <Text style={styles.change}>+8 from yesterday</Text>
             </View>
           </LinearGradient>

             <LinearGradient
             colors={['#DCFCE7', 'white']}
             style={styles.card}
           >
             <View style={styles.iconContainer}>
               <View style={styles.outerCircle} />
               <View style={styles.innerCircle} />
             </View>
     
             <View style={styles.textSection}>
               <Text style={styles.title}>Pending Orders</Text>
               <Text style={styles.count}>14</Text>
               <Text style={styles.change}>+8 from yesterday</Text>
             </View>
           </LinearGradient>

             <LinearGradient
             colors={['#F4E8FF', 'white']}
             style={styles.card}
           >
             <View style={styles.iconContainer}>
               <View style={styles.outerCircle} />
               <View style={styles.innerCircle} />
             </View>
     
             <View style={styles.textSection}>
               <Text style={styles.title}>Cancelled Orders</Text>
               <Text style={styles.count}>32</Text>
               <Text style={styles.change}>+8 from yesterday</Text>
             </View>
           </LinearGradient>
    </View>
  )
}

export default HomeCards

const styles = StyleSheet.create({
     card: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 15,
    marginTop:20
  },
  iconContainer: {
    width: 36,
    height: 36,
    position: 'relative',
    overflow: 'hidden',
  },
  outerCircle: {
    width: 30,
    height: 30,
    position: 'absolute',
    left: 3,
    top: 3,
    opacity: 0.4,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 15,
  },
  innerCircle: {
    width: 12,
    height: 12,
    position: 'absolute',
    left: 12,
    top: 12,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 6,
  },
  textSection: {
    width: '100%',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold', // Make sure it's loaded in your project
    color: 'black',
    lineHeight: 24,
  },
  count: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: 'black',
    lineHeight: 32,
  },
  change: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    color: '#2E54D9',
    lineHeight: 24,
  },
})