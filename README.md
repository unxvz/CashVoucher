# Cash Online - Cash Management System

A comprehensive online cash management system for recording and tracking cash receipts and payments. Built with Node.js/Express backend and React frontend.

## Features

- ✅ **Cash Receipt Recording** - Record incoming cash payments
- ✅ **Cash Payment Recording** - Record outgoing cash payments
- ✅ **Initial Balance Setup** - Set starting cash balance
- ✅ **Transaction History** - View all transactions with filters
- ✅ **A5 Print Receipts** - Print receipts for signatures
- ✅ **Daily Reports** - Generate daily cash reports with opening/closing balance
- ✅ **Custom Date Range Reports** - Generate reports for any date range
- ✅ **Address Book** - Manage contacts (customers, suppliers, employees)
- ✅ **Real-time Balance** - Always see current cash balance
- ✅ **Non-editable Transactions** - Recorded transactions cannot be modified (audit trail)
- ✅ **Export to CSV** - Export reports to CSV format

## Currency

All amounts are in **AED (UAE Dirham)**

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite (better-sqlite3)
- **Frontend**: React 18, Vite, TailwindCSS
- **Icons**: Lucide React

## Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Setup

1. Clone or navigate to the project directory:
```bash
cd "Cash Online"
```

2. Install all dependencies:
```bash
npm run setup
```

This will install both backend and frontend dependencies.

## Running the Application

### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev
```

- Backend runs on: http://localhost:3001
- Frontend runs on: http://localhost:5173

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The application will be available at http://localhost:3001

## Usage Guide

### 1. Set Initial Balance
- Go to **Settings** page
- Enter your starting cash balance
- Click **Save Settings**

### 2. Record Cash Receipt
- Go to **Cash Receipt** page
- Select or enter the payer's name
- Enter the amount
- Add description (optional)
- Click **Record Receipt**
- Print A5 receipt for signature if needed

### 3. Record Cash Payment
- Go to **Cash Payment** page
- Select or enter the payee's name
- Enter the amount (cannot exceed current balance)
- Add description (optional)
- Click **Record Payment**
- Print A5 voucher for signature if needed

### 4. View Transaction History
- Go to **History** page
- Use filters to narrow down results
- Search by name, description, or reference
- Print any transaction receipt

### 5. Generate Reports
- Go to **Reports** page
- Select **Daily Report** or **Custom Range**
- View opening balance, receipts, payments, and closing balance
- Print or export to CSV

### 6. Manage Address Book
- Go to **Address Book** page
- Add customers, suppliers, employees
- Edit or delete contacts

## API Endpoints

### Settings
- `GET /api/settings` - Get current settings and balance
- `PUT /api/settings/initial-balance` - Update initial balance

### Addresses
- `GET /api/addresses` - Get all addresses
- `POST /api/addresses` - Create new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Transactions
- `GET /api/transactions` - Get transactions (with pagination & filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction (receipt or payment)

### Reports
- `GET /api/reports/daily` - Get daily report
- `GET /api/reports/range` - Get report for date range
- `GET /api/dashboard` - Get dashboard summary

## Database

SQLite database is stored at `server/cash.db`. The database is automatically created on first run.

## Print Settings

For best A5 printing:
1. Use Chrome or Edge browser
2. Set paper size to A5 in print dialog
3. Set margins to minimum
4. Disable headers and footers

## License

MIT License
