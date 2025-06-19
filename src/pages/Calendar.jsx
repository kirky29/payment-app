import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { formatCurrency } from '../utils/currency';

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

  // Touch handling for swipe navigation
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    if (isRightSwipe) {
      setCurrentDate(addMonths(currentDate, -1));
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '';
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startWeek = startOfWeek(start);
    const endWeek = endOfWeek(end);
    return eachDayOfInterval({ start: startWeek, end: endWeek });
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
    const dateStr = format(date, 'yyyy-MM-dd');
    setWorkDayForm(prev => ({ ...prev, date: dateStr }));
    setPaymentForm(prev => ({ ...prev, date: dateStr }));
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleAddWorkDay = () => {
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
  };

  const handleAddPayment = () => {
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
  };

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
      
      // Add haptic feedback
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
      
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const monthStats = {
    workDaysCount: workDays.filter(wd => {
      const workDayDate = new Date(wd.date);
      return workDayDate.getMonth() === currentDate.getMonth() && 
             workDayDate.getFullYear() === currentDate.getFullYear();
    }).length,
    totalOwed: workDays.filter(wd => {
      const workDayDate = new Date(wd.date);
      return workDayDate.getMonth() === currentDate.getMonth() && 
             workDayDate.getFullYear() === currentDate.getFullYear();
    }).reduce((sum, wd) => sum + wd.dailyRate, 0),
    totalPayments: payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === currentDate.getMonth() && 
             paymentDate.getFullYear() === currentDate.getFullYear();
    }).reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <Box sx={{ 
      width: '100vw', 
      height: '100vh', 
      maxWidth: '100%', 
      overflow: 'hidden',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <IconButton
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
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
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 500,
              fontSize: { xs: '2rem', sm: '2.4rem' },
              color: 'text.primary',
            }}
          >
            {format(currentDate, 'MMMM')}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 400,
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
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
            '&:hover': { color: 'primary.main' }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Calendar Grid */}
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0, // Important for proper flex behavior
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Weekday Headers */}
        <Grid 
          container 
          sx={{ 
            borderBottom: 1,
            borderColor: 'divider',
            py: 0.5,
            bgcolor: 'background.paper',
          }}
        >
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
            <Grid 
              item 
              xs={12/7} 
              key={day}
              sx={{ 
                textAlign: 'center',
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  color: 'text.secondary',
                  fontWeight: 400,
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Days */}
        <Grid 
          container 
          sx={{ 
            flex: 1,
            minHeight: 0,
            bgcolor: 'background.paper',
          }}
        >
          {getDaysInMonth().map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const { workDays: dayWorkDays, payments: dayPayments } = getEventsForDate(date);
            const hasEvents = dayWorkDays.length > 0 || dayPayments.length > 0;

            return (
              <Grid 
                item 
                xs={12/7} 
                key={dateStr}
                sx={{ 
                  borderRight: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  position: 'relative',
                  height: 0,
                  pb: '14.285%', // 100/7 to maintain aspect ratio
                }}
              >
                <Box
                  onClick={() => handleDateClick(date)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    p: 1,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: isToday ? 600 : isCurrentMonth ? 400 : 300,
                      color: !isCurrentMonth ? 'text.disabled' : 
                             isToday ? 'primary.main' : 'text.primary',
                      mb: 0.5,
                    }}
                  >
                    {format(date, 'd')}
                  </Typography>
                  
                  {/* Event Indicators */}
                  {hasEvents && (
                    <Stack spacing={0.5} sx={{ overflow: 'hidden' }}>
                      {dayWorkDays.slice(0, 2).map((workDay, idx) => (
                        <Box
                          key={`wd-${idx}`}
                          sx={{
                            height: '4px',
                            bgcolor: workDay.isPaid ? 'success.main' : 'warning.main',
                            borderRadius: '2px',
                          }}
                        />
                      ))}
                      {dayPayments.slice(0, 1).map((payment, idx) => (
                        <Box
                          key={`p-${idx}`}
                          sx={{
                            height: '4px',
                            bgcolor: 'info.main',
                            borderRadius: '2px',
                          }}
                        />
                      ))}
                      {(dayWorkDays.length + dayPayments.length > 3) && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.6rem',
                            color: 'text.secondary',
                          }}
                        >
                          +{dayWorkDays.length + dayPayments.length - 3} more
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>
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
            <Toolbar>
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
              >
                Work
              </Button>
              <Button 
                color="inherit" 
                startIcon={<PaymentIcon />}
                onClick={handleAddPayment}
              >
                Pay
              </Button>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ p: 2 }}>
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
                    <Typography color="text.secondary">
                      No events scheduled for this day
                    </Typography>
                  </Box>
                );
              }

              return (
                <Stack spacing={3}>
                  {selectedWorkDays.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Work Days
                      </Typography>
                      <Stack spacing={2}>
                        {selectedWorkDays.map((workDay, idx) => {
                          const employee = getEmployeeById(workDay.employeeId);
                          return (
                            <Paper
                              key={idx}
                              elevation={1}
                              sx={{
                                p: 2,
                                borderLeft: 6,
                                borderColor: workDay.isPaid ? 'success.main' : 'warning.main',
                              }}
                            >
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1
                              }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {employee?.name || 'Unknown Employee'}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color={workDay.isPaid ? "success" : "warning"}
                                  onClick={() => workDay.isPaid ? unmarkWorkDayAsPaid(workDay.id) : markWorkDayAsPaid(workDay.id)}
                                >
                                  {workDay.isPaid ? 'Paid' : 'Mark Paid'}
                                </Button>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatCurrency(workDay.dailyRate, settings.currency)} per day
                              </Typography>
                              {workDay.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  {workDay.notes}
                                </Typography>
                              )}
                            </Paper>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}

                  {selectedPayments.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Payments
                      </Typography>
                      <Stack spacing={2}>
                        {selectedPayments.map((payment, idx) => {
                          const employee = getEmployeeById(payment.employeeId);
                          return (
                            <Paper
                              key={idx}
                              elevation={1}
                              sx={{
                                p: 2,
                                borderLeft: 6,
                                borderColor: 'info.main',
                              }}
                            >
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {employee?.name || 'Unknown Employee'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatCurrency(payment.amount, settings.currency)}
                                {payment.paymentMethod && ` • ${payment.paymentMethod}`}
                              </Typography>
                              {payment.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  {payment.notes}
                                </Typography>
                              )}
                            </Paper>
                          );
                        })}
                      </Stack>
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