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
  const [isFormDisabled, setIsFormDisabled] = useState(false); // State to track form disabling
  const [remainingTime, setRemainingTime] = useState(null); // Stores remaining time for countdown

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("#4B48A5");
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Disable default header
    });

    const fetchUserDetails = async () => {
      try {
        const storedDetails = await AsyncStorage.getItem("userDetails");
        if (storedDetails) {
          const parsedDetails = JSON.parse(storedDetails);
          setLoginName(parsedDetails.loginName);
          setEmail(parsedDetails.email);
          setMobile(parsedDetails.mobile);
          setKey(parsedDetails.key);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load user details.");
      }
    };

    const fetchExpirationTime = async () => {
      try {
        const storedExpiration = await AsyncStorage.getItem("expirationTime");

        if (storedExpiration) {
          const currentTime = new Date().getTime();
          const parsedExpirationTime = parseInt(storedExpiration);

          if (parsedExpirationTime > currentTime) {
            // Calculate the remaining time
            setRemainingTime(
              Math.max(
                0,
                Math.floor((parsedExpirationTime - currentTime) / 1000)
              )
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

    fetchUserDetails();
    fetchExpirationTime();
  }, [navigation]);

  useEffect(() => {
    if (remainingTime !== null && remainingTime > 0) {
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
    if (!loginName || !email || !mobile || !key) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (loginName.length < 3) {
      Alert.alert("Error", "Please enter a login name.");
      return;
    }

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

    const userDetails = { loginName, email, mobile, key };

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
  };

  const handleReset = async () => {
    // Clear the state values
    setLoginName("");
    setEmail("");
    setMobile("");
    setKey("");

    // Clear the user details from AsyncStorage
    try {
      await AsyncStorage.removeItem("userDetails");
      Alert.alert("Success", "Form has been reset.");
    } catch (error) {
      Alert.alert("Error", "Failed to reset user details.");
    }
  };

  console.log("userdetails", loginName);

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
          <Text style={styles.label}>Login Name</Text>
          <TextInput
            style={styles.input}
            placeholder="example (John Doe)"
            value={loginName}
            maxLength={40}
            onChangeText={setLoginName}
            placeholderTextColor="#aaa"
            editable={!isFormDisabled} // Disable if form is disabled
          />
        </View>
        <View>
          <Text style={styles.label}>Email ID</Text>
          <TextInput
            style={styles.input}
            placeholder="example@nic.in"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#aaa"
            editable={!isFormDisabled} // Disable if form is disabled
          />
        </View>
        <View>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="0123456789"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            placeholderTextColor="#aaa"
            editable={!isFormDisabled} // Disable if form is disabled
          />
        </View>
        <View>
          <Text style={styles.label}>secret key</Text>
          <TextInput
            style={styles.input}
            placeholder="5 digit key"
            value={key}
            maxLength={5}
            onChangeText={setKey}
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            editable={!isFormDisabled} // Disable if form is disabled
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>
            {loginName === "" ? "Save" : "Update Details"}
          </Text>
        </TouchableOpacity>
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
});

export default Registration;
