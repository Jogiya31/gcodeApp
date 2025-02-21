import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ImageBackground,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Registration = ({ navigation }) => {
  const [loginName, setLoginName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [key, setKey] = useState("");
  const [storedData, setStoredData] = useState(null);
  const [isFormDisabled, setIsFormDisabled] = useState(false); // State to track form disabling
  const [remainingTime, setRemainingTime] = useState(null); // Stores remaining time for countdown

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("#4B48A5");
    fetchUserDetails();
  }, []);

  useEffect(() => {
    fetchUserDetails();
    fetchExpirationTime();
  }, [navigation]);

  const fetchExpirationTime = async () => {
    try {
      const storedExpiration = await AsyncStorage.getItem("expirationTime");

      if (storedExpiration) {
        const currentTime = new Date().getTime();
        const parsedExpirationTime = parseInt(storedExpiration);

        if (parsedExpirationTime > currentTime) {
          // Calculate the remaining time
          setRemainingTime(
            Math.max(0, Math.floor((parsedExpirationTime - currentTime) / 1000))
          );
          setIsFormDisabled(true); // Disable form until timer expires
        } else {
          // If expired, enable the form
          setIsFormDisabled(false);
          setRemainingTime(null);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load expiration time.");
    }
  };

  const fetchUserDetails = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem("userDetails");
      if (storedDetails) {
        const parsedDetails = JSON.parse(storedDetails);
        // setLoginName(parsedDetails.loginName);
        setEmail(parsedDetails.email);
        setMobile(parsedDetails.mobile);
        setKey(parsedDetails.key);
        setStoredData(parsedDetails);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load user details.");
    }
  };

  useEffect(() => {
    if (remainingTime !== null) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          const updatedTime = prevTime - 1;
          if (updatedTime <= 0) {
            setIsFormDisabled(false); // Enable form when timer expires
            clearInterval(timer);
          }
          return updatedTime;
        });
      }, 1000);

      return () => clearInterval(timer); // Cleanup timer on component unmount
    }
  }, [remainingTime]);

  const validateEmail = (email) => {
    const emailRegex = /\S+@nic\.in/; // Regex to validate '@nic.in' domain
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const validateKey = (key) => {
    const keyRegex = /^[0-9]{5}$/;
    return keyRegex.test(key);
  };

  const handleRegister = async () => {
    fetchExpirationTime();
    if (remainingTime !== null) {
      Alert.alert("Message", "Please wait, try again after code expires.", [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        { text: "OK", onPress: () => navigation.navigate("CodeGeneration") },
      ]);
    } else {
      if (
        // !loginName ||
        !email ||
        !mobile ||
        !key
      ) {
        Alert.alert("Error", "All fields are required.");
        return;
      }

      // if (loginName.length < 3) {
      //   Alert.alert("Error", "Please enter a login name.");
      //   return;
      // }

      if (!validateEmail(email)) {
        Alert.alert("Error", "Please enter a valid email address.");
        return;
      }

      if (!validateMobile(mobile)) {
        Alert.alert("Error", "Please enter a valid Phone number");
        return;
      }

      if (!validateKey(key)) {
        Alert.alert("Error", "Please enter a Key");
        return;
      }

      // const userDetails = { loginName, email, mobile, key };
      const userDetails = { email, mobile, key };

      try {
        // Remove existing user details from AsyncStorage
        await AsyncStorage.removeItem("userDetails");

        // Save the new user details in AsyncStorage
        await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
        if (!isFormDisabled) {
          Alert.alert("Success", "Registration successful.");
        }
        navigation.navigate("CodeGeneration");
      } catch (error) {
        Alert.alert("Error", "Failed to save user details.");
      }
    }
  };

  const handleReset = () => {
    AsyncStorage.removeItem("userDetails");
    setStoredData(null);
    setLoginName("");
    setEmail("");
    setMobile("");
    setKey("");
    setRemainingTime(null);
    setIsFormDisabled(false);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/mobileBG.png")}
        style={styles.header}
        resizeMode="stretch"
      >
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>Sign Up</Text>
          <Text style={styles.info}>
            Fill the details and speed up your login!
          </Text>
        </View>
      </ImageBackground>

      {/* Form Section */}
      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.label}>
            Email ID <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="example@nic.in"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#aaa"
            editable={!isFormDisabled} 
          />
        </View>
        <View>
          <Text style={styles.label}>
            Phone <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0123456789"
            value={mobile}
            maxLength={10}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            placeholderTextColor="#aaa"
            editable={!isFormDisabled}
          />
        </View>
        <View>
          <Text style={styles.label}>
            Secret key <Text style={styles.required}>*</Text>
          </Text>

          <TextInput
            style={[styles.input]}
            placeholder="5 digit key"
            value={key}
            maxLength={5}
            onChangeText={setKey}
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            editable={!isFormDisabled}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            (email === "" || mobile === "" || key === "") && {
              backgroundColor: "#999",
            },
          ]}
          onPress={handleRegister}
          disabled={email === "" || mobile === "" || key === ""}
        >
          <Text style={styles.buttonText}>
            {storedData === null ? "Save" : "Update"}
          </Text>
        </TouchableOpacity>
        {!isFormDisabled ? (
          <View style={styles.reset}>
          <TouchableOpacity onPress={handleReset}>
            <Text>Click here to <Text style={styles.resetText}> Reset </Text>user details</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
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
    width: "100%",
  },
  headerInfo: {
    marginTop: -20,
    paddingLeft: 30,
  },
  headerText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  info: {
    paddingTop: 10,
    fontSize: 14,
    color: "#fff",
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#282796",
    paddingLeft: 10,
    paddingBottom: 10,
  },
  input: {
    height: 50,
    backgroundColor: "#e8e8ff",
    borderRadius: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#00b652",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  required: {
    color: "#f00",
  },
  reset: {
    padding: 10,
    marginTop: 10,
  },
  resetText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#282796",
  },
});

export default Registration;
