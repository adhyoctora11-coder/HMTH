
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
  Cloud,
  CheckCircle2,
  FolderOpen,
  RefreshCw,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { User } from '../types';
import { db } from '../db';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const isCloudAccount = user.email === 'cawangitm@harperhotels.com';

  const handleManualSync = async () => {
    setSyncing(true);
    await db.syncWithAIStudio();
    setSyncing(false);
  };

  const handleShareLink = () => {
    const link = db.generateShareableCloudUrl();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Scan QR', path: '/scanner', icon: ScanLine },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  // Fix: Explicitly defining NavLink as a React.FC to correctly handle the 'key' prop when mapping in JSX
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
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-8 flex items-center space-x-3">
          <div className="bg-orange-600 p-2 rounded-lg text-white">
            <ChefHat size={24} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400">
            Kitchen HMTH
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="px-5 py-5 mx-4 mb-4 bg-slate-900 rounded-[24px] text-white shadow-xl shadow-slate-200/50 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-orange-400">
              <Cloud size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Master Cloud Storage</span>
            </div>
            <button 
              onClick={handleManualSync}
              className={`p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors ${syncing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={12} />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Authorized Admin Account:</p>
            <p className="text-[11px] font-bold text-white truncate opacity-90">cawangitm@harperhotels.com</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
              <span className="text-[9px] font-bold text-green-400 uppercase tracking-tighter">Auto-Sync Live</span>
            </div>
            <button 
              onClick={() => setShowShareModal(true)}
              className="text-[10px] font-black text-orange-500 hover:text-white flex items-center space-x-1.5 transition-all bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20"
            >
              <Share2 size={10} />
              <span>SHARE DATA</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${isCloudAccount ? 'bg-orange-600' : 'bg-slate-300 text-slate-600'}`}>
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

        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 duration-300 relative border border-slate-100">
              <button 
                onClick={() => setShowShareModal(false)} 
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X size={28} />
              </button>
              
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="bg-orange-600 w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto text-white shadow-2xl shadow-orange-200 rotate-3">
                    <Globe size={40} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white">
                    <CheckCircle2 size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Sync Master Link</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Kirim link ini ke staff atau buka di perangkat lain untuk menduplikat <span className="text-orange-600 font-bold">SELURUH data inventory</span> secara instan.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col space-y-4 shadow-inner">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Generated Cloud Link</div>
                   <div className="text-xs font-mono text-slate-600 break-all text-left bg-white p-4 rounded-2xl border border-slate-200 max-h-24 overflow-y-auto">
                     {db.generateShareableCloudUrl()}
                   </div>
                   <button 
                    onClick={handleShareLink}
                    className={`w-full flex items-center justify-center space-x-3 py-4 rounded-2xl text-sm font-black transition-all ${
                      copied 
                        ? 'bg-green-600 text-white scale-[0.98]' 
                        : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'
                    }`}
                   >
                     {copied ? <Check size={20} /> : <Copy size={20} />}
                     <span>{copied ? 'COPIED TO CLOUD CLIPBOARD' : 'COPY SHAREABLE SYNC LINK'}</span>
                   </button>
                </div>

                <div className="flex items-start space-x-4 text-left bg-orange-50/50 p-5 rounded-3xl border border-orange-100">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl mt-1">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-orange-900 uppercase tracking-wider">Cloud Data Merge Technology</p>
                    <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                      Link ini mengandung seluruh snapshot data. Saat dibuka, sistem akan otomatis melakukan sinkronisasi ulang. Gunakan fitur ini untuk mentransfer master data ke tim.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <div className="pt-6 border-t border-slate-100 space-y-4">
                 <button 
                  onClick={() => { setIsMobileMenuOpen(false); setShowShareModal(true); }}
                  className="w-full flex items-center justify-between px-6 py-5 bg-slate-900 rounded-3xl text-white font-black text-sm shadow-xl shadow-slate-200"
                 >
                    <div className="flex items-center space-x-3">
                      <Share2 size={20} className="text-orange-400" />
                      <span>SHARE CLOUD MASTER</span>
                    </div>
                    <ChevronRight size={18} />
                 </button>
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
