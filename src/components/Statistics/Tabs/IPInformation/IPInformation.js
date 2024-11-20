import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';

import './IPInformation.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получаем URL из конфига

export default function IPInformation({ IP }) {
  const [open, setOpen] = React.useState(false);
  const [IPData, setIPData] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [dots, setDots] = React.useState(''); // Состояние для хранения количества точек

  const request = async () => {
    try {
      const response = await axios.get(`${APIURL}/ipinformation`, {
        params: {
          ip: IP,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await request();
      if (result) {
        setIPData(result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Эффект для обновления количества точек
  React.useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
      }, 500); // Интервал обновления точек

      return () => clearInterval(interval); // Очищаем таймер при завершении загрузки
    } else {
      setDots(''); // Сбрасываем точки после завершения загрузки
    }
  }, [loading]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderData = (data) => {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} style={{ marginLeft: '15px' }}>
            <strong className="IPInformation__key">{key}:</strong>
            {renderData(value)}
          </div>
        );
      } else {
        // Классы для разных типов значений
        const valueClass =
          typeof value === 'string'
            ? 'IPInformation__string'
            : typeof value === 'number'
            ? 'IPInformation__number'
            : typeof value === 'boolean'
            ? 'IPInformation__boolean'
            : '';

        // Используем <div> вместо <p>, чтобы избежать конфликта
        return (
          <div key={key}>
            <strong className="IPInformation__key">{key}:</strong>{' '}
            <span className={valueClass}>{value.toString()}</span>
          </div>
        );
      }
    });
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        {IP}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="IPInformation__title" id="alert-dialog-title">{IP}</DialogTitle>
        <DialogContent className="IPInformation__container">
          {loading ? (
            <div>Загрузка данных{dots}</div>
          ) : IPData ? (
            <div>{renderData(IPData)}</div>
          ) : (
            'Нет данных'
          )}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
