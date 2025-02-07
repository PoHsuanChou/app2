import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
// Import icons - you'll need to install @expo/vector-icons or react-native-vector-icons
import { AntDesign } from '@expo/vector-icons';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { loginUser } from '../services/api'; // Import loginUser

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

//   const handleGoogleSignIn = async () => {
//     try {
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       // Handle sign-in success
//       console.log(userInfo);
//     } catch (error) {
//       console.error(error);
//     }
//   };

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
        // If signing up, proceed to nickname screen
        navigation.navigate('Nickname', { 
          email,
          password
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

        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
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