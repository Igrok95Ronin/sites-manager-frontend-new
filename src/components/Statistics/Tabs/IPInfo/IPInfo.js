import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';

import './IPInfo.scss';
import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

export default function IPInfo({ IP, setFilterIP }) {
  const request = async () => {
    try {
      const response = await axios.post(
        `${APIURL}/ipinfo`,
        {
          ip: IP,
        },
        {},
      );

      // Возвращаем результат
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState(null);

  // Получаем данные при монтировании компонента
  const fetchData = async () => {
    if (!data) {
      try {
        const result = await request();
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    fetchData();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        variant="text"
        size="small"
        sx={{
          textTransform: 'none', // Убираем автоматическое преобразование текста
          whiteSpace: 'nowrap', // Запрещаем перенос текста
        }}
        onClick={handleClickOpen}
      >
        {IP}
      </Button>
      <Tooltip title="Фильтровать по IP">
        <IconButton
           size="small"
           sx={{ ml: 0.5 }}
           onClick={() => {
             if (setFilterIP) {
               setFilterIP(IP);
             }
           }}
         >
          <FilterListIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle sx={{ paddingBottom: 0, color: '#0559b9' }} id="alert-dialog-title">
          {IP}
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          <DialogContent id="alert-dialog-description">
            {data ? (
              <div>
                {Object.entries(data).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null) {
                    // Для вложенных объектов, например, "dns"
                    return (
                      <div className="ipInfo__inner" key={key}>
                        <span style={{ fontWeight: 500, color: '#0f374a' }}>{key}:</span>
                        <ul className="ipInfo__inner">
                          {Object.entries(value).map(([nestedKey, nestedValue]) => (
                            <li key={nestedKey} className="ipInfo_wrapper">
                              <span style={{ fontWeight: 500, color: '#0f374a' }}>{nestedKey}:</span>{' '}
                              <span
                                style={{
                                  color:
                                    typeof nestedValue === 'number'
                                      ? 'blue'
                                      : typeof nestedValue === 'boolean'
                                      ? 'green'
                                      : '#800',
                                  fontStyle: typeof nestedValue === 'string' ? '' : 'normal',
                                }}
                              >
                                {nestedValue !== null ? nestedValue.toString() : 'N/A'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  // Для обычных ключей
                  return (
                    <p key={key} className="ipInfo_wrapper">
                      <span style={{ fontWeight: 500, color: '#0f374a' }}>{key}:</span>{' '}
                      <span
                        style={{
                          color: typeof value === 'number' ? '#cd5c12' : typeof value === 'boolean' ? 'green' : '#800',
                          fontStyle: typeof value === 'string' ? '' : 'normal',
                          paddingLeft: '5px',
                        }}
                      >
                        {value !== null ? value.toString() : 'N/A'}
                      </span>
                    </p>
                  );
                })}
              </div>
            ) : (
              'Загрузка данных...'
            )}
          </DialogContent>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
