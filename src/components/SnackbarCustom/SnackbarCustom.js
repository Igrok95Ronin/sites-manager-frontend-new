import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';

export default function SnackbarCustom({ data, error }) {
  const [open, setOpen] = React.useState(true);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <div>
      <Snackbar
        className={data ? 'table__mySuccess' : 'table__myError'}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        message={data ? data : error.message}
      />
    </div>
  );
}
// className="table__mySuccess"
// open={open}
// autoHideDuration={2000}
// onClose={handleClose}
// message={data}
