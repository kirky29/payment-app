import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SyncStatus from './SyncStatus';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleClose();
  };

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/employees') return 0;
    if (path === '/calendar') return 1;
    if (path === '/reports') return 2;
    if (path === '/settings') return 3;
    return 0;
  };

  const handleTabChange = (event, newValue) => {
    const routes = ['/employees', '/calendar', '/reports', '/settings'];
    navigate(routes[newValue]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          // On desktop, make header start after sidebar
          ...(isMobile ? {} : {
            ml: '240px',
            width: 'calc(100% - 240px)',
          }),
        }}
      >
        <Toolbar>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '0.5px',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            💰 Money Tracker
          </Typography>
          
          {/* User Menu */}
          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2, color: 'rgba(255,255,255,0.8)' }}>
                {currentUser.email}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <AccountIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Side Navigation - Desktop Only */}
      {!isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            left: 0, 
            top: 0, 
            bottom: 0,
            width: 240,
            zIndex: 1100, // Higher than AppBar to prevent overlap
            borderRadius: 0,
            borderRight: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
          }} 
          elevation={4}
        >
          <Box sx={{ p: 2, mt: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
              Navigation
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            {[
              { label: 'Employees', icon: <PeopleIcon />, path: '/employees' },
              { label: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
              { label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
              { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
            ].map((item, index) => (
              <Box
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 3,
                  py: 2,
                  cursor: 'pointer',
                  backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                  color: location.pathname === item.path ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: location.pathname === item.path ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s ease-in-out',
                  borderLeft: location.pathname === item.path ? '4px solid white' : '4px solid transparent',
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
          
          {/* Sync Status - Above logout */}
          {currentUser && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <SyncStatus />
              </Box>
            </Box>
          )}
          
          {/* Logout button in sidebar */}
          {currentUser && (
            <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: 'error.main',
                  borderColor: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'white',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          ml: isMobile ? 0 : '240px',
          transition: 'margin 0.3s',
          minHeight: 'calc(100vh - 64px)', // Account for header height
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: isMobile ? 8 : 4,
          }}
        >
          <Box sx={{ 
            maxWidth: '1400px', 
            mx: 'auto',
          }}>
            {children}
          </Box>
        </Container>
      </Box>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 1000,
            borderTop: '1px solid rgba(0,0,0,0.1)',
          }} 
          elevation={8}
        >
          <BottomNavigation
            value={getCurrentTab()}
            onChange={handleTabChange}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '6px 12px 8px',
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 500,
              },
            }}
          >
            <BottomNavigationAction
              label="Employees"
              icon={<PeopleIcon />}
            />
            <BottomNavigationAction
              label="Calendar"
              icon={<CalendarIcon />}
            />
            <BottomNavigationAction
              label="Reports"
              icon={<ReportsIcon />}
            />
            <BottomNavigationAction
              label="Settings"
              icon={<SettingsIcon />}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default Layout; 