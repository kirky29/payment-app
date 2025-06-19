import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  Fab,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/currency';
import EmployeeDetails from '../components/EmployeeDetails';

const Employees = () => {
  const { 
    employees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    calculateEmployeeTotals, 
    settings, 
    loading, 
    syncing,
    isInitialized 
  } = useApp();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployeeForMenu, setSelectedEmployeeForMenu] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dailyRate: '',
  });

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        dailyRate: employee.dailyRate.toString(),
      });
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', dailyRate: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setFormData({ name: '', dailyRate: '' });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.dailyRate || submitting || !isInitialized) return;

    try {
      setSubmitting(true);
      
      const employeeData = {
        name: formData.name.trim(),
        dailyRate: parseFloat(formData.dailyRate),
      };

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employeeData);
      } else {
        await addEmployee(employeeData);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployeeForMenu(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployeeForMenu(null);
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    handleMenuClose();
  };

  const handleEdit = (employee) => {
    handleOpenDialog(employee);
    handleMenuClose();
  };

  const handleDelete = async (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        await deleteEmployee(employee.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
    handleMenuClose();
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  const getStatusColor = (outstanding) => {
    if (outstanding > 0) return 'error';
    if (outstanding < 0) return 'info';
    return 'success';
  };

  const totalStats = {
    totalEmployees: employees.length,
    needingAttention: employees.filter(emp => calculateEmployeeTotals(emp.id).outstanding > 0).length,
    totalOwed: employees.reduce((sum, emp) => sum + calculateEmployeeTotals(emp.id).totalOwed, 0),
    totalPaid: employees.reduce((sum, emp) => sum + calculateEmployeeTotals(emp.id).totalPaid, 0),
  };

  if (loading && !isInitialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                color: 'success.main',
                mb: { xs: 0.5, sm: 1 },
              }}
            >
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Team Management
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Manage your team and track their work
            </Typography>
          </Box>
          {!isMobile && (
            <Button
              variant="contained"
              size="large"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={submitting}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {submitting ? 'Adding...' : 'Add Employee'}
            </Button>
          )}
        </Box>

        {/* Quick Stats */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            icon={<PersonIcon />} 
            label={`${totalStats.totalEmployees} Employees`} 
            color="primary" 
            variant="outlined"
            size={isSmallMobile ? "small" : "medium"}
          />
          <Chip 
            icon={<TrendingDownIcon />} 
            label={`${totalStats.needingAttention} Need Attention`} 
            color="error" 
            variant="outlined"
            size={isSmallMobile ? "small" : "medium"}
          />
          <Chip 
            icon={<MoneyIcon />} 
            label={`${formatCurrency(totalStats.totalOwed, settings.currency)} Owed`} 
            color="warning" 
            variant="outlined"
            size={isSmallMobile ? "small" : "medium"}
          />
          <Chip 
            icon={<MoneyIcon />} 
            label={`${formatCurrency(totalStats.totalPaid, settings.currency)} Paid`} 
            color="success" 
            variant="outlined"
            size={isSmallMobile ? "small" : "medium"}
          />
        </Stack>
      </Paper>

      {/* Employees Grid */}
      {employees.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No employees yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first employee to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            color="success"
          >
            Add Employee
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {employees.map((employee) => {
            const totals = calculateEmployeeTotals(employee.id);
            const progress = totals.totalOwed > 0 ? (totals.totalPaid / totals.totalOwed) * 100 : 100;
            
            return (
              <Grid item xs={12} sm={6} lg={4} key={employee.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                  onClick={() => handleViewDetails(employee)}
                >
                  {/* Progress Bar */}
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(progress, 100)} 
                    sx={{ 
                      height: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: progress >= 100 ? 
                          'linear-gradient(90deg, #4caf50, #66bb6a)' : 
                          'linear-gradient(90deg, #ff9800, #ffb74d)',
                      }
                    }} 
                  />
                  
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Avatar 
                          sx={{ 
                            mr: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(employee.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            component="h2" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {employee.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {formatCurrency(employee.dailyRate, settings.currency)}/day
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, employee);
                        }}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.contrastText' }}>
                            {formatCurrency(totals.totalOwed, settings.currency)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                            Total Owed
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.contrastText' }}>
                            {formatCurrency(totals.totalPaid, settings.currency)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'success.contrastText', opacity: 0.8 }}>
                            Total Paid
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Outstanding Amount */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {totals.outstanding < 0 ? 'In Credit' : 'Outstanding'}
                      </Typography>
                      <Chip
                        label={formatCurrency(Math.abs(totals.outstanding), settings.currency)}
                        color={getStatusColor(totals.outstanding)}
                        size="small"
                        sx={{ fontWeight: 600, mt: 0.5 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Floating Action Button - Mobile Only */}
      {isMobile && employees.length > 0 && (
        <Fab
          color="primary"
          aria-label="add employee"
          onClick={() => handleOpenDialog()}
          disabled={submitting}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
            },
          }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
        </Fab>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleViewDetails(selectedEmployeeForMenu)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedEmployeeForMenu)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedEmployeeForMenu)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Employee Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              disabled={submitting}
            />
            <TextField
              label="Daily Rate"
              type="number"
              value={formData.dailyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: e.target.value }))}
              fullWidth
              required
              disabled={submitting}
              InputProps={{
                startAdornment: (
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {settings.currency === 'GBP' ? '£' : '$'}
                  </Typography>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.dailyRate || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? 'Saving...' : editingEmployee ? 'Update' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Details Modal */}
      <EmployeeDetails
        employee={selectedEmployee}
        open={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
      />
    </Box>
  );
};

export default Employees; 