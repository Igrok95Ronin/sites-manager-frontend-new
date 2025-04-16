// TableRowRender.js
// В этом файле располагаем всю логику отрисовки одной строки. Ранее это было в функции rowContent. Теперь мы сделаем её отдельным компонентом TableRowRender (или можно оставить как функцию).

import React from 'react';
import { TableCell, Button, Checkbox } from '@mui/material';
import { JSONTree } from 'react-json-tree';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DataObjectIcon from '@mui/icons-material/DataObject';
import BlockIcon from '@mui/icons-material/Block'; // не забудь импорт

import { Tooltip, Chip } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { isToday, isSameYear } from 'date-fns'; // Для проверки дат
import IPInfo from '../IPInfo/IPInfo.js';
import AlertDialog from '../../HeadersJS/AlertDialog/AlertDialog.js';
import IncognitoIcon from '@mui/icons-material/Visibility'; // или любой другой иконкой инкогнито

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
  doubleOutput,
  companyIDData,
  dataGoogleAccounts,
}) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Checkbox checked={isChecked} onChange={handleCheckboxChange(row.ID)} />

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
        </div>
      </TableCell>

      {visibleColumns.map((column) => {
        const cellKey = column.dataKey;
        const cellValue = row[cellKey];

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

        // Логика для Domain (фильтр по домену)
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
              <IPInfo IP={cellValue} />
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
