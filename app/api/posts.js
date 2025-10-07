// api/posts.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_URL = "http://192.168.1.6:3000/api/posts";

// Funkcija za dobavljanje svih postova
const getAllPosts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Greška pri dobavljanju postova:", error.response.data);
    throw error;
  }
};

// Funkcija za kreiranje novog posta (sada radi na svim platformama)
const createPost = async (title, content, image) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      throw new Error("Korisnik nije prijavljen.");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (image) {
      // Logika za razlikovanje platformi
      if (Platform.OS === "web") {
        // Pristup za WEB: Pretvaranje u Blob
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const filename = image.uri.split("/").pop();
        formData.append("image", blob, filename);
      } else {
        // Pristup za MOBILNE telefone: Korišćenje { uri, name, type } objekta
        const filename = image.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", { uri: image.uri, name: filename, type });
      }
    }

    const response = await axios.post(API_URL, formData, {
      headers: {
        "x-auth-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri kreiranju posta:", error.response?.data || error.message);
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

// Ažurirana funkcija za update posta (sada radi na svim platformama)
const updatePost = async (postId, title, content, image) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Nema tokena za autorizaciju.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (image) {
      if (Platform.OS === "web") {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const filename = image.uri.split("/").pop();
        formData.append("image", blob, filename);
      } else {
        const filename = image.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", { uri: image.uri, name: filename, type });
      }
    }

    const response = await axios.put(`${API_URL}/${postId}`, formData, {
      headers: {
        "x-auth-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Greška pri ažuriranju posta ${postId}:`, error.response?.data || error.message);
    throw error;
  }
};

const deletePost = async (postId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Nema tokena za autorizaciju.");

    const response = await axios.delete(`${API_URL}/${postId}`, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  } catch (error) {
    console.error(`Greška pri brisanju posta ${postId}:`, error.response.data);
    throw error;
  }
};

export { getAllPosts, createPost, getPostById, deletePost, updatePost };
