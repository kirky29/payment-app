import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Container,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ViewModule as ViewModuleIcon,
  ViewWeek as ViewWeekIcon,
  ViewList as ViewListIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

const Calendar = () => {
  const { 
    employees, 
    workDays, 
    payments, 
    addWorkDay, 
    addPayment, 
    deleteWorkDay, 
    deletePayment, 
    markWorkDayAsPaid,
    unmarkWorkDayAsPaid,
    settings 
  } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [openWorkDayDialog, setOpenWorkDayDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editingWorkDay, setEditingWorkDay] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [workDayForm, setWorkDayForm] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    dailyRate: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    notes: '',
  });

  // Add new state for view mode
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', or 'list'

  // Add touch handling for month navigation
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '';
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayWorkDays = workDays.filter(day => day.date === dateStr);
    const dayPayments = payments.filter(payment => payment.date === dateStr);
    return { workDays: dayWorkDays, payments: dayPayments };
  };

  const getEmployeeById = (id) => {
    return employees.find(emp => emp.id === id);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setWorkDayForm(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
    setPaymentForm(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
  };

  const handleWorkDaySubmit = async () => {
    if (!workDayForm.employeeId || !workDayForm.date || !workDayForm.dailyRate) return;

    const workDayData = {
      employeeId: workDayForm.employeeId,
      date: workDayForm.date,
      dailyRate: parseFloat(workDayForm.dailyRate),
      notes: workDayForm.notes.trim(),
    };

    if (editingWorkDay) {
      // Update existing work day
      await updateWorkDay(editingWorkDay.id, workDayData);
    } else {
      // Add new work day
      await addWorkDay(workDayData);
    }

    setOpenWorkDayDialog(false);
    setEditingWorkDay(null);
    setWorkDayForm({
      employeeId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      dailyRate: '',
      notes: '',
    });
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.employeeId || !paymentForm.date || !paymentForm.amount) return;

    const paymentData = {
      employeeId: paymentForm.employeeId,
      date: paymentForm.date,
      amount: parseFloat(paymentForm.amount),
      notes: paymentForm.notes.trim(),
    };

    if (editingPayment) {
      // Update existing payment
      await updatePayment(editingPayment.id, paymentData);
    } else {
      // Add new payment
      await addPayment(paymentData);
    }

    setOpenPaymentDialog(false);
    setEditingPayment(null);
    setPaymentForm({
      employeeId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      notes: '',
    });
  };

  const handleEditWorkDay = (workDay) => {
    setEditingWorkDay(workDay);
    setWorkDayForm({
      employeeId: workDay.employeeId,
      date: workDay.date,
      dailyRate: workDay.dailyRate?.toString() || (workDay.hours ? (workDay.hours * (getEmployeeById(workDay.employeeId)?.dailyRate || 0)).toString() : ''),
      notes: workDay.notes || '',
    });
    setOpenWorkDayDialog(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      employeeId: payment.employeeId,
      date: payment.date,
      amount: payment.amount.toString(),
      notes: payment.notes || '',
    });
    setOpenPaymentDialog(true);
  };

  const handleDeleteWorkDay = async (workDay) => {
    if (window.confirm('Are you sure you want to delete this work day?')) {
      await deleteWorkDay(workDay.id);
    }
  };

  const handleDeletePayment = async (payment) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      await deletePayment(payment.id);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getMonthStats = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthWorkDays = workDays.filter(day => {
      const dayDate = new Date(day.date);
      return isSameMonth(dayDate, currentDate);
    });
    const monthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return isSameMonth(paymentDate, currentDate);
    });

    const totalDays = monthWorkDays.length;
    const totalPayments = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOwed = monthWorkDays.reduce((sum, day) => {
      const employee = getEmployeeById(day.employeeId);
      if (day.dailyRate !== undefined) {
        return sum + (day.dailyRate || 0);
      } else {
        return sum + ((day.hours || 0) * (employee?.dailyRate || 0));
      }
    }, 0);

    return { totalDays, totalPayments, totalOwed, workDaysCount: monthWorkDays.length, paymentsCount: monthPayments.length };
  };

  const monthStats = getMonthStats();

  // Handle view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Get days based on current view mode
  const getDays = () => {
    switch (viewMode) {
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case 'list':
        return getDaysInMonth().filter(date => {
          const events = getEventsForDate(date);
          return events.workDays.length > 0 || events.payments.length > 0;
        });
      default:
        return getDaysInMonth();
    }
  };

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

    if (isLeftSwipe) {
      setCurrentDate(addMonths(currentDate, 1));
    }
    if (isRightSwipe) {
      setCurrentDate(addMonths(currentDate, -1));
    }
  };

  // Add new function to handle marking a work day as paid
  const handleMarkAsPaid = async (workDay) => {
    if (window.confirm(`Mark ${getEmployeeById(workDay.employeeId)?.name}'s work day as paid?`)) {
      const paymentData = {
        paidDate: new Date().toISOString(),
        paymentMethod: 'Manual',
        paymentNotes: 'Marked as paid from calendar view'
      };
      await markWorkDayAsPaid(workDay.id, paymentData);
    }
  };

  // Add new function to handle unmarking a work day as paid
  const handleUnmarkAsPaid = async (workDay) => {
    if (window.confirm(`Unmark ${getEmployeeById(workDay.employeeId)?.name}'s work day as paid?`)) {
      await unmarkWorkDayAsPaid(workDay.id);
    }
  };

  // Updated WorkDayCard component
  const WorkDayCard = ({ workDay, employee }) => {
    const isPaid = workDay.isPaid;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
      <Paper
        elevation={3}
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isPaid ? 'success.light' : 'warning.light',
          background: isPaid 
            ? 'linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 100%)'
            : 'linear-gradient(145deg, #fff8e1 0%, #ffe0b2 100%)',
          width: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: isPaid ? 'success.main' : 'warning.main',
                boxShadow: 3,
                border: '2px solid',
                borderColor: isPaid ? 'success.light' : 'warning.light',
              }}
            >
              {getInitials(employee?.name || '')}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                {employee?.name}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1 
                }}
              >
                <WorkIcon sx={{ fontSize: '0.9rem' }} />
                {workDay.hours ? `${workDay.hours} hours` : '1 day'} • 
                <strong>{formatCurrency(workDay.dailyRate, settings.currency)}</strong>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip
              label={isPaid ? 'Paid' : 'Unpaid'}
              color={isPaid ? 'success' : 'warning'}
              icon={isPaid ? <PaymentIcon /> : <WorkIcon />}
              sx={{ 
                minWidth: 100,
                fontWeight: 600,
                boxShadow: 1,
                '& .MuiChip-icon': {
                  fontSize: '1.1rem'
                }
              }}
            />
            {!isMobile && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5 
                }}
              >
                <CalendarIcon sx={{ fontSize: '0.9rem' }} />
                {format(new Date(workDay.date), 'MMM d, yyyy')}
              </Typography>
            )}
          </Box>
        </Box>

        {isPaid && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            mb: 2,
            p: 1.5,
            bgcolor: 'success.light',
            borderRadius: '12px',
            color: 'success.dark',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <PaymentIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Paid on {format(new Date(workDay.paidDate), 'MMMM d, yyyy')}
              {workDay.paymentMethod && ` via ${workDay.paymentMethod}`}
            </Typography>
          </Box>
        )}

        {workDay.notes && (
          <Box sx={{ 
            mb: 2,
            p: 1.5,
            bgcolor: 'background.paper',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {workDay.notes}
            </Typography>
          </Box>
        )}

        <Box sx={{ 
          display: 'flex', 
          gap: 1.5, 
          justifyContent: 'flex-end',
          borderTop: '1px solid',
          borderColor: isPaid ? 'success.light' : 'warning.light',
          pt: 2,
          mt: 2
        }}>
          {!isPaid ? (
            <Button
              size="medium"
              startIcon={<PaymentIcon />}
              onClick={() => handleMarkAsPaid(workDay)}
              color="success"
              variant="contained"
              sx={{ 
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Mark as Paid
            </Button>
          ) : (
            <Button
              size="medium"
              startIcon={<WorkIcon />}
              onClick={() => handleUnmarkAsPaid(workDay)}
              color="warning"
              variant="outlined"
              sx={{ 
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              Unmark as Paid
            </Button>
          )}
          <IconButton
            size="medium"
            onClick={() => handleEditWorkDay(workDay)}
            sx={{ 
              color: 'primary.main',
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'primary.lighter'
              }
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="medium"
            onClick={() => handleDeleteWorkDay(workDay)}
            sx={{ 
              color: 'error.main',
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'error.lighter'
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                mb: { xs: 0.5, sm: 1 },
              }}
            >
              Work Calendar
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Track work days and payments
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Button
              variant="outlined"
              onClick={() => setCurrentDate(new Date())}
              sx={{
                minWidth: { xs: 'auto', sm: '120px' },
                px: { xs: 1, sm: 2 },
              }}
            >
              Today
            </Button>
            <IconButton
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Calendar Grid */}
      <Paper 
        sx={{ 
          p: { xs: 1, sm: 2 },
          mb: { xs: 2, sm: 3 },
          overflowX: 'hidden',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              textAlign: 'center',
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
        </Box>

        <Grid container spacing={1}>
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid item xs={12/7} key={day}>
              <Typography 
                align="center" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'text.secondary',
                }}
              >
                {isSmallMobile ? day.charAt(0) : day}
              </Typography>
            </Grid>
          ))}

          {/* Calendar Days */}
          {getDaysInMonth().map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const { workDays, payments } = getEventsForDate(date);
            const hasEvents = workDays.length > 0 || payments.length > 0;

            return (
              <Grid item xs={12/7} key={dateStr}>
                <Paper
                  elevation={isSelected ? 8 : hasEvents ? 2 : 0}
                  onClick={() => handleDateClick(date)}
                  sx={{
                    p: { xs: 0.5, sm: 1 },
                    height: { xs: 60, sm: 80 },
                    cursor: 'pointer',
                    position: 'relative',
                    borderRadius: 1,
                    border: 1,
                    borderColor: isToday ? 'primary.main' : 'transparent',
                    bgcolor: isSelected ? 'primary.light' : 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <Typography 
                    align="center"
                    sx={{ 
                      fontWeight: isToday ? 700 : 400,
                      color: isSelected ? 'primary.contrastText' : 'text.primary',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    {format(date, 'd')}
                  </Typography>
                  
                  {/* Event Indicators */}
                  {hasEvents && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        bottom: { xs: 2, sm: 4 },
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      {workDays.map((workDay) => (
                        <Box
                          key={workDay.id}
                          sx={{
                            width: { xs: 4, sm: 6 },
                            height: { xs: 4, sm: 6 },
                            borderRadius: '50%',
                            bgcolor: workDay.isPaid ? 'success.main' : 'warning.main',
                          }}
                        />
                      ))}
                      {payments.map((payment) => (
                        <Box
                          key={payment.id}
                          sx={{
                            width: { xs: 4, sm: 6 },
                            height: { xs: 4, sm: 6 },
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Event List for Selected Date */}
      {selectedDate && (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<WorkIcon />}
                onClick={() => setOpenWorkDayDialog(true)}
                size={isSmallMobile ? "small" : "medium"}
              >
                Add Work Day
              </Button>
              <Button
                variant="contained"
                startIcon={<PaymentIcon />}
                onClick={() => setOpenPaymentDialog(true)}
                size={isSmallMobile ? "small" : "medium"}
              >
                Add Payment
              </Button>
            </Box>
          </Box>

          {/* Work Days */}
          {workDays.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Work Days
              </Typography>
              <Stack spacing={1}>
                {workDays.map((workDay) => (
                  <WorkDayCard
                    key={workDay.id}
                    workDay={workDay}
                    employee={getEmployeeById(workDay.employeeId)}
                    onEdit={() => handleEditWorkDay(workDay)}
                    onDelete={() => handleDeleteWorkDay(workDay)}
                    onTogglePaid={() => handleToggleWorkDayPaid(workDay)}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Payments */}
          {payments.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Payments
              </Typography>
              <Stack spacing={1}>
                {payments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    employee={getEmployeeById(payment.employeeId)}
                    onEdit={() => handleEditPayment(payment)}
                    onDelete={() => handleDeletePayment(payment)}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {workDays.length === 0 && payments.length === 0 && (
            <Box 
              sx={{ 
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body1">
                No events for this date
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Dialogs */}
      <Dialog open={openWorkDayDialog} onClose={() => setOpenWorkDayDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingWorkDay ? 'Edit Work Day' : 'Add Work Day'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Employee</InputLabel>
              <Select
                value={workDayForm.employeeId}
                onChange={(e) => {
                  const selectedEmployee = employees.find(emp => emp.id === e.target.value);
                  setWorkDayForm({ 
                    ...workDayForm, 
                    employeeId: e.target.value,
                    dailyRate: selectedEmployee?.dailyRate?.toString() || ''
                  });
                }}
                label="Employee"
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name} - {formatCurrency(employee.dailyRate, settings.currency)}/day
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={workDayForm.date}
              onChange={(e) => setWorkDayForm({ ...workDayForm, date: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Daily Rate"
              type="number"
              value={workDayForm.dailyRate}
              onChange={(e) => setWorkDayForm({ ...workDayForm, dailyRate: e.target.value })}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.5 }}
            />
            <TextField
              fullWidth
              label="Notes (optional)"
              value={workDayForm.notes}
              onChange={(e) => setWorkDayForm({ ...workDayForm, notes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenWorkDayDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleWorkDaySubmit} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
              },
            }}
          >
            {editingWorkDay ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingPayment ? 'Edit Payment' : 'Add Payment'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Employee</InputLabel>
              <Select
                value={paymentForm.employeeId}
                onChange={(e) => setPaymentForm({ ...paymentForm, employeeId: e.target.value })}
                label="Employee"
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={paymentForm.date}
              onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>{getCurrencySymbol(settings.currency)}</Typography>,
              }}
            />
            <TextField
              fullWidth
              label="Notes (optional)"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenPaymentDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handlePaymentSubmit} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
              },
            }}
          >
            {editingPayment ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 