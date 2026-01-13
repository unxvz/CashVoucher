import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Wallet,
  Check,
  AlertTriangle,
  Info,
  RefreshCw
} from 'lucide-react';
import { getSettings, updateInitialBalance } from '../api';

export default function SettingsPage({ onBalanceUpdate }) {
  const [settings, setSettings] = useState(null);
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchSettings();
  }, []);

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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure your cash management system</p>
        </div>
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

      {/* About */}
      <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Cash Online</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Cash Online is a comprehensive cash management system designed for recording and tracking 
          cash receipts and payments. Features include:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Record cash receipts and payments
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Print A5 receipts for signatures
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            View complete transaction history
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Generate daily and custom reports
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Manage address book
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Track closing balance at end of day
          </li>
        </ul>
        <p className="mt-4 text-xs text-gray-400">
          Version 1.0.0 • Built with React + Google Sheets
        </p>
      </div>
    </div>
  );
}
