// src/screens/WelcomeScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { playSound } from "../utils/soundPlayer";

const WelcomeScreen = ({ navigation }) => {
        const goDashboard = () => {
            playSound('transitionWooshUp');
            navigation.navigate("Dashboard");
        };

        
  return (
     <LinearGradient style={styles.container}  colors={['#14242F', '#1B4056']}>
    <View style={styles.containerView}>
      <Image
        source={require("../assets/brainlogo.png")} // Replace with your actual image path
        style={styles.icon}
      />

      <Text style={styles.heading}>Thanks for sharing.{"\n"}Your profile is ready!</Text>

      <Image
        source={require("../assets/image-search-hearth.png")} // Replace with your actual image path
        style={styles.iconHeart}
      />

      <Text style={styles.description}>
        From here, we’ve designed a quick session where you can discuss with an expert who understands PDA.
      </Text>

      <Text style={styles.subtext}>
        <Text style={{ fontStyle: "italic", color: "#A0AEC0" }}>
          Based on what you’ve shared, we’ll try{"\n"}to find a new practical solution to your current biggest issue.
        </Text>
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={() => goDashboard()}>
        <Text style={styles.startButtonText}>Start Session</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => goDashboard()}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  containerView: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 50,
  },
  iconHeart: {
    width: 200,
    height: 200,
    marginBottom: 50,
  },
  heading: {
    fontSize: 22,
    color: "#C7F5FF",
    fontFamily: 'Lato-Bold',
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  description: {
    color: "#FFFFFF",
    fontFamily: 'Lato-Regular',
    fontSize: 15,
    textAlign: "center",
    marginBottom: 10,
    paddingRight: 20,
    paddingLeft:20,
  },
  subtext: {
    fontSize: 14,
    fontFamily: 'Lato-Italic',
    textAlign: "center",
    marginBottom: 40,
    paddingRight: 20,
    paddingLeft:20,
  },
  startButton: {
    backgroundColor: "#319795",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  startButtonText: {
    fontFamily: 'Lato-Bold',
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  skipText: {
    fontFamily: 'Lato-Bold',
    color: "#A0AEC0",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;
