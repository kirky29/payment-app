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
      width: '100%', 
      height: '100vh', 
      maxWidth: '100%', 
      overflow: 'hidden',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column'
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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 500,
              fontSize: { xs: '2rem', sm: '2.4rem' },
              color: 'text.primary',
              mr: 1,
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
        {!isMobile && (
          <Button
            variant="text"
            onClick={() => setCurrentDate(new Date())}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            Today
          </Button>
        )}
      </Box>

      {/* Calendar Grid */}
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
                  minHeight: { xs: 80, sm: 100 },
                }}
              >
                <Box
                  onClick={() => handleDateClick(date)}
                  sx={{
                    height: '100%',
                    p: 1,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
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
                  
                  {/* Events */}
                  <Stack spacing={0.5}>
                    {dayWorkDays.map((workDay, idx) => {
                      const employee = getEmployeeById(workDay.employeeId);
                      return (
                        <Box
                          key={`wd-${idx}`}
                          sx={{
                            bgcolor: workDay.isPaid ? 'success.light' : 'warning.light',
                            color: workDay.isPaid ? 'success.dark' : 'warning.dark',
                            p: 0.5,
                            borderRadius: 0.5,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {employee?.name || 'Work Day'}
                        </Box>
                      );
                    })}
                    {dayPayments.map((payment, idx) => {
                      const employee = getEmployeeById(payment.employeeId);
                      return (
                        <Box
                          key={`p-${idx}`}
                          sx={{
                            bgcolor: 'info.light',
                            color: 'info.dark',
                            p: 0.5,
                            borderRadius: 0.5,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {`${employee?.name || 'Payment'} - ${formatCurrency(payment.amount, settings.currency)}`}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Action Buttons - Fixed at bottom */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Fab
          color="primary"
          onClick={handleAddWorkDay}
          sx={{
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          <WorkIcon />
        </Fab>
        <Fab
          color="secondary"
          onClick={handleAddPayment}
          sx={{
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          <PaymentIcon />
        </Fab>
      </Box>

      {/* Selected Date Details */}
      {selectedDate && (
        <Slide direction="up" in timeout={500}>
          <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  startIcon={<WorkIcon />}
                  onClick={handleAddWorkDay}
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    px: { xs: 2, sm: 3 },
                  }}
                >
                  {isMobile ? 'Work' : 'Work Day'}
                </Button>
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  startIcon={<PaymentIcon />}
                  onClick={handleAddPayment}
                  color="success"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    px: { xs: 2, sm: 3 },
                  }}
                >
                  {isMobile ? 'Pay' : 'Payment'}
                </Button>
              </Box>
            </Box>

            {(() => {
              const { workDays: dayWorkDays, payments: dayPayments } = getEventsForDate(selectedDate);
              
              if (dayWorkDays.length === 0 && dayPayments.length === 0) {
                return (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <EventIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      No events for this date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                      Add work days or payments using the buttons above
                    </Typography>
                  </Box>
                );
              }

              return (
                <Stack spacing={3}>
                  {dayWorkDays.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
                        Work Days ({dayWorkDays.length})
                      </Typography>
                      <Stack spacing={2}>
                        {dayWorkDays.map((workDay) => {
                          const employee = getEmployeeById(workDay.employeeId);
                          return (
                            <Card key={workDay.id} elevation={2} sx={{ borderRadius: 2 }}>
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: workDay.isPaid ? 'success.main' : 'warning.main',
                                      width: 48,
                                      height: 48,
                                      fontSize: '1.125rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {getInitials(employee?.name || '')}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {employee?.name}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                      {formatCurrency(workDay.dailyRate, settings.currency)}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={workDay.isPaid ? 'Paid' : 'Unpaid'}
                                    color={workDay.isPaid ? 'success' : 'warning'}
                                    size="medium"
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                                {workDay.notes && (
                                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                                    {workDay.notes}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}

                  {dayPayments.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                        Payments ({dayPayments.length})
                      </Typography>
                      <Stack spacing={2}>
                        {dayPayments.map((payment) => {
                          const employee = getEmployeeById(payment.employeeId);
                          return (
                            <Card key={payment.id} elevation={2} sx={{ borderRadius: 2 }}>
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: 'success.main',
                                      width: 48,
                                      height: 48,
                                      fontSize: '1.125rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {getInitials(employee?.name || '')}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {employee?.name}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                      {payment.paymentMethod}
                                    </Typography>
                                  </Box>
                                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(payment.amount, settings.currency)}
                                  </Typography>
                                </Box>
                                {payment.notes && (
                                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                                    {payment.notes}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              );
            })()}
          </Paper>
        </Slide>
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