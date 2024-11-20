// src/services/authService.js
import axiosInstance from '../axiosInstance';

const encodeCredentials = (username, password) => {
  return btoa(`${username}:${password}`);
};

// Функция для аутентификации пользователя
export const authenticate = async (username, password) => {
  try {
    // Кодируем учетные данные
    const encodedCredentials = encodeCredentials(username, password);

    // Отправляем запрос на аутентификацию
    const response = await axiosInstance.post('/senddatatofrontend', {}, {
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        'X-Api-Password': process.env.REACT_APP_XAPIPASSWORD,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Ошибка при аутентификации:', error);
    throw error;
  }
};
