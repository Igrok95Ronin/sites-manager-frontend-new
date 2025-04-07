import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import './Search.scss';

const Search = ({ onSearch, numberOfDomains }) => {
  // Функция для обработки изменений в поле ввода
  const handleInputChange = (e) => {
    onSearch(e.target.value); // Вызываем функцию из родительского компонента для обновления поискового запроса
  };

  return (
    <section className="search">
      <div className="search__container">
        <div className="search__box">
          <Box sx={{ maxWidth: '100%' }} className="search__box">
            <TextField
              className="search__textField"
              id="standard-basic"
              label="Search"
              variant="standard"
              onChange={handleInputChange}
            />
          </Box>
          <span className="search__number">{numberOfDomains}</span>
        </div>
      </div>
    </section>
  );
};

export default Search;
