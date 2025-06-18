import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// TODO: Replace these values with your actual Firebase project credentials
// You can find these in Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCXazGEyKn66-uC1R5uEP9Qk_kjl-EtVuI",
  authDomain: "payment-app-3282c.firebaseapp.com",
  projectId: "payment-app-3282c",
  storageBucket: "payment-app-3282c.firebasestorage.app",
  messagingSenderId: "886832819731",
  appId: "1:886832819731:web:114fac9d0587ceab5cd9e6",
  measurementId: "G-T1HL94C23Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app; 