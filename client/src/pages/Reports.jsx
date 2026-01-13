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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Generate daily and custom reports</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm space-y-5 no-print">
        <div className="flex gap-4">
          <button
            onClick={() => setReportType('daily')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              reportType === 'daily'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            Daily Report
          </button>
          <button
            onClick={() => setReportType('range')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              reportType === 'range'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
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
              <label className="text-sm font-medium text-gray-700">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900"
                />
              </div>
            </>
          )}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading || (reportType === 'range' && (!startDate || !endDate))}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Printer size={18} />
              <span>Print Report</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Report Header */}
          <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Cash Report</h2>
              <p className="text-gray-500">
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
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-500">Opening Balance</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {report.opening_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-xs text-gray-500 ml-1">AED</span>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-500">Total Receipts</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  +{report.total_receipts?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-xs ml-1">AED</span>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-gray-500">Total Payments</span>
                </div>
                <p className="text-lg font-bold text-red-600">
                  -{report.total_payments?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-xs ml-1">AED</span>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-500">Closing Balance</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {report.closing_balance?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-xs ml-1">AED</span>
                </p>
              </div>
            </div>

            {/* Daily Breakdown (for range reports) */}
            {report.daily_breakdown && report.daily_breakdown.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium">Receipts</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium">Payments</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium">Net</th>
                        <th className="text-center py-3 px-4 text-gray-500 font-medium">Txns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.daily_breakdown.map((day) => (
                        <tr key={day.date} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">
                            {new Date(day.date).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 font-medium">
                            +{day.total_receipts.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right text-red-600 font-medium">
                            -{day.total_payments.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${
                            day.total_receipts - day.total_payments >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {(day.total_receipts - day.total_payments).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-500">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transactions ({report.transaction_count || 0})
              </h3>
              
              {report.transactions && report.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Time</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Reference</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.transactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(txn.created_at).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              txn.type === 'receipt'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {txn.type === 'receipt' ? (
                                <ArrowDownCircle size={12} />
                              ) : (
                                <ArrowUpCircle size={12} />
                              )}
                              {txn.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{txn.address_name}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {txn.reference_number}
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${
                            txn.type === 'receipt' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {txn.type === 'receipt' ? '+' : '-'}
                            {txn.amount?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No transactions for this period
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-400">
                Generated on {new Date().toLocaleString('en-GB')}
              </p>
              <div className="mt-8 flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-12">Prepared By:</p>
                  <div className="border-t border-gray-300 w-48 mx-auto"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-12">Approved By:</p>
                  <div className="border-t border-gray-300 w-48 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
