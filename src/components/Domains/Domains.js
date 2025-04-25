// src/components/Domains/Domains.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';

import Table from './Table/Table';
import Search from './Search/Search';
import AddDomain from './AddDomains/AddDomain';
import Spinner from '../Spinner/Spinner';

import './Domains.scss';

const Domains = () => {
  const [domains, setDomains] = useState([]); // Данные доменов
  const [subDomains, setSubDomains] = useState([]); // Поддомены
  const [searchQuery, setSearchQuery] = useState(''); // Поисковый запрос
  const [errorMessage, setErrorMessage] = useState(''); // Сообщение об ошибке
  const [loading, setLoading] = useState(true); // Состояние загрузки

  // Функция для получения доменов и поддоменов
  const fetchDomains = async () => {
    try {
      setLoading(true);
      const [domainsResponse, subDomainsResponse] = await Promise.all([
        axiosInstance.get('/viewdomains'),
        axiosInstance.get('/viewsubdomains'),
      ]);

      axiosInstance.patch(`/updatedomainstatus`).catch((error) => {
        console.log('Ошибка при обновлении статуса:', error);
      });

      setDomains(domainsResponse.data);
      setSubDomains(subDomainsResponse.data);
    } catch (error) {
      setErrorMessage('Ошибка при загрузке данных доменов.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  // Организуем домены и поддомены
  const organizeDomains = (domains, subDomains) => {
    if (!domains) {
      return [];
    }
    return domains.map((domain) => ({
      ...domain,
      subDomains: subDomains.filter((sub) => sub.domain === domain.domain),
    }));
  };

  const organizedData = organizeDomains(domains, subDomains);

  // Фильтруем данные по поисковому запросу
  const filteredData = organizedData
    ? organizedData
        .map((item) => {
          const isDomainMatch = item.domain.toLowerCase().includes(searchQuery.toLowerCase());

          const filteredSubDomains = item.subDomains.filter((subDomain) =>
            subDomain.subDomain.toLowerCase().includes(searchQuery.toLowerCase()),
          );

          return {
            ...item,
            subDomains: isDomainMatch ? item.subDomains : filteredSubDomains,
          };
        })
        .filter((item) => item.domain.toLowerCase().includes(searchQuery.toLowerCase()) || item.subDomains.length > 0)
    : [];

  const numberOfDomains = filteredData.reduce((acc, item) => acc + 1 + item.subDomains.length, 0);

  if (loading) {
    return <Spinner loading={loading}></Spinner>;
  }

  if (errorMessage) {
    return <div style={{ color: 'red' }}>{errorMessage}</div>;
  }

  return (
    <>
      <Search onSearch={setSearchQuery} numberOfDomains={numberOfDomains} />
      <Table items={filteredData} onUpdateDomains={fetchDomains} searchQuery={searchQuery} />
      <AddDomain onUpdateDomains={fetchDomains} />
      {loading && <Spinner loading={loading} />}
    </>
  );
};

export default Domains;
