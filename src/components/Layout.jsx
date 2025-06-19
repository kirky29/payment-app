import React, { useState, useEffect } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Slide,
  useScrollTrigger,
  Fade,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import SyncStatus from './SyncStatus';

// Hide AppBar on scroll for mobile
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger({
    target: window,
    threshold: 100,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// Scroll to top FAB
function ScrollTop() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isMobile) return null;

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{
          position: 'fixed',
          bottom: 80,
          left: 16,
          zIndex: 1000,
        }}
      >
        <IconButton
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            width: 48,
            height: 48,
            boxShadow: 3,
          }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </Box>
    </Fade>
  );
}

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, logout } = useAuth();
  const { employees, calculateEmployeeTotals } = useApp();
  const [anchorEl, setAnchorEl] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Calculate notifications
  const notifications = {
    overduePayments: employees.filter(emp => 
      calculateEmployeeTotals(emp.id).outstanding > 0
    ).length,
  };

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
    
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Enhanced swipe gestures
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

  const AppBarComponent = isMobile ? HideOnScroll : React.Fragment;
  const appBarProps = isMobile ? {} : { children: undefined };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        overflowX: 'hidden',
        bgcolor: 'background.default',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <AppBarComponent {...appBarProps}>
        <AppBar 
          position="fixed" 
          elevation={isMobile ? 1 : 0}
          sx={{
            background: isMobile 
              ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' 
              : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            backdropFilter: isMobile ? 'blur(20px)' : 'none',
            borderBottom: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
            ...(isMobile ? {} : {
              ml: '240px',
              width: 'calc(100% - 240px)',
            }),
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ 
            minHeight: { xs: '56px', sm: '64px' },
            px: { xs: 2, sm: 3 },
          }}>
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
              {isMobile ? 'PayTracker' : 'Payment Tracker'}
            </Typography>
            
            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/reports')}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  <Badge badgeContent={notifications.overduePayments} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              
              <SyncStatus />
              
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{ 
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
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  mt: 1,
                  minWidth: 200,
                }
              }}
            >
              <MenuItem disabled sx={{ py: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {currentUser?.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </AppBarComponent>

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
          <Box sx={{ p: 3, mt: 8 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.secondary' }}>
              Navigation
            </Typography>
            
            {[
              { label: 'Team', icon: <PeopleIcon />, path: '/employees', count: employees.length },
              { label: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
              { label: 'Reports', icon: <ReportsIcon />, path: '/reports', count: notifications.overduePayments },
              { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
            ].map((item) => (
              <Box
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.5,
                  mb: 1,
                  cursor: 'pointer',
                  backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                  color: location.pathname === item.path ? 'white' : 'text.primary',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: location.pathname === item.path ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                </Box>
                {item.count > 0 && (
                  <Badge 
                    badgeContent={item.count} 
                    color={item.path === '/reports' ? 'error' : 'primary'}
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
                  />
                )}
              </Box>
            ))}
          </Box>
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
          pb: isMobile ? '72px' : 2,
        }}
      >
        <Box sx={{ 
          width: '100%',
          py: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2 },
        }}>
          {children}
        </Box>
      </Box>

      {/* Enhanced Bottom Navigation - Mobile Only */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 1200,
            borderTop: '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }} 
          elevation={0}
        >
          <BottomNavigation
            value={getCurrentTab()}
            onChange={handleTabChange}
            showLabels
            sx={{
              height: 64,
              backgroundColor: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '8px 12px',
                borderRadius: 2,
                mx: 0.5,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.5rem',
                  },
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  fontSize: '0.75rem',
                },
              },
            }}
          >
            <BottomNavigationAction
              label="Team"
              icon={
                <Badge badgeContent={employees.length} color="primary" max={99}>
                  <PeopleIcon />
                </Badge>
              }
            />
            <BottomNavigationAction
              label="Calendar"
              icon={<CalendarIcon />}
            />
            <BottomNavigationAction
              label="Reports"
              icon={
                <Badge badgeContent={notifications.overduePayments} color="error">
                  <ReportsIcon />
                </Badge>
              }
            />
            <BottomNavigationAction
              label="Settings"
              icon={<SettingsIcon />}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Scroll to Top */}
      <ScrollTop />
    </Box>
  );
};

export default Layout; 