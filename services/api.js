const BASE_URL = 'localhost:8080'; // Replace with your actual backend URL

export const registerUser = async (userData) => {
  try {
    console.log("Registration data:", userData);
    
    const registrationData = {
      email: userData.email,
      password: userData.password,
      nickname: userData.nickname,
      gender: userData.gender,
      birthday: userData.birthday,
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
    
    const response = await fetch(`${BASE_URL}/api/users/login`, {
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
      // await AsyncStorage.setItem('userToken', data.token);
    }

    return {
      success: true,
      userData: data.user,
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