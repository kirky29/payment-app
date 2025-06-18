import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

const AppContext = createContext();

const initialState = {
  employees: [],
  workDays: [],
  payments: [],
  settings: {
    currency: 'USD',
    theme: 'light',
  },
  loading: false,
  error: null,
  syncing: false,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SYNCING':
      return { ...state, syncing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_EMPLOYEES': {
      // Deduplicate by ID and sort by creation date (newest first)
      const uniqueEmployees = Array.from(
        new Map(action.payload.map(emp => [emp.id, emp])).values()
      ).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA;
      });
      console.log('[Context] Setting employees (deduplicated):', uniqueEmployees.length, 'employees');
      return { ...state, employees: uniqueEmployees };
    }
    case 'SET_WORK_DAYS': {
      // Deduplicate work days as well
      const uniqueWorkDays = Array.from(
        new Map(action.payload.map(day => [day.id, day])).values()
      );
      return { ...state, workDays: uniqueWorkDays };
    }
    case 'SET_PAYMENTS': {
      // Deduplicate payments as well
      const uniquePayments = Array.from(
        new Map(action.payload.map(payment => [payment.id, payment])).values()
      );
      return { ...state, payments: uniquePayments };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'RESET_STATE':
      return { ...initialState, settings: state.settings };
    default:
      return state;
  }
};

export const AppProvider = ({ children, currentUser }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user-specific collection reference
  const getUserCollection = (collectionName) => {
    if (!currentUser) return null;
    return collection(db, `users/${currentUser.uid}/${collectionName}`);
  };

  // Real-time listeners for automatic syncing
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: 'RESET_STATE' });
      setIsInitialized(true);
      return;
    }

    console.log('[Context] Setting up real-time listeners for user:', currentUser.uid);
    dispatch({ type: 'SET_LOADING', payload: true });

    let unsubscribeEmployees, unsubscribeWorkDays, unsubscribePayments;

    const setupListeners = async () => {
      try {
        // Employees listener
        const employeesRef = getUserCollection('employees');
        if (employeesRef) {
          unsubscribeEmployees = onSnapshot(
            query(employeesRef, orderBy('createdAt', 'desc')),
            (snapshot) => {
              const employees = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              console.log('[Firebase] Employees updated:', employees.length, 'employees');
              dispatch({ type: 'SET_EMPLOYEES', payload: employees });
            },
            (error) => {
              console.error('[Firebase] Employees listener error:', error);
              dispatch({ type: 'SET_ERROR', payload: 'Failed to sync employees' });
            }
          );
        }

        // Work days listener
        const workDaysRef = getUserCollection('workDays');
        if (workDaysRef) {
          unsubscribeWorkDays = onSnapshot(
            query(workDaysRef, orderBy('createdAt', 'desc')),
            (snapshot) => {
              const workDays = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              dispatch({ type: 'SET_WORK_DAYS', payload: workDays });
            },
            (error) => {
              console.error('[Firebase] Work days listener error:', error);
            }
          );
        }

        // Payments listener
        const paymentsRef = getUserCollection('payments');
        if (paymentsRef) {
          unsubscribePayments = onSnapshot(
            query(paymentsRef, orderBy('createdAt', 'desc')),
            (snapshot) => {
              const payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              dispatch({ type: 'SET_PAYMENTS', payload: payments });
            },
            (error) => {
              console.error('[Firebase] Payments listener error:', error);
            }
          );
        }

        // Mark as initialized after a short delay to ensure listeners are active
        setTimeout(() => {
          setIsInitialized(true);
          dispatch({ type: 'SET_LOADING', payload: false });
        }, 1000);

      } catch (error) {
        console.error('[Firebase] Setup error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to database' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeEmployees) unsubscribeEmployees();
      if (unsubscribeWorkDays) unsubscribeWorkDays();
      if (unsubscribePayments) unsubscribePayments();
    };
  }, [currentUser]);

  // Employee actions - NO optimistic updates, only Firebase writes
  const addEmployee = async (employeeData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      // Only write to Firebase - let the listener update the state
      const employeesRef = getUserCollection('employees');
      const docRef = await addDoc(employeesRef, {
        ...employeeData,
        createdAt: new Date()
      });
      
      console.log('[Context] Employee added to Firebase:', docRef.id);
      // Don't update local state - the onSnapshot listener will handle it
      
    } catch (error) {
      console.error('[Context] Add employee error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add employee' });
      throw error;
    } finally {
      // Clear syncing after a delay to show user feedback
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 500);
    }
  };

  const updateEmployee = async (id, employeeData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const employeesRef = getUserCollection('employees');
      await updateDoc(doc(employeesRef, id), employeeData);
      
      console.log('[Context] Employee updated in Firebase:', id);
      
    } catch (error) {
      console.error('[Context] Update employee error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update employee' });
      throw error;
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 500);
    }
  };

  const deleteEmployee = async (id) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const employeesRef = getUserCollection('employees');
      const workDaysRef = getUserCollection('workDays');
      const paymentsRef = getUserCollection('payments');
      
      // Delete employee
      await deleteDoc(doc(employeesRef, id));
      
      // Delete related work days
      const workDaysQuery = query(workDaysRef, where('employeeId', '==', id));
      const workDaysSnapshot = await getDocs(workDaysQuery);
      const workDayDeletions = workDaysSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      // Delete related payments
      const paymentsQuery = query(paymentsRef, where('employeeId', '==', id));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentDeletions = paymentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all([...workDayDeletions, ...paymentDeletions]);
      
      console.log('[Context] Employee and related data deleted from Firebase');
      
    } catch (error) {
      console.error('[Context] Delete employee error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete employee' });
      throw error;
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 500);
    }
  };

  // Work Day actions
  const addWorkDay = async (workDayData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const workDaysRef = getUserCollection('workDays');
      await addDoc(workDaysRef, {
        ...workDayData,
        createdAt: new Date()
      });
      
      console.log('[Context] Work day added to Firebase');
      
    } catch (error) {
      console.error('[Context] Add work day error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add work day' });
      throw error;
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 300);
    }
  };

  const updateWorkDay = async (id, workDayData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const workDaysRef = getUserCollection('workDays');
      await updateDoc(doc(workDaysRef, id), workDayData);
      
      console.log('[Context] Work day updated in Firebase');
      
    } catch (error) {
      console.error('[Context] Update work day error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update work day' });
      throw error;
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 300);
    }
  };

  const deleteWorkDay = async (id) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const workDaysRef = getUserCollection('workDays');
      await deleteDoc(doc(workDaysRef, id));
      
      console.log('[Context] Work day deleted from Firebase');
      
    } catch (error) {
      console.error('[Context] Delete work day error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete work day' });
      throw error;
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 300);
    }
  };

  // Payment actions
  const addPayment = async (paymentData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const paymentsRef = getUserCollection('payments');
      await addDoc(paymentsRef, {
        ...paymentData,
        createdAt: new Date()
      });
      
      console.log('[Context] Payment added to Firebase');
      
    } catch (error) {
      console.error('[Context] Add payment error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add payment' });
      throw error;
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 300);
    }
  };

  const updatePayment = async (id, paymentData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const paymentsRef = getUserCollection('payments');
      await updateDoc(doc(paymentsRef, id), paymentData);
      
      console.log('[Context] Payment updated in Firebase');
      
    } catch (error) {
      console.error('[Context] Update payment error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update payment' });
      throw error;
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 300);
    }
  };

  const deletePayment = async (id) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const paymentsRef = getUserCollection('payments');
      await deleteDoc(doc(paymentsRef, id));
      
      console.log('[Context] Payment deleted from Firebase');
      
    } catch (error) {
      console.error('[Context] Delete payment error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete payment' });
      throw error;
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }, 300);
    }
  };

  // Helper functions
  const getEmployeeWorkDays = (employeeId) => {
    return state.workDays.filter(day => day.employeeId === employeeId);
  };

  const getEmployeePayments = (employeeId) => {
    return state.payments.filter(payment => payment.employeeId === employeeId);
  };

  const calculateEmployeeTotals = (employeeId) => {
    const workDays = getEmployeeWorkDays(employeeId);
    const payments = getEmployeePayments(employeeId);
    const employee = state.employees.find(emp => emp.id === employeeId);
    
    const totalOwed = workDays.reduce((sum, day) => sum + (day.hours * (employee?.dailyRate || 0)), 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return { totalOwed, totalPaid, outstanding: totalOwed - totalPaid };
  };

  const updateSettings = async (newSettings) => {
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
      
      if (currentUser) {
        const settingsRef = getUserCollection('settings');
        const settingsSnapshot = await getDocs(settingsRef);
        const updatedSettings = { ...state.settings, ...newSettings };
        
        if (settingsSnapshot.empty) {
          await addDoc(settingsRef, updatedSettings);
        } else {
          const settingsDoc = settingsSnapshot.docs[0];
          await updateDoc(doc(settingsRef, settingsDoc.id), newSettings);
        }
      }
    } catch (error) {
      console.warn('Error updating settings:', error);
    }
  };

  const value = {
    ...state,
    isInitialized,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addWorkDay,
    updateWorkDay,
    deleteWorkDay,
    addPayment,
    updatePayment,
    deletePayment,
    getEmployeeWorkDays,
    getEmployeePayments,
    calculateEmployeeTotals,
    updateSettings,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 