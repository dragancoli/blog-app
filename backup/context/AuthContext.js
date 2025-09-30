// context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    setUserToken(data.token);
    await AsyncStorage.setItem('userToken', data.token);
  };

  const register = async (username, email, password) => {
    const data = await apiRegister(username, email, password);
    setUserToken(data.token);
    await AsyncStorage.setItem('userToken', data.token);
  };

  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  const bootstrap = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    } catch (e) {
      console.log('Auth bootstrap error', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <AuthContext.Provider value={{ login, logout, register, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};