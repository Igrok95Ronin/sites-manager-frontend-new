import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance'; // Используем централизованный экземпляр Axios

import Spinner from '../Spinner/Spinner';
import Table from './Table/Table';
import TableSource from './TableSource/TableSource'
import Search from './Search/Search';

export default function DomainMonitoring() {
  // Состояния для хранения данных и ошибок
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Поисковый запрос
  const [isMonitoring, setIsMonitoring] = useState(true); // флаг, указывающий, запущен ли мониторинг.

  // Асинхронная функция для получения данных
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/monitordomainsstatus');
      setData(response.data.domains); // Сохранение полученных данных
      setIsMonitoring(response.data.isMonitoring)
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
  const filteredData = data.filter((item) => item.domain.toLowerCase().includes(searchQuery.toLowerCase()));

  // Количество доменов
  const numberOfDomains = filteredData.length;

  console.log(data, isMonitoring)

  return (
    <>
      <Search onSearch={setSearchQuery} numberOfDomains={numberOfDomains} setError={setError} isMonitoring={isMonitoring} setIsMonitoring={setIsMonitoring}/>
      {loading ? (
        <Spinner loading={loading} />
      ) : error ? (
        <div className="error-message" style={{ color: 'red' }}>
          {error}
        </div>
      ) : (
        // <Table items={filteredData} onUpdateGoogleAccounts={fetchData} setDeleteGA={setDeleteGA} />
        <div>
          {/* Выводим домены */}
          <Table data={filteredData} fetchData={fetchData} setError={setError} />
          <TableSource data={filteredData} fetchData={fetchData} setError={setError} />
        </div>
      )}
    </>
  );
}
