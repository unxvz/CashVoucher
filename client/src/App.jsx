import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  FileText, 
  Settings,
  Users,
  Menu,
  X,
  Wallet
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Receipt from './pages/Receipt';
import Payment from './pages/Payment';
import TransactionHistory from './pages/TransactionHistory';
import Reports from './pages/Reports';
import AddressBook from './pages/AddressBook';
import SettingsPage from './pages/Settings';
import { getSettings } from './api';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      const data = await getSettings();
      setCurrentBalance(data.current_balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/receipt', icon: ArrowDownCircle, label: 'Cash Receipt' },
    { path: '/payment', icon: ArrowUpCircle, label: 'Cash Payment' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/addresses', icon: Users, label: 'Address Book' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <Router>
      <div className="min-h-screen flex bg-gray-50">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-gray-600 hover:text-gray-900 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white border-r border-gray-200 shadow-sm
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Cash Online</h1>
                  <p className="text-xs text-gray-500">Management System</p>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="p-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {currentBalance.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-gray-500 font-normal ml-1">AED</span>
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                Currency: AED (Dirham)
              </p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 lg:p-6 pt-16 lg:pt-6 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard onBalanceUpdate={fetchBalance} />} />
              <Route path="/receipt" element={<Receipt onBalanceUpdate={fetchBalance} />} />
              <Route path="/payment" element={<Payment onBalanceUpdate={fetchBalance} />} />
              <Route path="/history" element={<TransactionHistory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/addresses" element={<AddressBook />} />
              <Route path="/settings" element={<SettingsPage onBalanceUpdate={fetchBalance} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
