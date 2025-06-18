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
  orderBy
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
    case 'SET_EMPLOYEES':
      // Always completely replace employees array - no merging, no duplicates possible
      console.log('[Context] Setting employees:', action.payload.length, 'employees');
      return { ...state, employees: action.payload };
    case 'SET_WORK_DAYS':
      return { ...state, workDays: action.payload };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
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

  // Fetch all data from Firebase
  const fetchAllData = async () => {
    if (!currentUser) return;
    
    try {
      console.log('[Context] Fetching all data for user:', currentUser.uid);
      dispatch({ type: 'SET_LOADING', payload: true });

      // Fetch employees
      const employeesRef = getUserCollection('employees');
      const employeesSnapshot = await getDocs(query(employeesRef, orderBy('createdAt', 'desc')));
      const employees = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('[Context] Fetched employees:', employees.length);

      // Fetch work days
      const workDaysRef = getUserCollection('workDays');
      const workDaysSnapshot = await getDocs(query(workDaysRef, orderBy('createdAt', 'desc')));
      const workDays = workDaysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch payments
      const paymentsRef = getUserCollection('payments');
      const paymentsSnapshot = await getDocs(query(paymentsRef, orderBy('createdAt', 'desc')));
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update state with fetched data
      dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      dispatch({ type: 'SET_WORK_DAYS', payload: workDays });
      dispatch({ type: 'SET_PAYMENTS', payload: payments });
      
      setIsInitialized(true);
    } catch (error) {
      console.error('[Context] Error fetching data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Initial data load
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: 'RESET_STATE' });
      setIsInitialized(true);
      return;
    }

    fetchAllData();
  }, [currentUser]);

  // Employee actions with optimistic updates
  const addEmployee = async (employeeData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      // Add to Firebase first
      const employeesRef = getUserCollection('employees');
      const docRef = await addDoc(employeesRef, {
        ...employeeData,
        createdAt: new Date()
      });
      
      console.log('[Context] Employee added to Firebase:', docRef.id);
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Add employee error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const updateEmployee = async (id, employeeData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const employeesRef = getUserCollection('employees');
      await updateDoc(doc(employeesRef, id), employeeData);
      
      console.log('[Context] Employee updated in Firebase:', id);
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Update employee error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
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
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Delete employee error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
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
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Add work day error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add work day' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const updateWorkDay = async (id, workDayData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const workDaysRef = getUserCollection('workDays');
      await updateDoc(doc(workDaysRef, id), workDayData);
      
      console.log('[Context] Work day updated in Firebase');
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Update work day error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update work day' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const deleteWorkDay = async (id) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const workDaysRef = getUserCollection('workDays');
      await deleteDoc(doc(workDaysRef, id));
      
      console.log('[Context] Work day deleted from Firebase');
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Delete work day error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete work day' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
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
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Add payment error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add payment' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const updatePayment = async (id, paymentData) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const paymentsRef = getUserCollection('payments');
      await updateDoc(doc(paymentsRef, id), paymentData);
      
      console.log('[Context] Payment updated in Firebase');
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Update payment error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update payment' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const deletePayment = async (id) => {
    if (!currentUser || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      
      const paymentsRef = getUserCollection('payments');
      await deleteDoc(doc(paymentsRef, id));
      
      console.log('[Context] Payment deleted from Firebase');
      
      // Fetch fresh data to ensure consistency
      await fetchAllData();
      
    } catch (error) {
      console.error('[Context] Delete payment error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete payment' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
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
    refreshData: fetchAllData, // Expose refresh function
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