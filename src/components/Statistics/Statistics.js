import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../axiosInstance'; // Используем централизованный экземпляр Axios
import axios from 'axios';
import { startOfDay, endOfDay, isToday, isSameYear } from 'date-fns'; // Добавлено isSameYear

import Tabs from './Tabs/Tabs.js';
import ColumnSelector from './Tabs/ColumnSelector/ColumnSelector.js';
import useLocalStorageDataKeys from './Tabs/UseLocalStorage/UseLocalStorage.js'; // Импортируем кастомный хук
import CompanyNames from './Tabs/CompanyNames/CompanyNames.js';
import GoogleAccounts from './Tabs/GoogleAccounts/GoogleAccounts.js';

// Все заголовки
import {
  allColumns,
  headerFieldsDataKeys,
  jsDataFieldsDataKeys,
  defaultVisibleDataKeys,
} from './Tabs/Columns/Columns.js';

// Здесь определяем «компоненты» для библиотеки виртуализации (Virtuoso).
import { VirtuosoTableComponents } from './Tabs/VirtuosoTableComponents/VirtuosoTableComponents.js';

// В этом компоненте располагаем всю логику отрисовки одной строки
import TableRowRender from './Tabs/TableRowRender/TableRowRender.js';

// Выносим логику формирования шапки (заголовка) таблицы, включая Drag and Drop
import TableHeader from './Tabs/TableHeader/TableHeader.js';

import './Statistics.scss';

// =========================================
// 5) Главный компонент: ReactVirtualizedTable
// =========================================
export default function ReactVirtualizedTable() {
  // -----------------------------------
  // (A) Храним массив строк (dataKey) в localStorage:
  // -----------------------------------
  const [visibleDataKeys, setVisibleDataKeys] = useLocalStorageDataKeys(
    'visibleColumnsDataKeys',
    defaultVisibleDataKeys,
  );

  // На основе visibleDataKeys восстанавливаем объекты столбцов (с иконками) с сохранением порядка
  const visibleColumns = React.useMemo(() => {
    return visibleDataKeys.map((key) => allColumns.find((col) => col.dataKey === key)).filter(Boolean);
  }, [visibleDataKeys]);

  // «Расширенный» набор dataKeys (если нужно)
  const [expandedCell, setExpandedCell] = useState(null);

  // -----------------------------------
  // (B) Прочие состояния
  // -----------------------------------
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(() => {
    try {
      const item = window.localStorage.getItem('search_limit');
      return item ? JSON.parse(item) : 300;
    } catch (error) {
      console.error('Ошибка при чтении search_limit из localStorage:', error);
      return 300;
    }
  });
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [order, setOrder] = useState('desc');

  // Сортируем первоначально по первому столбцу из defaultVisibleDataKeys
  // const [orderBy, setOrderBy] = useState(defaultVisibleDataKeys[0] || 'ID');
  const [orderBy, setOrderBy] = useState('CreatedAt');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const loadingRef = useRef(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchField, setSearchField] = useState(() => {
    try {
      const item = window.localStorage.getItem('search_searchField');
      return item ? JSON.parse(item) : 'Domain';
    } catch (error) {
      console.error('Ошибка при чтении search_searchField из localStorage:', error);
      return 'Domain';
    }
  });

  // Для показа JSON-структур
  const [formattedJSON, setFormattedJSON] = useState({});

  // Чекбоксы внутри таблицы
  const [checkedRows, setCheckedRows] = useState({});

  // Двойной вывод Headers, JS
  const [doubleOutput, setDoubleOutput] = useState(() => {
    try {
      const item = window.localStorage.getItem('doubleOutput');
      return item ? JSON.parse(item) : true;
    } catch (error) {
      console.error('Ошибка при чтении doubleOutput из localStorage:', error);
      return true;
    }
  });

  // Фильтры
  const [filterByDomain, setFilterByDomain] = useLocalStorageDataKeys('filterByDomain', null); // Состояние для фильтрации по домену
  const [filterCompanyID, setFilterCompanyID] = useLocalStorageDataKeys('filterCompanyID', null); // Состояние для фильтрации по CompanyID
  const [filterAccountID, setFilterAccountID] = useLocalStorageDataKeys('filterAccountID', null); // Состояние для фильтрации по AccountID
  const [filterKeyword, setFilterKeyword] = useLocalStorageDataKeys('filterKeyword', null); // Состояние для фильтрации по filterKeyword
  // Данные CompanyID
  const [companyIDData, setCompanyIDData] = useState([]);
  // Данные GoogleAC
  const [dataGoogleAccounts, setDataGoogleAccounts] = useState([]);
  // -----------------------------------
  // (C) Загрузка данных
  // -----------------------------------
  const loadMoreRows = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const params = { limit, offset };

      // Если выбраны даты
      if (startDate) {
        const start = startOfDay(startDate);
        params.startDate = start.toISOString();
      }
      if (endDate) {
        const end = endOfDay(endDate);
        params.endDate = end.toISOString();
      }

      const requestStartTime = performance.now();
      const response = await axiosInstance.get(`${process.env.REACT_APP_APIURL}/userslogsads`, { params });

      const requestEndTime = performance.now();
      console.log(`Время отклика сервера: ${(requestEndTime - requestStartTime).toFixed(2)} мс`);

      if (response.data.length < limit) setHasMore(false);

      setRows((prevRows) => [...prevRows, ...response.data]);
      setOffset((prevOffset) => prevOffset + response.data.length);

      // Инициализация checkedRows
      const initialCheckedRows = {};
      response.data.forEach((row) => {
        initialCheckedRows[row.ID] = row.IsChecked || false;
      });
      setCheckedRows((prevCheckedRows) => ({
        ...prevCheckedRows,
        ...initialCheckedRows,
      }));
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [limit, offset, hasMore, startDate, endDate]);

  // Сбрасываем при изменении startDate, endDate, limit
  useEffect(() => {
    setRows([]);
    setOffset(0);
    setHasMore(true);
    loadingRef.current = false;
  }, [startDate, endDate, limit]);

  // Второй useEffect – следит, когда действительно надо грузить, и вызывает loadMoreRows():
  useEffect(() => {
    // Например, если offset == 0 и есть hasMore, то запускаем запрос
    if (!loadingRef.current && hasMore && offset === 0) {
      loadMoreRows();
    }
  }, [offset, hasMore, loadMoreRows]);

  // -----------------------------------
  // (D) Сортировка и поиск
  // -----------------------------------
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Если current orderBy не входит в видимые столбцы, переключаем на первый видимый
  useEffect(() => {
    if (!visibleColumns.some((col) => col.dataKey === orderBy)) {
      if (visibleColumns.length > 0) {
        setOrderBy(visibleColumns[0].dataKey);
      }
    }
  }, [visibleColumns, orderBy]);

  const sortedRows = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, order, orderBy]);

  // Фильтрация по полю searchField и поисковой строке searchQuery
  // Фильтрация по полю searchField, поисковой строке searchQuery и домену
  const filteredData = React.useMemo(() => {
    let data = sortedRows;

    // Применение фильтрации по полю поиска
    if (searchQuery) {
      data = data.filter((item) => {
        let fieldValue = item[searchField];
        if (fieldValue === undefined || fieldValue === null) return false;

        if (searchField === 'CreatedAt') {
          const date = new Date(fieldValue);
          fieldValue = date.toLocaleDateString('ru-RU');
        } else {
          fieldValue = fieldValue.toString();
        }

        return fieldValue.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Применение фильтрации по домену
    if (filterByDomain) {
      data = data.filter((item) => item.Domain === filterByDomain);
    }
    if (filterCompanyID) {
      data = data.filter((item) => item.CompanyID === filterCompanyID);
    }
    if (filterAccountID) {
      data = data.filter((item) => item.AccountID === filterAccountID);
    }
    if (filterKeyword) {
      data = data.filter((item) => item.Keyword === filterKeyword);
    }

    return data;
  }, [sortedRows, searchField, searchQuery, filterByDomain, filterCompanyID, filterAccountID, filterKeyword]);

  const processedData = React.useMemo(() => {
    return filteredData.map((row) => {
      // Обрабатываем дату 'CreatedAt'
      const createdAt = new Date(row.CreatedAt);
      const today = isToday(createdAt);
      const sameYear = isSameYear(createdAt, new Date());
      let formattedDate;

      if (today) {
        // Если дата - сегодня, показываем только время
        formattedDate = createdAt.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' });
      } else if (sameYear) {
        // Если текущий год, показываем дату без года
        formattedDate = `${createdAt.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        })}, ${createdAt.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}`;
      } else {
        // Иначе показываем полную дату с годом
        formattedDate = createdAt.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
      }

      return {
        ...row,
        windowSize: `${row.innerWidth || 'N/A'} x ${row.innerHeight || 'N/A'}`,
        outerWindowSize: `${row.outerWidth || 'N/A'} x ${row.outerHeight || 'N/A'}`,
        screenSize: `${row.screenWidth || 'N/A'} x ${row.screenHeight || 'N/A'}`,
        ClickOnNumber: row.ClickOnNumber ?? false, // Добавляем поле с значением true/false
        formattedCreatedAt: formattedDate, // Добавляем отформатированную дату
      };
    });
  }, [filteredData]);

  // -----------------------------------
  // (F) Функции чекбоксов внутри таблицы
  // -----------------------------------
  const handleCheckboxChange = (rowId) => async (event) => {
    const isChecked = event.target.checked;
    setCheckedRows((prev) => ({ ...prev, [rowId]: isChecked }));

    try {
      setLoading(true);
      await axiosInstance.post(`${process.env.REACT_APP_APIURL}/updatecheckedstatus`, {
        id: rowId,
        isChecked: isChecked,
      });
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    } finally {
      setLoading(false);
    }
  };

  // Выделить все/снять все (только для отфильтрованных)
  const handleSelectAllClick = async (event) => {
    const isChecked = event.target.checked;
    const newCheckedRows = { ...checkedRows };

    filteredData.forEach((row) => {
      newCheckedRows[row.ID] = isChecked;
    });
    setCheckedRows(newCheckedRows);

    const updates = filteredData.map((row) => ({
      id: row.ID,
      isChecked,
    }));

    try {
      setLoading(true);
      await axios.patch(`${process.env.REACT_APP_APIURL}/multiplestatusupdate`, {
        updates,
      });
    } catch (error) {
      console.error('Ошибка при обновлении статусов:', error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // (I) Функция обработки завершения перетаскивания
  // -----------------------------------
  const onDragEnd = (result) => {
    const { destination, source } = result;

    // Если нет назначения или позиция не изменилась, ничего не делаем
    if (!destination || destination.index === source.index) return;

    // Переставляем элементы
    const newVisibleDataKeys = Array.from(visibleDataKeys);
    const [movedItem] = newVisibleDataKeys.splice(source.index, 1);
    newVisibleDataKeys.splice(destination.index, 0, movedItem);

    setVisibleDataKeys(newVisibleDataKeys);
  };

  // -----------------------------------
  // (J) Итоговый рендер
  // -----------------------------------
  return (
    <>
      <Tabs
        rows={filteredData} // передаём уже отфильтрованные и отсортированные
        VirtuosoTableComponents={VirtuosoTableComponents}
        companyIDData={companyIDData}
        dataGoogleAccounts={dataGoogleAccounts}
        setFilterCompanyID={setFilterCompanyID}
        setFilterKeyword={setFilterKeyword}
        setFilterByDomain={setFilterByDomain}
        setFilterAccountID={setFilterAccountID}
        fixedHeaderContent={() => (
          <TableHeader
            visibleColumns={visibleColumns}
            onDragEnd={onDragEnd}
            handleSort={handleSort}
            orderBy={orderBy}
            order={order}
            filteredData={filteredData}
            checkedRows={checkedRows}
            handleSelectAllClick={handleSelectAllClick}
            setFilterByDomain={setFilterByDomain}
            filterByDomain={filterByDomain}
            filterCompanyID={filterCompanyID}
            setFilterCompanyID={setFilterCompanyID}
            filterAccountID={filterAccountID}
            setFilterAccountID={setFilterAccountID}
            filterKeyword={filterKeyword}
            setFilterKeyword={setFilterKeyword}
            allColumns={allColumns}
            processedData={processedData}
            loadMoreRows={loadMoreRows}
            hasMore={hasMore}
            headerFieldsDataKeys={headerFieldsDataKeys}
            jsDataFieldsDataKeys={jsDataFieldsDataKeys}
            setExpandedCell={setExpandedCell}
            setFormattedJSON={setFormattedJSON}
            doubleOutput={doubleOutput}
          />
        )}
        rowContent={(_index, row) => (
          <TableRowRender
            row={row}
            visibleColumns={visibleColumns}
            checkedRows={checkedRows}
            handleCheckboxChange={handleCheckboxChange}
            expandedCell={expandedCell}
            setExpandedCell={setExpandedCell}
            formattedJSON={formattedJSON}
            setFormattedJSON={setFormattedJSON}
            setFilterByDomain={setFilterByDomain}
            setFilterCompanyID={setFilterCompanyID}
            setFilterAccountID={setFilterAccountID}
            setFilterKeyword={setFilterKeyword}
            doubleOutput={doubleOutput}
            companyIDData={companyIDData}
            dataGoogleAccounts={dataGoogleAccounts}
          />
        )}
        loadMoreRows={loadMoreRows}
        loading={loading}
        hasMore={hasMore}
        loadingRef={loadingRef}
        // Пробрасываем в Tabs, если нужно
        columns={allColumns} // полный список
        searchField={searchField}
        limit={limit}
        setLimit={setLimit}
        setSearchField={setSearchField}
        ColumnSelector={
          <ColumnSelector
            columns={allColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={null /* больше не нужен, см. ниже */}
            headerFieldsDataKeys={headerFieldsDataKeys}
            jsDataFieldsDataKeys={jsDataFieldsDataKeys}
            setCheckedRows={setCheckedRows}
            defaultVisibleColumns={allColumns.filter((col) => defaultVisibleDataKeys.includes(col.dataKey))}
            visibleDataKeys={visibleDataKeys}
            setVisibleDataKeys={setVisibleDataKeys}
            doubleOutput={doubleOutput}
            setDoubleOutput={setDoubleOutput} // Чек для показа двойных данные в модальном окне
          />
        }
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      <CompanyNames setCompanyIDData={setCompanyIDData} />
      <GoogleAccounts setDataGoogleAccounts={setDataGoogleAccounts} />
    </>
  );
}
