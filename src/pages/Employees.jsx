import React, { useState, useCallback, useMemo } from 'react';
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  AppBar,
  Toolbar,
  Badge,
  Zoom,
  Collapse,
  useScrollTrigger,
  Container,
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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/currency';
import EmployeeDetails from '../components/EmployeeDetails';

// Enhanced employee card component
const EmployeeCard = ({ 
  employee, 
  totals, 
  onViewDetails, 
  onMenuClick, 
  onCardClick,
  isMobile,
  index 
}) => {
  const theme = useTheme();
  const progress = totals.totalOwed > 0 ? (totals.totalPaid / totals.totalOwed) * 100 : 100;
  const isOutstanding = totals.outstanding > 0;
  const isInCredit = totals.outstanding < 0;

  return (
    <Grow in timeout={300 + (index * 50)}>
      <Card 
        sx={{ 
          cursor: 'pointer',
          '&:hover': { 
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
        onClick={onCardClick}
      >
        {isOutstanding && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'warning.main',
              boxShadow: '0 0 0 3px rgba(255, 152, 0, 0.2)',
            }}
          />
        )}
        
        <CardContent sx={{ p: 2.5, pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 48,
                height: 48,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'white',
                background: isOutstanding 
                  ? 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)'
                  : isInCredit
                  ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                  : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {employee.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
            </Avatar>
            
            <Box sx={{ flex: 1, ml: 2, minWidth: 0 }}>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                  mb: 0.5,
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
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <MoneyIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                {formatCurrency(employee.dailyRate, 'USD')}/day
              </Typography>
            </Box>

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e, employee);
              }}
              size="small"
              sx={{ 
                ml: 1,
                color: 'text.secondary',
                '&:hover': { 
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                Payment Progress
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: isOutstanding 
                    ? 'linear-gradient(90deg, #ff9800 0%, #ed6c02 100%)'
                    : isInCredit
                    ? 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)'
                    : 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
                },
              }}
            />
          </Box>

          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1.5,
              mt: 'auto',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  mb: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                Total Owed
              </Typography>
              <Typography 
                variant="subtitle2"
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {formatCurrency(totals.totalOwed, 'USD')}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  mb: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                Outstanding
              </Typography>
              <Typography 
                variant="subtitle2"
                sx={{ 
                  fontWeight: 600,
                  color: isOutstanding ? 'warning.main' : isInCredit ? 'info.main' : 'success.main',
                }}
              >
                {formatCurrency(Math.abs(totals.outstanding), 'USD')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
};

// Mobile employee list item component
const EmployeeListItem = ({ 
  employee, 
  totals, 
  onViewDetails, 
  onMenuClick,
  isMobile,
  index 
}) => {
  const isOutstanding = totals.outstanding > 0;
  const isInCredit = totals.outstanding < 0;
  const progress = totals.totalOwed > 0 ? (totals.totalPaid / totals.totalOwed) * 100 : 100;

  return (
    <Grow in timeout={200 + (index * 30)}>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          mb: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          p: 0,
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'translateX(4px)',
          },
          '&:active': {
            transform: 'translateX(0px)',
          },
          transition: 'all 0.2s ease',
        }}
        onClick={() => onViewDetails(employee)}
      >
        {isOutstanding && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'warning.main',
              boxShadow: '0 0 0 3px rgba(255, 152, 0, 0.2)',
              zIndex: 1,
            }}
          />
        )}
        
        <Box sx={{ width: '100%', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 40,
                height: 40,
                fontSize: '1rem',
                fontWeight: 600,
                color: 'white',
                background: isOutstanding 
                  ? 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)'
                  : isInCredit
                  ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                  : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {employee.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
            </Avatar>
            
            <Box sx={{ flex: 1, ml: 2, minWidth: 0 }}>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                  mb: 0.5,
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
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <MoneyIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                {formatCurrency(employee.dailyRate, 'USD')}/day
              </Typography>
            </Box>

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e, employee);
              }}
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                Payment Progress
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                height: 3,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1.5,
                  background: isOutstanding 
                    ? 'linear-gradient(90deg, #ff9800 0%, #ed6c02 100%)'
                    : isInCredit
                    ? 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)'
                    : 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
                },
              }}
            />
          </Box>

          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1.5,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  mb: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                Total Owed
              </Typography>
              <Typography 
                variant="subtitle2"
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {formatCurrency(totals.totalOwed, 'USD')}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  mb: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                Outstanding
              </Typography>
              <Typography 
                variant="subtitle2"
                sx={{ 
                  fontWeight: 600,
                  color: isOutstanding ? 'warning.main' : isInCredit ? 'info.main' : 'success.main',
                }}
              >
                {formatCurrency(Math.abs(totals.outstanding), 'USD')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </ListItem>
    </Grow>
  );
};

// Stats summary component
const StatsSummary = ({ stats, isExpanded, onToggle, isMobile }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        mb: 2,
      }}
    >
      <Box
        onClick={onToggle}
        sx={{
          p: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.soft',
              width: 40,
              height: 40,
              color: 'primary.main',
            }}
          >
            <TrendingUpIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.2 }}>
              Team Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {stats.totalEmployees} team members • {stats.needingAttention} need attention
            </Typography>
          </Box>
        </Box>
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>

      <Collapse in={isExpanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'primary.soft',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  <GroupIcon sx={{ fontSize: '1.25rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {stats.totalEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Total Members
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'warning.soft',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'warning.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  <WarningIcon sx={{ fontSize: '1.25rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {stats.needingAttention}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Need Attention
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'error.soft',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'error.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  <MoneyIcon sx={{ fontSize: '1.25rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" color="error.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {formatCurrency(stats.totalOwed, 'USD')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Total Owed
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'success.soft',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'success.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: '1.25rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" color="success.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {formatCurrency(stats.totalPaid, 'USD')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Total Paid
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
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
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dailyRate: '',
  });

  // Memoized calculations
  const totalStats = useMemo(() => ({
    totalEmployees: employees.length,
    needingAttention: employees.filter(emp => calculateEmployeeTotals(emp.id).outstanding > 0).length,
    totalOwed: employees.reduce((sum, emp) => sum + calculateEmployeeTotals(emp.id).totalOwed, 0),
    totalPaid: employees.reduce((sum, emp) => sum + calculateEmployeeTotals(emp.id).totalPaid, 0),
  }), [employees, calculateEmployeeTotals]);

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
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
  }, [employees, sortBy, filterStatus, calculateEmployeeTotals]);

  // Pull to refresh for mobile
  const handleRefresh = useCallback(async () => {
    if (isMobile) {
      setIsRefreshing(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setTimeout(() => {
        setIsRefreshing(false);
        setSnackbar({ open: true, message: 'Data refreshed!', severity: 'success' });
      }, 1500);
    }
  }, [isMobile]);

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
      
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSnackbar({ open: true, message: 'Error saving employee. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting, isInitialized, editingEmployee, updateEmployee, addEmployee, handleCloseDialog]);

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
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        await deleteEmployee(employee.id);
        setSnackbar({ open: true, message: 'Employee deleted successfully!', severity: 'success' });
        
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      } catch (error) {
        console.error('Delete error:', error);
        setSnackbar({ open: true, message: 'Error deleting employee. Please try again.', severity: 'error' });
      }
    }
    handleMenuClose();
  }, [deleteEmployee, handleMenuClose]);

  if (loading && !isInitialized) {
    return (
      <Box sx={{ px: isMobile ? 1 : 3, py: isMobile ? 1 : 2, width: '100%' }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 4 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={12} md={6} lg={4} xl={3} key={item}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile-optimized header */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderRadius: 0,
          mb: 0,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '100%' }}>
          <Box 
            sx={{ 
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                }}
              >
                <PersonIcon />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography 
                  variant="h6" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    color: 'text.primary',
                    lineHeight: 1.2,
                  }}
                >
                  Team
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                  }}
                >
                  {totalStats.totalEmployees} {totalStats.totalEmployees === 1 ? 'member' : 'members'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TextField
                placeholder="Search team members..."
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'background.paper',
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                  },
                }}
                sx={{ 
                  maxWidth: 300,
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Filter">
                  <IconButton
                    onClick={() => setShowFilters(!showFilters)}
                    color={showFilters ? 'primary' : 'default'}
                    sx={{ 
                      bgcolor: showFilters ? 'primary.soft' : 'transparent',
                      border: '1px solid',
                      borderColor: showFilters ? 'primary.main' : 'divider',
                      '&:hover': {
                        bgcolor: showFilters ? 'primary.soft' : 'action.hover',
                      },
                    }}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="View stats">
                  <IconButton
                    onClick={() => setShowStats(!showStats)}
                    color={showStats ? 'primary' : 'default'}
                    sx={{ 
                      bgcolor: showStats ? 'primary.soft' : 'transparent',
                      border: '1px solid',
                      borderColor: showStats ? 'primary.main' : 'divider',
                      '&:hover': {
                        bgcolor: showStats ? 'primary.soft' : 'action.hover',
                      },
                    }}
                  >
                    <TrendingUpIcon />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    bgcolor: 'success.main',
                    '&:hover': { bgcolor: 'success.dark' },
                    display: { xs: 'none', sm: 'flex' },
                  }}
                >
                  Add Member
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Filter Controls */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: isMobile ? 2 : 3, mb: 2, borderRadius: isMobile ? 0 : 2 }}>
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            spacing={2} 
            alignItems={isMobile ? 'stretch' : 'center'}
            justifyContent="center"
          >
            <TextField
              select
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="medium"
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? 'auto' : 200 }}
            >
              <MenuItem value="all">All Employees</MenuItem>
              <MenuItem value="outstanding">Outstanding Payments</MenuItem>
              <MenuItem value="paid">Paid Up</MenuItem>
            </TextField>
            <TextField
              select
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="medium"
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? 'auto' : 200 }}
            >
              <MenuItem value="name">Name (A-Z)</MenuItem>
              <MenuItem value="rate">Daily Rate (High to Low)</MenuItem>
              <MenuItem value="outstanding">Outstanding Amount</MenuItem>
            </TextField>
            {(filterStatus !== 'all' || sortBy !== 'name') && (
              <Button
                startIcon={<ClearIcon />}
                onClick={() => {
                  setFilterStatus('all');
                  setSortBy('name');
                }}
                size="medium"
                variant="outlined"
              >
                Clear
              </Button>
            )}
          </Stack>
        </Paper>
      </Collapse>

      {/* Pull to Refresh Indicator */}
      {isMobile && isRefreshing && (
        <Box sx={{ position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 1300 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Employees List/Grid */}
      <Box 
        sx={{ 
          px: isMobile ? 1 : 3, 
          pb: isMobile ? 8 : 4,
          height: '100%',
          width: '100%',
        }}
      >
        {filteredAndSortedEmployees.length === 0 ? (
          <Fade in timeout={900}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, mt: 2 }}>
              <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                {filterStatus !== 'all' ? 'No employees match your filter' : 'No employees yet'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                {filterStatus !== 'all' ? 'Try adjusting your filter settings above' : 'Add your first employee to get started with tracking payments and work schedules'}
              </Typography>
              {filterStatus === 'all' && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  color="success"
                  sx={{ px: 4, py: 1.5 }}
                >
                  Add Your First Employee
                </Button>
              )}
            </Paper>
          </Fade>
        ) : isMobile ? (
          // Mobile list view
          <List sx={{ p: 0, mt: 1 }}>
            {filteredAndSortedEmployees.map((employee, index) => {
              const totals = calculateEmployeeTotals(employee.id);
              return (
                <EmployeeListItem
                  key={employee.id}
                  employee={employee}
                  totals={totals}
                  onViewDetails={handleViewDetails}
                  onMenuClick={handleMenuClick}
                  isMobile={isMobile}
                  index={index}
                />
              );
            })}
          </List>
        ) : (
          // Desktop grid view
          <Grid 
            container 
            spacing={2}
            sx={{ 
              mt: 1,
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexGrow: 1,
            }}
          >
            {filteredAndSortedEmployees.map((employee, index) => {
              const totals = calculateEmployeeTotals(employee.id);
              return (
                <Grid 
                  item 
                  xs={12} 
                  sm={12} 
                  md={6} 
                  lg={4} 
                  xl={3}
                  key={employee.id}
                  sx={{
                    display: 'flex',
                    width: '100%',
                  }}
                >
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <EmployeeCard
                      employee={employee}
                      totals={totals}
                      onViewDetails={handleViewDetails}
                      onMenuClick={handleMenuClick}
                      onCardClick={() => handleViewDetails(employee)}
                      isMobile={isMobile}
                      index={index}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Floating Action Button */}
      <Zoom in={true}>
        <Box
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Fab
            color="primary"
            aria-label="add employee"
            onClick={() => handleOpenDialog()}
            disabled={submitting}
            sx={{
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' },
              width: 56,
              height: 56,
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
          </Fab>
        </Box>
      </Zoom>

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
            minWidth: 180,
          }
        }}
      >
        <MenuItem onClick={() => handleViewDetails(selectedEmployeeForMenu)} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedEmployeeForMenu)} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedEmployeeForMenu)} sx={{ color: 'error.main', py: 1.5 }}>
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
        PaperProps={{
          sx: {
            borderRadius: isMobile ? '16px 16px 0 0' : 2,
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '90vh' : '80vh',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Employee Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              disabled={submitting}
              autoFocus
              size="medium"
            />
            <TextField
              label="Daily Rate"
              type="number"
              value={formData.dailyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: e.target.value }))}
              fullWidth
              required
              disabled={submitting}
              size="medium"
              InputProps={{
                startAdornment: (
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    {settings?.currency === 'GBP' ? '£' : '$'}
                  </Typography>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={submitting} size="large">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.dailyRate || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
            size="large"
          >
            {submitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Add Employee'}
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