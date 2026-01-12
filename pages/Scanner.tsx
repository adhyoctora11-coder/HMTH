
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Scan, XCircle, CheckCircle2, Info } from 'lucide-react';
import { db } from '../db';
import { Equipment } from '../types';

const Scanner: React.FC = () => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
      }
    };
  }, []);

  const onScanSuccess = (decodedText: string) => {
    setScannedResult(decodedText);
    const eq = db.getEquipmentById(decodedText);
    if (eq) {
      setEquipment(eq);
      setError(null);
      if (scannerRef.current) scannerRef.current.pause();
    } else {
      setEquipment(null);
      setError("Equipment ID not found in database.");
    }
  };

  const onScanFailure = (error: any) => {
    // Silence errors to keep the console clean as it scans continuously
  };

  const resetScanner = () => {
    setScannedResult(null);
    setEquipment(null);
    setError(null);
    if (scannerRef.current) scannerRef.current.resume();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Smart Scan</h1>
        <p className="text-slate-500">Scan equipment QR code to view details or log maintenance</p>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div id="reader" className="w-full"></div>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-4">
          <XCircle size={20} />
          <p className="font-medium">{error}</p>
          <button onClick={resetScanner} className="ml-auto underline text-sm">Reset</button>
        </div>
      )}

      {equipment && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-orange-600 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2 size={24} />
              <span className="font-bold">Match Found</span>
            </div>
            <button onClick={resetScanner} className="text-slate-400 hover:text-slate-600">
              <XCircle size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Name</label>
              <h3 className="text-xl font-bold text-slate-900">{equipment.name}</h3>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</label>
              <p className="font-semibold text-slate-700">{equipment.category}</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</label>
              <p className="font-semibold text-orange-600">{equipment.status}</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Serial Number</label>
              <p className="font-medium text-slate-600">{equipment.serialNumber}</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Warranty</label>
              <p className="font-medium text-slate-600">{equipment.warrantyUntil}</p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
              Log Maintenance
            </button>
            <button className="flex-1 py-3 border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">
              Full History
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start space-x-3 p-4 bg-slate-100/50 rounded-2xl text-slate-500 text-sm">
        <Info className="mt-0.5 shrink-0" size={16} />
        <p>Ensure the QR code is centered and well-lit. The scanner will automatically detect valid Kitchen Pro equipment labels.</p>
      </div>
    </div>
  );
};

export default Scanner;
