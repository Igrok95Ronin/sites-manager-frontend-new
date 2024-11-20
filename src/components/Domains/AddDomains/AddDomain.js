import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import FormAddDomain from '../FormAddDomain/FormAddDomain';

import './AddDomain.scss';

const AddDomain = ({ onUpdateDomains }) => {
  const [openForm, setOpenForm] = React.useState(false);
  const [addNewDomain, setAddNewDomain] = React.useState('');

  const langs = ['de', 'nl', 'cz', 'fr', 'en', 'hu', 'no', 'pl', 'ru'];
  const [siteLanguage, setSiteLanguage] = React.useState(langs[0]);

  // Показать скрыть форму
  const handleClickBtn = () => {
    setOpenForm(!openForm);
  };

  const handleChangeAddNewDomain = (e) => {
    // Удаляем пробелы и экранируем потенциально опасные символы
    const filteredValue = e.target.value
      .replace(/[^a-zA-Zа-яА-Я0-9.\-:/]/g, '')
      .toLowerCase();
    setAddNewDomain(filteredValue);
  };

  const handleChangeSelectSiteLanguage = (e) => {
    setSiteLanguage(e.target.value);
  };

  return (
    <section className="addDomain">
      <div className="addDomain__container">
        <div className="addDomain__box">
          <Stack>
            <IconButton onClick={handleClickBtn}>
              <AddCircleOutlineIcon className="addDomain__btn" />
            </IconButton>
          </Stack>
          {openForm && (
            <FormAddDomain
              onClose={handleClickBtn}
              addNewDomain={addNewDomain}
              handleChangeAddNewDomain={handleChangeAddNewDomain}
              siteLanguage={siteLanguage}
              handleChangeSelectSiteLanguage={handleChangeSelectSiteLanguage}
              langs={langs}
              onUpdateDomains={onUpdateDomains}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default AddDomain;
