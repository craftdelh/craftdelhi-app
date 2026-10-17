import { router } from "expo-router";
import React from "react";
import { Image, ImageBackground, Text, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Login() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/img1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.contentContainer}>
            <Animatable.View animation="fadeInDown" duration={1200} style={styles.logoContainer}>
              <Image
                source={require("../assets/images/icon1.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animatable.View>
            
            <Animatable.View animation="fadeIn" delay={400} style={styles.textContainer}>
              <Text style={styles.title}>Welcome to</Text>
              <Text style={styles.brand}>CRAFT DELHI</Text>
              
              <Animatable.Text animation="fadeInUp" delay={700} style={styles.subtitle}>
                Discover unique crafts and personalized gift boxes, crafted with love. Shop now for thoughtful gifts that add a touch of elegance to every occasion!
              </Animatable.Text>
            </Animatable.View>
          </View>

          <Animatable.View animation="slideInUp" delay={1000} style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/Home')}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animatable.View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fallback
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 50,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  logoImage: {
    width: 68,
    height: 68,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: 'mmedium',
    letterSpacing: 1,
  },
  brand: {
    fontSize: 42,
    fontFamily: "mextrabold",
    color: "#fff",
    marginTop: 5,
    marginBottom: 20,
    letterSpacing: 2,
  },
  subtitle: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    lineHeight: 24,
    marginHorizontal: 10,
    fontFamily: 'mregular',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "mbold",
    letterSpacing: 1,
  },
});
