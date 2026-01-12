
import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Calendar, 
  User as UserIcon, 
  Plus, 
  X, 
  CheckCircle2, 
  Clock,
  ChevronDown,
  ChevronUp,
  Coins,
  Layers,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { db } from '../db';
import { User as UserType, UserRole, Maintenance, Equipment, EquipmentStatus } from '../types';

interface MaintenancePageProps {
  user: UserType;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ user }) => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>(db.getMaintenances());
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Ambil aset aktif dengan stok > 0
  const equipments = db.getEquipments().filter(e => e.status === EquipmentStatus.ACTIVE && e.stock > 0);
  const isAdmin = user.role === UserRole.ADMIN;

  // Form State
  const [formData, setFormData] = useState({
    equipmentId: '',
    date: new Date().toISOString().split('T')[0],
    technician: '',
    cost: 0,
    quantity: 1,
    note: '',
    setUnderRepair: true 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const equipment = db.getEquipmentById(formData.equipmentId);
    if (!equipment) return;

    db.addMaintenance({
      equipmentId: formData.equipmentId,
      equipmentName: equipment.name,
      date: formData.date,
      technician: formData.technician,
      cost: formData.cost,
      quantity: formData.quantity
    }, formData.setUnderRepair);

    setMaintenances(db.getMaintenances());
    setSaveSuccess(true);
    setShowModal(false);
    setFormData({
      equipmentId: '',
      date: new Date().toISOString().split('T')[0],
      technician: '',
      cost: 0,
      quantity: 1,
      note: '',
      setUnderRepair: true
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Mencegah klik menyebar ke toggle detail baris
    
    if (!isAdmin) return;
    
    if (window.confirm("Hapus catatan maintenance ini? Tindakan ini hanya menghapus log, tidak mengembalikan stok otomatis.")) {
      db.deleteMaintenance(id);
      setMaintenances(db.getMaintenances());
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Riwayat Maintenance</h1>
          <p className="text-slate-500">Log pemeliharaan dan monitoring unit sedang servis</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 animate-in fade-in slide-in-from-right-2">
              <CheckCircle2 size={16} />
              <span className="text-sm font-semibold">Tersimpan</span>
            </div>
          )}
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all flex items-center space-x-2 font-bold shadow-lg shadow-slate-200"
            >
              <Plus size={20} />
              <span>Input Service Log</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {maintenances.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-6">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Wrench size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Belum Ada Data Maintenance</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Mulai catat pemeliharaan untuk monitoring aset di Dashboard.</p>
            </div>
          </div>
        ) : (
          maintenances.map((record) => (
            <div key={record.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:border-slate-200 transition-all relative">
              <div className="p-6 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-400">
                  <Wrench size={24} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-slate-900">{record.equipmentName}</h3>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black uppercase tracking-widest">{record.id}</span>
                    <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded text-amber-600 font-black uppercase tracking-widest">{record.quantity} UNIT</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      <span className="text-xs font-semibold">{record.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-500">
                      <UserIcon size={14} className="text-slate-300" />
                      <span className="text-xs font-semibold">{record.technician}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-600">
                      <Coins size={14} />
                      <span className="text-xs font-bold">Rp {record.cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleExpand(record.id)}
                    className="flex items-center justify-center space-x-2 text-slate-400 hover:text-orange-600 font-bold transition-colors px-4 py-2 hover:bg-orange-50 rounded-xl"
                  >
                    <span className="text-sm">Detail</span>
                    {expandedId === record.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isAdmin && (
                    <button 
                      type="button"
                      onClick={(e) => handleDelete(e, record.id)}
                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Hapus Log"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              {expandedId === record.id && (
                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-start space-x-3">
                       <Clock size={16} className="text-slate-400 mt-0.5" />
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Catatan Service</p>
                          <p className="text-sm text-slate-600">
                            Log servis ID <strong>{record.id}</strong>. Sebanyak <strong>{record.quantity} unit</strong> {record.equipmentName} diproses pada {record.date}. 
                          </p>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Maintenance Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-900">Input Service Log</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Pilih Aset Aktif</label>
                <select 
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-600 outline-none transition-all font-medium"
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({...formData, equipmentId: e.target.value})}
                >
                  <option value="">Pilih Aset...</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} (Tersedia: {eq.stock} Unit)</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tanggal Service</label>
                  <input type="date" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Jumlah Unit Servis</label>
                  <input type="number" required min="1" className="w-full px-5 py-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl outline-none font-bold text-blue-700" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">Total Biaya Service (IDR)</label>
                <input type="number" required min="0" className="w-full px-5 py-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl outline-none font-bold text-orange-700" value={formData.cost} onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value) || 0})} />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nama Teknisi / Vendor</label>
                <input required placeholder="Nama Teknisi..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" value={formData.technician} onChange={(e) => setFormData({...formData, technician: e.target.value})} />
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center space-x-3">
                <input type="checkbox" id="setUnderRepair" className="w-5 h-5 accent-orange-600 cursor-pointer" checked={formData.setUnderRepair} onChange={(e) => setFormData({...formData, setUnderRepair: e.target.checked})} />
                <label htmlFor="setUnderRepair" className="text-xs font-bold text-amber-900 cursor-pointer">Update stok ke Dashboard "Sedang Servis"?</label>
              </div>

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black shadow-xl">Simpan & Update Stok</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
