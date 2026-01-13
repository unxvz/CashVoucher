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
import { getDashboard } from '../api';

export default function Dashboard({ onBalanceUpdate }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await getDashboard();
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
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your cash operations</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Balance */}
        <div className="p-5 rounded-lg bg-blue-600 text-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs text-blue-100 uppercase tracking-wider font-medium">Balance</span>
          </div>
          <p className="text-2xl font-bold">
            {dashboard?.current_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-blue-100 mt-1">AED</p>
        </div>

        {/* Today's Receipts */}
        <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Today's Receipts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {dashboard?.today?.receipts?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-600 mt-1">AED</p>
        </div>

        {/* Today's Payments */}
        <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Today's Payments</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {dashboard?.today?.payments?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-red-600 mt-1">AED</p>
        </div>

        {/* Today's Transactions */}
        <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Today's Txns</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {dashboard?.today?.transactions || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Transactions</p>
        </div>
      </div>

      {/* All Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-gray-500 font-medium">All Time Receipts</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {dashboard?.all_time?.receipts?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} 
            <span className="text-sm text-gray-500 font-normal ml-1">AED</span>
          </p>
        </div>

        <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-gray-500 font-medium">All Time Payments</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {dashboard?.all_time?.payments?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} 
            <span className="text-sm text-gray-500 font-normal ml-1">AED</span>
          </p>
        </div>

        <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span className="text-gray-500 font-medium">Initial Balance</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {dashboard?.initial_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} 
            <span className="text-sm text-gray-500 font-normal ml-1">AED</span>
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        
        {dashboard?.recent_transactions?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {dashboard.recent_transactions.map((txn) => (
              <div 
                key={txn.id} 
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    txn.type === 'receipt' 
                      ? 'bg-green-50' 
                      : 'bg-red-50'
                  }`}>
                    {txn.type === 'receipt' 
                      ? <ArrowDownCircle className="w-5 h-5 text-green-600" />
                      : <ArrowUpCircle className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{txn.address_name}</p>
                    <p className="text-sm text-gray-500">
                      {txn.description || txn.reference_number}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    txn.type === 'receipt' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'receipt' ? '+' : '-'}
                    {txn.amount?.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED
                  </p>
                  <p className="text-xs text-gray-400">
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
          <div className="p-12 text-center text-gray-400">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
