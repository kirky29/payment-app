import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  AttachMoney as CurrencyIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { settings, updateSettings, employees, workDays, payments } = useApp();
  const { currentUser } = useAuth();
  
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [notifications, setNotifications] = useState({
    payments: true,
    reminders: true,
    reports: false,
  });

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const exportData = () => {
    const data = {
      employees,
      workDays,
      payments,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpenExportDialog(false);
  };

  const calculateStats = () => {
    const totalOwed = employees.reduce((sum, emp) => {
      const empWorkDays = workDays.filter(wd => wd.employeeId === emp.id);
      return sum + empWorkDays.reduce((empSum, wd) => empSum + wd.dailyRate, 0);
    }, 0);
    
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalEmployees: employees.length,
      totalWorkDays: workDays.length,
      totalPayments: payments.length,
      totalOwed,
      totalPaid,
      outstanding: totalOwed - totalPaid,
    };
  };

  const stats = calculateStats();

  const settingSections = [
    {
      title: 'Appearance',
      icon: <PaletteIcon />,
      items: [
        {
          primary: 'Currency',
          secondary: 'Choose your preferred currency',
          icon: <CurrencyIcon />,
          control: (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={settings.currency || 'GBP'}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
              >
                <MenuItem value="GBP">£ GBP</MenuItem>
                <MenuItem value="USD">$ USD</MenuItem>
                <MenuItem value="EUR">€ EUR</MenuItem>
              </Select>
            </FormControl>
          ),
        },
        {
          primary: 'Theme',
          secondary: 'Light or dark mode',
          icon: <DarkModeIcon />,
          control: (
            <Switch
              checked={settings.darkMode || false}
              onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
            />
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      icon: <NotificationsIcon />,
      items: [
        {
          primary: 'Payment Reminders',
          secondary: 'Get notified about overdue payments',
          icon: <NotificationsIcon />,
          control: (
            <Switch
              checked={notifications.payments}
              onChange={(e) => setNotifications(prev => ({ ...prev, payments: e.target.checked }))}
            />
          ),
        },
        {
          primary: 'Weekly Reports',
          secondary: 'Receive weekly summary reports',
          icon: <InfoIcon />,
          control: (
            <Switch
              checked={notifications.reports}
              onChange={(e) => setNotifications(prev => ({ ...prev, reports: e.target.checked }))}
            />
          ),
        },
      ],
    },
    {
      title: 'Data Management',
      icon: <BackupIcon />,
      items: [
        {
          primary: 'Export Data',
          secondary: 'Download your data as JSON',
          icon: <ExportIcon />,
          control: (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenExportDialog(true)}
            >
              Export
            </Button>
          ),
        },
        {
          primary: 'Clear All Data',
          secondary: 'Remove all employees, work days, and payments',
          icon: <DeleteIcon />,
          control: (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => setOpenDeleteDialog(true)}
            >
              Clear
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 2, color: 'primary.main', fontSize: { xs: '2rem', sm: '2.5rem' } }} />
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                color: 'primary.main',
                mb: { xs: 0.5, sm: 1 },
              }}
            >
              Settings
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Customize your payment tracker experience
            </Typography>
          </Box>
        </Box>

        {/* User Info Card */}
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: { xs: 48, sm: 56 }, 
                height: { xs: 48, sm: 56 },
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}>
                {currentUser?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {currentUser?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account created: {new Date(currentUser?.metadata?.creationTime || Date.now()).toLocaleDateString()}
                </Typography>
              </Box>
              <Chip 
                label="Active" 
                color="success" 
                size="small" 
                icon={<CheckIcon />}
              />
            </Box>
          </CardContent>
        </Card>
      </Paper>

      {/* Quick Stats */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Overview
        </Typography>
        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          spacing={2}
          sx={{ '& > *': { flex: 1 } }}
        >
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
              {stats.totalEmployees}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Employees
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
              {stats.totalWorkDays}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Work Days
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
              {stats.totalPayments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payments
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color={stats.outstanding > 0 ? 'error.main' : 'success.main'} sx={{ fontWeight: 700 }}>
              {settings.currency === 'GBP' ? '£' : '$'}{Math.abs(stats.outstanding).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.outstanding > 0 ? 'Outstanding' : 'In Credit'}
            </Typography>
          </Card>
        </Stack>
      </Paper>

      {/* Settings Sections */}
      {settingSections.map((section, index) => (
        <Paper key={index} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          {isMobile ? (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {section.icon}
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List>
                  {section.items.map((item, itemIndex) => (
                    <React.Fragment key={itemIndex}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.primary}
                          secondary={item.secondary}
                        />
                        <Box sx={{ ml: 2 }}>
                          {item.control}
                        </Box>
                      </ListItem>
                      {itemIndex < section.items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ) : (
            <>
              <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {section.icon}
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                </Box>
              </Box>
              <List>
                {section.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.primary}
                        secondary={item.secondary}
                      />
                      <Box sx={{ ml: 2 }}>
                        {item.control}
                      </Box>
                    </ListItem>
                    {itemIndex < section.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </>
          )}
        </Paper>
      ))}

      {/* App Info */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          About Payment Tracker
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A modern, mobile-first application for tracking employee payments and work schedules.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip label="Version 1.0.0" size="small" />
          <Chip label="React 18" size="small" />
          <Chip label="Material-UI 5" size="small" />
          <Chip label="Firebase" size="small" />
        </Stack>
      </Paper>

      {/* Export Dialog */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will download all your data including employees, work days, payments, and settings as a JSON file.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Data included:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={`${stats.totalEmployees} Employees`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`${stats.totalWorkDays} Work Days`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`${stats.totalPayments} Payments`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Settings & Preferences" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>Cancel</Button>
          <Button onClick={exportData} variant="contained" startIcon={<ExportIcon />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Clear All Data
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body1" gutterBottom>
            This will delete:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={`${stats.totalEmployees} Employees`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`${stats.totalWorkDays} Work Days`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`${stats.totalPayments} Payments`} />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Consider exporting your data first as a backup.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // Here you would implement the clear data functionality
              setOpenDeleteDialog(false);
            }} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 