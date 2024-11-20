// src/hooks/useLocalStorage.js

import { useState } from 'react';

/**
 * Хук для синхронизации состояния с localStorage
 * @param {string} key Ключ в localStorage
 * @param {*} initialValue Начальное значение
 * @returns [value, setValue]
 */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Парсим JSON, если возможно
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Ошибка при чтении ${key} из localStorage:`, error);
      return initialValue;
    }
  });

  const setValueLocal = (value) => {
    try {
      // Позволяет использовать функцию для обновления значения
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Сохраняем в localStorage как строку JSON
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Ошибка при записи ${key} в localStorage:`, error);
    }
  };

  return [storedValue, setValueLocal];
}

export default useLocalStorage;
