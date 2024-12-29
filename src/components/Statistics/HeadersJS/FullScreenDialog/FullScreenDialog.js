import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog({ AcceptLanguage }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
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
        {AcceptLanguage}
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        sx={{
          '.MuiDialog-paper': {
            marginTop: '140px',
          },
        }}
      >
        <AppBar sx={{ position: 'relative', backgroundColor: '#4caf50' }}>
          <Toolbar
            sx={{
              minHeight: '40px', // Устанавливаем минимальную высоту по умолчанию
              '@media (min-width:600px)': {
                minHeight: '40px', // Высота при ширине экрана >= 600px
              },
            }}
          >
            <Typography sx={{ ml: 0, flex: 1 }} variant="h6" component="div">
              Headers
            </Typography>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        {/* Контент */}
      </Dialog>
    </React.Fragment>
  );
}
