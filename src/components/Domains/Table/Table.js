import React, { useState } from 'react'; // Импорт React и хука useState
import {
  Table, // Компонент для создания таблицы
  TableBody, // Тело таблицы
  TableCell, // Ячейка таблицы
  TableContainer, // Контейнер для таблицы
  TableHead, // Заголовок таблицы
  TableRow, // Строка таблицы
  TableSortLabel, // Элемент для сортировки заголовков таблицы
  Paper, // Контейнер для создания бумаги вокруг таблицы (обертка)
} from '@mui/material'; // Импорт компонентов из библиотеки Material UI
import './Table.scss'; // Импорт стилей для таблицы

import Box from '@mui/material/Box'; // Импорт компонента Box для контейнеров
import SpeedDial from '@mui/material/SpeedDial'; // Импорт компонента SpeedDial для кнопки с быстрыми действиями
import SpeedDialIcon from '@mui/material/SpeedDialIcon'; // Иконка для SpeedDial
import SpeedDialAction from '@mui/material/SpeedDialAction'; // Элемент для добавления действий в SpeedDial
import DeleteIcon from '@mui/icons-material/Delete'; // Иконка удаления
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'; // Иконка для очистки кэша
import DomainAddIcon from '@mui/icons-material/DomainAdd'; // Иконка для добавления поддомена
import EditCalendarIcon from '@mui/icons-material/EditCalendar'; // Иконка для редактирования домена
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import Snackbar from '@mui/material/Snackbar'; // Уведомление (снэкбар) для отображения сообщений

import Backdrop from '@mui/material/Backdrop'; // Затенение для фона при загрузке
import CircularProgress from '@mui/material/CircularProgress'; // Круговой индикатор загрузки

import RemovalForm from '../RemovalForm/RemovalForm'; // Импорт формы для удаления домена
import ClearCache from '../ClearCache/ClearCache'; // Импорт компонента для очистки кеша
import CreateSubdomain from '../CreateSubdomain/CreateSubdomain'; // Импорт компонента для создания поддомена
import EditDomain from '../EditDomain/EditDomain'; // Импорт компонента для редактирования домена
import EditSubDomain from '../EditSubDomain/EditSubDomain'; // Импорт компонента для редактирования поддомена
import RemovalFormSubDomain from '../RemovalFormSubDomain/RemovalFormSubDomain'; // Импорт формы для удаления поддомена

// Массив действий для SpeedDial с иконками и именами
const actions = [
  { icon: <DeleteIcon />, name: 'Удалить домен', action: 'delete' },
  {
    icon: <CleaningServicesIcon />,
    name: 'Очистить кэш',
    action: 'clearCache',
  },
  {
    icon: <DomainAddIcon />,
    name: 'Создать поддомен',
    action: 'CreateSubdomain',
  },
  {
    icon: <EditCalendarIcon />,
    name: 'Редактировать домен',
    action: 'editDomain',
  },
];

// Добавьте новый массив действий для поддоменов
const subdomainActions = [
  { icon: <DeleteIcon />, name: 'Удалить поддомен', action: 'deleteSubDomain' },
  {
    icon: <EditCalendarIcon />,
    name: 'Редактировать поддомен',
    action: 'editSubDomain',
  },
];

const Tables = ({ items, onUpdateDomains, searchQuery }) => {
  const [open, setOpen] = React.useState(true); // Состояние для открытия уведомлений (снэкбара)
  const [openSpinner, setOpenSpinner] = React.useState(true); // Состояние для отображения индикатора загрузки

  // Закрытие снэкбара при клике
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      // Если клик был не по кнопке
      return; // Не закрываем
    }
    setOpen(false); // Закрываем уведомление
  };

  const handleCloseSpinner = () => {
    setOpenSpinner(false); // Закрываем индикатор загрузки
  };

  const [orderDirection, setOrderDirection] = useState('desc'); // Состояние для направления сортировки (по возрастанию)
  const [valueToOrderBy, setValueToOrderBy] = useState('ID'); // Состояние для столбца, по которому происходит сортировка
  const [showRemovalFrom, setShowRemovalFrom] = useState(false); // Состояние для показа формы удаления домена
  const [domainToDelete, setDomainToDelete] = useState(''); // Состояние для домена, который нужно удалить
  const [error, setError] = useState(false); // Состояние для отображения ошибок
  const [data, setData] = useState(false); // Состояние для хранения данных после успешного запроса
  const [loading, setLoading] = useState(false); // Состояние для отслеживания загрузки
  const [callClearCache, setCallClearCache] = useState(false); // Состояние для вызова компонента очистки кеша
  const [domainClearCache, setDomainClearCache] = useState(''); // Состояние для домена, кеш которого нужно очистить
  const [showCreateSubdomain, setShowCreateSubdomain] = useState(false); // Состояние для показа формы создания поддомена
  const [domainCreateSubDomain, setDomainCreateSubDomain] = useState(''); // Состояние для домена, у которого нужно создать поддомен
  const [showEditDomain, setShowEditDomain] = useState(false); // Состояние для показа формы редактирования домена
  const [editDomain, setEditDomain] = useState(''); // Домен который нужно редактировать
  const [editSubDomain, setEditSubDomain] = useState('');
  const [showEditSubDomain, setShowEditSubDomain] = useState(false);
  const [showRemovalFromSubDomain, setShowRemovalFromSubDomain] =
    useState(false); // Состояние для показа формы удаления поддомена
  const [subDomainToDelete, setSubDomainToDelete] = useState(''); // Состояние для поддомена, который нужно удалить
  // Добавьте состояние для определения типа объекта (домен или поддомен)

  // Обработчик клика по действиям (удаление, очистка кеша, создание поддомена)
  const handleActionClick = (actionName, domain, isSubdomain = false) => {
    switch (actionName) {
      case 'delete':
        setDomainToDelete(domain);
        setShowRemovalFrom(true);
        break;
      case 'clearCache':
        setDomainClearCache(domain);
        setCallClearCache(true);
        break;
      case 'CreateSubdomain':
        setDomainCreateSubDomain(domain);
        setShowCreateSubdomain(true);
        break;
      case 'editDomain':
        setEditDomain(domain);
        setShowEditDomain(true);
        break;
      case 'editSubDomain':
        setEditSubDomain(domain);
        setShowEditSubDomain(true);
        break;
      case 'deleteSubDomain':
        setSubDomainToDelete(domain);
        setShowRemovalFromSubDomain(true);
        break;
      default:
        console.log('Unknown action');
    }
  };

  // Обработчик для сортировки по столбцам
  const handleRequestSort = (property) => {
    const isAscending = valueToOrderBy === property && orderDirection === 'asc'; // Проверяем текущее направление сортировки
    setValueToOrderBy(property); // Устанавливаем столбец для сортировки
    setOrderDirection(isAscending ? 'desc' : 'asc'); // Меняем направление сортировки
  };

  // Функция для сравнения элементов в сортировке
  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1; // Если b меньше a
    }
    if (b[orderBy] > a[orderBy]) {
      return 1; // Если b больше a
    }
    return 0; // Если они равны
  };

  // Возвращаем функцию для сравнения элементов по направлению сортировки
  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy) // Сортировка по убыванию
      : (a, b) => -descendingComparator(a, b, orderBy); // Сортировка по возрастанию
  };

  // Сортировка элементов
  const sortItems = (items, comparator) => {
    if (!items) return []; // Если нет элементов, возвращаем пустой массив
    const stabilizedThis = items.map((el, index) => [el, index]); // Добавляем индексы для сортировки
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]); // Сравниваем элементы
      if (order !== 0) return order; // Если элементы разные, возвращаем результат сравнения
      return a[1] - b[1]; // Если элементы равны, сравниваем индексы
    });
    return stabilizedThis.map((el) => el[0]); // Возвращаем отсортированный массив
  };

  // Сортируем данные перед их отображением
  const sortedData = sortItems(
    items,
    getComparator(orderDirection, valueToOrderBy),
  );

  return (
    <section className="domains">
      <div className="container">
        <div className="domains__box">
          <TableContainer className="table__container" component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead className="table__header">
                <TableRow>
                  {['domain', 'status', 'adsId', 'lang', 'used', 'menu'].map(
                    (headCell) => (
                      <TableCell key={headCell} className="table__headerCell">
                        <TableSortLabel
                          active={valueToOrderBy === headCell} // Проверяем, активна ли сортировка для этого столбца
                          direction={
                            valueToOrderBy === headCell ? orderDirection : 'asc'
                          }
                          onClick={() => handleRequestSort(headCell)} // Устанавливаем сортировку по клику на заголовок
                        >
                          {headCell.charAt(0).toUpperCase() + headCell.slice(1)}
                        </TableSortLabel>
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody className="table__body">
                {/* Проходим по отсортированным доменам и выводим их вместе с поддоменами */}
                {sortedData.map((domainItem, idx) => (
                  <React.Fragment key={idx}>
                    {/* Отображаем домен, если он соответствует фильтру или содержит отфильтрованные поддомены */}
                    {(domainItem.domain
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                      domainItem.subDomains.length > 0) && (
                      <>
                        <TableRow>
                          <TableCell className="table__bodyCell">
                            <a
                              className="table__link"
                              href={`https://${domainItem.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {domainItem.domain}
                            </a>
                          </TableCell>
                          <TableCell
                            className={
                              domainItem.status === 'active'
                                ? 'table__active table__bodyCell'
                                : 'table__pending table__bodyCell'
                            }
                          >
                            <span>{domainItem.status}</span>
                          </TableCell>
                          <TableCell className="table__bodyCell">
                            {domainItem.adsId === "" ? <HorizontalRuleIcon className="table__imgLine" /> : domainItem.adsId }
                          </TableCell>
                          <TableCell className="table__bodyCell">
                            {domainItem.lang}
                          </TableCell>
                          <TableCell
                            className={
                              domainItem.used === 'yes'
                                ? 'table__active table__bodyCell'
                                : 'table__pending table__bodyCell'
                            }
                          >
                            <span>{domainItem.used}</span>
                          </TableCell>
                          <TableCell className="table__bodyCell">
                            <Box
                              sx={{
                                height: 0,
                                transform: 'translateZ(0px)',
                                flexGrow: 1,
                              }}
                            >
                              <SpeedDial
                                className="table__menu"
                                ariaLabel="SpeedDial basic example"
                                sx={{
                                  position: 'absolute',
                                  bottom: -18,
                                  right: 0,
                                }}
                                icon={<SpeedDialIcon />}
                              >
                                {actions.map((action) => {
                                  // Условие для пропуска кнопки "Редактировать домен", если used === 'no'
                                  if (
                                    action.action === 'editDomain' &&
                                    domainItem.used === 'no'
                                  ) {
                                    return null; // Не рендерим эту кнопку
                                  }
                                  // Условие для пропуска кнопки "Очистки кеща", если status === 'pending'
                                  if (
                                    action.action === 'clearCache' &&
                                    domainItem.status === 'pending'
                                  ) {
                                    return null; // Не рендерим эту кнопку
                                  }
                                  return (
                                    <SpeedDialAction
                                      key={action.name}
                                      icon={action.icon}
                                      tooltipTitle={action.name}
                                      tooltipPlacement="bottom"
                                      onClick={() =>
                                        handleActionClick(
                                          action.action,
                                          domainItem.domain,
                                        )
                                      }
                                    />
                                  );
                                })}
                              </SpeedDial>
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* Отображаем только отфильтрованные поддомены */}
                        {domainItem.subDomains.length > 0 &&
                          domainItem.subDomains.map((subDomainItem, subIdx) => (
                            <TableRow key={`${domainItem.domain}-${subIdx}`}>
                              <TableCell className="table__subDomains">
                                <SubdirectoryArrowRightIcon className="table__subDomainsArrow" />
                                <a
                                  className="table__link"
                                  href={`https://${subDomainItem.subDomain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {subDomainItem.subDomain}
                                </a>
                              </TableCell>
                              <TableCell
                                className={
                                  domainItem.status === 'active'
                                    ? 'table__active'
                                    : 'table__pending'
                                }
                              >
                                <span>{domainItem.status}</span>
                              </TableCell>
                              <TableCell>
                                {subDomainItem.adsId === "" ? <HorizontalRuleIcon className="table__imgLine" /> : subDomainItem.adsId}
                              </TableCell>
                              <TableCell>
                                <HorizontalRuleIcon className="table__imgLine" />
                              </TableCell>
                              <TableCell
                                className={
                                  subDomainItem.used === 'yes'
                                    ? 'table__active'
                                    : 'table__pending'
                                }
                              >
                                <span>{subDomainItem.used}</span>
                              </TableCell>
                              {/* <TableCell colSpan={1} /> */}
                              <TableCell className="table__bodyCell">
                                <Box
                                  sx={{
                                    height: 0,
                                    transform: 'translateZ(0px)',
                                    flexGrow: 1,
                                  }}
                                >
                                  <SpeedDial
                                    className="table__menuSubDomain table__menu"
                                    ariaLabel="SpeedDial basic example"
                                    sx={{
                                      position: 'absolute',
                                      bottom: -18,
                                      right: '0px',
                                    }}
                                    icon={<SpeedDialIcon />}
                                  >
                                    {subdomainActions.map((action) => {
                                      // Условие для пропуска кнопки "Редактировать поддомен", если used === 'no'
                                      if (
                                        action.action === 'editSubDomain' &&
                                        subDomainItem.used === 'no'
                                      ) {
                                        return null; // Не рендерим эту кнопку
                                      }
                                      return (
                                        <SpeedDialAction
                                          key={action.name}
                                          icon={action.icon}
                                          tooltipTitle={action.name}
                                          tooltipPlacement="bottom"
                                          onClick={() =>
                                            handleActionClick(
                                              action.action,
                                              subDomainItem.subDomain,
                                              true, // Указываем, что это поддомен
                                            )
                                          }
                                        />
                                      );
                                    })}
                                  </SpeedDial>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Компонент Формы удаления домена */}
          {showRemovalFrom && (
            <RemovalForm
              showRemovalFrom={showRemovalFrom}
              setShowRemovalFrom={setShowRemovalFrom}
              domainToDelete={domainToDelete}
              onUpdateDomains={onUpdateDomains}
              setError={setError}
              setOpen={setOpen}
              setLoading={setLoading}
              setOpenSpinner={setOpenSpinner}
            />
          )}

          {error && (
            <Snackbar
              className="table__myError"
              open={open}
              autoHideDuration={6000}
              onClose={handleClose}
              message={error.response.data}
            />
          )}

          {loading && (
            <Backdrop
              sx={(theme) => ({
                color: '#fff',
                zIndex: theme.zIndex.drawer + 1,
              })}
              open={openSpinner}
              onClick={handleCloseSpinner}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          )}

          {items.length <= 0 && (
            <Backdrop
              sx={(theme) => ({
                color: '#fff',
                zIndex: theme.zIndex.drawer + 1,
              })}
              open={openSpinner}
              onClick={handleCloseSpinner}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          )}

          {data && !error && (
            <Snackbar
              className="table__mySuccess"
              open={open}
              autoHideDuration={5000}
              onClose={handleClose}
              message={data}
            />
          )}

          {callClearCache && (
            <ClearCache
              domainClearCache={domainClearCache}
              setCallClearCache={setCallClearCache}
              setLoading={setLoading}
              setError={setError}
              setData={setData}
              setOpen={setOpen}
            />
          )}

          {showCreateSubdomain && (
            <CreateSubdomain
              showCreateSubdomain={showCreateSubdomain}
              setShowCreateSubdomain={setShowCreateSubdomain}
              domainCreateSubDomain={domainCreateSubDomain}
              setLoading={setLoading}
              onUpdateDomains={onUpdateDomains}
              setError={setError}
              setOpen={setOpen}
            />
          )}

          {showEditDomain && (
            <EditDomain
              editDomain={editDomain}
              showEditDomain={showEditDomain}
              setShowEditDomain={setShowEditDomain}
              onUpdateDomains={onUpdateDomains}
            />
          )}

          {/* Компонент для редактирование поддомена */}
          {showEditSubDomain && (
            <EditSubDomain
              editSubDomain={editSubDomain}
              showEditSubDomain={showEditSubDomain}
              setShowEditSubDomain={setShowEditSubDomain}
            />
          )}
          {/* Форма для удаления поддомена */}
          {showRemovalFromSubDomain && (
            <RemovalFormSubDomain
              subDomainToDelete={subDomainToDelete}
              showRemovalFromSubDomain={showRemovalFromSubDomain}
              setShowRemovalFromSubDomain={setShowRemovalFromSubDomain}
              setLoading={setLoading}
              setError={setError}
              setOpen={setOpen}
              onUpdateDomains={onUpdateDomains}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Tables;
