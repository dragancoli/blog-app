// api/posts.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.7:3000/api/posts';

// Funkcija za dobavljanje svih postova
const getAllPosts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Greška pri dobavljanju postova:', error.response.data);
    throw error;
  }
};

// Funkcija za kreiranje novog posta (trebaće nam uskoro)
const createPost = async (title, content) => {
  try {
    // Uzimamo token iz AsyncStorage-a da bismo se autorizovali
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Korisnik nije prijavljen.');
    }

    const response = await axios.post(
      API_URL,
      { title, content },
      { headers: { 'x-auth-token': token } }
    );
    return response.data;
  } catch (error) {
    console.error('Greška pri kreiranju posta:', error.response.data);
    throw error;
  }
};

const getPostById = async (postId) => {
  try {
    const response = await axios.get(`${API_URL}/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Greška pri dohvatanju posta sa ID-om ${postId}:`, error.response.data);
    throw error;
  }
};

const updatePost = async (postId, title, content) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Nema tokena za autorizaciju.');
    const response = await axios.put(
      `${API_URL}/${postId}`,
      { title, content },
      { headers: { 'x-auth-token': token } }
    );
    return response.data;
  } catch (error) {
    console.error(`Greška pri ažuriranju posta ${postId}:`, error.response?.data || error.message);
    throw error;
  }
};

const deletePost = async (postId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Nema tokena za autorizaciju.');

    const response = await axios.delete(`${API_URL}/${postId}`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (error) {
    console.error(`Greška pri brisanju posta ${postId}:`, error.response.data);
    throw error;
  }
};

export { getAllPosts, createPost , getPostById, deletePost, updatePost };