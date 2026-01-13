import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Wallet,
  Check,
  AlertTriangle,
  Info,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { getSettings, updateInitialBalance } from '../api';

// Admin Password - Change this to your desired password
const ADMIN_PASSWORD = 'admin123';

export default function SettingsPage({ onBalanceUpdate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const [settings, setSettings] = useState(null);
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Check if locked
  useEffect(() => {
    if (authAttempts >= 3) {
      setIsLocked(true);
      setLockTimer(30);
    }
  }, [authAttempts]);

  // Lock timer countdown
  useEffect(() => {
    if (isLocked && lockTimer > 0) {
      const timer = setTimeout(() => {
        setLockTimer(lockTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockTimer === 0 && isLocked) {
      setIsLocked(false);
      setAuthAttempts(0);
    }
  }, [isLocked, lockTimer]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      setPassword('');
      fetchSettings();
    } else {
      setAuthAttempts(prev => prev + 1);
      setAuthError(`Incorrect password. ${3 - authAttempts - 1} attempts remaining.`);
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
      setInitialBalance(data.initial_balance?.toString() || '0');
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await updateInitialBalance(parseFloat(initialBalance) || 0);

      if (data.error) {
        throw new Error(data.error);
      }

      setSettings(data);
      setSuccess('Settings updated successfully!');
      onBalanceUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="p-8 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-500 mt-2">Enter admin password to access settings</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle size={16} />
              {authError}
            </div>
          )}

          {isLocked && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center gap-2 text-yellow-700 text-sm">
              <Lock size={16} />
              Too many attempts. Try again in {lockTimer} seconds.
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  disabled={isLocked}
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLocked || !password}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              <span>Access Settings</span>
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Contact administrator if you forgot the password
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-500">Configure your cash management system</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Lock size={16} />
          <span>Logout</span>
        </button>
      </div>

      {/* Admin Badge */}
      <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-700">
        <Shield size={18} />
        <span className="font-medium">Authenticated as Administrator</span>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Initial Balance Setting */}
      <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Initial Cash Balance</h3>
            <p className="text-sm text-gray-500 mt-1">
              Set the starting balance for your cash box. This is the amount you had before recording any transactions.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Initial Balance (AED)</label>
            <div className="relative">
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 text-xl font-semibold placeholder-gray-400"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">AED</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Current Balance Calculation:</p>
              <p className="text-blue-600 mt-1">
                Current Balance = Initial Balance + Total Receipts - Total Payments
              </p>
              <p className="text-blue-700 mt-2 font-semibold">
                Current Balance: {settings?.current_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Currency</span>
            <span className="text-gray-900 font-medium">AED (UAE Dirham)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Initial Balance</span>
            <span className="text-gray-900">{settings?.initial_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Current Balance</span>
            <span className="text-blue-600 font-semibold">{settings?.current_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Database</span>
            <span className="text-gray-900">Google Sheets</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Security Notice</p>
            <p className="mt-1">
              Remember to logout when you're done. Your session will remain active until you logout or close the browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
