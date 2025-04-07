import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance'; // Используем централизованный экземпляр Axios

import Spinner from '../Spinner/Spinner';
import Table from './Table/Table';
import Search from './Search/Search';

export default function DomainMonitoring() {
  // Состояния для хранения данных и ошибок
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Поисковый запрос

  // Асинхронная функция для получения данных
  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/monitordomainsstatus');
      setData(response.data); // Сохранение полученных данных
    } catch (err) {
      console.error('Произошла ошибка при получении данных:', err);
      setError(err);
    } finally {
      setLoading(false); // Завершение загрузки
    }
  };

  // Выполнение запроса при монтировании компонента
  useEffect(() => {
    fetchData();
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз

  // Фильтрация данных по поисковому запросу
  const filteredData = data.filter((item) =>
    item.domain.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const numberOfDomains = filteredData.length;

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  return (
    <>
      <Search onSearch={setSearchQuery} numberOfDomains={numberOfDomains} />
      {loading ? (
        <Spinner loading={loading} />
      ) : error ? (
        <div className="error-message" style={{ color: 'red' }}>
          {error}
        </div>
      ) : (
        // <Table items={filteredData} onUpdateGoogleAccounts={fetchData} setDeleteGA={setDeleteGA} />
        <div>
          <Table data={filteredData} />
        </div>
      )}
    </>
  );
}
