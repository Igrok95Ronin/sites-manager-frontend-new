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
 * @param {Array} data - массив объектов с полями `Keyword`, `Domain`, и `ClickOnNumber`.
 * @returns {Object} объект, где ключ — ключевое слово, значение — количество, клики, и домен.
 */
function groupKeywords(data) {
  return data.reduce((acc, { Keyword, Domain, ClickOnNumber, AccountID }) => {
    if (!acc[Keyword]) {
      acc[Keyword] = { count: 0, clicks: 0, domain: Domain, accountId: AccountID }; // Инициализация
    }
    acc[Keyword].count += 1; // Увеличиваем общее использование ключевого слова
    if (ClickOnNumber) {
      acc[Keyword].clicks += 1; // Увеличиваем количество кликов
    }
    return acc;
  }, {});
}

/**
 * Функция для группировки данных по `CompanyID`.
 * @param {Array} data - массив объектов с данными.
 * @returns {Array} массив уникальных объектов для каждой компании.
 */
function groupByCompanyID(data) {
  const grouped = data.reduce((acc, curr) => {
    if (!acc[curr.CompanyID]) {
      acc[curr.CompanyID] = { ...curr, Keywords: [], TotalKeywords: 0, TotalClicks: 0 };
    }
    acc[curr.CompanyID].Keywords.push(curr.Keyword); // Сохраняем ключевое слово
    acc[curr.CompanyID].TotalKeywords += 1; // Увеличиваем общее количество ключевых слов
    if (curr.ClickOnNumber) {
      acc[curr.CompanyID].TotalClicks += 1; // Увеличиваем общее количество кликов
    }
    return acc;
  }, {});
  return Object.values(grouped); // Преобразуем объект обратно в массив
}

/**
 * Компонент строки таблицы.
 * @param {Object} props - пропсы компонента.
 * @returns {JSX.Element} строка таблицы с вложенной таблицей ключевых слов.
 */
function Row(props) {
  const { row, originalData, openRow, setOpenRow } = props; // Получаем данные строки и оригинальный массив

  // Вычисление общей конверсии
  const conversion = row.TotalKeywords
    ? ((row.TotalClicks / row.TotalKeywords) * 100).toFixed(2) // Конверсия в процентах
    : '0.00';

  // Фильтруем ключевые слова, относящиеся к текущему `CompanyID`
  const keywordsForCompany = originalData.filter((item) => item.CompanyID === row.CompanyID);
  const groupedKeywords = groupKeywords(keywordsForCompany);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        {/* Кнопка для раскрытия вложенной таблицы */}
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpenRow(openRow === row.CompanyID ? null : row.CompanyID)}
          >
            {openRow === row.CompanyID ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {/* Основная информация о компании */}
        <TableCell component="th" scope="row">
          {row.CompanyID}
        </TableCell>
        <TableCell align="right">{row.TotalKeywords}</TableCell>
        <TableCell align="right">{row.TotalClicks}</TableCell>
        <TableCell align="right">{conversion} %</TableCell>
      </TableRow>
      {/* Вложенная таблица с ключевыми словами */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={openRow === row.CompanyID} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Keywords for CompanyID: {row.CompanyID}
              </Typography>
              <Table size="small" aria-label="keywords">
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Domain</TableCell>
                    <TableCell>AccountID</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Clicks</TableCell>
                    <TableCell align="right">Conversion (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Отображаем ключевые слова и их статистику */}
                  {Object.entries(groupedKeywords).map(([keyword, { count, clicks, domain, accountId }]) => {
                    const keywordConversion = count ? ((clicks / count) * 100).toFixed(2) : '0.00';
                    return (
                      <TableRow key={keyword}>
                        <TableCell>{keyword}</TableCell>
                        <TableCell>{domain}</TableCell>
                        <TableCell>{accountId}</TableCell>
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

// Валидация пропсов компонента Row
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
};

/**
 * Основной компонент таблицы.
 * @param {Object} props - пропсы компонента.
 * @returns {JSX.Element} таблица с данными.
 */
export default function CollapsibleTable({ rows, companyIDData }) {
  //   console.log('Исходные данные:', rows);
  console.log(companyIDData);

  // Состояние для открытой строки
  const [openRow, setOpenRow] = React.useState(null);

  // Сгруппированные данные по `CompanyID`
  const uniqueRows = groupByCompanyID(rows);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '75vh' }}>
      <Table aria-label="collapsible table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Компания (CompanyID)</TableCell>
            <TableCell align="right">Показы (Всего ключевых слов)</TableCell>
            <TableCell align="right">Клики (Всего кликов)</TableCell>
            <TableCell align="right">Конверсия (%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {uniqueRows.map((row) => (
            <Row key={row.CompanyID} row={row} originalData={rows} openRow={openRow} setOpenRow={setOpenRow} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Валидация пропсов основного компонента
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
};
