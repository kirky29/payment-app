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
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
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

  return (
    <Box>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Button onClick={() => navigateMonth(-1)} variant="outlined" size="small">&lt;</Button>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <Button onClick={() => navigateMonth(1)} variant="outlined" size="small">&gt;</Button>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Chip label={`Work Days: ${monthStats.workDaysCount}`} color="primary" icon={<WorkIcon />} />
          <Chip label={`Total Owed: ${formatCurrency(monthStats.totalOwed, settings.currency)}`} color="warning" icon={<TrendingUpIcon />} />
          <Chip label={`Total Paid: ${formatCurrency(monthStats.totalPayments, settings.currency)}`} color="success" icon={<PaymentIcon />} />
        </Box>
      </Paper>

      {/* Calendar Grid */}
      <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3, mb: 3 }}>
        {/* Weekday headers */}
        <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <Typography key={day} align="center" variant="subtitle2" color="text.secondary">{day}</Typography>
          ))}
        </Box>
        {/* Days grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(4, 1fr)',
              md: 'repeat(7, 1fr)'
            },
            gap: 1,
          }}
        >
          {getDaysInMonth().map(date => {
            const { workDays: dayWorkDays, payments: dayPayments } = getEventsForDate(date);
            const isPaid = dayWorkDays.length > 0 && dayWorkDays.every(wd => wd.isPaid);
            const isUnpaid = dayWorkDays.length > 0 && dayWorkDays.some(wd => !wd.isPaid);
            const isCurrentDay = isToday(date);
            return (
              <Paper
                key={date.toISOString()}
                elevation={isCurrentDay ? 6 : 1}
                sx={{
                  p: 1,
                  minHeight: 90,
                  border: isCurrentDay ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  background:
                    isPaid ? 'linear-gradient(135deg, #e0f7fa 0%, #b2dfdb 100%)' :
                    isUnpaid ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' :
                    'white',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 6 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
                onClick={() => handleDateClick(date)}
                aria-label={`Day ${format(date, 'do MMMM yyyy')}${isCurrentDay ? ', today' : ''}`}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {format(date, 'd')}
                  </Typography>
                  {isCurrentDay && (
                    <Chip label="Today" color="info" size="small" sx={{ ml: 0.5 }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mb: 0.5 }}>
                  {dayWorkDays.map(wd => {
                    const emp = getEmployeeById(wd.employeeId);
                    return (
                      <Avatar
                        key={wd.id}
                        sx={{ width: 24, height: 24, fontSize: 12, bgcolor: wd.isPaid ? 'success.main' : 'warning.main' }}
                        title={emp?.name || ''}
                      >
                        {emp ? getInitials(emp.name) : '?'}
                      </Avatar>
                    );
                  })}
                </Box>
                {isPaid && <Chip label="Paid" color="success" size="small" icon={<PaymentIcon fontSize="small" />} />}
                {isUnpaid && <Chip label="Unpaid" color="warning" size="small" icon={<WorkIcon fontSize="small" />} />}
                {dayWorkDays.length === 0 && <Typography variant="caption" color="text.secondary">No work</Typography>}
              </Paper>
            );
          })}
        </Box>
        {/* Legend */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label="Paid" color="success" size="small" icon={<PaymentIcon fontSize="small" />} />
          <Chip label="Unpaid" color="warning" size="small" icon={<WorkIcon fontSize="small" />} />
          <Chip label="Today" color="info" size="small" />
        </Box>
      </Paper>

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
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {format(selectedDate, 'EEEE, do MMMM yyyy')}
          </Typography>
          
          {(() => {
            const events = getEventsForDate(selectedDate);
            const hasEvents = events.workDays.length > 0 || events.payments.length > 0;
            
            if (!hasEvents) {
              return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No events for this date
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add work days or payments to track activities
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenWorkDayDialog(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                        },
                      }}
                    >
                      Add Work Day
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenPaymentDialog(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                        },
                      }}
                    >
                      Add Payment
                    </Button>
                  </Box>
                </Box>
              );
            }

            return (
              <Grid container spacing={3}>
                {/* Work Days */}
                {events.workDays.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'orange.700' }}>
                      Work Days ({events.workDays.length})
                    </Typography>
                    <List>
                      {events.workDays.map((workDay) => {
                        const employee = getEmployeeById(workDay.employeeId);
                        return (
                          <Card 
                            key={workDay.id} 
                            sx={{ 
                              mb: 2, 
                              borderRadius: 2,
                              border: workDay.isPaid ? '2px solid #4caf50' : 'none',
                              backgroundColor: workDay.isPaid ? 'rgba(76, 175, 80, 0.04)' : 'inherit'
                            }}
                          >
                            <CardContent sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    sx={{ 
                                      mr: 2,
                                      background: workDay.isPaid 
                                        ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      width: 40,
                                      height: 40,
                                      fontSize: '1rem',
                                    }}
                                  >
                                    {getInitials(employee?.name)}
                                  </Avatar>
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {employee?.name}
                                      </Typography>
                                      {workDay.isPaid && (
                                        <Chip
                                          label="PAID"
                                          size="small"
                                          color="success"
                                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {workDay.dailyRate !== undefined ? '1 day' : `${workDay.hours || 0} hours`} • {formatCurrency(workDay.dailyRate !== undefined ? parseFloat(workDay.dailyRate) : (workDay.hours || 0) * (employee?.dailyRate || 0), settings.currency)}
                                    </Typography>
                                    {workDay.isPaid && (
                                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                        Paid {format(new Date(workDay.paidDate), 'EEEE, do MMMM yyyy')} • {workDay.paymentMethod}
                                      </Typography>
                                    )}
                                    {workDay.notes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {workDay.notes}
                                      </Typography>
                                    )}
                                    {workDay.paymentNotes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                        Payment notes: {workDay.paymentNotes}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditWorkDay(workDay)}
                                    sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteWorkDay(workDay)}
                                    sx={{ backgroundColor: 'rgba(244,67,54,0.1)' }}
                                  >
                                    <DeleteIcon fontSize="small" color="error" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </List>
                  </Grid>
                )}

                {/* Payments */}
                {events.payments.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'green.700' }}>
                      Payments ({events.payments.length})
                    </Typography>
                    <List>
                      {events.payments.map((payment) => {
                        const employee = getEmployeeById(payment.employeeId);
                        return (
                          <Card key={payment.id} sx={{ mb: 2, borderRadius: 2 }}>
                            <CardContent sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    sx={{ 
                                      mr: 2,
                                      background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                      width: 40,
                                      height: 40,
                                      fontSize: '1rem',
                                    }}
                                  >
                                    {getInitials(employee?.name)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                      {employee?.name}
                                    </Typography>
                                    <Typography variant="body1" color="success.main" sx={{ fontWeight: 700 }}>
                                      {formatCurrency(payment.amount, settings.currency)}
                                    </Typography>
                                    {payment.notes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {payment.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditPayment(payment)}
                                    sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeletePayment(payment)}
                                    sx={{ backgroundColor: 'rgba(244,67,54,0.1)' }}
                                  >
                                    <DeleteIcon fontSize="small" color="error" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </List>
                  </Grid>
                )}
              </Grid>
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