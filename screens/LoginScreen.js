import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
// Import icons - you'll need to install @expo/vector-icons or react-native-vector-icons
import { AntDesign } from '@expo/vector-icons';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

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

  const handleEmailContinue = () => {
    navigation.navigate('Nickname', { email });
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
        />

        {/* Email Button */}
        <TouchableOpacity 
          style={styles.emailButton}
          onPress={handleEmailContinue}
        >
          <Text style={styles.buttonText}>Continue with Email</Text>
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
});

export default LoginScreen;