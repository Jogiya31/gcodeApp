import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import moment from "moment";

const CodeGeneration = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [expirationTime, setExpirationTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [formattedDate, setFormattedDate] = useState(""); // State for formatted date
  const [formattedTime, setFormattedTime] = useState(""); // State for formatted time
  const [rounded, setrounded] = useState("");
  const [input, setinput] = useState("");

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("#4B48A5");

    const updateDateTime = () => {
      const currentDate = new Date();

      const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString(
        "default",
        { month: "short" }
      )} ${currentDate.getFullYear()}`;

      let hours = currentDate.getHours();
      const minutes = currentDate.getMinutes().toString().padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const formattedTime = `${hours}:${minutes} ${period}`;

      setFormattedDate(formattedDate);
      setFormattedTime(formattedTime);
    };

    // Update every second (1000ms)
    const intervalId = setInterval(updateDateTime, 1000);

    // Initial call to update the date and time immediately
    updateDateTime();

    const fetchStoredCode = async () => {
      try {
        const storedCode = await AsyncStorage.getItem("generatedCode");
        const storedExpiration = await AsyncStorage.getItem("expirationTime");

        if (storedCode && storedExpiration) {
          const currentTime = new Date().getTime();
          const parsedExpirationTime = parseInt(storedExpiration);

          if (parsedExpirationTime > currentTime) {
            setCode(storedCode);
            setExpirationTime(parsedExpirationTime);
            setRemainingTime(
              Math.max(
                0,
                Math.floor((parsedExpirationTime - currentTime) / 1000)
              )
            );
          } else {
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

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
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
    if (expirationTime) {
      const timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const timeLeft = Math.max(
          0,
          Math.floor((expirationTime - currentTime) / 1000)
        );

        if (timeLeft <= 0) {
          setCode("");
          setExpirationTime(null);
          setRemainingTime(null);
          clearInterval(timer);
        } else {
          setRemainingTime(timeLeft);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [expirationTime]);

  const generateCode = (userDetails) => {
    const { email, mobile, key } = userDetails;

    const now = new Date();
    const utcTimestamp = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTimestamp = utcTimestamp + istOffset;

    // Always round down to the nearest 5 minutes
    const roundedIstTimestamp =
      Math.floor(istTimestamp / (5 * 60 * 1000)) * (5 * 60 * 1000);

    // Format timestamp to match C# output
    const formattedIST = moment(roundedIstTimestamp).format("YYYY-MM-DD HH:mm");

    // Concatenate user details
    const inputString = email.toLowerCase() + mobile + key + formattedIST;

    setrounded(formattedIST);
    setinput(inputString);

    // Encode to UTF-8 explicitly (ensuring it matches C#)
    const utf8Input = new TextEncoder().encode(inputString);

    // Generate SHA-256 hash
    const hash = CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(inputString)).toString(
      CryptoJS.enc.Hex
    );

    // Ensure unsigned integer representation
    const hashInt = parseInt(hash.substring(0, 8), 16) >>> 0;

    // Convert to 5-digit code
    const fiveDigitCode = (hashInt % 90000) + 10000;

    return fiveDigitCode.toString();
  };

  const handleGenerateCode = async () => {
    if (userDetails) {
      if (remainingTime !== null && remainingTime > 0) {
        Alert.alert("Error", "Please wait for the current code to expire.");
        return;
      }

      setLoading(true);
      const newCode = generateCode(userDetails);

      //HERE WE DISABLE BUTTON FOR 1 MINUTE for testing
      const expiration = new Date().getTime() + 1 * 60 * 1000;

      setExpirationTime(expiration);
      setCode(newCode);

      await AsyncStorage.setItem("generatedCode", newCode);
      await AsyncStorage.setItem("expirationTime", expiration.toString());

      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes} min ${secs.toString().padStart(2, "0")} sec`;
    } else {
      return `${secs.toString().padStart(2, "0")} sec`;
    }
  };

  const navigateToRegister = () => {
    navigation.navigate("Registration");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/mobileBG.png")}
        style={styles.header}
        resizeMode="stretch"
      >
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>Generate Code</Text>
        </View>
      </ImageBackground>

      <View style={styles.innercontainer}>
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.loginName}>
              {userDetails && userDetails.email.split("@")[0]}
            </Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.time}>{formattedTime}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
        {/* <View>
          <Text>Timeformat = {rounded}</Text>
          <Text>InputString = {input}</Text>
        </View> */}
        {!code ? (
          <Text style={styles.infoText}>
            Press Generate Code to get your current code.
          </Text>
        ) : (
          <Text style={styles.codeText}>{code}</Text>
        )}
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.button,
                remainingTime !== null && { backgroundColor: "#999" },
              ]}
              onPress={handleGenerateCode}
              disabled={remainingTime !== null}
            >
              <Text style={styles.buttonText}>
                {remainingTime !== null
                  ? `Code expires in ${formatTime(remainingTime)}`
                  : "Generate Code"}
              </Text>
            </TouchableOpacity>
          </>
        )}
        {remainingTime === null ? (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={navigateToRegister}
            disabled={remainingTime !== null}
          >
            <Text style={styles.buttonText}>Update Details</Text>
          </TouchableOpacity>
        ) : null}
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
    width: "100%",
  },
  headerText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  innercontainer: {
    paddingTop: 10,
    paddingHorizontal: 40,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  nameContainer: {
    width: "50%",
  },
  loginName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#282796",
    textTransform: "uppercase",
  },
  dateBlock: {
    width: "50%",
    alignItems: "flex-end",
    flexDirection: "column",
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#282796",
  },
  welcome: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
    marginTop: 5,
  },
  time: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
    marginTop: 5,
  },
  codeText: {
    fontSize: 56,
    fontWeight: "700",
    marginTop: 50,
    marginBottom: 54,
    textAlign: "center",
    color: "#282796",
    // textShadow: "2px 4px 4px rgba(46, 91, 173, 0.6)",
    textShadowColor: "rgba(46, 91, 173, 0.6)", // Shadow color
    textShadowOffset: { width: 2, height: 4 }, // Shadow offset
    textShadowRadius: 4, // Shadow blur radius
  },
  infoText: {
    fontSize: 18,
    marginTop: 50,
    marginBottom: 77,
    color: "#333",
    textAlign: "center",
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
    backgroundColor: "#cb9a08",
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
