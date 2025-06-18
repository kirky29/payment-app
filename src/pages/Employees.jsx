import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  Avatar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  ListItem,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import EmployeeDetails from '../components/EmployeeDetails';
import { formatCurrency } from '../utils/currency';

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
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployeeForMenu, setSelectedEmployeeForMenu] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

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
      // Don't close dialog on error, let user retry
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      await deleteEmployee(employee.id);
    }
  };

  const handleMenuOpen = (event, employee) => {
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

  const handleAddWorkDay = (employee) => {
    setSelectedEmployee(employee);
    handleMenuClose();
  };

  const handleAddPayment = (employee) => {
    setSelectedEmployee(employee);
    handleMenuClose();
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (outstanding) => {
    if (outstanding === 0) return 'success';
    if (outstanding > 0) return 'error';
    return 'warning';
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading employees...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Employee Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your team and track their work days and payments
            </Typography>
          </Box>
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={submitting}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {submitting ? 'Adding...' : 'Add Employee'}
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {employees.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Employees
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {employees.filter(emp => calculateEmployeeTotals(emp.id).outstanding > 0).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Outstanding Payments
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(employees.reduce((sum, emp) => sum + calculateEmployeeTotals(emp.id).totalOwed, 0), settings.currency)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Owed
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            borderRadius: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(employees.reduce((sum, emp) => sum + calculateEmployeeTotals(emp.id).totalPaid, 0), settings.currency)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Paid
                  </Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employees Grid */}
      {employees.length === 0 ? (
        <Card sx={{ 
          textAlign: 'center', 
          py: 8,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3,
        }}>
          <CardContent>
            <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No employees yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Add your first employee to start tracking work days and payments
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={submitting}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                },
              }}
            >
              Add Employee
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {employees.map((employee) => {
            const totals = calculateEmployeeTotals(employee.id);
            const progress = totals.totalOwed > 0 ? (totals.totalPaid / totals.totalOwed) * 100 : 0;
            
            return (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={employee.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.3s ease-in-out',
                    borderRadius: 3,
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
                        background: progress >= 100 ? 'linear-gradient(90deg, #4caf50, #66bb6a)' : 'linear-gradient(90deg, #ff9800, #ffb74d)',
                      }
                    }} 
                  />
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Avatar 
                          sx={{ 
                            mr: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: 48,
                            height: 48,
                            fontSize: '1.2rem',
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(employee.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {employee.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(employee.dailyRate, settings.currency)}/day
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, employee);
                        }}
                        sx={{ 
                          backgroundColor: 'rgba(0,0,0,0.04)',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    {/* Financial Summary */}
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Owed
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(totals.totalOwed, settings.currency)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Paid
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {formatCurrency(totals.totalPaid, settings.currency)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    {/* Outstanding Amount */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Outstanding
                      </Typography>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold"
                        color={getStatusColor(totals.outstanding) + '.main'}
                      >
                        {formatCurrency(totals.outstanding, settings.currency)}
                      </Typography>
                    </Box>

                    {/* Status Chip */}
                    <Chip
                      label={totals.outstanding > 0 ? 'Outstanding' : 'Paid Up'}
                      color={getStatusColor(totals.outstanding)}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
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
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            },
          }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
        </Fab>
      )}

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Employee Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Daily Rate"
              type="number"
              value={formData.dailyRate}
              onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
              margin="normal"
              required
              disabled={submitting}
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting || loading || !isInitialized}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              },
            }}
          >
            {submitting ? 'Processing...' : (editingEmployee ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedEmployeeForMenu)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAddWorkDay(selectedEmployeeForMenu)}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Work Day</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAddPayment(selectedEmployeeForMenu)}>
          <ListItemIcon>
            <PaymentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Payment</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog(selectedEmployeeForMenu)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Employee</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleDelete(selectedEmployeeForMenu)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Employee</ListItemText>
        </MenuItem>
      </Menu>

      {/* Employee Details Dialog */}
      {selectedEmployee && (
        <EmployeeDetails
          employee={selectedEmployee}
          open={Boolean(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </Box>
  );
};

export default Employees; 