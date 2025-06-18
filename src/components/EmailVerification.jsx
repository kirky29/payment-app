import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const EmailVerification = () => {
  const { currentUser, resendVerificationEmail, logout, loading, error } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
    } catch (error) {
      // Error is handled by the context
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 500,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
            Verify Your Email
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
            We've sent a verification email to:
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
            {currentUser?.email}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
            Please check your email and click the verification link to continue using the app.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {resendSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Verification email sent successfully! Please check your inbox.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleResendVerification}
              disabled={resendLoading || loading}
              sx={{
                py: 1.5,
                px: 4,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                },
              }}
            >
              {resendLoading ? <CircularProgress size={24} /> : 'Resend Verification Email'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleLogout}
              disabled={loading}
              sx={{
                py: 1.5,
                px: 4,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                },
              }}
            >
              Logout
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Didn't receive the email?</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • Check your spam folder
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Make sure you entered the correct email address
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Wait a few minutes before requesting another email
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerification; 