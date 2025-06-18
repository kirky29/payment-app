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
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/currency';

const Reports = () => {
  const { employees, workDays, payments, calculateEmployeeTotals, settings } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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
      <Typography variant="h4" component="h1" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Overall Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Owed
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(overallStats.totalOwed, settings.currency)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Paid
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {formatCurrency(overallStats.totalPaid, settings.currency)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Outstanding
              </Typography>
              <Typography 
                variant="h4" 
                component="div"
                color={overallStats.outstanding > 0 ? 'error.main' : 'success.main'}
              >
                {formatCurrency(overallStats.outstanding, settings.currency)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Work Days
              </Typography>
              <Typography variant="h4" component="div">
                {overallStats.totalWorkDays}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search Employees"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="all">All Methods</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Check">Check</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="PayPal">PayPal</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Employee Overview" />
          <Tab label="Payment Analytics" />
          <Tab label="Monthly Trends" />
        </Tabs>
      </Box>

      {/* Employee Overview Tab */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Employee Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={employeeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value, settings.currency)} />
                      <Legend />
                      <Bar dataKey="owed" fill="#8884d8" name="Total Owed" />
                      <Bar dataKey="paid" fill="#82ca9d" name="Total Paid" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Methods
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Employee Table */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Details
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Daily Rate</TableCell>
                      <TableCell>Work Days</TableCell>
                      <TableCell>Total Owed</TableCell>
                      <TableCell>Total Paid</TableCell>
                      <TableCell>Outstanding</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEmployees.map((employee) => {
                      const totals = calculateEmployeeTotals(employee.id);
                      const workDaysCount = workDays.filter(day => day.employeeId === employee.id).length;
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{formatCurrency(employee.dailyRate, settings.currency)}</TableCell>
                          <TableCell>{workDaysCount}</TableCell>
                          <TableCell>{formatCurrency(totals.totalOwed, settings.currency)}</TableCell>
                          <TableCell>{formatCurrency(totals.totalPaid, settings.currency)}</TableCell>
                          <TableCell>{formatCurrency(totals.outstanding, settings.currency)}</TableCell>
                          <TableCell>
                            <Chip
                              label={totals.outstanding > 0 ? 'Unpaid' : 'Paid'}
                              color={totals.outstanding > 0 ? 'error' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Payment Analytics Tab */}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Method Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={paymentMethodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Monthly Trends Tab */}
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Payment Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={monthlyPaymentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [formatCurrency(value, settings.currency), 'Amount']} />
                      <Bar dataKey="amount" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Reports; 