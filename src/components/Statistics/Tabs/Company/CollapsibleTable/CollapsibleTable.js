import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

// Новый импорт для индикации сортировки
import TableSortLabel from '@mui/material/TableSortLabel';

import './CollapsibleTable.scss';

/**
 * Функция для группировки ключевых слов с подсчётом их количества и кликов.
 * @param {Array} data - массив объектов с полями `Keyword`, `Domain`, `ClickOnNumber`, `AccountID`.
 * @returns {Object} объект, где ключ — ключевое слово, значение — {count, clicks, domain, accountId}.
 */
function groupKeywords(data) {
  return data.reduce((acc, { Keyword, Domain, ClickOnNumber, AccountID }) => {
    if (!acc[Keyword]) {
      acc[Keyword] = {
        count: 0,
        clicks: 0,
        domain: Domain,
        accountId: AccountID, // Для сопоставления с dataGoogleAccounts (если нужно)
      };
    }
    // Увеличиваем количество показов (count)
    acc[Keyword].count += 1;

    // Если был клик, то увеличиваем общее число кликов
    if (ClickOnNumber) {
      acc[Keyword].clicks += 1;
    }
    return acc;
  }, {});
}

/**
 * Функция для группировки данных по CompanyID.
 * @param {Array} data - массив объектов.
 * @returns {Array} массив, где каждый элемент — объект, сгруппированный по CompanyID.
 */
function groupByCompanyID(data) {
  const grouped = data.reduce((acc, curr) => {
    // Если в аккумуляторе ещё нет объекта под этим CompanyID, создаём
    if (!acc[curr.CompanyID]) {
      acc[curr.CompanyID] = {
        ...curr,
        Keywords: [],
        TotalKeywords: 0,
        TotalClicks: 0,
      };
    }

    // Наполняем поля Keywords, TotalKeywords, TotalClicks
    acc[curr.CompanyID].Keywords.push(curr.Keyword);
    acc[curr.CompanyID].TotalKeywords += 1;

    if (curr.ClickOnNumber) {
      acc[curr.CompanyID].TotalClicks += 1;
    }

    return acc;
  }, {});

  // Преобразуем объект в массив
  return Object.values(grouped);
}

/**
 * Компонент, отвечающий за рендер строки таблицы и вложенной таблицы с ключевыми словами.
 */
function Row({
  row,
  originalData,
  openRow,
  setOpenRow,
  companyIDData,
  dataGoogleAccounts,
  setValue,
  setFilterCompanyID,
  setFilterKeyword,
  setFilterByDomain,
  setFilterAccountID,
}) {
  /**
   * В companyIDData ищем совпадение по полю CompanyID,
   * чтобы при наличии Name отобразить его вместо самого CompanyID
   */
  const foundCompany = companyIDData.find((company) => company.CompanyID === row.CompanyID);

  // Если в foundCompany есть Name, то отображаем его, иначе — исходный CompanyID
  const displayName = foundCompany && foundCompany.Name ? foundCompany.Name : row.CompanyID;

  /**
   * Подсчёт общей конверсии в процентах (TotalClicks / TotalKeywords * 100).
   * Если TotalKeywords = 0, ставим '0.00'
   */
  const conversion = row.TotalKeywords ? ((row.TotalClicks / row.TotalKeywords) * 100).toFixed(2) : '0.00';

  /**
   * Фильтрация оригинальных данных по текущему CompanyID,
   * чтобы получить только те строки, которые относятся к данной компании
   */
  const keywordsForCompany = originalData.filter((item) => item.CompanyID === row.CompanyID);

  /**
   * Группировка ключевых слов (ключ: Keyword) => { count, clicks, domain, accountId }
   */
  const groupedKeywords = groupKeywords(keywordsForCompany);

  /**
   * ---------------------------------
   * ЛОГИКА СОРТИРОВКИ ВНУТРЕННЕЙ ТАБЛИЦЫ
   * ---------------------------------
   * Сортируем по умолчанию по Conversion (%) в порядке "desc" (убывание).
   */
  const [sortField, setSortField] = React.useState('conversion');
  const [sortOrder, setSortOrder] = React.useState('desc');

  /**
   * Функция, которая вызывается при клике по заголовку столбца.
   * Если мы кликаем по тому же полю, порядок сортировки переключается (asc/desc).
   * Если по новому — ставим его и по умолчанию "asc".
   */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  /**
   * Мемоизированный массив ключевых слов, отсортированный по указанному полю
   * sortField, с учётом порядка sortOrder.
   */
  const sortedKeywords = React.useMemo(() => {
    const entries = Object.entries(groupedKeywords);

    entries.sort((a, b) => {
      const [akey, aval] = a; // akey — Keyword, aval — {count, clicks, domain, accountId}
      const [bkey, bval] = b; // bkey — Keyword, bval — {count, clicks, domain, accountId}

      let compareVal = 0;

      // Считаем конверсию для сравнения (если потребуется)
      const aConversion = aval.count ? aval.clicks / aval.count : 0;
      const bConversion = bval.count ? bval.clicks / bval.count : 0;

      switch (sortField) {
        case 'keyword':
          compareVal = akey.localeCompare(bkey);
          break;
        case 'domain':
          compareVal = aval.domain.localeCompare(bval.domain);
          break;
        case 'accountId': {
          const aAccountId = aval.accountId || '';
          const bAccountId = bval.accountId || '';
          compareVal = aAccountId.localeCompare(bAccountId);
          break;
        }
        case 'count':
          compareVal = aval.count - bval.count;
          break;
        case 'clicks':
          compareVal = aval.clicks - bval.clicks;
          break;
        case 'conversion':
        default:
          compareVal = aConversion - bConversion;
          break;
      }

      return sortOrder === 'asc' ? compareVal : -compareVal;
    });

    return entries;
  }, [groupedKeywords, sortField, sortOrder]);

  // Основной обработчик на всю строку:
  const handleToggle = () => {
    setOpenRow(openRow === row.CompanyID ? null : row.CompanyID);
  };

  return (
    <React.Fragment>
      {/* Основная строка с данными компании */}
      {/* Теперь кликабельна вся строка */}
      <TableRow
        className="collapsibleTable__row"
        onClick={handleToggle} // Обработчик клика по всей строке
      >
        <TableCell scope="row" className="collapsibleTable__cell collapsibleTable__companyCell">
          <span
            onClick={(e) => {
              e.stopPropagation(); // Останавливаем всплытие, чтобы не срабатывал клик на всю строку
              setValue(0); // Устанавливаем значение 0 для переключения таба
              setFilterCompanyID(row.CompanyID);
            }}
            className="collapsibleTable__link"
          >
            {displayName}
          </span>
        </TableCell>

        <TableCell align="right" className="collapsibleTable__cell collapsibleTable__numericCell">
          {row.TotalKeywords}
        </TableCell>
        <TableCell align="right" className="collapsibleTable__cell collapsibleTable__numericCell">
          {row.TotalClicks}
        </TableCell>
        <TableCell align="right" className="collapsibleTable__cell collapsibleTable__numericCell">
          {conversion} %
        </TableCell>
      </TableRow>

      {/* Вложенная таблица (при раскрытии) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={openRow === row.CompanyID} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {/* Заголовок вложенной таблицы */}
              {/* <Typography variant="h6" gutterBottom component="div">
                {displayName}
              </Typography> */}

              <Table size="small" aria-label="keywords">
                <TableHead>
                  <TableRow className="collapsibleTable__headerRow">
                    <TableCell className="collapsibleTable__headerCell collapsibleTable__sortableHeader">
                      <TableSortLabel
                        active={sortField === 'keyword'}
                        direction={sortField === 'keyword' ? sortOrder : 'asc'}
                        onClick={() => handleSort('keyword')}
                      >
                        <span className="collapsibleTable__sortableText">Keyword</span>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="collapsibleTable__headerCell collapsibleTable__sortableHeader">
                      <TableSortLabel
                        active={sortField === 'domain'}
                        direction={sortField === 'domain' ? sortOrder : 'asc'}
                        onClick={() => handleSort('domain')}
                      >
                        <span className="collapsibleTable__sortableText">Domain</span>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="collapsibleTable__headerCell collapsibleTable__sortableHeader">
                      <TableSortLabel
                        active={sortField === 'accountId'}
                        direction={sortField === 'accountId' ? sortOrder : 'asc'}
                        onClick={() => handleSort('accountId')}
                      >
                        <span className="collapsibleTable__sortableText">AccountID (или email)</span>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="collapsibleTable__headerCell collapsibleTable__sortableHeader collapsibleTable__headerCell--right">
                      <TableSortLabel
                        active={sortField === 'count'}
                        direction={sortField === 'count' ? sortOrder : 'asc'}
                        onClick={() => handleSort('count')}
                      >
                        <Tooltip title="Сколько запросов был по данному Keyword" arrow placement="top">
                          <span className="collapsibleTable__sortableText">Count</span>
                        </Tooltip>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="collapsibleTable__headerCell collapsibleTable__sortableHeader collapsibleTable__headerCell--right">
                      <TableSortLabel
                        active={sortField === 'clicks'}
                        direction={sortField === 'clicks' ? sortOrder : 'asc'}
                        onClick={() => handleSort('clicks')}
                      >
                        <span className="collapsibleTable__sortableText">Clicks</span>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="collapsibleTable__headerCell collapsibleTable__sortableHeader collapsibleTable__headerCell--right">
                      <TableSortLabel
                        active={sortField === 'conversion'}
                        direction={sortField === 'conversion' ? sortOrder : 'asc'}
                        onClick={() => handleSort('conversion')}
                      >
                        <span className="collapsibleTable__sortableText">Conversion (%)</span>
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedKeywords.map(([keyword, { count, clicks, domain, accountId }]) => {
                    const keywordConversion = count ? ((clicks / count) * 100).toFixed(2) : '0.00';

                    // Сопоставление с данными из dataGoogleAccounts
                    const foundAccount = dataGoogleAccounts.find((acc) => acc.account_id === accountId);
                    const displayAccount = foundAccount && foundAccount.email ? foundAccount.email : accountId;

                    return (
                      <TableRow key={keyword}>
                        <TableCell>
                          <span
                            onClick={(e) => {
                              e.stopPropagation(); // Останавливаем всплытие, чтобы не срабатывал клик на всю строку
                              setValue(0); // Устанавливаем значение 0 для переключения таба
                              setFilterKeyword(keyword);
                            }}
                            style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'none' }}
                          >
                            {keyword}
                          </span>
                        </TableCell>
                        <TableCell>
                          {' '}
                          <span
                            onClick={(e) => {
                              e.stopPropagation(); // Останавливаем всплытие, чтобы не срабатывал клик на всю строку
                              setValue(0); // Устанавливаем значение 0 для переключения таба
                              setFilterByDomain(domain);
                            }}
                            style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'none' }}
                          >
                            {domain}
                          </span>
                        </TableCell>
                        <TableCell>
                          {' '}
                          <span
                            onClick={(e) => {
                              e.stopPropagation(); // Останавливаем всплытие, чтобы не срабатывал клик на всю строку
                              setValue(0); // Устанавливаем значение 0 для переключения таба
                              setFilterAccountID(accountId);
                            }}
                            style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'none' }}
                          >
                            {displayAccount}
                          </span>
                        </TableCell>
                        <TableCell align="right">{count}</TableCell>
                        <TableCell align="right">{clicks}</TableCell>
                        <TableCell align="right">{keywordConversion} %</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Валидация пропсов для компонента Row
Row.propTypes = {
  row: PropTypes.shape({
    CompanyID: PropTypes.string.isRequired,
    Keywords: PropTypes.arrayOf(PropTypes.string),
    TotalKeywords: PropTypes.number,
    TotalClicks: PropTypes.number,
    ID: PropTypes.number.isRequired,
  }).isRequired,
  originalData: PropTypes.arrayOf(
    PropTypes.shape({
      CompanyID: PropTypes.string.isRequired,
      Keyword: PropTypes.string.isRequired,
      ClickOnNumber: PropTypes.bool.isRequired,
      Domain: PropTypes.string.isRequired,
      AccountID: PropTypes.string.isRequired,
    }),
  ).isRequired,
  openRow: PropTypes.string,
  setOpenRow: PropTypes.func.isRequired,
  companyIDData: PropTypes.arrayOf(
    PropTypes.shape({
      CompanyID: PropTypes.string,
      Name: PropTypes.string,
    }),
  ).isRequired,
  dataGoogleAccounts: PropTypes.arrayOf(
    PropTypes.shape({
      account_id: PropTypes.string,
      email: PropTypes.string,
    }),
  ).isRequired,
};

/**
 * Основной компонент таблицы.
 * Здесь отображаются строки (Row) по компаниям.
 */
export default function CollapsibleTable({
  rows,
  companyIDData,
  dataGoogleAccounts,
  setValue,
  setFilterCompanyID,
  setFilterKeyword,
  setFilterByDomain,
  setFilterAccountID,
}) {
  // Состояние для отслеживания, какая строка сейчас "раскрыта"
  const [openRow, setOpenRow] = React.useState(null);

  // Группируем данные по CompanyID
  const uniqueRows = groupByCompanyID(rows);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '90vh' }}>
      <Table aria-label="collapsible table" stickyHeader>
        <TableHead>
          <TableRow className="collapsibleTable__headerRow">
            <TableCell className="collapsibleTable__headerCell">Компания</TableCell>
            <TableCell className="collapsibleTable__headerCell" align="right">
              Показы
            </TableCell>
            <TableCell className="collapsibleTable__headerCell" align="right">
              Клики
            </TableCell>
            <TableCell className="collapsibleTable__headerCell" align="right">
              Конверсия (%)
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {uniqueRows
            .filter((row) => row.CompanyID !== '-')
            .map((row) => (
              <Row
                key={row.CompanyID}
                row={row}
                originalData={rows}
                openRow={openRow}
                setOpenRow={setOpenRow}
                companyIDData={companyIDData}
                dataGoogleAccounts={dataGoogleAccounts}
                setValue={setValue}
                setFilterCompanyID={setFilterCompanyID}
                setFilterKeyword={setFilterKeyword}
                setFilterByDomain={setFilterByDomain}
                setFilterAccountID={setFilterAccountID}
              />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

CollapsibleTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      CompanyID: PropTypes.string.isRequired,
      Keyword: PropTypes.string.isRequired,
      ClickOnNumber: PropTypes.bool.isRequired,
      Domain: PropTypes.string.isRequired,
      AccountID: PropTypes.string.isRequired,
    }),
  ).isRequired,
  companyIDData: PropTypes.arrayOf(
    PropTypes.shape({
      CompanyID: PropTypes.string,
      Name: PropTypes.string,
    }),
  ).isRequired,
  dataGoogleAccounts: PropTypes.arrayOf(
    PropTypes.shape({
      account_id: PropTypes.string,
      email: PropTypes.string,
    }),
  ).isRequired,
};
