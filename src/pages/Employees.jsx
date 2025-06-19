import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
  Fab,
  LinearProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/currency';
import EmployeeDetails from '../components/EmployeeDetails';

// Simple, clean employee card component
const EmployeeCard = ({ employee, totals, onViewDetails, onMenuClick, index }) => {
  const progress = totals.totalOwed > 0 ? (totals.totalPaid / totals.totalOwed) * 100 : 100;
  const isOutstanding = totals.outstanding > 0;

  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': { 
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        border: isOutstanding ? '2px solid' : '1px solid',
        borderColor: isOutstanding ? 'warning.main' : 'divider',
      }}
      onClick={() => onViewDetails(employee)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <Avatar 
              sx={{ 
                width: 50,
                height: 50,
                bgcolor: isOutstanding ? 'warning.main' : 'primary.main',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              {employee.name?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {employee.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(employee.dailyRate, 'USD')}/day
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(e, employee);
            }}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Payment Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: isOutstanding ? 'warning.main' : 'success.main',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Owed
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {formatCurrency(totals.totalOwed, 'USD')}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Outstanding
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                fontSize: '1rem',
                color: isOutstanding ? 'warning.main' : 'success.main',
              }}
            >
              {formatCurrency(Math.abs(totals.outstanding), 'USD')}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Employees = () => {
  const { 
    employees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    calculateEmployeeTotals, 
    settings, 
    loading, 
    isInitialized 
  } = useApp();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployeeForMenu, setSelectedEmployeeForMenu] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    dailyRate: '',
  });

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleOpenDialog = useCallback((employee = null) => {
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
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setFormData({ name: '', dailyRate: '' });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.dailyRate || submitting) return;

    try {
      setSubmitting(true);
      
      const employeeData = {
        name: formData.name.trim(),
        dailyRate: parseFloat(formData.dailyRate),
      };

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employeeData);
        setSnackbar({ open: true, message: 'Employee updated!', severity: 'success' });
      } else {
        await addEmployee(employeeData);
        setSnackbar({ open: true, message: 'Employee added!', severity: 'success' });
      }

      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving employee', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting, editingEmployee, updateEmployee, addEmployee, handleCloseDialog]);

  const handleMenuClick = useCallback((event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployeeForMenu(employee);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedEmployeeForMenu(null);
  }, []);

  const handleViewDetails = useCallback((employee) => {
    setSelectedEmployee(employee);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleEdit = useCallback((employee) => {
    handleOpenDialog(employee);
    handleMenuClose();
  }, [handleOpenDialog, handleMenuClose]);

  const handleDelete = useCallback(async (employee) => {
    if (window.confirm(`Delete ${employee.name}?`)) {
      try {
        await deleteEmployee(employee.id);
        setSnackbar({ open: true, message: 'Employee deleted!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting employee', severity: 'error' });
      }
    }
    handleMenuClose();
  }, [deleteEmployee, handleMenuClose]);

  if (loading && !isInitialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        p: 3,
        mb: 3,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Team Members
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {employees.length} {employees.length === 1 ? 'member' : 'members'}
            </Typography>
          </Box>
          
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              size="large"
              sx={{ px: 3, py: 1.5 }}
            >
              Add Employee
            </Button>
          )}
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Employee Grid */}
      <Box sx={{ px: 3, pb: isMobile ? 10 : 3 }}>
        {filteredEmployees.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {searchTerm ? 'No employees found' : 'No employees yet'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Try adjusting your search' : 'Add your first employee to get started'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                size="large"
              >
                Add First Employee
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(300px, 1fr))',
            },
            gap: 3,
            width: '100%',
          }}>
            {filteredEmployees.map((employee, index) => {
              const totals = calculateEmployeeTotals(employee.id);
              return (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  totals={totals}
                  onViewDetails={handleViewDetails}
                  onMenuClick={handleMenuClick}
                  index={index}
                />
              );
            })}
          </Box>
        )}
      </Box>

      {/* Floating Action Button - Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add employee"
          onClick={() => handleOpenDialog()}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedEmployeeForMenu)}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedEmployeeForMenu)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedEmployeeForMenu)} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
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
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.dailyRate || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? 'Saving...' : editingEmployee ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Details Modal */}
      <EmployeeDetails
        employee={selectedEmployee}
        open={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Employees; 