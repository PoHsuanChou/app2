const BASE_URL = 'YOUR_BACKEND_URL'; // Replace with your actual backend URL

export const registerUser = async (userData) => {
  try {
    console.log("userData",userData)
    const response = await fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration Error:', error);
    throw error;
  }
}; 