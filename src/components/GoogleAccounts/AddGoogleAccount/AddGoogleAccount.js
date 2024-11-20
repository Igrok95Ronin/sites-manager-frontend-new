import React from 'react';
import Stack from '@mui/material/Stack';

import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FormAddGA from '../FormAddGA/FormAddGA';

import './AddGoogleAccount.scss';

const AddGoogleAccount = ({ onUpdateGoogleAccounts }) => {
  const [openForm, setOpenForm] = React.useState(false);

  // Показать скрыть форму
  const handleClickBtn = () => {
    setOpenForm(!openForm);
  };

  return (
    <section className="addForm">
      <div className="addForm__container">
        <div className="addForm__box">
          <Stack>
            <IconButton onClick={handleClickBtn} color="secondary">
              <AddCircleOutlineIcon className="addForm__btn" />
            </IconButton>
          </Stack>
          {openForm && (
            <FormAddGA
              openForm={openForm}
              setOpenForm={setOpenForm}
              onUpdateGoogleAccounts={onUpdateGoogleAccounts}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default AddGoogleAccount;
