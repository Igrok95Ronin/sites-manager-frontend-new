// src/axiosInstance.js
import axios from 'axios';
import Cookies from 'js-cookie';

const APIURL = process.env.REACT_APP_APIURL; // Получаем URL из конфига

// Получаем URL API из переменных окружения
// const APIURL = process.env.REACT_APP_APIURL;

// Функция для кодирования логина и пароля в Base64
const encodeCredentials = (username, password) => {
  return btoa(`${username}:${password}`);
};

// Создаем экземпляр Axios с базовыми настройками
const axiosInstance = axios.create({
  baseURL: `${APIURL}`,
  headers: {
    'Content-Type': 'application/json',
    // Другие глобальные заголовки, если необходимо
  },
});

// Добавляем перехватчик запросов для установки заголовка Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const username = Cookies.get('username');
    const password = Cookies.get('password');

    if (username && password) {
      const encodedCredentials = encodeCredentials(username, password);
      config.headers.Authorization = `Basic ${encodedCredentials}`;
      // Добавьте другие заголовки, например, X-Api-Password, если необходимо
      config.headers['X-Api-Password'] = process.env.REACT_APP_XAPIPASSWORD;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
