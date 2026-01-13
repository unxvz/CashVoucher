import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Calendar,
  RefreshCw
} from 'lucide-react';

export default function Dashboard({ onBalanceUpdate }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboard();
    onBalanceUpdate?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your cash operations</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {/* Current Balance */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-600/20 to-primary-700/10 border border-primary-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-400" />
            </div>
            <span className="text-xs text-primary-300 uppercase tracking-wider">Balance</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {dashboard?.current_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-primary-300 mt-1">AED</p>
        </div>

        {/* Today's Receipts */}
        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Today's Receipts</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {dashboard?.today?.receipts?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-400 mt-1">AED</p>
        </div>

        {/* Today's Payments */}
        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Today's Payments</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {dashboard?.today?.payments?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-orange-400 mt-1">AED</p>
        </div>

        {/* Today's Transactions */}
        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Today's Txns</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {dashboard?.today?.transactions || 0}
          </p>
          <p className="text-sm text-blue-400 mt-1">Transactions</p>
        </div>
      </div>

      {/* All Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-slate-400">All Time Receipts</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {dashboard?.all_time?.receipts?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} 
            <span className="text-sm text-slate-400 ml-1">AED</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            <span className="text-slate-400">All Time Payments</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {dashboard?.all_time?.payments?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} 
            <span className="text-sm text-slate-400 ml-1">AED</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-primary-400" />
            <span className="text-slate-400">Initial Balance</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {dashboard?.initial_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} 
            <span className="text-sm text-slate-400 ml-1">AED</span>
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl glass overflow-hidden">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        </div>
        
        {dashboard?.recent_transactions?.length > 0 ? (
          <div className="divide-y divide-slate-800/50">
            {dashboard.recent_transactions.map((txn, index) => (
              <div 
                key={txn.id} 
                className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    txn.type === 'receipt' 
                      ? 'bg-green-500/20' 
                      : 'bg-orange-500/20'
                  }`}>
                    {txn.type === 'receipt' 
                      ? <ArrowDownCircle className="w-5 h-5 text-green-400" />
                      : <ArrowUpCircle className="w-5 h-5 text-orange-400" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-white">{txn.address_name}</p>
                    <p className="text-sm text-slate-400">
                      {txn.description || txn.reference_number}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-semibold ${
                    txn.type === 'receipt' ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {txn.type === 'receipt' ? '+' : '-'}
                    {txn.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(txn.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
