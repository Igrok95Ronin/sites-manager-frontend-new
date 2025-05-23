import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../axiosInstance';
import Spinner from '../Spinner/Spinner';
import Table from './Table/Table';
import TableSource from './TableSource/TableSource';
import Search from './Search/Search';

export default function DomainMonitoring() {
  // Состояние для хранения данных, полученных с сервера (например, домены или статус мониторинга)
  const [data, setData] = useState([]);

  // Состояние для хранения ошибок, которые могут возникнуть при запросах данных
  const [error, setError] = useState(null);

  // Состояние для отслеживания состояния загрузки данных (true, пока данные загружаются)
  const [loading, setLoading] = useState(true);

  // Состояние для хранения текста поискового запроса, который используется для фильтрации данных
  const [searchQuery, setSearchQuery] = useState('');

  // Состояние для хранения флага, который указывает, запущен ли мониторинг (true или false)
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Состояние для хранения отформатированного времени (например, "4h 30m 20s")
  const [formattedDuration, setFormattedDuration] = useState('');

  // Обновленный парсинг длительности
  const parseDuration = (durationString) => {
    let hours = 0,
      minutes = 0,
      seconds = 0;

    // Используем более надежный парсинг
    const hoursMatch = durationString.match(/(\d+)h/);
    const minutesMatch = durationString.match(/(\d+)m/);
    const secondsMatch = durationString.match(/(\d+)s/);

    if (hoursMatch) hours = parseInt(hoursMatch[1], 10);
    if (minutesMatch) minutes = parseInt(minutesMatch[1], 10);
    if (secondsMatch) seconds = parseInt(secondsMatch[1], 10);

    return { hours, minutes, seconds };
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/monitordomainsstatus');
      setData(response.data.domains);
      setIsMonitoring(response.data.isMonitoring);

      // Обновленное форматирование времени
      const { hours, minutes, seconds } = parseDuration(response.data.finalDuration);

      // Новая логика отображения времени
      let result;
      if (hours > 0) {
        result = `${hours} ч`;
      } else if (minutes > 0) {
        result = `${minutes} м`;
      } else {
        result = `${seconds} с`; // Всегда показываем хотя бы секунды
      }

      setFormattedDuration(result);
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = data.filter((item) => item.domain.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <Search
        onSearch={setSearchQuery}
        numberOfDomains={filteredData.length}
        setError={setError}
        isMonitoring={isMonitoring}
        setIsMonitoring={setIsMonitoring}
        fetchData={fetchData}
      />
      {loading ? (
        <Spinner loading={loading} />
      ) : error ? (
        <div className="error-message" style={{ color: 'red' }}>
          {error}
        </div>
      ) : (
        <div>
          <Table data={filteredData} fetchData={fetchData} formattedDuration={formattedDuration} setError={setError} />
          <TableSource data={filteredData} fetchData={fetchData} setError={setError} />
        </div>
      )}
    </>
  );
}
