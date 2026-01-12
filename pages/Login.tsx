
import React, { useState } from 'react';
import { ChefHat, Mail, Lock, ArrowRight, AlertCircle, Cloud, FolderOpen } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (email && password) {
      const success = onLogin(email, password);
      if (!success) {
        setError('Kombinasi email atau password salah.');
      }
    } else {
      setError('Harap isi semua bidang.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-center text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <FolderOpen size={120} />
          </div>
          <div className="bg-orange-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-600/20 relative z-10">
            <ChefHat size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight relative z-10">Kitchen HMTH</h1>
          <div className="flex items-center justify-center space-x-2 mt-2 text-orange-400 font-bold relative z-10">
             <Cloud size={16} />
             <span className="text-xs uppercase tracking-widest">AI Studio Backend Sync</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
          {error && (
            <div className="flex items-center space-x-2 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in shake duration-300">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block">Account Identity</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="cawangitm@harperhotels.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-600 focus:outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-600 focus:outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center group transform active:scale-95"
          >
            <span>Connect to AI Studio</span>
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform text-orange-500" size={20} />
          </button>

          <div className="text-center pt-2">
            <div className="inline-flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-wider">
               <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></div>
               <span>Mirroring: AI Studio Folder @ Harper Hotels</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
