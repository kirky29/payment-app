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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
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

  // Add touch start position for swipe detection
  const [touchStart, setTouchStart] = useState(null);

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

  // Handle touch events for swipe navigation
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) { // minimum swipe distance
      navigateMonth(diff > 0 ? 1 : -1);
    }
    
    setTouchStart(null);
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
      {/* Header Section with View Mode Toggle */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigateMonth(-1)}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={() => navigateMonth(1)}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="month" aria-label="month view">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="week" aria-label="week view">
              <ViewWeekIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Chip label={`Work Days: ${monthStats.workDaysCount}`} color="primary" icon={<WorkIcon />} />
          <Chip label={`Total Owed: ${formatCurrency(monthStats.totalOwed, settings.currency)}`} color="warning" icon={<TrendingUpIcon />} />
          <Chip label={`Total Paid: ${formatCurrency(monthStats.totalPayments, settings.currency)}`} color="success" icon={<PaymentIcon />} />
        </Box>
      </Paper>

      {/* Calendar View based on viewMode */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {viewMode === 'list' ? (
          // List View
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            {getDays().map(date => {
              const { workDays: dayWorkDays } = getEventsForDate(date);
              return dayWorkDays.length > 0 && (
                <Box key={date.toISOString()} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {format(date, 'EEEE, do MMMM yyyy')}
                  </Typography>
                  {dayWorkDays.map(workDay => (
                    <WorkDayCard
                      key={workDay.id}
                      workDay={workDay}
                      employee={getEmployeeById(workDay.employeeId)}
                    />
                  ))}
                </Box>
              );
            })}
          </Paper>
        ) : (
          // Grid View (Month or Week)
          <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
            <Box sx={{ 
              display: { xs: 'none', sm: 'grid' }, 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              mb: 1 
            }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <Typography key={day} align="center" variant="subtitle2" color="text.secondary">
                  {day}
                </Typography>
              ))}
            </Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: viewMode === 'week' ? 'repeat(7, 1fr)' : 'repeat(2, 1fr)',
                sm: viewMode === 'week' ? 'repeat(7, 1fr)' : 'repeat(4, 1fr)',
                md: 'repeat(7, 1fr)'
              },
              gap: 1,
            }}>
              {getDays().map(date => {
                const { workDays: dayWorkDays } = getEventsForDate(date);
                const isPaid = dayWorkDays.length > 0 && dayWorkDays.every(wd => wd.isPaid);
                const isUnpaid = dayWorkDays.length > 0 && dayWorkDays.some(wd => !wd.isPaid);
                const isCurrentDay = isToday(date);
                
                return (
                  <Paper
                    key={date.toISOString()}
                    elevation={isCurrentDay ? 6 : 1}
                    sx={{
                      p: 1,
                      minHeight: viewMode === 'week' ? 120 : 90,
                      border: isCurrentDay ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      background: isPaid 
                        ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                        : isUnpaid 
                          ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                          : 'white',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 6,
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}
                    onClick={() => handleDateClick(date)}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5, 
                      mb: 0.5,
                      width: '100%',
                      justifyContent: 'center' 
                    }}>
                      <Typography 
                        variant={viewMode === 'week' ? 'h6' : 'subtitle2'} 
                        sx={{ fontWeight: 700 }}
                      >
                        {format(date, viewMode === 'week' ? 'EEE d' : 'd')}
                      </Typography>
                      {isCurrentDay && (
                        <Chip label="Today" color="info" size="small" sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.5, 
                      flexWrap: 'wrap', 
                      justifyContent: 'center', 
                      mb: 0.5 
                    }}>
                      {dayWorkDays.map(wd => {
                        const emp = getEmployeeById(wd.employeeId);
                        return (
                          <Avatar
                            key={wd.id}
                            sx={{ 
                              width: viewMode === 'week' ? 32 : 24, 
                              height: viewMode === 'week' ? 32 : 24, 
                              fontSize: viewMode === 'week' ? 14 : 12,
                              bgcolor: wd.isPaid ? 'success.main' : 'warning.main'
                            }}
                            title={emp?.name || ''}
                          >
                            {emp ? getInitials(emp.name) : '?'}
                          </Avatar>
                        );
                      })}
                    </Box>
                    {viewMode === 'week' && dayWorkDays.length > 0 && (
                      <Box sx={{ mt: 'auto', width: '100%' }}>
                        <Typography variant="caption" align="center" display="block">
                          {dayWorkDays.length} work day{dayWorkDays.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Floating Action Button */}
      <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1200 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenWorkDayDialog(true)}
          sx={{
            borderRadius: '50%',
            minWidth: 56,
            minHeight: 56,
            boxShadow: 4,
            fontSize: 0,
            p: 0,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            },
          }}
          aria-label="Add Work Day"
        >
          <AddIcon fontSize="large" />
        </Button>
      </Box>

      {/* Selected Date Details */}
      {selectedDate && (
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 3,
            mt: 3,
            maxWidth: '100%',
            mx: 'auto'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {format(selectedDate, 'EEEE, do MMMM yyyy')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenWorkDayDialog(true)}
            >
              Add Work Day
            </Button>
          </Box>
          
          {(() => {
            const events = getEventsForDate(selectedDate);
            const hasEvents = events.workDays.length > 0 || events.payments.length > 0;
            
            if (!hasEvents) {
              return (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  px: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No events for this date
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add work days or payments to track activities
                  </Typography>
                </Box>
              );
            }

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {events.workDays.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                      Work Days ({events.workDays.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {events.workDays.map(workDay => (
                        <WorkDayCard
                          key={workDay.id}
                          workDay={workDay}
                          employee={getEmployeeById(workDay.employeeId)}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {events.payments.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                      Payments ({events.payments.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {events.payments.map(payment => (
                        <Paper
                          key={payment.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'success.light',
                            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {getEmployeeById(payment.employeeId)?.name}
                            </Typography>
                            <Typography variant="h6" color="success.dark">
                              {formatCurrency(payment.amount, settings.currency)}
                            </Typography>
                          </Box>
                          {payment.notes && (
                            <Typography variant="body2" color="text.secondary">
                              {payment.notes}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })()}
        </Paper>
      )}

      {/* Add/Edit Work Day Dialog */}
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

      {/* Add/Edit Payment Dialog */}
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