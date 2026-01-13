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
  DollarSign
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Receipt from './pages/Receipt';
import Payment from './pages/Payment';
import TransactionHistory from './pages/TransactionHistory';
import Reports from './pages/Reports';
import AddressBook from './pages/AddressBook';
import SettingsPage from './pages/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setCurrentBalance(data.current_balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
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
      <div className="min-h-screen flex">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass text-slate-300 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800/50
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Cash Online</h1>
                  <p className="text-xs text-slate-400">Management System</p>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="p-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-600/20 to-primary-700/10 border border-primary-500/20">
                <p className="text-xs text-primary-300 uppercase tracking-wider mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {currentBalance.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-primary-300 ml-2">AED</span>
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/10' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800/50">
              <p className="text-xs text-slate-500 text-center">
                Currency: AED (Dirham)
              </p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
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
