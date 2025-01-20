import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';

import Search from '../Search/Search';
import Spinner from '../../../Spinner/Spinner';
import MarkedLogs from '../MarkedLogs/MarkedLogs';
import Company from '../Company/Company';

import './TabPanelProps.scss';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function FullWidthTabs({
  rows,
  VirtuosoTableComponents,
  fixedHeaderContent,
  rowContent,
  loadMoreRows,
  loading,
  hasMore,
  ColumnSelector,
  searchField,
  setSearchField,
  searchQuery,
  setSearchQuery,
  limit,
  setLimit,
  columns,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // const endReachedHandler = React.useCallback(() => {
  //   if (!loadingRef.current && hasMore) {
  //     loadMoreRows();
  //   }
  // }, [hasMore, loadMoreRows, loadingRef]);

  // Фильтруем данные по Headers
  const filteredData = rows
    ? rows.filter((item) => {
        let fieldValue = item[searchField];
        // Проверяем, что значение поля не undefined и не null
        if (fieldValue !== undefined && fieldValue !== null) {
          // Если поле для поиска - CreatedAt, форматируем его
          if (searchField === 'CreatedAt') {
            const date = new Date(fieldValue);
            fieldValue = date.toLocaleDateString('ru-RU'); // Преобразуем в формат DD.MM.YYYY
          } else {
            fieldValue = fieldValue.toString();
          }

          return fieldValue.toString().toLowerCase().includes(searchQuery.toLowerCase());
        }

        return false;
      })
    : [];

  const numberOfDomains = filteredData.length;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" sx={{ bgcolor: '#4caf50' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Логи ADS" {...a11yProps(0)} />
          <Tab label="Отмеченные логи" {...a11yProps(1)} />
          <Tab label="Компания" {...a11yProps(2)} />
          <Tab label="Item Three" {...a11yProps(3)} />
        </Tabs>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Первый таб Логи ADS*/}
        <TabPanel className="tabPanelProps__tabPanel" value={value} index={0} dir={theme.direction}>
          <div className="tabPanelProps__wrapper">
            <Search
              onSearch={setSearchQuery}
              numberOfDomains={numberOfDomains}
              limit={limit}
              setLimit={setLimit}
              searchField={searchField}
              setSearchField={setSearchField}
              columns={columns}
              loadMoreRows={loadMoreRows}
              loading={loading}
              hasMore={hasMore}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            <div className="tabPanelProps__settings">{ColumnSelector}</div>
          </div>

          <Paper style={{ height: '74vh', width: '100%' }}>
            <TableVirtuoso
              classID="tabPanelProps__columns"
              data={filteredData}
              components={VirtuosoTableComponents}
              fixedHeaderContent={fixedHeaderContent}
              itemContent={rowContent}
              // endReached={endReachedHandler}   // <-- Удаляем или комментируем
              // increaseViewportBy={{ bottom: 1000 }} // <-- Тоже не нужно
            />

            {loading && <Spinner loading={loading} />}

            {/* {!hasMore && <div style={{ textAlign: 'center' }}>Больше нет данных для загрузки.</div>} */}
          </Paper>
        </TabPanel>

        {/* Второй таб Отмеченные логи*/}
        <TabPanel value={value} index={1} dir={theme.direction}>
          <MarkedLogs />
        </TabPanel>

        {/* Третий таб Компаний*/}
        <TabPanel value={value} index={2} dir={theme.direction}>
          <Company rows={rows} />
        </TabPanel>
        <TabPanel value={value} index={3} dir={theme.direction}>
          Узбакойся уходиd
        </TabPanel>
      </Box>
    </Box>
  );
}
