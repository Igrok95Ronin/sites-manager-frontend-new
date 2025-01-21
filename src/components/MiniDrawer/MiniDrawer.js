import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Для Accordion
import PublicIcon from '@mui/icons-material/Public'; // Для Domains
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Для Google Accounts
import ListAltIcon from '@mui/icons-material/ListAlt'; // Для Logs
import BarChartIcon from '@mui/icons-material/BarChart'; // Для Statistics
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: 30, // Установите фиксированное значение ширины
  [theme.breakpoints.up('sm')]: {
    width: 30, // Установите фиксированное значение ширины
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(1),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

export default function MiniDrawer({ children }) {
  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const routes = [
    { text: 'Accordion', path: '/', icon: <DashboardIcon /> },
    { text: 'Domains', path: '/domains', icon: <PublicIcon /> },
    { text: 'Google Accounts', path: '/google-accounts', icon: <AccountCircleIcon /> },
    { text: 'Logs', path: '/logs', icon: <ListAltIcon /> },
    { text: 'Statistics', path: '/statistics', icon: <BarChartIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton
            sx={{
              fontSize: 24, // Размер кнопки
              color: 'primary.main', // Цвет кнопки
              padding: 0,
              display: '',
              paddingLeft: "4px",
            }}
            onClick={handleDrawerToggle}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {routes.map((route) => (
            <ListItem key={route.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={Link}
                to={route.path}
                sx={{
                  minHeight: 48,
                  px: 0.5,
                  justifyContent: open ? 'initial' : 'center',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {route.icon}
                </ListItemIcon>
                <ListItemText
                  primary={route.text}
                  sx={{
                    opacity: open ? 1 : 0,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, px: 1, py: 0 }}>
        {children}
      </Box>
    </Box>
  );
}
