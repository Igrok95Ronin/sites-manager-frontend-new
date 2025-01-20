import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

/**
 * Функция для группировки ключевых слов с подсчётом их количества и кликов.
 * @param {Array} data - массив объектов с полями `Keyword`, `Domain`, `ClickOnNumber`, `AccountID`.
 * @returns {Object} объект, где ключ — ключевое слово, значение — количество, клики, и домен.
 */
function groupKeywords(data) {
  return data.reduce((acc, { Keyword, Domain, ClickOnNumber, AccountID }) => {
    if (!acc[Keyword]) {
      acc[Keyword] = {
        count: 0,
        clicks: 0,
        domain: Domain,
        accountId: AccountID, // Для сопоставления с dataGoogleAccounts
      };
    }
    acc[Keyword].count += 1;
    if (ClickOnNumber) {
      acc[Keyword].clicks += 1;
    }
    return acc;
  }, {});
}

/**
 * Функция для группировки данных по `CompanyID`.
 * @param {Array} data - массив объектов.
 * @returns {Array} массив уникальных объектов для каждой компании.
 */
function groupByCompanyID(data) {
  const grouped = data.reduce((acc, curr) => {
    if (!acc[curr.CompanyID]) {
      acc[curr.CompanyID] = {
        ...curr,
        Keywords: [],
        TotalKeywords: 0,
        TotalClicks: 0,
      };
    }
    acc[curr.CompanyID].Keywords.push(curr.Keyword);
    acc[curr.CompanyID].TotalKeywords += 1;
    if (curr.ClickOnNumber) {
      acc[curr.CompanyID].TotalClicks += 1;
    }
    return acc;
  }, {});
  return Object.values(grouped);
}

/**
 * Компонент строки таблицы.
 */
function Row({
  row,
  originalData,
  openRow,
  setOpenRow,
  companyIDData,
  dataGoogleAccounts,
}) {
  // Ищем в companyIDData, чтобы отобразить название вместо CompanyID (если есть).
  const foundCompany = companyIDData.find(
    (company) => company.CompanyID === row.CompanyID
  );

  // Если Name не пуст — показываем, иначе показываем сам CompanyID
  const displayName =
    foundCompany && foundCompany.Name ? foundCompany.Name : row.CompanyID;

  // Общая конверсия в процентах
  const conversion = row.TotalKeywords
    ? ((row.TotalClicks / row.TotalKeywords) * 100).toFixed(2)
    : '0.00';

  // Фильтруем ключевые слова текущей компании
  const keywordsForCompany = originalData.filter(
    (item) => item.CompanyID === row.CompanyID
  );
  const groupedKeywords = groupKeywords(keywordsForCompany);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        {/* Кнопка "раскрыть/свернуть" подтаблицу */}
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() =>
              setOpenRow(openRow === row.CompanyID ? null : row.CompanyID)
            }
          >
            {openRow === row.CompanyID ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        {/* Отображаем название или CompanyID */}
        <TableCell component="th" scope="row">
          {displayName}
        </TableCell>
        <TableCell align="right">{row.TotalKeywords}</TableCell>
        <TableCell align="right">{row.TotalClicks}</TableCell>
        <TableCell align="right">{conversion} %</TableCell>
      </TableRow>
      {/* Вложенная таблица (при раскрытии) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={openRow === row.CompanyID} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Keywords for: {displayName}
              </Typography>
              <Table size="small" aria-label="keywords">
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Domain</TableCell>
                    <TableCell>AccountID (или email)</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Clicks</TableCell>
                    <TableCell align="right">Conversion (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedKeywords).map(
                    ([keyword, { count, clicks, domain, accountId }]) => {
                      const keywordConversion = count
                        ? ((clicks / count) * 100).toFixed(2)
                        : '0.00';

                      // Сопоставление с данными из dataGoogleAccounts (account_id)
                      const foundAccount = dataGoogleAccounts.find(
                        (acc) => acc.account_id === accountId
                      );
                      const displayAccount =
                        foundAccount && foundAccount.email
                          ? foundAccount.email
                          : accountId;

                      return (
                        <TableRow key={keyword}>
                          <TableCell>{keyword}</TableCell>
                          <TableCell>{domain}</TableCell>
                          <TableCell>{displayAccount}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">{clicks}</TableCell>
                          <TableCell align="right">
                            {keywordConversion} %
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

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
    })
  ).isRequired,
  openRow: PropTypes.string,
  setOpenRow: PropTypes.func.isRequired,
  companyIDData: PropTypes.arrayOf(
    PropTypes.shape({
      CompanyID: PropTypes.string,
      Name: PropTypes.string,
    })
  ).isRequired,
  dataGoogleAccounts: PropTypes.arrayOf(
    PropTypes.shape({
      account_id: PropTypes.string,
      email: PropTypes.string,
    })
  ).isRequired,
};

/**
 * Основной компонент таблицы.
 */
export default function CollapsibleTable({
  rows,
  companyIDData,
  dataGoogleAccounts,
}) {
  // Состояние для открытой строки
  const [openRow, setOpenRow] = React.useState(null);

  // Группируем данные по CompanyID
  const uniqueRows = groupByCompanyID(rows);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '75vh' }}>
      <Table aria-label="collapsible table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Компания (CompanyID/Name)</TableCell>
            <TableCell align="right">Показы (Всего ключевых слов)</TableCell>
            <TableCell align="right">Клики (Всего кликов)</TableCell>
            <TableCell align="right">Конверсия (%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {uniqueRows
            // Фильтруем те, у которых CompanyID === '-'
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
    })
  ).isRequired,
  companyIDData: PropTypes.arrayOf(
    PropTypes.shape({
      CompanyID: PropTypes.string,
      Name: PropTypes.string,
    })
  ).isRequired,
  dataGoogleAccounts: PropTypes.arrayOf(
    PropTypes.shape({
      account_id: PropTypes.string,
      email: PropTypes.string,
    })
  ).isRequired,
};
