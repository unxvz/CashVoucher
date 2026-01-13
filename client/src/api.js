// Google Sheets API Configuration
const API_URL = 'https://script.google.com/macros/s/AKfycby69l03yPUWV_evX1vChqIsTqFFMOndjl3-MmBrbo9Yglq6BdE_qgnARvSl63bCAs4/exec';

// Helper function for GET requests
async function apiGet(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.append('action', action);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
    });
    return response.json();
  } catch (error) {
    console.error('API GET Error:', error);
    return { error: error.message };
  }
}

// Helper function for POST requests - using GET with data in URL for Google Apps Script
async function apiPost(action, data) {
  const url = new URL(API_URL);
  url.searchParams.append('action', action);
  url.searchParams.append('data', JSON.stringify(data));
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
    });
    return response.json();
  } catch (error) {
    console.error('API POST Error:', error);
    return { error: error.message };
  }
}

// ==================== SETTINGS ====================
export async function getSettings() {
  return apiGet('getSettings');
}

export async function updateInitialBalance(initial_balance) {
  return apiPost('updateInitialBalance', { initial_balance });
}

// ==================== DASHBOARD ====================
export async function getDashboard() {
  return apiGet('getDashboard');
}

// ==================== TRANSACTIONS ====================
export async function getTransactions(params = {}) {
  return apiGet('getTransactions', params);
}

export async function getTransaction(id) {
  return apiGet('getTransaction', { id });
}

export async function createTransaction(data) {
  return apiPost('createTransaction', data);
}

// ==================== ADDRESSES ====================
export async function getAddresses() {
  return apiGet('getAddresses');
}

export async function createAddress(data) {
  return apiPost('createAddress', data);
}

export async function updateAddress(data) {
  return apiPost('updateAddress', data);
}

export async function deleteAddress(id) {
  return apiGet('deleteAddress', { id });
}

// ==================== REPORTS ====================
export async function getDailyReport(date) {
  return apiGet('getDailyReport', { date });
}

export async function getRangeReport(start_date, end_date) {
  return apiGet('getRangeReport', { start_date, end_date });
}

// ==================== INIT ====================
export async function initSheets() {
  return apiGet('initSheets');
}
