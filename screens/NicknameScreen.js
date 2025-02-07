import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const NicknameScreen = () => {
  const [nickname, setNickname] = useState('');
  const navigation = useNavigation();
  const route = useRoute();

  const handleContinue = () => {
    if (nickname.length > 0) {
      navigation.navigate('Gender', { 
        email: route.params?.email,
        nickname 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What should I{'\n'}call you?</Text>
        
        <Text style={styles.subtitle}>
          Your information will only be used for personal customization and to make tarot interpretations more relevant.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your nickname"
          placeholderTextColor="#666"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={[styles.continueButton, nickname.length > 0 && styles.activeButton]}
          onPress={handleContinue}
          disabled={nickname.length === 0}
        >
          <Text style={styles.arrowIcon}>→</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
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
  continueButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5C5CFF',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  activeButton: {
    opacity: 1,
  },
  arrowIcon: {
    color: 'white',
    fontSize: 24,
  },
});

export default NicknameScreen;
