import { router } from "expo-router";
import React from "react";
import { ImageBackground, Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from '../assets/images/logo1.svg';
import * as Animatable from "react-native-animatable";

export default function Login() {
  return (
    <ImageBackground
      source={require("../assets/images/img1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
         <Animatable.View animation="fadeInDown" duration={1200} style={styles.logo}>
        <Icon width={130} height={130} style={styles.logo} />
</Animatable.View>
           <Animatable.Text animation="fadeIn" delay={300} style={styles.title}>
          Welcome to The
        </Animatable.Text>
        <Animatable.Text animation="fadeIn" delay={500} style={styles.brand}>
          CRAFT DELHI
        </Animatable.Text>
        <Animatable.Text animation="fadeInUp" delay={700} style={styles.subtitle}>
          “Discover unique crafts and personalized gift boxes, crafted with love from Delhi. Shop now for thoughtful gifts that add a touch of elegance to every occasion!”
        </Animatable.Text>

         <Animatable.Image
          animation="fadeInUp"
          delay={900}
          source={require("../assets/images/ribbon.png")}
          style={styles.ribbon}
        />
      </View>

       <Animatable.View animation="fadeInUp" delay={1100}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/Signin')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
     marginTop: -250,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    color: "#fff",
    fontWeight: "400",
    fontFamily:'mmedium'
  },
  brand: {
    fontSize: 45,
    fontFamily: "msemibold",
    color: "#fff",
    marginTop: 5,
    marginBottom: 15,
    letterSpacing: 1,
    textDecorationLine:'underline'
  },
  subtitle: {
    textAlign: "center",
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    marginHorizontal: 10,
    marginBottom: 30,
    fontFamily:'mregular',
    marginTop:20
  },
  ribbon: {
    width: "90%",
    height: 80,
    resizeMode: "contain",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#024A63",
    paddingVertical: 18,
    borderRadius: 8,
    margin: 20,
    marginBottom: 40,
    width: "90%",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "mbold",
  },
});
