import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
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
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp => 
          emp.id === action.payload.id ? action.payload : emp
        ),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload),
      };
    case 'SET_WORK_DAYS':
      return { ...state, workDays: action.payload };
    case 'ADD_WORK_DAY':
      return { ...state, workDays: [...state.workDays, action.payload] };
    case 'UPDATE_WORK_DAY':
      return {
        ...state,
        workDays: state.workDays.map(day => 
          day.id === action.payload.id ? action.payload : day
        ),
      };
    case 'DELETE_WORK_DAY':
      return {
        ...state,
        workDays: state.workDays.filter(day => day.id !== action.payload),
      };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment => 
          payment.id === action.payload.id ? action.payload : payment
        ),
      };
    case 'DELETE_PAYMENT':
      return {
        ...state,
        payments: state.payments.filter(payment => payment.id !== action.payload),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
};

export const AppProvider = ({ children, currentUser }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Get user-specific storage keys
  const getStorageKey = (key) => {
    return currentUser ? `${key}_${currentUser.uid}` : key;
  };

  // Get user-specific collection reference
  const getUserCollection = (collectionName) => {
    if (!currentUser) return null;
    return collection(db, `users/${currentUser.uid}/${collectionName}`);
  };

  // Load data from Firebase
  useEffect(() => {
    console.log('AppContext: currentUser changed:', currentUser ? `User ${currentUser.uid}` : 'No user');
    
    if (!currentUser) {
      // If no user, load from default localStorage
      try {
        const localEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        const localWorkDays = JSON.parse(localStorage.getItem('workDays') || '[]');
        const localPayments = JSON.parse(localStorage.getItem('payments') || '[]');
        
        console.log('AppContext: Loading from default localStorage:', {
          employees: localEmployees.length,
          workDays: localWorkDays.length,
          payments: localPayments.length
        });
        
        dispatch({ type: 'SET_EMPLOYEES', payload: localEmployees });
        dispatch({ type: 'SET_WORK_DAYS', payload: localWorkDays });
        dispatch({ type: 'SET_PAYMENTS', payload: localPayments });
      } catch (error) {
        console.warn('Error loading from local storage:', error);
      }
      return;
    }

    let unsubscribeEmployees, unsubscribeWorkDays, unsubscribePayments, unsubscribeSettings;
    
    const loadFromLocalStorage = () => {
      try {
        const localEmployees = JSON.parse(localStorage.getItem(getStorageKey('employees')) || '[]');
        const localWorkDays = JSON.parse(localStorage.getItem(getStorageKey('workDays')) || '[]');
        const localPayments = JSON.parse(localStorage.getItem(getStorageKey('payments')) || '[]');
        const localSettings = JSON.parse(localStorage.getItem(getStorageKey('settings')) || '{"currency": "USD", "theme": "light"}');
        
        console.log('AppContext: Loading from user localStorage:', {
          userId: currentUser.uid,
          employees: localEmployees.length,
          workDays: localWorkDays.length,
          payments: localPayments.length
        });
        
        dispatch({ type: 'SET_EMPLOYEES', payload: localEmployees });
        dispatch({ type: 'SET_WORK_DAYS', payload: localWorkDays });
        dispatch({ type: 'SET_PAYMENTS', payload: localPayments });
        dispatch({ type: 'UPDATE_SETTINGS', payload: localSettings });
      } catch (error) {
        console.warn('Error loading from local storage:', error);
      }
    };

    const setupFirebaseListeners = () => {
      console.log('AppContext: Setting up Firebase listeners for user:', currentUser.uid);
      try {
        const employeesCollection = getUserCollection('employees');
        const workDaysCollection = getUserCollection('workDays');
        const paymentsCollection = getUserCollection('payments');
        const settingsCollection = getUserCollection('settings');

        console.log('AppContext: Firebase collections:', {
          employees: employeesCollection ? '✅ Available' : '❌ Not available',
          workDays: workDaysCollection ? '✅ Available' : '❌ Not available',
          payments: paymentsCollection ? '✅ Available' : '❌ Not available',
          settings: settingsCollection ? '✅ Available' : '❌ Not available'
        });

        if (employeesCollection) {
          unsubscribeEmployees = onSnapshot(
            employeesCollection,
            (snapshot) => {
              const employees = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              // Always update with Firebase data, even if empty
              dispatch({ type: 'SET_EMPLOYEES', payload: employees });
              localStorage.setItem(getStorageKey('employees'), JSON.stringify(employees));
            },
            (error) => {
              console.warn('Firebase employees connection error:', error);
              loadFromLocalStorage();
            }
          );
        }

        if (workDaysCollection) {
          unsubscribeWorkDays = onSnapshot(
            workDaysCollection,
            (snapshot) => {
              const workDays = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              // Always update with Firebase data, even if empty
              dispatch({ type: 'SET_WORK_DAYS', payload: workDays });
              localStorage.setItem(getStorageKey('workDays'), JSON.stringify(workDays));
            },
            (error) => {
              console.warn('Firebase workDays connection error:', error);
              loadFromLocalStorage();
            }
          );
        }

        if (paymentsCollection) {
          unsubscribePayments = onSnapshot(
            paymentsCollection,
            (snapshot) => {
              const payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              // Always update with Firebase data, even if empty
              dispatch({ type: 'SET_PAYMENTS', payload: payments });
              localStorage.setItem(getStorageKey('payments'), JSON.stringify(payments));
            },
            (error) => {
              console.warn('Firebase payments connection error:', error);
              loadFromLocalStorage();
            }
          );
        }

        if (settingsCollection) {
          unsubscribeSettings = onSnapshot(
            settingsCollection,
            (snapshot) => {
              if (!snapshot.empty) {
                const settingsDoc = snapshot.docs[0];
                const settings = settingsDoc.data();
                dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
                localStorage.setItem(getStorageKey('settings'), JSON.stringify(settings));
              }
            },
            (error) => {
              console.warn('Firebase settings connection error:', error);
              loadFromLocalStorage();
            }
          );
        }
      } catch (error) {
        console.warn('Firebase initialization error:', error);
        loadFromLocalStorage();
      }
    };

    // Try to load from local storage first, then setup Firebase
    loadFromLocalStorage();
    setupFirebaseListeners();

    return () => {
      if (unsubscribeEmployees) unsubscribeEmployees();
      if (unsubscribeWorkDays) unsubscribeWorkDays();
      if (unsubscribePayments) unsubscribePayments();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [currentUser]);

  // Employee actions
  const addEmployee = async (employeeData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Create new employee object
      const newEmployee = { 
        id: Date.now().toString(), 
        ...employeeData, 
        totalOwed: 0, 
        totalPaid: 0,
        createdAt: new Date()
      };
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('employees');
        if (collectionRef) {
          const docRef = await addDoc(collectionRef, {
            ...employeeData,
            totalOwed: 0,
            totalPaid: 0,
            createdAt: new Date()
          });
          newEmployee.id = docRef.id;
        }
      } catch (error) {
        console.warn('Firebase add employee error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
      const updatedEmployees = [...state.employees, newEmployee];
      localStorage.setItem(getStorageKey('employees'), JSON.stringify(updatedEmployees));
      
      return newEmployee;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedEmployee = { id, ...employeeData };
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('employees');
        if (collectionRef) {
          await updateDoc(doc(collectionRef, id), employeeData);
        }
      } catch (error) {
        console.warn('Firebase update employee error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
      const updatedEmployees = state.employees.map(emp => 
        emp.id === id ? updatedEmployee : emp
      );
      localStorage.setItem(getStorageKey('employees'), JSON.stringify(updatedEmployees));
      
      return updatedEmployee;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteEmployee = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('employees');
        if (collectionRef) {
          await deleteDoc(doc(collectionRef, id));
        }
      } catch (error) {
        console.warn('Firebase delete employee error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
      const updatedEmployees = state.employees.filter(emp => emp.id !== id);
      localStorage.setItem(getStorageKey('employees'), JSON.stringify(updatedEmployees));
      
      // Also delete related work days and payments
      const relatedWorkDays = state.workDays.filter(day => day.employeeId === id);
      const relatedPayments = state.payments.filter(payment => payment.employeeId === id);
      
      if (relatedWorkDays.length > 0) {
        const updatedWorkDays = state.workDays.filter(day => day.employeeId !== id);
        dispatch({ type: 'SET_WORK_DAYS', payload: updatedWorkDays });
        localStorage.setItem(getStorageKey('workDays'), JSON.stringify(updatedWorkDays));
      }
      
      if (relatedPayments.length > 0) {
        const updatedPayments = state.payments.filter(payment => payment.employeeId !== id);
        dispatch({ type: 'SET_PAYMENTS', payload: updatedPayments });
        localStorage.setItem(getStorageKey('payments'), JSON.stringify(updatedPayments));
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Work Day actions
  const addWorkDay = async (workDayData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newWorkDay = { 
        id: Date.now().toString(), 
        ...workDayData, 
        createdAt: new Date() 
      };
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('workDays');
        if (collectionRef) {
          const docRef = await addDoc(collectionRef, {
            ...workDayData,
            createdAt: new Date()
          });
          newWorkDay.id = docRef.id;
        }
      } catch (error) {
        console.warn('Firebase add work day error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'ADD_WORK_DAY', payload: newWorkDay });
      const updatedWorkDays = [...state.workDays, newWorkDay];
      localStorage.setItem(getStorageKey('workDays'), JSON.stringify(updatedWorkDays));
      
      return newWorkDay;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add work day' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateWorkDay = async (id, workDayData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedWorkDay = { id, ...workDayData };
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('workDays');
        if (collectionRef) {
          await updateDoc(doc(collectionRef, id), workDayData);
        }
      } catch (error) {
        console.warn('Firebase update work day error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'UPDATE_WORK_DAY', payload: updatedWorkDay });
      const updatedWorkDays = state.workDays.map(day => 
        day.id === id ? updatedWorkDay : day
      );
      localStorage.setItem(getStorageKey('workDays'), JSON.stringify(updatedWorkDays));
      
      return updatedWorkDay;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update work day' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteWorkDay = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('workDays');
        if (collectionRef) {
          await deleteDoc(doc(collectionRef, id));
        }
      } catch (error) {
        console.warn('Firebase delete work day error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'DELETE_WORK_DAY', payload: id });
      const updatedWorkDays = state.workDays.filter(day => day.id !== id);
      localStorage.setItem(getStorageKey('workDays'), JSON.stringify(updatedWorkDays));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete work day' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Payment actions
  const addPayment = async (paymentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newPayment = { 
        id: Date.now().toString(), 
        ...paymentData, 
        createdAt: new Date() 
      };
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('payments');
        if (collectionRef) {
          const docRef = await addDoc(collectionRef, {
            ...paymentData,
            createdAt: new Date()
          });
          newPayment.id = docRef.id;
        }
      } catch (error) {
        console.warn('Firebase add payment error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
      const updatedPayments = [...state.payments, newPayment];
      localStorage.setItem(getStorageKey('payments'), JSON.stringify(updatedPayments));
      
      return newPayment;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add payment' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePayment = async (id, paymentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedPayment = { id, ...paymentData };
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('payments');
        if (collectionRef) {
          await updateDoc(doc(collectionRef, id), paymentData);
        }
      } catch (error) {
        console.warn('Firebase update payment error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'UPDATE_PAYMENT', payload: updatedPayment });
      const updatedPayments = state.payments.map(payment => 
        payment.id === id ? updatedPayment : payment
      );
      localStorage.setItem(getStorageKey('payments'), JSON.stringify(updatedPayments));
      
      return updatedPayment;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update payment' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deletePayment = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Try Firebase first
        const collectionRef = getUserCollection('payments');
        if (collectionRef) {
          await deleteDoc(doc(collectionRef, id));
        }
      } catch (error) {
        console.warn('Firebase delete payment error:', error);
      }
      
      // Always update local state and localStorage
      dispatch({ type: 'DELETE_PAYMENT', payload: id });
      const updatedPayments = state.payments.filter(payment => payment.id !== id);
      localStorage.setItem(getStorageKey('payments'), JSON.stringify(updatedPayments));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete payment' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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
      const updatedSettings = { ...state.settings, ...newSettings };
      localStorage.setItem(getStorageKey('settings'), JSON.stringify(updatedSettings));
      
      // Sync with Firebase
      try {
        const settingsCollection = getUserCollection('settings');
        if (settingsCollection) {
          const settingsSnapshot = await getDocs(settingsCollection);
          if (settingsSnapshot.empty) {
            // Create new settings document
            await addDoc(settingsCollection, updatedSettings);
          } else {
            // Update existing settings document
            const settingsDoc = settingsSnapshot.docs[0];
            await updateDoc(doc(settingsCollection, settingsDoc.id), newSettings);
          }
        }
      } catch (error) {
        console.warn('Firebase update settings error:', error);
      }
    } catch (error) {
      console.warn('Error updating settings:', error);
    }
  };

  const value = {
    ...state,
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