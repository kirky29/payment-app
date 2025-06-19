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
  ListItemIcon,
  ListItemText,
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
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

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

  // Handle swipe gestures for mobile navigation
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const currentTab = getCurrentTab();
    
    if (isLeftSwipe && currentTab < 3) {
      handleTabChange(null, currentTab + 1);
    }
    if (isRightSwipe && currentTab > 0) {
      handleTabChange(null, currentTab - 1);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          ...(isMobile ? {} : {
            ml: '240px',
            width: 'calc(100% - 240px)',
          }),
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '0.5px',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <span role="img" aria-label="money bag">💰</span>
            Payment Tracker
          </Typography>
          
          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SyncStatus />
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
              sx={{ 
                ml: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <AccountIcon />
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="textSecondary">
                {currentUser?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            left: 0, 
            top: 0, 
            bottom: 0,
            width: 240,
            zIndex: 1100,
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
          mt: { xs: '56px', sm: '64px' },
          transition: 'margin 0.3s',
          minHeight: 'calc(100vh - 56px)',
          '@media (min-width: 600px)': {
            minHeight: 'calc(100vh - 64px)',
          },
          pb: isMobile ? '64px' : 0, // Add padding for bottom navigation
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: { xs: 2, sm: 3 },
            px: { xs: 1.5, sm: 3 },
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
            background: '#fff',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={getCurrentTab()}
            onChange={handleTabChange}
            showLabels
            sx={{
              height: 56,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '6px 8px',
                '&.Mui-selected': {
                  paddingTop: '6px',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                '&.Mui-selected': {
                  fontSize: '0.75rem',
                },
              },
            }}
          >
            <BottomNavigationAction
              label="Employees"
              icon={<PeopleIcon />}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.4rem',
                },
              }}
            />
            <BottomNavigationAction
              label="Calendar"
              icon={<CalendarIcon />}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.4rem',
                },
              }}
            />
            <BottomNavigationAction
              label="Reports"
              icon={<ReportsIcon />}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.4rem',
                },
              }}
            />
            <BottomNavigationAction
              label="Settings"
              icon={<SettingsIcon />}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.4rem',
                },
              }}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default Layout; 