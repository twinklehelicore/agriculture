import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/farmer', label: 'Home', icon: '🏠', end: true },
  { to: '/farmer/farms', label: 'My Farms', icon: '🌾' },
  { to: '/farmer/requests', label: 'Service Requests', icon: '📋' },
  { to: '/farmer/services', label: 'Available Services', icon: '🛠️' },
];

export default function FarmerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get first letter safely
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() ?? '👨‍🌾';

  const sidebarNav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-400 rounded-xl flex items-center justify-center text-xl">
            🌾
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">AgriOwn</h1>
            <p className="text-green-400 text-xs mt-0.5">Farmer Portal</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-green-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-green-800 rounded-xl mb-2">
          <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {firstLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.name ?? 'Farmer'}
            </p>
            <p className="text-green-400 text-xs truncate">
              {user?.mobile ?? 'Farmer Account'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-green-300 hover:text-white hover:bg-green-800 rounded-xl text-sm transition-all"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-green-900 flex-shrink-0">
        {sidebarNav}
      </aside>

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-green-900 flex flex-col transform transition-transform lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarNav}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              ☰
            </button>
            <div>
              <h2 className="text-gray-800 font-semibold text-lg">
                Hello, {user?.name ?? 'Farmer'} 👋
              </h2>
              <p className="text-gray-400 text-xs">Welcome to your farm dashboard</p>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{user?.name ?? 'Farmer'}</p>
              <p className="text-xs text-gray-400">{user?.mobile ?? ''}</p>
            </div>
            <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {firstLetter}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}