import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { playSound } from '../utils/soundPlayer';

const Dashboard = () => {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const goChat = () => {
        playSound('transitionWooshUp');
        navigation.navigate("Chat");
    };
    const goBackFunction = () => {
        playSound('transitionWooshUp');
        if(navigation.canGoBack()) {
            navigation.goBack()
        } else {
            navigation.navigate("Home");
        }
    };
      
  return (
         <LinearGradient style={styles.container}  colors={['#14242F', '#1B4056']}>
        <ScrollView style={styles.containerView} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => goBackFunction()}>
        <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image source={require("../assets/brainlogo.png")} style={styles.logo} />
        <TouchableOpacity>
          <Ionicons name="settings-sharp" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Mornings ARE hard section */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Mornings ARE hard!</Text>
        <Text style={styles.bannerText}>
          42% of parents are reporting that they also find mornings the most challenging part of the day.
        </Text>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Read more</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Section */}
      <View style={styles.cardsRow}>
        <TouchableOpacity style={styles.cardLeft} onPress={() => goChat()}>
          <Image source={require("../assets/heart-dashboard.png")} style={styles.cardIcon} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
          <Text style={styles.cardTitle}>Chat to Gale</Text>
          <Text style={styles.cardDesc}>Get support and guidance from your PDA expert</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardRight}>
          <Image source={require("../assets/questions-dashboard.png")} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Translator</Text>
          <Text style={styles.cardDesc}>Turn requests into non-demand language</Text>
        </TouchableOpacity>
      </View>

        {/* Venting Space */}
        <Text style={styles.voteTextFull}>Vote on the Next Feature!</Text>
        <View style={styles.venting}>
            
        <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
            <Text style={styles.voteText}>Venting Space</Text>
            <Text style={styles.ventDesc}>Share freely, receive empathy. No judgment - just support.</Text>
            </View>
            <View style={styles.voteButtons}>
            <TouchableOpacity style={styles.thumbBtn}>
                <FontAwesome name="thumbs-up" size={24} color="#00FFCF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.thumbBtn}>
                <FontAwesome name="thumbs-down" size={24} color="#FF5C5C" />
            </TouchableOpacity>
            </View>
        </View>
        </View>
      </ScrollView>
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
    padding: 0,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    marginTop: 55,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  banner: {
    paddingHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  bannerTitle: {
    fontSize: 30,
    fontFamily: 'Lato-Bold',
    textAlign: 'center',
    color: "#fff",
    marginBottom: 15,
  },
  bannerText: {
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    textAlign: 'center',
    color: "#ccc",
    padding: 10,
    marginTop: 10,
  },
  readMoreButton: {
    marginTop: 15,
    backgroundColor: "#42BCC7",
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 20,
  },
  readMoreText: {
    fontFamily: 'Lato-Bold',
    textAlign: 'center',
    fontSize:16,
    color: "#fff",
  },
  cardsRow: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  cardLeft: {
    backgroundColor: "#ffB030",
    flex: 1,
    borderRadius: 16,
    marginRight: 10,
    padding: 16,
    position: "relative",
  },
  cardRight: {
    backgroundColor: "#D75430",
    flex: 1,
    borderRadius: 16,
    marginLeft: 10,
    padding: 16,
  },
  cardIcon: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 10,
    marginTop:-40,
  },
  badge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#E95D3E",
    fontSize: 15,
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    color: "#fff",
    textAlign: "left",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: "#fff",
    textAlign: "left",
  },
  venting: {
    backgroundColor: '#0C2C3B',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    marginTop: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  voteTextFull: {
    color: "#048A96",
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    textAlign: 'left',
    marginTop:25,
    paddingVertical:0,
    paddingHorizontal:35,

  },
  voteText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    textAlign: 'left',
    marginBottom: 8,
  },
  ventDesc: {
    color: "#fff",
    fontSize: 13,
    fontFamily: 'Lato-Bold',
    textAlign: 'left',
  },
  voteButtons: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 15,
    marginLeft: 10,
  },
  thumbBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Dashboard;
