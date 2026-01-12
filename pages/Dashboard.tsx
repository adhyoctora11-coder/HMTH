
import React, { useMemo, useEffect, useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  History, 
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Coins,
  Layers,
  Cloud,
  FolderSync,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { db } from '../db';
import { EquipmentStatus, TransactionType, User, UserRole } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [equipments, setEquipments] = useState(db.getEquipments());
  const transactions = db.getTransactions().slice(0, 5);
  const isAdmin = user.role === UserRole.ADMIN;
  const lastSync = db.getLastSync();

  // Refresh equipment list if synced in background
  useEffect(() => {
    const interval = setInterval(() => {
      setEquipments(db.getEquipments());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return {
      total: equipments.length,
      broken: equipments.filter(e => e.status === EquipmentStatus.BROKEN).length,
      underRepair: equipments.filter(e => e.status === EquipmentStatus.UNDER_REPAIR).length,
      active: equipments.filter(e => e.status === EquipmentStatus.ACTIVE).length,
      totalStock: equipments.reduce((acc, curr) => acc + (curr.stock || 0), 0),
      totalValue: equipments.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.stock || 0)), 0),
    };
  }, [equipments]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    equipments.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + (e.stock || 1);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [equipments]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kitchen Cloud Dashboard</h1>
          <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-2">
            <div className="flex items-center space-x-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100 text-green-700 font-bold shadow-sm">
               <ShieldCheck size={14} />
               <span className="text-[11px] uppercase tracking-wider">Master Repository: Secured</span>
            </div>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
            <div className="flex items-center space-x-1.5 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 text-blue-700 font-semibold shadow-sm">
               <FolderSync size={14} className="animate-pulse" />
               <span className="text-[11px] uppercase tracking-wider">AI Studio: Persistent Sync</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="hidden lg:block text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cloud Master Status</p>
              <div className="flex items-center justify-end space-x-2 text-slate-600">
                 <CheckCircle2 size={14} className="text-green-500" />
                 <span className="text-xs font-bold">{lastSync || 'Syncing...'}</span>
              </div>
           </div>
           {isAdmin && (
            <Link 
              to="/inventory" 
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 font-bold space-x-2"
            >
              <PlusCircle size={20} />
              <span>Register Asset</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Package size={24} />
            </div>
            <Cloud size={16} className="text-slate-200" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Assets</p>
          <h3 className="text-4xl font-black mt-1">{stats.total}</h3>
          <div className="mt-4 flex items-center text-sm text-blue-600 font-bold">
             <Layers size={16} className="mr-1.5" />
             <span>{stats.totalStock} Items</span>
          </div>
        </div>

        <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Coins size={24} />
            </div>
            <Cloud size={16} className="text-slate-200" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Inventory Value</p>
          <h3 className="text-3xl font-black mt-1 text-orange-600">Rp {stats.totalValue.toLocaleString()}</h3>
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cloud Calculated</p>
        </div>

        <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <AlertTriangle size={24} />
            </div>
            <Cloud size={16} className="text-slate-200" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Broken Units</p>
          <h3 className="text-4xl font-black mt-1 text-red-600">{stats.broken}</h3>
          <p className="mt-4 text-[10px] font-bold text-red-400 uppercase tracking-widest">Attention Required</p>
        </div>

        <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <History size={24} />
            </div>
            <Cloud size={16} className="text-slate-200" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Ready</p>
          <h3 className="text-4xl font-black mt-1 text-slate-900">{stats.active}</h3>
          <p className="mt-4 text-[10px] font-bold text-green-500 uppercase tracking-widest">Operational</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black mb-8 flex items-center space-x-2">
             <span>Category Distribution</span>
             <span className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-black">AI Studio Logic</span>
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#ea580c" radius={[10, 10, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black">Cloud Audit Log</h3>
            <Link to="/transactions" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full transition-colors">View All</Link>
          </div>
          <div className="space-y-6">
            {transactions.map((trx) => (
              <div key={trx.id} className="flex items-start space-x-4 group">
                <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${
                  trx.type === TransactionType.IN ? 'bg-green-50 text-green-600' :
                  trx.type === TransactionType.REPAIR ? 'bg-red-50 text-red-600' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  {trx.type === TransactionType.IN ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{trx.equipmentName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{trx.note}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{trx.date}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="py-20 text-center space-y-3">
                 <Cloud className="mx-auto text-slate-100" size={48} />
                 <p className="text-slate-400 text-sm font-medium">Listening for Cloud Events...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
