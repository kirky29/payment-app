import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Fab,
  Collapse,
  Slide,
  Grow,
  Fade,
  Badge,
  Divider,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Switch,
  Alert,
  Skeleton,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  Today as TodayIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SwipeLeft as SwipeLeftIcon,
  SwipeRight as SwipeRightIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, isSameMonth, parseISO } from 'date-fns';
import { formatCurrency } from '../utils/currency';

// Custom hook for touch gestures
const useTouchGestures = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
      if (navigator.vibrate) navigator.vibrate(50);
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight]);

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

// Enhanced calendar day component
const CalendarDay = ({ 
  date, 
  isCurrentMonth, 
  isSelected, 
  isToday, 
  workDays, 
  payments, 
  onClick,
  isMobile 
}) => {
  const theme = useTheme();
  const hasEvents = workDays.length > 0 || payments.length > 0;
  const totalEvents = workDays.length + payments.length;

  return (
    <Box
      className="calendar-day"
      onClick={() => onClick(date)}
      sx={{
        position: 'relative',
        aspectRatio: '1',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: isMobile ? 1 : 0.5,
        bgcolor: isSelected ? 'primary.light' : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isSelected ? 'primary.main' : 'action.hover',
          transform: 'scale(1.02)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
        display: 'flex',
        flexDirection: 'column',
        p: isMobile ? 0.5 : 1,
        minHeight: isMobile ? '60px' : '80px',
      }}
    >
      {/* Date number */}
      <Typography
        className="calendar-day-number"
        sx={{
          fontSize: isMobile ? '0.875rem' : '1rem',
          fontWeight: isToday ? 700 : isCurrentMonth ? 500 : 300,
          color: !isCurrentMonth ? 'text.disabled' : 
                 isToday ? 'primary.main' : 'text.primary',
          textAlign: 'center',
          mb: 0.5,
          lineHeight: 1,
        }}
      >
        {format(date, 'd')}
      </Typography>

      {/* Event indicators */}
      {hasEvents && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {/* Work day indicators */}
          {workDays.slice(0, isMobile ? 2 : 3).map((workDay, idx) => (
            <Box
              key={`wd-${idx}`}
              sx={{
                height: isMobile ? '3px' : '4px',
                bgcolor: workDay.isPaid ? 'success.main' : 'warning.main',
                borderRadius: '2px',
                opacity: 0.8,
              }}
            />
          ))}
          
          {/* Payment indicators */}
          {payments.slice(0, isMobile ? 1 : 2).map((payment, idx) => (
            <Box
              key={`p-${idx}`}
              sx={{
                height: isMobile ? '3px' : '4px',
                bgcolor: 'info.main',
                borderRadius: '2px',
                opacity: 0.8,
              }}
            />
          ))}
          
          {/* More events indicator */}
          {totalEvents > (isMobile ? 3 : 5) && (
            <Typography
              variant="caption"
              sx={{
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                color: 'text.secondary',
                textAlign: 'center',
                lineHeight: 1,
              }}
            >
              +{totalEvents - (isMobile ? 3 : 5)}
            </Typography>
          )}
        </Box>
      )}

      {/* Today indicator */}
      {isToday && (
        <Box
          sx={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: isMobile ? '6px' : '8px',
            height: isMobile ? '6px' : '8px',
            bgcolor: 'primary.main',
            borderRadius: '50%',
          }}
        />
      )}
    </Box>
  );
};

// Month statistics component
const MonthStats = ({ stats, isExpanded, onToggle, isMobile }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={isMobile ? 0 : 1}
      sx={{
        mb: 2,
        borderRadius: isMobile ? 0 : 2,
        border: isMobile ? 'none' : '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box
        onClick={onToggle}
        sx={{
          p: isMobile ? 2 : 3,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Month Summary
          </Typography>
        </Box>
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: isMobile ? 2 : 3, pt: 0 }}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {stats.workDaysCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Work Days
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                  {formatCurrency(stats.totalPayments, 'GBP')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paid
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  color={stats.totalOwed - stats.totalPayments > 0 ? 'warning.main' : 'success.main'} 
                  sx={{ fontWeight: 700 }}
                >
                  {formatCurrency(stats.totalOwed - stats.totalPayments, 'GBP')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Outstanding
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [openWorkDayDialog, setOpenWorkDayDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editingWorkDay, setEditingWorkDay] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showMonthStats, setShowMonthStats] = useState(false);

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
    paymentMethod: 'Cash',
    notes: '',
  });

  // Touch gesture handlers
  const handleSwipeLeft = useCallback(() => {
    setCurrentDate(addMonths(currentDate, 1));
  }, [currentDate]);

  const handleSwipeRight = useCallback(() => {
    setCurrentDate(subMonths(currentDate, 1));
  }, [currentDate]);

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures(
    handleSwipeLeft,
    handleSwipeRight
  );

  // Memoized calculations
  const monthStats = useMemo(() => {
    const currentMonthWorkDays = workDays.filter(wd => {
      const workDayDate = parseISO(wd.date);
      return isSameMonth(workDayDate, currentDate);
    });
    
    const currentMonthPayments = payments.filter(p => {
      const paymentDate = parseISO(p.date);
      return isSameMonth(paymentDate, currentDate);
    });

    return {
      workDaysCount: currentMonthWorkDays.length,
      totalOwed: currentMonthWorkDays.reduce((sum, wd) => sum + wd.dailyRate, 0),
      totalPayments: currentMonthPayments.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [workDays, payments, currentDate]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startWeek = startOfWeek(start);
    const endWeek = endOfWeek(end);
    return eachDayOfInterval({ start: startWeek, end: endWeek });
  }, [currentDate]);

  const getEventsForDate = useCallback((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayWorkDays = workDays.filter(day => day.date === dateStr);
    const dayPayments = payments.filter(payment => payment.date === dateStr);
    return { workDays: dayWorkDays, payments: dayPayments };
  }, [workDays, payments]);

  const getEmployeeById = useCallback((id) => {
    return employees.find(emp => emp.id === id);
  }, [employees]);

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    setWorkDayForm(prev => ({ ...prev, date: dateStr }));
    setPaymentForm(prev => ({ ...prev, date: dateStr }));
    
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, []);

  const handleAddWorkDay = useCallback(() => {
    setSelectedDate(selectedDate || new Date());
    const dateStr = format(selectedDate || new Date(), 'yyyy-MM-dd');
    setWorkDayForm({
      employeeId: '',
      date: dateStr,
      dailyRate: '',
      notes: '',
    });
    setEditingWorkDay(null);
    setOpenWorkDayDialog(true);
  }, [selectedDate]);

  const handleAddPayment = useCallback(() => {
    setSelectedDate(selectedDate || new Date());
    const dateStr = format(selectedDate || new Date(), 'yyyy-MM-dd');
    setPaymentForm({
      employeeId: '',
      date: dateStr,
      amount: '',
      paymentMethod: 'Cash',
      notes: '',
    });
    setEditingPayment(null);
    setOpenPaymentDialog(true);
  }, [selectedDate]);

  const handleSubmitWorkDay = async () => {
    if (!workDayForm.employeeId || !workDayForm.date) return;
    
    const employee = getEmployeeById(workDayForm.employeeId);
    const workDayData = {
      employeeId: workDayForm.employeeId,
      date: workDayForm.date,
      dailyRate: parseFloat(workDayForm.dailyRate) || employee?.dailyRate || 0,
      notes: workDayForm.notes,
      isPaid: false,
    };

    try {
      await addWorkDay(workDayData);
      setOpenWorkDayDialog(false);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (error) {
      console.error('Error adding work day:', error);
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentForm.employeeId || !paymentForm.date || !paymentForm.amount) return;
    
    const paymentData = {
      employeeId: paymentForm.employeeId,
      date: paymentForm.date,
      amount: parseFloat(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      notes: paymentForm.notes,
    };

    try {
      await addPayment(paymentData);
      setOpenPaymentDialog(false);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  return (
    <Box 
      className="calendar-container"
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Mobile-optimized header */}
      <Paper
        className="calendar-header"
        elevation={isMobile ? 0 : 1}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderRadius: isMobile ? 0 : 2,
          mb: isMobile ? 0 : 2,
          border: isMobile ? 'none' : '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box 
          sx={{ 
            px: isMobile ? 2 : 3,
            py: isMobile ? 1.5 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.paper',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <IconButton
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'baseline',
            gap: 1,
            flex: 1,
            justifyContent: 'center'
          }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                fontSize: isMobile ? '1.5rem' : '2rem',
                color: 'text.primary',
              }}
            >
              {format(currentDate, 'MMMM')}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 400,
                fontSize: isMobile ? '1.1rem' : '1.4rem',
                color: 'text.secondary',
              }}
            >
              {format(currentDate, 'yyyy')}
            </Typography>
          </Box>

          <IconButton
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Month stats toggle */}
        <MonthStats 
          stats={monthStats}
          isExpanded={showMonthStats}
          onToggle={() => setShowMonthStats(!showMonthStats)}
          isMobile={isMobile}
        />
      </Paper>

      {/* Calendar grid */}
      <Box sx={{ flex: 1, px: isMobile ? 1 : 2 }}>
        {/* Weekday headers */}
        <Grid 
          container 
          sx={{ 
            mb: 1,
            bgcolor: 'background.paper',
            borderRadius: isMobile ? 1 : 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
            <Grid 
              item 
              xs={12/7} 
              key={day}
              sx={{ 
                textAlign: 'center',
                py: isMobile ? 1 : 1.5,
                borderRight: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderRight: 'none',
                },
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar days grid */}
        <Grid 
          container 
          className="calendar-grid"
          sx={{ 
            gap: isMobile ? 0.5 : 1,
            justifyContent: 'center',
          }}
        >
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);
            const { workDays: dayWorkDays, payments: dayPayments } = getEventsForDate(date);

            return (
              <Grid 
                item 
                xs={12/7} 
                key={format(date, 'yyyy-MM-dd')}
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <CalendarDay
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  isSelected={isSelected}
                  isToday={isTodayDate}
                  workDays={dayWorkDays}
                  payments={dayPayments}
                  onClick={handleDateClick}
                  isMobile={isMobile}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Full Screen Day Details */}
      {selectedDate && (
        <Dialog
          fullScreen
          open={Boolean(selectedDate)}
          onClose={() => setSelectedDate(null)}
          TransitionComponent={Slide}
          TransitionProps={{
            direction: "up"
          }}
        >
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar sx={{ minHeight: isMobile ? '56px' : '64px' }}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setSelectedDate(null)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
              <Button 
                color="inherit" 
                startIcon={<WorkIcon />}
                onClick={handleAddWorkDay}
                sx={{ mr: 1 }}
                size={isMobile ? 'small' : 'medium'}
              >
                {isMobile ? 'Work' : 'Add Work'}
              </Button>
              <Button 
                color="inherit" 
                startIcon={<PaymentIcon />}
                onClick={handleAddPayment}
                size={isMobile ? 'small' : 'medium'}
              >
                {isMobile ? 'Pay' : 'Add Payment'}
              </Button>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ p: isMobile ? 1 : 2, pb: isMobile ? 80 : 2 }}>
            {(() => {
              const { workDays: selectedWorkDays, payments: selectedPayments } = getEventsForDate(selectedDate);
              
              if (selectedWorkDays.length === 0 && selectedPayments.length === 0) {
                return (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <EventIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography color="text.secondary" variant="h6">
                      No events scheduled
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Tap the buttons above to add work days or payments
                    </Typography>
                  </Box>
                );
              }

              return (
                <Stack spacing={3}>
                  {selectedWorkDays.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Work Days ({selectedWorkDays.length})
                      </Typography>
                      <List sx={{ p: 0 }}>
                        {selectedWorkDays.map((workDay, idx) => {
                          const employee = getEmployeeById(workDay.employeeId);
                          return (
                            <ListItem
                              key={idx}
                              sx={{
                                bgcolor: 'background.paper',
                                mb: 1,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: workDay.isPaid ? 'success.main' : 'warning.main',
                                borderLeft: '4px solid',
                                borderLeftColor: workDay.isPaid ? 'success.main' : 'warning.main',
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: workDay.isPaid ? 'success.main' : 'warning.main' }}>
                                  <PersonIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={employee?.name || 'Unknown Employee'}
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatCurrency(workDay.dailyRate, settings.currency)} per day
                                    </Typography>
                                    {workDay.notes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        {workDay.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color={workDay.isPaid ? "success" : "warning"}
                                  onClick={() => workDay.isPaid ? unmarkWorkDayAsPaid(workDay.id) : markWorkDayAsPaid(workDay.id)}
                                  startIcon={workDay.isPaid ? <CheckCircleIcon /> : <WarningIcon />}
                                >
                                  {workDay.isPaid ? 'Paid' : 'Mark Paid'}
                                </Button>
                              </ListItemSecondaryAction>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  )}

                  {selectedPayments.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Payments ({selectedPayments.length})
                      </Typography>
                      <List sx={{ p: 0 }}>
                        {selectedPayments.map((payment, idx) => {
                          const employee = getEmployeeById(payment.employeeId);
                          return (
                            <ListItem
                              key={idx}
                              sx={{
                                bgcolor: 'background.paper',
                                mb: 1,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'info.main',
                                borderLeft: '4px solid',
                                borderLeftColor: 'info.main',
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'info.main' }}>
                                  <AttachMoneyIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={employee?.name || 'Unknown Employee'}
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatCurrency(payment.amount, settings.currency)}
                                      {payment.paymentMethod && ` • ${payment.paymentMethod}`}
                                    </Typography>
                                    {payment.notes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        {payment.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  )}
                </Stack>
              );
            })()}
          </Box>
        </Dialog>
      )}

      {/* Work Day Dialog */}
      <Dialog 
        open={openWorkDayDialog} 
        onClose={() => setOpenWorkDayDialog(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          className: isMobile ? 'mobile-dialog' : '',
          sx: {
            borderRadius: isMobile ? '16px 16px 0 0' : 2,
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '90vh' : '80vh',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add Work Day
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              select
              label="Employee"
              value={workDayForm.employeeId}
              onChange={(e) => setWorkDayForm(prev => ({ ...prev, employeeId: e.target.value }))}
              fullWidth
              required
              size="medium"
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Date"
              value={workDayForm.date}
              onChange={(e) => setWorkDayForm(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="medium"
            />
            <TextField
              type="number"
              label="Daily Rate"
              value={workDayForm.dailyRate}
              onChange={(e) => setWorkDayForm(prev => ({ ...prev, dailyRate: e.target.value }))}
              fullWidth
              placeholder="Leave empty to use employee's default rate"
              size="medium"
              InputProps={{
                startAdornment: (
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    {settings.currency === 'GBP' ? '£' : '$'}
                  </Typography>
                ),
              }}
            />
            <TextField
              label="Notes"
              value={workDayForm.notes}
              onChange={(e) => setWorkDayForm(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              size="medium"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenWorkDayDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleSubmitWorkDay} variant="contained" size="large">
            Add Work Day
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={openPaymentDialog} 
        onClose={() => setOpenPaymentDialog(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          className: isMobile ? 'mobile-dialog' : '',
          sx: {
            borderRadius: isMobile ? '16px 16px 0 0' : 2,
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '90vh' : '80vh',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add Payment
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              select
              label="Employee"
              value={paymentForm.employeeId}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, employeeId: e.target.value }))}
              fullWidth
              required
              size="medium"
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Date"
              value={paymentForm.date}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="medium"
            />
            <TextField
              type="number"
              label="Amount"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
              fullWidth
              required
              size="medium"
              InputProps={{
                startAdornment: (
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    {settings.currency === 'GBP' ? '£' : '$'}
                  </Typography>
                ),
              }}
            />
            <TextField
              select
              label="Payment Method"
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
              fullWidth
              size="medium"
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Check">Check</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="PayPal">PayPal</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Notes"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              size="medium"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenPaymentDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleSubmitPayment} variant="contained" color="success" size="large">
            Add Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 