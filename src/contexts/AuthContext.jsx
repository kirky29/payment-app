import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up function
  const signup = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting to create user with email:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
        console.log('Verification email sent successfully');
      } catch (verificationError) {
        console.warn('Failed to send verification email:', verificationError);
        // Don't throw here, user is still created
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting to login with email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      console.log('Attempting to logout');
      await signOut(auth);
      console.log('Logout successful');
      // Clear local storage when logging out
      localStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      setError(null);
      if (currentUser && !currentUser.emailVerified) {
        console.log('Resending verification email to:', currentUser.email);
        await sendEmailVerification(currentUser);
        console.log('Verification email resent successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      console.log('Attempting to reset password for:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    console.log('Error code:', errorCode);
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please enable Email/Password authentication in Firebase Console.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/user-token-expired':
        return 'Your session has expired. Please log in again.';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please log in again.';
      case 'auth/quota-exceeded':
        return 'Service temporarily unavailable. Please try again later.';
      case 'auth/app-not-authorized':
        return 'This app is not authorized to use Firebase Authentication.';
      case 'auth/keychain-error':
        return 'Authentication failed due to a keychain error.';
      case 'auth/internal-error':
        return 'An internal error occurred. Please try again.';
      case 'auth/invalid-app-credential':
        return 'Invalid app credential.';
      case 'auth/invalid-user-token':
        return 'Invalid user token. Please log in again.';
      case 'auth/invalid-tenant-id':
        return 'Invalid tenant ID.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for OAuth operations.';
      case 'auth/unsupported-persistence-type':
        return 'Unsupported persistence type.';
      case 'auth/unsupported-tenant-operation':
        return 'Unsupported tenant operation.';
      case 'auth/web-storage-unsupported':
        return 'Web storage is not supported in this environment.';
      default:
        return `Authentication error: ${errorCode || 'Unknown error'}. Please try again.`;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User ${user.uid} logged in` : 'No user');
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state listener error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    logout,
    resendVerificationEmail,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 