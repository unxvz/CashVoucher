import { useState } from 'react';
import { 
  ArrowDownCircle, 
  Check, 
  Printer, 
  X, 
  User,
  FileText,
  Hash
} from 'lucide-react';
import PrintReceipt from '../components/PrintReceipt';
import { createTransaction } from '../api';

export default function Receipt({ onBalanceUpdate }) {
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await createTransaction({
        type: 'receipt',
        amount: parseFloat(formData.amount),
        address_id: null,
        address_name: formData.address_name,
        description: formData.description,
        reference_number: formData.reference_number
      });

      if (data.error) {
        throw new Error(data.error);
      }

      setLastTransaction(data.transaction);
      setSuccess(`Receipt of ${parseFloat(data.transaction.amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED recorded successfully!`);
      setFormData({
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
          <ArrowDownCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Receipt</h1>
          <p className="text-gray-500">Record incoming cash payment</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
          <div className="flex items-center gap-2">
            {lastTransaction && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              >
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
            )}
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm space-y-5">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User size={16} />
              Received From
            </label>
            <input
              type="text"
              value={formData.address_name}
              onChange={(e) => setFormData({ ...formData, address_name: e.target.value })}
              placeholder="Enter name..."
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
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
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 text-xl font-semibold placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">AED</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={16} />
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
            />
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Hash size={16} />
              Reference Number (Optional)
            </label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Auto-generated if empty"
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.address_name || !formData.amount}
          className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
