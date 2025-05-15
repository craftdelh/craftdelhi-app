import { router } from "expo-router";
import React from "react";
import { ImageBackground, Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function Login() {
  return (
    <ImageBackground
      source={require("../assets/images/img1.png")} // Replace with your image path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/images/logo.png")} // Add your logo image to assets
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to The</Text>
        <Text style={styles.brand}>CRAFT DELHI</Text>
        <Text style={styles.subtitle}>
          "Discover unique crafts and personalized gift boxes, crafted with love from Delhi. Shop now for thoughtful gifts that add a touch of elegance to every occasion!"
        </Text>

        <Image
          source={require("../assets/images/ribbon.png")} // Add bow ribbon image to assets
          style={styles.ribbon}
        />

        <TouchableOpacity style={styles.button} onPress={()=>router.push('/auth/Signin')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "400",
  },
  brand: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
    marginVertical: 20,
  },
  ribbon: {
    width: 150,
    height: 60,
    resizeMode: "contain",
    marginVertical: 40,
  },
  button: {
    backgroundColor: "#003D4D",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
