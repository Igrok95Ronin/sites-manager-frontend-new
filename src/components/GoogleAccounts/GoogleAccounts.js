// src/components/GoogleAccounts/GoogleAccounts.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance'; // Используем централизованный экземпляр Axios

import Spinner from '../Spinner/Spinner';
import Search from './Search/Search';
import Table from './Table/Table';

import './GoogleAccounts.scss'; // Подключаем стили, если есть

const GoogleAccounts = () => {
  const [dataGoogleAccounts, setDataGoogleAccounts] = useState([]); // Инициализируем как пустой массив
  const [searchQuery, setSearchQuery] = useState(''); // Поисковый запрос
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [errorMessage, setErrorMessage] = useState(''); // Сообщение об ошибке
  const [deleteGA, setDeleteGA] = useState(false);

  console.log(dataGoogleAccounts);

  // Функция для получения данных Google Accounts
  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axiosInstance.get('/viewgoogleaccount'); // Используем централизованный экземпляр
      setDataGoogleAccounts(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке Google Accounts:', error);
      setErrorMessage('Ошибка при загрузке Google Accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Вызываем функцию при монтировании компонента
  }, [deleteGA]);

  // Фильтрация данных по поисковому запросу
  const filteredData = dataGoogleAccounts.filter((item) =>
    item.account_id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const numberOfAccounts = filteredData.length;

  return (
    <div className="google-accounts-container">
      <Search onSearch={setSearchQuery} numberOfDomains={numberOfAccounts} />

      {loading ? (
        <Spinner loading={loading} />
      ) : errorMessage ? (
        <div className="error-message" style={{ color: 'red' }}>
          {errorMessage}
        </div>
      ) : (
        <Table items={filteredData} onUpdateGoogleAccounts={fetchData} setDeleteGA={setDeleteGA} />
      )}
    </div>
  );
};

export default GoogleAccounts;
