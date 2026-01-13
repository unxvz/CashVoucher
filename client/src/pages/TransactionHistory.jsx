import { useState, useEffect } from 'react';
import { 
  History, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search,
  Filter,
  Calendar,
  Printer,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye
} from 'lucide-react';
import PrintReceipt from '../components/PrintReceipt';
import { getTransactions } from '../api';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    start_date: '',
    end_date: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.type) params.type = filters.type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const data = await getTransactions(params);
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilter = () => {
    fetchTransactions(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ type: '', start_date: '', end_date: '', search: '' });
    setTimeout(() => fetchTransactions(1), 0);
  };

  const handlePrint = (transaction) => {
    setSelectedTransaction(transaction);
    setShowPrint(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredTransactions = transactions.filter(txn => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      txn.address_name.toLowerCase().includes(search) ||
      txn.description?.toLowerCase().includes(search) ||
      txn.reference_number?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <History className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Transaction History</h1>
            <p className="text-slate-400">View all cash transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              showFilters ? 'bg-blue-500/20 text-blue-400' : 'glass text-slate-300 hover:text-white'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button
            onClick={() => fetchTransactions(pagination.page)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-6 rounded-2xl glass space-y-4 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white"
              >
                <option value="">All Types</option>
                <option value="receipt">Receipts</option>
                <option value="payment">Payments</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">From Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">To Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="py-2.5 px-4 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search by name, description, or reference..."
          className="w-full pl-12 pr-4 py-3 rounded-xl glass text-white placeholder-slate-500"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>Total: {pagination.total} transactions</span>
        <span>•</span>
        <span>Page {pagination.page} of {pagination.pages}</span>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-800/50">
            {filteredTransactions.map((txn, index) => (
              <div 
                key={txn.id}
                className="p-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center justify-between">
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
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          txn.type === 'receipt' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {txn.type === 'receipt' ? 'Receipt' : 'Payment'}
                        </span>
                        <span>•</span>
                        <span>{txn.reference_number}</span>
                      </div>
                      {txn.description && (
                        <p className="text-sm text-slate-500 mt-1">{txn.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className={`font-mono font-semibold text-lg ${
                        txn.type === 'receipt' ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {txn.type === 'receipt' ? '+' : '-'}
                        {txn.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                        <span className="text-xs ml-1">AED</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(txn.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrint(txn)}
                      className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      title="Print Receipt"
                    >
                      <Printer size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => fetchTransactions(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg glass text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            let pageNum;
            if (pagination.pages <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.pages - 2) {
              pageNum = pagination.pages - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => fetchTransactions(pageNum)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  pagination.page === pageNum
                    ? 'bg-blue-500 text-white'
                    : 'glass text-slate-300 hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => fetchTransactions(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="p-2 rounded-lg glass text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Print Component */}
      {showPrint && selectedTransaction && (
        <PrintReceipt 
          transaction={selectedTransaction} 
          onClose={() => setShowPrint(false)} 
        />
      )}
    </div>
  );
}
