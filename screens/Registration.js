import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Registration = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
    });

    const fetchUserDetails = async () => {
      try {
        const storedDetails = await AsyncStorage.getItem('userDetails');
        if (storedDetails) {
          const parsedDetails = JSON.parse(storedDetails);
          setUsername(parsedDetails.username);
          setEmail(parsedDetails.email);
          setMobile(parsedDetails.mobile);
          setKey(parsedDetails.key);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user details.');
      }
    };

    fetchUserDetails();
  }, [navigation]);

  const validateEmail = (email) => {
    const emailRegex = /\S+@nic\.in/;  // Regex to validate '@nic.in' domain
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const handleRegister = async () => {
    if (!username || !email || !mobile || !key) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (!validateMobile(mobile)) {
      Alert.alert('Error', 'Mobile number must be 10 digits.');
      return;
    }

    if (key.length < 5) {
      Alert.alert('Error', 'Personal Key must be at least 6 characters long.');
      return;
    }

    const userDetails = { username, email, mobile, key };

    try {
      await AsyncStorage.setItem('userDetails', JSON.stringify(userDetails));
      Alert.alert('Success', 'Registration successful.');
      navigation.navigate('CodeGeneration');
    } catch (error) {
      Alert.alert('Error', 'Failed to save user details.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.header}>User Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Personal Key"
            value={key}
            onChangeText={setKey}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f9',
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: '#4CAF50',
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

export default Registration;
