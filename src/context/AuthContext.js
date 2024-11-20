// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authenticate } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [username, setUsername] = useState(Cookies.get('username') || '');
  const [password, setPassword] = useState(Cookies.get('password') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Функция для входа пользователя
  const login = async (username, password) => {
    setLoading(true);
    try {
      const result = await authenticate(username, password);
      setUsername(username);
      setPassword(password);
      setIsAuthenticated(true);
      setData(result);
      Cookies.set('username', username, { expires: 90 });
      Cookies.set('password', password, { expires: 90 });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Неправильный логин или пароль.');
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода пользователя
  const logout = () => {
    setUsername('');
    setPassword('');
    setIsAuthenticated(false);
    setData(null);
    Cookies.remove('username');
    Cookies.remove('password');
  };

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      const savedUsername = Cookies.get('username');
      const savedPassword = Cookies.get('password');

      if (savedUsername && savedPassword) {
        try {
          const result = await authenticate(savedUsername, savedPassword);
          setUsername(savedUsername);
          setPassword(savedPassword);
          setIsAuthenticated(true);
          setData(result);
          setErrorMessage('');
        } catch (error) {
          setErrorMessage('Неправильный логин или пароль.');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        data,
        username,
        password,
        isAuthenticated,
        loading,
        errorMessage,
        login,
        logout,
        setData, // Если необходимо обновлять данные
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
