// api/users.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_BASE = "http://192.168.1.6:3000/api";

const authHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  return token ? { "x-auth-token": token } : {};
};

export const getMe = async () => {
  const headers = await authHeader();
  const res = await axios.get(`${API_BASE}/users/me`, { headers });
  return res.data;
};

export const updateMe = async (payload) => {
  const headers = await authHeader();
  const formData = new FormData();

  if (payload.bio !== undefined) {
    formData.append("bio", payload.bio);
  }

  if (payload.avatar) {
    const avatar = payload.avatar;
    if (Platform.OS === "web") {
      const response = await fetch(avatar.uri);
      const blob = await response.blob();
      const filename = avatar.uri.split("/").pop();
      formData.append("avatar", blob, filename);
    } else {
      const filename = avatar.uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append("avatar", { uri: avatar.uri, name: filename, type });
    }
  }

  const res = await axios.put(`${API_BASE}/users/me`, formData, { headers });
  return res.data;
};

export const getUserProfile = async (userId) => {
  const headers = await authHeader();
  const res = await axios.get(`${API_BASE}/users/${userId}`, { headers });
  return res.data;
};

export const getUserPosts = async (userId) => {
  const res = await axios.get(`${API_BASE}/users/${userId}/posts`);
  return res.data;
};
