import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons';

const defaultProfileImage = require('../../assets/default-profile.png');

const ProfilePictureScreen = ({ navigation, route }) => {
  const [image, setImage] = useState(defaultProfileImage);
  const [isLoading, setIsLoading] = useState(false);

  console.log('ProfilePictureScreen route.params:', route.params);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleContinue = () => {
    if (!image) {
      Alert.alert('Please select a profile picture');
      return;
    }

    const registrationData = {
      ...route.params,  // includes email, password, isGoogleLogin, nickname, bio, gender, birthday
      profileImage: image
    };
    
    console.log('registrationData:', registrationData);

    // Navigate to Interests screen instead of TarotDeck
    navigation.navigate('Interests', registrationData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Your{'\n'}Profile Picture</Text>
      <Text style={styles.subtitle}>Choose a photo that best represents you</Text>

      <View style={styles.imageSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {typeof image === 'string' ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Image source={image} style={styles.profileImage} />
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.continueButton]}
        onPress={handleContinue}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  continueButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#5C5CFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  editBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 2,
    borderRadius: 10,
  },
  editBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProfilePictureScreen; 