import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from '../services/api';

const SettingsScreen = ({ navigation, route }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      const response = await updateUserProfile({
        currentPassword,
        newPassword,
        profileImage
      });

      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Edit</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Password Change Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor="#666"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#666"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#666"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity 
            style={[styles.updateButton, isLoading && styles.disabledButton]}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            <Text style={styles.updateButtonText}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5C5CFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: 'white',
    marginBottom: 15,
  },
  updateButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#5C5CFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF4444',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  backText: {
    color: 'white',
    fontSize: 28,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000',
  },
  navItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: 'white',
  },
});

export default SettingsScreen; 