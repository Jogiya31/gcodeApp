import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
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
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/prayasLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.footer}>
        Powered by <Text style={styles.primaryColor}>NIC</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
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
