import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CurrencyExchange as CurrencyIcon,
  DataUsage as DataIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/currency';

const Settings = () => {
  const { employees, workDays, payments, settings, updateSettings, deleteEmployee } = useApp();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEmployeeToDelete, setSelectedEmployeeToDelete] = useState(null);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState(settings.currency);
  const [currencyChanged, setCurrencyChanged] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  useEffect(() => {
    console.log('[Settings] Current settings:', settings);
    console.log('[Settings] Current currency:', settings.currency);
    setPendingCurrency(settings.currency);
    setCurrencyChanged(false);
  }, [settings]);

  const handleCurrencyChange = (event) => {
    updateSettings({ currency: event.target.value });
  };

  const handleThemeChange = (event) => {
    updateSettings({ theme: event.target.checked ? 'dark' : 'light' });
  };

  const handleDeleteEmployee = async () => {
    if (selectedEmployeeToDelete) {
      await deleteEmployee(selectedEmployeeToDelete.id);
      setSelectedEmployeeToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleClearAllData = async () => {
    // This would need to be implemented in the context
    // For now, we'll just show a confirmation
    setShowClearDataDialog(false);
    alert('This feature would clear all data. Implementation needed.');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Currency Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CurrencyIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Currency Settings</Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={pendingCurrency}
                  onChange={e => {
                    setPendingCurrency(e.target.value);
                    setCurrencyChanged(e.target.value !== settings.currency);
                  }}
                  label="Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </MenuItem>
                  ))}
                </Select>
                {currencyChanged && (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      updateSettings({ currency: pendingCurrency });
                      setCurrencyChanged(false);
                      console.log('[Settings] Change Currency button clicked:', pendingCurrency);
                    }}
                  >
                    Change Currency
                  </Button>
                )}
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will affect how all monetary values are displayed throughout the app.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaletteIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.theme === 'dark'}
                    onChange={handleThemeChange}
                  />
                }
                label="Dark Mode"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Switch between light and dark themes.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Data Management</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Total Employees"
                    secondary={`${employees.length} employees`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Work Days"
                    secondary={`${workDays.length} work days recorded`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Payments"
                    secondary={`${payments.length} payments made`}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Employee Management
              </Typography>
              
              {employees.length > 0 ? (
                <List>
                  {employees.map((employee) => (
                    <ListItem key={employee.id}>
                      <ListItemText
                        primary={employee.name}
                        secondary={`Daily Rate: ${formatCurrency(employee.dailyRate, settings.currency)}`}
                      />
                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          setSelectedEmployeeToDelete(employee);
                          setShowDeleteDialog(true);
                        }}
                      >
                        Delete
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No employees to manage
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Clear All Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This will permanently delete all employees, work days, and payments.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<WarningIcon />}
                  onClick={() => setShowClearDataDialog(true)}
                >
                  Clear All Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* App Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">App Information</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="App Version"
                    secondary="1.0.0"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Data Storage"
                    secondary="Firebase Firestore"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={new Date().toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Employee Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          {selectedEmployeeToDelete && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to delete <strong>{selectedEmployeeToDelete.name}</strong>?
              This will also delete all associated work days and payments.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteEmployee} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Data Dialog */}
      <Dialog open={showClearDataDialog} onClose={() => setShowClearDataDialog(false)}>
        <DialogTitle>Clear All Data</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Warning: This action cannot be undone!
            </Typography>
            <Typography>
              This will permanently delete all employees, work days, and payments from the database.
              Please make sure you have backed up any important data before proceeding.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDataDialog(false)}>Cancel</Button>
          <Button onClick={handleClearAllData} color="error" variant="contained">
            Clear All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 