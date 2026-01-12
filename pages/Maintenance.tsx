
import React, { useState } from 'react';
import { 
  Wrench, 
  Calendar, 
  User as UserIcon, 
  DollarSign, 
  ExternalLink, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { db } from '../db';
import { User as UserType, UserRole, Maintenance, Equipment } from '../types';

interface MaintenancePageProps {
  user: UserType;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ user }) => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>(db.getMaintenances());
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const equipments = db.getEquipments();
  const isAdmin = user.role === UserRole.ADMIN;

  // Form State
  const [formData, setFormData] = useState({
    equipmentId: '',
    date: new Date().toISOString().split('T')[0],
    technician: '',
    cost: 0,
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const equipment = equipments.find(eq => eq.id === formData.equipmentId);
    if (!equipment) return;

    db.addMaintenance({
      equipmentId: formData.equipmentId,
      equipmentName: equipment.name,
      date: formData.date,
      technician: formData.technician,
      cost: formData.cost
    });

    setMaintenances(db.getMaintenances());
    setSaveSuccess(true);
    setShowModal(false);
    setFormData({
      equipmentId: '',
      date: new Date().toISOString().split('T')[0],
      technician: '',
      cost: 0,
      note: ''
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Maintenance Records</h1>
          <p className="text-slate-500">Service logs, costs, and technician details</p>
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
              <span>New Service Log</span>
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
              <h3 className="text-xl font-bold text-slate-900">No Service Records Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Start logging your equipment maintenance to track health and operational costs.</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all"
              >
                Create First Log
              </button>
            )}
          </div>
        ) : (
          maintenances.map((record) => (
            <div key={record.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:border-slate-200 transition-all">
              <div className="p-6 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-400">
                  <Wrench size={24} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-slate-900">{record.equipmentName}</h3>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black uppercase tracking-widest">{record.id}</span>
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
                      <DollarSign size={14} />
                      <span className="text-xs font-bold">Rp {record.cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleExpand(record.id)}
                  className="flex items-center justify-center space-x-2 text-slate-400 hover:text-orange-600 font-bold transition-colors px-4 py-2 hover:bg-orange-50 rounded-xl"
                >
                  <span className="text-sm">Details</span>
                  {expandedId === record.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              
              {expandedId === record.id && (
                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-start space-x-3">
                       <Clock size={16} className="text-slate-400 mt-0.5" />
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Maintenance Notes</p>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            This service was performed to maintain the operational standards of {record.equipmentName}. 
                            Total cost of maintenance includes spare parts and technician labor fee.
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

      <div className="bg-orange-600 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-200">
        <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
           <AlertCircle size={32} />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="font-black text-xl">Smart Maintenance Reminder</h4>
          <p className="text-orange-50 leading-relaxed text-sm max-w-2xl">
            Sistem mendeteksi 3 aset membutuhkan pengecekan rutin bulan ini. 
            Perawatan berkala dapat memperpanjang usia alat hingga 40% dan menghemat biaya operasional jangka panjang.
          </p>
        </div>
      </div>

      {/* New Maintenance Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-900">New Service Log</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Select Equipment</label>
                <select 
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all outline-none font-medium"
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({...formData, equipmentId: e.target.value})}
                >
                  <option value="">Select Asset...</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.id})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Service Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all outline-none font-medium"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Cost (IDR)</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all outline-none font-medium"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Technician Name</label>
                <input 
                  required
                  placeholder="e.g. Budi Santoso"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all outline-none font-medium"
                  value={formData.technician}
                  onChange={(e) => setFormData({...formData, technician: e.target.value})}
                />
              </div>

              <div className="pt-4 flex space-x-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black shadow-xl shadow-slate-200 transition-all"
                >
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
