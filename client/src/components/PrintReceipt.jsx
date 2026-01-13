import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function PrintReceipt({ transaction, onClose }) {
  useEffect(() => {
    const handleAfterPrint = () => {
      onClose();
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [onClose]);

  const isReceipt = transaction.type === 'receipt';
  const title = isReceipt ? 'CASH RECEIPT' : 'CASH PAYMENT VOUCHER';

  return (
    <>
      {/* Print Overlay - visible only when printing */}
      <div className="fixed inset-0 bg-white z-[9999] hidden print:block">
        <style>
          {`
            @media print {
              @page {
                size: A5 portrait;
                margin: 8mm;
              }
              body * {
                visibility: hidden;
              }
              .print-receipt, .print-receipt * {
                visibility: visible;
              }
              .print-receipt {
                position: fixed;
                left: 0;
                top: 0;
                width: 148mm;
                height: 210mm;
                background: white;
                color: black;
                font-family: 'Arial', sans-serif;
              }
            }
          `}
        </style>
        
        <div className="print-receipt p-6">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-2xl font-bold tracking-wider">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">Cash Management System</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4 text-sm">
            {/* Reference & Date */}
            <div className="flex justify-between border-b border-gray-300 pb-3">
              <div>
                <span className="text-gray-600">Reference No:</span>
                <p className="font-mono font-bold">{transaction.reference_number}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-600">Date:</span>
                <p className="font-bold">
                  {new Date(transaction.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(transaction.created_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="border-b border-gray-300 pb-3">
              <span className="text-gray-600">{isReceipt ? 'Received From:' : 'Paid To:'}</span>
              <p className="font-bold text-lg mt-1">{transaction.address_name}</p>
            </div>

            {/* Amount */}
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <span className="text-gray-600 text-sm">Amount</span>
              <p className="text-3xl font-bold mt-1">
                {transaction.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                <span className="text-lg ml-2">AED</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({numberToWords(transaction.amount)} Dirhams Only)
              </p>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="border-b border-gray-300 pb-3">
                <span className="text-gray-600">Description:</span>
                <p className="mt-1">{transaction.description}</p>
              </div>
            )}

            {/* Signature Areas */}
            <div className="mt-8 pt-8">
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="w-32 border-b border-black mb-2 h-12"></div>
                  <p className="text-xs text-gray-600">{isReceipt ? 'Received By' : 'Paid By'}</p>
                  <p className="text-xs text-gray-500">(Signature & Date)</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-black mb-2 h-12"></div>
                  <p className="text-xs text-gray-600">{isReceipt ? 'Payer Signature' : 'Recipient Signature'}</p>
                  <p className="text-xs text-gray-500">(Signature & Date)</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              <p>This is a computer-generated document.</p>
              <p>Please keep this receipt for your records.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Preview */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Preview Content */}
          <div className="p-6 text-gray-900">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-900 pb-4 mb-4">
              <h1 className="text-xl font-bold tracking-wider">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">Cash Management System</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <div>
                  <span className="text-gray-500">Reference:</span>
                  <p className="font-mono font-bold">{transaction.reference_number}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Date:</span>
                  <p className="font-bold">
                    {new Date(transaction.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <span className="text-gray-500">{isReceipt ? 'Received From:' : 'Paid To:'}</span>
                <p className="font-bold text-lg">{transaction.address_name}</p>
              </div>

              <div className={`p-4 rounded-lg text-center ${isReceipt ? 'bg-green-50' : 'bg-orange-50'}`}>
                <span className="text-gray-500 text-sm">Amount</span>
                <p className={`text-2xl font-bold ${isReceipt ? 'text-green-600' : 'text-orange-600'}`}>
                  {transaction.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED
                </p>
              </div>

              {transaction.description && (
                <div className="border-t border-gray-200 pt-3">
                  <span className="text-gray-500">Description:</span>
                  <p>{transaction.description}</p>
                </div>
              )}
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                isReceipt 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              Print A5 Receipt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to convert number to words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  if (num === 0) return 'Zero';
  
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  
  function convertGroup(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertGroup(n % 100) : '');
  }
  
  let result = '';
  let scaleIndex = 0;
  let n = intPart;
  
  while (n > 0) {
    const group = n % 1000;
    if (group !== 0) {
      const groupWords = convertGroup(group);
      result = groupWords + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + (result ? ' ' + result : '');
    }
    n = Math.floor(n / 1000);
    scaleIndex++;
  }
  
  if (decPart > 0) {
    result += ' and ' + convertGroup(decPart) + ' Fils';
  }
  
  return result.trim();
}
