import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../axiosInstance'; // Используем централизованный экземпляр Axios
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button'; // Импортируем компонент Button
import IconButton from '@mui/material/IconButton'; // Импортируем IconButton
import DataObjectIcon from '@mui/icons-material/DataObject';
import RestartAltIcon from '@mui/icons-material/RestartAlt'; // Импортируем иконку для сброса
import Checkbox from '@mui/material/Checkbox'; // Импортируем компонент Checkbox
import { JSONTree } from 'react-json-tree';

import { startOfDay, endOfDay } from 'date-fns';

import Tabs from './Tabs/Tabs.js';
import ColumnSelector from './Tabs/ColumnSelector/ColumnSelector.js';

import './Statistics.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

// Изначальные столбцы
const columns = [
  { label: 'ID', dataKey: 'ID' },
  { label: 'Domain', dataKey: 'Domain' },
  { label: 'Host', dataKey: 'Host' },
  { label: 'Gclid', dataKey: 'Gclid' },
  { label: 'Company ID', dataKey: 'CompanyID' },
  { label: 'Account ID', dataKey: 'AccountID' },
  { label: 'Keyword', dataKey: 'Keyword' },
  { label: 'IP', dataKey: 'IP' },
  { label: 'Created At', dataKey: 'CreatedAt' },
  { label: 'Click Coordinates', dataKey: 'ClickCoordinates' },
  { label: 'Click on Number', dataKey: 'ClickOnNumber' },
  { label: 'Scroll Coordinates', dataKey: 'ScrollCoordinates' },
  { label: 'Time Spent', dataKey: 'TimeSpent' },
  { label: 'Device', dataKey: 'Device' },
  { label: 'Headers', dataKey: 'Headers' },
  { label: 'JsData', dataKey: 'JsData' },
  { label: 'Accept', dataKey: 'Accept' }, // Поля из поля Headers
  { label: 'AcceptEncoding', dataKey: 'Accept-Encoding' }, // Поля из поля Headers
  { label: 'AcceptLanguage', dataKey: 'Accept-Language' }, // Поля из поля Headers
  { label: 'Connection', dataKey: 'Connection' }, // Поля из поля Headers
  // { label: 'SecChUaMobile', dataKey: 'sec-ch-ua-mobile' }, // Поля из поля Headers
  { label: 'Referer', dataKey: 'Referer' }, // Поля из поля Headers
  { label: 'SecFetchDest', dataKey: 'Sec-Fetch-Dest' }, // Поля из поля Headers
  { label: 'SecFetchMode', dataKey: 'Sec-Fetch-Mode' }, // Поля из поля Headers
  { label: 'SecFetchSite', dataKey: 'Sec-Fetch-Site' }, // Поля из поля Headers
  { label: 'UserAgent', dataKey: 'User-Agent' }, // Поля из поля Headers
  { label: 'XRealIP', dataKey: 'X-Real-IP' }, // Поля из поля Headers
  { label: 'SecChUa', dataKey: 'sec-ch-ua' }, // Поля из поля Headers
  { label: 'SecChUaPlatform', dataKey: 'sec-ch-ua-platform' }, // Поля из поля Headers
  // { label: 'GoogleChromeSecUa', dataKey: 'GoogleChromeSecUa' }, // Поля из поля Headers
  { label: 'InnerWidth', dataKey: 'innerWidth' }, // Поля из поля JSData
  { label: 'InnerHeight', dataKey: 'innerHeight' }, // Поля из поля JSData
  { label: 'OuterWidth', dataKey: 'outerWidth' }, // Поля из поля JSData
  { label: 'OuterHeight', dataKey: 'outerHeight' }, // Поля из поля JSData
  { label: 'ScreenWidth', dataKey: 'screenWidth' }, // Поля из поля JSData
  { label: 'ScreenHeight', dataKey: 'screenHeight' }, // Поля из поля JSData
  { label: 'AppCodeName', dataKey: 'appCodeName' }, // Поля из поля JSData
  { label: 'AppName', dataKey: 'appName' }, // Поля из поля JSData
  { label: 'AppVersion', dataKey: 'appVersion' }, // Поля из поля JSData
  { label: 'Language', dataKey: 'language' }, // Поля из поля JSData
  { label: 'Platform', dataKey: 'platform' }, // Поля из поля JSData
  { label: 'Product', dataKey: 'product' }, // Поля из поля JSData
  { label: 'ProductSub', dataKey: 'productSub' }, // Поля из поля JSData
  { label: 'UserAgent', dataKey: 'userAgent' }, // Поля из поля JSData
  { label: 'Vendor', dataKey: 'vendor' }, // Поля из поля JSData
  { label: 'MaxTouchPoints', dataKey: 'maxTouchPoints' }, // Поля из поля JSData
  { label: 'Downlink', dataKey: 'downlink' }, // Поля из поля JSData
  { label: 'EffectiveType', dataKey: 'effectiveType' }, // Поля из поля JSData
  { label: 'RTT', dataKey: 'rtt' }, // Поля из поля JSData
  { label: 'PluginsLength', dataKey: 'pluginsLength' }, // Поля из поля JSData
  { label: 'TotalJSHeapSize', dataKey: 'totalJSHeapSize' }, // Поля из поля JSData
  { label: 'UsedJSHeapSize', dataKey: 'usedJSHeapSize' }, // Поля из поля JSData
  { label: 'JSHeapSizeLimit', dataKey: 'jsHeapSizeLimit' }, // Поля из поля JSData
];

// Поля которые мы передаем чтобы показывать при клике на Поля Headers
const headerFieldsDataKeys = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Connection',
  'Domain',
  'Referer',
  'Sec-Fetch-Dest',
  'Sec-Fetch-Mode',
  'Sec-Fetch-Site',
  'User-Agent',
  'X-Real-IP',
  'sec-ch-ua',
  'sec-ch-ua-platform',
];
// Поля которые мы передаем чтобы показывать при клике на Поля JSData
const jsDataFieldsDataKeys = [
  'innerWidth',
  'innerHeight',
  'outerWidth',
  'outerHeight',
  'screenWidth',
  'screenHeight',
  'appCodeName',
  'appName',
  'appVersion',
  'language',
  'platform',
  'product',
  'productSub',
  'userAgent',
  'vendor',
  'maxTouchPoints',
  'downlink',
  'effectiveType',
  'rtt',
  'pluginsLength',
  'totalJSHeapSize',
  'usedJSHeapSize',
  'jsHeapSizeLimit',
];

// Столбцы, видимые по умолчанию
const defaultVisibleColumns = columns.filter((column) =>
  [
    'ID',
    'Domain',
    // 'CompanyID',
    // 'AccountID',
    'CreatedAt',
    'ClickOnNumber',
    // 'Keyword',
    'TimeSpent',
    // 'Device',
    'IP',
    'Headers',
    'JsData',
    // 'Gclid',
    'ScrollCoordinates',
    'ClickCoordinates',
  ].includes(column.dataKey),
);

// Столбцы, которые вы хотите отображать, когда `expandedCell` установлен
const expandedVisibleColumns = columns.filter((column) =>
  [
    'ID',
    'Domain',
    'CompanyID',
    'AccountID',
    'CreatedAt',
    // 'ClickOnNumber',
    'Keyword',
    'TimeSpent',
    // 'Device',
    // 'IP',
    'Headers',
    'JsData',
  ].includes(column.dataKey),
);

// Определение VirtuosoTableComponents
const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: 'separate', tableLayout: 'auto' }}
    />
  ),
  TableHead: React.forwardRef((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

export default function ReactVirtualizedTable() {
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(100); // Теперь limit можно изменять
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [order, setOrder] = useState('desc');
  // Обновляем orderBy на первый видимый столбец по умолчанию
  const [orderBy, setOrderBy] = useState(defaultVisibleColumns[0].dataKey);

  // Используем defaultVisibleColumns в качестве начального состояния
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  // Состояние для хранения выбранных дат
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const loadingRef = useRef(false);
  const [searchField, setSearchField] = useState(columns[14].dataKey); // Выбираем поле для поиска

  const [searchDomain, setSearchDomain] = React.useState(''); // Поисковый запрос

  const [formattedJSON, setFormattedJSON] = useState({});
  const [expandedCell, setExpandedCell] = useState(null);

  // Ваши хуки и состояния...
  const [checkedRows, setCheckedRows] = useState({}); // Состояние для хранения отмеченных строк

  // Функция для обработки изменения состояния чекбокса
  const handleCheckboxChange = (rowId) => async (event) => {
    const isChecked = event.target.checked;

    // Обновляем состояние checkedRows
    setCheckedRows((prev) => ({
      ...prev,
      [rowId]: isChecked,
    }));

    // console.log(
    //   `Чекбокс для строки с ID ${rowId} ${
    //     isChecked ? 'отмечен' : 'снят'
    //   }`,
    // );

    // Опционально: Отправляем обновление на сервер
    try {
      setLoading(true);
      await axiosInstance.post(`${APIURL}/updatecheckedstatus`, {
        id: rowId,
        isChecked: isChecked,
      });
      // console.log(`Статус чекбокса для строки с ID ${rowId} обновлен на сервере.`);
    } catch (error) {
      console.error('Ошибка при обновлении статуса на сервере:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const loadMoreRows = async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const params = { limit, offset };

      // Добавляем параметры даты, если они выбраны
      if (startDate) {
        const start = startOfDay(startDate);
        params.startDate = start.toISOString();
      }
      if (endDate) {
        const end = endOfDay(endDate);
        params.endDate = end.toISOString();
      }

      // console.log('Запрос к серверу с параметрами:', params);
      const requestStartTime = performance.now();

      const response = await axiosInstance.get(`${APIURL}/userslogsads`, {
        params,
      });

      const requestEndTime = performance.now();

      // Вычисляем время отклика
      const responseTime = requestEndTime - requestStartTime;

      // Выводим время отклика в консоль
      console.log(`Время отклика сервера: ${responseTime.toFixed(2)} мс`);

      // console.log('Ответ от сервера:', response.data);

      if (response.data.length < limit) setHasMore(false);

      setRows((prevRows) => [...prevRows, ...response.data]);
      setOffset((prevOffset) => prevOffset + response.data.length);

      // Создаем объект для инициализации checkedRows
      const initialCheckedRows = {};
      response.data.forEach((row) => {
        initialCheckedRows[row.ID] = row.isChecked || false; // Предполагаем, что сервер возвращает свойство isChecked
      });

      // Объединяем новое состояние checkedRows с существующим
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
  };

  // Используем `useEffect` для отслеживания изменений `expandedCell`
  useEffect(() => {
    if (expandedCell) {
      // Если `expandedCell` установлен, показываем меньше столбцов
      setVisibleColumns(expandedVisibleColumns);
    } else {
      // Если `expandedCell` сброшен, возвращаем столбцы по умолчанию
      setVisibleColumns(defaultVisibleColumns);
    }
  }, [expandedCell]);

  useEffect(() => {
    // Сбрасываем данные и загружаем заново при изменении диапазона дат или limit
    setRows([]);
    setOffset(0);
    setHasMore(true);
    loadingRef.current = false; // Сбрасываем флаг загрузки
    loadMoreRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, limit]);

  // Проверяем, что текущий столбец для сортировки видим
  useEffect(() => {
    if (!visibleColumns.some((col) => col.dataKey === orderBy)) {
      if (visibleColumns.length > 0) {
        setOrderBy(visibleColumns[0].dataKey);
      }
    }
  }, [visibleColumns, orderBy]);

  const sortedRows = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [rows, order, orderBy]);

  function fixedHeaderContent() {
    return (
      <TableRow>
        <TableCell variant="head" align="left">
          {/* Пустая ячейка для заголовка чекбокса */}
        </TableCell>
        {visibleColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align="left"
            sx={{ backgroundColor: 'background.paper', cursor: 'pointer' }}
            onClick={() => handleSort(column.dataKey)}
          >
            <TableSortLabel
              active={orderBy === column.dataKey}
              direction={orderBy === column.dataKey ? order : 'asc'}
            >
              {column.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    );
  }

  // Фильтруем данные по Domain
  const filteredDomain = sortedRows
    ? sortedRows.filter((item) => {
        const fieldValue = item['Domain'];

        // Проверяем, что значение поля не undefined и не null
        if (fieldValue !== undefined && fieldValue !== null) {
          return fieldValue
            .toString()
            .toLowerCase()
            .includes(searchDomain.toLowerCase());
        }

        return false;
      })
    : [];

  // Работа с полями
  function rowContent(_index, row) {
    function valueRenderer(valueAsString, value, ...keyPath) {
      // Проверяем, является ли значение строкой и начинается ли оно с 'http://' или 'https://'
      if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#4caf50',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {valueAsString}
          </a>
        );
      }

      // По умолчанию возвращаем значение без изменений
      return valueAsString;
    }

    // Определяем, отмечена ли текущая строка
    const isChecked = checkedRows[row.ID] || false;

    return (
      <>
        {/* Добавили ячейку с чекбоксом в начало каждой строки. */}
        <TableCell
          className="statistics__checked"
          align="left"
          style={{
            backgroundColor: isChecked ? '#e0f7fa' : 'inherit', // Применяем цвет фона
          }}
        >
          <Checkbox
            checked={checkedRows[row.ID] || false}
            onChange={handleCheckboxChange(row.ID)}
          />
        </TableCell>

        {visibleColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            align="left"
            style={{
              backgroundColor: isChecked ? '#e0f7fa' : 'inherit', // Применяем цвет фона
            }}
          >
            {column.dataKey === 'ClickOnNumber' ? (
              row[column.dataKey] ? (
                <CheckIcon color="success" />
              ) : (
                <CloseIcon color="error" />
              )
            ) : column.dataKey === 'CreatedAt' ? (
              new Date(row[column.dataKey]).toLocaleString('ru-RU', {
                timeZone: 'Europe/Moscow',
              })
            ) : column.dataKey === 'Domain' ? (
              <>
                {/* Кнопка для фильтрации по домену */}
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSearchDomain(row[column.dataKey]); // Устанавливаем домен для фильтрации
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  {row[column.dataKey]}
                </Button>

                {/* Кнопка для сброса фильтра */}
                <IconButton
                  color="error"
                  onClick={() => {
                    setSearchDomain(''); // Сбрасываем фильтр домена
                  }}
                  sx={{ marginLeft: '5px' }} // Добавляем отступ для разделения кнопок
                >
                  <RestartAltIcon />
                </IconButton>
              </>
            ) : column.dataKey === 'Headers' || column.dataKey === 'JsData' ? (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    try {
                      let data = row[column.dataKey];

                      let obj = {};

                      if (column.dataKey === 'Headers') {
                        // Парсим с помощью регулярных выражений
                        data = data.replaceAll('""', '"');

                        const regex = /"([^"]+)":\s*"((?:[^"\\]|\\.)*?)"/g;
                        let match;
                        const pairs = [];

                        while ((match = regex.exec(data)) !== null) {
                          const key = match[1];
                          const value = match[2];
                          pairs.push({ key, value });
                        }

                        pairs.forEach((pair) => {
                          obj[pair.key] = pair.value;
                        });
                      } else if (column.dataKey === 'JsData') {
                        // Парсим с помощью JSON.parse()
                        obj = JSON.parse(data);
                      }

                      // Сохраняем данные по row.ID и column.dataKey
                      setFormattedJSON((prevState) => ({
                        ...prevState,
                        [row.ID]: {
                          ...prevState[row.ID],
                          [column.dataKey]: obj,
                        },
                      }));

                      setExpandedCell({
                        rowId: row.ID,
                        dataKey: column.dataKey,
                      }); // Устанавливаем текущую ячейку
                    } catch (error) {
                      console.error('Error parsing data:', error);
                      setExpandedCell({
                        rowId: row.ID,
                        dataKey: column.dataKey,
                      });
                    }
                  }}
                  sx={{ textTransform: 'none', padding: '5px', minWidth: '0' }}
                >
                  <DataObjectIcon sx={{ width: '20px' }} />
                </Button>

                <IconButton
                  color="error"
                  onClick={() => {
                    setExpandedCell(null);
                    setFormattedJSON((prevState) => {
                      const newState = { ...prevState };
                      if (newState[row.ID]) {
                        delete newState[row.ID][column.dataKey];
                        if (Object.keys(newState[row.ID]).length === 0) {
                          delete newState[row.ID];
                        }
                      }
                      return newState;
                    });
                  }}
                  sx={{ marginLeft: '5px' }}
                >
                  <RestartAltIcon sx={{ width: '20px' }} />
                </IconButton>

                {expandedCell &&
                  expandedCell.rowId === row.ID &&
                  expandedCell.dataKey === column.dataKey &&
                  formattedJSON[row.ID] &&
                  formattedJSON[row.ID][column.dataKey] && (
                    <div
                      style={{
                        maxHeight: '500px',
                        overflowY: 'auto',
                        maxWidth: '500px',
                        overflowX: 'auto',
                        backgroundColor: '#f5f5f5',
                        padding: '10px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                      }}
                    >
                      <JSONTree
                        data={formattedJSON[row.ID][column.dataKey]}
                        theme="monokai"
                        invertTheme={false}
                        shouldExpandNode={(keyPath, data, level) => level !== 0}
                        valueRenderer={valueRenderer}
                      />
                    </div>
                  )}
              </>
            ) : column.dataKey === 'Referer' ? (
              <Button
                href={row[column.dataKey]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1976d2',
                  fontWeight: '500',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                }}
              >
                {row[column.dataKey]}
              </Button>
            ) : (
              row[column.dataKey]
            )}
          </TableCell>
        ))}
      </>
    );
  }

  return (
    <>
      <Tabs
        rows={filteredDomain}
        VirtuosoTableComponents={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        rowContent={rowContent}
        loadMoreRows={loadMoreRows}
        loading={loading}
        hasMore={hasMore}
        loadingRef={loadingRef} // Передаем loadingRef
        columns={columns}
        searchField={searchField}
        ColumnSelector={
          <ColumnSelector
            columns={columns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            limit={limit}
            setLimit={setLimit}
            searchField={searchField}
            setSearchField={setSearchField}
            headerFieldsDataKeys={headerFieldsDataKeys}
            jsDataFieldsDataKeys={jsDataFieldsDataKeys}
            setCheckedRows={setCheckedRows}
          />
        }
      />
    </>
  );
}
