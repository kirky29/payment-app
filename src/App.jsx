import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Alert, Container, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import EmailVerification from './components/EmailVerification';
import Employees from './pages/Employees';
import Staff from './pages/Staff';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SyncStatus from './components/SyncStatus';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontSize: '1.1rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '12px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '8px 16px',
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          '@media (max-width:600px)': {
            height: 56,
          },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '6px 0',
            minWidth: 'auto',
          },
        },
        label: {
          '@media (max-width:600px)': {
            fontSize: '0.75rem',
          },
        },
      },
    },
  },
  spacing: (factor) => `${0.25 * factor}rem`,
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Something went wrong!</strong>
            <br />
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Alert>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if email is verified
  if (!currentUser.emailVerified) {
    return <EmailVerification />;
  }

  return children;
};

// Main App Content
const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppProvider currentUser={currentUser}>
                <SyncStatus />
                <Layout>
                  <Routes>
                    <Route path="/" element={<Employees />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              </AppProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
