import { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { getDailyReport, getRangeReport } from '../api';

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const data = await getDailyReport(date);
      setReport({ ...data, type: 'daily' });
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRangeReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const data = await getRangeReport(startDate, endDate);
      setReport({ ...data, type: 'range' });
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === 'daily') {
      fetchDailyReport();
    }
  }, [date]);

  const handleGenerateReport = () => {
    if (reportType === 'daily') {
      fetchDailyReport();
    } else {
      fetchRangeReport();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (!report?.transactions) return;

    const headers = ['Date', 'Type', 'Name', 'Description', 'Reference', 'Amount'];
    const rows = report.transactions.map(txn => [
      new Date(txn.created_at).toLocaleString(),
      txn.type,
      txn.address_name,
      txn.description || '',
      txn.reference_number,
      txn.type === 'receipt' ? txn.amount : -txn.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-report-${report.type === 'daily' ? report.date : `${report.start_date}-to-${report.end_date}`}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400">Generate daily and custom reports</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="p-6 rounded-2xl glass space-y-6 no-print">
        <div className="flex gap-4">
          <button
            onClick={() => setReportType('daily')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              reportType === 'daily'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            Daily Report
          </button>
          <button
            onClick={() => setReportType('range')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              reportType === 'range'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5 mx-auto mb-1" />
            Custom Range
          </button>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportType === 'daily' ? (
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-300">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white"
                />
              </div>
            </>
          )}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading || (reportType === 'range' && (!startDate || !endDate))}
              className="w-full py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <FileText size={18} />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {report && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-2 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-slate-300 hover:text-white transition-colors"
            >
              <Printer size={18} />
              <span>Print Report</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-slate-300 hover:text-white transition-colors"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Report Header */}
          <div className="p-6 rounded-2xl glass print:bg-white print:border print:border-gray-300">
            <div className="text-center mb-6 print:text-black">
              <h2 className="text-2xl font-bold">Cash Report</h2>
              <p className="text-slate-400 print:text-gray-600">
                {report.type === 'daily' 
                  ? new Date(report.date).toLocaleDateString('en-GB', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : `${new Date(report.start_date).toLocaleDateString('en-GB')} - ${new Date(report.end_date).toLocaleDateString('en-GB')}`
                }
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-800/50 print:bg-gray-100 print:border">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-blue-400 print:text-blue-600" />
                  <span className="text-xs text-slate-400 print:text-gray-600">Opening Balance</span>
                </div>
                <p className="text-xl font-bold text-white print:text-black font-mono">
                  {report.opening_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-xs text-slate-400 print:text-gray-600 ml-1">AED</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-green-500/10 print:bg-green-50 print:border print:border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400 print:text-green-600" />
                  <span className="text-xs text-slate-400 print:text-gray-600">Total Receipts</span>
                </div>
                <p className="text-xl font-bold text-green-400 print:text-green-600 font-mono">
                  +{report.total_receipts?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-xs ml-1">AED</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/10 print:bg-orange-50 print:border print:border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-orange-400 print:text-orange-600" />
                  <span className="text-xs text-slate-400 print:text-gray-600">Total Payments</span>
                </div>
                <p className="text-xl font-bold text-orange-400 print:text-orange-600 font-mono">
                  -{report.total_payments?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-xs ml-1">AED</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 print:bg-purple-50 print:border print:border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-purple-400 print:text-purple-600" />
                  <span className="text-xs text-slate-400 print:text-gray-600">Closing Balance</span>
                </div>
                <p className="text-xl font-bold text-purple-400 print:text-purple-600 font-mono">
                  {report.closing_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-xs ml-1">AED</span>
                </p>
              </div>
            </div>

            {/* Daily Breakdown (for range reports) */}
            {report.daily_breakdown && report.daily_breakdown.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white print:text-black mb-4">Daily Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 print:border-gray-300">
                        <th className="text-left py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Date</th>
                        <th className="text-right py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Receipts</th>
                        <th className="text-right py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Payments</th>
                        <th className="text-right py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Net</th>
                        <th className="text-center py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Txns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.daily_breakdown.map((day) => (
                        <tr key={day.date} className="border-b border-slate-800/50 print:border-gray-200">
                          <td className="py-3 px-4 text-white print:text-black">
                            {new Date(day.date).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-3 px-4 text-right text-green-400 print:text-green-600 font-mono">
                            +{day.total_receipts.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right text-orange-400 print:text-orange-600 font-mono">
                            -{day.total_payments.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono ${
                            day.total_receipts - day.total_payments >= 0 
                              ? 'text-green-400 print:text-green-600' 
                              : 'text-orange-400 print:text-orange-600'
                          }`}>
                            {(day.total_receipts - day.total_payments).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-400 print:text-gray-600">
                            {day.transaction_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            <div>
              <h3 className="text-lg font-semibold text-white print:text-black mb-4">
                Transactions ({report.transaction_count || 0})
              </h3>
              
              {report.transactions && report.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 print:border-gray-300">
                        <th className="text-left py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Time</th>
                        <th className="text-left py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Reference</th>
                        <th className="text-right py-3 px-4 text-slate-400 print:text-gray-600 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.transactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-slate-800/50 print:border-gray-200">
                          <td className="py-3 px-4 text-slate-300 print:text-gray-700">
                            {new Date(txn.created_at).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              txn.type === 'receipt'
                                ? 'bg-green-500/20 text-green-400 print:bg-green-100 print:text-green-700'
                                : 'bg-orange-500/20 text-orange-400 print:bg-orange-100 print:text-orange-700'
                            }`}>
                              {txn.type === 'receipt' ? (
                                <ArrowDownCircle size={12} />
                              ) : (
                                <ArrowUpCircle size={12} />
                              )}
                              {txn.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white print:text-black">{txn.address_name}</td>
                          <td className="py-3 px-4 text-slate-400 print:text-gray-600 font-mono text-xs">
                            {txn.reference_number}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-semibold ${
                            txn.type === 'receipt' 
                              ? 'text-green-400 print:text-green-600' 
                              : 'text-orange-400 print:text-orange-600'
                          }`}>
                            {txn.type === 'receipt' ? '+' : '-'}
                            {txn.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 print:text-gray-500">
                  No transactions for this period
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-700 print:border-gray-300 text-center">
              <p className="text-sm text-slate-500 print:text-gray-500">
                Generated on {new Date().toLocaleString('en-GB')}
              </p>
              <div className="mt-8 flex justify-between print:block">
                <div className="print:mb-8">
                  <p className="text-sm text-slate-400 print:text-gray-600 mb-12">Prepared By:</p>
                  <div className="border-t border-slate-600 print:border-gray-400 w-48 mx-auto"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 print:text-gray-600 mb-12">Approved By:</p>
                  <div className="border-t border-slate-600 print:border-gray-400 w-48 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
