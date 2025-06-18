import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Link,
  Container,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, signup, resetPassword, loading, error, clearError } = useAuth();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    clearError();
    setSuccessMessage('');
    setShowResetForm(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    try {
      await signup(email, password);
      setSuccessMessage('Account created successfully! Please check your email to verify your account.');
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(resetEmail);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
      setShowResetForm(false);
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleForgotPassword = () => {
    setShowResetForm(true);
    clearError();
    setSuccessMessage('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1300,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: { xs: 3, sm: 5 },
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.2,
                boxShadow: '0 2px 8px 0 rgba(67,233,123,0.15)',
              }}
            >
              <span style={{ fontSize: 28, color: '#fff' }}>💸</span>
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>
              Payment Tracker
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Manage your employees and payments
          </Typography>
        </Box>

        {!showResetForm ? (
          <>
            <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            {activeTab === 0 ? (
              // Login Form
              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleForgotPassword}
                    sx={{ cursor: 'pointer' }}
                  >
                    Forgot password?
                  </Link>
                </Box>
              </Box>
            ) : (
              // Sign Up Form
              <Box component="form" onSubmit={handleSignup}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  variant="outlined"
                  helperText="Password must be at least 6 characters"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  variant="outlined"
                  error={password !== confirmPassword && confirmPassword !== ''}
                  helperText={password !== confirmPassword && confirmPassword !== '' ? "Passwords don't match" : ""}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || password !== confirmPassword}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                </Button>
              </Box>
            )}
          </>
        ) : (
          // Password Reset Form
          <Box component="form" onSubmit={handleResetPassword}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              margin="normal"
              required
              variant="outlined"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setShowResetForm(false)}
                sx={{ cursor: 'pointer' }}
              >
                Back to login
              </Link>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Login; 