import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';

const BASE_URL = 'http://192.168.68.52:8080';

export const registerUser = async (userData) => {
  try {
    console.log("Registration data:", userData);
    
    const registrationData = {
      email: userData.email,
      password: userData.password,
      nickname: userData.nickname,
      gender: userData.gender,
      birthday: userData.birthday,
      profileImage: userData.profileImage,
      selectedCard: userData.selectedCard,
    };

    const response = await fetch(`${BASE_URL}/api/login/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store auth token if provided
    if (data.token) {
      // await AsyncStorage.setItem('userToken', data.token);
    }

    return {
      success: true,
      userData: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('Registration Error:', error);
    return {
      success: false,
      message: error.message || 'Registration failed'
    };
  }
};

// Add login function
export const loginUser = async (email, password) => {
  try {
    console.log("Login attempt for:", email);
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store auth token if your backend provides one
    if (data.token) {
      // You might want to store this token for future authenticated requests
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userId', data.userId);
    }

    return {
      success: true,
      userId: data.userId,
      token: data.token
    };
  } catch (error) {
    console.error('Login Error:', error);
    return {
      success: false,
      message: error.message || 'Login failed'
    };
  }
};

export const updateUserProfile = async (updateData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Update failed');
    }

    return {
      success: true,
      userData: data.user
    };
  } catch (error) {
    console.error('Update Error:', error);
    return {
      success: false,
      message: error.message || 'Update failed'
    };
  }
};

export const fetchMatchesAndMessages = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    // Fetch matches
    const matchesResponse = await fetch(`${BASE_URL}/api/matches/findMatches`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const matchesData = await matchesResponse.json();

    // Fetch messages
    const messagesResponse = await fetch(`${BASE_URL}/api/matches/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const messagesData = await messagesResponse.json();
    console.log('messagesData:', messagesData);

    return {
      matches: matchesData,
      messages: messagesData.map(message => ({
        id: message.id,
        name: message.name || 'Anonymous',
        message: message.lastMessage || '',
        image: message.image ? { uri: `https://api.quin.world/uploads/${message.image}` } : require('../assets/placeholder.png'),
        yourTurn: message.yourTurn || false
      }))
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkDailyTarotStatus = async () => {
  try {
    console.log('Checking daily tarot status');
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(`${BASE_URL}/api/cards/check-draw`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Daily tarot status data:', data);
    return data; // true if user has already drawn today, false otherwise
  } catch (error) {
    console.error('Error checking daily tarot status:', error);
    throw error;
  }
};

export const tarotApi = {
  getCardDetails: async (cardId) => {
    try {
      console.log('Fetching card details for cardId:', cardId);
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token:', token);
      const response = await fetch(`${BASE_URL}/api/cards/getCard`,{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
      });
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch card data');
      }
      
      const data = await response.json();
      console.log('Card data received:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // 你可以在這裡添加其他塔羅牌相關的 API 方法
};

/**
 * Updates the user's profile picture
 * @param {Object} data - The profile data
 * @param {string} data.profileImage - The URI of the profile image
 * @returns {Promise<Object>} - Response from the server
 */
export const updateProfilePicture = async (data) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    console.log('Token:', token);
    const imageUri = data.profileImage;
    console.log('Original image URI:', imageUri);

    // Compress and resize the image
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Create form data with the correct file information
    const formData = new FormData();
    formData.append('profileImage', {
      uri: manipResult.uri,
      type: 'image/jpeg',
      name: 'profileImage.jpg',  // Ensure this matches backend expectation
    });

    console.log('FormData:', formData);

    const response = await fetch(`${BASE_URL}/api/user/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update profile picture');
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, message: error.message || 'Something went wrong' };
  }
};

export const uploadProfileImage = async (imageUri) => {
  try {
    // Compress and resize the image
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Create form data with the correct file information
    const formData = new FormData();
    formData.append('profileImage', {
      uri: manipResult.uri,
      type: 'image/jpeg',
      name: 'profileImage.jpg',  // Ensure this matches backend expectation
    });

    console.log("wefwefwefwef: ", formData);

    // Send the image to the server
    const response = await fetch(`${BASE_URL}/api/user/profile-picture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteUploadedImage = async (imageUrl) => {
  try {
    const response = await fetch(`${BASE_URL}/api/delete-image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Function to get the user's profile image
export const getUserProfileImage = async () => {
  try {
    console.log('Fetching profile image');
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Fetch the image URL
    const response = await fetch(`${BASE_URL}/api/user/profile-picture/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log('Got image URL:', data.message);

      // Append the token as a query parameter
      const imageUrl = `${data.message}?auth=${encodeURIComponent(token)}`;

      return {
        success: true,
        imageUrl: imageUrl
      };
    } else {
      console.log('Profile image fetch failed');
      const errorData = await response.json();
      console.log('Error Response:', errorData);
      return {
        success: false,
        message: 'Failed to fetch profile image',
      };
    }
  } catch (error) {
    console.error('Error fetching profile image:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching the profile image',
    };
  }
}; 