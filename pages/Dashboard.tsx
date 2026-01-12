
import React, { useMemo, useEffect, useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  History, 
  PlusCircle,
  Coins,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Box,
  Search,
  X,
  AlertOctagon,
  Wrench
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
import { EquipmentStatus, TransactionType, User, UserRole, Equipment } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [equipments, setEquipments] = useState(db.getEquipments());
  const [showDamageModal, setShowDamageModal] = useState(false);
  
  // States for Damage Modal
  const [damageSearch, setDamageSearch] = useState('');
  const [damageNote, setDamageNote] = useState('');
  const [damageQty, setDamageQty] = useState<number>(1);
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);

  const transactions = db.getTransactions().slice(0, 8);
  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    const interval = setInterval(() => {
      setEquipments(db.getEquipments());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const brokenCount = equipments.filter(e => e.status === EquipmentStatus.BROKEN).reduce((acc, curr) => acc + curr.stock, 0);
    const activeCount = equipments.filter(e => e.status === EquipmentStatus.ACTIVE).reduce((acc, curr) => acc + curr.stock, 0);
    const maintenanceCount = equipments.filter(e => e.status === EquipmentStatus.UNDER_REPAIR).reduce((acc, curr) => acc + curr.stock, 0);
    
    return {
      total: equipments.length,
      broken: brokenCount,
      active: activeCount,
      maintenance: maintenanceCount,
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

  const activeEquipmentsForDamage = useMemo(() => {
    return equipments
      .filter(e => e.status === EquipmentStatus.ACTIVE)
      .filter(e => e.name.toLowerCase().includes(damageSearch.toLowerCase()));
  }, [equipments, damageSearch]);

  const selectedDamageAsset = useMemo(() => {
    return equipments.find(e => e.id === selectedEqId) || null;
  }, [selectedEqId, equipments]);

  const handleReportDamage = () => {
    if (selectedEqId && damageQty > 0) {
      db.reportEquipmentBroken(selectedEqId, damageQty, damageNote);
      setEquipments(db.getEquipments());
      setShowDamageModal(false);
      setSelectedEqId(null);
      setDamageNote('');
      setDamageQty(1);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kitchen Inventory Dashboard</h1>
          <p className="text-slate-500 mt-1">Status real-time aset operasional vs kerusakan.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowDamageModal(true)}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100 font-bold space-x-2"
          >
            <AlertOctagon size={20} />
            <span>Input Barang Rusak</span>
          </button>
           {isAdmin && (
            <Link 
              to="/inventory" 
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-100 font-bold space-x-2"
            >
              <PlusCircle size={20} />
              <span>Registrasi Aset</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Package size={24} />
            </div>
            <Box size={16} className="text-slate-200" />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Jenis Aset</p>
          <h3 className="text-3xl font-black mt-1">{stats.total}</h3>
          <div className="mt-4 flex items-center text-[10px] text-blue-600 font-bold uppercase">
             <Layers size={14} className="mr-1.5" />
             <span>{stats.totalStock} Unit</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow ring-1 ring-green-100 ring-offset-2">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <Box size={16} className="text-slate-200" />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Aset Aktif</p>
          <h3 className="text-3xl font-black mt-1 text-green-600">{stats.active}</h3>
          <p className="mt-4 text-[10px] font-bold text-green-600 uppercase tracking-widest">Operasional</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <AlertTriangle size={24} />
            </div>
            <Box size={16} className="text-slate-200" />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Aset Rusak</p>
          <h3 className="text-3xl font-black mt-1 text-red-600">{stats.broken}</h3>
          <p className="mt-4 text-[10px] font-bold text-red-400 uppercase tracking-widest">Non-Operasional</p>
        </div>

        {/* Improved Maintenance Card - Matching Image Logic */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Wrench size={24} />
            </div>
            <Box size={16} className="text-slate-100" />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">MAINTENANCE</p>
          <h3 className="text-5xl font-black mt-1 text-amber-600 leading-tight">{stats.maintenance}</h3>
          <p className="mt-4 text-[10px] font-bold text-amber-600 uppercase tracking-[0.15em]">SEDANG SERVIS</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl">
              <Coins size={24} />
            </div>
            <Box size={16} className="text-slate-200" />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Nilai Buku</p>
          <h3 className="text-xl font-black mt-1 text-slate-900">Rp {stats.totalValue.toLocaleString()}</h3>
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Inventaris</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black mb-8 flex items-center space-x-2">
             <span>Distribusi Per Kategori</span>
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

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black flex items-center gap-2">
              <History size={20} className="text-orange-600" />
              Aktivitas Aset
            </h3>
            <Link to="/transactions" className="text-[10px] font-bold text-orange-600 uppercase bg-orange-50 px-3 py-1.5 rounded-full">Lihat Semua</Link>
          </div>
          <div className="space-y-6">
            {transactions.map((trx) => (
              <div key={trx.id} className="flex items-start space-x-4 group">
                <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${
                  trx.type === TransactionType.IN ? 'bg-green-50 text-green-600' :
                  trx.type === TransactionType.REPAIR ? 'bg-red-50 text-red-600' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  {trx.type === TransactionType.IN ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{trx.equipmentName}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{trx.date}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
               <div className="py-20 text-center text-slate-400 italic text-sm">Belum ada aktivitas.</div>
            )}
          </div>
        </div>
      </div>

      {/* Damage Report Modal */}
      {showDamageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-xl p-0 shadow-3xl animate-in zoom-in-95 duration-300 relative border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-red-50/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <AlertOctagon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Laporkan Barang Rusak</h3>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Aset Aktif Akan Dipindah ke Broken</p>
                </div>
              </div>
              <button onClick={() => setShowDamageModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Cari aset aktif yang rusak..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-600 outline-none transition-all font-medium"
                  value={damageSearch}
                  onChange={(e) => setDamageSearch(e.target.value)}
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {activeEquipmentsForDamage.map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => {
                      setSelectedEqId(eq.id);
                      setDamageQty(1);
                    }}
                    className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                      selectedEqId === eq.id 
                        ? 'bg-red-50 border-red-200 ring-2 ring-red-100' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{eq.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Stok Aktif: {eq.stock} Unit</p>
                    </div>
                    {selectedEqId === eq.id && <CheckCircle2 size={20} className="text-red-600" />}
                  </button>
                ))}
              </div>

              {selectedEqId && selectedDamageAsset && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Jumlah Rusak</label>
                      <input 
                        type="number"
                        min="1"
                        max={selectedDamageAsset.stock}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-600 outline-none transition-all font-bold"
                        value={damageQty}
                        onChange={(e) => setDamageQty(Math.min(selectedDamageAsset.stock, Math.max(1, parseInt(e.target.value) || 0)))}
                      />
                      <p className="text-[10px] text-slate-400 mt-1 italic">Maks: {selectedDamageAsset.stock} Unit</p>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Catatan Kerusakan</label>
                       <textarea 
                        rows={1}
                        placeholder="Contoh: Pecah, Retak..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-600 outline-none transition-all font-medium text-sm"
                        value={damageNote}
                        onChange={(e) => setDamageNote(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={() => setShowDamageModal(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button 
                  disabled={!selectedEqId || damageQty <= 0}
                  onClick={handleReportDamage}
                  className={`flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-100 transition-all flex items-center justify-center space-x-2 ${
                    !selectedEqId ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-red-700'
                  }`}
                >
                  <AlertTriangle size={20} />
                  <span>Konfirmasi Rusak</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
