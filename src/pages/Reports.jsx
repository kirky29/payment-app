import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
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
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/currency';
import { format } from 'date-fns';
import { alpha } from '@mui/material/styles';

const Reports = () => {
  const { employees, workDays, payments, calculateEmployeeTotals, settings } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    let totalOwed = 0;
    let totalPaid = 0;
    let totalWorkDays = 0;
    let totalPayments = 0;

    employees.forEach(employee => {
      const totals = calculateEmployeeTotals(employee.id);
      totalOwed += totals.totalOwed;
      totalPaid += totals.totalPaid;
    });

    totalWorkDays = workDays.length;
    totalPayments = payments.length;

    return {
      totalOwed,
      totalPaid,
      outstanding: totalOwed - totalPaid,
      totalWorkDays,
      totalPayments,
    };
  }, [employees, workDays, payments, calculateEmployeeTotals]);

  // Payment method breakdown
  const paymentMethodData = useMemo(() => {
    const methodCounts = {};
    payments.forEach(payment => {
      methodCounts[payment.paymentMethod] = (methodCounts[payment.paymentMethod] || 0) + 1;
    });

    return Object.entries(methodCounts).map(([method, count]) => ({
      name: method,
      value: count,
    }));
  }, [payments]);

  // Employee performance data for chart
  const employeeChartData = useMemo(() => {
    return filteredEmployees.map(employee => {
      const totals = calculateEmployeeTotals(employee.id);
      return {
        name: employee.name,
        owed: totals.totalOwed,
        paid: totals.totalPaid,
        outstanding: totals.outstanding,
      };
    });
  }, [filteredEmployees, calculateEmployeeTotals]);

  // Monthly payment data
  const monthlyPaymentData = useMemo(() => {
    const monthlyData = {};
    
    payments.forEach(payment => {
      const date = new Date(payment.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, amount: 0, count: 0 };
      }
      
      monthlyData[monthKey].amount += payment.amount;
      monthlyData[monthKey].count += 1;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [payments]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
            mb: { xs: 1, sm: 2 },
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
          gap: { xs: 1, sm: 2 },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <TextField
          select
          label="Payment Method"
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          sx={{ 
            minWidth: { xs: '100%', sm: 200 },
            '& .MuiInputBase-root': {
              height: '40px',
            },
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
          sx={{ 
            minWidth: { xs: '100%', sm: 200 },
            '& .MuiInputBase-root': {
              height: '40px',
            },
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
          sx={{ 
            minWidth: { xs: '100%', sm: 200 },
            '& .MuiInputBase-root': {
              height: '40px',
            },
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
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Owed"
            value={formatCurrency(overallStats.totalOwed, settings.currency)}
            icon={<MoneyIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Paid"
            value={formatCurrency(overallStats.totalPaid, settings.currency)}
            icon={<PaymentIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Outstanding"
            value={formatCurrency(overallStats.outstanding, settings.currency)}
            icon={<AccountBalanceIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Work Days"
            value={overallStats.totalWorkDays.toString()}
            icon={<WorkIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2}>
        {/* Payment Timeline Chart */}
        <Grid item xs={12}>
          <Card sx={{ mb: { xs: 2, sm: 3 } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Payment Timeline
              </Typography>
              <Box sx={{ height: { xs: 300, sm: 400 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value, settings.currency, true)}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value, settings.currency)}
                      labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="paid" name="Paid" stroke="#4caf50" strokeWidth={2} />
                    <Line type="monotone" dataKey="owed" name="Owed" stroke="#f57c00" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Payment Methods
              </Typography>
              <Box sx={{ height: { xs: 300, sm: 400 } }}>
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
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                      layout={isMobile ? "horizontal" : "vertical"}
                      align={isMobile ? "center" : "right"}
                      verticalAlign={isMobile ? "bottom" : "middle"}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Employee Performance Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Employee Performance
              </Typography>
              <Box sx={{ height: { xs: 300, sm: 400 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value, settings.currency, true)}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value, settings.currency)}
                    />
                    <Legend />
                    <Bar dataKey="owed" name="Total Owed" fill="#8884d8" />
                    <Bar dataKey="paid" name="Total Paid" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Table */}
      <Card sx={{ mt: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" gutterBottom sx={{ px: { xs: 1, sm: 0 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Employee Summary
          </Typography>
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Work Days</TableCell>
                  <TableCell align="right">Total Owed</TableCell>
                  <TableCell align="right">Total Paid</TableCell>
                  <TableCell align="right">Outstanding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeSummary.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.workDays}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalOwed, settings.currency)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalPaid, settings.currency)}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: row.outstanding > 0 ? 'warning.main' : 
                               row.outstanding < 0 ? 'success.main' : 
                               'text.primary',
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(row.outstanding, settings.currency)}
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
      background: `linear-gradient(135deg, ${alpha(`${color}.main`, 0.1)} 0%, ${alpha(`${color}.dark`, 0.1)} 100%)`,
      border: 1,
      borderColor: `${color}.main`,
      borderRadius: 2,
    }}
  >
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: `${color}.main`,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
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