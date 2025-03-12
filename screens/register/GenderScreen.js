import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';

const GenderScreen = ({ navigation, route }) => {
  const [gender, setGender] = useState('');
  const { email, password, isGoogleLogin, nickname, bio } = route.params;

  const genderOptions = [
    'Female',
    'Male',
    'Other',
    'Prefer not to say'
  ];

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    navigation.navigate('Birthday', {
      email,
      password,
      isGoogleLogin,
      nickname,
      bio,
      gender: selectedGender
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Gender</Text>

        {genderOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.genderButton,
              gender === option && styles.selectedButton
            ]}
            onPress={() => handleGenderSelect(option)}
          >
            <Text style={styles.genderText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    marginBottom: 60,
    fontWeight: 'bold',
  },
  genderButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedButton: {
    backgroundColor: '#333',
  },
  genderText: {
    color: 'white',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
  },
  backButtonText: {
    color: '#666',
    fontSize: 18,
  },
  continueButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
  },
  continueButtonText: {
    color: '#666',
    fontSize: 18,
  },
});

export default GenderScreen; 