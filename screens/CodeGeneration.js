import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the back arrow
import CryptoJS from 'crypto-js'; // Import crypto-js for hashing

const CodeGeneration = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user details from AsyncStorage
    const fetchUserDetails = async () => {
      try {
        const storedDetails = await AsyncStorage.getItem('userDetails');
        if (storedDetails) {
          setUserDetails(JSON.parse(storedDetails));
        } else {
          Alert.alert('No user details found', 'Please register first.');
          navigation.navigate('Registration'); // Navigate to Registration page if no details
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user details.');
      }
    };

    fetchUserDetails();

    // Disable back button
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false; // Allow default behavior if no previous screen
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (navigation.canGoBack()) {
          return (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>
          );
        }
        return null; // No back button if there's no previous screen
      },
    });
  }, [navigation]);

  const generateCode = (userDetails) => {
    const { username, email, mobile, key } = userDetails;

    const timestamp = Math.floor(Date.now() / 1000 / 60); // Precision to minute

    // Convert inputs to lowercase and concatenate
    const inputString = (
      username.toLowerCase() +
      email.toLowerCase() +
      mobile.toLowerCase() +
      key.toLowerCase() +
      timestamp
    );

    // Generate SHA256 hash
    const hash = CryptoJS.SHA256(inputString).toString(CryptoJS.enc.Hex);

    // Convert hash to a 5-digit number between 10000 and 99999
    const hashInt = parseInt(hash.substring(0, 8), 16); // Use the first 8 characters of the hash
    const fiveDigitCode = (hashInt % 90000) + 10000;

    return fiveDigitCode.toString();
  };

  const handleGenerateCode = () => {
    if (userDetails) {
      setLoading(true);
      const newCode = generateCode(userDetails);
      setCode(newCode);
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Registration'); // Navigate to Registration page to update details
  };

  return (
    <View style={styles.container}>
      {!code && <Text style={styles.text}>Press Generate code button to get your current code</Text>}
      <Text style={styles.header}>{code}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <>
          {code && <Text style={styles.text}>is your current code</Text>}
          <TouchableOpacity style={styles.button} onPress={handleGenerateCode}>
            <Text style={styles.buttonText}>Generate Code</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Button to navigate to Registration page for updating details */}
      <TouchableOpacity style={styles.updateButton} onPress={navigateToRegister}>
        <Text style={styles.buttonText}>Update Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f9',
  },
  header: {
    fontSize: 56,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  button: {
    width: '100%',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  updateButton: {
    width: '100%',
    backgroundColor: '#cb9a08', // Yellow color for update button
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CodeGeneration;
