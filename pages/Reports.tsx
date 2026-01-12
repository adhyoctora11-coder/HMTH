
import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  ChevronRight,
  PieChart as PieChartIcon,
  TrendingUp,
  Table,
  ArrowLeft,
  Coins,
  Wrench,
  ShieldCheck,
  Database,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import * as XLSX from 'xlsx';
import { db } from '../db';
import { EquipmentStatus } from '../types';

type ReportView = 'DASHBOARD' | 'VALUATION' | 'MAINTENANCE' | 'VENDOR' | 'DATABASE';

const Reports: React.FC = () => {
  const [activeView, setActiveView] = useState<ReportView>('DASHBOARD');
  const [importStatus, setImportStatus] = useState<{success: boolean, message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const equipments = db.getEquipments();
  const transactions = db.getTransactions();
  const maintenances = db.getMaintenances();

  const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  // Excel Export Logic
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Inventory
    const invData = equipments.map(e => ({
      'ID': e.id,
      'Nama Barang': e.name,
      'Kategori': e.category,
      'Merek': e.brand,
      'SN': e.serialNumber,
      'Stok': e.stock,
      'Harga Satuan': e.price,
      'Total Nilai': e.stock * e.price,
      'Status': e.status,
      'Vendor': e.vendor
    }));
    const wsInv = XLSX.utils.json_to_sheet(invData);
    XLSX.utils.book_append_sheet(wb, wsInv, "Inventory");

    // Sheet 2: Transactions
    const trxData = transactions.map(t => ({
      'ID': t.id,
      'Barang': t.equipmentName,
      'Tipe': t.type,
      'Tanggal': t.date,
      'Catatan': t.note
    }));
    const wsTrx = XLSX.utils.json_to_sheet(trxData);
    XLSX.utils.book_append_sheet(wb, wsTrx, "Transactions");

    // Sheet 3: Maintenance
    const mntData = maintenances.map(m => ({
      'ID': m.id,
      'Barang': m.equipmentName,
      'Tanggal': m.date,
      'Teknisi': m.technician,
      'Unit': m.quantity,
      'Biaya': m.cost
    }));
    const wsMnt = XLSX.utils.json_to_sheet(mntData);
    XLSX.utils.book_append_sheet(wb, wsMnt, "Maintenance");

    XLSX.writeFile(wb, `Kitchen_HMTH_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await db.importDatabase(file);
      if (success) {
        setImportStatus({ success: true, message: "Database berhasil direstore!" });
        setTimeout(() => window.location.reload(), 1500); 
      } else {
        setImportStatus({ success: false, message: "Format file tidak valid." });
      }
    }
  };

  // Aggregations
  const valuationByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    equipments.forEach(e => {
      data[e.category] = (data[e.category] || 0) + (e.stock * e.price);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [equipments]);

  const vendorPerformance = useMemo(() => {
    const vendors: Record<string, { total: number, broken: number }> = {};
    equipments.forEach(e => {
      if (!vendors[e.vendor]) vendors[e.vendor] = { total: 0, broken: 0 };
      vendors[e.vendor].total += e.stock;
      if (e.status === EquipmentStatus.BROKEN) vendors[e.vendor].broken += e.stock;
    });
    return Object.entries(vendors).map(([name, stats]) => ({
      name,
      total: stats.total,
      broken: stats.broken,
      reliability: stats.total > 0 ? Math.round(((stats.total - stats.broken) / stats.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [equipments]);

  const renderDashboard = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center">
              <TrendingUp className="text-orange-600 mr-2" size={20} />
              Investasi per Kategori
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valuationByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  formatter={(val: number) => `Rp ${val.toLocaleString()}`}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#ea580c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => setActiveView('VALUATION')} className="report-card group">
            <div className="flex items-center justify-between w-full p-6 bg-white rounded-3xl border border-slate-100 hover:border-orange-200 transition-all">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-50 p-3 rounded-2xl text-orange-600"><Coins size={24} /></div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-lg">Inventory Valuation</h4>
                  <p className="text-sm text-slate-500">Nilai aset real-time per kategori.</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-orange-600" />
            </div>
          </button>

          <button onClick={() => setActiveView('MAINTENANCE')} className="report-card group">
            <div className="flex items-center justify-between w-full p-6 bg-white rounded-3xl border border-slate-100 hover:border-orange-200 transition-all">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Wrench size={24} /></div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-lg">Service Log Report</h4>
                  <p className="text-sm text-slate-500">Laporan mendetail seluruh perbaikan.</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-blue-600" />
            </div>
          </button>

          <button onClick={() => setActiveView('VENDOR')} className="report-card group">
            <div className="flex items-center justify-between w-full p-6 bg-white rounded-3xl border border-slate-100 hover:border-orange-200 transition-all">
              <div className="flex items-center space-x-4">
                <div className="bg-green-50 p-3 rounded-2xl text-green-600"><ShieldCheck size={24} /></div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-lg">Vendor Audit</h4>
                  <p className="text-sm text-slate-500">Performa kualitas barang dari vendor.</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-green-600" />
            </div>
          </button>

          <button onClick={() => setActiveView('DATABASE')} className="report-card group">
            <div className="flex items-center justify-between w-full p-6 bg-white rounded-3xl border border-slate-100 hover:border-orange-200 transition-all">
              <div className="flex items-center space-x-4">
                <div className="bg-slate-50 p-3 rounded-2xl text-slate-600"><Database size={24} /></div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-lg">Backup & Restore</h4>
                  <p className="text-sm text-slate-500">Simpan dan bagikan data inventory Anda.</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-slate-600" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderValuation = () => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Coins className="mr-2 text-orange-600" />
          Rincian Valuasi Aset
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={valuationByCategory} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {valuationByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `Rp ${val.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {valuationByCategory.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                  <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 text-lg">Rp {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaintenanceDetail = () => {
    return (
      <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 font-bold text-xl flex items-center justify-between">
             <div className="flex items-center"><Wrench className="mr-2 text-blue-600" /> Full Service Log Report</div>
             <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{maintenances.length} Entries</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
                <tr>
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Nama Aset</th>
                  <th className="px-8 py-4">Tanggal</th>
                  <th className="px-8 py-4">Teknisi</th>
                  <th className="px-8 py-4">Unit</th>
                  <th className="px-8 py-4 text-right">Biaya (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-mono text-slate-400">{m.id}</td>
                    <td className="px-8 py-4 font-bold text-slate-900">{m.equipmentName}</td>
                    <td className="px-8 py-4 text-slate-600 flex items-center gap-2"><Clock size={14}/> {m.date}</td>
                    <td className="px-8 py-4 text-slate-600"><div className="flex items-center gap-2"><UserIcon size={14}/> {m.technician}</div></td>
                    <td className="px-8 py-4 font-bold text-blue-600">{m.quantity} Unit</td>
                    <td className="px-8 py-4 text-right font-black text-orange-600">Rp {m.cost.toLocaleString()}</td>
                  </tr>
                ))}
                {maintenances.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">Belum ada riwayat service log yang tercatat.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderVendorAudit = () => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
       <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 font-bold text-xl flex items-center">
             <ShieldCheck className="mr-2 text-green-600" /> Performa Vendor
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <tr><th className="px-8 py-4">Vendor</th><th className="px-8 py-4">Unit</th><th className="px-8 py-4">Rusak</th><th className="px-8 py-4 text-right">Reliability</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vendorPerformance.map((v, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-8 py-4 font-bold">{v.name || 'Umum'}</td>
                  <td className="px-8 py-4">{v.total} unit</td>
                  <td className="px-8 py-4 text-red-500">{v.broken} unit</td>
                  <td className="px-8 py-4 text-right font-black text-orange-600">{v.reliability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>
    </div>
  );

  const renderDatabaseTools = () => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center text-orange-600">
            <Download size={24} />
          </div>
          <h3 className="text-xl font-bold">Export Database</h3>
          <p className="text-slate-500 text-sm">Download seluruh data (Inventory, Transaksi, & Maintenance) dalam format JSON untuk dibagikan atau dijadikan backup.</p>
          <button 
            onClick={() => db.exportDatabase()}
            className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
          >
            <span>Unduh File Backup</span>
          </button>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600">
            <Upload size={24} />
          </div>
          <h3 className="text-xl font-bold">Restore Database</h3>
          <p className="text-slate-500 text-sm">Upload file .json hasil export untuk memulihkan seluruh data inventory Anda di perangkat ini.</p>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
          >
            <span>Upload File Backup</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300 ${importStatus.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {importStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{importStatus.message}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {activeView !== 'DASHBOARD' && (
            <button onClick={() => setActiveView('DASHBOARD')} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-100">
              <ArrowLeft size={24} />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {activeView === 'DASHBOARD' ? 'Reports & Analytics' : 
               activeView === 'VALUATION' ? 'Inventory Valuation' :
               activeView === 'MAINTENANCE' ? 'Service Log Report' : 
               activeView === 'VENDOR' ? 'Vendor Performance' : 'Backup & Restore'}
            </h1>
            <p className="text-slate-500">Monitor kitchen efficiency and asset health</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={exportToExcel} className="flex items-center space-x-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <Download size={18} />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {activeView === 'DASHBOARD' && renderDashboard()}
      {activeView === 'VALUATION' && renderValuation()}
      {activeView === 'MAINTENANCE' && renderMaintenanceDetail()}
      {activeView === 'VENDOR' && renderVendorAudit()}
      {activeView === 'DATABASE' && renderDatabaseTools()}
    </div>
  );
};

export default Reports;
