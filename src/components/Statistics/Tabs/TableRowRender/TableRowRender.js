// TableRowRender.js
// В этом файле располагаем всю логику отрисовки одной строки. Ранее это было в функции rowContent. Теперь мы сделаем её отдельным компонентом TableRowRender (или можно оставить как функцию).

import React from 'react';
import { TableCell, Button, Checkbox } from '@mui/material';
import { JSONTree } from 'react-json-tree';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DataObjectIcon from '@mui/icons-material/DataObject';
import BlockIcon from '@mui/icons-material/Block'; // не забудь импорт
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { Tooltip, Chip } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { isToday, isSameYear } from 'date-fns'; // Для проверки дат
import IPInfo from '../IPInfo/IPInfo.js';
import AlertDialog from '../../HeadersJS/AlertDialog/AlertDialog.js';
import IncognitoIcon from '@mui/icons-material/Visibility'; // или любой другой иконкой инкогнито
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axiosInstance from '../../../../axiosInstance'; // Для API запросов

export default function TableRowRender({
  row,
  rows,
  visibleColumns,
  checkedRows,
  handleCheckboxChange,
  expandedCell,
  setExpandedCell,
  formattedJSON,
  setFormattedJSON,
  setFilterByDomain,
  setFilterCompanyID,
  setFilterAccountID,
  setFilterKeyword,
  setFilterFingerprint,
  setFilterMotionDataRaw,
  setFilterIP,
  setFilterTimeSpent,
  doubleOutput,
  companyIDData,
  dataGoogleAccounts,
}) {
  // Состояние для отслеживания is_reference
  const [isReference, setIsReference] = React.useState(row.IsReference || false);
  const [hoveredDomain, setHoveredDomain] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);
  
  // Обработчик изменения IsReference
  const handleReferenceChange = async (clickId, newValue) => {
    try {
      const response = await axiosInstance.post('/reference/update', {
        id: parseInt(clickId, 10), // Преобразуем в число
        isReference: newValue
      });
      
      if (response.status === 200) {
        setIsReference(newValue);
        // Обновляем значение в row для синхронизации
        row.IsReference = newValue;
      }
    } catch (error) {
      console.error('Ошибка при обновлении reference статуса:', error);
      // Откатываем изменение при ошибке
      setIsReference(!newValue);
    }
  };
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

  // WebView
  const headers = typeof row.Headers === 'string' ? JSON.parse(row.Headers) : row.Headers;
  const userAgent = headers?.['User-Agent'] || '';
  const xRequestedWith = headers?.['X-Requested-With'] || '';

  const isWebViewBot =
    userAgent.includes('wv') && typeof xRequestedWith === 'string' && xRequestedWith.startsWith('com.');

  return (
    <>
      {/* Чекбокс каждой строки */}
      <TableCell className="statistics__checked" align="left" style={{ backgroundColor: rowBackgroundColor }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Checkbox checked={isChecked} onChange={handleCheckboxChange(row.ID)} />

          {/* Метка WebView */}
          {isWebViewBot && (
            <Tooltip title="Обнаружен WebView бот (приложение)">
              <Chip size="small" color="error" variant="outlined" icon={<BlockIcon />} label="WV" />
            </Tooltip>
          )}

          {/* Отметка, если был клик по скрытому элементу */}
          {row.ClickOnInvisibleNumber && (
            <Tooltip title="Был клик по скрытому элементу">
              <Chip size="small" color="warning" variant="container" icon={<VisibilityOffIcon />} />
            </Tooltip>
          )}

          {/* Анализ JS-данных и Headers */}
          {(() => {
            try {
              const jsData = typeof row.JsData === 'string' ? JSON.parse(row.JsData) : row.JsData;
              const headers = typeof row.Headers === 'string' ? JSON.parse(row.Headers) : row.Headers;

              let score = 0;
              let total = 0;
              const log = [];

              // navigator.languages.length
              total++;
              if (Array.isArray(jsData.languages) && jsData.languages.length === 1) {
                score++;
                log.push('🌍 navigator.languages.length === 1 → ⚠️ +1 (инкогнито)');
              } else {
                log.push('🌍 navigator.languages.length > 1 → ✅ 0');
              }

              // navigator.language
              total++;
              if (jsData.language === 'ru') {
                score += 0.5;
                log.push("🗣 navigator.language === 'ru' → ⚠️ +0.5 (возможно инкогнито)");
              } else {
                log.push("🗣 navigator.language !== 'ru' → ✅ 0");
              }

              // navigator.plugins.length
              total++;
              if (jsData.pluginsLength === 0) {
                score++;
                log.push('🔌 navigator.plugins.length === 0 → ⚠️ +1 (инкогнито)');
              } else {
                log.push(`🔌 navigator.plugins.length = ${jsData.pluginsLength} → ✅ 0`);
              }

              // totalJSHeapSize
              if (jsData.totalJSHeapSize) {
                total++;
                log.push(`🧠 totalJSHeapSize: ${jsData.totalJSHeapSize}`);
                if (jsData.totalJSHeapSize < 15000000) {
                  score++;
                  log.push('🧠 Маленький JS heap → ⚠️ +1 (инкогнито)');
                } else {
                  log.push('🧠 Объем памяти нормальный → ✅ 0');
                }
              } else {
                log.push('🧠 performance.memory не поддерживается → ❌ Пропущено');
              }

              // Sec-Fetch-Storage-Access
              if (headers['Sec-Fetch-Storage-Access']) {
                total++;
                const value = headers['Sec-Fetch-Storage-Access'].toLowerCase();
                log.push(`📦 Sec-Fetch-Storage-Access: "${value}"`);
                if (value === 'none') {
                  score++;
                  log.push('📦 Хранилище недоступно → ⚠️ +1 (инкогнито)');
                } else {
                  log.push('📦 Хранилище активно → ✅ 0');
                }
              } else {
                log.push('📦 Sec-Fetch-Storage-Access не найден → ❌ Пропущено');
              }

              // StorageQuota (в байтах)
              if (row.StorageQuota && !isNaN(row.StorageQuota) && row.StorageQuota !== 0) {
                total++;
                const quotaMB = row.StorageQuota / 1024 / 1024;
                log.push(`📦 storageQuota: ${quotaMB.toFixed(2)} MB`);
                if (quotaMB < 10000) {
                  score++;
                  log.push('📦 Мало выделено памяти → ⚠️ +1 (инкогнито)');
                } else {
                  log.push('📦 Нормальный объём памяти → ✅ 0');
                }
              } else {
                log.push('📦 StorageQuota не определено или = 0 → ❌ Пропущено');
              }

              const confidence = Math.min(Math.round((score / total) * 100), 100);
              if (confidence === 0) return null;

              let verdict = '';
              if (confidence >= 75) {
                verdict = '🕵️ Вывод: Инкогнито';
              } else if (confidence >= 50) {
                verdict = '⚠️ Вывод: Возможно инкогнито';
              } else {
                verdict = '✅ Вывод: Обычный режим';
              }

              return (
                <Tooltip
                  title={
                    <div style={{ whiteSpace: 'pre-line', maxWidth: '500px' }}>
                      <b>Проверка режима браузера (инкогнито или нет)</b>
                      <br />
                      {log.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                      <br />
                      📊 Вероятность: {confidence}%<br />
                      {verdict}
                    </div>
                  }
                >
                  <Chip
                    size="small"
                    color={confidence >= 75 ? 'error' : confidence >= 50 ? 'warning' : 'success'}
                    variant="outlined"
                    icon={<IncognitoIcon />}
                    label={`${confidence}%`}
                  />
                </Tooltip>
              );
            } catch (e) {
              return null;
            }
          })()}

          {/* Несовпадение User-Agent */}
          {(() => {
            try {
              const jsData = typeof row.JsData === 'string' ? JSON.parse(row.JsData) : row.JsData;
              const headers = typeof row.Headers === 'string' ? JSON.parse(row.Headers) : row.Headers;

              const headersUA = headers?.['User-Agent'] || '';
              const jsUA = jsData?.userAgent || '';

              if (headersUA && jsUA && headersUA !== jsUA) {
                return (
                  <Tooltip
                    title={
                      <div style={{ whiteSpace: 'pre-line', maxWidth: '400px' }}>
                        ⚠️ <b>Несовпадение User-Agent</b>
                        {'\n'}
                        <b>Headers:</b> {headersUA}
                        {'\n'}
                        <b>JS:</b> {jsUA}
                        {'\n'}
                        Возможный признак бота или подмены окружения.
                      </div>
                    }
                  >
                    <Chip size="small" color="warning" variant="outlined" icon={<BlockIcon />} label="UA" />
                  </Tooltip>
                );
              }
              return null;
            } catch (e) {
              return null;
            }
          })()}
        </div>
      </TableCell>

      {visibleColumns.map((column) => {
        const cellKey = column.dataKey;
        const cellValue = row[cellKey];

        // Логика для IsReference чекбокса
        if (cellKey === 'IsReference') {
          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="center"
              style={{ backgroundColor: rowBackgroundColor }}
            >
              <Checkbox
                checked={isReference}
                onChange={(e) => handleReferenceChange(row.ID, e.target.checked)}
                color="primary"
                size="small"
              />
            </TableCell>
          );
        }

        // Логика для windowSize
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

        // Логика для outerWindowSize
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

        // Логика для screenSize
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

        // Логика для ClickOnNumber
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

        // Логика для ClickOnNumber
        if (cellKey === 'ClickOnInvisibleNumber') {
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

        // Логика для StorageQuota
        if (cellKey === 'StorageQuota') {
          const quotaInMB = cellValue ? (cellValue / 1024 / 1024).toFixed(2) : '0.00';

          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{ backgroundColor: rowBackgroundColor }}
            >
              {quotaInMB} MB
            </TableCell>
          );
        }

        // Поле даты CreatedAt
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
                `${date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} | ${date.toLocaleTimeString(
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

        // Поле ClickCoordinates
        if (cellKey === 'ClickCoordinates') {
          let coords = '';
          let timeStr = '';
          let last4 = '';

          if (typeof cellValue === 'string') {
            const parts = cellValue.trim().split(/\s+/);
            coords = parts.slice(0, 2).join(' '); // X:... Y:...
            timeStr = parts[2] || '';              // HH:MM:SS
            last4 = parts[3] ? parts[3].replace('#', '') : '';
          }

          let dateFormatted = timeStr;
          if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
            // Делаем Date с сегодняшней датой + указанное время
            const [h, m, s] = timeStr.split(':').map(Number);
            const dateObj = new Date();
            // Сначала ставим UTC, потом локализуем
            dateObj.setUTCHours(h, m, s, 0);

            dateFormatted = dateObj.toLocaleTimeString('ru-RU', {
              timeZone: 'Europe/Moscow',
            });
          }

          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{
                backgroundColor: rowBackgroundColor,
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ color: '#555', marginRight: '8px' }}>{coords}</span>
              <span style={{ color: '#009688', marginRight: '8px' }}>{dateFormatted}</span>
              {last4 && (
                <span
                  style={{
                    backgroundColor: '#e0f7fa',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: '#00796b',
                    fontWeight: 'bold'
                  }}
                >
                  {last4}
                </span>
              )}
            </TableCell>
          );
        }

        // Логика для Domain (фильтр по домену)
        if (cellKey === 'Domain') {
          const handleCopyUrl = () => {
            const url = `https://${cellValue}`;
            navigator.clipboard.writeText(url).then(() => {
              setCopySuccess(true);
              setTimeout(() => setCopySuccess(false), 2000);
            });
          };

          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{ 
                backgroundColor: rowBackgroundColor,
                position: 'relative'
              }}
              onMouseEnter={() => setHoveredDomain(true)}
              onMouseLeave={() => setHoveredDomain(false)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                
                {/* Кнопки показываются только при наведении */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  opacity: hoveredDomain ? 1 : 0,
                  visibility: hoveredDomain ? 'visible' : 'hidden',
                  transition: 'opacity 0.2s ease, visibility 0.2s ease',
                }}>
                  {/* Кнопка-ссылка на сайт */}
                  <Tooltip title="Открыть сайт">
                    <a
                      href={`https://${cellValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: '#1976d2',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </a>
                  </Tooltip>
                  
                  {/* Кнопка копирования URL */}
                  <Tooltip title={copySuccess ? "Скопировано!" : "Копировать URL"}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl();
                      }}
                      style={{
                        color: copySuccess ? '#4caf50' : '#666',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!copySuccess) {
                          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                          e.target.style.color = '#333';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        if (!copySuccess) {
                          e.target.style.color = '#666';
                        }
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </TableCell>
          );
        }

        // Логика для TimeSpent (фильтр по времени)
        if (cellKey === 'TimeSpent') {
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
                onClick={() => setFilterTimeSpent(cellValue)}
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

        // Логика для CompanyID (фильтр по CompanyID)
        if (cellKey === 'CompanyID') {
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
                onClick={() => setFilterCompanyID(cellValue)}
                sx={{
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {/* Находим и подставляем название компании если его нету то CompanyID */}
                {(() => {
                  const company = companyIDData.find((company) => company.CompanyID === cellValue);
                  return company ? company.Name : cellValue;
                })()}
              </Button>
            </TableCell>
          );
        }

        // Логика для AccountID (фильтр по CompanyID)
        if (cellKey === 'AccountID') {
          // Установка цвета фона в зависимости от значения
          let background = rowBackgroundColor;
          const value = (cellValue || '').toLowerCase();

          // Цвета для каждого конкретного значения
          if (value !== '-') background = '#dbceff'; // Mobile
          else if (value === '-') background = '#dbe5ff'; // Неизвестное устройство

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
                onClick={() => setFilterAccountID(cellValue)}
                sx={{
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  color: '#423671',
                }}
              >
                <div
                  style={{
                    fontSize: 'inherit',
                    backgroundColor: background,
                    width: '100%',
                    padding: '0 10px',
                    borderRadius: '5px',
                  }}
                >
                  {/* Находим и подставляем название компании если его нету то CompanyID */}
                  {(() => {
                    const account = dataGoogleAccounts.find((account) => account.account_id === cellValue);
                    return account ? account.email : cellValue;
                  })()}
                </div>
              </Button>
            </TableCell>
          );
        }

        // Логика для Keyword (фильтр по CompanyID)
        if (cellKey === 'Keyword') {
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
                onClick={() => setFilterKeyword(cellValue)}
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

        // Логика для поля IsFirstVisit (отметка первого визита за сутки)
        if (cellKey === 'IsFirstVisit') {
          const isFirst = cellValue === true || cellValue === 'true';
          const isFalse = cellValue === false || cellValue === 'false';
          const isUnknown = !isFirst && !isFalse;

          let backgroundColor = '#ffd5d5'; // по умолчанию красный (не первый визит)
          if (isFirst) backgroundColor = '#d0f0c0'; // зелёный
          else if (isUnknown) backgroundColor = '#e0e0e0'; // серый

          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{
                backgroundColor,
                textAlign: 'center',
              }}
            >
              {isFirst ? (
                <Tooltip title="✅ Первый визит за сутки (на этом домене)" arrow placement="left">
                  <CheckIcon color="success" />
                </Tooltip>
              ) : isFalse ? (
                <Tooltip title="❌ Не первый визит" arrow placement="left">
                  <CloseIcon color="error" />
                </Tooltip>
              ) : (
                <Tooltip title="❓ Неизвестно / данных нет" arrow placement="left">
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>?</span>
                </Tooltip>
              )}
            </TableCell>
          );
        }

        // Логика для HadTouchBeforeScroll (определение, был ли скролл с касанием/мышью)
        if (cellKey === 'HadTouchBeforeScroll') {
          const value = cellValue;

          let backgroundColor = '#f5f5f5';
          let icon = null;
          let tooltip = '';

          if (value === true) {
            backgroundColor = '#d0f0c0';
            icon = <CheckIcon color="success" />;
            tooltip = '✅ Было касание или мышь до скролла';
          } else if (value === false) {
            backgroundColor = '#fff3cd';
            icon = <CloseIcon color="warning" />;
            tooltip = '⚠ Скролл был без касания или мыши — возможно бот';
          } else {
            backgroundColor = '#e0e0e0';
            tooltip = '🤷 Данных нет — либо не было скролла, либо не сработал флаг';
            icon = <span style={{ fontWeight: 'bold' }}>?</span>;
          }

          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{
                backgroundColor,
                textAlign: 'center',
              }}
            >
              <Tooltip title={tooltip} arrow placement="left">
                {icon}
              </Tooltip>
            </TableCell>
          );
        }

        // Логика для ClickCallType + HadTouchBeforeScroll (сценарии поведения)
        if (cellKey === 'ClickCallType') {
          const type = row.ClickCallType;

          let icon = <span style={{ fontWeight: 'bold' }}>?</span>;
          let title = '🤷 Нет информации о типе клика';
          let backgroundColor = '#e0e0e0';

          if (type === 'touch') {
            icon = <CheckIcon color="success" />;
            title = '✅ Клик по номеру с касанием (touch) — скорее всего телефон';
            backgroundColor = '#d0f0c0';
          } else if (type === 'mouse') {
            icon = <CheckIcon color="info" />;
            title = '🖱️ Клик по номеру мышью';
            backgroundColor = '#f0f4c3';
          } else if (type === 'none') {
            icon = <BlockIcon color="error" />;
            title = '🚫 Клик без мыши и тача — возможно бот';
            backgroundColor = '#f8d7da';
          }

          return (
            <TableCell className="statistics__padding" key={cellKey} align="center" style={{ backgroundColor }}>
              <Tooltip title={title} arrow placement="left">
                <span>{icon}</span>
              </Tooltip>
            </TableCell>
          );
        }

        // Логика для Fingerprint (фильтр по Fingerprint)
        if (cellKey === 'Fingerprint') {
          // Если отпечатка нет или он пустой
          if (!cellValue || cellValue === '...' || cellValue.trim() === '') {
            return (
              <TableCell
                className="statistics__padding"
                key={cellKey}
                align="center"
                style={{ backgroundColor: rowBackgroundColor }}
              >
                <Tooltip title="Отпечаток не определён">
                  <BlockIcon color="disabled" />
                </Tooltip>
              </TableCell>
            );
          }

          const shortFingerprint = cellValue.substring(0, 8) + '...';
          const currentDomain = row.Domain;

          const allRowsWithSameFingerprint = rows.filter((r) => r.Fingerprint === cellValue);
          const countAll = allRowsWithSameFingerprint.length;
          const countCurrentDomain = allRowsWithSameFingerprint.filter((r) => r.Domain === currentDomain).length;

          // Цвет в зависимости от количества заходов
          let chipColor = 'default';
          if (countAll >= 10) chipColor = 'error';
          else if (countAll >= 5) chipColor = 'warning';
          else chipColor = 'success'; // чистый отпечаток

          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{ backgroundColor: rowBackgroundColor }}
            >
              <Tooltip
                arrow
                placement="left"
                title={
                  <div style={{ whiteSpace: 'pre-line' }}>
                    🆔 <b>Цифровой отпечаток браузера:</b> {cellValue}
                    {'\n'}
                    {'\n'}
                    🌐 <b>Домен:</b> {currentDomain}
                    {'\n'}
                    🔁 На этот домен: {countCurrentDomain}
                    {'\n'}
                    📊 Всего по всем доменам: {countAll}
                  </div>
                }
              >
                <Chip
                  label={`${shortFingerprint} (${countCurrentDomain}/${countAll})`}
                  size="small"
                  color={chipColor}
                  onClick={() => setFilterFingerprint(cellValue)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                />
              </Tooltip>
            </TableCell>
          );
        }

        // Логика для MotionDataRaw (анализ движения устройства)
        if (cellKey === 'MotionDataRaw') {
          try {
            const motionData =
              typeof row.MotionDataRaw === 'string' ? JSON.parse(row.MotionDataRaw) : row.MotionDataRaw;

            const deltaSum = motionData?.deltaSum || 0;
            const start = motionData?.start;
            const end = motionData?.end;
            const analyzeDelayMs = motionData?.analyzeDelayMs;
            const status = motionData?.status || 'unknown';
            const permissionState = motionData?.permissionState || 'default';
            // console.log(motionData)

            let icon = <HelpOutlineIcon />;
            let color = 'default';
            let shortLabel = '❓ Неизвестно';
            let fullLabel = '❓ Неизвестный статус анализа движения';

            if (status === 'no-data') {
              icon = <ErrorIcon />;
              color = 'warning';
              shortLabel = '⚠️ Нет данных';
              fullLabel = `
            ⚠️ Возможный бот — но зависит от устройства
            
            📱 На iPhone (iOS):
            - Если пользователь не дал разрешение на сенсоры, может быть статус no-data.
            - Это **не является признаком бота**, если permissionState = default или denied.
            
            🖥 На Android/десктопах:
            - Сенсоры поддерживаются, но данные не поступили.
            - Возможные причины:
              - JavaScript исполняется не полностью.
              - Headless браузер.
              - Бот с отключёнными событиями.
            
            ✅ Считается подозрительным, **если такое поведение повторяется** на Android или ПК.
              `.trim();
            } else if (status === 'no-sensor') {
              icon = <BlockIcon />;
              color = 'default';
              shortLabel = '🖥 Нет сенсоров';
              fullLabel = `
        🖥 может быть обычный ПК
        
        Это означает, что у устройства просто нет сенсоров (обычный десктоп или ноутбук).
        
        ❗ Не признак бота сам по себе, но если:
        - navigator.plugins.length === 0
        - и нет touchstart или scroll
        - и нет кликов
        - и отпечаток часто повторяется
        → это усиливает подозрения.
              `.trim();
            } else if (status === 'not-enough') {
              icon = <ErrorIcon />;
              color = 'warning';
              shortLabel = '⚠️ Недостаточно';
              fullLabel = `
        ⚠️ подозрительно
        
        Сенсоры активны, но было получено менее 2 значений — очень быстро завершилось или блокировка.
        
        Часто бывает в headless или нестабильных WebView.
        
        ✅ Используй как сигнал осторожности, особенно если повторяется.
              `.trim();
            } else if (status === 'no-permission') {
              icon = <BlockIcon />;
              color = 'warning';
              shortLabel = '📵 Нет доступа';
              fullLabel = `
        📵 пользователь не дал разрешение
        
        Пользователь отклонил доступ к сенсорам (в основном iOS Safari).
        
        🟡 Не всегда бот, но может быть.
              `.trim();
            } else if (status === 'unknown') {
              icon = <HelpOutlineIcon />;
              color = 'default';
              shortLabel = '❓ Неизвестно';
              fullLabel = `
        ❓ Скрипт не исполнился
        
        Статус unknown означает, что ничего не определилось — плохо исполнялся скрипт.
        
        🟡 Не всегда бот, но может быть.
              `.trim();
            } else if (status === 'ok') {
              if (deltaSum > 5) {
                icon = <CheckCircleIcon />;
                color = 'success';
                shortLabel = '✅ Движение';
                fullLabel = `
        ✅ Обнаружено движение
        
        Устройство с сенсорами зафиксировало движение.
        
        Это нормальное поведение.
                `.trim();
              } else {
                icon = <ErrorIcon />;
                color = 'error';
                shortLabel = '🚨 Нет движения';
                fullLabel = `
        🚨 нет движения (Δ < 5)
        
        Это подозрительно на мобильных, где сенсоры есть, но движения нет.
        
        Особенно если это повторяется и нет других активностей (клик, скролл).
        
        ✅ Это индикатор неестественного поведения.
                `.trim();
              }
            }

            const permissionReadable = {
              granted: '✅ Разрешено пользователем',
              denied: '❌ Запрещено пользователем',
              default: '🤷 Нет ответа (по умолчанию)',
            };

            const techDetails = `
        Изменение углов: ${deltaSum.toFixed(2)}°
        📍 Начало: β ${start?.beta ?? '-'}, γ ${start?.gamma ?? '-'}
        🎯 Конец: β ${end?.beta ?? '-'}, γ ${end?.gamma ?? '-'}
        ⏱ Анализ через: ${analyzeDelayMs ?? '—'} мс
        🔐 Разрешение iOS: ${permissionReadable[permissionState]}
            `.trim();

            const tooltipText = `${fullLabel}\n\n${techDetails}`;

            return (
              <TableCell className="statistics__padding" key={cellKey} align="center">
                <Tooltip
                  title={<pre style={{ whiteSpace: 'pre-line', maxWidth: 300 }}>{tooltipText}</pre>}
                  arrow
                  placement="left"
                >
                  <Chip
                    size="small"
                    color={color}
                    icon={icon}
                    label={shortLabel}
                    variant="outlined"
                    onClick={() => setFilterMotionDataRaw(shortLabel)}
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  />
                </Tooltip>
              </TableCell>
            );
          } catch (e) {
            return (
              <TableCell className="statistics__padding" key={cellKey} align="center">
                <Tooltip title="Ошибка при разборе MotionDataRaw">
                  <Chip size="small" color="error" icon={<BlockIcon />} label="Ошибка" variant="outlined" />
                </Tooltip>
              </TableCell>
            );
          }
        }

        // Логика для Headers, JsData (кнопка + раскрытие JSON)
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

        // Логика для Referer
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

        // Логика для IP (отдельный компонент IPInfo)
        if (cellKey === 'IP') {
          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{ backgroundColor: rowBackgroundColor }}
            >
              <IPInfo IP={cellValue} setFilterIP={setFilterIP} />
            </TableCell>
          );
        }

        // Логика для поля Accept-Language (модальное окно)
        if (cellKey === 'Accept-Language') {
          return (
            <TableCell
              className="statistics__padding"
              key={cellKey}
              align="left"
              style={{ backgroundColor: rowBackgroundColor }}
            >
              <div
                style={{
                  maxWidth: '200px', // Ограничение ширины блока
                  overflow: 'hidden', // Скрываем всё, что выходит за пределы
                  textOverflow: 'ellipsis', // При выходе за пределы показываем "..."
                  whiteSpace: 'nowrap', // Не переносим текст на новую строку
                  cursor: 'pointer',
                  color: '#1976d2',
                  textDecoration: 'underline',
                }}
              >
                <AlertDialog
                  AcceptLanguage={cellValue}
                  Headers={row.Headers}
                  Label={'Headers'}
                  Title={'Заголовки (Headers)'}
                  doubleOutput={doubleOutput}
                  doubleData={row.JsData}
                />
              </div>
            </TableCell>
          );
        }

        // Логика для поля language (модальное окно JS)
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

        // Логика для поля Gclid (длина)
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

        // Логика для поля Device (значение + цвет фона по типу устройства)
        if (cellKey === 'Device') {
          // Установка цвета фона в зависимости от значения
          let background = rowBackgroundColor;
          const value = (cellValue || '').toLowerCase();

          // Цвета для каждого конкретного значения
          if (value === 'm') background = '#ffd5cc'; // Mobile
          else if (value === 't') background = '#ffb6a1'; // Tablet
          else if (value === 'c') background = '#ff9c86'; // Computer
          else if (value === '-') background = '#e8cff7'; // Неизвестное устройство

          return (
            <TableCell className="statistics__padding" key={cellKey} align="left">
              <div
                style={{
                  fontSize: 'inherit',
                  backgroundColor: background,
                  width: '100%',
                  padding: '0 10px',
                  borderRadius: '5px',
                }}
              >
                {cellValue}
              </div>
            </TableCell>
          );
        }

        // Логика для новых полей из JsData
        if (cellKey === 'hardwareConcurrency') {
          const value = cellValue !== null && cellValue !== undefined && !isNaN(cellValue) ? cellValue : null;
          return (
            <TableCell className="statistics__padding" key={cellKey} align="left" style={{ backgroundColor: rowBackgroundColor }}>
              {value !== null ? value : '-'}
            </TableCell>
          );
        }

        if (cellKey === 'deviceMemory') {
          const value = cellValue !== null && cellValue !== undefined && !isNaN(cellValue) ? cellValue : null;
          return (
            <TableCell className="statistics__padding" key={cellKey} align="left" style={{ backgroundColor: rowBackgroundColor }}>
              {value !== null ? `${value} GB` : '-'}
            </TableCell>
          );
        }

        if (cellKey === 'clickCount') {
          const value = cellValue !== null && cellValue !== undefined && !isNaN(cellValue) ? cellValue : 0;
          return (
            <TableCell className="statistics__padding" key={cellKey} align="left" style={{ backgroundColor: rowBackgroundColor }}>
              {value}
            </TableCell>
          );
        }

        if (cellKey === 'maxScrollY') {
          const value = cellValue !== null && cellValue !== undefined && !isNaN(cellValue) ? Math.round(cellValue) : 0;
          return (
            <TableCell className="statistics__padding" key={cellKey} align="left" style={{ backgroundColor: rowBackgroundColor }}>
              {`${value}px`}
            </TableCell>
          );
        }

        if (cellKey === 'hadMouse' || cellKey === 'hadTouch' || 
            cellKey === 'hasConnection' || cellKey === 'hasMemory' || 
            cellKey === 'hasPlugins' || cellKey === 'hasDeviceOrientationEvent' || 
            cellKey === 'isTouchCapable') {
          return (
            <TableCell className="statistics__padding" key={cellKey} align="center" style={{ backgroundColor: rowBackgroundColor }}>
              {cellValue === true ? (
                <CheckIcon style={{ color: '#4caf50' }} />
              ) : cellValue === false ? (
                <CloseIcon style={{ color: '#f44336' }} />
              ) : (
                '-'
              )}
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
            {cellValue !== undefined && cellValue !== null && typeof cellValue !== 'object'
              ? cellValue.toString()
              : '-'}
          </TableCell>
        );
      })}
    </>
  );
}
