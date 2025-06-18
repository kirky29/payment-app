# Firebase Authentication Setup

This guide will help you set up Firebase Authentication for the Money Tracker app.

## Prerequisites

1. A Firebase project (already configured in `firebase.js`)
2. Firebase Console access

## Step 1: Enable Email/Password Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click on **Authentication**
4. Click on the **Sign-in method** tab
5. Click on **Email/Password** in the list of providers
6. Toggle the **Enable** switch to turn it on
7. Check the **Email link (passwordless sign-in)** option if you want passwordless authentication
8. Click **Save**

## Step 2: Configure Email Verification (Optional but Recommended)

1. In the Authentication section, go to **Templates** tab
2. Click on **Verification email**
3. Customize the email template if desired
4. Click **Save**

## Step 3: Set Up Security Rules (Important)

In your Firebase Console, go to **Firestore Database** > **Rules** and update the security rules:

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

## Step 4: Test the Authentication

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5175`
3. You should be redirected to the login page
4. Create a new account or sign in with existing credentials
5. Verify your email address if required

## Features Implemented

### Authentication Features
- ✅ Email/Password registration and login
- ✅ Email verification requirement
- ✅ Password reset functionality
- ✅ Secure logout
- ✅ Protected routes
- ✅ User-specific data isolation

### User Experience
- ✅ Beautiful login/signup interface
- ✅ Email verification page
- ✅ Loading states and error handling
- ✅ User menu with logout option
- ✅ Responsive design

### Data Security
- ✅ User-specific Firebase collections (`users/{userId}/employees`, etc.)
- ✅ User-specific localStorage keys
- ✅ Automatic data cleanup on logout
- ✅ Secure routing

## User Flow

1. **Unauthenticated User**: Redirected to `/login`
2. **Registration**: User creates account → Email verification sent
3. **Email Verification**: User must verify email before accessing app
4. **Authenticated User**: Access to all app features with user-specific data
5. **Logout**: Clears all data and redirects to login

## Data Structure

Each user's data is stored in Firebase under:
- `users/{userId}/employees` - Employee records
- `users/{userId}/workDays` - Work day records  
- `users/{userId}/payments` - Payment records

LocalStorage keys are also user-specific:
- `employees_{userId}`
- `workDays_{userId}`
- `payments_{userId}`

## Troubleshooting

### Common Issues

1. **"Email/password accounts are not enabled"**
   - Make sure Email/Password authentication is enabled in Firebase Console

2. **"Permission denied" errors**
   - Check that Firestore security rules are properly configured

3. **Email verification not working**
   - Check spam folder
   - Verify email template is configured in Firebase Console

4. **Data not syncing between devices**
   - Ensure user is logged in on both devices
   - Check Firebase connection

### Development Tips

- Use browser dev tools to check for authentication errors
- Monitor Firebase Console logs for authentication events
- Test with different email addresses to ensure data isolation
- Clear localStorage if testing with multiple accounts

## Security Notes

- All user data is isolated by user ID
- Firebase handles password hashing and security
- No sensitive data is stored in localStorage
- Authentication state is managed by Firebase Auth
- Routes are protected at the component level

The authentication system is now fully integrated and ready to use! 