const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration - supports both SQLite (local) and PostgreSQL (production)
let db;
let isPostgres = false;

if (process.env.DATABASE_URL) {
  // PostgreSQL for production
  const { Pool } = require('pg');
  isPostgres = true;
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('📊 Using PostgreSQL database');
} else {
  // SQLite for local development
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, 'cash.db');
  db = new Database(dbPath);
  console.log(`📊 Using SQLite database: ${dbPath}`);
}

// Initialize database tables
async function initDatabase() {
  if (isPostgres) {
    // PostgreSQL initialization
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        initial_balance DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK(type IN ('receipt', 'payment')),
        amount DECIMAL(15,2) NOT NULL,
        address_id VARCHAR(36),
        address_name VARCHAR(255) NOT NULL,
        description TEXT,
        reference_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100) DEFAULT 'operator'
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);
    
    // Insert default settings if not exists
    const settingsCheck = await db.query('SELECT id FROM settings WHERE id = 1');
    if (settingsCheck.rows.length === 0) {
      await db.query('INSERT INTO settings (id, initial_balance) VALUES (1, 0)');
    }
  } else {
    // SQLite initialization
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        initial_balance REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('receipt', 'payment')),
        amount REAL NOT NULL,
        address_id TEXT,
        address_name TEXT NOT NULL,
        description TEXT,
        reference_number TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT DEFAULT 'operator',
        FOREIGN KEY (address_id) REFERENCES addresses(id)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_address_id ON transactions(address_id);

      INSERT OR IGNORE INTO settings (id, initial_balance) VALUES (1, 0);
    `);
  }
}

// Database query helpers
async function queryOne(sql, params = []) {
  if (isPostgres) {
    const result = await db.query(sql, params);
    return result.rows[0];
  } else {
    return db.prepare(sql).get(...params);
  }
}

async function queryAll(sql, params = []) {
  if (isPostgres) {
    const result = await db.query(sql, params);
    return result.rows;
  } else {
    return db.prepare(sql).all(...params);
  }
}

async function run(sql, params = []) {
  if (isPostgres) {
    await db.query(sql, params);
  } else {
    db.prepare(sql).run(...params);
  }
}

// Helper function to get current balance
async function getCurrentBalance() {
  const settings = await queryOne('SELECT initial_balance FROM settings WHERE id = 1');
  const totals = await queryOne(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
      COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments
    FROM transactions
  `);
  
  return parseFloat(settings.initial_balance) + parseFloat(totals.total_receipts) - parseFloat(totals.total_payments);
}

// Helper function to get balance at specific date
async function getBalanceAtDate(date) {
  const settings = await queryOne('SELECT initial_balance FROM settings WHERE id = 1');
  
  const sql = isPostgres 
    ? `SELECT 
        COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
        COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments
       FROM transactions
       WHERE DATE(created_at) <= DATE($1)`
    : `SELECT 
        COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
        COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments
       FROM transactions
       WHERE date(created_at) <= date(?)`;
  
  const totals = await queryOne(sql, [date]);
  
  return parseFloat(settings.initial_balance) + parseFloat(totals.total_receipts) - parseFloat(totals.total_payments);
}

// ==================== SETTINGS ROUTES ====================

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await queryOne('SELECT * FROM settings WHERE id = 1');
    const currentBalance = await getCurrentBalance();
    res.json({ ...settings, current_balance: currentBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update initial balance
app.put('/api/settings/initial-balance', async (req, res) => {
  try {
    const { initial_balance } = req.body;
    if (typeof initial_balance !== 'number' || initial_balance < 0) {
      return res.status(400).json({ error: 'Invalid initial balance' });
    }
    
    const sql = isPostgres
      ? 'UPDATE settings SET initial_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1'
      : 'UPDATE settings SET initial_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1';
    
    await run(sql, [initial_balance]);
    
    const settings = await queryOne('SELECT * FROM settings WHERE id = 1');
    const currentBalance = await getCurrentBalance();
    res.json({ ...settings, current_balance: currentBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADDRESS ROUTES ====================

// Get all addresses
app.get('/api/addresses', async (req, res) => {
  try {
    const addresses = await queryAll('SELECT * FROM addresses WHERE is_active = 1 ORDER BY name');
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create address
app.post('/api/addresses', async (req, res) => {
  try {
    const { name, type, phone, email, notes } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    const id = uuidv4();
    const sql = isPostgres
      ? 'INSERT INTO addresses (id, name, type, phone, email, notes) VALUES ($1, $2, $3, $4, $5, $6)'
      : 'INSERT INTO addresses (id, name, type, phone, email, notes) VALUES (?, ?, ?, ?, ?, ?)';
    
    await run(sql, [id, name, type, phone || null, email || null, notes || null]);
    
    const address = await queryOne(
      isPostgres ? 'SELECT * FROM addresses WHERE id = $1' : 'SELECT * FROM addresses WHERE id = ?',
      [id]
    );
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update address
app.put('/api/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, phone, email, notes } = req.body;
    
    const sql = isPostgres
      ? 'UPDATE addresses SET name = $1, type = $2, phone = $3, email = $4, notes = $5 WHERE id = $6'
      : 'UPDATE addresses SET name = ?, type = ?, phone = ?, email = ?, notes = ? WHERE id = ?';
    
    await run(sql, [name, type, phone || null, email || null, notes || null, id]);
    
    const address = await queryOne(
      isPostgres ? 'SELECT * FROM addresses WHERE id = $1' : 'SELECT * FROM addresses WHERE id = ?',
      [id]
    );
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete address (soft delete)
app.delete('/api/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = isPostgres
      ? 'UPDATE addresses SET is_active = 0 WHERE id = $1'
      : 'UPDATE addresses SET is_active = 0 WHERE id = ?';
    await run(sql, [id]);
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TRANSACTION ROUTES ====================

// Get all transactions with pagination and filters
app.get('/api/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 50, type, date, start_date, end_date, address_id } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '1=1';
    const params = [];
    let paramIndex = 1;
    
    if (type) {
      whereClause += isPostgres ? ` AND type = $${paramIndex++}` : ' AND type = ?';
      params.push(type);
    }
    if (date) {
      whereClause += isPostgres ? ` AND DATE(created_at) = DATE($${paramIndex++})` : ' AND date(created_at) = date(?)';
      params.push(date);
    }
    if (start_date) {
      whereClause += isPostgres ? ` AND DATE(created_at) >= DATE($${paramIndex++})` : ' AND date(created_at) >= date(?)';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += isPostgres ? ` AND DATE(created_at) <= DATE($${paramIndex++})` : ' AND date(created_at) <= date(?)';
      params.push(end_date);
    }
    if (address_id) {
      whereClause += isPostgres ? ` AND address_id = $${paramIndex++}` : ' AND address_id = ?';
      params.push(address_id);
    }
    
    const countSql = `SELECT COUNT(*) as total FROM transactions WHERE ${whereClause}`;
    const countResult = await queryOne(countSql, params);
    const total = parseInt(countResult.total);
    
    const querySql = isPostgres
      ? `SELECT * FROM transactions WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
      : `SELECT * FROM transactions WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    const transactions = await queryAll(querySql, [...params, parseInt(limit), offset]);
    
    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single transaction
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = isPostgres
      ? 'SELECT * FROM transactions WHERE id = $1'
      : 'SELECT * FROM transactions WHERE id = ?';
    const transaction = await queryOne(sql, [id]);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction (receipt or payment)
app.post('/api/transactions', async (req, res) => {
  try {
    const { type, amount, address_id, address_name, description, reference_number } = req.body;
    
    if (!type || !['receipt', 'payment'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    if (!address_name) {
      return res.status(400).json({ error: 'Address name is required' });
    }
    
    // Check if payment would result in negative balance
    if (type === 'payment') {
      const currentBalance = await getCurrentBalance();
      if (amount > currentBalance) {
        return res.status(400).json({ 
          error: `Insufficient balance. Current balance: ${currentBalance.toFixed(2)} AED` 
        });
      }
    }
    
    const id = uuidv4();
    const refNum = reference_number || `${type.toUpperCase().slice(0, 3)}-${Date.now()}`;
    
    const sql = isPostgres
      ? 'INSERT INTO transactions (id, type, amount, address_id, address_name, description, reference_number) VALUES ($1, $2, $3, $4, $5, $6, $7)'
      : 'INSERT INTO transactions (id, type, amount, address_id, address_name, description, reference_number) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    await run(sql, [id, type, amount, address_id || null, address_name, description || null, refNum]);
    
    const transaction = await queryOne(
      isPostgres ? 'SELECT * FROM transactions WHERE id = $1' : 'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    const newBalance = await getCurrentBalance();
    
    res.status(201).json({ transaction, current_balance: newBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DAILY REPORT ROUTES ====================

// Get daily report
app.get('/api/reports/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Get previous day's closing balance as opening balance
    const previousDate = new Date(targetDate);
    previousDate.setDate(previousDate.getDate() - 1);
    const openingBalance = await getBalanceAtDate(previousDate.toISOString().split('T')[0]);
    
    // Get today's transactions
    const todaySql = isPostgres
      ? `SELECT 
          COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
          COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments
         FROM transactions
         WHERE DATE(created_at) = DATE($1)`
      : `SELECT 
          COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
          COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments
         FROM transactions
         WHERE date(created_at) = date(?)`;
    
    const todayTotals = await queryOne(todaySql, [targetDate]);
    
    const txnSql = isPostgres
      ? 'SELECT * FROM transactions WHERE DATE(created_at) = DATE($1) ORDER BY created_at ASC'
      : 'SELECT * FROM transactions WHERE date(created_at) = date(?) ORDER BY created_at ASC';
    
    const todayTransactions = await queryAll(txnSql, [targetDate]);
    
    const closingBalance = openingBalance + parseFloat(todayTotals.total_receipts) - parseFloat(todayTotals.total_payments);
    
    res.json({
      date: targetDate,
      opening_balance: openingBalance,
      total_receipts: parseFloat(todayTotals.total_receipts),
      total_payments: parseFloat(todayTotals.total_payments),
      closing_balance: closingBalance,
      transactions: todayTransactions,
      transaction_count: todayTransactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get report for date range
app.get('/api/reports/range', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const prevDate = new Date(start_date);
    prevDate.setDate(prevDate.getDate() - 1);
    const openingBalance = await getBalanceAtDate(prevDate.toISOString().split('T')[0]);
    
    const totalsSql = isPostgres
      ? `SELECT 
          COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
          COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments
         FROM transactions
         WHERE DATE(created_at) >= DATE($1) AND DATE(created_at) <= DATE($2)`
      : `SELECT 
          COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
          COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments
         FROM transactions
         WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)`;
    
    const totals = await queryOne(totalsSql, [start_date, end_date]);
    
    const txnSql = isPostgres
      ? 'SELECT * FROM transactions WHERE DATE(created_at) >= DATE($1) AND DATE(created_at) <= DATE($2) ORDER BY created_at ASC'
      : 'SELECT * FROM transactions WHERE date(created_at) >= date(?) AND date(created_at) <= date(?) ORDER BY created_at ASC';
    
    const transactions = await queryAll(txnSql, [start_date, end_date]);
    
    const closingBalance = openingBalance + parseFloat(totals.total_receipts) - parseFloat(totals.total_payments);
    
    // Daily breakdown
    const breakdownSql = isPostgres
      ? `SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
          COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments,
          COUNT(*) as transaction_count
         FROM transactions
         WHERE DATE(created_at) >= DATE($1) AND DATE(created_at) <= DATE($2)
         GROUP BY DATE(created_at)
         ORDER BY DATE(created_at) ASC`
      : `SELECT 
          date(created_at) as date,
          COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
          COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments,
          COUNT(*) as transaction_count
         FROM transactions
         WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)
         GROUP BY date(created_at)
         ORDER BY date(created_at) ASC`;
    
    const dailyBreakdown = await queryAll(breakdownSql, [start_date, end_date]);
    
    res.json({
      start_date,
      end_date,
      opening_balance: openingBalance,
      total_receipts: parseFloat(totals.total_receipts),
      total_payments: parseFloat(totals.total_payments),
      closing_balance: closingBalance,
      transactions,
      daily_breakdown: dailyBreakdown,
      transaction_count: transactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard summary
app.get('/api/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentBalance = await getCurrentBalance();
    const settings = await queryOne('SELECT initial_balance FROM settings WHERE id = 1');
    
    // Today's summary
    const todaySql = isPostgres
      ? `SELECT 
          COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
          COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments,
          COUNT(*) as transaction_count
         FROM transactions
         WHERE DATE(created_at) = DATE($1)`
      : `SELECT 
          COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as total_receipts,
          COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as total_payments,
          COUNT(*) as transaction_count
         FROM transactions
         WHERE date(created_at) = date(?)`;
    
    const todayTotals = await queryOne(todaySql, [today]);
    
    // Recent transactions
    const recentSql = isPostgres
      ? 'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10'
      : 'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10';
    const recentTransactions = await queryAll(recentSql);
    
    // Total counts
    const totalCounts = await queryOne(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN type = 'receipt' THEN amount ELSE 0 END), 0) as all_time_receipts,
        COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as all_time_payments
      FROM transactions
    `);
    
    res.json({
      current_balance: currentBalance,
      initial_balance: parseFloat(settings.initial_balance),
      today: {
        date: today,
        receipts: parseFloat(todayTotals.total_receipts),
        payments: parseFloat(todayTotals.total_payments),
        transactions: parseInt(todayTotals.transaction_count)
      },
      all_time: {
        receipts: parseFloat(totalCounts.all_time_receipts),
        payments: parseFloat(totalCounts.all_time_payments),
        transactions: parseInt(totalCounts.total_transactions)
      },
      recent_transactions: recentTransactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Cash Online Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
