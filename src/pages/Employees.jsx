import React, { useState, useEffect } from 'react';
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
  Slide,
  Grow,
  Fade,
  Skeleton,
  Alert,
  Snackbar,
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
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dailyRate: '',
  });

  // Pull to refresh for mobile
  const handleRefresh = async () => {
    if (isMobile) {
      setIsRefreshing(true);
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      // Simulate refresh
      setTimeout(() => {
        setIsRefreshing(false);
        setSnackbar({ open: true, message: 'Data refreshed!', severity: 'success' });
      }, 1500);
    }
  };

  // Filter and sort employees
  const filteredAndSortedEmployees = React.useMemo(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;
      const totals = calculateEmployeeTotals(employee.id);
      if (filterStatus === 'outstanding') return totals.outstanding > 0;
      if (filterStatus === 'paid') return totals.outstanding <= 0;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rate':
          return b.dailyRate - a.dailyRate;
        case 'outstanding':
          const aOutstanding = calculateEmployeeTotals(a.id).outstanding;
          const bOutstanding = calculateEmployeeTotals(b.id).outstanding;
          return bOutstanding - aOutstanding;
        default:
          return 0;
      }
    });
  }, [employees, searchTerm, sortBy, filterStatus, calculateEmployeeTotals]);

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
        setSnackbar({ open: true, message: 'Employee updated successfully!', severity: 'success' });
      } else {
        await addEmployee(employeeData);
        setSnackbar({ open: true, message: 'Employee added successfully!', severity: 'success' });
      }

      handleCloseDialog();
      
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSnackbar({ open: true, message: 'Error saving employee. Please try again.', severity: 'error' });
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
        setSnackbar({ open: true, message: 'Employee deleted successfully!', severity: 'success' });
        
        // Add haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      } catch (error) {
        console.error('Delete error:', error);
        setSnackbar({ open: true, message: 'Error deleting employee. Please try again.', severity: 'error' });
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
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Pull to Refresh Indicator */}
      {isMobile && isRefreshing && (
        <Box sx={{ position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 1300 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Header Section */}
      <Grow in timeout={500}>
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
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={handleRefresh}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.8)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
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
              </Stack>
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
      </Grow>

      {/* Search and Filter */}
      <Fade in timeout={700}>
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            spacing={2} 
            alignItems={isMobile ? 'stretch' : 'center'}
          >
            <TextField
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="outstanding">Outstanding</MenuItem>
                <MenuItem value="paid">Paid Up</MenuItem>
              </TextField>
              <TextField
                select
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="rate">Daily Rate</MenuItem>
                <MenuItem value="outstanding">Outstanding</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </Paper>
      </Fade>

      {/* Employees Grid */}
      {filteredAndSortedEmployees.length === 0 ? (
        <Fade in timeout={900}>
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm || filterStatus !== 'all' ? 'No employees match your search' : 'No employees yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Add your first employee to get started'}
            </Typography>
            {(!searchTerm && filterStatus === 'all') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                color="success"
              >
                Add Employee
              </Button>
            )}
          </Paper>
        </Fade>
      ) : (
        <Grid container spacing={2}>
          {filteredAndSortedEmployees.map((employee, index) => {
            const totals = calculateEmployeeTotals(employee.id);
            const progress = totals.totalOwed > 0 ? (totals.totalPaid / totals.totalOwed) * 100 : 100;
            
            return (
              <Grow in timeout={500 + (index * 100)} key={employee.id}>
                <Grid item xs={12} sm={6} lg={4}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
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
                              boxShadow: 2,
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
                              sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 500,
                              }}
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
                          sx={{ 
                            ml: 1,
                            bgcolor: 'rgba(0,0,0,0.04)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      {/* Stats Grid */}
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 1.5, 
                            bgcolor: 'primary.light', 
                            borderRadius: 1,
                            boxShadow: 1,
                          }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.contrastText' }}>
                              {formatCurrency(totals.totalOwed, settings.currency)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                              Total Owed
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 1.5, 
                            bgcolor: 'success.light', 
                            borderRadius: 1,
                            boxShadow: 1,
                          }}>
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
                          sx={{ 
                            fontWeight: 600, 
                            mt: 0.5,
                            boxShadow: 1,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grow>
            );
          })}
        </Grid>
      )}

      {/* Floating Action Button - Mobile Only */}
      {isMobile && (
        <Slide direction="up" in={!submitting} mountOnEnter unmountOnExit>
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
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
          </Fab>
        </Slide>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }
        }}
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
        <MenuItem onClick={() => handleDelete(selectedEmployeeForMenu)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Employee Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
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
              autoFocus
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Employees; 