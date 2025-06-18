import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Box,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

const EmployeeDetails = ({ employee, open, onClose }) => {
  const { 
    workDays, 
    payments, 
    addWorkDay, 
    addPayment, 
    deleteWorkDay, 
    deletePayment,
    calculateEmployeeTotals,
    updateEmployee,
    markWorkDayAsPaid,
    unmarkWorkDayAsPaid,
    markMultipleWorkDaysAsPaid,
    settings
  } = useApp();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState(0);
  const [openWorkDayDialog, setOpenWorkDayDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openMarkPaidDialog, setOpenMarkPaidDialog] = useState(false);
  const [editingWorkDay, setEditingWorkDay] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedWorkDays, setSelectedWorkDays] = useState([]);
  const [expandedPaymentDate, setExpandedPaymentDate] = useState(null);

  const [workDayForm, setWorkDayForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    dailyRate: employee?.dailyRate?.toString() || '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    paymentMethod: 'Cash',
    notes: '',
  });

  const [editForm, setEditForm] = useState({
    name: employee?.name || '',
    dailyRate: employee?.dailyRate?.toString() || '',
  });

  const [markPaidForm, setMarkPaidForm] = useState({
    paidDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Cash',
    paymentNotes: '',
  });

  const employeeWorkDays = workDays.filter(day => day.employeeId === employee?.id);
  const employeePayments = payments.filter(payment => payment.employeeId === employee?.id);
  const totals = calculateEmployeeTotals(employee?.id);
  const progress = totals.totalOwed > 0 ? (totals.totalPaid / totals.totalOwed) * 100 : 0;

  // Group payments by payment date and method
  const getPaymentsByDate = () => {
    const paymentGroups = {};
    
    // Add work day payments
    employeeWorkDays.forEach(workDay => {
      if (workDay.isPaid && workDay.paidDate) {
        const dateKey = workDay.paidDate;
        const methodKey = workDay.paymentMethod || 'Unknown';
        const groupKey = `${dateKey}_${methodKey}`;
        
        if (!paymentGroups[groupKey]) {
          paymentGroups[groupKey] = {
            date: dateKey,
            paymentMethod: methodKey,
            paymentNotes: workDay.paymentNotes,
            workDays: [],
            otherPayments: [],
            totalAmount: 0
          };
        }
        const amount = workDay.paidAmount || (workDay.dailyRate !== undefined ? workDay.dailyRate : (workDay.hours || 0) * employee.dailyRate);
        paymentGroups[groupKey].workDays.push({
          ...workDay,
          amount
        });
        paymentGroups[groupKey].totalAmount += amount;
      }
    });
    
    // Add other payments (legacy) - each as a separate entry
    employeePayments.forEach((payment, index) => {
      const dateKey = payment.date;
      const methodKey = payment.paymentMethod || 'Other Payment';
      // Create unique key for each payment to ensure separation
      const groupKey = `other_${dateKey}_${methodKey}_${payment.id || index}`;
      
      paymentGroups[groupKey] = {
        date: dateKey,
        paymentMethod: methodKey,
        paymentNotes: payment.notes,
        workDays: [],
        otherPayments: [payment],
        totalAmount: payment.amount,
        isOtherPayment: true
      };
    });
    
    return Object.values(paymentGroups).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handlePaymentDateToggle = (groupKey) => {
    setExpandedPaymentDate(expandedPaymentDate === groupKey ? null : groupKey);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '';
  };

  const handleWorkDaySubmit = async () => {
    if (!workDayForm.date || !workDayForm.dailyRate) return;

    const workDayData = {
      employeeId: employee.id,
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
      date: format(new Date(), 'yyyy-MM-dd'),
      dailyRate: employee?.dailyRate?.toString() || '',
      notes: '',
    });
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.date || !paymentForm.amount) return;

    const paymentData = {
      employeeId: employee.id,
      date: paymentForm.date,
      amount: parseFloat(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
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
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      paymentMethod: 'Cash',
      notes: '',
    });
  };

  const handleEditSubmit = async () => {
    if (!editForm.name || !editForm.dailyRate) return;

    await updateEmployee(employee.id, {
      name: editForm.name.trim(),
      dailyRate: parseFloat(editForm.dailyRate),
    });

    setOpenEditDialog(false);
  };

  const handleEditWorkDay = (workDay) => {
    setEditingWorkDay(workDay);
    setWorkDayForm({
      date: workDay.date,
      dailyRate: workDay.dailyRate?.toString() || (workDay.hours ? (workDay.hours * employee.dailyRate).toString() : employee.dailyRate.toString()),
      notes: workDay.notes || '',
    });
    setOpenWorkDayDialog(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      date: payment.date,
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod || 'Cash',
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

  const handleWorkDaySelection = (workDayId, isSelected) => {
    if (isSelected) {
      setSelectedWorkDays(prev => [...prev, workDayId]);
    } else {
      setSelectedWorkDays(prev => prev.filter(id => id !== workDayId));
    }
  };

  const handleSelectAllUnpaidWorkDays = () => {
    const unpaidWorkDays = employeeWorkDays.filter(day => !day.isPaid);
    const allUnpaidIds = unpaidWorkDays.map(day => day.id);
    setSelectedWorkDays(allUnpaidIds);
  };

  const handleClearSelection = () => {
    setSelectedWorkDays([]);
  };

  const handleMarkSelectedAsPaid = () => {
    if (selectedWorkDays.length === 0) return;
    setOpenMarkPaidDialog(true);
  };

  const handleMarkPaidSubmit = async () => {
    if (selectedWorkDays.length === 0) return;

    const paymentData = {
      paidDate: markPaidForm.paidDate,
      paymentMethod: markPaidForm.paymentMethod,
      paymentNotes: markPaidForm.paymentNotes,
    };

    try {
      if (selectedWorkDays.length === 1) {
        await markWorkDayAsPaid(selectedWorkDays[0], paymentData);
      } else {
        await markMultipleWorkDaysAsPaid(selectedWorkDays, paymentData);
      }
      
      setOpenMarkPaidDialog(false);
      setSelectedWorkDays([]);
      setMarkPaidForm({
        paidDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'Cash',
        paymentNotes: '',
      });
    } catch (error) {
      console.error('Error marking work days as paid:', error);
    }
  };

  const handleUnmarkAsPaid = async (workDayId) => {
    if (window.confirm('Are you sure you want to unmark this work day as paid?')) {
      try {
        await unmarkWorkDayAsPaid(workDayId);
      } catch (error) {
        console.error('Error unmarking work day as paid:', error);
      }
    }
  };

  if (!employee) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        fullScreen={isSmallMobile}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  mr: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem',
                  fontWeight: 600,
                }}
              >
                {getInitials(employee.name)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {employee.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatCurrency(employee.dailyRate, settings.currency)}/day
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => setOpenEditDialog(true)}
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Financial Summary */}
          <Paper sx={{ p: 3, mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(totals.totalOwed, settings.currency)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Owed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(totals.totalPaid, settings.currency)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Paid
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totals.outstanding < 0 
                      ? formatCurrency(Math.abs(totals.outstanding), settings.currency)
                      : formatCurrency(totals.outstanding, settings.currency)
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {totals.outstanding < 0 ? 'In Credit' : 'Outstanding'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {employeeWorkDays.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Work Days
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Progress Bar */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Payment Progress
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {totals.outstanding < 0 ? '100%' : `${Math.round(progress)}%`}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={totals.outstanding < 0 ? 100 : Math.min(progress, 100)} 
                sx={{ 
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: totals.outstanding < 0 || progress >= 100 ? 'linear-gradient(90deg, #4caf50, #66bb6a)' : 'linear-gradient(90deg, #ff9800, #ffb74d)',
                    borderRadius: 4,
                  }
                }} 
              />
            </Box>
          </Paper>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant={isMobile ? "fullWidth" : "standard"}
            >
              <Tab label="Work Days" icon={<WorkIcon />} iconPosition="start" />
              <Tab label="Payments" icon={<PaymentIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Work Days ({employeeWorkDays.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenWorkDayDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      },
                    }}
                  >
                    Add Work Day
                  </Button>
                </Box>

                {/* Payment Controls */}
                {employeeWorkDays.filter(day => !day.isPaid).length > 0 && selectedWorkDays.length > 0 && (
                  <Card sx={{ mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {selectedWorkDays.length} selected
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleSelectAllUnpaidWorkDays}
                            disabled={employeeWorkDays.filter(day => !day.isPaid).length === 0}
                          >
                            Select All Unpaid
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleClearSelection}
                            disabled={selectedWorkDays.length === 0}
                          >
                            Clear Selection
                          </Button>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<PaymentIcon />}
                          onClick={handleMarkSelectedAsPaid}
                          sx={{
                            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                            },
                          }}
                        >
                          Mark as Paid ({selectedWorkDays.length})
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {employeeWorkDays.length === 0 ? (
                  <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                      <WorkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No work days recorded
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add work days to track days and calculate payments
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenWorkDayDialog(true)}
                      >
                        Add First Work Day
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <List>
                    {employeeWorkDays
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((workDay) => (
                        <Card 
                          key={workDay.id} 
                          sx={{ 
                            mb: 2, 
                            borderRadius: 2,
                            border: workDay.isPaid ? '2px solid #4caf50' : selectedWorkDays.includes(workDay.id) ? '2px solid #1976d2' : 'none',
                            backgroundColor: workDay.isPaid ? 'rgba(76, 175, 80, 0.04)' : 'inherit'
                          }}
                        >
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {!workDay.isPaid && (
                                  <Checkbox
                                    checked={selectedWorkDays.includes(workDay.id)}
                                    onChange={(e) => handleWorkDaySelection(workDay.id, e.target.checked)}
                                    sx={{ mr: 1 }}
                                  />
                                )}
                                <CalendarIcon sx={{ mr: 2, color: workDay.isPaid ? 'success.main' : 'primary.main' }} />
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                      {format(new Date(workDay.date), 'EEEE, do MMMM yyyy')}
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
                                    {workDay.dailyRate !== undefined ? '1 day' : `${workDay.hours || 0} hours`} • {formatCurrency(workDay.dailyRate !== undefined ? parseFloat(workDay.dailyRate) : (workDay.hours || 0) * employee.dailyRate, settings.currency)}
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
                                {workDay.isPaid && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUnmarkAsPaid(workDay.id)}
                                    sx={{ backgroundColor: 'rgba(255,152,0,0.1)' }}
                                    title="Unmark as paid"
                                  >
                                    <RadioButtonUncheckedIcon fontSize="small" color="warning" />
                                  </IconButton>
                                )}
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
                      ))}
                  </List>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Payment History ({getPaymentsByDate().length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenPaymentDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      },
                    }}
                  >
                    Add Other Payment
                  </Button>
                </Box>

                {getPaymentsByDate().length === 0 ? (
                  <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                      <PaymentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No payments recorded
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Mark work days as paid to see payment history here
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <List>
                    {getPaymentsByDate().map((paymentGroup) => (
                      <Card key={`${paymentGroup.date}_${paymentGroup.paymentMethod}`} sx={{ mb: 2, borderRadius: 2 }}>
                        <CardContent sx={{ py: 2 }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                            onClick={() => handlePaymentDateToggle(`${paymentGroup.date}_${paymentGroup.paymentMethod}`)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ mr: 2, color: 'success.main', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                                {getCurrencySymbol(settings.currency)}
                              </Typography>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {format(new Date(paymentGroup.date), 'EEEE, do MMMM yyyy')}
                                </Typography>
                                <Typography variant="body1" color="success.main" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(paymentGroup.totalAmount, settings.currency)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {paymentGroup.paymentMethod} • {paymentGroup.workDays.length + paymentGroup.otherPayments.length} item{paymentGroup.workDays.length + paymentGroup.otherPayments.length > 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton size="small">
                              {expandedPaymentDate === `${paymentGroup.date}_${paymentGroup.paymentMethod}` ? 
                                <ExpandLessIcon fontSize="small" /> : 
                                <ExpandMoreIcon fontSize="small" />
                              }
                            </IconButton>
                          </Box>

                          {/* Expanded Details */}
                          {expandedPaymentDate === `${paymentGroup.date}_${paymentGroup.paymentMethod}` && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                              {/* Work Days Paid */}
                              {paymentGroup.workDays.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                                    Work Days Paid ({paymentGroup.workDays.length})
                                  </Typography>
                                  {paymentGroup.workDays.map((workDay) => (
                                    <Box key={workDay.id} sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      py: 1,
                                      px: 2,
                                      backgroundColor: 'rgba(76, 175, 80, 0.04)',
                                      borderRadius: 1,
                                      mb: 1
                                    }}>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {format(new Date(workDay.date), 'EEEE, do MMMM yyyy')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {workDay.dailyRate !== undefined ? '1 day' : `${workDay.hours || 0} hours`}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {formatCurrency(workDay.amount, settings.currency)}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnmarkAsPaid(workDay.id);
                                          }}
                                          sx={{ backgroundColor: 'rgba(244,67,54,0.1)' }}
                                        >
                                          <DeleteIcon fontSize="small" color="error" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              )}

                              {/* Other Payments */}
                              {paymentGroup.otherPayments.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                                    Other Payments ({paymentGroup.otherPayments.length})
                                  </Typography>
                                  {paymentGroup.otherPayments.map((payment) => (
                                    <Box key={payment.id} sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      py: 1,
                                      px: 2,
                                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                      borderRadius: 1,
                                      mb: 1
                                    }}>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          Other Payment • {payment.paymentMethod || 'Unknown'}
                                        </Typography>
                                        {payment.notes && (
                                          <Typography variant="body2" color="text.secondary">
                                            {payment.notes}
                                          </Typography>
                                        )}
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {formatCurrency(payment.amount, settings.currency)}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditPayment(payment);
                                          }}
                                          sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePayment(payment);
                                          }}
                                          sx={{ backgroundColor: 'rgba(244,67,54,0.1)' }}
                                        >
                                          <DeleteIcon fontSize="small" color="error" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              )}

                              {/* Payment Notes */}
                              {paymentGroup.paymentNotes && (
                                <Box sx={{ 
                                  p: 2, 
                                  backgroundColor: 'rgba(0,0,0,0.02)', 
                                  borderRadius: 1,
                                  fontStyle: 'italic'
                                }}>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Payment Notes:</strong> {paymentGroup.paymentNotes}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Floating Action Buttons - Mobile Only */}
        {isSmallMobile && (
          <Box sx={{ position: 'fixed', bottom: 80, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Fab
              color="primary"
              onClick={() => setOpenWorkDayDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                },
              }}
            >
              <WorkIcon />
            </Fab>
            <Fab
              color="primary"
              onClick={() => setOpenPaymentDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                },
              }}
            >
              <PaymentIcon />
            </Fab>
          </Box>
        )}
      </Dialog>

      {/* Add/Edit Work Day Dialog */}
      <Dialog open={openWorkDayDialog} onClose={() => setOpenWorkDayDialog(false)} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingWorkDay ? 'Edit Work Day' : 'Add Work Day'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
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
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingPayment ? 'Edit Other Payment' : 'Add Other Payment'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
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
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                label="Payment Method"
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Check">Check</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="PayPal">PayPal</MenuItem>
                <MenuItem value="Venmo">Venmo</MenuItem>
                <MenuItem value="Zelle">Zelle</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
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

      {/* Edit Employee Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Employee
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Employee Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Daily Rate"
              type="number"
              value={editForm.dailyRate}
              onChange={(e) => setEditForm({ ...editForm, dailyRate: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>{getCurrencySymbol(settings.currency)}</Typography>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenEditDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={openMarkPaidDialog} onClose={() => setOpenMarkPaidDialog(false)} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Mark Work Days as Paid
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Marking {selectedWorkDays.length} work day{selectedWorkDays.length > 1 ? 's' : ''} as paid
            </Typography>
            <TextField
              fullWidth
              label="Payment Date"
              type="date"
              value={markPaidForm.paidDate}
              onChange={(e) => setMarkPaidForm({ ...markPaidForm, paidDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={markPaidForm.paymentMethod}
                onChange={(e) => setMarkPaidForm({ ...markPaidForm, paymentMethod: e.target.value })}
                label="Payment Method"
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Check">Check</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="PayPal">PayPal</MenuItem>
                <MenuItem value="Venmo">Venmo</MenuItem>
                <MenuItem value="Zelle">Zelle</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Payment Notes (optional)"
              value={markPaidForm.paymentNotes}
              onChange={(e) => setMarkPaidForm({ ...markPaidForm, paymentNotes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              placeholder="Add any notes about this payment..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenMarkPaidDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleMarkPaidSubmit} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
              },
            }}
          >
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployeeDetails; 