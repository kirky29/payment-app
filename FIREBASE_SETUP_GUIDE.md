# Firebase Setup Guide

## 🔧 Step 1: Get Your Firebase Credentials

1. **Go to Firebase Console:**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project

2. **Get Project Settings:**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

3. **Add Web App (if not already added):**
   - Scroll down to "Your apps" section
   - If you don't see a web app, click "Add app" and choose "Web"
   - Give it a nickname (e.g., "Money Tracker Web")
   - Click "Register app"

4. **Copy Configuration:**
   - You'll see a configuration object that looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

## 🔧 Step 2: Update Your Firebase Configuration

### Option A: Direct Update (Quick)
Edit `src/firebase.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project.firebaseapp.com", // Your actual auth domain
  projectId: "your-project-id", // Your actual project ID
  storageBucket: "your-project.appspot.com", // Your actual storage bucket
  messagingSenderId: "123456789", // Your actual sender ID
  appId: "1:123456789:web:abc123" // Your actual app ID
};
```

### Option B: Environment Variables (Recommended)
1. Create a `.env` file in your project root:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

2. The `firebase.js` file is already configured to use these environment variables.

## 🔧 Step 3: Enable Authentication

1. **In Firebase Console:**
   - Go to "Authentication" in the left sidebar
   - Click "Get started" if you haven't set up authentication yet

2. **Enable Email/Password:**
   - Click on "Sign-in method" tab
   - Click on "Email/Password" in the list
   - Toggle "Enable" to turn it on
   - Click "Save"

3. **Configure Email Verification (Optional):**
   - Go to "Templates" tab
   - Click on "Verification email"
   - Customize the template if desired
   - Click "Save"

## 🔧 Step 4: Set Up Firestore Security Rules

1. **Go to Firestore Database:**
   - In Firebase Console, click "Firestore Database"
   - Click "Rules" tab

2. **Update Rules:**
   Replace the existing rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Deny all other access
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

3. **Click "Publish"**

## 🔧 Step 5: Test Your Setup

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser console** (F12) to see any error messages

3. **Try to sign up:**
   - Go to your app
   - Click "Sign Up" tab
   - Enter an email and password
   - Check the console for any error messages

## 🚨 Common Issues & Solutions

### "Email/password accounts are not enabled"
- **Solution:** Enable Email/Password authentication in Firebase Console > Authentication > Sign-in method

### "Permission denied" errors
- **Solution:** Update Firestore security rules as shown in Step 4

### "Invalid API key" or "Project not found"
- **Solution:** Double-check your Firebase configuration values

### "Network error"
- **Solution:** Check your internet connection and Firebase project status

### "App not authorized"
- **Solution:** Make sure you're using the correct Firebase project and app configuration

## 🔍 Debugging Tips

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for error messages in the Console tab
   - The improved error handling will show specific error codes

2. **Check Firebase Console:**
   - Go to Authentication > Users to see if users are being created
   - Check Firestore Database to see if data is being written

3. **Verify Configuration:**
   - Make sure all Firebase config values are correct
   - Ensure no extra spaces or characters in the values

## ✅ Success Indicators

When everything is working correctly, you should see:
- ✅ No console warnings about mock configuration
- ✅ Successful user registration in Firebase Console > Authentication > Users
- ✅ Email verification sent (check spam folder)
- ✅ Ability to log in after email verification
- ✅ User-specific data isolation

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** for specific error messages
2. **Verify your Firebase project** is active and not in test mode
3. **Ensure you're using the correct Firebase project** (check the project ID)
4. **Try creating a new Firebase project** if the current one has issues

The authentication system is designed to provide detailed error messages to help you troubleshoot any issues! 