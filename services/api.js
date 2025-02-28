import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8080'; // Replace with your actual backend URL

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