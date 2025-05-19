import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HomeCards = ({ cardsData }) => {
  const animations = useRef(cardsData.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animations.forEach(anim => anim.setValue(0));
    const animationsSequence = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animationsSequence).start();
  }, [cardsData]); 

  return (
    <View>
      {cardsData.map((card, index) => {
        const translateY = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        });

        const opacity = animations[index];

        return (
          <Animated.View
            key={index}
            style={{
              opacity,
              transform: [{ translateY }],
            }}
          >
            <LinearGradient
              colors={card.colors}
              style={[styles.card, index === 0 && { marginTop: -5 }]}
            >
              <View style={styles.iconContainer}>{card.icon}</View>

              <View style={styles.textSection}>
                <Text style={styles.title}>{card.title}</Text>
                <Text style={styles.count}>{card.count}</Text>
                <Text style={styles.change}>{card.change}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default HomeCards;


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