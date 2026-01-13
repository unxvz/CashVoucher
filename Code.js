// Cash Online - Google Sheets Backend API
// Paste this in Google Apps Script

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const action = e.parameter.action;
  let result;
  
  try {
    switch(action) {
      // Settings
      case 'getSettings':
        result = getSettings();
        break;
      case 'updateInitialBalance':
        result = updateInitialBalance(JSON.parse(e.postData.contents));
        break;
      
      // Dashboard
      case 'getDashboard':
        result = getDashboard();
        break;
      
      // Transactions
      case 'getTransactions':
        result = getTransactions(e.parameter);
        break;
      case 'createTransaction':
        result = createTransaction(JSON.parse(e.postData.contents));
        break;
      case 'getTransaction':
        result = getTransaction(e.parameter.id);
        break;
      
      // Addresses
      case 'getAddresses':
        result = getAddresses();
        break;
      case 'createAddress':
        result = createAddress(JSON.parse(e.postData.contents));
        break;
      case 'updateAddress':
        result = updateAddress(JSON.parse(e.postData.contents));
        break;
      case 'deleteAddress':
        result = deleteAddress(e.parameter.id);
        break;
      
      // Reports
      case 'getDailyReport':
        result = getDailyReport(e.parameter.date);
        break;
      case 'getRangeReport':
        result = getRangeReport(e.parameter.start_date, e.parameter.end_date);
        break;
      
      // Init
      case 'initSheets':
        result = initializeSheets();
        break;
      
      default:
        result = { error: 'Unknown action' };
    }
  } catch(error) {
    result = { error: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Initialize sheets with headers
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Transactions sheet
  let txnSheet = ss.getSheetByName('transactions');
  if (!txnSheet) {
    txnSheet = ss.insertSheet('transactions');
  }
  if (txnSheet.getLastRow() === 0) {
    txnSheet.appendRow(['id', 'type', 'amount', 'address_id', 'address_name', 'description', 'reference_number', 'created_at', 'created_by']);
  }
  
  // Addresses sheet
  let addrSheet = ss.getSheetByName('addresses');
  if (!addrSheet) {
    addrSheet = ss.insertSheet('addresses');
  }
  if (addrSheet.getLastRow() === 0) {
    addrSheet.appendRow(['id', 'name', 'type', 'phone', 'email', 'notes', 'created_at', 'is_active']);
  }
  
  // Settings sheet
  let setSheet = ss.getSheetByName('settings');
  if (!setSheet) {
    setSheet = ss.insertSheet('settings');
  }
  if (setSheet.getLastRow() === 0) {
    setSheet.appendRow(['key', 'value']);
    setSheet.appendRow(['initial_balance', '0']);
  }
  
  return { success: true, message: 'Sheets initialized' };
}

// ==================== SETTINGS ====================
function getSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('settings');
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  settings.initial_balance = parseFloat(settings.initial_balance) || 0;
  settings.current_balance = getCurrentBalance();
  return settings;
}

function updateInitialBalance(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('settings');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === 'initial_balance') {
      sheet.getRange(i + 1, 2).setValue(data.initial_balance);
      break;
    }
  }
  return getSettings();
}

// ==================== BALANCE CALCULATIONS ====================
function getCurrentBalance() {
  const settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('settings');
  const settingsData = settings.getDataRange().getValues();
  let initialBalance = 0;
  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === 'initial_balance') {
      initialBalance = parseFloat(settingsData[i][1]) || 0;
      break;
    }
  }
  
  const txnSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('transactions');
  const txnData = txnSheet.getDataRange().getValues();
  let totalReceipts = 0;
  let totalPayments = 0;
  
  for (let i = 1; i < txnData.length; i++) {
    const type = txnData[i][1];
    const amount = parseFloat(txnData[i][2]) || 0;
    if (type === 'receipt') totalReceipts += amount;
    if (type === 'payment') totalPayments += amount;
  }
  
  return initialBalance + totalReceipts - totalPayments;
}

// ==================== DASHBOARD ====================
function getDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const txnSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('transactions');
  const txnData = txnSheet.getDataRange().getValues();
  
  let todayReceipts = 0, todayPayments = 0, todayCount = 0;
  let allReceipts = 0, allPayments = 0;
  const recentTxns = [];
  
  for (let i = txnData.length - 1; i >= 1; i--) {
    const row = txnData[i];
    const type = row[1];
    const amount = parseFloat(row[2]) || 0;
    const createdAt = row[7] ? new Date(row[7]).toISOString().split('T')[0] : '';
    
    if (type === 'receipt') allReceipts += amount;
    if (type === 'payment') allPayments += amount;
    
    if (createdAt === today) {
      if (type === 'receipt') todayReceipts += amount;
      if (type === 'payment') todayPayments += amount;
      todayCount++;
    }
    
    if (recentTxns.length < 10) {
      recentTxns.push({
        id: row[0], type: row[1], amount: row[2], address_id: row[3],
        address_name: row[4], description: row[5], reference_number: row[6],
        created_at: row[7], created_by: row[8]
      });
    }
  }
  
  const settings = getSettings();
  
  return {
    current_balance: settings.current_balance,
    initial_balance: settings.initial_balance,
    today: { date: today, receipts: todayReceipts, payments: todayPayments, transactions: todayCount },
    all_time: { receipts: allReceipts, payments: allPayments, transactions: txnData.length - 1 },
    recent_transactions: recentTxns
  };
}

// ==================== TRANSACTIONS ====================
function getTransactions(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('transactions');
  const data = sheet.getDataRange().getValues();
  let transactions = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const txn = {
      id: row[0], type: row[1], amount: row[2], address_id: row[3],
      address_name: row[4], description: row[5], reference_number: row[6],
      created_at: row[7], created_by: row[8]
    };
    
    // Apply filters
    if (params.type && txn.type !== params.type) continue;
    if (params.date) {
      const txnDate = new Date(txn.created_at).toISOString().split('T')[0];
      if (txnDate !== params.date) continue;
    }
    if (params.start_date) {
      const txnDate = new Date(txn.created_at).toISOString().split('T')[0];
      if (txnDate < params.start_date) continue;
    }
    if (params.end_date) {
      const txnDate = new Date(txn.created_at).toISOString().split('T')[0];
      if (txnDate > params.end_date) continue;
    }
    
    transactions.push(txn);
  }
  
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Pagination
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 50;
  const start = (page - 1) * limit;
  const paginatedTxns = transactions.slice(start, start + limit);
  
  return {
    transactions: paginatedTxns,
    pagination: {
      page: page,
      limit: limit,
      total: transactions.length,
      pages: Math.ceil(transactions.length / limit)
    }
  };
}

function getTransaction(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('transactions');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return {
        id: data[i][0], type: data[i][1], amount: data[i][2], address_id: data[i][3],
        address_name: data[i][4], description: data[i][5], reference_number: data[i][6],
        created_at: data[i][7], created_by: data[i][8]
      };
    }
  }
  return { error: 'Transaction not found' };
}

function createTransaction(data) {
  // Check balance for payments
  if (data.type === 'payment') {
    const currentBalance = getCurrentBalance();
    if (data.amount > currentBalance) {
      return { error: 'Insufficient balance. Current balance: ' + currentBalance.toFixed(2) + ' AED' };
    }
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('transactions');
  const id = Utilities.getUuid();
  const refNum = data.reference_number || (data.type.toUpperCase().slice(0, 3) + '-' + Date.now());
  const createdAt = new Date().toISOString();
  
  sheet.appendRow([
    id, data.type, data.amount, data.address_id || '',
    data.address_name, data.description || '', refNum, createdAt, 'operator'
  ]);
  
  return {
    transaction: {
      id: id, type: data.type, amount: data.amount, address_id: data.address_id,
      address_name: data.address_name, description: data.description,
      reference_number: refNum, created_at: createdAt, created_by: 'operator'
    },
    current_balance: getCurrentBalance()
  };
}

// ==================== ADDRESSES ====================
function getAddresses() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('addresses');
  const data = sheet.getDataRange().getValues();
  const addresses = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][7] !== 0 && data[i][7] !== '0') { // is_active
      addresses.push({
        id: data[i][0], name: data[i][1], type: data[i][2], phone: data[i][3],
        email: data[i][4], notes: data[i][5], created_at: data[i][6], is_active: data[i][7]
      });
    }
  }
  
  addresses.sort((a, b) => a.name.localeCompare(b.name));
  return addresses;
}

function createAddress(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('addresses');
  const id = Utilities.getUuid();
  const createdAt = new Date().toISOString();
  
  sheet.appendRow([id, data.name, data.type, data.phone || '', data.email || '', data.notes || '', createdAt, 1]);
  
  return {
    id: id, name: data.name, type: data.type, phone: data.phone,
    email: data.email, notes: data.notes, created_at: createdAt, is_active: 1
  };
}

function updateAddress(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('addresses');
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.id) {
      sheet.getRange(i + 1, 2).setValue(data.name);
      sheet.getRange(i + 1, 3).setValue(data.type);
      sheet.getRange(i + 1, 4).setValue(data.phone || '');
      sheet.getRange(i + 1, 5).setValue(data.email || '');
      sheet.getRange(i + 1, 6).setValue(data.notes || '');
      return { id: data.id, name: data.name, type: data.type, phone: data.phone, email: data.email, notes: data.notes };
    }
  }
  return { error: 'Address not found' };
}

function deleteAddress(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('addresses');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 8).setValue(0); // Set is_active to 0
      return { message: 'Address deleted successfully' };
    }
  }
  return { error: 'Address not found' };
}

// ==================== REPORTS ====================
function getDailyReport(date) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const txnSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('transactions');
  const txnData = txnSheet.getDataRange().getValues();
  
  let totalReceipts = 0, totalPayments = 0;
  const transactions = [];
  
  for (let i = 1; i < txnData.length; i++) {
    const row = txnData[i];
    const txnDate = row[7] ? new Date(row[7]).toISOString().split('T')[0] : '';
    
    if (txnDate === targetDate) {
      const amount = parseFloat(row[2]) || 0;
      if (row[1] === 'receipt') totalReceipts += amount;
      if (row[1] === 'payment') totalPayments += amount;
      
      transactions.push({
        id: row[0], type: row[1], amount: row[2], address_id: row[3],
        address_name: row[4], description: row[5], reference_number: row[6],
        created_at: row[7], created_by: row[8]
      });
    }
  }
  
  // Calculate opening balance (balance before this day)
  const settings = getSettings();
  let openingBalance = settings.initial_balance;
  for (let i = 1; i < txnData.length; i++) {
    const row = txnData[i];
    const txnDate = row[7] ? new Date(row[7]).toISOString().split('T')[0] : '';
    if (txnDate < targetDate) {
      const amount = parseFloat(row[2]) || 0;
      if (row[1] === 'receipt') openingBalance += amount;
      if (row[1] === 'payment') openingBalance -= amount;
    }
  }
  
  return {
    date: targetDate,
    opening_balance: openingBalance,
    total_receipts: totalReceipts,
    total_payments: totalPayments,
    closing_balance: openingBalance + totalReceipts - totalPayments,
    transactions: transactions,
    transaction_count: transactions.length
  };
}

function getRangeReport(startDate, endDate) {
  const txnSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('transactions');
  const txnData = txnSheet.getDataRange().getValues();
  
  let totalReceipts = 0, totalPayments = 0;
  const transactions = [];
  const dailyMap = {};
  
  // Calculate opening balance
  const settings = getSettings();
  let openingBalance = settings.initial_balance;
  
  for (let i = 1; i < txnData.length; i++) {
    const row = txnData[i];
    const txnDate = row[7] ? new Date(row[7]).toISOString().split('T')[0] : '';
    const amount = parseFloat(row[2]) || 0;
    
    if (txnDate < startDate) {
      if (row[1] === 'receipt') openingBalance += amount;
      if (row[1] === 'payment') openingBalance -= amount;
    }
    
    if (txnDate >= startDate && txnDate <= endDate) {
      if (row[1] === 'receipt') totalReceipts += amount;
      if (row[1] === 'payment') totalPayments += amount;
      
      transactions.push({
        id: row[0], type: row[1], amount: row[2], address_id: row[3],
        address_name: row[4], description: row[5], reference_number: row[6],
        created_at: row[7], created_by: row[8]
      });
      
      // Daily breakdown
      if (!dailyMap[txnDate]) {
        dailyMap[txnDate] = { date: txnDate, total_receipts: 0, total_payments: 0, transaction_count: 0 };
      }
      if (row[1] === 'receipt') dailyMap[txnDate].total_receipts += amount;
      if (row[1] === 'payment') dailyMap[txnDate].total_payments += amount;
      dailyMap[txnDate].transaction_count++;
    }
  }
  
  const dailyBreakdown = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    start_date: startDate,
    end_date: endDate,
    opening_balance: openingBalance,
    total_receipts: totalReceipts,
    total_payments: totalPayments,
    closing_balance: openingBalance + totalReceipts - totalPayments,
    transactions: transactions,
    daily_breakdown: dailyBreakdown,
    transaction_count: transactions.length
  };
}