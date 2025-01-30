import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Index = ({ navigation }) => {
  useEffect(() => {
    // Disable the header when on the index screen
    navigation.setOptions({
      headerShown: false, // This hides the entire header
    });

    const checkRegistration = async () => {
      const userDetails = await AsyncStorage.getItem("userDetails");
      setTimeout(() => {
        if (userDetails) {
          navigation.replace("CodeGeneration");
        } else {
          navigation.replace("Registration");
        }
      }, 3000);
    };

    checkRegistration();
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../assets/home_bg.png")}
      style={styles.background}
      resizeMode="contain"
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/prayasLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.footer}>
          Powered by <Text style={styles.primaryColor}>NIC</Text>
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1, 
    width: "100%", 
    height: "100%", 
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 70,
  },
  primaryColor: {
    color: "#007EB9",
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 50,
  },
});

export default Index;
