import * as React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { debounce } from 'lodash'; // Добавляем debounce для оптимизации поиска
import axiosInstance from '../../axiosInstance'; // Используем централизованный экземпляр Axios
import axios from 'axios';
import { startOfDay, endOfDay, isToday, isSameYear } from 'date-fns'; // Добавлено isSameYear
import './Statistics.scss';

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

// Мемоизированный компонент заголовка таблицы для предотвращения лишних ререндеров
const MemoizedTableHeader = React.memo(TableHeader, (prevProps, nextProps) => {
  // Кастомная функция сравнения для более точного контроля ререндеров
  const prevCheckedKeys = Object.keys(prevProps.checkedRows);
  const nextCheckedKeys = Object.keys(nextProps.checkedRows);
  
  // Проверяем изменения в checkedRows более детально
  const checkedRowsEqual = prevCheckedKeys.length === nextCheckedKeys.length &&
    prevCheckedKeys.every(key => prevProps.checkedRows[key] === nextProps.checkedRows[key]);
  
  // Проверяем изменения в visibleColumns (порядок и содержимое)
  const visibleColumnsEqual = prevProps.visibleColumns.length === nextProps.visibleColumns.length &&
    prevProps.visibleColumns.every((col, index) => 
      col.dataKey === nextProps.visibleColumns[index]?.dataKey
    );
  
  return (
    prevProps.order === nextProps.order &&
    prevProps.orderBy === nextProps.orderBy &&
    visibleColumnsEqual &&
    prevProps.filteredData.length === nextProps.filteredData.length &&
    checkedRowsEqual
  );
});

// Мемоизированный компонент строки таблицы для предотвращения лишних ререндеров
const MemoizedTableRowRender = React.memo(TableRowRender, (prevProps, nextProps) => {
  // Кастомная функция сравнения для строк таблицы
  
  // Проверяем изменения в visibleColumns (порядок и содержимое)
  const visibleColumnsEqual = prevProps.visibleColumns.length === nextProps.visibleColumns.length &&
    prevProps.visibleColumns.every((col, index) => 
      col.dataKey === nextProps.visibleColumns[index]?.dataKey
    );
  
  return (
    prevProps.row.ID === nextProps.row.ID &&
    visibleColumnsEqual &&
    prevProps.checkedRows[prevProps.row.ID] === nextProps.checkedRows[nextProps.row.ID] &&
    prevProps.expandedCell === nextProps.expandedCell &&
    prevProps.doubleOutput === nextProps.doubleOutput
  );
});

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
  
  // Состояние для управления видимостью вкладок (с сохранением в localStorage)
  const [visibleTabs, setVisibleTabs] = useState(() => {
    const savedTabs = localStorage.getItem('visibleTabs');
    if (savedTabs) {
      return JSON.parse(savedTabs);
    }
    return {
      showBotAnalysis: false, // По умолчанию скрыт
      showReferenceHeaders: false, // По умолчанию скрыт
    };
  });
  
  // Сохраняем изменения видимости вкладок в localStorage
  useEffect(() => {
    localStorage.setItem('visibleTabs', JSON.stringify(visibleTabs));
  }, [visibleTabs]);

  // -----------------------------------
  // (B) Прочие состояния
  // -----------------------------------
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(() => {
    try {
      const item = window.localStorage.getItem('search_limit');
      return item ? JSON.parse(item) : 1000;
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // Debounced поисковый запрос
  const [searchField, setSearchField] = useState(() => {
    try {
      const item = window.localStorage.getItem('search_searchField');
      return item ? JSON.parse(item) : 'Domain';
    } catch (error) {
      console.error('Ошибка при чтении search_searchField из localStorage:', error);
      return 'Domain';
    }
  });

  // Debounced поиск для оптимизации производительности
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      setDebouncedSearchQuery(query);
    }, 300),
    []
  );
  
  // Обновляем debounced поиск при изменении searchQuery
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

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
  const [filterFingerprint, setFilterFingerprint] = useLocalStorageDataKeys('filterFingerprint', null); // Состояние для фильтрации по filterFingerprint
  const [filterMotionDataRaw, setFilterMotionDataRaw] = useLocalStorageDataKeys('filterMotionDataRaw', null); // Состояние для фильтрации по MotionDataRaw
  const [filterIP, setFilterIP] = useLocalStorageDataKeys('filterIP', null); // Состояние для фильтрации по IP
  const [filterTimeSpent, setFilterTimeSpent] = useLocalStorageDataKeys('filterTimeSpent', null); // Состояние для фильтрации по TimeSpent

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

      setRows((prevRows) => {
        // Проверяем на дубликаты по ID для избежания повторной загрузки
        const existingIds = new Set(prevRows.map(row => row.ID));
        const uniqueNewData = response.data.filter(row => !existingIds.has(row.ID));
        return [...prevRows, ...uniqueNewData];
      });
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

  // Оптимизированная сортировка строк с мемоизацией
  const sortedRows = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    // Используем более эффективную сортировку
    const sortedArray = [...rows];
    sortedArray.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      // Оптимизированное сравнение
      if (aValue === bValue) return 0;
      if (aValue == null) return order === 'asc' ? -1 : 1;
      if (bValue == null) return order === 'asc' ? 1 : -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return order === 'asc' ? comparison : -comparison;
    });
    
    return sortedArray;
  }, [rows, order, orderBy]);

  // Оптимизированная фильтрация строк с мемоизацией
  const filteredData = useMemo(() => {
    if (!sortedRows || sortedRows.length === 0) return [];

    // Предварительно подготавливаем значения фильтров для оптимизации
    const hasSearchQuery = Boolean(debouncedSearchQuery);
    const searchQueryLower = hasSearchQuery ? debouncedSearchQuery.toLowerCase() : '';
    const hasFilters = Boolean(filterByDomain || filterCompanyID || filterAccountID || filterKeyword || filterFingerprint || filterMotionDataRaw || filterIP || filterTimeSpent);

    // Если нет фильтров и поискового запроса, возвращаем исходный массив
    if (!hasSearchQuery && !hasFilters) {
      return sortedRows;
    }

    return sortedRows.filter((item) => {
      // Оптимизированная фильтрация по поисковому запросу
      if (hasSearchQuery) {
        let fieldValue = item[searchField];
        if (fieldValue === undefined || fieldValue === null) return false;

        if (searchField === 'CreatedAt') {
          const date = new Date(fieldValue);
          fieldValue = date.toLocaleDateString('ru-RU');
        } else {
          fieldValue = fieldValue.toString();
        }

        if (!fieldValue.toLowerCase().includes(searchQueryLower)) {
          return false;
        }
      }

      // Быстрая проверка фильтров с ранним выходом
      if (filterByDomain && item.Domain !== filterByDomain) return false;
      if (filterCompanyID && item.CompanyID !== filterCompanyID) return false;
      if (filterAccountID && item.AccountID !== filterAccountID) return false;
      if (filterKeyword && item.Keyword !== filterKeyword) return false;
      if (filterFingerprint && item.Fingerprint !== filterFingerprint) return false;
      if (filterIP && item.IP !== filterIP) return false;
      if (filterTimeSpent && item.TimeSpent !== filterTimeSpent) return false;
      if (filterMotionDataRaw) {
        try {
          const motionData = typeof item.MotionDataRaw === 'string' ? JSON.parse(item.MotionDataRaw) : item.MotionDataRaw;
          const deltaSum = motionData?.deltaSum || 0;
          const status = motionData?.status || 'unknown';
          
          let shortLabel = '❓ Неизвестно';
          
          if (status === 'no-data') {
            shortLabel = '⚠️ Нет данных';
          } else if (status === 'no-sensor') {
            shortLabel = '🖥 Нет сенсоров';
          } else if (status === 'success' || status === 'ok') {
            if (deltaSum > 5) {
              shortLabel = '✅ Движение';
            } else {
              shortLabel = '🚨 Нет движения';
            }
          } else if (status === 'not-enough') {
            shortLabel = '⚠️ Недостаточно';
          } else if (status === 'no-permission') {
            shortLabel = '📵 Нет доступа';
          } else if (status === 'unknown') {
            shortLabel = '❓ Неизвестно';
          }
          
          if (shortLabel !== filterMotionDataRaw) return false;
        } catch (e) {
          if (filterMotionDataRaw !== 'Ошибка') return false;
        }
      }

      return true;
    });
  }, [
    sortedRows,
    searchField,
    debouncedSearchQuery,
    filterByDomain,
    filterCompanyID,
    filterAccountID,
    filterKeyword,
    filterFingerprint,
    filterMotionDataRaw,
    filterIP,
    filterTimeSpent,
  ]);

  const processedData = useMemo(() => {
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

      // Извлекаем данные из JsData для новых полей
      let hardwareConcurrency = null;
      let deviceMemory = null;
      let clickCount = null;
      let maxScrollY = null;
      let hadMouse = null;
      let hadTouch = null;
      let hasConnection = null;
      let hasMemory = null;
      let hasPlugins = null;
      let hasDeviceOrientationEvent = null;
      let isTouchCapable = null;

      try {
        // Проверяем, что JsData не пустая строка
        if (!row.JsData || row.JsData === '') {
          // Для пустых JsData оставляем все null
        } else {
          const jsData = typeof row.JsData === 'string' ? JSON.parse(row.JsData) : row.JsData;
          
          // Извлекаем поля напрямую из JsData - они на верхнем уровне
          hardwareConcurrency = jsData?.hardwareConcurrency ?? null;
          deviceMemory = jsData?.deviceMemory ?? null;
          
          // Для старых записей проверяем также прямо в row
          if (hardwareConcurrency === null && row.hardwareConcurrency !== undefined) {
            hardwareConcurrency = row.hardwareConcurrency;
          }
          if (deviceMemory === null && row.deviceMemory !== undefined) {
            deviceMemory = row.deviceMemory;
          }
          
          // Извлекаем поля из behavior (если есть объект behavior)
          if (jsData?.behavior) {
            clickCount = jsData.behavior.clickCount ?? null;
            maxScrollY = jsData.behavior.maxScrollY ?? null;
            hadMouse = jsData.behavior.hadMouse ?? null;
            hadTouch = jsData.behavior.hadTouch ?? null;
          }
          
          // Теперь эти поля также могут быть прямо в jsData (новый формат)
          if (clickCount === null && jsData?.clickCount !== undefined) {
            clickCount = jsData.clickCount;
          }
          if (maxScrollY === null && jsData?.maxScrollY !== undefined) {
            maxScrollY = jsData.maxScrollY;
          }
          if (hadMouse === null && jsData?.hadMouse !== undefined) {
            hadMouse = jsData.hadMouse;
          }
          if (hadTouch === null && jsData?.hadTouch !== undefined) {
            hadTouch = jsData.hadTouch;
          }
          
          // Извлекаем API флаги
          if (jsData?.hasConnection !== undefined) {
            hasConnection = jsData.hasConnection;
          }
          if (jsData?.hasMemory !== undefined) {
            hasMemory = jsData.hasMemory;
          }
          if (jsData?.hasPlugins !== undefined) {
            hasPlugins = jsData.hasPlugins;
          }
          if (jsData?.hasDeviceOrientationEvent !== undefined) {
            hasDeviceOrientationEvent = jsData.hasDeviceOrientationEvent;
          }
          if (jsData?.isTouchCapable !== undefined) {
            isTouchCapable = jsData.isTouchCapable;
          }
        }
      } catch (e) {
        // Тихо обрабатываем ошибки парсинга - не выводим в консоль
        // Если JsData вообще не парсится, пробуем взять из row напрямую
        hardwareConcurrency = row.hardwareConcurrency ?? null;
        deviceMemory = row.deviceMemory ?? null;
        clickCount = row.clickCount ?? null;
        maxScrollY = row.maxScrollY ?? null;
        hadMouse = row.hadMouse ?? null;
        hadTouch = row.hadTouch ?? null;
      }

      return {
        ...row,
        windowSize: `${row.innerWidth || 'N/A'} x ${row.innerHeight || 'N/A'}`,
        outerWindowSize: `${row.outerWidth || 'N/A'} x ${row.outerHeight || 'N/A'}`,
        screenSize: `${row.screenWidth || 'N/A'} x ${row.screenHeight || 'N/A'}`,
        ClickOnNumber: row.ClickOnNumber ?? false,
        formattedCreatedAt: formattedDate,
        // Новые поля
        hardwareConcurrency,
        deviceMemory,
        clickCount,
        maxScrollY,
        hadMouse,
        hadTouch,
        hasConnection,
        hasMemory,
        hasPlugins,
        hasDeviceOrientationEvent,
        isTouchCapable,
      };
    });
  }, [filteredData]);

  // -----------------------------------
  // (F) Функции чекбоксов внутри таблицы
  // -----------------------------------
  const handleCheckboxChange = useCallback((rowId) => async (event) => {
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
  }, []);

  // Выделить все/снять все (только для отфильтрованных)
  const handleSelectAllClick = useCallback(async (event) => {
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
  }, [checkedRows, filteredData]);

  // -----------------------------------
  // (I) Мемоизированная функция обработки завершения перетаскивания
  // -----------------------------------
  const onDragEnd = useCallback((result) => {
    const { destination, source } = result;

    // Если нет назначения или позиция не изменилась, ничего не делаем
    if (!destination || destination.index === source.index) return;

    // Переставляем элементы
    const newVisibleDataKeys = Array.from(visibleDataKeys);
    const [movedItem] = newVisibleDataKeys.splice(source.index, 1);
    newVisibleDataKeys.splice(destination.index, 0, movedItem);

    setVisibleDataKeys(newVisibleDataKeys);
  }, [visibleDataKeys, setVisibleDataKeys]);

  // -----------------------------------
  // (J) Итоговый рендер
  // -----------------------------------
  return (
    <>
      <Tabs
        rows={processedData} // передаём обработанные данные с новыми полями
        VirtuosoTableComponents={VirtuosoTableComponents}
        companyIDData={companyIDData}
        dataGoogleAccounts={dataGoogleAccounts}
        setFilterCompanyID={setFilterCompanyID}
        setFilterKeyword={setFilterKeyword}
        setFilterByDomain={setFilterByDomain}
        setFilterFingerprint={setFilterFingerprint}
        setFilterMotionDataRaw={setFilterMotionDataRaw}
        setFilterAccountID={setFilterAccountID}
        fixedHeaderContent={() => (
          <MemoizedTableHeader
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
            filterFingerprint={filterFingerprint}
            setFilterFingerprint={setFilterFingerprint}
            filterMotionDataRaw={filterMotionDataRaw}
            setFilterMotionDataRaw={setFilterMotionDataRaw}
            filterIP={filterIP}
            setFilterIP={setFilterIP}
            filterTimeSpent={filterTimeSpent}
            setFilterTimeSpent={setFilterTimeSpent}
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
          <MemoizedTableRowRender
            row={row}
            rows={processedData}
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
            setFilterFingerprint={setFilterFingerprint}
            setFilterMotionDataRaw={setFilterMotionDataRaw}
            setFilterIP={setFilterIP}
            setFilterTimeSpent={setFilterTimeSpent}
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
            visibleTabs={visibleTabs}
            setVisibleTabs={setVisibleTabs}
          />
        }
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        visibleTabs={visibleTabs}
      />
      <CompanyNames setCompanyIDData={setCompanyIDData} />
      <GoogleAccounts setDataGoogleAccounts={setDataGoogleAccounts} />
    </>
  );
}
