import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { loginUser } from '../services/api'; // Import loginUser
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

GoogleSignin.configure({
  webClientId: '776267765563-f9rjs6jav75c50mvsdupk9d5s8qrqel8.apps.googleusercontent.com', 
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], 
  offlineAccess: true, 
  forceCodeForRefreshToken: false, 
  iosClientId: '776267765563-qqr5df6oibl0cpmh5ca6rk948245k20r.apps.googleusercontent.com',
});



const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

// Frontend implementation
const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    console.log('Google Play Services available');

    const response = await GoogleSignin.signIn();
    console.log('Google Sign-in response:', response.data.idToken);

    if (response?.data.idToken) {
      try {
        console.log('Sending ID Token to backend:', response.data.idToken);
        const backendResponse = await fetch('http://localhost:8080/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            idToken: response.data.idToken 
          }),
        });

        console.log('Backend status:', backendResponse.status);
        const responseText = await backendResponse.text();
        console.log('Backend raw response:', responseText);

        let data;
        try {
          data = responseText ? JSON.parse(responseText) : null;
        } catch (e) {
          console.error('JSON parsing error:', e);
          throw new Error('Invalid response format from server');
        }

        if (!backendResponse.ok) {
          throw new Error(`Server error: ${data?.message || backendResponse.statusText}`);
        }

        console.log('Backend parsed response:', data);

        if (data?.success) {
          console.log('data:', data);
          if (data.message === '01') {
            navigation.navigate('Nickname', { 
              email: data.email,
              isGoogleLogin: data.google,
            });
          } else if (data.message === '02') {
            await AsyncStorage.setItem('userToken', data.token);
            navigation.navigate('MainScreen', {
              userData: data.user,
              token: data.token
            });
          }
        } else {
          throw new Error(data?.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('Backend communication error:', error);
        Alert.alert('Error', error.message || 'Authentication failed');
      }
    }
  } catch (error) {
    console.error('Google Sign-in error:', error);
    Alert.alert('Error', 'Google sign-in failed. Please try again.');
  }
};

  const isSuccessResponse = (response) => {
    return response && response.type === 'success' && response.data && response.data.idToken;
  };


  const handleEmailContinue = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isSignUp) {
        navigation.navigate('Nickname', { 
          email: email,
          password: password,
          isGoogleLogin: false,
          fromGoogle: false
        });
      } else {
        // If logging in, attempt login
        const response = await loginUser(email, password);
        console.log('Login response:', response);
        
        if (response.success) {
          // If login successful, navigate to tarot deck
          navigation.navigate('TarotDeck', { 
            userData: response.userData 
          });
        } else {
          Alert.alert('Login Failed', response.message || 'Invalid credentials');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Start your Journey{'\n'}with Quin </Text>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        {/* Email Button */}
        <TouchableOpacity 
          style={[styles.emailButton, isLoading && styles.disabledButton]}
          onPress={handleEmailContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up with Email' : 'Login with Email'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle Sign Up/Login */}
        <TouchableOpacity 
          onPress={() => setIsSignUp(!isSignUp)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <AntDesign name="apple1" size={24} color="white" />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleSignIn}>
          <AntDesign name="google" size={24} color="black" />
          <Text style={[styles.socialButtonText, styles.googleText]}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <Text style={styles.terms}>
          By continuing, you acknowledge that you have read and agree to our{' '}
          <Text style={styles.termsLink}>Terms and Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: 'white',
    marginBottom: 20,
  },
  emailButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#5C5CFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 10,
  },
  socialButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#333',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  googleButton: {
    backgroundColor: 'white',
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  googleText: {
    color: 'black',
  },
  terms: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
  termsLink: {
    color: 'white',
    textDecorationLine: 'underline',
  },
  toggleButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  toggleText: {
    color: '#5C5CFF',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default LoginScreen;