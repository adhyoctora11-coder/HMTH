
import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  ArrowLeft, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { db } from '../db';
import { EquipmentStatus, User, UserRole } from '../types';

interface PreviewItem {
  name: string;
  category: string;
  brand: string;
  serialNumber: string;
  vendor: string;
  status: EquipmentStatus;
  purchaseDate: string;
  warrantyUntil: string;
  price: number;
  stock: number;
  isValid: boolean;
  error?: string;
}

interface ImportAssetsProps {
  user: User;
}

const ImportAssets: React.FC<ImportAssetsProps> = ({ user }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const isAdmin = user.role === UserRole.ADMIN;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-red-50 p-6 rounded-full text-red-600">
          <ShieldAlert size={64} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Akses Dibatasi</h1>
          <p className="text-slate-500 mt-2">Maaf, hanya administrator yang dapat mengakses fitur Import Asset.</p>
        </div>
        <Link 
          to="/inventory" 
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
        >
          Kembali ke Inventory
        </Link>
      </div>
    );
  }

  const downloadTemplate = () => {
    const headers = [
      ['Name', 'Category', 'Brand', 'SerialNumber', 'Vendor', 'Status', 'PurchaseDate', 'WarrantyUntil', 'Price', 'Stock'],
      ['Bowl Set A', 'Chinaware', 'Noritake', 'CH-12345', 'Kitchen Supply', 'Active', '2023-01-01', '2025-01-01', '50000', '100']
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory_Template");
    XLSX.writeFile(wb, "Kitchen_Pro_Template.xlsx");
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<any>(worksheet);

      const parsedItems: PreviewItem[] = json.map((row: any) => {
        const item = {
          name: row.Name || row.name || '',
          category: row.Category || row.category || '',
          brand: row.Brand || row.brand || '',
          serialNumber: row.SerialNumber || row.serialNumber || row.sn || '',
          vendor: row.Vendor || row.vendor || '',
          status: (row.Status || row.status || EquipmentStatus.ACTIVE) as EquipmentStatus,
          purchaseDate: row.PurchaseDate || row.purchaseDate || new Date().toISOString().split('T')[0],
          warrantyUntil: row.WarrantyUntil || row.warrantyUntil || '',
          price: parseInt(row.Price || row.price || 0),
          stock: parseInt(row.Stock || row.stock || 1),
          isValid: true,
          error: ''
        };

        if (!item.name) {
          item.isValid = false;
          item.error = 'Name is required';
        }

        return item;
      });

      setItems(parsedItems);
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dragActive ? null : setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeLine = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (items.some(item => !item.isValid)) {
      alert("Please fix invalid items before importing.");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate slight delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));
      db.addBulkEquipments(items.map(({ isValid, error, ...rest }) => rest));
      navigate('/inventory');
    } catch (err) {
      alert("Error importing assets");
      setIsProcessing(false);
    }
  };

  const validCount = items.filter(i => i.isValid).length;
  const invalidCount = items.length - validCount;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/inventory" className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Bulk Asset Import</h1>
            <p className="text-slate-500">Upload your inventory spreadsheet to add multiple items at once.</p>
          </div>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center space-x-2 text-orange-600 font-bold hover:underline"
        >
          <Download size={18} />
          <span>Download Excel Template</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[32px] p-20 flex flex-col items-center justify-center space-y-6 transition-all ${
            dragActive ? 'bg-orange-50 border-orange-400 scale-[0.99]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-6 bg-orange-100 text-orange-600 rounded-3xl animate-bounce">
            <Upload size={48} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">Drag and drop your file here</h3>
            <p className="text-slate-500 mt-2">Supports .xlsx, .xls, and .csv files</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl"
          >
            Browse Files
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Items Found</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center space-x-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Ready to Import</p>
                <p className="text-2xl font-bold text-green-600">{validCount}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center space-x-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Require Attention</p>
                <p className="text-2xl font-bold text-red-600">{invalidCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Data Preview</h3>
              <button 
                onClick={() => setItems([])}
                className="text-xs font-bold text-red-600 hover:underline flex items-center space-x-1"
              >
                <X size={14} />
                <span>Discard & Re-upload</span>
              </button>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Serial Number</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item, idx) => (
                    <tr key={idx} className={`${item.isValid ? 'bg-white' : 'bg-red-50/30'}`}>
                      <td className="px-6 py-4">
                        {item.isValid ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-bold uppercase">Ready</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle size={16} />
                            <span className="text-xs font-bold uppercase">Error</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {item.name || <span className="text-red-400 italic">Empty</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{item.category}</td>
                      <td className="px-6 py-4 text-slate-500">{item.stock}</td>
                      <td className="px-6 py-4 text-slate-500">Rp {item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{item.serialNumber}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeLine(idx)}
                          className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button 
              onClick={() => navigate('/inventory')}
              className="px-8 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={isProcessing || items.length === 0 || invalidCount > 0}
              className={`px-12 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl transition-all flex items-center space-x-3 ${
                (isProcessing || invalidCount > 0) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-orange-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Import {items.length} Assets</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportAssets;
