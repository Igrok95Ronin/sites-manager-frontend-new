import React from 'react'; // Импортируем React, чтобы использовать JSX и компоненты React
import { NavLink } from 'react-router-dom'; // Импортируем NavLink из react-router-dom для создания навигационных ссылок

import './Header.scss'; // Импортируем файл стилей для компонента Header

// Определяем функциональный компонент Header
const Header = () => {
  return (
    // Основной контейнер для шапки сайта
    <header className="header">
      <div className="header__box">
        {' '}
        {/* Внутренний контейнер для структурирования содержимого шапки */}
        <nav className="navbar">
          {' '}
          {/* Навигационный блок */}
          <ul className="header__ul">
            {' '}
            {/* Список элементов навигации */}
            <li>
              {' '}
              {/* Элемент списка */}
              {/* NavLink создает ссылку, которая автоматически добавляет класс "active-link", если текущий маршрут совпадает с путем "/" */}
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Шаблоны {/* Текст ссылки */}
              </NavLink>
            </li>
            <li>
              {' '}
              {/* Следующий элемент списка */}
              {/* NavLink для маршрута "/domains". Добавляется класс "active-link", если маршрут активен */}
              <NavLink
                to="/domains"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Домены {/* Текст ссылки */}
              </NavLink>
            </li>
            <li>
              {' '}
              {/* Последний элемент списка */}
              {/* NavLink для маршрута "/google-accounts". Добавляет класс "active-link", если маршрут активен */}
              <NavLink
                to="/google-accounts"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Аккаунты Google {/* Текст ссылки */}
              </NavLink>
            </li>
            <li>
              {' '}
              {/* Последний элемент списка */}
              {/* NavLink для маршрута "/logs". Добавляет класс "active-link", если маршрут активен */}
              <NavLink
                to="/logs"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Логи {/* Текст ссылки */}
              </NavLink>
            </li>
            <li>
              {' '}
              {/* Последний элемент списка */}
              {/* NavLink для маршрута "/statistics". Добавляет класс "active-link", если маршрут активен */}
              <NavLink
                to="/statistics"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Статистика {/* Текст ссылки */}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
