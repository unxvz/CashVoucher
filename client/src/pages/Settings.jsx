import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Wallet,
  Check,
  AlertTriangle,
  Info,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage({ onBalanceUpdate }) {
  const [settings, setSettings] = useState(null);
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
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
      const res = await fetch('/api/settings/initial-balance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_balance: parseFloat(initialBalance) || 0 })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update settings');
      }

      const data = await res.json();
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
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-slate-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Configure your cash management system</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3 animate-slide-down">
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-green-300">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3 animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
      )}

      {/* Initial Balance Setting */}
      <div className="p-6 rounded-2xl glass space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Initial Cash Balance</h3>
            <p className="text-sm text-slate-400 mt-1">
              Set the starting balance for your cash box. This is the amount you had before recording any transactions.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Initial Balance (AED)</label>
            <div className="relative">
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-4 py-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-2xl font-mono placeholder-slate-500"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">AED</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium">Current Balance Calculation:</p>
              <p className="text-blue-400 mt-1">
                Current Balance = Initial Balance + Total Receipts - Total Payments
              </p>
              <p className="text-blue-400 mt-2">
                Current Balance: <span className="font-mono font-bold">{settings?.current_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-xl bg-primary-500 text-white font-semibold text-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      <div className="p-6 rounded-2xl glass space-y-4">
        <h3 className="text-lg font-semibold text-white">System Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-800/50">
            <span className="text-slate-400">Currency</span>
            <span className="text-white font-medium">AED (UAE Dirham)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/50">
            <span className="text-slate-400">Initial Balance</span>
            <span className="text-white font-mono">{settings?.initial_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/50">
            <span className="text-slate-400">Current Balance</span>
            <span className="text-primary-400 font-mono font-semibold">{settings?.current_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Last Updated</span>
            <span className="text-white">{settings?.updated_at ? new Date(settings.updated_at).toLocaleString('en-GB') : 'Never'}</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="p-6 rounded-2xl glass">
        <h3 className="text-lg font-semibold text-white mb-4">About Cash Online</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Cash Online is a comprehensive cash management system designed for recording and tracking 
          cash receipts and payments. Features include:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Record cash receipts and payments
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Print A5 receipts for signatures
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            View complete transaction history
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Generate daily and custom reports
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Manage address book
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Track closing balance at end of day
          </li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          Version 1.0.0 • Built with React & Node.js
        </p>
      </div>
    </div>
  );
}
