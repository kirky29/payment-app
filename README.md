# Money Tracker App

A comprehensive work day and payment management system designed to track daily work activities and payments for multiple employees. Built with React, Firebase, and Material-UI.

## Features

### 🏢 Employee Management
- **Add/Edit Employees**: Create employee profiles with name and daily rate
- **Employee Dashboard**: View individual employee details with financial summaries
- **Employee List**: Overview of all employees with total owed/paid amounts
- **Employee Deletion**: Remove employees and their associated data

### 📅 Work Day Tracking
- **Add Work Days**: Record work days for employees with date and optional notes
- **Daily Rate Calculation**: Automatically calculates earnings based on daily rate
- **Work History**: View all work days for each employee
- **Work Day Details**: View and edit individual work day information

### 💰 Payment Management
- **Record Payments**: Add payments with amount, date, payment method, and notes
- **Payment Methods**: Support for Cash, Check, Bank Transfer, PayPal, and Other
- **Payment History**: Track all payments made to each employee
- **Payment Status**: Track paid vs unpaid work days

### 📊 Calendar View
- **Monthly Calendar**: Visual representation of work days and payments
- **Color Coding**: Green for paid days, orange for unpaid days, purple for notes
- **Day Details**: Tap on calendar days to view detailed information
- **Month Navigation**: Navigate between months

### 📈 Reporting & Analytics
- **Financial Reports**: View total owed, total paid, and outstanding amounts
- **Filtering Options**: Filter by payment status, date ranges, payment methods
- **Search Functionality**: Search employees by name
- **Charts & Graphs**: Visual analytics with bar charts and pie charts
- **Payment Method Breakdown**: Analyze payments by method

### ⚙️ Settings & Configuration
- **Currency Settings**: Support for multiple currencies (USD, GBP, EUR, JPY, INR, AUD, CAD)
- **Data Management**: Delete individual employees or all data
- **App Configuration**: Various app settings and preferences

## Tech Stack

- **Frontend**: React 19 with Hooks
- **UI Framework**: Material-UI (MUI) v5
- **Backend**: Firebase Firestore
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Payment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Get your Firebase configuration

4. **Configure Firebase**
   - Open `src/firebase.js`
   - Replace the placeholder configuration with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## Usage

### Adding Employees
1. Navigate to the Employees tab
2. Click "Add Employee"
3. Enter employee name and daily rate
4. Click "Add"

### Recording Work Days
1. Click on an employee card
2. Go to the "Work Days" tab
3. Click "Add Work Day"
4. Select date and add optional notes
5. Click "Add"

### Recording Payments
1. Click on an employee card
2. Go to the "Payments" tab
3. Click "Add Payment"
4. Enter amount, date, payment method, and optional notes
5. Click "Add"

### Viewing Calendar
1. Navigate to the Calendar tab
2. Use the arrow buttons to navigate between months
3. Click on any day to view details
4. Color coding shows:
   - 🟢 Green: Paid work day
   - 🟠 Orange: Unpaid work day
   - 🟣 Purple: Payment only

### Generating Reports
1. Navigate to the Reports tab
2. View overall statistics at the top
3. Use filters to narrow down data
4. Switch between different chart views

## Data Structure

The app uses three main collections in Firestore:

### Employees Collection
```javascript
{
  id: "auto-generated",
  name: "Employee Name",
  dailyRate: 150.00,
  totalOwed: 0,
  totalPaid: 0,
  createdAt: "timestamp"
}
```

### Work Days Collection
```javascript
{
  id: "auto-generated",
  employeeId: "employee-id",
  date: "2024-01-15",
  notes: "Optional notes",
  createdAt: "timestamp"
}
```

### Payments Collection
```javascript
{
  id: "auto-generated",
  employeeId: "employee-id",
  amount: 300.00,
  date: "2024-01-15",
  paymentMethod: "Cash",
  notes: "Optional notes",
  createdAt: "timestamp"
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Build the app**
   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy
   ```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## Roadmap

- [ ] User authentication
- [ ] Multi-tenant support
- [ ] Export to PDF/Excel
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Time tracking integration
- [ ] Invoice generation

---

**Note**: This app is designed for small businesses, contractors, or anyone managing multiple workers with daily rate compensation. Make sure to comply with local labor laws and regulations when using this tool for actual employee management. 