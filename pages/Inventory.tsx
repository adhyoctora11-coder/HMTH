
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit2,
  QrCode,
  X,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import { Equipment, EquipmentStatus, User, UserRole } from '../types';
import QRCode from 'react-qr-code';

interface InventoryProps {
  user: User;
}

const Inventory: React.FC<InventoryProps> = ({ user }) => {
  const [equipments, setEquipments] = useState<Equipment[]>(db.getEquipments());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState<{show: boolean, eq: Equipment | null}>({show: false, eq: null});
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const isAdmin = user.role === UserRole.ADMIN;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    serialNumber: '',
    vendor: '',
    status: EquipmentStatus.ACTIVE,
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyUntil: '',
    price: 0,
    stock: 1
  });

  // Handle Edit Action
  const startEdit = (eq: Equipment) => {
    if (!isAdmin) return;
    setEditingId(eq.id);
    setFormData({
      name: eq.name,
      category: eq.category,
      brand: eq.brand,
      serialNumber: eq.serialNumber,
      vendor: eq.vendor,
      status: eq.status,
      purchaseDate: eq.purchaseDate,
      warrantyUntil: eq.warrantyUntil || '',
      price: eq.price,
      stock: eq.stock
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setShowModal(false);
    setFormData({
      name: '', category: '', brand: '', serialNumber: '', 
      vendor: '', status: EquipmentStatus.ACTIVE, 
      purchaseDate: new Date().toISOString().split('T')[0], 
      warrantyUntil: '',
      price: 0,
      stock: 1
    });
  };

  const filteredData = useMemo(() => {
    return equipments.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [equipments, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (editingId) {
      db.updateEquipment(editingId, formData);
    } else {
      db.addEquipment(formData);
    }

    setEquipments(db.getEquipments());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (confirm('Apakah Anda yakin ingin menghapus barang ini? Tindakan ini permanen dan hanya dapat diakses oleh administrator.')) {
      db.deleteEquipment(id);
      setEquipments(db.getEquipments());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Barang</h1>
          <p className="text-slate-500">Kelola aset dan peralatan dapur Anda</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 animate-in fade-in slide-in-from-right-2">
              <Check size={16} />
              <span className="text-sm font-semibold">Tersimpan</span>
            </div>
          )}
          {isAdmin && (
            <>
              <Link 
                to="/inventory/import"
                className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 font-medium"
              >
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline">Import Asset</span>
              </Link>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 font-medium shadow-lg shadow-orange-100"
              >
                <Plus size={20} />
                <span>Tambah Barang</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, kategori, atau SN..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">
              <Filter size={18} />
            </button>
            <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Informasi Barang</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Harga/Unit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-slate-900">{eq.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">SN: {eq.serialNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {eq.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {eq.stock}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium text-sm">
                    Rp {eq.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      eq.status === EquipmentStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                      eq.status === EquipmentStatus.BROKEN ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2 opacity-100 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setShowQRModal({show: true, eq})}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Tampilkan QR"
                      >
                        <QrCode size={18} />
                      </button>
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => startEdit(eq)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(eq.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada barang yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Barang' : 'Daftarkan Barang Baru'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Barang</label>
                  <input 
                    required 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    placeholder="Contoh: Rational Combi Oven"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kategori</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Chinaware">Chinaware</option>
                    <option value="Oven">Oven</option>
                    <option value="Chiller">Chiller</option>
                    <option value="Mixer">Mixer</option>
                    <option value="Dishwasher">Dishwasher</option>
                    <option value="Cutlery">Cutlery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Merek</label>
                  <input 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    placeholder="Contoh: Hobart"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jumlah Stok</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Harga per Unit (IDR)</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nomor Seri</label>
                  <input 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    placeholder="SN-XXXXX"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tanggal Pembelian</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as EquipmentStatus})}
                  >
                    <option value={EquipmentStatus.ACTIVE}>Aktif</option>
                    <option value={EquipmentStatus.BROKEN}>Rusak</option>
                    <option value={EquipmentStatus.UNDER_REPAIR}>Sedang Diperbaiki</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-100 transition-all"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal.show && showQRModal.eq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowQRModal({show: false, eq: null})}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">{showQRModal.eq.name}</h3>
              <p className="text-sm text-slate-500">Scan untuk spesifikasi & histori</p>
            </div>
            <div className="bg-white p-4 border-4 border-slate-50 rounded-2xl inline-block shadow-inner mb-6">
              <QRCode 
                value={showQRModal.eq.id} 
                size={200}
                fgColor="#ea580c"
              />
            </div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-6">
              ID: {showQRModal.eq.id}
            </div>
            <button 
              onClick={() => window.print()}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
            >
              <Download size={20} />
              <span>Print Label</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
