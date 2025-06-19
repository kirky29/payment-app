import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/currency';
import { alpha } from '@mui/material/styles';

const Reports = () => {
  const { employees, workDays, payments, calculateEmployeeTotals, settings } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');

  // Calculate overall statistics
  const totals = useMemo(() => {
    let totalOwed = 0;
    let totalPaid = 0;
    let outstanding = 0;

    employees.forEach(employee => {
      const empTotals = calculateEmployeeTotals(employee.id);
      totalOwed += empTotals.totalOwed;
      totalPaid += empTotals.totalPaid;
      outstanding += empTotals.outstanding;
    });

    return {
      totalOwed,
      totalPaid,
      outstanding,
      totalWorkDays: workDays.length,
    };
  }, [employees, workDays, calculateEmployeeTotals]);

  // Payment method breakdown
  const paymentMethods = ['Cash', 'Check', 'Bank Transfer', 'PayPal', 'Other'];
  const paymentMethodData = useMemo(() => {
    const methodCounts = {};
    payments.forEach(payment => {
      const method = payment.paymentMethod || 'Other';
      methodCounts[method] = (methodCounts[method] || 0) + payment.amount;
    });

    return Object.entries(methodCounts).map(([method, amount]) => ({
      name: method,
      value: amount,
    }));
  }, [payments]);

  // Employee performance data
  const employeePerformanceData = useMemo(() => {
    return employees.map(employee => {
      const empTotals = calculateEmployeeTotals(employee.id);
      const workDaysCount = workDays.filter(wd => wd.employeeId === employee.id).length;
      return {
        id: employee.id,
        name: employee.name,
        workDays: workDaysCount,
        totalOwed: empTotals.totalOwed,
        totalPaid: empTotals.totalPaid,
        outstanding: empTotals.outstanding,
        earned: empTotals.totalPaid,
      };
    });
  }, [employees, workDays, calculateEmployeeTotals]);

  const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

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
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            mb: { xs: 0.5, sm: 1 },
          }}
        >
          Reports & Analytics
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Track payments and analyze work patterns
        </Typography>
      </Paper>

      {/* Filter Controls */}
      <Paper 
        sx={{ 
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <TextField
          select
          label="Payment Method"
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          size="small"
          sx={{ 
            minWidth: { xs: '100%', sm: 200 },
          }}
        >
          <MenuItem value="all">All Methods</MenuItem>
          {paymentMethods.map((method) => (
            <MenuItem key={method} value={method}>{method}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          size="small"
          sx={{ 
            minWidth: { xs: '100%', sm: 200 },
          }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="unpaid">Unpaid</MenuItem>
        </TextField>

        <TextField
          select
          label="Employee"
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          size="small"
          sx={{ 
            minWidth: { xs: '100%', sm: 200 },
          }}
        >
          <MenuItem value="all">All Employees</MenuItem>
          {employees.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Total Owed"
            value={formatCurrency(totals.totalOwed, settings.currency)}
            icon={<TrendingUpIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Total Paid"
            value={formatCurrency(totals.totalPaid, settings.currency)}
            icon={<PaymentIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Outstanding"
            value={formatCurrency(totals.outstanding, settings.currency)}
            icon={<AccountBalanceIcon />}
            color={totals.outstanding > 0 ? "error" : "success"}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Work Days"
            value={totals.totalWorkDays.toString()}
            icon={<WorkIcon />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 3 } }}>
        {/* Employee Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Employee Performance
              </Typography>
              <Box sx={{ height: { xs: 250, sm: 300 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeePerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      interval={0}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 60 : 40}
                    />
                    <YAxis 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      tickFormatter={(value) => `${settings.currency === 'GBP' ? '£' : '$'}${value}`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(value, settings.currency),
                        name === 'earned' ? 'Total Paid' : name === 'outstanding' ? 'Outstanding' : name
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="earned" name="Total Paid" fill="#4caf50" />
                    <Bar dataKey="outstanding" name="Outstanding" fill="#ff9800" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Payment Methods
              </Typography>
              <Box sx={{ height: { xs: 250, sm: 300 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => 
                        isMobile ? 
                        `${(percent * 100).toFixed(0)}%` : 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={isMobile ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value, settings.currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Summary Table */}
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" gutterBottom sx={{ px: { xs: 1, sm: 0 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Employee Summary
          </Typography>
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  {!isMobile && <TableCell align="right">Work Days</TableCell>}
                  <TableCell align="right">Owed</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Outstanding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeePerformanceData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {row.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.name}
                          </Typography>
                          {isMobile && (
                            <Typography variant="caption" color="text.secondary">
                              {row.workDays} days
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    {!isMobile && <TableCell align="right">{row.workDays}</TableCell>}
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(row.totalOwed, settings.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {formatCurrency(row.totalPaid, settings.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatCurrency(Math.abs(row.outstanding), settings.currency)}
                        color={row.outstanding > 0 ? 'error' : row.outstanding < 0 ? 'info' : 'success'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

const StatsCard = ({ title, value, icon, color }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(theme => theme.palette[color]?.main || '#1976d2', 0.1)} 0%, ${alpha(theme => theme.palette[color]?.dark || '#1565c0', 0.1)} 100%)`,
      border: 1,
      borderColor: `${color}.main`,
      borderRadius: 2,
    }}
  >
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1rem', sm: '1.25rem' },
            },
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: `${color}.main`,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default Reports; 