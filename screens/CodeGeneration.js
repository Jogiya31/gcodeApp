import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";

const CodeGeneration = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [expirationTime, setExpirationTime] = useState(null); // Stores expiration time
  const [remainingTime, setRemainingTime] = useState(null); // Stores remaining time in seconds

  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Disable default header
    });

    const fetchUserDetails = async () => {
      try {
        const storedDetails = await AsyncStorage.getItem("userDetails");
        if (storedDetails) {
          setUserDetails(JSON.parse(storedDetails));
        } else {
          Alert.alert("No user details found", "Please register first.");
          navigation.navigate("Registration");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load user details.");
      }
    };

    fetchUserDetails();
  }, [navigation]);

  useEffect(() => {
    const fetchStoredCode = async () => {
      try {
        const storedCode = await AsyncStorage.getItem("generatedCode");
        const storedExpiration = await AsyncStorage.getItem("expirationTime");

        if (storedCode && storedExpiration) {
          const currentTime = new Date().getTime();
          const parsedExpirationTime = parseInt(storedExpiration);

          if (parsedExpirationTime > currentTime) {
            // Set the stored code and remaining time
            setCode(storedCode);
            setExpirationTime(parsedExpirationTime);
            setRemainingTime(Math.max(0, Math.floor((parsedExpirationTime - currentTime) / 1000)));
          } else {
            // Clear the expired code and expiration time
            setCode("");
            setExpirationTime(null);
            setRemainingTime(null);
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load stored code or expiration time.");
      }
    };

    fetchStoredCode();
  }, []);

  // Timer to handle code expiration and countdown
  useEffect(() => {
    if (expirationTime) {
      const timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const timeLeft = Math.max(
          0,
          Math.floor((expirationTime - currentTime) / 1000)
        ); // Time left in seconds

        if (timeLeft <= 0) {
          setCode(""); // Clear code
          setExpirationTime(null); // Clear expiration time
          setRemainingTime(null); // Clear countdown
          clearInterval(timer);
        } else {
          setRemainingTime(timeLeft);
        }
      }, 1000); // Update every second

      return () => clearInterval(timer); // Cleanup timer on component unmount
    }
  }, [expirationTime]);

  const generateCode = (userDetails) => {
    const { username, email, mobile, key } = userDetails;

    const timestamp = Math.floor(Date.now() / 1000 / 60); // Precision to minute

    // Convert inputs to lowercase and concatenate
    const inputString =
      username.toLowerCase() +
      email.toLowerCase() +
      mobile.toLowerCase() +
      key.toLowerCase() +
      timestamp;

    // Generate SHA256 hash
    const hash = CryptoJS.SHA256(inputString).toString(CryptoJS.enc.Hex);

    // Convert hash to a 5-digit number between 10000 and 99999
    const hashInt = parseInt(hash.substring(0, 8), 16);
    const fiveDigitCode = (hashInt % 90000) + 10000;

    return fiveDigitCode.toString();
  };

  const handleGenerateCode = async () => {
    if (userDetails) {
      // Check if the code is already generated and valid (not expired)
      if (remainingTime !== null && remainingTime > 0) {
        Alert.alert("Error", "Please wait for the current code to expire.");
        return;
      }

      setLoading(true);
      const newCode = generateCode(userDetails);

      // Set expiration time to 15 minutes from now
      const expiration = new Date().getTime() + 15 * 60 * 1000; // 15 minutes in milliseconds
      setExpirationTime(expiration);
      setCode(newCode);

      // Store code and expiration time in AsyncStorage
      await AsyncStorage.setItem("generatedCode", newCode);
      await AsyncStorage.setItem("expirationTime", expiration.toString());

      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`; // Format as MM:SS
  };

  const navigateToRegister = () => {
    navigation.navigate("Registration");
  };

  return (
    <View style={styles.container}>
      {/* Header Section with Background Image */}
      <ImageBackground
        source={require("../assets/mobileBG.png")}
        style={styles.header}
        resizeMode="stretch"
      >
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>Generate Code</Text>
        </View>
      </ImageBackground>

      {/* Main Content */}
      <View style={styles.innercontainer}>
        {!code && (
          <Text style={styles.infoText}>
            Press Generate Code to get your current code.
          </Text>
        )}
        <Text style={styles.codeText}>{code}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <>
            {code && remainingTime && (
              <Text style={styles.infoText}>
                Code expires in:{" "}
                {remainingTime ? (
                  <Text style={styles.remainingTime}>
                    {formatTime(remainingTime)}
                  </Text>
                ) : (
                  "Expired"
                )}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.button, remainingTime !== null && { backgroundColor: "#999" }]} // Disable button if timer is active
              onPress={handleGenerateCode}
              disabled={remainingTime !== null} // Disable button during countdown
            >
              <Text style={styles.buttonText}>
                {remainingTime !== null
                  ? "Wait for Countdown"
                  : "Generate Code"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.updateButton}
          onPress={navigateToRegister}
        >
          <Text style={styles.buttonText}>Update Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 30,
  },
  headerText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  innercontainer: {
    paddingTop: 70,
    paddingHorizontal: 40,
  },
  codeText: {
    fontSize: 56,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  remainingTime: {
    fontSize: 16,
    fontWeight: 700,
    color: "#282796",
  },
  infoText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  button: {
    width: "100%",
    backgroundColor: "#00b652",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  updateButton: {
    width: "100%",
    backgroundColor: "#cb9a08", // Yellow color for update button
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CodeGeneration;
