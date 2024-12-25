import { useState } from 'react';

/**
 * Хук для хранения массивов dataKey столбцов
 * (или любых строк) в localStorage.
 *
 * @param {string} key - ключ в localStorage.
 * @param {string[]} initialValue - начальный массив dataKey.
 * @returns [dataKeys, setDataKeys]
 */
function useLocalStorageDataKeys(key, initialValue) {
  const [dataKeys, setDataKeys] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Парсим JSON, если возможно
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Ошибка при чтении ${key} из localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Если передали функцию, вызываем её, иначе берём как есть
      const valueToStore = value instanceof Function ? value(dataKeys) : value;

      setDataKeys(valueToStore);
      // Сохраняем в localStorage строковый массив
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Ошибка при записи ${key} в localStorage:`, error);
    }
  };

  return [dataKeys, setValue];
}

export default useLocalStorageDataKeys;
