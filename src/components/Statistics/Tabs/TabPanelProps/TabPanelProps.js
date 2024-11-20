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
  loadingRef,
  searchField,
}) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState(''); // Поисковый запрос

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const endReachedHandler = React.useCallback(() => {
    if (!loadingRef.current && hasMore) {
      loadMoreRows();
    }
  }, [hasMore, loadMoreRows, loadingRef]);

  // Фильтруем данные по Headers
  const filteredData = rows
    ? rows.filter((item) => {
        const fieldValue = item[searchField];
        // Проверяем, что значение поля не undefined и не null
        if (fieldValue !== undefined && fieldValue !== null) {
          return fieldValue
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
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
          <Tab label="Item Three" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Первый таб Логи ADS*/}
        <TabPanel
          className="tabPanelProps__tabPanel"
          value={value}
          index={0}
          dir={theme.direction}
        >
          <div className="tabPanelProps__wrapper">
            <Search
              onSearch={setSearchQuery}
              numberOfDomains={numberOfDomains}
            />
            <div className="tabPanelProps__settings">{ColumnSelector}</div>
          </div>
          <Paper style={{ height: '70vh', width: '100%' }}>
            <TableVirtuoso
              data={filteredData} // данные для таблицы поиск
              components={VirtuosoTableComponents} // компоненты для виртуальной таблицы
              fixedHeaderContent={fixedHeaderContent} // отображение заголовков
              itemContent={rowContent} // отображение строк
              // endReached={loadMoreRows} // функция для ленивой загрузки
              endReached={endReachedHandler}
              increaseViewportBy={{ bottom: 1000 }} // Настройте значение по необходимости
            />
            {/* {loading && <div style={{ textAlign: 'center' }}>Loading...</div>} */}
            {loading && <Spinner loading={loading} />}
            {!hasMore && (
              <div style={{ textAlign: 'center' }}>
                Больше нет данных для загрузки.
              </div>
            )}
          </Paper>
        </TabPanel>

        {/* Второй таб Отмеченные логи*/}
        <TabPanel value={value} index={1} dir={theme.direction}>
          <MarkedLogs />
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          Узбакойся уходи
        </TabPanel>
      </Box>
    </Box>
  );
}
