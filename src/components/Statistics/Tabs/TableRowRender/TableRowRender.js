// TableRowRender.js
// В этом файле располагаем всю логику отрисовки одной строки. Ранее это было в функции rowContent. Теперь мы сделаем её отдельным компонентом TableRowRender (или можно оставить как функцию).

import React from 'react';
import { TableCell, Button, Checkbox } from '@mui/material';
import { JSONTree } from 'react-json-tree';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DataObjectIcon from '@mui/icons-material/DataObject';

import { isToday, isSameYear } from 'date-fns'; // Для проверки дат
import IPInfo from '../IPInfo/IPInfo.js';
import AlertDialog from '../../HeadersJS/AlertDialog/AlertDialog.js';

export default function TableRowRender({
  row,
  visibleColumns,
  checkedRows,
  handleCheckboxChange,
  expandedCell,
  setExpandedCell,
  formattedJSON,
  setFormattedJSON,
  setFilterByDomain,
  doubleOutput,
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
        <Checkbox checked={isChecked} onChange={handleCheckboxChange(row.ID)} />
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
