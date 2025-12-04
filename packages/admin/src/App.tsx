import { useState } from 'react';
import { SocketProvider } from './hooks/useSocket';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Trades from './pages/Trades';
import Workers from './pages/Workers';

type Page = 'dashboard' | 'events' | 'trades' | 'workers';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'events', label: 'Events' },
    { id: 'trades', label: 'Trades' },
    { id: 'workers', label: 'Workers' },
  ];

  return (
    <SocketProvider>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Polymarket Bot</h1>
            <p className="text-sm text-gray-400">Auto-Trading Admin</p>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'events' && <Events />}
          {currentPage === 'trades' && <Trades />}
          {currentPage === 'workers' && <Workers />}
        </main>
      </div>
    </SocketProvider>
  );
}

export default App;
