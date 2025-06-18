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
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currency';

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
    settings
  } = useApp();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState(0);
  const [openWorkDayDialog, setOpenWorkDayDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingWorkDay, setEditingWorkDay] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  const [workDayForm, setWorkDayForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: '8',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState({
    name: employee?.name || '',
    dailyRate: employee?.dailyRate?.toString() || '',
  });

  const employeeWorkDays = workDays.filter(day => day.employeeId === employee?.id);
  const employeePayments = payments.filter(payment => payment.employeeId === employee?.id);
  const totals = calculateEmployeeTotals(employee?.id);
  const progress = totals.totalOwed > 0 ? (totals.totalPaid / totals.totalOwed) * 100 : 0;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '';
  };

  const handleWorkDaySubmit = async () => {
    if (!workDayForm.date || !workDayForm.hours) return;

    const workDayData = {
      employeeId: employee.id,
      date: workDayForm.date,
      hours: parseFloat(workDayForm.hours),
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
      hours: '8',
      notes: '',
    });
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.date || !paymentForm.amount) return;

    const paymentData = {
      employeeId: employee.id,
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
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
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
      hours: workDay.hours.toString(),
      notes: workDay.notes || '',
    });
    setOpenWorkDayDialog(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
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
                    {formatCurrency(totals.outstanding, settings.currency)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Outstanding
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
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(progress, 100)} 
                sx={{ 
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: progress >= 100 ? 'linear-gradient(90deg, #4caf50, #66bb6a)' : 'linear-gradient(90deg, #ff9800, #ffb74d)',
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

                {employeeWorkDays.length === 0 ? (
                  <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                      <WorkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No work days recorded
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add work days to track hours and calculate payments
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
                        <Card key={workDay.id} sx={{ mb: 2, borderRadius: 2 }}>
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {format(new Date(workDay.date), 'MMM dd, yyyy')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {workDay.hours} hours • {formatCurrency(workDay.hours * employee.dailyRate, settings.currency)}
                                  </Typography>
                                  {workDay.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {workDay.notes}
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
                      ))}
                  </List>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Payments ({employeePayments.length})
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
                    Add Payment
                  </Button>
                </Box>

                {employeePayments.length === 0 ? (
                  <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                      <PaymentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No payments recorded
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add payments to track what has been paid
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenPaymentDialog(true)}
                      >
                        Add First Payment
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <List>
                    {employeePayments
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((payment) => (
                        <Card key={payment.id} sx={{ mb: 2, borderRadius: 2 }}>
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MoneyIcon sx={{ mr: 2, color: 'success.main' }} />
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {format(new Date(payment.date), 'MMM dd, yyyy')}
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
      <Dialog open={openWorkDayDialog} onClose={() => setOpenWorkDayDialog(false)} maxWidth="sm" fullWidth>
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
              label="Hours"
              type="number"
              value={workDayForm.hours}
              onChange={(e) => setWorkDayForm({ ...workDayForm, hours: e.target.value })}
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
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
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

      {/* Edit Employee Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
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
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
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
    </>
  );
};

export default EmployeeDetails; 