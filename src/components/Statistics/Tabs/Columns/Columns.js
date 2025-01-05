// columns.js

import React from 'react';
import Tooltip from '@mui/material/Tooltip';

// ИКОНКИ, используемые в label
import KeyIcon from '@mui/icons-material/Key';
import DataObjectIcon from '@mui/icons-material/DataObject';
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
export const headerFieldsDataKeys = [
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

export const jsDataFieldsDataKeys = [
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
export const defaultVisibleDataKeys = [
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
