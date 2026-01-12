
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Wrench, 
  BarChart3, 
  ScanLine, 
  LogOut,
  Menu,
  X,
  ChefHat,
  ChevronRight,
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Scan QR', path: '/scanner', icon: ScanLine },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
            : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
        }`}
      >
        <item.icon size={20} />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-8 flex items-center space-x-3">
          <div className="bg-orange-600 p-2 rounded-lg text-white">
            <ChefHat size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Kitchen HMTH
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white bg-orange-600`}>
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <ChefHat className="text-orange-600" size={24} />
            <span className="font-bold text-lg">Kitchen HMTH</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white">
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                  <ChefHat className="text-orange-600" size={24} />
                  <span className="font-bold text-lg">Kitchen HMTH</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500">
                  <X size={28} />
                </button>
              </div>
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </nav>
              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={onLogout}
                  className="flex items-center space-x-3 px-6 py-5 w-full text-red-600 font-bold text-sm bg-red-50 rounded-3xl"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
