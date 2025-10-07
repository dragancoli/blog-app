// api/auth.js
import axios from "axios";

const API_URL = "http://192.168.1.6:3000/api/auth";

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    // Ako je login uspešan, vraćamo podatke (uključujući token)
    return response.data;
  } catch (error) {
    // U slučaju greške, izbacujemo grešku da je obradimo na ekranu
    console.error("Login error:", error.response.data);
    throw error;
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response.data);
    throw error;
  }
};

export { login, register };
