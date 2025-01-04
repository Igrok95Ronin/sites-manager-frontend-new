import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../axiosInstance'; // Используем централизованный экземпляр Axios
import axios from 'axios';
import { startOfDay, endOfDay, isToday, isSameYear } from 'date-fns'; // Добавлено isSameYear
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // Обновлено на @hello-pangea/dnd
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
// import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DataObjectIcon from '@mui/icons-material/DataObject';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Tooltip from '@mui/material/Tooltip';

import { JSONTree } from 'react-json-tree';
import Tabs from './Tabs/Tabs.js';
import ColumnSelector from './Tabs/ColumnSelector/ColumnSelector.js';
import IPInfo from './Tabs/IPInfo/IPInfo.js';
import useLocalStorageDataKeys from './Tabs/UseLocalStorage/UseLocalStorage.js'; // Импортируем кастомный хук
import FullScreenDialog from './HeadersJS/FullScreenDialog/FullScreenDialog.js'; // Окно для показа заголовков
import AlertDialog from './HeadersJS/AlertDialog/AlertDialog.js';

import './Statistics.scss';

// ИКОНКИ, используемые в label (пример)
import KeyIcon from '@mui/icons-material/Key';
// (ниже просто примеры, если вам они нужны)
import DomainIcon from '@mui/icons-material/Domain';
import HomeIcon from '@mui/icons-material/Home';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MouseIcon from '@mui/icons-material/Mouse';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TimerIcon from '@mui/icons-material/Timer';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import StorageIcon from '@mui/icons-material/Storage';
import LanguageIcon from '@mui/icons-material/Language';
import WifiIcon from '@mui/icons-material/Wifi';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import DnsIcon from '@mui/icons-material/Dns';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import WindowIcon from '@mui/icons-material/Window';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LinkIcon from '@mui/icons-material/Link';
import DevicesIcon from '@mui/icons-material/Devices';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import LaptopIcon from '@mui/icons-material/Laptop';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import InfoIcon from '@mui/icons-material/Info'; // Для общего обозначения информации (AppCodeName)
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'; // AppName
import TranslateIcon from '@mui/icons-material/Translate'; // Language
import ExtensionIcon from '@mui/icons-material/Extension'; // ProductSub
import StoreIcon from '@mui/icons-material/Store'; // Vendor
import SpeedIcon from '@mui/icons-material/Speed'; // EffectiveType
import PluginsIcon from '@mui/icons-material/Widgets'; // PluginsLength
import MemoryIcon from '@mui/icons-material/Memory'; // TotalJSHeapSize
import DataUsageIcon from '@mui/icons-material/DataUsage'; // UsedJSHeapSize
import BuildIcon from '@mui/icons-material/Build';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import PanToolIcon from '@mui/icons-material/PanTool';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import GTranslateIcon from '@mui/icons-material/GTranslate';

// =========================================
// 2) "Эталонный" список столбцов (allColumns) с иконками и т.п.
// =========================================
export const allColumns = [
  {
    label: (
      <Tooltip title="Уникальный идентификатор (ID)" arrow placement="top">
        <KeyIcon />
      </Tooltip>
    ),
    dataKey: 'ID',
    width: 70,
  },
  {
    label: (
      <Tooltip title="Домен (Domain)" arrow placement="top">
        <DomainIcon />
      </Tooltip>
    ),
    dataKey: 'Domain',
    width: 150,
  },
  {
    label: (
      <Tooltip title="Хост (Host)" arrow placement="top">
        <HomeIcon />
      </Tooltip>
    ),
    dataKey: 'Host',
  },
  {
    label: (
      <Tooltip title="Gclid" arrow placement="top">
        <AccountTreeIcon />
      </Tooltip>
    ),
    dataKey: 'Gclid',
  },
  {
    label: (
      <Tooltip title="ID компании (CompanyID)" arrow placement="top">
        <CorporateFareIcon />
      </Tooltip>
    ),
    dataKey: 'CompanyID',
  },
  {
    label: (
      <Tooltip title="ID аккаунта (AccountID)" arrow placement="top">
        <AccountCircleIcon />
      </Tooltip>
    ),
    dataKey: 'AccountID',
  },
  {
    label: (
      <Tooltip title="Ключевое слово (Keyword)" arrow placement="top">
        <LanguageIcon />
      </Tooltip>
    ),
    dataKey: 'Keyword',
    width: 200,
  },
  {
    label: (
      <Tooltip title="IP-адрес (IP)" arrow placement="top">
        <LocationOnIcon />
      </Tooltip>
    ),
    dataKey: 'IP',
    width: 150,
  },
  {
    label: (
      <Tooltip title="Дата создания (CreatedAt)" arrow placement="top">
        <AccessTimeIcon />
      </Tooltip>
    ),
    dataKey: 'CreatedAt',
    width: 200,
  },
  {
    label: (
      <Tooltip title="Дата создания (formattedCreatedAt Europe/Moscow UTC+3)" arrow placement="top">
        <AccessTimeIcon />
      </Tooltip>
    ),
    dataKey: 'formattedCreatedAt',
    width: 150,
  },
  {
    label: (
      <Tooltip title="Координаты клика (ClickCoordinates)" arrow placement="top">
        <MouseIcon />
      </Tooltip>
    ),
    dataKey: 'ClickCoordinates',
  },
  {
    label: (
      <Tooltip title="Клик на номер (ClickOnNumber)" arrow placement="top">
        <TouchAppIcon />
      </Tooltip>
    ),
    dataKey: 'ClickOnNumber',
  },
  {
    label: (
      <Tooltip title="Координаты скролла (ScrollCoordinates)" arrow placement="top">
        <CompareArrowsIcon />
      </Tooltip>
    ),
    dataKey: 'ScrollCoordinates',
  },
  {
    label: (
      <Tooltip title="Время на странице (TimeSpent)" arrow placement="top">
        <TimerIcon />
      </Tooltip>
    ),
    dataKey: 'TimeSpent',
  },
  {
    label: (
      <Tooltip title="Устройство (Device)" arrow placement="top">
        <PhoneIphoneIcon />
      </Tooltip>
    ),
    dataKey: 'Device',
  },
  {
    label: (
      <Tooltip title="Заголовки (Headers)" arrow placement="top">
        <StorageIcon />
      </Tooltip>
    ),
    dataKey: 'Headers',
  },
  {
    label: (
      <Tooltip title="Данные (JS)" arrow placement="top">
        <DataObjectIcon />
      </Tooltip>
    ),
    dataKey: 'JsData',
  },
  {
    label: (
      <Tooltip title="Accept (Accept)" arrow placement="top">
        <CloudQueueIcon />
      </Tooltip>
    ),
    dataKey: 'Accept',
    width: 550,
  },
  {
    label: (
      <Tooltip title="Accept-Encoding" arrow placement="top">
        <WifiIcon />
      </Tooltip>
    ),
    dataKey: 'Accept-Encoding',
    width: 150,
  },
  {
    label: (
      <Tooltip title="Accept-Language" arrow placement="top">
        <GTranslateIcon />
      </Tooltip>
    ),
    dataKey: 'Accept-Language',
    width: 300,
  },
  {
    label: (
      <Tooltip title="User-Agent" arrow placement="top">
        <DevicesIcon />
      </Tooltip>
    ),
    dataKey: 'User-Agent',
    width: 1000,
  },
  {
    label: (
      <Tooltip title="sec-ch-ua" arrow placement="top">
        <BrowserUpdatedIcon />
      </Tooltip>
    ),
    dataKey: 'sec-ch-ua',
    width: 450,
  },
  {
    label: (
      <Tooltip title="Подключение (Connection)" arrow placement="top">
        <DnsIcon />
      </Tooltip>
    ),
    dataKey: 'Connection',
  },
  {
    label: (
      <Tooltip title="Мобильное устройство (SecChUaMobile)" arrow placement="top">
        <SmartToyIcon />
      </Tooltip>
    ),
    dataKey: 'sec-ch-ua-mobile',
  },
  {
    label: (
      <Tooltip title="Referer" arrow placement="top">
        <LinkIcon />
      </Tooltip>
    ),
    dataKey: 'Referer',
    width: 250,
  },
  {
    label: (
      <Tooltip title="Цель запроса (Sec-Fetch-Dest)" arrow placement="top">
        <ViewCompactIcon />
      </Tooltip>
    ),
    dataKey: 'Sec-Fetch-Dest',
  },
  {
    label: (
      <Tooltip title="Режим запроса (Sec-Fetch-Mode)" arrow placement="top">
        <DeveloperBoardIcon />
      </Tooltip>
    ),
    dataKey: 'Sec-Fetch-Mode',
  },
  {
    label: (
      <Tooltip title="Сайт запроса (Sec-Fetch-Site)" arrow placement="top">
        <DeviceHubIcon />
      </Tooltip>
    ),
    dataKey: 'Sec-Fetch-Site',
  },
  {
    label: (
      <Tooltip title="Платформа (sec-ch-ua-platform)" arrow placement="top">
        <LaptopIcon />
      </Tooltip>
    ),
    dataKey: 'sec-ch-ua-platform',
  },
  {
    label: (
      <Tooltip title="Размеры окна (Ширина x Высота) (InnerWidth x InnerHeight)" arrow placement="top">
        <WindowIcon />
      </Tooltip>
    ),
    dataKey: 'windowSize',
  },
  {
    label: (
      <Tooltip title="Внешние размеры окна (Ширина x Высота) (OuterWidth x OuterHeight)" arrow placement="top">
        <AspectRatioIcon />
      </Tooltip>
    ),
    dataKey: 'outerWindowSize',
  },
  {
    label: (
      <Tooltip title="Ширина х Высота экрана (ScreenWidth x ScreenHeight)" arrow placement="top">
        <VisibilityIcon />
      </Tooltip>
    ),
    dataKey: 'screenSize',
  },
  {
    label: (
      <Tooltip title="Кодовое имя приложения (AppCodeName)" arrow placement="top">
        <InfoIcon />
      </Tooltip>
    ),
    dataKey: 'appCodeName',
  },
  {
    label: (
      <Tooltip title="Имя приложения (AppName)" arrow placement="top">
        <AppRegistrationIcon />
      </Tooltip>
    ),
    dataKey: 'appName',
  },
  {
    label: (
      <Tooltip title="Версия приложения (AppVersion)" arrow placement="top">
        <BuildIcon />
      </Tooltip>
    ),
    dataKey: 'appVersion',
    width: 850,
  },
  {
    label: (
      <Tooltip title="Язык пользователя (Language)" arrow placement="top">
        <TranslateIcon />
      </Tooltip>
    ),
    dataKey: 'language',
  },
  {
    label: (
      <Tooltip title="Платформа устройства (Platform)" arrow placement="top">
        <DesktopWindowsIcon />
      </Tooltip>
    ),
    dataKey: 'platform',
    width: 120,
  },
  {
    label: (
      <Tooltip title="Продукт браузера или устройства (Product)" arrow placement="top">
        <ImportantDevicesIcon />
      </Tooltip>
    ),
    dataKey: 'product',
  },
  {
    label: (
      <Tooltip title="Дополнительная информация о продукте (ProductSub)" arrow placement="top">
        <ExtensionIcon />
      </Tooltip>
    ),
    dataKey: 'productSub',
  },
  {
    label: (
      <Tooltip title="User-Agent клиента (UserAgent)" arrow placement="top">
        <DeviceUnknownIcon />
      </Tooltip>
    ),
    dataKey: 'userAgent',
    width: 950,
  },
  {
    label: (
      <Tooltip title="Вендор устройства (Vendor)" arrow placement="top">
        <StoreIcon />
      </Tooltip>
    ),
    dataKey: 'vendor',
    width: 150,
  },
  {
    label: (
      <Tooltip title="Максимальное количество точек касания (MaxTouchPoints)" arrow placement="top">
        <PanToolIcon />
      </Tooltip>
    ),
    dataKey: 'maxTouchPoints',
  },
  {
    label: (
      <Tooltip title="Пропускная способность соединения (Downlink)" arrow placement="top">
        <NetworkCheckIcon />
      </Tooltip>
    ),
    dataKey: 'downlink',
  },
  {
    label: (
      <Tooltip title="Тип соединения (EffectiveType)" arrow placement="top">
        <SpeedIcon />
      </Tooltip>
    ),
    dataKey: 'effectiveType',
  },
  {
    label: (
      <Tooltip title="Время задержки (RTT)" arrow placement="top">
        <HourglassBottomIcon />
      </Tooltip>
    ),
    dataKey: 'rtt',
  },
  {
    label: (
      <Tooltip title="Количество установленных плагинов (PluginsLength)" arrow placement="top">
        <PluginsIcon />
      </Tooltip>
    ),
    dataKey: 'pluginsLength',
  },
  {
    label: (
      <Tooltip title="Общий размер кучи JS (TotalJSHeapSize)" arrow placement="top">
        <MemoryIcon />
      </Tooltip>
    ),
    dataKey: 'totalJSHeapSize',
  },
  {
    label: (
      <Tooltip title="Использованный размер кучи JS (UsedJSHeapSize)" arrow placement="top">
        <DataUsageIcon />
      </Tooltip>
    ),
    dataKey: 'usedJSHeapSize',
  },
  {
    label: (
      <Tooltip title="Лимит размера кучи JS (JSHeapSizeLimit)" arrow placement="top">
        <DataThresholdingIcon />
      </Tooltip>
    ),
    dataKey: 'jsHeapSizeLimit',
  },
];

// =========================================
// 3) Другие вспомогательные переменные
// =========================================
const headerFieldsDataKeys = [
  'ID',
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Connection',
  'Domain',
  'Referer',
  'Sec-Fetch-Dest',
  'Sec-Fetch-Mode',
  'Sec-Fetch-Site',
  'sec-ch-ua-mobile',
  'User-Agent',
  'sec-ch-ua',
  'sec-ch-ua-platform',
];

const jsDataFieldsDataKeys = [
  'ID',
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
  'windowSize',
  'outerWindowSize',
  'screenSize',
];

// Какие столбцы показываем по умолчанию (только dataKey!)
const defaultVisibleDataKeys = [
  'ID',
  'Domain',
  'CreatedAt',
  'ClickOnNumber',
  'TimeSpent',
  'IP',
  'ScrollCoordinates',
  'ClickCoordinates',
  'Accept-Language',
  'language',
  'Accept',
];

// =========================================
// 4) Определяем VirtuosoTableComponents (как у вас)
// =========================================
const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => <div {...props} ref={ref} />), // Изменено для устранения скролл-конфликта
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'auto' }} />,
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

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
  const [orderBy, setOrderBy] = useState(defaultVisibleDataKeys[0] || 'ID');

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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

  // Состояние для фильтрации по домену
  const [filterByDomain, setFilterByDomain] = useLocalStorageDataKeys('filterByDomain', null);

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

    return data;
  }, [sortedRows, searchField, searchQuery, filterByDomain]);

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
  // (G) Отрисовка строк
  // -----------------------------------
  function rowContent(_index, row) {
    // valueRenderer для JSONTree (ссылки и т.д.)
    function valueRenderer(valueAsString, value) {
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
      return valueAsString;
    }

    const isChecked = checkedRows[row.ID] || false;
    const isClickOnNumberTrue = row['ClickOnNumber'];

    const rowBackgroundColor = isClickOnNumberTrue ? 'rgb(211 248 212)' : isChecked ? '#e0f7fa' : 'inherit';

    return (
      <>
        {/* Чекбокс каждой строки */}
        <TableCell className="statistics__checked" align="left" style={{ backgroundColor: rowBackgroundColor }}>
          <Checkbox checked={isChecked} onChange={handleCheckboxChange(row.ID)} />
        </TableCell>

        {visibleColumns.map((column) => {
          const cellKey = column.dataKey;
          const cellValue = row[cellKey];

          // Логика для объединения значений innerWidth и innerHeight
          if (cellKey === 'windowSize') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                {`${row.innerWidth || 'N/A'} x ${row.innerHeight || 'N/A'}`}
              </TableCell>
            );
          }

          // Логика для объединения значений outerWidth и outerHeight
          if (cellKey === 'outerWindowSize') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                {`${row.outerWidth || 'N/A'} x ${row.outerHeight || 'N/A'}`}
              </TableCell>
            );
          }

          // Логика для объединения значений screenWidth и screenHeight
          if (cellKey === 'screenSize') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                {`${row.screenWidth || 'N/A'} x ${row.screenHeight || 'N/A'}`}
              </TableCell>
            );
          }

          // Примеры разных вариантов отрисовки
          if (cellKey === 'ClickOnNumber') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                {cellValue ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
              </TableCell>
            );
          }

          // Поле даты и времени
          if (cellKey === 'CreatedAt') {
            const date = new Date(cellValue);
            const today = isToday(date);
            const sameYear = isSameYear(date, new Date());

            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor, color: '#009688', fontWeight: 'bold' }}
              >
                {today ? (
                  // Если сегодня, показываем только время зелёным цветом
                  <span>{date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}</span>
                ) : sameYear ? (
                  // Если текущий год, показываем дату без года
                  `${date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}, ${date.toLocaleTimeString(
                    'ru-RU',
                    { timeZone: 'Europe/Moscow' },
                  )}`
                ) : (
                  // Иначе показываем полную дату с годом
                  date.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
                )}
              </TableCell>
            );
          }

          if (cellKey === 'Domain') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                <Button
                  variant="text"
                  size="small"
                  color="secondary"
                  onClick={() => setFilterByDomain(cellValue)}
                  sx={{
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cellValue}
                </Button>
              </TableCell>
            );
          }

          if (cellKey === 'Headers' || cellKey === 'JsData') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor, whiteSpace: 'wrap' }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    try {
                      const data = JSON.parse(cellValue);
                      setFormattedJSON((prevState) => ({
                        ...prevState,
                        [row.ID]: {
                          ...prevState[row.ID],
                          [cellKey]: data,
                        },
                      }));
                      setExpandedCell({ rowId: row.ID, dataKey: cellKey });
                    } catch (error) {
                      console.error('Ошибка при парсинге данных:', error);
                      setExpandedCell({ rowId: row.ID, dataKey: cellKey });
                    }
                  }}
                  sx={{ textTransform: 'none', padding: '2px', minWidth: '0' }}
                >
                  <DataObjectIcon sx={{ width: '18px' }} />
                </Button>

                {expandedCell &&
                  expandedCell.rowId === row.ID &&
                  expandedCell.dataKey === cellKey &&
                  formattedJSON[row.ID] &&
                  formattedJSON[row.ID][cellKey] && (
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
                        data={formattedJSON[row.ID][cellKey]}
                        theme="monokai"
                        invertTheme={false}
                        shouldExpandNode={(kp, d, lvl) => lvl !== 0}
                        valueRenderer={valueRenderer}
                      />
                    </div>
                  )}
              </TableCell>
            );
          }

          if (cellKey === 'Referer') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                <Button
                  href={cellValue}
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
                  {cellValue}
                </Button>
              </TableCell>
            );
          }

          if (cellKey === 'IP') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                <IPInfo IP={cellValue} />
              </TableCell>
            );
          }

          // Вызываем модальное окно Headers
          if (cellKey === 'Accept-Language') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                <AlertDialog
                  AcceptLanguage={cellValue}
                  Headers={row.Headers}
                  Label={'Headers'}
                  Title={'Заголовки (Headers)'}
                  doubleOutput={doubleOutput}
                  doubleData={row.JsData}
                />
              </TableCell>
            );
          }
          // Вызываем модальное окно JS
          if (cellKey === 'language') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                <AlertDialog
                  AcceptLanguage={cellValue}
                  Headers={row.JsData}
                  Label={'JS'}
                  Title={'Данные (JS)'}
                  doubleOutput={doubleOutput}
                  doubleData={row.Headers}
                />
              </TableCell>
            );
          }

          if (cellKey === 'Gclid') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="left"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                <span className="statistics__gclid" title={cellValue}>
                  {cellValue}
                </span>
                <span className="statistics__gclidLen">{cellValue?.length}</span>
              </TableCell>
            );
          }

          // По умолчанию просто отрисовать значение
          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{ backgroundColor: rowBackgroundColor }}
            >
              {cellValue}
            </TableCell>
          );
        })}
      </>
    );
  }

  // -----------------------------------
  // (H) Заголовок таблицы с Drag-and-Drop
  // -----------------------------------
  function fixedHeaderContent() {
    // Чекбокс «Выбрать все»
    const allChecked = filteredData.length > 0 && filteredData.every((row) => checkedRows[row.ID]);
    const someChecked = filteredData.some((row) => checkedRows[row.ID]) && !allChecked;

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <TableRow
              className="statistics__headers"
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                transition: 'border 0.3s ease',
                border: snapshot.isDraggingOver ? '2px dashed #42a5f5' : 'none',
                backgroundColor: snapshot.isDraggingOver ? '#f0f8ff' : 'inherit',
              }}
            >
              {/* Select All Checkbox */}
              <TableCell className="statistics__checkall" variant="head" align="left">
                <Checkbox indeterminate={someChecked} checked={allChecked} onChange={handleSelectAllClick} />
              </TableCell>

              {/* Draggable Column Headers */}
              {visibleColumns.map((column, index) => (
                <Draggable key={column.dataKey} draggableId={column.dataKey} index={index}>
                  {(provided, snapshot) => (
                    <TableCell
                      className={snapshot.isDragging ? 'dragging' : ''}
                      key={column.dataKey}
                      variant="head"
                      align="left"
                      sx={{
                        backgroundColor: snapshot.isDragging ? '#f0f8ff' : 'background.paper',
                        boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : 'none',
                        transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                        cursor: 'grab',
                      }}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Drag Handle Icon */}
                        <DragIndicatorIcon
                          style={{
                            cursor: 'grab',
                            marginRight: '8px',
                            color: snapshot.isDragging ? '#42a5f5' : '#90a4ae',
                            transition: 'color 0.3s ease, transform 0.2s ease',
                            transform: snapshot.isDragging ? 'rotate(15deg)' : 'none',
                          }}
                        />

                        {/* Sortable Column Label */}
                        <TableSortLabel
                          active={orderBy === column.dataKey}
                          direction={orderBy === column.dataKey ? order : 'asc'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSort(column.dataKey);
                          }}
                          sx={{
                            backgroundColor: snapshot.isDragging ? '#bbdefb' : 'inherit',
                            boxShadow: snapshot.isDragging ? 'inset 0 0 8px rgba(0, 0, 0, 0.1)' : 'none',
                            transition: 'background-color 0.3s ease',
                          }}
                        >
                          {column.label}
                        </TableSortLabel>

                        {/* Дополнительные элементы (например, Tooltips, Buttons) */}
                        {column.dataKey === 'Domain' && filterByDomain && (
                          <Tooltip title="Сбросить фильтр по домену" arrow placement="top">
                            <IconButton
                              sx={{ padding: '5px 0', marginLeft: '0' }}
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilterByDomain(null);
                              }}
                            >
                              <RestartAltIcon sx={{ width: '18px' }} />
                            </IconButton>
                          </Tooltip>
                        )}

                        {column.dataKey === 'Accept-Language' && (
                          <FullScreenDialog
                            AcceptLanguage={<DataObjectIcon />}
                            columns={allColumns}
                            rows={processedData}
                            headerFieldsDataKeys={headerFieldsDataKeys}
                            loadMoreRows={loadMoreRows}
                            hasMore={hasMore}
                            label={'Headers'}
                            Description={'Заголовки Headers'}
                          />
                        )}

                        {column.dataKey === 'language' && (
                          <FullScreenDialog
                            AcceptLanguage={<DataObjectIcon />}
                            columns={allColumns}
                            rows={processedData}
                            headerFieldsDataKeys={jsDataFieldsDataKeys}
                            loadMoreRows={loadMoreRows}
                            hasMore={hasMore}
                            label={'JS'}
                            Description={'Данные JS'}
                          />
                        )}

                        {(column.dataKey === 'Headers' || column.dataKey === 'JsData') && (
                          <Tooltip title="Сбросить расширение JSON" arrow placement="top">
                            <IconButton
                              sx={{ padding: '5px 0', marginLeft: '-25px' }}
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCell(null);
                                setFormattedJSON((prev) => {
                                  const newState = { ...prev };
                                  for (const rowId in newState) {
                                    if (newState[rowId]) {
                                      delete newState[rowId][column.dataKey];
                                      if (Object.keys(newState[rowId]).length === 0) {
                                        delete newState[rowId];
                                      }
                                    }
                                  }
                                  return newState;
                                });
                              }}
                            >
                              <RestartAltIcon sx={{ width: '15px' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </TableRow>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

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

    console.log('Новый порядок столбцов:', newVisibleDataKeys); // Для отладки

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
        fixedHeaderContent={fixedHeaderContent}
        rowContent={rowContent}
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
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
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
      />
    </>
  );
}
