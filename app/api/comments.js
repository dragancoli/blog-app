// api/comments.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.1.4:3000/api';

const authHeader = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('Korisnik nije prijavljen.');
  return { 'x-auth-token': token };
};

export const getComments = async (postId, mode = 'tree') => {
  const res = await axios.get(`${API_BASE}/posts/${postId}/comments?mode=${mode}`);
  return res.data;
};

export const createComment = async (postId, content, parent_id = null) => {
  const headers = await authHeader();
  const res = await axios.post(
    `${API_BASE}/posts/${postId}/comments`,
    { content, parent_id },
    { headers }
  );
  return res.data;
};

export const updateComment = async (id, content) => {
  const headers = await authHeader();
  const res = await axios.put(
    `${API_BASE}/comments/${id}`,
    { content },
    { headers }
  );
  return res.data;
};

export const deleteComment = async (id) => {
  const headers = await authHeader();
  const res = await axios.delete(
    `${API_BASE}/comments/${id}`,
    { headers }
  );
  return res.data;
};