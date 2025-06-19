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
  AspectRatio,
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
    <Box>
      {/* Header Section */}
      <Grow in timeout={500}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3 },
            mb: 3,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <EventIcon sx={{ mr: 1 }} />
                Work Calendar
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Track work days and payments
              </Typography>
            </Box>
            {!isMobile && (
              <Button
                variant="contained"
                size="medium"
                startIcon={<TodayIcon />}
                onClick={() => setCurrentDate(new Date())}
                sx={{
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Back to Today
              </Button>
            )}
          </Box>

          {/* Month Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <IconButton
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              size="medium"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)', transform: 'scale(1.1)' },
                mr: 2,
                width: 40,
                height: 40,
                boxShadow: 2,
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <Box sx={{ textAlign: 'center', minWidth: 180 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: 'primary.main',
                  mb: 0.5,
                }}
              >
                {format(currentDate, 'MMMM yyyy')}
              </Typography>
              {isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <SwipeLeftIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Swipe to navigate
                  </Typography>
                  <SwipeRightIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                </Box>
              )}
            </Box>
            
            <IconButton
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              size="medium"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)', transform: 'scale(1.1)' },
                ml: 2,
                width: 40,
                height: 40,
                boxShadow: 2,
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* Month Stats - Collapsible on Mobile */}
          <Box>
            <Button
              onClick={() => setShowMonthStats(!showMonthStats)}
              sx={{ 
                mb: 1, 
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'space-between',
                width: '100%',
                textTransform: 'none',
                color: 'primary.main',
                fontWeight: 600,
                py: 0.5,
              }}
              endIcon={showMonthStats ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              Month Statistics
            </Button>
            
            <Collapse in={!isMobile || showMonthStats}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  icon={<WorkIcon />} 
                  label={`${monthStats.workDaysCount} Work Days`} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip 
                  icon={<PaymentIcon />} 
                  label={`${formatCurrency(monthStats.totalOwed, settings.currency)} Owed`} 
                  color="warning" 
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip 
                  icon={<PaymentIcon />} 
                  label={`${formatCurrency(monthStats.totalPayments, settings.currency)} Paid`} 
                  color="success" 
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Stack>
            </Collapse>
          </Box>
        </Paper>
      </Grow>

      {/* Calendar Grid */}
      <Fade in timeout={700}>
        <Paper 
          sx={{ 
            p: { xs: 1.5, sm: 2 },
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Grid container spacing={{ xs: 0.5, sm: 1 }}>
            {/* Weekday Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs={12/7} key={day}>
                <Box sx={{ p: { xs: 0.5, sm: 1 }, textAlign: 'center' }}>
                  <Typography 
                    variant="caption"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      color: 'primary.main',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {isSmallMobile ? day.charAt(0) : day.slice(0, 3)}
                  </Typography>
                </Box>
              </Grid>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth().map((date, index) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isToday = isSameDay(date, new Date());
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const { workDays: dayWorkDays, payments: dayPayments } = getEventsForDate(date);
              const hasEvents = dayWorkDays.length > 0 || dayPayments.length > 0;
              const totalEvents = dayWorkDays.length + dayPayments.length;

              return (
                <Grow in timeout={300 + (index * 20)} key={dateStr}>
                  <Grid item xs={12/7}>
                    <AspectRatio ratio="1">
                      <Card
                        elevation={isSelected ? 8 : hasEvents ? 3 : 1}
                        onClick={() => handleDateClick(date)}
                        sx={{
                          cursor: 'pointer',
                          position: 'relative',
                          border: 2,
                          borderColor: isToday ? 'primary.main' : 
                                     isSelected ? 'primary.light' : 
                                     'transparent',
                          bgcolor: isSelected ? 'primary.light' : 
                                   !isCurrentMonth ? 'grey.50' : 
                                   hasEvents ? 'action.hover' :
                                   'background.paper',
                          opacity: isCurrentMonth ? 1 : 0.5,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: 6,
                            borderColor: 'primary.main',
                          },
                          borderRadius: 2,
                          height: '100%',
                          width: '100%',
                        }}
                      >
                        <CardContent sx={{ 
                          p: { xs: 0.5, sm: 1 }, 
                          '&:last-child': { pb: { xs: 0.5, sm: 1 } },
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <Typography 
                            variant="h6"
                            sx={{ 
                              fontWeight: isToday ? 800 : 600,
                              color: isSelected ? 'primary.contrastText' : 
                                     isToday ? 'primary.main' : 
                                     'text.primary',
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              lineHeight: 1,
                            }}
                          >
                            {format(date, 'd')}
                          </Typography>
                          
                          {/* Event Indicators */}
                          {hasEvents && (
                            <Box 
                              sx={{ 
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 0.25,
                                flexWrap: 'wrap',
                              }}
                            >
                              {totalEvents <= 3 ? (
                                <>
                                  {dayWorkDays.slice(0, 2).map((workDay, idx) => (
                                    <Box
                                      key={`wd-${idx}`}
                                      sx={{
                                        width: { xs: 4, sm: 6 },
                                        height: { xs: 4, sm: 6 },
                                        borderRadius: '50%',
                                        bgcolor: workDay.isPaid ? 'success.main' : 'warning.main',
                                        boxShadow: 1,
                                      }}
                                    />
                                  ))}
                                  {dayPayments.slice(0, 1).map((payment, idx) => (
                                    <Box
                                      key={`p-${idx}`}
                                      sx={{
                                        width: { xs: 4, sm: 6 },
                                        height: { xs: 4, sm: 6 },
                                        borderRadius: '50%',
                                        bgcolor: 'info.main',
                                        boxShadow: 1,
                                      }}
                                    />
                                  ))}
                                </>
                              ) : (
                                <Badge 
                                  badgeContent={totalEvents} 
                                  color="primary"
                                  sx={{
                                    '& .MuiBadge-badge': {
                                      fontSize: '0.6rem',
                                      minWidth: 14,
                                      height: 14,
                                      padding: '0 2px',
                                    }
                                  }}
                                >
                                  <EventIcon 
                                    fontSize="small" 
                                    sx={{ 
                                      color: 'primary.main',
                                      fontSize: { xs: '0.875rem', sm: '1rem' }
                                    }} 
                                  />
                                </Badge>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </AspectRatio>
                  </Grid>
                </Grow>
              );
            })}
          </Grid>
        </Paper>
      </Fade>

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

      {/* Floating Action Buttons */}
      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 80, right: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Slide direction="up" in timeout={600}>
            <Fab
              color="primary"
              onClick={handleAddWorkDay}
              sx={{ 
                bgcolor: 'warning.main', 
                '&:hover': { 
                  bgcolor: 'warning.dark',
                  transform: 'scale(1.1)',
                },
                width: 56,
                height: 56,
                boxShadow: 4,
                transition: 'all 0.3s ease',
              }}
            >
              <WorkIcon sx={{ fontSize: '1.5rem' }} />
            </Fab>
          </Slide>
          <Slide direction="up" in timeout={700}>
            <Fab
              color="success"
              onClick={handleAddPayment}
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                width: 56,
                height: 56,
                boxShadow: 4,
                transition: 'all 0.3s ease',
              }}
            >
              <PaymentIcon sx={{ fontSize: '1.5rem' }} />
            </Fab>
          </Slide>
        </Box>
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