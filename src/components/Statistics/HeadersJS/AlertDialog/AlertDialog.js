import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { JSONTree } from 'react-json-tree';

import './AlertDialog.scss';

export default function AlertDialog({ AcceptLanguage, Headers, Label, Title, doubleOutput, doubleData }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Преобразуем Headers, чтобы массивы отображались как строки
  const formattedHeaders = React.useMemo(() => {
    try {
      const headers = typeof Headers === 'string' ? JSON.parse(Headers) : Headers;

      // Преобразуем массивы в строки
      const transformedHeaders = Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', ') : value, // Если массив, преобразуем в строку
        ]),
      );

      return transformedHeaders;
    } catch (error) {
      return null;
    }
  }, [Headers]);

  // Преобразуем doubleData, чтобы массивы отображались как строки
  const formattedDoubleData = React.useMemo(() => {
    try {
      const data = typeof doubleData === 'string' ? JSON.parse(doubleData) : doubleData;

      // Преобразуем массивы в строки
      const transformedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', ') : value, // Если массив, преобразуем в строку
        ]),
      );

      return transformedData;
    } catch (error) {
      return null;
    }
  }, [doubleData]);

  // Получаем количество заголовков
  const headersCount = React.useMemo(() => {
    if (formattedHeaders && typeof formattedHeaders === 'object') {
      return Object.keys(formattedHeaders).length;
    }
    return 0;
  }, [formattedHeaders]);

  return (
    <>
      <Button
        variant="text"
        size="small"
        color="primary"
        className="alertDialog__openButton"
        sx={{
          textTransform: 'none',
          whiteSpace: 'nowrap',
          justifyContent: 'start',
          borderRadius: '8px',
          padding: '6px 12px',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(25, 118, 210, 0.08)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
          }
        }}
        onClick={handleClickOpen}
      >
        {AcceptLanguage || `View ${Label}`}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="false"
        className="alertDialog"
        PaperProps={{
          sx: { 
            borderRadius: 3, 
            overflow: 'hidden', 
            bgcolor: '#ffffff', 
            maxWidth: '1500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            animation: 'slideInUp 0.3s ease-out'
          }
        }}
      >
        {doubleOutput ? (
          <>
            <DialogTitle
              id="alert-dialog-title"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.2rem',
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                letterSpacing: '0.5px'
              }}
            >
              {Title} {headersCount > 0 && `(${headersCount} полей)`}
            </DialogTitle>

            <div className="alertDialog__innerModal">
              <DialogContent
                sx={{
                  bgcolor: '#ffffff',
                  color: '#333',
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  overflowX: 'auto',
                  overflowY: 'auto',
                  padding: '20px',
                  minHeight: '300px',
                  maxHeight: '60vh',
                  background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                  borderRight: '2px solid #e3f2fd',
                  position: 'relative'
                }}
              >
                {formattedHeaders ? (
                  <JSONTree
                    data={formattedHeaders}
                    theme={{
                      base00: '#ffffff',
                      base01: '#f5f5f5',
                      base02: '#e0e0e0',
                      base03: '#9e9e9e',
                      base04: '#757575',
                      base05: '#424242',
                      base06: '#212121',
                      base07: '#000000',
                      base08: '#d32f2f',
                      base09: '#ed6c02',
                      base0A: '#ffeb3b',
                      base0B: '#4caf50',
                      base0C: '#00bcd4',
                      base0D: '#1976d2',
                      base0E: '#9c27b0',
                      base0F: '#795548'
                    }}
                    shouldExpandNode={() => true}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                    borderRadius: '12px',
                    border: '2px dashed rgba(102, 126, 234, 0.2)',
                    margin: '20px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      opacity: 0.7
                    }}>
                      <span style={{ color: 'white', fontSize: '20px' }}>📄</span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#4c51bf',
                      marginBottom: '8px'
                    }}>
                      Данные недоступны
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#718096',
                      textAlign: 'center'
                    }}>
                      Проверьте данные или попробуйте позже
                    </p>
                  </div>
                )}
              </DialogContent>
              <DialogContent
                sx={{
                  bgcolor: '#ffffff',
                  color: '#333',
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  overflowX: 'auto',
                  overflowY: 'auto',
                  padding: '20px',
                  minHeight: '300px',
                  maxHeight: '60vh',
                  background: 'linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)',
                  position: 'relative'
                }}
              >
                {formattedDoubleData ? (
                  <JSONTree
                    data={formattedDoubleData}
                    theme={{
                      base00: '#ffffff',
                      base01: '#f5f5f5',
                      base02: '#e0e0e0',
                      base03: '#9e9e9e',
                      base04: '#757575',
                      base05: '#424242',
                      base06: '#212121',
                      base07: '#000000',
                      base08: '#d32f2f',
                      base09: '#ed6c02',
                      base0A: '#ffeb3b',
                      base0B: '#4caf50',
                      base0C: '#00bcd4',
                      base0D: '#1976d2',
                      base0E: '#9c27b0',
                      base0F: '#795548'
                    }}
                    shouldExpandNode={() => true}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '200px',
                      background: '#f5f5f5',
                      border: '1px dashed #e0e0e0',
                      borderRadius: '4px',
                      margin: '16px',
                      color: '#757575',
                      fontSize: '14px',
                      fontWeight: '400'
                    }}
                  >
                    Данные недоступны
                  </div>
                )}
              </DialogContent>
            </div>
          </>
        ) : (
          <>
            <DialogTitle
              id="alert-dialog-title"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.2rem',
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                letterSpacing: '0.5px'
              }}
            >
              {Title} {headersCount > 0 && `(${headersCount} полей)`}
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  color: 'white',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(90deg)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              sx={{
                bgcolor: '#ffffff',
                color: '#333',
                fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                overflowX: 'auto',
                overflowY: 'auto',
                padding: '20px',
                minHeight: '400px',
                maxHeight: '70vh',
                background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                scrollbarWidth: 'thin',
                scrollbarColor: '#1976d2 #f5f5f5',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f5f5f5',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0, #0d47a1)'
                  }
                }
              }}
            >
              {formattedHeaders ? (
                <JSONTree
                  data={formattedHeaders}
                  theme={{
                    base00: 'transparent',
                    base01: '#f8f9fa',
                    base02: '#e9ecef',
                    base03: '#dee2e6',
                    base04: '#ced4da',
                    base05: '#495057',
                    base06: '#6c757d',
                    base07: '#495057',
                    base08: '#dc3545',
                    base09: '#fd7e14',
                    base0A: '#ffc107',
                    base0B: '#28a745',
                    base0C: '#17a2b8',
                    base0D: '#007bff',
                    base0E: '#6f42c1',
                    base0F: '#6c757d'
                  }}
                  invertTheme={false}
                  hideRoot
                  shouldExpandNode={() => true}
                  labelRenderer={([key]) => (
                    <span style={{ 
                      fontWeight: 600, 
                      color: '#1976d2',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      background: 'rgba(25, 118, 210, 0.05)'
                    }}>
                      {key}
                    </span>
                  )}
                  valueRenderer={(raw, value) => (
                    <span style={{
                      color: '#2e7d32',
                      fontWeight: 500,
                      background: 'rgba(46, 125, 50, 0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(46, 125, 50, 0.1)'
                    }}>
                      {JSON.stringify(value)}
                    </span>
                  )}
                />
              ) : (
                <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  Не удалось отобразить {Title}. Проверьте данные, возможно, они пустые.
                </p>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
