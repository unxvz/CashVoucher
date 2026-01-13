import { useState, useEffect } from 'react';
import { 
  ArrowUpCircle, 
  Check, 
  Printer, 
  X, 
  User,
  FileText,
  Hash,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import PrintReceipt from '../components/PrintReceipt';
import { getAddresses, getSettings, createTransaction } from '../api';

export default function Payment({ onBalanceUpdate }) {
  const [addresses, setAddresses] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [formData, setFormData] = useState({
    address_id: '',
    address_name: '',
    amount: '',
    description: '',
    reference_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    fetchAddresses();
    fetchBalance();
  }, []);

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const data = await getSettings();
      setCurrentBalance(data.current_balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleAddressSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId === 'custom') {
      setFormData({ ...formData, address_id: '', address_name: '' });
    } else if (selectedId) {
      const address = addresses.find(a => a.id === selectedId);
      setFormData({ 
        ...formData, 
        address_id: selectedId, 
        address_name: address?.name || '' 
      });
    } else {
      setFormData({ ...formData, address_id: '', address_name: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await createTransaction({
        type: 'payment',
        amount: parseFloat(formData.amount),
        address_id: formData.address_id || null,
        address_name: formData.address_name,
        description: formData.description,
        reference_number: formData.reference_number
      });

      if (data.error) {
        throw new Error(data.error);
      }

      setLastTransaction(data.transaction);
      setSuccess(`Payment of ${parseFloat(data.transaction.amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED recorded successfully!`);
      setFormData({
        address_id: '',
        address_name: '',
        amount: '',
        description: '',
        reference_number: ''
      });
      setCurrentBalance(data.current_balance);
      onBalanceUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const amountExceedsBalance = formData.amount && parseFloat(formData.amount) > currentBalance;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <ArrowUpCircle className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Cash Payment</h1>
            <p className="text-slate-400">Record outgoing cash payment</p>
          </div>
        </div>
      </div>

      {/* Balance Warning */}
      <div className="p-4 rounded-xl glass flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Available Balance</p>
          <p className="text-2xl font-bold text-white font-mono">
            {currentBalance.toLocaleString('en-AE', { minimumFractionDigits: 2 })} 
            <span className="text-sm text-slate-400 ml-1">AED</span>
          </p>
        </div>
        {amountExceedsBalance && (
          <div className="flex items-center gap-2 text-orange-400">
            <AlertTriangle size={20} />
            <span className="text-sm">Insufficient balance</span>
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-300">{success}</span>
          </div>
          <div className="flex items-center gap-2">
            {lastTransaction && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors"
              >
                <Printer size={16} />
                <span>Print Voucher</span>
              </button>
            )}
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl glass space-y-6">
          {/* Address Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <User size={16} />
              Paid To
            </label>
            <select
              value={formData.address_id || (formData.address_name && !addresses.find(a => a.name === formData.address_name) ? 'custom' : '')}
              onChange={handleAddressSelect}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:border-orange-500/50 transition-colors"
            >
              <option value="">Select from address book...</option>
              {addresses.map(addr => (
                <option key={addr.id} value={addr.id}>{addr.name}</option>
              ))}
              <option value="custom">+ Enter custom name</option>
            </select>
          </div>

          {/* Custom Name Input */}
          {(formData.address_id === '' || !addresses.find(a => a.id === formData.address_id)) && (
            <div className="space-y-2 animate-slide-down">
              <label className="text-sm font-medium text-slate-300">Name</label>
              <input
                type="text"
                value={formData.address_name}
                onChange={(e) => setFormData({ ...formData, address_name: e.target.value })}
                placeholder="Enter name..."
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-orange-500/50 transition-colors"
              />
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <DollarSign size={16} />
              Amount (AED)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                min="0.01"
                step="0.01"
                max={currentBalance}
                className={`w-full px-4 py-4 rounded-xl bg-slate-800/50 border text-white text-2xl font-mono placeholder-slate-500 transition-colors ${
                  amountExceedsBalance 
                    ? 'border-red-500/50 focus:border-red-500/50' 
                    : 'border-slate-700/50 focus:border-orange-500/50'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">AED</span>
            </div>
            {amountExceedsBalance && (
              <p className="text-sm text-red-400">Amount exceeds available balance</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <FileText size={16} />
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-orange-500/50 transition-colors resize-none"
            />
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Hash size={16} />
              Reference Number (Optional)
            </label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Auto-generated if empty"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-orange-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.address_name || !formData.amount || amountExceedsBalance}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ArrowUpCircle size={20} />
              <span>Record Payment</span>
            </>
          )}
        </button>
      </form>

      {/* Print Component (Hidden) */}
      {showPrint && lastTransaction && (
        <PrintReceipt 
          transaction={lastTransaction} 
          onClose={() => setShowPrint(false)} 
        />
      )}
    </div>
  );
}
