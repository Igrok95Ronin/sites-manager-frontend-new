import { useState, useCallback, useRef } from 'react';

/**
 * Оптимизированный хук для хранения массивов dataKey столбцов
 * (или любых строк) в localStorage с мемоизацией.
 *
 * @param {string} key - ключ в localStorage.
 * @param {string[]} initialValue - начальный массив dataKey.
 * @returns [dataKeys, setDataKeys]
 */
function useLocalStorageDataKeys(key, initialValue) {
  // Кэшируем значение для избежания повторного парсинга
  const cacheRef = useRef(null);
  
  const [dataKeys, setDataKeys] = useState(() => {
    if (cacheRef.current !== null) {
      return cacheRef.current;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      // Парсим JSON, если возможно
      const parsedValue = item ? JSON.parse(item) : initialValue;
      cacheRef.current = parsedValue;
      return parsedValue;
    } catch (error) {
      console.error(`Ошибка при чтении ${key} из localStorage:`, error);
      cacheRef.current = initialValue;
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      // Если передали функцию, вызываем её, иначе берём как есть
      const valueToStore = value instanceof Function ? value(dataKeys) : value;

      // Проверяем, изменилось ли значение, чтобы избежать лишних обновлений
      if (JSON.stringify(valueToStore) === JSON.stringify(dataKeys)) {
        return;
      }

      setDataKeys(valueToStore);
      cacheRef.current = valueToStore;
      // Сохраняем в localStorage строковый массив
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Ошибка при записи ${key} в localStorage:`, error);
    }
  }, [key, dataKeys]);

  return [dataKeys, setValue];
}

export default useLocalStorageDataKeys;
