import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NicknameScreen = ({ navigation, route }) => {
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const { email, password, isGoogleLogin} = route.params;

  const handleContinue = () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '請輸入暱稱');
      return;
    }

    navigation.navigate('Gender', {
      email,
      password,
      isGoogleLogin,
      nickname,
      bio: bio.trim()
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>你好!</Text>
            <Text style={styles.subtitle}>讓我們開始認識你</Text>
          </View>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder="輸入你的暱稱"
              placeholderTextColor="#666"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="介紹一下你自己..."
              placeholderTextColor="#666"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={200}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !nickname.trim() && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!nickname.trim()}
        >
          <Text style={styles.buttonText}>下一步</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
  },
  inputSection: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#f4511e',
    margin: 24,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#f4511e",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#333',
    shadowColor: "#000",
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default NicknameScreen;
