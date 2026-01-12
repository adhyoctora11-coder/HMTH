
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit2,
  QrCode,
  X,
  FileSpreadsheet,
  Check,
  Printer,
  ChevronRight,
  Square,
  CheckSquare
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
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPrintView, setIsPrintView] = useState(false);
  
  const isAdmin = user.role === UserRole.ADMIN;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    serialNumber: '',
    vendor: '',
    status: EquipmentStatus.ACTIVE,
    purchaseDate: '',
    warrantyUntil: '',
    price: 0,
    stock: 1
  });

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
      purchaseDate: '', 
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

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(e => e.id)));
    }
  };

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
    if (confirm('Hapus barang ini?')) {
      db.deleteEquipment(id);
      setEquipments(db.getEquipments());
    }
  };

  const getQRContent = (eq: Equipment) => {
    return `NAMA: ${eq.name}\nCATEGORY: ${eq.category}\nBRAND: ${eq.brand}\nSN: ${eq.serialNumber}\nVENDOR: ${eq.vendor}\nSTATUS: ${eq.status}\nPURCHASE: ${eq.purchaseDate}\nWARRANTY: ${eq.warrantyUntil || '-'}`;
  };

  const selectedEquipments = useMemo(() => {
    return equipments.filter(e => selectedIds.has(e.id));
  }, [equipments, selectedIds]);

  const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const printPages = chunkArray(selectedEquipments, 20);

  if (isPrintView) {
    return (
      <div className="bg-white min-h-screen p-0 print:p-0">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-50 print:hidden bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl">
           <button onClick={() => setIsPrintView(false)} className="hover:text-orange-400 font-bold">Batal</button>
           <div className="h-4 w-px bg-slate-700"></div>
           <span className="font-bold">{selectedIds.size} Label Siap Cetak</span>
           <button 
            onClick={() => window.print()} 
            className="bg-orange-600 px-4 py-1.5 rounded-lg font-black flex items-center space-x-2"
           >
             <Printer size={16} />
             <span>Cetak Sekarang (A4)</span>
           </button>
        </div>

        <div className="flex flex-col items-center py-10 print:py-0 bg-slate-100 print:bg-white min-h-screen">
          {printPages.map((page, pageIdx) => (
            <div 
              key={pageIdx} 
              className="bg-white shadow-2xl print:shadow-none mb-10 print:mb-0 relative overflow-hidden"
              style={{
                width: '210mm',
                height: '297mm',
                padding: '10mm',
                boxSizing: 'border-box',
                pageBreakAfter: 'always'
              }}
            >
              <div className="grid grid-cols-4 grid-rows-5 gap-4 h-full w-full">
                {page.map((eq) => (
                  <div 
                    key={eq.id} 
                    className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-between text-center overflow-hidden"
                  >
                    <div className="w-full flex justify-between items-start mb-1">
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-tighter">Kitchen HMTH</span>
                      <span className="text-[6px] font-black text-slate-900 uppercase tracking-tighter">{eq.id}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-1">
                       <QRCode value={getQRContent(eq)} size={100} fgColor="#000" />
                    </div>
                    <div className="mt-2 w-full">
                       <p className="text-[9px] font-black text-slate-900 uppercase leading-none truncate mb-1">{eq.name}</p>
                       <p className="text-[7px] font-bold text-orange-600 uppercase tracking-widest">{eq.stock} UNIT | {eq.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Barang</h1>
          <p className="text-slate-500">Kelola aset dan cetak label grup</p>
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
              <Link to="/inventory/import" className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-2 font-medium">
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline">Import Asset</span>
              </Link>
              <button onClick={() => setShowModal(true)} className="bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 flex items-center space-x-2 font-medium shadow-lg">
                <Plus size={20} />
                <span>Tambah Barang</span>
              </button>
            </>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-200 animate-in slide-in-from-top-4 duration-300">
           <div className="flex items-center space-x-4 px-2">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Printer size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{selectedIds.size} Aset Terpilih</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Siap Cetak Lembar A4 (20 per lembar)</p>
              </div>
           </div>
           <div className="flex items-center space-x-3">
              <button onClick={() => setSelectedIds(new Set())} className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2">Batal</button>
              <button onClick={() => setIsPrintView(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-black text-sm transition-all">Cetak Label Grup</button>
           </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari aset..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
                    {selectedIds.size === filteredData.length && filteredData.length > 0 ? (
                      <CheckSquare className="text-orange-600" size={20} />
                    ) : (
                      <Square className="text-slate-300" size={20} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">Informasi Barang</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Harga/Unit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredData.map((eq) => (
                <tr 
                  key={eq.id} 
                  className={`transition-colors hover:bg-slate-50/80 cursor-pointer ${selectedIds.has(eq.id) ? 'bg-orange-50/50' : ''}`}
                  onClick={() => toggleSelect(eq.id)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleSelect(eq.id)} className="p-1 rounded-md">
                      {selectedIds.has(eq.id) ? (
                        <CheckSquare className="text-orange-600" size={20} />
                      ) : (
                        <Square className="text-slate-300" size={20} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{eq.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {eq.id} | SN: {eq.serialNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{eq.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{eq.stock}</td>
                  <td className="px-6 py-4">Rp {eq.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      eq.status === EquipmentStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                      eq.status === EquipmentStatus.BROKEN ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{eq.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => setShowQRModal({show: true, eq})} className="p-2 text-slate-400 hover:text-orange-600 rounded-lg"><QrCode size={18} /></button>
                      {isAdmin && (
                        <>
                          <button onClick={() => startEdit(eq)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(eq.id)} className="p-2 text-slate-300 hover:text-red-600 rounded-lg"><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showQRModal.show && showQRModal.eq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={() => setShowQRModal({show: false, eq: null})} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <div className="mb-6 mt-4">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{showQRModal.eq.name}</h3>
              <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest mt-2">ID: {showQRModal.eq.id}</p>
            </div>
            <div className="bg-white p-6 border-4 border-slate-50 rounded-3xl inline-block shadow-inner mb-6">
              <QRCode value={getQRContent(showQRModal.eq)} size={200} fgColor="#000" />
            </div>
            <div className="text-[10px] text-slate-400 text-left mb-6 space-y-1">
               <p><span className="font-bold">Brand:</span> {showQRModal.eq.brand}</p>
               <p><span className="font-bold">SN:</span> {showQRModal.eq.serialNumber}</p>
               <p><span className="font-bold">Purchase:</span> {showQRModal.eq.purchaseDate}</p>
               <p><span className="font-bold">Warranty:</span> {showQRModal.eq.warrantyUntil || '-'}</p>
            </div>
            <button onClick={() => {
              setSelectedIds(new Set([showQRModal.eq!.id]));
              setIsPrintView(true);
            }} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 flex items-center justify-center space-x-2">
              <Printer size={20} />
              <span>Cetak Label Tunggal</span>
            </button>
          </div>
        </div>
      )}

      {showModal && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-3xl p-0 animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-100">
             <div className="flex justify-between items-center px-10 py-6 border-b border-slate-50 bg-white">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{editingId ? 'Edit Aset' : 'Registrasi Aset Baru'}</h3>
                <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={28} /></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-6">
                  {/* Nama Barang - Full Width */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">NAMA BARANG</label>
                    <input 
                      required 
                      className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-medium text-slate-900" 
                      placeholder="Masukkan nama barang..." 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Kategori */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">KATEGORI</label>
                      <select 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-medium text-slate-900 appearance-none" 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="">Pilih Kategori...</option>
                        <option value="Chinaware">Chinaware</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Kitchenware">Kitchenware</option>
                        <option value="Tools">Tools</option>
                      </select>
                    </div>

                    {/* Merek / Brand */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">MEREK / BRAND</label>
                      <input 
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-medium text-slate-900" 
                        placeholder="Merek..." 
                        value={formData.brand} 
                        onChange={e => setFormData({...formData, brand: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Serial Number */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">SERIAL NUMBER</label>
                      <input 
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-mono text-slate-900" 
                        placeholder="SN-XXXXX" 
                        value={formData.serialNumber} 
                        onChange={e => setFormData({...formData, serialNumber: e.target.value})} 
                      />
                    </div>

                    {/* Vendor */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">VENDOR</label>
                      <input 
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-medium text-slate-900" 
                        placeholder="Nama Vendor..." 
                        value={formData.vendor} 
                        onChange={e => setFormData({...formData, vendor: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Tanggal Pembelian */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">TANGGAL PEMBELIAN</label>
                      <input 
                        type="date" 
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-medium text-slate-900" 
                        value={formData.purchaseDate} 
                        onChange={e => setFormData({...formData, purchaseDate: e.target.value})} 
                      />
                    </div>

                    {/* Garansi Hingga */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">GARANSI HINGGA</label>
                      <input 
                        type="date" 
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-medium text-slate-900" 
                        value={formData.warrantyUntil} 
                        onChange={e => setFormData({...formData, warrantyUntil: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Harga Satuan */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">HARGA SATUAN</label>
                      <input 
                        type="number" 
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-bold text-slate-900" 
                        placeholder="0" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} 
                      />
                    </div>

                    {/* Stok */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 block">STOK</label>
                      <input 
                        type="number" 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all font-black text-orange-600" 
                        placeholder="1" 
                        value={formData.stock} 
                        onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 1})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                   <button 
                     type="button" 
                     onClick={resetForm} 
                     className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                   >
                     Batal
                   </button>
                   <button 
                     type="submit" 
                     className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl hover:bg-black transition-all flex items-center justify-center space-x-2 transform active:scale-[0.98]"
                   >
                     <Check size={20} />
                     <span>Simpan Perubahan</span>
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
