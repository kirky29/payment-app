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
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  Today as TodayIcon,
  Event as EventIcon,
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
    }
    if (isRightSwipe) {
      setCurrentDate(addMonths(currentDate, -1));
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
    <Box>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: 'primary.main',
            }}
          >
            <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Calendar
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
              startIcon={<TodayIcon />}
              sx={{
                minWidth: { xs: 'auto', sm: '120px' },
                px: { xs: 1, sm: 2 },
              }}
            >
              {isSmallMobile ? '' : 'Today'}
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

        {/* Month Stats */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            icon={<WorkIcon />} 
            label={`${monthStats.workDaysCount} Work Days`} 
            color="primary" 
            variant="outlined"
            size={isSmallMobile ? "small" : "medium"}
          />
          <Chip 
            icon={<PaymentIcon />} 
            label={`${formatCurrency(monthStats.totalOwed, settings.currency)} Owed`} 
            color="warning" 
            variant="outlined"
            size={isSmallMobile ? "small" : "medium"}
          />
          <Chip 
            icon={<PaymentIcon />} 
            label={`${formatCurrency(monthStats.totalPayments, settings.currency)} Paid`} 
            color="success" 
            variant="outlined"
            size={isSmallMobile ? "small" : "medium"}
          />
        </Stack>
      </Paper>

      {/* Calendar Grid */}
      <Paper 
        sx={{ 
          p: { xs: 1, sm: 2 },
          mb: { xs: 2, sm: 3 },
          borderRadius: 2,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: 'center',
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            mb: 2,
            color: 'text.primary',
          }}
        >
          {format(currentDate, 'MMMM yyyy')}
        </Typography>

        <Grid container spacing={0.5}>
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid item xs={12/7} key={day}>
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography 
                  variant="caption"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    color: 'text.secondary',
                  }}
                >
                  {isSmallMobile ? day.charAt(0) : day}
                </Typography>
              </Box>
            </Grid>
          ))}

          {/* Calendar Days */}
          {getDaysInMonth().map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const { workDays: dayWorkDays, payments: dayPayments } = getEventsForDate(date);
            const hasEvents = dayWorkDays.length > 0 || dayPayments.length > 0;

            return (
              <Grid item xs={12/7} key={dateStr}>
                <Card
                  elevation={isSelected ? 4 : hasEvents ? 2 : 0}
                  onClick={() => handleDateClick(date)}
                  sx={{
                    height: { xs: 70, sm: 90 },
                    cursor: 'pointer',
                    position: 'relative',
                    border: 1,
                    borderColor: isToday ? 'primary.main' : isSelected ? 'primary.light' : 'divider',
                    bgcolor: isSelected ? 'primary.light' : 
                             !isCurrentMonth ? 'grey.50' : 
                             'background.paper',
                    opacity: isCurrentMonth ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 0.5, sm: 1 }, '&:last-child': { pb: { xs: 0.5, sm: 1 } } }}>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontWeight: isToday ? 700 : 500,
                        color: isSelected ? 'primary.contrastText' : 
                               isToday ? 'primary.main' : 
                               'text.primary',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        textAlign: 'center',
                        mb: 0.5,
                      }}
                    >
                      {format(date, 'd')}
                    </Typography>
                    
                    {/* Event Indicators */}
                    {hasEvents && (
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          right: 4,
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 0.25,
                          flexWrap: 'wrap',
                        }}
                      >
                        {dayWorkDays.slice(0, 3).map((workDay, idx) => (
                          <Box
                            key={`wd-${idx}`}
                            sx={{
                              width: { xs: 4, sm: 6 },
                              height: { xs: 4, sm: 6 },
                              borderRadius: '50%',
                              bgcolor: workDay.isPaid ? 'success.main' : 'warning.main',
                            }}
                          />
                        ))}
                        {dayPayments.slice(0, 2).map((payment, idx) => (
                          <Box
                            key={`p-${idx}`}
                            sx={{
                              width: { xs: 4, sm: 6 },
                              height: { xs: 4, sm: 6 },
                              borderRadius: '50%',
                              bgcolor: 'info.main',
                            }}
                          />
                        ))}
                        {(dayWorkDays.length + dayPayments.length) > 5 && (
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                            +{(dayWorkDays.length + dayPayments.length) - 5}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Selected Date Details */}
      {selectedDate && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<WorkIcon />}
                onClick={handleAddWorkDay}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Work Day
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<PaymentIcon />}
                onClick={handleAddPayment}
                color="success"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Payment
              </Button>
            </Box>
          </Box>

          {(() => {
            const { workDays: dayWorkDays, payments: dayPayments } = getEventsForDate(selectedDate);
            
            if (dayWorkDays.length === 0 && dayPayments.length === 0) {
              return (
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  <EventIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1">No events for this date</Typography>
                  <Typography variant="body2">Tap the buttons above to add work days or payments</Typography>
                </Box>
              );
            }

            return (
              <Stack spacing={2}>
                {dayWorkDays.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Work Days ({dayWorkDays.length})
                    </Typography>
                    <Stack spacing={1}>
                      {dayWorkDays.map((workDay) => {
                        const employee = getEmployeeById(workDay.employeeId);
                        return (
                          <Card key={workDay.id} elevation={1}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: workDay.isPaid ? 'success.main' : 'warning.main' }}>
                                  {getInitials(employee?.name || '')}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {employee?.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatCurrency(workDay.dailyRate, settings.currency)}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={workDay.isPaid ? 'Paid' : 'Unpaid'}
                                  color={workDay.isPaid ? 'success' : 'warning'}
                                  size="small"
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {dayPayments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Payments ({dayPayments.length})
                    </Typography>
                    <Stack spacing={1}>
                      {dayPayments.map((payment) => {
                        const employee = getEmployeeById(payment.employeeId);
                        return (
                          <Card key={payment.id} elevation={1}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'success.main' }}>
                                  {getInitials(employee?.name || '')}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {employee?.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {payment.paymentMethod}
                                  </Typography>
                                </Box>
                                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(payment.amount, settings.currency)}
                                </Typography>
                              </Box>
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
      )}

      {/* Floating Action Buttons */}
      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 80, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Fab
            color="primary"
            onClick={handleAddWorkDay}
            sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
          >
            <WorkIcon />
          </Fab>
          <Fab
            color="success"
            onClick={handleAddPayment}
          >
            <PaymentIcon />
          </Fab>
        </Box>
      )}

      {/* Work Day Dialog */}
      <Dialog open={openWorkDayDialog} onClose={() => setOpenWorkDayDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Work Day</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Employee"
              value={workDayForm.employeeId}
              onChange={(e) => setWorkDayForm(prev => ({ ...prev, employeeId: e.target.value }))}
              fullWidth
              required
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
            />
            <TextField
              type="number"
              label="Daily Rate"
              value={workDayForm.dailyRate}
              onChange={(e) => setWorkDayForm(prev => ({ ...prev, dailyRate: e.target.value }))}
              fullWidth
              placeholder="Leave empty to use employee's default rate"
            />
            <TextField
              label="Notes"
              value={workDayForm.notes}
              onChange={(e) => setWorkDayForm(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWorkDayDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitWorkDay} variant="contained">Add Work Day</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Employee"
              value={paymentForm.employeeId}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, employeeId: e.target.value }))}
              fullWidth
              required
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
            />
            <TextField
              type="number"
              label="Amount"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              select
              label="Payment Method"
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
              fullWidth
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
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitPayment} variant="contained" color="success">Add Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 