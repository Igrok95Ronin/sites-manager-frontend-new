import { useEffect } from 'react';
import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

// Функция для отправки запроса на сервер
const request = async (
  domainClearCache,
  setLoading,
  setError,
  setData,
  setOpen,
) => {
  setLoading(true);
  setError(null);
  try {
    // const response = await axios.post('http://localhost:8082/purgecache', {
    //   domain: domainClearCache,
    // });
    const response = await axios.post(  `${APIURL}/purgecache`, {
      domain: domainClearCache,
    });
    setData(response.data);
    setLoading(false);
    setOpen(true); // Выводит ошибку в сообщении
  } catch (error) {
    setError(error);
    setOpen(true); // Выводит ошибку в сообщении
  } finally {
    setLoading(false);
  }
};

const ClearCache = ({
  domainClearCache,
  setCallClearCache,
  setLoading,
  setError,
  setData,
  setOpen,
}) => {
  useEffect(() => {
    // Сбрасываем флаг вызова после рендеринга
    setCallClearCache(false);

    // Выполняем запрос на сервер
    request(domainClearCache, setLoading, setError, setData, setOpen);

    // Добавляем зависимость, чтобы эффект выполнялся при изменении domainClearCache
  }, [
    domainClearCache,
    setCallClearCache,
    setLoading,
    setError,
    setData,
    setOpen,
  ]);

  return null; // Ваш компонент ничего не рендерит, можно вернуть null или JSX
};

export default ClearCache;
