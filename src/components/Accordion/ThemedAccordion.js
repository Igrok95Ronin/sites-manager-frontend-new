import React, { useState } from 'react';

// Импортируем необходимые библиотеки и компоненты из Material-UI
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Для создания и применения кастомной темы
import Accordion from '@mui/material/Accordion'; // Компонент аккордеона
import AccordionSummary from '@mui/material/AccordionSummary'; // Заголовок аккордеона
import AccordionDetails from '@mui/material/AccordionDetails'; // Содержимое аккордеона
import Typography from '@mui/material/Typography'; // Компонент типографики для форматирования текста
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Иконка для указания возможности раскрытия

import plug from '../../assets/img/plug.jpg';
import FormSelect from './FormSelect/FormSelect';
import axiosInstance from '../../axiosInstance';

import Button from '@mui/material/Button';

import './ThemedAccordion.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

// Создаем кастомную тему для использования в нашем приложении
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Основной цвет для акцентов, например, зеленый цвет для аккордеона
    },
    secondary: {
      main: '#ff5722', // Дополнительный цвет, например, оранжевый для второстепенных элементов
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Задаем шрифт для текста
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5', // Цвет фона для всего аккордеона
          borderRadius: '8px', // Скругление углов
          marginBottom: '0px', // Отступ снизу между аккордеонами
          boxShadow: 'none', // Убираем тень для более плоского вида
          '&:before': {
            display: 'none', // Убираем стандартную линию перед аккордеоном, которая появляется по умолчанию
          },
          '&.Mui-expanded': {
            margin: '0px', // Убираем отступ при раскрытии аккордеона
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: '#4caf50', // Цвет фона для заголовка аккордеона
          color: '#ffffff', // Цвет текста заголовка (белый)
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px', // Внутренний отступ внутри контента аккордеона
          backgroundColor: '#ffffff', // Цвет фона внутри аккордеона
          border: '1px solid rgba(0, 0, 0, .125)',
        },
      },
    },
  },
});

// Функция для отправки запроса на получение доменов и поддомено
const request = async () => {
  try {
    const [domainsResponse, subDomainResponse] = await Promise.all([
      axiosInstance.get(`${APIURL}/viewdomains`),
      axiosInstance.get(`${APIURL}/viewsubdomains`),
    ]);

    // Возвращаем результат
    return {
      domains: domainsResponse.data,
      subDomain: subDomainResponse.data,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

function ThemedAccordion({ items }) {
  // Используем хук useState для управления состоянием раскрытия аккордеонов
  // Изначально открыт первый аккордеон ('panel0')
  const [expanded, setExpanded] = useState('panel');
  const [showFormSelect, setShowFormSelect] = useState(false); // Показать форму Select
  const [nameTemplate, setNameTemplate] = useState('');
  const [nameCategory, setNameCategory] = useState('');
  const [listDomainsAndSubDomains, setListDomainsAndSubDomains] = useState([]); // Содержит все домены и поддомены

  // Получаем данные при монтировании компонента
  const fetchData = async () => {
    const result = await request();
    if (result) {
      // Пробегается собераем все домены и поддомены и объединяем массивы в хук
      const domains = result.domains.map((dom) => {
        if (dom.used !== 'yes') {
          return dom.domain;
        }
        return null;
      });
      const subDomains = result.subDomain.map((sub) => {
        if (sub.used !== 'yes') {
          return sub.subDomain;
        }
        return null;
      });

      // Убираем элементы null из объединенного массива
      const filteredList = [...domains, ...subDomains].filter(
        (item) => item !== null,
      );

      setListDomainsAndSubDomains(filteredList);
    }
  };

  const handleClick = (template, category) => {
    setShowFormSelect(true);
    setNameTemplate(template);
    setNameCategory(category);
    fetchData();
  };

  // Функция для обработки изменения состояния аккордеонов
  // panel - это идентификатор текущей панели (например, 'panel0', 'panel1')
  // isExpanded - булево значение, указывающее, открыт ли аккордеон
  const handleChange = (panel) => (event, isExpanded) => {
    // Если аккордеон раскрыт, устанавливаем его как текущий, иначе закрываем все аккордеоны
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <section className="accordion">
      <div className="accordion__container">
        <div className="accordion__box">
          {/* // Оборачиваем весь компонент в ThemeProvider, чтобы применить
          кастомную тему ко всем вложенным компонентам */}
          <ThemeProvider theme={theme}>
            {/* Проверяем наличие данных и отображаем аккордеоны */}
            {items ? (
              items.map((item, idx) => (
                <div className="accordion__wrapper" key={idx}>
                  <Accordion
                    expanded={expanded === `panel${idx}`} // Устанавливаем раскрытие аккордеона на основе его индекса
                    onChange={handleChange(`panel${idx}`)} // Передаем уникальный идентификатор аккордеона в функцию обработки изменения
                  >
                    {/* Заголовок аккордеона с иконкой ExpandMore */}
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} // Иконка раскрытия, цвет установлен на белый
                      aria-controls={`panel${idx}a-content`} // Устанавливаем уникальный идентификатор для управления доступностью
                      id={`panel${idx}a-header`} // Идентификатор заголовка
                    >
                      {/* Текст заголовка аккордеона */}
                      <Typography className="accordion__block-category">
                        <span className="accordion__name-category">
                          <i
                            className={`flag flag-${item.NameCategory.toLowerCase()}`}
                          ></i>
                          {item.NameCategory}
                        </span>
                        {'  '}
                        <span className="accordion__number-templates">
                          {item.NumberTemplates}
                        </span>
                      </Typography>
                    </AccordionSummary>
                    {/* Содержимое аккордеона */}
                    <AccordionDetails>
                      {/* Заменяем <p> на <div> или другой подходящий элемент */}
                      <div>
                        <ul className="accordion__ul">
                          {item.NameTemplates && item.NameTemplates.length > 0
                            ? item.NameTemplates.map((site, siteIdx) => (
                                <li key={siteIdx}>
                                  <div className="accordion__imgWrp">
                                    <img
                                      className="accordion__img"
                                      src={
                                        item.ScreenshotTemplate[siteIdx]
                                          ? `http://localhost:8082/templates/${item.NameCategory.toLowerCase()}/${site.toLowerCase()}/assets/img/websiteScreenshot.jpg`
                                          : plug
                                      }
                                      alt="websiteScreenshot"
                                    />
                                  </div>
                                  <p className="accordion__nameTemplate">
                                    {site}
                                  </p>
                                  <div className="accordion__btnWrp">
                                    <Button
                                      className="accordion__view"
                                      variant="outlined"
                                      target="__blank"
                                      href={`http://localhost:8082/viewtemplate/?lang=${item.NameCategory}&name=${site}`}
                                    >
                                      VIEW
                                    </Button>
                                    <Button
                                      className="accordion__select"
                                      variant="contained"
                                      color="success"
                                      onClick={() =>
                                        handleClick(site, item.NameCategory)
                                      }
                                    >
                                      SELECT
                                    </Button>
                                  </div>
                                </li>
                              ))
                            : null}
                        </ul>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </div>
              ))
            ) : (
              // <Typography>Loading...</Typography> // Отображаем текст "Loading..." пока данные загружаются
              <Accordion>
                {/* Заголовок аккордеона с иконкой ExpandMore */}
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} // Иконка раскрытия, цвет установлен на белый
                >
                  {/* Текст заголовка аккордеона */}
                  <Typography className="accordion__block-category">
                    <span className="accordion__name-category">
                      <i className="flag flag-at"></i>
                      AT
                    </span>
                    {'  '}
                    <span className="accordion__number-templates">0</span>
                  </Typography>
                </AccordionSummary>
                {/* Содержимое аккордеона */}
                <AccordionDetails>
                  {/* Заменяем <p> на <div> или другой подходящий элемент */}
                  <div>
                    <ul className="accordion__ul">
                      <li>
                        <div className="accordion__imgWrp">
                          <img
                            className="accordion__img"
                            src={plug}
                            alt="websiteScreenshot"
                          />
                        </div>
                        <p className="accordion__nameTemplate">cleaning-1</p>
                        <div className="accordion__btnWrp">
                          <a
                            className="accordion__view"
                            target="__blank"
                            href="test.ru"
                          >
                            VIEW
                          </a>
                          <button className="accordion__select">SELECT</button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </AccordionDetails>
              </Accordion>
            )}
          </ThemeProvider>

          {showFormSelect && (
            <FormSelect
              showFormSelect={showFormSelect}
              setShowFormSelect={setShowFormSelect}
              nameTemplate={nameTemplate}
              nameCategory={nameCategory}
              listDomainsAndSubDomains={listDomainsAndSubDomains}
            />
          )}
        </div>
      </div>
    </section>
  );
}

// Экспортируем компонент ThemedAccordion, чтобы его можно было использовать в других частях приложения
export default ThemedAccordion;
