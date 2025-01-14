import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  ImageBackground,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Registration = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [key, setKey] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Disable default header
    });

    const fetchUserDetails = async () => {
      try {
        const storedDetails = await AsyncStorage.getItem("userDetails");
        if (storedDetails) {
          const parsedDetails = JSON.parse(storedDetails);
          setUsername(parsedDetails.username);
          setEmail(parsedDetails.email);
          setMobile(parsedDetails.mobile);
          setKey(parsedDetails.key);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load user details.");
      }
    };

    fetchUserDetails();
  }, [navigation]);

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
    if (!username || !email || !mobile || !key) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Please enter a Username.");
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

    const userDetails = { username, email, mobile, key };

    try {
      await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
      Alert.alert("Success", "Registration successful.");
      navigation.navigate("CodeGeneration");
    } catch (error) {
      Alert.alert("Error", "Failed to save user details.");
    }
  };

  const handleReset = async () => {
    // Clear the state values
    setUsername("");
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header Section */}
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
              <Text style={styles.label}>User Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#aaa"
              />
            </View>
            <View>
              <Text style={styles.label}>Email ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#aaa"
              />
            </View>
            <View>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                placeholderTextColor="#aaa"
              />
            </View>
            <View>
              <Text style={styles.label}>Private Key</Text>
              <TextInput
                style={styles.input}
                placeholder="Personal Key"
                value={key}
                onChangeText={setKey}
                placeholderTextColor="#aaa"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            {/* Reset Button */}

            {/* <View style={styles.reset}>
              <Text style={styles.resetText}>
                <Text>Click here to </Text>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.resetButtonText}>Reset details</Text>
                </TouchableOpacity>
              </Text>
            </View> */}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    paddingLeft: 30,
  },
  headerInfo: {
    marginTop: -20,
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
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#00b652",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  reset: {
    marginTop: 10,
    display: "flex",
    width: "100%",
  },
  resetText: {
    display: "flex",
    alignItems: "center",
  },
  resetButtonText: {
    position: "absolute",
    color: "#ff6347",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Registration;
