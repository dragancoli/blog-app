// api/users.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.1.7:3000/api'; 

const authHeader = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return token ? { 'x-auth-token': token } : {};
};

export const getMe = async () => {
  const headers = await authHeader();
  const res = await axios.get(`${API_BASE}/users/me`, { headers });
  return res.data;
};

export const updateMe = async (payload) => {
  const headers = await authHeader();
  const res = await axios.put(`${API_BASE}/users/me`, payload, { headers });
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