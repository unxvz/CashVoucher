import { useState, useEffect, useRef } from 'react';
import { 
  ArrowDownCircle, 
  Check, 
  Printer, 
  X, 
  User,
  FileText,
  Hash,
  DollarSign
} from 'lucide-react';
import PrintReceipt from '../components/PrintReceipt';

export default function Receipt({ onBalanceUpdate }) {
  const [addresses, setAddresses] = useState([]);
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
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
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
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'receipt',
          amount: parseFloat(formData.amount),
          address_id: formData.address_id || null,
          address_name: formData.address_name,
          description: formData.description,
          reference_number: formData.reference_number
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create receipt');
      }

      setLastTransaction(data.transaction);
      setSuccess(`Receipt of ${data.transaction.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED recorded successfully!`);
      setFormData({
        address_id: '',
        address_name: '',
        amount: '',
        description: '',
        reference_number: ''
      });
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

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <ArrowDownCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Cash Receipt</h1>
            <p className="text-slate-400">Record incoming cash payment</p>
          </div>
        </div>
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
                <span>Print Receipt</span>
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
              Received From
            </label>
            <select
              value={formData.address_id || (formData.address_name && !addresses.find(a => a.name === formData.address_name) ? 'custom' : '')}
              onChange={handleAddressSelect}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:border-green-500/50 transition-colors"
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
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-green-500/50 transition-colors"
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
                className="w-full px-4 py-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-2xl font-mono placeholder-slate-500 focus:border-green-500/50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">AED</span>
            </div>
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
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-green-500/50 transition-colors resize-none"
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
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-green-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.address_name || !formData.amount}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-lg shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ArrowDownCircle size={20} />
              <span>Record Receipt</span>
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
